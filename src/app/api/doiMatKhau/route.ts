/**
 * API â€” Äá»•i máº­t kháº©u
 * POST /api/doiMatKhau
 * ÄÆ°á»ng dáº«n: src/app/api/doiMatKhau/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) {
      return NextResponse.json({ thanhCong: false, thongBao: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 })
    }

    const { matKhauCu, matKhauMoi, xacNhanMatKhau } = await req.json()
    const nguoiDung = phien.user as any

    // Kiá»ƒm tra Ä‘áº§u vÃ o
    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin' }, { status: 400 })
    }
    if (matKhauMoi.length < 6) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±' }, { status: 400 })
    }
    if (matKhauMoi !== xacNhanMatKhau) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p' }, { status: 400 })
    }

    await ketNoiMongoDB()

    // Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng kÃ¨m máº­t kháº©u
    const nd = await NguoiDung.findById(nguoiDung.id).select('+matKhau')
    if (!nd) {
      return NextResponse.json({ thanhCong: false, thongBao: 'KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n' }, { status: 404 })
    }

    // Kiá»ƒm tra máº­t kháº©u cÅ©
    const hopLe = await bcrypt.compare(matKhauCu, nd.matKhau)
    if (!hopLe) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng' }, { status: 400 })
    }

    // Hash vÃ  lÆ°u máº­t kháº©u má»›i
    nd.matKhau = await bcrypt.hash(matKhauMoi, 10)
    await nd.save()

    return NextResponse.json({ thanhCong: true, thongBao: 'Äá»•i máº­t kháº©u thÃ nh cÃ´ng!' })

  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

