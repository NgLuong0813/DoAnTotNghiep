/**
 * API — Đặt lại mật khẩu
 * POST /api/datLaiMatKhau → Xác nhận OTP từ DB + lưu mật khẩu mới
 * Đường dẫn: src/app/api/datLaiMatKhau/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Lấy model OTP (đã được tạo bên quenMatKhau hoặc tạo lại)
const SchemaOTP = new mongoose.Schema({
  email:  { type: String, required: true, index: true },
  otp:    { type: String, required: true },
  hetHan: { type: Date, required: true },
  hoTen:  { type: String, default: '' },
}, { collection: 'otpQuenMatKhau' })

SchemaOTP.index({ hetHan: 1 }, { expireAfterSeconds: 0 })

const OTPModel = mongoose.models.OTPQuenMatKhau ||
  mongoose.model('OTPQuenMatKhau', SchemaOTP)

export async function POST(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const { email, otp, matKhauMoi } = await req.json()

    if (!email || !otp || !matKhauMoi) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Thiếu thông tin' }, { status: 400 })
    }
    if (matKhauMoi.length < 6) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const emailChuan = email.toLowerCase().trim()

    // Tìm OTP trong DB
    const otpDoc = await OTPModel.findOne({ email: emailChuan })

    if (!otpDoc) {
      return NextResponse.json({
        thanhCong: false,
        thongBao:  'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.',
      }, { status: 400 })
    }

    // Kiểm tra hết hạn
    if (new Date() > new Date(otpDoc.hetHan)) {
      await OTPModel.deleteOne({ email: emailChuan })
      return NextResponse.json({
        thanhCong: false,
        thongBao:  'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
      }, { status: 400 })
    }

    // Kiểm tra đúng mã
    if (otpDoc.otp !== otp.trim()) {
      return NextResponse.json({
        thanhCong: false,
        thongBao:  'Mã OTP không đúng. Vui lòng kiểm tra lại.',
      }, { status: 400 })
    }

    // Cập nhật mật khẩu mới
    const hashMK = await bcrypt.hash(matKhauMoi, 10)
    const capNhat = await NguoiDung.findOneAndUpdate(
      { email: emailChuan },
      { $set: { matKhau: hashMK } },
      { new: true }
    )

    if (!capNhat) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Không tìm thấy tài khoản' }, { status: 404 })
    }

    // Xóa OTP sau khi dùng thành công
    await OTPModel.deleteOne({ email: emailChuan })

    return NextResponse.json({
      thanhCong: true,
      thongBao:  'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    })

  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
