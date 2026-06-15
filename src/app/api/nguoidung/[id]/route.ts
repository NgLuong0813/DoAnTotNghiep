/**
 * API â€” NgÆ°á»i dÃ¹ng theo ID
 * GET /api/nguoidung/[id] â†’ Xem thÃ´ng tin
 * PUT /api/nguoidung/[id] â†’ Cáº­p nháº­t (cho phÃ©p Ä‘á»•i email)
 * ÄÆ°á»ng dáº«n: src/app/api/nguoidung/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'

type ThamSo = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: ThamSo) {
  try {
    await ketNoiMongoDB()
    const nguoiDung = await NguoiDung.findById(params.id).select('-matKhau').lean()
    if (!nguoiDung) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng' }, { status: 404 })
    }
    return NextResponse.json({ thanhCong: true, duLieu: nguoiDung })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: ThamSo) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nguoiThucHien = phien?.user as any

    await ketNoiMongoDB()
    const duLieu = await req.json()

    // KhÃ´ng cho Ä‘á»•i máº­t kháº©u qua API nÃ y
    delete duLieu.matKhau

    // PhÃ¢n quyá»n: thuThu khÃ´ng Ä‘Æ°á»£c sá»­a admin/thuThu khÃ¡c
    if (nguoiThucHien?.vaiTro === 'thuThu') {
      const laSuaChinhMinh = String(nguoiThucHien.id) === String(params.id)
      if (!laSuaChinhMinh) {
        const nguoiCanSua = await NguoiDung.findById(params.id).select('vaiTro').lean() as any
        if (nguoiCanSua && ['admin', 'thuThu'].includes(nguoiCanSua.vaiTro)) {
          return NextResponse.json({
            thanhCong: false,
            thongBao: 'Thá»§ thÆ° khÃ´ng cÃ³ quyá»n chá»‰nh sá»­a tÃ i khoáº£n admin hoáº·c thá»§ thÆ° khÃ¡c',
          }, { status: 403 })
        }
      }
    }

    // Náº¿u cÃ³ Ä‘á»•i email â†’ kiá»ƒm tra chÆ°a bá»‹ dÃ¹ng bá»Ÿi tÃ i khoáº£n khÃ¡c
    if (duLieu.email) {
      duLieu.email = duLieu.email.toLowerCase().trim()
      const daCoEmail = await NguoiDung.findOne({
        email: duLieu.email,
        _id: { $ne: params.id },
      }).lean()
      if (daCoEmail) {
        return NextResponse.json({
          thanhCong: false,
          thongBao: 'Email nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi tÃ i khoáº£n khÃ¡c',
        }, { status: 400 })
      }
    }

    const capNhat = await NguoiDung.findByIdAndUpdate(
      params.id,
      { $set: duLieu },
      { new: true }
    ).select('-matKhau').lean()

    if (!capNhat) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng' }, { status: 404 })
    }

    return NextResponse.json({ thanhCong: true, duLieu: capNhat })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

