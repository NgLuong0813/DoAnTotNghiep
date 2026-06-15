/**
 * API — Sách theo ID
 * GET    /api/sach/[id] → Xem chi tiết
 * PUT    /api/sach/[id] → Cập nhật / Nhập thêm sách
 * DELETE /api/sach/[id] → Xóa
 * Đường dẫn: src/app/api/sach/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import Sach from '@/models/Sach'

type ThamSo = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    const sach = await Sach.findByIdAndUpdate(
      params.id,
      { $inc: { luotXem: 1 } },
      { new: true }
    ).lean()
    if (!sach) return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy sách' }, { status: 404 })
    return NextResponse.json({ thanhCong: true, duLieu: sach })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    const duLieu = await req.json()

    // ✅ Nhập thêm sách — chỉ cần truyền { soNhapThem: number }
    if (duLieu.soNhapThem !== undefined) {
      const soThem = parseInt(duLieu.soNhapThem)
      if (isNaN(soThem) || soThem <= 0) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Số lượng nhập thêm phải lớn hơn 0' }, { status: 400 })
      }

      const sach = await Sach.findById(params.id)
      if (!sach) return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy sách' }, { status: 404 })

      const tongMoi   = sach.tongSoBan   + soThem
      const conLaiMoi = sach.soBanConLai + soThem

      const capNhat = await Sach.findByIdAndUpdate(
        params.id,
        {
          $set: {
            tongSoBan:   tongMoi,
            soBanConLai: conLaiMoi,
            // Tự chuyển về choMuon nếu đang hetSach
            ...(sach.trangThai === 'hetSach' && { trangThai: 'choMuon' }),
          }
        },
        { new: true }
      ).lean()

      return NextResponse.json({
        thanhCong: true,
        thongBao:  `Đã nhập thêm ${soThem} quyển. Tổng: ${tongMoi}, Còn lại: ${conLaiMoi}`,
        duLieu:    capNhat,
      })
    }

    // Cập nhật thông tin sách thông thường
    // ✅ Khi sửa tongSoBan: tính lại soBanConLai theo chênh lệch
    if (duLieu.tongSoBan !== undefined) {
      const sachHienTai = await Sach.findById(params.id)
      if (sachHienTai) {
        const chenhLech = duLieu.tongSoBan - sachHienTai.tongSoBan
        if (chenhLech !== 0) {
          duLieu.soBanConLai = Math.max(0, sachHienTai.soBanConLai + chenhLech)
        }
        // Tự cập nhật trạng thái
        if (duLieu.soBanConLai === 0) {
          duLieu.trangThai = 'hetSach'
        } else if (sachHienTai.trangThai === 'hetSach' && duLieu.soBanConLai > 0) {
          duLieu.trangThai = 'choMuon'
        }
      }
    }

    const sachCapNhat = await Sach.findByIdAndUpdate(
      params.id,
      { $set: duLieu },
      { new: true, runValidators: true }
    ).lean()

    if (!sachCapNhat) return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy sách' }, { status: 404 })
    return NextResponse.json({ thanhCong: true, duLieu: sachCapNhat })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    await Sach.findByIdAndDelete(params.id)
    return NextResponse.json({ thanhCong: true, thongBao: 'Đã xóa sách thành công' })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
