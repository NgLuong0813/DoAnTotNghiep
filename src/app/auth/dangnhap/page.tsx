'use client'
/**
 * TRANG — Đăng Nhập + Quên Mật Khẩu
 * Đường dẫn: src/app/auth/dangnhap/page.tsx
 */

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type BuocQMK = 'nhapEmail' | 'nhapOTP' | 'thanhCong'

export default function TrangDangNhap() {
  const router = useRouter()

  // State đăng nhập
  const [email,     setEmail]     = useState('')
  const [matKhau,   setMatKhau]   = useState('')
  const [hienMK,    setHienMK]    = useState(false)
  const [dangNhap,  setDangNhap]  = useState(false)
  const [loiDN,     setLoiDN]     = useState('')

  // State quên mật khẩu
  const [hienQMK,   setHienQMK]   = useState(false)
  const [buocQMK,   setBuocQMK]   = useState<BuocQMK>('nhapEmail')
  const [emailQMK,  setEmailQMK]  = useState('')
  const [hoTenQMK,  setHoTenQMK]  = useState('')
  const [otp,       setOtp]       = useState('')
  const [mkMoi,     setMkMoi]     = useState('')
  const [mkMoi2,    setMkMoi2]    = useState('')
  const [hienMKMoi, setHienMKMoi] = useState(false)
  const [dangXuLy,  setDangXuLy]  = useState(false)
  const [loiQMK,    setLoiQMK]    = useState('')
  const [okQMK,     setOkQMK]     = useState('')
  const [demNguoc,  setDemNguoc]  = useState(0)

  // Đăng nhập
  const xuLyDangNhap = async (e: React.FormEvent) => {
    e.preventDefault()
    setDangNhap(true)
    setLoiDN('')
    try {
      const ket = await signIn('credentials', {
        email, password: matKhau, redirect: false,
      })
      if (ket?.ok) {
        router.push('/')
      } else {
        setLoiDN('Email hoặc mật khẩu không đúng')
      }
    } catch {
      setLoiDN('Đã có lỗi xảy ra, vui lòng thử lại')
    }
    setDangNhap(false)
  }

  const dienNhanh = (em: string, mk: string) => { setEmail(em); setMatKhau(mk) }

  // Mở popup quên mật khẩu
  const moQMK = () => {
    setHienQMK(true)
    setBuocQMK('nhapEmail')
    setEmailQMK('')
    setHoTenQMK('')
    setOtp('')
    setMkMoi('')
    setMkMoi2('')
    setLoiQMK('')
    setOkQMK('')
    setDemNguoc(0)
  }

  // Bắt đầu đếm ngược 10 phút
  const batDauDem = () => {
    setDemNguoc(600)
    const timer = setInterval(() => {
      setDemNguoc(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const formatDem = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // Bước 1: Gửi OTP
  const guiOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailQMK) { setLoiQMK('Vui lòng nhập email'); return }
    setDangXuLy(true)
    setLoiQMK('')
    setOkQMK('')
    try {
      const res  = await fetch('/api/quenMatKhau', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailQMK }),
      })
      const json = await res.json()
      if (json.thanhCong) {
        setHoTenQMK(json.hoTen || '')
        setBuocQMK('nhapOTP')
        setOkQMK(json.thongBao)
        batDauDem()
      } else {
        setLoiQMK(json.thongBao)
      }
    } catch {
      setLoiQMK('Đã có lỗi xảy ra, vui lòng thử lại')
    }
    setDangXuLy(false)
  }

  // Bước 2: Xác nhận OTP + đặt mật khẩu mới
  const xacNhanOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) { setLoiQMK('Vui lòng nhập mã OTP 6 số'); return }
    if (!mkMoi || mkMoi.length < 6) { setLoiQMK('Mật khẩu mới phải có ít nhất 6 ký tự'); return }
    if (mkMoi !== mkMoi2) { setLoiQMK('Mật khẩu xác nhận không khớp'); return }
    setDangXuLy(true)
    setLoiQMK('')
    try {
      const res  = await fetch('/api/datLaiMatKhau', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailQMK, otp, matKhauMoi: mkMoi }),
      })
      const json = await res.json()
      if (json.thanhCong) {
        setBuocQMK('thanhCong')
      } else {
        setLoiQMK(json.thongBao)
      }
    } catch {
      setLoiQMK('Đã có lỗi xảy ra, vui lòng thử lại')
    }
    setDangXuLy(false)
  }

  const ic = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e6f0ff 0%, #ffffff 50%, #fff3e6 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-20 h-20 relative bg-white rounded-2xl shadow-md p-1">
              <Image src="/logo.png" alt="Logo UTT" fill className="object-contain p-1"
                onError={(e) => {
                  const t = e.target as HTMLImageElement; t.style.display = 'none'
                  t.parentElement!.innerHTML = `<div style="width:80px;height:80px;background:#0066CC;border-radius:16px;display:flex;align-items:center;justify-content:center;color:white;font-size:32px">📚</div>`
                }} />
            </div>
            <div>
              <div className="font-bold text-xl" style={{ color: '#0066CC' }}>Thư Viện UTT</div>
              <div className="text-xs text-gray-500">Trung tâm CNTT & Thư viện</div>
            </div>
          </Link>
        </div>

        {/* Card đăng nhập */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#cce0ff' }}>
          <div className="h-1" style={{ background: 'linear-gradient(to right, #0066CC, #F47920)' }} />
          <div className="p-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
            <p className="text-gray-500 text-sm mb-6">Sử dụng tài khoản thư viện UTT của bạn</p>

            {loiDN && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
                ⚠️ {loiDN}
              </div>
            )}

            <form onSubmit={xuLyDangNhap} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@utt.edu.vn" className={ic} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                  <button type="button" onClick={moQMK}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: '#F47920' }}>
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input type={hienMK ? 'text' : 'password'} required value={matKhau}
                    onChange={e => setMatKhau(e.target.value)}
                    placeholder="••••••••" className={`${ic} pr-11`} />
                  <button type="button" onClick={() => setHienMK(!hienMK)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {hienMK ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={dangNhap}
                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-70 hover:opacity-90"
                style={{ backgroundColor: '#0066CC' }}>
                {dangNhap ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Chưa có tài khoản?{' '}
              <Link href="/auth/dangky" className="font-semibold hover:underline" style={{ color: '#F47920' }}>
                Đăng ký thẻ thư viện
              </Link>
            </p>
          </div>
        </div>

        {/* Tài khoản thử nghiệm */}
        <div className="mt-4 rounded-xl border p-4" style={{ backgroundColor: '#e6f0ff', borderColor: '#99c2ff' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#0066CC' }}>
            📌 Tài khoản thử nghiệm (bấm để điền nhanh):
          </p>
          {[
            { icon: '👑', nhan: 'Admin', em: 'admin@utt.edu.vn', mk: 'admin123' },
            { icon: '📋', nhan: 'Thủ thư', em: 'thuthu@utt.edu.vn', mk: 'admin123' },
            { icon: '🎓', nhan: 'Sinh viên', em: 'sv1001@sv.utt.edu.vn', mk: 'sinhvien123' },
          ].map(tk => (
            <button key={tk.em} onClick={() => dienNhanh(tk.em, tk.mk)}
              className="w-full text-left text-xs py-1 hover:opacity-70 transition-opacity"
              style={{ color: '#0052a3' }}>
              {tk.icon} {tk.nhan}: {tk.em} / {tk.mk}
            </button>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Quay về trang chủ</Link>
        </div>
      </div>

      {/* ── POPUP QUÊN MẬT KHẨU ── */}
      {hienQMK && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #002952, #0066CC)' }}>
              <div>
                <h2 className="text-white font-bold text-base">🔑 Quên mật khẩu</h2>
                <p className="text-blue-200 text-[11px] mt-0.5">
                  {buocQMK === 'nhapEmail' && 'Bước 1/2 — Nhập email'}
                  {buocQMK === 'nhapOTP'   && 'Bước 2/2 — Xác nhận OTP'}
                  {buocQMK === 'thanhCong' && '✅ Hoàn thành'}
                </p>
              </div>
              <button onClick={() => setHienQMK(false)}
                className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                ✕
              </button>
            </div>

            <div className="p-6">

              {/* Thông báo lỗi / thành công */}
              {loiQMK && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
                  ⚠️ {loiQMK}
                </div>
              )}
              {okQMK && buocQMK === 'nhapOTP' && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700">
                  ✅ {okQMK}
                </div>
              )}

              {/* ── Bước 1: Nhập email ── */}
              {buocQMK === 'nhapEmail' && (
                <form onSubmit={guiOTP} className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Nhập email đã đăng ký để nhận mã OTP xác nhận.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                    <input type="email" required value={emailQMK}
                      onChange={e => setEmailQMK(e.target.value)}
                      placeholder="example@utt.edu.vn"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <button type="submit" disabled={dangXuLy}
                    className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-60"
                    style={{ backgroundColor: '#0066CC' }}>
                    {dangXuLy ? '⏳ Đang gửi...' : '📧 Gửi mã OTP'}
                  </button>
                </form>
              )}

              {/* ── Bước 2: Nhập OTP + mật khẩu mới ── */}
              {buocQMK === 'nhapOTP' && (
                <form onSubmit={xacNhanOTP} className="space-y-4">
                  {/* Xác nhận tên */}
                  {hoTenQMK && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f0f6ff' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#0066CC' }}>
                        {hoTenQMK[0]}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tài khoản được tìm thấy</p>
                        <p className="text-sm font-semibold text-gray-800">{hoTenQMK}</p>
                      </div>
                    </div>
                  )}

                  {/* Đếm ngược */}
                  {demNguoc > 0 && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">OTP hết hạn sau: </span>
                      <span className="text-sm font-bold" style={{ color: demNguoc < 60 ? '#dc2626' : '#0066CC' }}>
                        {formatDem(demNguoc)}
                      </span>
                    </div>
                  )}

                  {/* OTP input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Mã OTP 6 số (kiểm tra email)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[12px] outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Mật khẩu mới * (ít nhất 6 ký tự)
                    </label>
                    <div className="relative">
                      <input type={hienMKMoi ? 'text' : 'password'} value={mkMoi}
                        onChange={e => setMkMoi(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 pr-11" />
                      <button type="button" onClick={() => setHienMKMoi(!hienMKMoi)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {hienMKMoi ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Xác nhận mật khẩu mới *
                    </label>
                    <input type="password" value={mkMoi2}
                      onChange={e => setMkMoi2(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none ${
                        mkMoi2 && mkMoi2 !== mkMoi
                          ? 'border-red-400 bg-red-50'
                          : mkMoi2 && mkMoi2 === mkMoi
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200'
                      }`} />
                    {mkMoi2 && mkMoi2 !== mkMoi && (
                      <p className="text-[11px] text-red-500 mt-1">⚠️ Mật khẩu không khớp</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="button"
                      onClick={() => { setBuocQMK('nhapEmail'); setLoiQMK(''); setOkQMK('') }}
                      className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                      ← Quay lại
                    </button>
                    <button type="submit" disabled={dangXuLy || mkMoi !== mkMoi2}
                      className="flex-1 py-2.5 text-sm text-white font-semibold rounded-xl disabled:opacity-60"
                      style={{ backgroundColor: '#0066CC' }}>
                      {dangXuLy ? '⏳...' : '✅ Xác nhận'}
                    </button>
                  </div>

                  {/* Gửi lại OTP */}
                  {demNguoc === 0 && (
                    <button type="button" onClick={guiOTP} disabled={dangXuLy}
                      className="w-full text-sm font-medium hover:underline disabled:opacity-50"
                      style={{ color: '#F47920' }}>
                      Gửi lại mã OTP
                    </button>
                  )}
                </form>
              )}

              {/* ── Thành công ── */}
              {buocQMK === 'thanhCong' && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Đặt lại thành công!</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
                  </p>
                  <button onClick={() => setHienQMK(false)}
                    className="w-full py-3 text-white font-semibold rounded-xl"
                    style={{ backgroundColor: '#0066CC' }}>
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
