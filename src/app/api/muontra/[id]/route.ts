/**
 * API â€” Phiáº¿u MÆ°á»£n theo ID
 * PUT /api/muontra/[id] â†’ Xá»­ lÃ½ cÃ¡c hÃ nh Ä‘á»™ng
 * GET /api/muontra/[id] â†’ Xem chi tiáº¿t
 * ÄÆ°á»ng dáº«n: src/app/api/muontra/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import PhieuMuon from '@/models/PhieuMuon'
import Sach from '@/models/Sach'
import NguoiDung from '@/models/NguoiDung'

type ThamSo = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: ThamSo) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) {
      return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    }

    await ketNoiMongoDB()
    const nguoiDung = phien.user as any
    const { hanhDong, ghiChu } = await req.json()

    const phieu = await PhieuMuon.findById(params.id)
    if (!phieu) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y phiáº¿u' }, { status: 404 })
    }

    // â”€â”€ Duyá»‡t mÆ°á»£n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (hanhDong === 'duyetMuon') {
      if (!['admin', 'thuThu'].includes(nguoiDung.vaiTro)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n duyá»‡t' }, { status: 403 })
      }
      if (phieu.trangThai !== 'choDuyet') {
        return NextResponse.json({ thanhCong: false, thongBao: 'Phiáº¿u khÃ´ng á»Ÿ tráº¡ng thÃ¡i chá» duyá»‡t' }, { status: 400 })
      }

      const sach = await Sach.findById(phieu.sach)
      if (!sach || sach.soBanConLai <= 0) {
        return NextResponse.json({ thanhCong: false, thongBao: 'SÃ¡ch khÃ´ng cÃ²n báº£n Ä‘á»ƒ mÆ°á»£n' }, { status: 400 })
      }

      const ngayMuon = new Date()
      const ngayHan  = new Date()
      ngayHan.setDate(ngayHan.getDate() + 14)

      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          trangThai:  'dangMuon',
          ngayMuon,
          ngayHanTra: ngayHan,
          thuThuXuLy: nguoiDung.id,
          ghiChu:     ghiChu || '',
        }
      })

      await Sach.findByIdAndUpdate(phieu.sach, { $inc: { soBanConLai: -1 } })
      await NguoiDung.findByIdAndUpdate(phieu.nguoiMuon, { $inc: { dangMuon: 1, tongSoLanMuon: 1 } })
    }

    // â”€â”€ Tá»« chá»‘i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    else if (hanhDong === 'tuChoi') {
      if (!['admin', 'thuThu'].includes(nguoiDung.vaiTro)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n tá»« chá»‘i' }, { status: 403 })
      }
      if (phieu.trangThai !== 'choDuyet') {
        return NextResponse.json({ thanhCong: false, thongBao: 'Phiáº¿u khÃ´ng á»Ÿ tráº¡ng thÃ¡i chá» duyá»‡t' }, { status: 400 })
      }

      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          trangThai:  'tuChoi',
          thuThuXuLy: nguoiDung.id,
          ghiChu:     ghiChu || 'YÃªu cáº§u bá»‹ tá»« chá»‘i',
        }
      })
    }

    // â”€â”€ XÃ¡c nháº­n tráº£ sÃ¡ch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    else if (hanhDong === 'xacNhanTra') {
      if (!['admin', 'thuThu'].includes(nguoiDung.vaiTro)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n xÃ¡c nháº­n tráº£' }, { status: 403 })
      }
      if (phieu.trangThai !== 'dangMuon') {
        return NextResponse.json({ thanhCong: false, thongBao: 'SÃ¡ch chÆ°a Ä‘Æ°á»£c mÆ°á»£n' }, { status: 400 })
      }

      const ngayTra   = new Date()
      const soNgayTre = Math.max(0, Math.ceil((ngayTra.getTime() - new Date(phieu.ngayHanTra).getTime()) / 86400000))
      const tienPhat  = soNgayTre * 2000

      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          trangThai:   'daTra',
          ngayTraThuc: ngayTra,
          tienPhat,
          thuThuXuLy:  nguoiDung.id,
          ghiChu:      ghiChu || '',
        }
      })

      await Sach.findByIdAndUpdate(phieu.sach, { $inc: { soBanConLai: 1 } })
      await NguoiDung.findByIdAndUpdate(phieu.nguoiMuon, { $inc: { dangMuon: -1 } })
    }

    // â”€â”€ Gia háº¡n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    else if (hanhDong === 'giaHan') {
      const laSinhVien = nguoiDung.vaiTro === 'sinhVien'
      if (laSinhVien && String(phieu.nguoiMuon) !== String(nguoiDung.id)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n gia háº¡n' }, { status: 403 })
      }
      if (phieu.trangThai !== 'dangMuon') {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chá»‰ gia háº¡n Ä‘Æ°á»£c sÃ¡ch Ä‘ang mÆ°á»£n' }, { status: 400 })
      }
      if (phieu.soLanGiaHan >= 2) {
        return NextResponse.json({ thanhCong: false, thongBao: 'ÄÃ£ gia háº¡n tá»‘i Ä‘a 2 láº§n' }, { status: 400 })
      }

      const ngayHanMoi = new Date(phieu.ngayHanTra)
      ngayHanMoi.setDate(ngayHanMoi.getDate() + 7)

      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          ngayHanTra:   ngayHanMoi,
          soLanGiaHan:  phieu.soLanGiaHan + 1,
          ngayGiaHan:   new Date(),
        }
      })
    }

    // â”€â”€ HoÃ n tÃ¡c: dangMuon â†’ choDuyet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    else if (hanhDong === 'hoanTacDuyet') {
      if (!['admin', 'thuThu'].includes(nguoiDung.vaiTro)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n hoÃ n tÃ¡c' }, { status: 403 })
      }
      if (phieu.trangThai !== 'dangMuon') {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chá»‰ hoÃ n tÃ¡c Ä‘Æ°á»£c phiáº¿u Ä‘ang mÆ°á»£n' }, { status: 400 })
      }

      // âœ… DÃ¹ng $unset Ä‘á»ƒ xÃ³a field, khÃ´ng set null/undefined
      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          trangThai:    'choDuyet',
          thuThuXuLy:   nguoiDung.id,
          ghiChu:       ghiChu || 'HoÃ n tÃ¡c duyá»‡t â€” chuyá»ƒn vá» chá» duyá»‡t',
          soLanGiaHan:  0,
        },
        $unset: {
          ngayMuon:   '',
          ngayHanTra: '',
          ngayGiaHan: '',
        }
      })

      await Sach.findByIdAndUpdate(phieu.sach, { $inc: { soBanConLai: 1 } })
      await NguoiDung.findByIdAndUpdate(phieu.nguoiMuon, {
        $inc: { dangMuon: -1, tongSoLanMuon: -1 }
      })
    }

    // â”€â”€ HoÃ n tÃ¡c: daTra â†’ dangMuon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    else if (hanhDong === 'hoanTacTra') {
      if (!['admin', 'thuThu'].includes(nguoiDung.vaiTro)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng cÃ³ quyá»n hoÃ n tÃ¡c' }, { status: 403 })
      }
      if (phieu.trangThai !== 'daTra') {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chá»‰ hoÃ n tÃ¡c Ä‘Æ°á»£c phiáº¿u Ä‘Ã£ tráº£' }, { status: 400 })
      }

      // âœ… Giá»¯ nguyÃªn ngayHanTra â€” chá»‰ xÃ³a ngayTraThuc, reset tienPhat
      await PhieuMuon.findByIdAndUpdate(params.id, {
        $set: {
          trangThai:  'dangMuon',
          tienPhat:   0,
          thuThuXuLy: nguoiDung.id,
          ghiChu:     ghiChu || 'HoÃ n tÃ¡c tráº£ â€” chuyá»ƒn vá» Ä‘ang mÆ°á»£n',
        },
        $unset: {
          ngayTraThuc: '',
        }
      })

      await Sach.findByIdAndUpdate(phieu.sach, { $inc: { soBanConLai: -1 } })
      await NguoiDung.findByIdAndUpdate(phieu.nguoiMuon, { $inc: { dangMuon: 1 } })
    }

    else {
      return NextResponse.json({ thanhCong: false, thongBao: `HÃ nh Ä‘á»™ng khÃ´ng há»£p lá»‡: ${hanhDong}` }, { status: 400 })
    }

    const phieuCapNhat = await PhieuMuon.findById(params.id)
      .populate('nguoiMuon', 'hoTen email soThe maSoSV')
      .populate('sach',      'tenSach tacGia danhMuc anhBia')
      .populate('thuThuXuLy', 'hoTen')
      .lean()

    return NextResponse.json({ thanhCong: true, duLieu: phieuCapNhat })

  } catch (loi: any) {
    console.error('Lá»—i xá»­ lÃ½ phiáº¿u mÆ°á»£n:', loi)
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: ThamSo) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) {
      return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    }

    await ketNoiMongoDB()
    const phieu = await PhieuMuon.findById(params.id)
      .populate('nguoiMuon', 'hoTen email soThe')
      .populate('sach',      'tenSach tacGia')
      .lean()

    if (!phieu) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y phiáº¿u' }, { status: 404 })
    }

    return NextResponse.json({ thanhCong: true, duLieu: phieu })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
