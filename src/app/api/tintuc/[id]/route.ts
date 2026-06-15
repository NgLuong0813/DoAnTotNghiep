/**
 * API — Tin Tức theo ID / Slug
 * GET /api/tintuc/[id] → Lấy chi tiết bài viết + tăng lượt xem
 * PUT /api/tintuc/[id] → Cập nhật bài viết
 * Đường dẫn: src/app/api/tintuc/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import TinTuc from '@/models/TinTuc'

type ThamSo = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    // Tìm theo _id hoặc duongDan (slug)
    const baiViet = await TinTuc.findOneAndUpdate(
      { $or: [{ _id: params.id.length === 24 ? params.id : null }, { duongDan: params.id }] },
      { $inc: { luotXem: 1 } },
      { new: true }
    ).populate('nguoiDang', 'hoTen').lean()

    if (!baiViet) return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy bài viết' }, { status: 404 })
    return NextResponse.json({ thanhCong: true, duLieu: baiViet })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    const duLieu = await req.json()
    if (duLieu.trangThai === 'daXuatBan' && !duLieu.ngayDang) duLieu.ngayDang = new Date()
    const capNhat = await TinTuc.findByIdAndUpdate(params.id, { $set: duLieu }, { new: true }).lean()
    if (!capNhat) return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy bài viết' }, { status: 404 })
    return NextResponse.json({ thanhCong: true, duLieu: capNhat })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    await TinTuc.findByIdAndDelete(params.id)
    return NextResponse.json({ thanhCong: true, thongBao: 'Đã xóa bài viết thành công' })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

