/**
 * API â€” BÃ¡o CÃ¡o Lá»—i SÃ¡ch
 * POST /api/baoCaoLoi â†’ Táº¡o bÃ¡o cÃ¡o, trá»« sá»‘ sÃ¡ch
 * GET  /api/baoCaoLoi â†’ Láº¥y danh sÃ¡ch bÃ¡o cÃ¡o vá»›i filter
 * GET  /api/baoCaoLoi?soSachDuy=true â†’ Chá»‰ tráº£ soSachDuy (sá»‘ sÃ¡ch unique cÃ³ lá»—i)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import BaoCaoLoi from '@/models/BaoCaoLoi'
import Sach from '@/models/Sach'

export async function GET(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    const nd = phien.user as any
    if (!['admin', 'thuThu'].includes(nd.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }

    await ketNoiMongoDB()
    const { searchParams } = new URL(req.url)

    const sachId    = searchParams.get('sachId')    || ''
    const loaiLoi   = searchParams.get('loaiLoi')   || ''
    const tuKhoa    = searchParams.get('tuKhoa')    || ''
    const tuNgay    = searchParams.get('tuNgay')    || ''
    const denNgay   = searchParams.get('denNgay')   || ''
    const trang     = parseInt(searchParams.get('trang')    || '1')
    const gioiHan   = parseInt(searchParams.get('gioiHan')  || '15')
    // âœ… Cháº¿ Ä‘á»™ Ä‘áº·c biá»‡t: chá»‰ tráº£ vá» sá»‘ sÃ¡ch duy nháº¥t cÃ³ lá»—i
    const soSachDuy = searchParams.get('soSachDuy') === 'true'

    const dk: any = {}
    if (sachId)  dk.sach    = sachId
    if (loaiLoi) dk.loaiLoi = loaiLoi
    if (tuNgay || denNgay) {
      dk.ngayBaoCao = {}
      if (tuNgay)  dk.ngayBaoCao.$gte = new Date(tuNgay)
      if (denNgay) dk.ngayBaoCao.$lte = new Date(denNgay + 'T23:59:59')
    }

    if (tuKhoa) {
      const sachTimDuoc = await Sach.find({
        $or: [
          { tenSach: { $regex: tuKhoa, $options: 'i' } },
          { tacGia:  { $regex: tuKhoa, $options: 'i' } },
        ]
      }).select('_id').lean()
      dk.sach = { $in: sachTimDuoc.map((s: any) => s._id) }
    }

    // âœ… Cháº¿ Ä‘á»™ Ä‘áº¿m sá»‘ sÃ¡ch duy nháº¥t â€” dÃ¹ng aggregate distinct
    if (soSachDuy) {
      const ketQua = await BaoCaoLoi.aggregate([
        { $match: dk },
        { $group: { _id: '$sach' } },
        { $count: 'soSachDuy' },
      ])
      const soSach = ketQua[0]?.soSachDuy || 0

      // CÅ©ng láº¥y luÃ´n danh sÃ¡ch bÃ¡o cÃ¡o Ä‘á»ƒ Ä‘Ã­nh kÃ¨m badge (gioiHan=500)
      const danhSach = await BaoCaoLoi.find(dk)
        .populate('sach', 'tenSach tacGia maSach anhBia danhMuc')
        .populate('nguoiViPham', 'hoTen soThe maSoSV email')
        .populate('nguoiBaoCao', 'hoTen vaiTro')
        .sort({ ngayBaoCao: -1 })
        .limit(500)
        .lean()

      return NextResponse.json({
        thanhCong: true,
        duLieu: { danhSach, tongSo: danhSach.length, soSachDuy: soSach, thongKe: [] },
      })
    }

    const [danhSach, tongSo] = await Promise.all([
      BaoCaoLoi.find(dk)
        .populate('sach',        'tenSach tacGia maSach anhBia danhMuc')
        .populate('nguoiViPham', 'hoTen soThe maSoSV email')
        .populate('nguoiBaoCao', 'hoTen vaiTro')
        .sort({ ngayBaoCao: -1 })
        .skip((trang - 1) * gioiHan)
        .limit(gioiHan)
        .lean(),
      BaoCaoLoi.countDocuments(dk),
    ])

    const thongKe = await BaoCaoLoi.aggregate([
      { $group: { _id: '$loaiLoi', tongSoLuong: { $sum: '$soLuong' }, soLanBaoCao: { $sum: 1 } } }
    ])

    return NextResponse.json({
      thanhCong: true,
      duLieu: { danhSach, tongSo, tongTrang: Math.ceil(tongSo / gioiHan), thongKe },
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    const nd = phien.user as any
    if (!['admin', 'thuThu'].includes(nd.vaiTro)) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n' }, { status: 403 })
    }

    await ketNoiMongoDB()
    const { sachId, soLuong, loaiLoi, nguoiViPhamId, lyDo } = await req.json()

    if (!sachId || !soLuong || !loaiLoi || !lyDo?.trim()) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Thiáº¿u thÃ´ng tin báº¯t buá»™c' }, { status: 400 })
    }

    const sach = await Sach.findById(sachId)
    if (!sach) return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y sÃ¡ch' }, { status: 404 })

    if (soLuong > sach.tongSoBan) {
      return NextResponse.json({
        thanhCong: false,
        thongBao: `Sá»‘ lÆ°á»£ng bÃ¡o lá»—i (${soLuong}) vÆ°á»£t quÃ¡ tá»•ng sá»‘ báº£n (${sach.tongSoBan})`,
      }, { status: 400 })
    }

    await BaoCaoLoi.create({
      sach:        sachId,
      soLuong,
      loaiLoi,
      nguoiViPham: loaiLoi === 'doSinhVien' && nguoiViPhamId ? nguoiViPhamId : null,
      lyDo:        lyDo.trim(),
      nguoiBaoCao: nd.id,
      ngayBaoCao:  new Date(),
    })

    const tongMoi   = Math.max(0, sach.tongSoBan   - soLuong)
    const conLaiMoi = Math.max(0, sach.soBanConLai - soLuong)

    await Sach.findByIdAndUpdate(sachId, {
      $set: {
        tongSoBan:   tongMoi,
        soBanConLai: conLaiMoi,
        ...(conLaiMoi === 0 && { trangThai: 'hetSach' }),
      }
    })

    return NextResponse.json({ thanhCong: true, thongBao: 'ÄÃ£ ghi nháº­n bÃ¡o cÃ¡o lá»—i sÃ¡ch.' })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

