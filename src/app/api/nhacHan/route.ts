/**
 * API — Nhắc hạn trả sách qua email
 * GET /api/nhacHan → Quét phiếu mượn sắp hạn và gửi email
 * Gọi mỗi ngày bằng cron job hoặc thủ công
 * Đường dẫn: src/app/api/nhacHan/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import PhieuMuon from '@/models/PhieuMuon'
import { guiEmailNhacHan } from '@/lib/guiEmail'

export async function GET(req: NextRequest) {
  try {
    // Kiểm tra secret key để bảo mật
    const { searchParams } = new URL(req.url)
    const secretKey = searchParams.get('key')
    if (secretKey !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Không có quyền' }, { status: 401 })
    }

    await ketNoiMongoDB()

    const homNay = new Date()
    homNay.setHours(0, 0, 0, 0)

    // Tìm các phiếu mượn còn 1, 2, 3 ngày đến hạn
    const phieuSapHan = await PhieuMuon.find({
      trangThai: 'dangMuon',
    })
    .populate('nguoiMuon', 'hoTen email soThe')
    .populate('sach', 'tenSach')
    .lean()

    const ketQua = {
      tongPhieu: 0,
      guiThanhCong: 0,
      guiThatBai: 0,
      danhSach: [] as any[],
    }

    for (const phieu of phieuSapHan) {
      const ngayHan = new Date(phieu.ngayHanTra)
      ngayHan.setHours(0, 0, 0, 0)

      const soNgayCon = Math.ceil(
        (ngayHan.getTime() - homNay.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Chỉ nhắc khi còn 3, 2, 1 ngày
      if (soNgayCon > 0 && soNgayCon <= 3) {
        ketQua.tongPhieu++
        const nguoiMuon = phieu.nguoiMuon as any
        const sach      = phieu.sach      as any

        if (!nguoiMuon?.email) continue

        try {
          await guiEmailNhacHan({
            email:     nguoiMuon.email,
            hoTen:     nguoiMuon.hoTen,
            tenSach:   sach.tenSach,
            ngayHan:   new Date(phieu.ngayHanTra),
            soNgayCon,
            soThe:     nguoiMuon.soThe,
          })
          ketQua.guiThanhCong++
          ketQua.danhSach.push({
            nguoiMuon: nguoiMuon.hoTen,
            email:     nguoiMuon.email,
            tenSach:   sach.tenSach,
            soNgayCon,
            trangThai: 'OK',
          })
        } catch (loi: any) {
          ketQua.guiThatBai++
          ketQua.danhSach.push({
            nguoiMuon: nguoiMuon.hoTen,
            email:     nguoiMuon.email,
            tenSach:   sach.tenSach,
            soNgayCon,
            trangThai: 'Lỗi: ' + loi.message,
          })
        }
      }
    }

    return NextResponse.json({
      thanhCong: true,
      thongBao: `Đã gửi ${ketQua.guiThanhCong}/${ketQua.tongPhieu} email nhắc hạn`,
      duLieu: ketQua,
    })

  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
