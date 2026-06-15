/**
 * API — Insert 1000 sách mới vào MongoDB
 * POST /api/insert1000
 * XOA FILE NAY SAU KHI CHAY!
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import Sach from '@/models/Sach'
import sachData from './sach_1000.json'

export async function POST() {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd = phien?.user as any
    if (!phien || nd?.vaiTro !== 'admin') {
      return NextResponse.json({ thanhCong: false, thongBao: 'Chỉ admin' }, { status: 403 })
    }

    await ketNoiMongoDB()

    const ketQua = await Sach.insertMany(sachData, { ordered: false })

    const tongSach = await Sach.countDocuments()

    return NextResponse.json({
      thanhCong: true,
      thongBao: `Da them ${ketQua.length} sach moi`,
      tongSachHienTai: tongSach,
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
