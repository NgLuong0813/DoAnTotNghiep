/**
 * API — Sách
 * GET  /api/sach  -> Lay danh sach sach (cong khai)
 * POST /api/sach  -> Them sach moi (chi admin/thu thu)
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import Sach from '@/models/Sach'

export async function GET(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const { searchParams } = new URL(req.url)

    const tuKhoa    = searchParams.get('tuKhoa')   || ''
    const danhMuc   = searchParams.get('danhMuc')  || ''
    const trangThai = searchParams.get('trangThai') || ''
    const trang     = parseInt(searchParams.get('trang')  || '1')
    const gioiHan   = parseInt(searchParams.get('gioiHan') || '12')
    // sapXep: 'tenSach' (mac dinh, A-Z) | 'moi' (ngayTao moi nhat)
    const sapXep    = searchParams.get('sapXep') || 'tenSach'

    const dieuKien: any = {}
    if (tuKhoa) {
      dieuKien.$or = [
        { tenSach: { $regex: tuKhoa, $options: 'i' } },
        { tacGia:  { $regex: tuKhoa, $options: 'i' } },
        { maSach:  { $regex: tuKhoa, $options: 'i' } },
      ]
    }
    if (danhMuc)   dieuKien.danhMuc   = danhMuc
    if (trangThai) dieuKien.trangThai = trangThai

    // Sap xep: alphabet theo tieng Viet dung collation 'vi'
    const sortOption = sapXep === 'moi' ? { ngayTao: -1 } : { tenSach: 1 }

    const [danhSachSach, tongSo] = await Promise.all([
      Sach.find(dieuKien)
        .sort(sortOption)
        .collation({ locale: 'vi', strength: 1 })
        .skip((trang - 1) * gioiHan)
        .limit(gioiHan)
        .lean(),
      Sach.countDocuments(dieuKien),
    ])

    return NextResponse.json({
      thanhCong: true,
      duLieu: {
        danhSachSach,
        tongSo,
        trang,
        tongTrang: Math.ceil(tongSo / gioiHan),
      },
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const duLieu = await req.json()

    if (!duLieu.tenSach || !duLieu.tacGia || !duLieu.danhMuc) {
      return NextResponse.json(
        { thanhCong: false, thongBao: 'Thieu thong tin bat buoc: ten sach, tac gia, danh muc' },
        { status: 400 }
      )
    }

    if (duLieu.tongSoBan && duLieu.soBanConLai === undefined) {
      duLieu.soBanConLai = duLieu.tongSoBan
    }

    const sachMoi = await Sach.create(duLieu)
    return NextResponse.json({ thanhCong: true, duLieu: sachMoi }, { status: 201 })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
