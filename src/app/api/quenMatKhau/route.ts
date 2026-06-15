/**
 * API — Quên mật khẩu
 * POST /api/quenMatKhau → Tạo OTP 6 số, lưu vào DB, gửi email
 * Đường dẫn: src/app/api/quenMatKhau/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'

// Schema OTP lưu vào MongoDB
const SchemaOTP = new mongoose.Schema({
  email:   { type: String, required: true, index: true },
  otp:     { type: String, required: true },
  hetHan:  { type: Date, required: true },
  hoTen:   { type: String, default: '' },
}, { collection: 'otpQuenMatKhau' })

// TTL index — tự xóa sau khi hết hạn
SchemaOTP.index({ hetHan: 1 }, { expireAfterSeconds: 0 })

const OTPModel = mongoose.models.OTPQuenMatKhau ||
  mongoose.model('OTPQuenMatKhau', SchemaOTP)

function taoOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    await ketNoiMongoDB()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ thanhCong: false, thongBao: 'Vui lòng nhập email' }, { status: 400 })
    }

    const emailChuan = email.toLowerCase().trim()

    // Kiểm tra tài khoản
    const nguoiDung = await NguoiDung.findOne({
      email: emailChuan, hoatDong: true,
    }).select('hoTen email').lean() as any

    if (!nguoiDung) {
      // Trả thành công giả để tránh lộ thông tin
      return NextResponse.json({
        thanhCong: true,
        thongBao: 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến.',
      })
    }

    // Tạo OTP và lưu vào MongoDB (ghi đè nếu đã có)
    const otp      = taoOTP()
    const hetHan   = new Date(Date.now() + 10 * 60 * 1000) // 10 phút

    await OTPModel.findOneAndUpdate(
      { email: emailChuan },
      { email: emailChuan, otp, hetHan, hoTen: nguoiDung.hoTen },
      { upsert: true, new: true }
    )

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px">
    <div style="background:linear-gradient(135deg,#002952,#0066CC);border-radius:16px 16px 0 0;padding:28px 36px;text-align:center">
      <div style="background:white;display:inline-block;padding:10px 18px;border-radius:10px;margin-bottom:14px">
        <span style="font-size:20px">📚</span>
        <span style="color:#0066CC;font-weight:700;font-size:16px;margin-left:8px">Thư Viện UTT</span>
      </div>
      <h1 style="color:white;margin:0;font-size:20px">Đặt lại mật khẩu</h1>
    </div>
    <div style="background:white;padding:32px 36px;border-left:1px solid #cce0ff;border-right:1px solid #cce0ff">
      <p style="font-size:15px;color:#1a1a1a;margin:0 0 16px">Xin chào <strong>${nguoiDung.hoTen}</strong>,</p>
      <p style="font-size:14px;color:#374151;margin:0 0 24px">Mã OTP đặt lại mật khẩu của bạn:</p>
      <div style="background:#f0f6ff;border:2px dashed #0066CC;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:2px">Mã xác nhận OTP</p>
        <div style="font-size:48px;font-weight:800;letter-spacing:12px;color:#0066CC;font-family:monospace">${otp}</div>
        <p style="margin:10px 0 0;font-size:12px;color:#F47920;font-weight:600">⏰ Mã có hiệu lực trong 10 phút</p>
      </div>
      <div style="background:#fff3e6;border:1px solid #fcd9a0;border-radius:10px;padding:14px">
        <p style="margin:0;font-size:12px;color:#92400e">
          ⚠️ Không chia sẻ mã này với bất kỳ ai. Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
      </div>
    </div>
    <div style="background:#002952;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center">
      <p style="color:#a0c4ff;font-size:11px;margin:0">© 2026 Thư Viện UTT — Email tự động</p>
    </div>
  </div>
</body>
</html>`

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      emailChuan,
      subject: `🔑 Mã OTP đặt lại mật khẩu: ${otp}`,
      html,
    })

    return NextResponse.json({
      thanhCong: true,
      thongBao:  'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư rác).',
      hoTen:     nguoiDung.hoTen,
    })

  } catch (loi: any) {
    console.error('Lỗi quên MK:', loi)
    return NextResponse.json({ thanhCong: false, thongBao: 'Đã có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
  }
}
