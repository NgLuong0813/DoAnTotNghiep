/**
 * API â€” NgÆ°á»i dÃ¹ng
 * GET  /api/nguoidung â†’ Danh sÃ¡ch
 * POST /api/nguoidung â†’ Admin táº¡o tÃ i khoáº£n + gá»­i email
 * PhÃ¢n quyá»n: thuThu chá»‰ Ä‘Æ°á»£c táº¡o tÃ i khoáº£n sinhVien
 * ÄÆ°á»ng dáº«n: src/app/api/nguoidung/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'
import bcrypt from 'bcryptjs'
import { guiEmailChaoMung } from '@/lib/guiEmail'

function taoMatKhauTam(): string {
  const ky = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let mk = ''
  for (let i = 0; i < 8; i++) mk += ky[Math.floor(Math.random() * ky.length)]
  return mk
}

export async function GET(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) {
      return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    }

    await ketNoiMongoDB()
    const { searchParams } = new URL(req.url)
    const trang   = parseInt(searchParams.get('trang')   || '1')
    const gioiHan = parseInt(searchParams.get('gioiHan') || '10')
    const tuKhoa  = searchParams.get('tuKhoa') || ''

    const dieuKien: any = {}
    if (tuKhoa) {
      dieuKien.$or = [
        { hoTen:  { $regex: tuKhoa, $options: 'i' } },
        { email:  { $regex: tuKhoa, $options: 'i' } },
        { maSoSV: { $regex: tuKhoa, $options: 'i' } },
        { soThe:  { $regex: tuKhoa, $options: 'i' } },
      ]
    }

    const [danhSach, tongSo] = await Promise.all([
      NguoiDung.find(dieuKien)
        .select('-matKhau')
        .sort({ ngayTao: -1 })
        .skip((trang - 1) * gioiHan)
        .limit(gioiHan)
        .lean(),
      NguoiDung.countDocuments(dieuKien),
    ])

    return NextResponse.json({
      thanhCong: true,
      duLieu: { danhSach, tongSo, trang, tongTrang: Math.ceil(tongSo / gioiHan) },
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nguoiThucHien = phien?.user as any

    if (!phien || !['admin', 'thuThu'].includes(nguoiThucHien?.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }

    await ketNoiMongoDB()
    const duLieu = await req.json()

    // â”€â”€ PhÃ¢n quyá»n: thuThu chá»‰ Ä‘Æ°á»£c táº¡o tÃ i khoáº£n sinhVien â”€â”€
    if (nguoiThucHien.vaiTro === 'thuThu' && ['admin', 'thuThu'].includes(duLieu.vaiTro)) {
      return NextResponse.json({
        thanhCong: false,
        thongBao: 'Thá»§ thÆ° chá»‰ Ä‘Æ°á»£c táº¡o tÃ i khoáº£n sinh viÃªn',
      }, { status: 403 })
    }

    // Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i chÆ°a
    const daCoEmail = await NguoiDung.findOne({ email: duLieu.email.toLowerCase().trim() })
    if (daCoEmail) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Email nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng' }, { status: 400 })
    }

    // Táº¡o máº­t kháº©u táº¡m vÃ  hash
    const matKhauTam  = taoMatKhauTam()
    const hashMatKhau = await bcrypt.hash(matKhauTam, 10)

    // Táº¡o sá»‘ tháº» tá»± Ä‘á»™ng
    const soLuong = await NguoiDung.countDocuments()
    const soThe   = `UTT${String(soLuong + 1).padStart(6, '0')}`

    // NgÃ y háº¿t háº¡n tháº» (4 nÄƒm)
    const ngayHetHan = new Date()
    ngayHetHan.setFullYear(ngayHetHan.getFullYear() + 4)

    const taiKhoanMoi = await NguoiDung.create({
      ...duLieu,
      email:         duLieu.email.toLowerCase().trim(),
      matKhau:       hashMatKhau,
      soThe,
      trangThaiThe:  'hoatDong',
      hoatDong:      true,
      ngayHetHan,
      tongSoLanMuon: 0,
      dangMuon:      0,
    })

    // Gá»­i email chÃ o má»«ng
    let guiEmailOk = false
    try {
      await guiEmailChaoMung({
        email:      duLieu.email,
        hoTen:      duLieu.hoTen,
        matKhauTam,
        soThe,
        vaiTro:     duLieu.vaiTro || 'sinhVien',
      })
      guiEmailOk = true
    } catch (loiEmail) {
      console.error('Lá»—i gá»­i email:', loiEmail)
    }

    return NextResponse.json({
      thanhCong: true,
      thongBao:  guiEmailOk
        ? 'Táº¡o tÃ i khoáº£n thÃ nh cÃ´ng! Email Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n ngÆ°á»i dÃ¹ng.'
        : 'Táº¡o tÃ i khoáº£n thÃ nh cÃ´ng nhÆ°ng khÃ´ng gá»­i Ä‘Æ°á»£c email.',
      duLieu: { soThe, matKhauTam, guiEmailOk },
    }, { status: 201 })

  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

