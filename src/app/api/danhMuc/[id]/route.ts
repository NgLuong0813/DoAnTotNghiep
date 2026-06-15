/**
 * API â€” Danh Má»¥c theo ID
 * PUT    /api/danhMuc/[id] â†’ Sá»­a
 * DELETE /api/danhMuc/[id] â†’ XÃ³a
 * ÄÆ°á»ng dáº«n: src/app/api/danhMuc/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import DanhMuc from '@/models/DanhMuc'
import Sach from '@/models/Sach'

type P = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: P) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    if (!phien || !['admin', 'thuThu'].includes(nd?.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }
    await ketNoiMongoDB()
    const { ten, moTa, thuTu, hoatDong } = await req.json()

    const dm = await DanhMuc.findByIdAndUpdate(
      params.id,
      { $set: { ...(ten && { ten: ten.trim() }), ...(moTa !== undefined && { moTa }), ...(thuTu !== undefined && { thuTu }), ...(hoatDong !== undefined && { hoatDong }) } },
      { new: true }
    )
    if (!dm) return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y' }, { status: 404 })
    return NextResponse.json({ thanhCong: true, duLieu: dm })
  } catch (loi: any) {
    if (loi.code === 11000) return NextResponse.json({ thanhCong: false, thongBao: 'TÃªn danh má»¥c Ä‘Ã£ tá»“n táº¡i' }, { status: 400 })
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    if (!phien || nd?.vaiTro !== 'admin') {
      return NextResponse.json({ thanhCong: false, thongBao: 'Chá»‰ admin má»›i Ä‘Æ°á»£c xÃ³a danh má»¥c' }, { status: 403 })
    }
    await ketNoiMongoDB()
    const dm = await DanhMuc.findById(params.id)
    if (!dm) return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y' }, { status: 404 })

    // Kiá»ƒm tra cÃ²n sÃ¡ch trong danh má»¥c khÃ´ng
    const soSach = await Sach.countDocuments({ danhMuc: dm.ten })
    if (soSach > 0) {
      return NextResponse.json({
        thanhCong: false,
        thongBao:  `KhÃ´ng thá»ƒ xÃ³a â€” danh má»¥c Ä‘ang cÃ³ ${soSach} cuá»‘n sÃ¡ch. HÃ£y chuyá»ƒn sÃ¡ch sang danh má»¥c khÃ¡c trÆ°á»›c.`,
      }, { status: 400 })
    }

    await DanhMuc.findByIdAndDelete(params.id)
    return NextResponse.json({ thanhCong: true, thongBao: 'ÄÃ£ xÃ³a danh má»¥c' })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

