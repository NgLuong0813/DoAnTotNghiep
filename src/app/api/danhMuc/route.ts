/**
 * API â€” Danh Má»¥c
 * GET  /api/danhMuc â†’ Danh sÃ¡ch + sá»‘ sÃ¡ch má»—i danh má»¥c, sáº¯p theo alphabet
 * POST /api/danhMuc â†’ ThÃªm má»›i
 * ÄÆ°á»ng dáº«n: src/app/api/danhMuc/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import DanhMuc from '@/models/DanhMuc'
import Sach from '@/models/Sach'

export async function GET() {
  try {
    await ketNoiMongoDB()

    // Láº¥y danh má»¥c sáº¯p xáº¿p alphabet
    const ds = await DanhMuc.find().sort({ ten: 1 }).lean()

    // Äáº¿m sá»‘ sÃ¡ch theo tá»«ng danh má»¥c
    const thongKe = await Sach.aggregate([
      { $group: { _id: '$danhMuc', soSach: { $sum: 1 } } }
    ])
    const soSachMap: Record<string, number> = {}
    for (const t of thongKe) soSachMap[t._id] = t.soSach

    // Gáº¯n sá»‘ sÃ¡ch vÃ o tá»«ng danh má»¥c
    const ketQua = ds.map((dm: any) => ({
      ...dm,
      soSach: soSachMap[dm.ten] || 0,
    }))

    return NextResponse.json({ thanhCong: true, duLieu: ketQua })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    if (!phien || !['admin', 'thuThu'].includes(nd?.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }
    await ketNoiMongoDB()
    const { ten, moTa } = await req.json()
    if (!ten?.trim()) {
      return NextResponse.json({ thanhCong: false, thongBao: 'TÃªn danh má»¥c khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng' }, { status: 400 })
    }
    const dm = await DanhMuc.create({ ten: ten.trim(), moTa: moTa?.trim() || '', thuTu: 0 })
    return NextResponse.json({ thanhCong: true, duLieu: dm }, { status: 201 })
  } catch (loi: any) {
    if (loi.code === 11000) {
      return NextResponse.json({ thanhCong: false, thongBao: 'TÃªn danh má»¥c Ä‘Ã£ tá»“n táº¡i' }, { status: 400 })
    }
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

