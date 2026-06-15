/**
 * LIB — Gửi Email qua Gmail
 * Đường dẫn: src/lib/guiEmail.ts
 */

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Template email chào mừng tài khoản mới ───────────────
export async function guiEmailChaoMung(params: {
  email:    string
  hoTen:    string
  matKhauTam: string
  soThe:    string
  vaiTro:   string
}) {
  const { email, hoTen, matKhauTam, soThe, vaiTro } = params

  const vaiTroLabel = vaiTro === 'sinhVien' ? 'Sinh viên'
    : vaiTro === 'thuThu' ? 'Thủ thư' : 'Quản trị viên'

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#002952,#0066CC);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
      <div style="background:white;display:inline-block;padding:12px 20px;border-radius:12px;margin-bottom:16px">
        <span style="font-size:24px">📚</span>
        <span style="color:#0066CC;font-weight:700;font-size:18px;margin-left:8px">Thư Viện UTT</span>
      </div>
      <h1 style="color:white;margin:0;font-size:22px">Chào mừng bạn đến với Thư Viện UTT!</h1>
      <p style="color:#a0c4ff;margin:8px 0 0;font-size:14px">Trung tâm CNTT & Thư viện — ĐH Công nghệ GTVT</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:32px 40px;border-left:1px solid #cce0ff;border-right:1px solid #cce0ff">
      <p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">Xin chào <strong>${hoTen}</strong>,</p>
      <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 24px">
        Tài khoản thư viện của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập của bạn:
      </p>

      <!-- Thông tin tài khoản -->
      <div style="background:#f0f6ff;border:1px solid #cce0ff;border-radius:12px;padding:24px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px">🌐 Website</td>
            <td style="padding:8px 0;font-weight:600;color:#0066CC;font-size:13px">
              <a href="http://localhost:3000" style="color:#0066CC">thuvien.utt.edu.vn</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px">📧 Email đăng nhập</td>
            <td style="padding:8px 0;font-weight:600;color:#1a1a1a;font-size:13px">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px">🔑 Mật khẩu tạm</td>
            <td style="padding:8px 0;font-size:18px;font-weight:700;color:#0066CC;letter-spacing:2px;font-family:monospace">${matKhauTam}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px">🪪 Số thẻ</td>
            <td style="padding:8px 0;font-weight:600;color:#1a1a1a;font-size:13px">${soThe}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px">👤 Vai trò</td>
            <td style="padding:8px 0;font-weight:600;color:#1a1a1a;font-size:13px">${vaiTroLabel}</td>
          </tr>
        </table>
      </div>

      <!-- Cảnh báo -->
      <div style="background:#fff3e6;border:1px solid #fcd9a0;border-radius:10px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#92400e">
          ⚠️ <strong>Quan trọng:</strong> Đây là mật khẩu tạm thời. Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.
        </p>
      </div>

      <!-- Quy định mượn sách -->
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:4px">
        <p style="font-size:13px;color:#6b7280;margin:0 0 12px"><strong>📖 Quy định mượn sách:</strong></p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${['📚 Mượn tối đa 5 cuốn/lần', '📅 Thời hạn 14 ngày', '🔄 Gia hạn tối đa 2 lần', '💰 Phạt trễ 2.000đ/ngày'].map(s => `
          <div style="background:#f9fafb;border-radius:8px;padding:8px 12px;font-size:12px;color:#374151">${s}</div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#002952;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
      <p style="color:#a0c4ff;font-size:12px;margin:0">
        📍 Số 54, Triều Khúc, Thanh Xuân, Hà Nội &nbsp;|&nbsp; 📞 (024) 3869 0101
      </p>
      <p style="color:#6b9ed4;font-size:11px;margin:6px 0 0">
        © 2026 Thư Viện UTT — Trường Đại học Công nghệ Giao thông Vận tải
      </p>
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: '📚 Tài khoản Thư Viện UTT của bạn đã được tạo',
    html,
  })
}

// ── Template email nhắc hạn trả sách ─────────────────────
export async function guiEmailNhacHan(params: {
  email:    string
  hoTen:    string
  tenSach:  string
  ngayHan:  Date
  soNgayCon: number
  soThe:    string
}) {
  const { email, hoTen, tenSach, ngayHan, soNgayCon, soThe } = params

  const mauNgayHan = ngayHan.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const mauCanhBao = soNgayCon <= 1
    ? { mau: '#dc2626', nen: '#fee2e2', vien: '#fca5a5', nhan: '🚨 KHẨN CẤP' }
    : soNgayCon <= 2
    ? { mau: '#d97706', nen: '#fff3e6', vien: '#fcd9a0', nhan: '⚠️ GẤP' }
    : { mau: '#0066CC', nen: '#e6f0ff', vien: '#99c2ff', nhan: '🔔 NHẮC NHỞ' }

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#002952,#0066CC);border-radius:16px 16px 0 0;padding:28px 40px;text-align:center">
      <div style="background:white;display:inline-block;padding:10px 18px;border-radius:10px;margin-bottom:14px">
        <span style="font-size:22px">📚</span>
        <span style="color:#0066CC;font-weight:700;font-size:16px;margin-left:8px">Thư Viện UTT</span>
      </div>
      <h1 style="color:white;margin:0;font-size:20px">Nhắc nhở hạn trả sách</h1>
    </div>

    <!-- Body -->
    <div style="background:white;padding:32px 40px;border-left:1px solid #cce0ff;border-right:1px solid #cce0ff">
      <p style="font-size:15px;color:#1a1a1a;margin:0 0 20px">Xin chào <strong>${hoTen}</strong>,</p>

      <!-- Cảnh báo chính -->
      <div style="background:${mauCanhBao.nen};border:2px solid ${mauCanhBao.vien};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="font-size:16px;font-weight:700;color:${mauCanhBao.mau};margin:0 0 8px">${mauCanhBao.nhan}</p>
        <p style="font-size:28px;font-weight:700;color:${mauCanhBao.mau};margin:0">
          Còn <span style="font-size:40px">${soNgayCon}</span> ngày để trả sách
        </p>
      </div>

      <!-- Thông tin sách -->
      <div style="background:#f8faff;border:1px solid #cce0ff;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase">Thông tin sách</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px">📖 Tên sách</td>
            <td style="padding:6px 0;font-weight:600;color:#1a1a1a;font-size:13px">${tenSach}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px">📅 Hạn trả</td>
            <td style="padding:6px 0;font-weight:700;color:${mauCanhBao.mau};font-size:14px">${mauNgayHan}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px">🪪 Số thẻ</td>
            <td style="padding:6px 0;font-weight:600;color:#1a1a1a;font-size:13px">${soThe}</td>
          </tr>
        </table>
      </div>

      <!-- Hành động -->
      <div style="background:#f0f6ff;border-radius:10px;padding:16px;margin-bottom:20px">
        <p style="margin:0 0 10px;font-size:13px;color:#374151;font-weight:600">Bạn có thể:</p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.8">
          ✅ <strong>Trả sách</strong> tại quầy thư viện trong giờ làm việc<br>
          🔄 <strong>Gia hạn</strong> trực tuyến tại hệ thống (nếu chưa gia hạn 2 lần)<br>
          📞 <strong>Liên hệ</strong> thủ thư: (024) 3869 0101
        </p>
      </div>

      <!-- Cảnh báo phí phạt -->
      <div style="background:#fff3e6;border:1px solid #fcd9a0;border-radius:10px;padding:14px">
        <p style="margin:0;font-size:12px;color:#92400e">
          💰 <strong>Lưu ý:</strong> Trả sách trễ sẽ bị phạt <strong>2.000đ/cuốn/ngày</strong>. Vui lòng trả đúng hạn để tránh phát sinh chi phí.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#002952;border-radius:0 0 16px 16px;padding:18px 40px;text-align:center">
      <p style="color:#a0c4ff;font-size:12px;margin:0">
        📍 Số 54, Triều Khúc, Thanh Xuân, Hà Nội &nbsp;|&nbsp; ⏰ T2-T6: 7:30-21:00 | T7: 7:30-17:00
      </p>
      <p style="color:#6b9ed4;font-size:11px;margin:6px 0 0">
        © 2026 Thư Viện UTT — Email tự động, vui lòng không reply
      </p>
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `🔔 Nhắc nhở: Sách "${tenSach}" sắp đến hạn trả (còn ${soNgayCon} ngày)`,
    html,
  })
}
