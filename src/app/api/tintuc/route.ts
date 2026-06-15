/**
 * API — Tin Tức
 * GET  /api/tintuc         → Danh sách bài viết đã xuất bản (công khai)
 * GET  /api/tintuc?tatCa=true → Tất cả bài (admin)
 * POST /api/tintuc         → Đăng bài mới (admin)
 * Đường dẫn: src/app/api/tintuc/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import TinTuc from '@/models/TinTuc'

export async function GET(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const { searchParams } = new URL(req.url)

    const loai    = searchParams.get('loai')    || ''
    const trang   = parseInt(searchParams.get('trang')   || '1')
    const gioiHan = parseInt(searchParams.get('gioiHan') || '9')
    const tatCa   = searchParams.get('tatCa') === 'true'  // ✅ Admin xem tất cả

    // Nếu tatCa=true (admin) → không lọc trangThai
    // Ngược lại chỉ lấy bài đã xuất bản
    const dieuKien: any = tatCa ? {} : { trangThai: 'daXuatBan' }
    if (loai) dieuKien.loai = loai

    const [danhSach, tongSo] = await Promise.all([
      TinTuc.find(dieuKien)
        .select('-noiDungHtml')
        .sort({ ngayDang: -1 })
        .skip((trang - 1) * gioiHan)
        .limit(gioiHan)
        .populate('nguoiDang', 'hoTen')
        .lean(),
      TinTuc.countDocuments(dieuKien),
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
    await ketNoiMongoDB()
    const duLieu = await req.json()

    if (!duLieu.tieuDe || !duLieu.noiDungHtml) {
      return NextResponse.json(
        { thanhCong: false, thongBao: 'Thiếu tiêu đề hoặc nội dung' },
        { status: 400 }
      )
    }

    // Nếu không có nguoiDang thì bỏ qua (không bắt buộc)
    if (!duLieu.nguoiDang) delete duLieu.nguoiDang

    // Ghi ngày đăng nếu xuất bản ngay
    if (duLieu.trangThai === 'daXuatBan') {
      duLieu.ngayDang = new Date()
    }

    const baiMoi = await TinTuc.create(duLieu)
    return NextResponse.json({ thanhCong: true, duLieu: baiMoi }, { status: 201 })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
