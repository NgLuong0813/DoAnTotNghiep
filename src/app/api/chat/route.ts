/**
 * API â€” Chat
 * GET  /api/chat â†’ Admin/thuThu láº¥y danh sÃ¡ch
 * POST /api/chat â†’ Gá»­i tin nháº¯n
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import CuocTroChuyen from '@/models/TinNhan'

export async function GET() {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    if (!phien || !['admin', 'thuThu'].includes(nd?.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }
    await ketNoiMongoDB()
    const ds = await CuocTroChuyen.find()
      .select('maPhien tenHienThi loai tinCuoi thoiGianCuoi soTinChuaDoc ngayHetHan nguoiDungId')
      .sort({ thoiGianCuoi: -1 })
      .limit(100)
      .lean()
    return NextResponse.json({ thanhCong: true, duLieu: ds })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    const { maPhien, noiDung, tenHienThi } = await req.json()

    if (!maPhien || !noiDung?.trim()) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Thiáº¿u thÃ´ng tin' }, { status: 400 })
    }

    const now     = new Date()
    const laAdmin = phien && ['admin', 'thuThu'].includes(nd?.vaiTro)
    const nguoiGui = laAdmin ? 'admin' : phien ? 'nguoiDung' : 'khach'

    let cuocTC = await CuocTroChuyen.findOne({ maPhien })

    if (!cuocTC) {
      // âœ… ngayHetHan logic:
      // - NgÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p â†’ null (vÄ©nh viá»…n, khÃ´ng tá»± xÃ³a)
      // - áº¨n danh (chÆ°a Ä‘Äƒng nháº­p) â†’ 3 ngÃ y
      let ngayHetHan: Date | null = null
      if (!phien) {
        ngayHetHan = new Date(now)
        ngayHetHan.setDate(ngayHetHan.getDate() + 3)
      }

      let ten = 'KhÃ¡ch'
      if (phien && nd?.name && !laAdmin) ten = nd.name
      else if (tenHienThi)              ten = tenHienThi
      else                              ten = `KhÃ¡ch #${maPhien.slice(-4).toUpperCase()}`

      cuocTC = await CuocTroChuyen.create({
        maPhien,
        nguoiDungId:  phien && !laAdmin ? (nd?.id || null) : null,
        tenHienThi:   ten,
        loai:         !phien ? 'anDanh' : 'dangNhap',
        danhSachTin:  [],
        tinCuoi:      '',
        thoiGianCuoi: now,
        soTinChuaDoc: 0,
        ngayHetHan,
      })
    }

    const tinMoi = {
      nguoiGui,
      noiDung:     noiDung.trim().substring(0, 1000),
      thoiGian:    now,
      daDoc:       false,  // false = người dùng chưa đọc, true = đã đọc
      // âœ… LÆ°u tÃªn admin/thá»§ thÆ° gá»­i tin Ä‘á»ƒ hiá»ƒn thá»‹ phÃ­a ngÆ°á»i dÃ¹ng
      tenNguoiGui: laAdmin ? (nd?.name || 'ThÆ° viá»‡n UTT') : '',
    }

    const soMoi = laAdmin ? cuocTC.soTinChuaDoc : cuocTC.soTinChuaDoc + 1

    await CuocTroChuyen.findByIdAndUpdate(cuocTC._id, {
      $push: { danhSachTin: tinMoi },
      $set:  {
        tinCuoi:      tinMoi.noiDung.substring(0, 100),
        thoiGianCuoi: now,
        soTinChuaDoc: soMoi,
      },
    })

    return NextResponse.json({
      thanhCong: true,
      duLieu: { ...tinMoi, thoiGian: now.toISOString() },
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}


