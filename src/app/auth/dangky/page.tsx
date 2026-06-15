'use client'
/**
 * TRANG — Thông báo đăng ký tài khoản
 * Đường dẫn: src/app/auth/dangky/page.tsx
 */

import Link from 'next/link'
import Image from 'next/image'

export default function TrangDangKy() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e6f0ff 0%, #ffffff 50%, #fff3e6 100%)' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-20 h-20 relative bg-white rounded-2xl shadow-md p-2">
              <Image src="/logo.png" alt="Logo UTT" fill className="object-contain p-1"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                  t.parentElement!.innerHTML = `<div style="width:80px;height:80px;background:#0066CC;border-radius:16px;display:flex;align-items:center;justify-content:center;color:white;font-size:32px">📚</div>`
                }} />
            </div>
            <div>
              <div className="font-bold text-xl" style={{ color: '#0066CC' }}>Thư Viện UTT</div>
              <div className="text-xs text-gray-500">Trung tâm CNTT & Thư viện</div>
            </div>
          </Link>
        </div>

        {/* Card thông báo */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#cce0ff' }}>
          {/* Dải màu trên */}
          <div className="h-1.5" style={{ background: 'linear-gradient(to right, #0066CC, #F47920)' }} />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
              style={{ backgroundColor: '#e6f0ff' }}>
              🔒
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Tài khoản do Admin cấp
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Hệ thống Thư viện UTT không hỗ trợ tự đăng ký tài khoản. Tài khoản được tạo và quản lý bởi <strong>cán bộ thư viện</strong>.
            </p>

            {/* Hướng dẫn */}
            <div className="rounded-xl p-5 text-left mb-6 space-y-3" style={{ backgroundColor: '#f0f6ff' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#0066CC' }}>
                Để được cấp tài khoản, bạn cần:
              </p>
              {[
                { icon: '🏛', text: 'Đến trực tiếp quầy thư viện tại Tầng 1, Nhà A' },
                { icon: '🪪', text: 'Xuất trình thẻ sinh viên hoặc thẻ cán bộ còn hiệu lực' },
                { icon: '📧', text: 'Cung cấp địa chỉ email để nhận thông tin đăng nhập' },
                { icon: '⏰', text: 'Làm trong giờ hành chính: T2–T6 (7:30–17:00)' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Liên hệ */}
            <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: '#fff3e6', borderColor: '#fcd9a0' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F47920' }}>
                Liên hệ hỗ trợ
              </p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p>📞 <strong>(024) 3869 0101</strong></p>
                <p>✉️ <strong>thuvien@utt.edu.vn</strong></p>
                <p>📍 Số 54, Triều Khúc, Thanh Xuân, Hà Nội</p>
              </div>
            </div>

            {/* Nút */}
            <Link href="/auth/dangnhap"
              className="block w-full py-3 text-white text-sm font-semibold rounded-xl transition-colors mb-3"
              style={{ backgroundColor: '#0066CC' }}>
              Đã có tài khoản? Đăng nhập
            </Link>
            <Link href="/"
              className="block w-full py-3 text-sm font-medium rounded-xl border transition-colors"
              style={{ borderColor: '#cce0ff', color: '#0066CC' }}>
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
