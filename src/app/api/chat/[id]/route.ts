/**
 * API — Chat theo mã phiên
 * GET /api/chat/[id]
 * PUT /api/chat/[id]
 * Đường dẫn: src/app/api/chat/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import CuocTroChuyen from '@/models/TinNhan'

type P = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: P) {
  try {
    await ketNoiMongoDB()
    const cuocTC = await CuocTroChuyen.findOne({ maPhien: params.id }).lean()
    // Trả null thay vì 404 để client không spam retry
    return NextResponse.json({ thanhCong: true, duLieu: cuocTC || null })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: P) {
  try {
    await ketNoiMongoDB()
    const { hanhDong } = await req.json()

    if (hanhDong === 'daDoc') {
      await CuocTroChuyen.updateOne(
        { maPhien: params.id },
        { $set: { soTinChuaDoc: 0 } }
      )
    }

    if (hanhDong === 'giaHan') {
      const ngayMoi = new Date()
      ngayMoi.setDate(ngayMoi.getDate() + 3)
      await CuocTroChuyen.updateOne(
        { maPhien: params.id },
        { $set: { ngayHetHan: ngayMoi } }
      )
    }

    return NextResponse.json({ thanhCong: true })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
