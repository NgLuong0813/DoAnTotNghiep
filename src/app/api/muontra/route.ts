/**
 * API â€” Phiáº¿u MÆ°á»£n Tráº£
 * GET  /api/muontra  â†’ Danh sÃ¡ch vá»›i filter Ä‘áº§y Ä‘á»§
 * POST /api/muontra  â†’ Sinh viÃªn gá»­i yÃªu cáº§u mÆ°á»£n sÃ¡ch
 * ÄÆ°á»ng dáº«n: src/app/api/muontra/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import PhieuMuon from '@/models/PhieuMuon'
import Sach from '@/models/Sach'
import NguoiDung from '@/models/NguoiDung'
import { addDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const phien = await getServerSession(cauHinhXacThuc)
  if (!phien) return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })

  await ketNoiMongoDB()
  const { searchParams } = new URL(req.url)
  const nguoiDung = phien.user as any

  const trangThai   = searchParams.get('trangThai')   || ''
  const tuKhoa      = searchParams.get('tuKhoa')      || ''
  const tenSach     = searchParams.get('tenSach')     || ''
  const tuNgayMuon  = searchParams.get('tuNgayMuon')  || ''
  const denNgayMuon = searchParams.get('denNgayMuon') || ''
  const tuNgayTra   = searchParams.get('tuNgayTra')   || ''
  const denNgayTra  = searchParams.get('denNgayTra')  || ''
  const tuHanTra    = searchParams.get('tuHanTra')    || ''
  const denHanTra   = searchParams.get('denHanTra')   || ''
  const trang       = parseInt(searchParams.get('trang')   || '1')
  const gioiHan     = parseInt(searchParams.get('gioiHan') || '10')

  const dieuKien: any = {}
  if (nguoiDung.vaiTro === 'sinhVien') dieuKien.nguoiMuon = nguoiDung.id
  if (trangThai) dieuKien.trangThai = trangThai

  if (tuNgayMuon || denNgayMuon) {
    dieuKien.ngayMuon = {}
    if (tuNgayMuon)  dieuKien.ngayMuon.$gte = new Date(tuNgayMuon)
    if (denNgayMuon) dieuKien.ngayMuon.$lte = new Date(denNgayMuon + 'T23:59:59')
  }
  if (tuNgayTra || denNgayTra) {
    dieuKien.ngayTraThuc = {}
    if (tuNgayTra)  dieuKien.ngayTraThuc.$gte = new Date(tuNgayTra)
    if (denNgayTra) dieuKien.ngayTraThuc.$lte = new Date(denNgayTra + 'T23:59:59')
  }
  if (tuHanTra || denHanTra) {
    dieuKien.ngayHanTra = {}
    if (tuHanTra)  dieuKien.ngayHanTra.$gte = new Date(tuHanTra)
    if (denHanTra) dieuKien.ngayHanTra.$lte = new Date(denHanTra + 'T23:59:59')
  }

  // âœ… LuÃ´n dÃ¹ng aggregate Ä‘á»ƒ Ä‘áº£m báº£o filter text hoáº¡t Ä‘á»™ng
  // DÃ¹ng Ä‘Ãºng tÃªn collection: 'nguoiDung' vÃ  'sach' (khÃ´ng pháº£i 'nguoiDungs', 'sachs')
  const pipeline: any[] = [
    { $match: dieuKien },
    {
      $lookup: {
        from: 'nguoiDung',  // âœ… ÄÃºng tÃªn collection
        localField: 'nguoiMuon',
        foreignField: '_id',
        as: 'nguoiMuon',
      }
    },
    { $unwind: { path: '$nguoiMuon', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'sach',  // âœ… ÄÃºng tÃªn collection
        localField: 'sach',
        foreignField: '_id',
        as: 'sach',
      }
    },
    { $unwind: { path: '$sach', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'nguoiDung',
        localField: 'thuThuXuLy',
        foreignField: '_id',
        as: 'thuThuXuLy',
      }
    },
    { $unwind: { path: '$thuThuXuLy', preserveNullAndEmptyArrays: true } },
  ]

  // âœ… Filter theo tÃªn ngÆ°á»i mÆ°á»£n / sá»‘ tháº» / mÃ£ SV
  if (tuKhoa) {
    pipeline.push({
      $match: {
        $or: [
          { 'nguoiMuon.hoTen':  { $regex: tuKhoa, $options: 'i' } },
          { 'nguoiMuon.soThe':  { $regex: tuKhoa, $options: 'i' } },
          { 'nguoiMuon.maSoSV': { $regex: tuKhoa, $options: 'i' } },
        ]
      }
    })
  }

  // âœ… Filter theo tÃªn sÃ¡ch
  if (tenSach) {
    pipeline.push({
      $match: {
        'sach.tenSach': { $regex: tenSach, $options: 'i' }
      }
    })
  }

  // Äáº¿m tá»•ng
  const tongSoResult = await PhieuMuon.aggregate([...pipeline, { $count: 'tongSo' }])
  const tongSo = tongSoResult[0]?.tongSo || 0

  // PhÃ¢n trang
  pipeline.push(
    { $sort: { ngayTao: -1 } },
    { $skip: (trang - 1) * gioiHan },
    { $limit: gioiHan },
    // Chá»‰ giá»¯ cÃ¡c field cáº§n thiáº¿t
    {
      $project: {
        trangThai: 1, ngayTao: 1, ngayMuon: 1, ngayHanTra: 1,
        ngayTraThuc: 1, tienPhat: 1, ghiChu: 1, soLanGiaHan: 1,
        'nguoiMuon._id': 1, 'nguoiMuon.hoTen': 1, 'nguoiMuon.soThe': 1,
        'nguoiMuon.maSoSV': 1, 'nguoiMuon.email': 1,
        'sach._id': 1, 'sach.tenSach': 1, 'sach.tacGia': 1,
        'sach.danhMuc': 1, 'sach.anhBia': 1,
        'thuThuXuLy._id': 1, 'thuThuXuLy.hoTen': 1,
      }
    }
  )

  const danhSach = await PhieuMuon.aggregate(pipeline)

  return NextResponse.json({
    thanhCong: true,
    duLieu: { danhSach, tongSo, trang, tongTrang: Math.ceil(tongSo / gioiHan) },
  })
}

export async function POST(req: NextRequest) {
  const phien = await getServerSession(cauHinhXacThuc)
  if (!phien) return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })

  const nguoiDung = phien.user as any
  if (nguoiDung.trangThaiThe !== 'hoatDong') {
    return NextResponse.json({ thanhCong: false, thongBao: 'Tháº» thÆ° viá»‡n chÆ°a Ä‘Æ°á»£c kÃ­ch hoáº¡t' }, { status: 403 })
  }

  await ketNoiMongoDB()
  const { sachId } = await req.json()

  const sach = await Sach.findById(sachId)
  if (!sach || sach.soBanConLai < 1) {
    return NextResponse.json({ thanhCong: false, thongBao: 'SÃ¡ch hiá»‡n khÃ´ng cÃ²n báº£n nÃ o Ä‘á»ƒ mÆ°á»£n' }, { status: 400 })
  }

  const daMuon = await PhieuMuon.findOne({
    nguoiMuon: nguoiDung.id,
    sach:      sachId,
    trangThai: { $in: ['choDuyet', 'dangMuon'] },
  })
  if (daMuon) {
    return NextResponse.json({ thanhCong: false, thongBao: 'Báº¡n Ä‘Ã£ mÆ°á»£n hoáº·c Ä‘ang chá» duyá»‡t cuá»‘n sÃ¡ch nÃ y' }, { status: 400 })
  }

  const ndInfo = await NguoiDung.findById(nguoiDung.id)
  if (ndInfo && ndInfo.dangMuon >= 5) {
    return NextResponse.json({ thanhCong: false, thongBao: 'Báº¡n Ä‘ang mÆ°á»£n tá»‘i Ä‘a 5 cuá»‘n sÃ¡ch' }, { status: 400 })
  }

  const phieuMoi = await PhieuMuon.create({
    nguoiMuon:  nguoiDung.id,
    sach:       sachId,
    ngayHanTra: addDays(new Date(), 14),
    trangThai:  'choDuyet',
  })

  return NextResponse.json({ thanhCong: true, duLieu: phieuMoi }, { status: 201 })
}

