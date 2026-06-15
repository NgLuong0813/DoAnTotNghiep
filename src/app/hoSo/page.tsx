'use client'
/**
 * TRANG - Hồ Sơ Cá Nhân (có phần đổi mật khẩu)
 * Đường dẫn: src/app/hoSo/page.tsx
 */

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

const THE_NHAN: Record<string, string> = {
  hoatDong: '✅ Đang hoạt động', choKichHoat: '⏳ Chờ kích hoạt',
  dinhChi: '🚫 Đình chỉ', hetHan: '⌛ Hết hạn',
}
const THE_MAU: Record<string, { nn: string; ch: string }> = {
  hoatDong: { nn: '#dcfce7', ch: '#166534' }, choKichHoat: { nn: '#fef9c3', ch: '#854d0e' },
  dinhChi: { nn: '#fee2e2', ch: '#991b1b' }, hetHan: { nn: '#f3f4f6', ch: '#374151' },
}
const VAI_TRO: Record<string, string> = {
  sinhVien: '🎓 Sinh viên', thuThu: '📋 Thủ thư', admin: '👑 Quản trị viên',
}
const GIOI_TINH: Record<string, string> = {
  nam: '👨 Nam', nu: '👩 Nữ', khac: '🧑 Khác',
}

export default function TrangHoSo() {
  const { data: phien, status, update } = useSession()
  const nguoiDungPhien = phien?.user as any
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [hoSo,        setHoSo]        = useState<any>(null)
  const [dangTaiHoSo, setDangTaiHoSo] = useState(true)
  const [dangUpload,  setDangUpload]  = useState(false)
  const [anhXemTruoc, setAnhXemTruoc] = useState('')
  const [thongBao,    setThongBao]    = useState({ loai: '', noi: '' })

  // State đổi mật khẩu
  const [hienDoiMK,   setHienDoiMK]   = useState(false)
  const [dangDoiMK,   setDangDoiMK]   = useState(false)
  const [hienMK,      setHienMK]      = useState({ cu: false, moi: false, xacNhan: false })
  const [formMK,      setFormMK]      = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' })
  const [thongBaoMK,  setThongBaoMK]  = useState({ loai: '', noi: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !nguoiDungPhien?.id) return
    async function taiHoSo() {
      setDangTaiHoSo(true)
      try {
        const res  = await fetch(`/api/nguoidung/${nguoiDungPhien.id}`)
        const json = await res.json()
        if (json.thanhCong) setHoSo(json.duLieu)
      } finally {
        setDangTaiHoSo(false)
      }
    }
    taiHoSo()
  }, [status, nguoiDungPhien?.id])

  useEffect(() => {
    if (thongBao.noi) {
      const t = setTimeout(() => setThongBao({ loai: '', noi: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [thongBao])

  useEffect(() => {
    if (thongBaoMK.noi) {
      const t = setTimeout(() => setThongBaoMK({ loai: '', noi: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [thongBaoMK])

  // Đổi ảnh đại diện
  const xuLyDoiAnh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAnhXemTruoc(ev.target?.result as string)
    reader.readAsDataURL(file)
    setDangUpload(true)
    setThongBao({ loai: '', noi: '' })
    try {
      const fd = new FormData()
      fd.append('file', file)
      const resUpload  = await fetch('/api/taiLen?loai=anhDaiDien', { method: 'POST', body: fd })
      const jsonUpload = await resUpload.json()
      if (!jsonUpload.thanhCong) {
        setThongBao({ loai: 'loi', noi: jsonUpload.thongBao || 'Upload ảnh thất bại' })
        setAnhXemTruoc(''); return
      }
      const duongDanAnh = jsonUpload.duongDanAnh
      const resDB  = await fetch(`/api/nguoidung/${nguoiDungPhien?.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anhDaiDien: duongDanAnh }),
      })
      const jsonDB = await resDB.json()
      if (!jsonDB.thanhCong) { setThongBao({ loai: 'loi', noi: 'Lưu ảnh thất bại' }); return }
      await update({ user: { anhDaiDien: duongDanAnh } })
      setHoSo((h: any) => ({ ...h, anhDaiDien: duongDanAnh }))
      setThongBao({ loai: 'ok', noi: 'Cập nhật ảnh đại diện thành công!' })
    } catch {
      setThongBao({ loai: 'loi', noi: 'Đã có lỗi xảy ra' })
      setAnhXemTruoc('')
    } finally {
      setDangUpload(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Đổi mật khẩu
  const xuLyDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault()
    setDangDoiMK(true)
    setThongBaoMK({ loai: '', noi: '' })
    try {
      const res  = await fetch('/api/doiMatKhau', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formMK),
      })
      const json = await res.json()
      if (json.thanhCong) {
        setThongBaoMK({ loai: 'ok', noi: '✅ Đổi mật khẩu thành công!' })
        setFormMK({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' })
        setTimeout(() => setHienDoiMK(false), 2000)
      } else {
        setThongBaoMK({ loai: 'loi', noi: json.thongBao })
      }
    } catch {
      setThongBaoMK({ loai: 'loi', noi: 'Đã có lỗi xảy ra, vui lòng thử lại' })
    } finally {
      setDangDoiMK(false)
    }
  }

  const formatNgay = (ngay: string) => ngay
    ? new Date(ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  const mauDoiMK = (dieu: boolean) => dieu
    ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'

  if (status === 'loading' || dangTaiHoSo) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">👤</div>
          <div className="text-sm">Đang tải hồ sơ...</div>
        </div>
      </div>
    </div>
  )

  const anhHienThi   = anhXemTruoc || hoSo?.anhDaiDien
  const trangThaiThe = hoSo?.trangThaiThe || 'choKichHoat'
  const mauThe       = THE_MAU[trangThaiThe] || THE_MAU.choKichHoat

  const inputMKClass = "w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all pr-11 focus:border-blue-400"

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">👤 Hồ sơ của tôi</h1>

        {/* Thông báo chung */}
        {thongBao.noi && (
          <div className={`mb-5 px-4 py-3 rounded-xl text-sm border ${
            thongBao.loai === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {thongBao.loai === 'ok' ? '✅' : '⚠️'} {thongBao.noi}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Cột trái ── */}
          <div className="md:col-span-1 space-y-4">

            {/* Ảnh đại diện */}
            <div className="bg-white rounded-2xl border p-6 text-center shadow-sm" style={{ borderColor: '#cce0ff' }}>
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 mx-auto flex items-center justify-center"
                  style={{ borderColor: '#F47920', backgroundColor: '#e6f0ff' }}>
                  {anhHienThi ? (
                    <img src={anhHienThi} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold" style={{ color: '#0066CC' }}>
                      {hoSo?.hoTen?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                {dangUpload && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Đang tải...</span>
                  </div>
                )}
              </div>
              <div className="font-bold text-gray-800 text-base mb-0.5">{hoSo?.hoTen}</div>
              <div className="text-xs text-gray-500 mb-1">{hoSo?.email}</div>
              <div className="text-xs mb-4" style={{ color: '#0066CC' }}>{VAI_TRO[hoSo?.vaiTro] || hoSo?.vaiTro}</div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={xuLyDoiAnh} className="hidden" id="inputAnhDaiDien" disabled={dangUpload} />
              <label htmlFor="inputAnhDaiDien"
                className={`inline-block px-4 py-2 text-white text-xs rounded-lg transition-colors ${
                  dangUpload ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={!dangUpload ? { backgroundColor: '#0066CC' } : {}}>
                {dangUpload ? '⏳ Đang tải...' : '📷 Đổi ảnh đại diện'}
              </label>
              <p className="text-[10px] text-gray-400 mt-2">JPG, PNG, WEBP — tối đa 5MB</p>
            </div>

            {/* Thẻ thư viện */}
            <div className="rounded-2xl p-5 text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #002952, #0066CC)' }}>
              <div className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Thẻ thư viện UTT</div>
              <div className="text-2xl font-bold font-mono tracking-wider mb-1">{hoSo?.soThe}</div>
              <div className="text-sm font-medium mb-1">{hoSo?.hoTen}</div>
              <div className="text-[10px] opacity-70 mb-3">Hết hạn: {formatNgay(hoSo?.ngayHetHan)}</div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: mauThe.nn + '33', color: mauThe.nn }}>
                {THE_NHAN[trangThaiThe]}
              </div>
            </div>

            {/* Thống kê */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#cce0ff' }}>
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#0066CC' }}>
                Thống kê mượn sách
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { so: hoSo?.dangMuon || 0,                     nhan: 'Đang mượn',     mau: '#0066CC' },
                  { so: Math.max(0, 5-(hoSo?.dangMuon||0)),       nhan: 'Còn được mượn', mau: '#16a34a' },
                  { so: hoSo?.tongSoLanMuon || 0,                 nhan: 'Tổng đã mượn',  mau: '#F47920' },
                  { so: 2,                                         nhan: 'Gia hạn tối đa', mau: '#7c3aed' },
                ].map((item) => (
                  <div key={item.nhan} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#f0f6ff' }}>
                    <div className="text-xl font-bold" style={{ color: item.mau }}>{item.so}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{item.nhan}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút nhanh */}
            <div className="space-y-2">
              <Link href="/muonSach"
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-700 hover:bg-blue-50 shadow-sm transition-colors"
                style={{ borderColor: '#cce0ff' }}>
                📚 Sách đang mượn
              </Link>
              <button
                onClick={() => { setHienDoiMK(true); setFormMK({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' }); setThongBaoMK({ loai: '', noi: '' }) }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border rounded-xl text-sm shadow-sm transition-colors hover:bg-orange-50"
                style={{ borderColor: '#fed7aa', color: '#ea580c' }}>
                🔑 Đổi mật khẩu
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border rounded-xl text-sm hover:bg-red-50 shadow-sm transition-colors"
                style={{ borderColor: '#fecaca', color: '#dc2626' }}>
                🚪 Đăng xuất
              </button>
            </div>
          </div>

          {/* ── Cột phải ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#cce0ff' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: '#e6f0ff', backgroundColor: '#f0f6ff' }}>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <span>📋</span> Thông tin cá nhân
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { nhan: 'Họ và tên',     gtri: hoSo?.hoTen },
                  { nhan: 'Email',          gtri: hoSo?.email },
                  { nhan: 'Số điện thoại', gtri: hoSo?.soDienThoai },
                  { nhan: 'Giới tính',      gtri: GIOI_TINH[hoSo?.gioiTinh] || '—' },
                  { nhan: 'Ngày sinh',      gtri: formatNgay(hoSo?.ngaySinh) },
                  { nhan: 'Địa chỉ',        gtri: hoSo?.diaChi },
                ].map(({ nhan, gtri }) => (
                  <div key={nhan} className="rounded-xl p-3.5" style={{ backgroundColor: '#f8faff' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{nhan}</div>
                    <div className="font-medium text-gray-800 text-sm">{gtri || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thông tin học tập */}
            {hoSo?.vaiTro === 'sinhVien' && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#cce0ff' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: '#e6f0ff', backgroundColor: '#f0f6ff' }}>
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>🎓</span> Thông tin học tập
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { nhan: 'Mã số sinh viên', gtri: hoSo?.maSoSV },
                    { nhan: 'Khóa học',         gtri: hoSo?.khoaHoc },
                    { nhan: 'Khoa',              gtri: hoSo?.khoa },
                    { nhan: 'Chuyên ngành',      gtri: hoSo?.nganh },
                  ].map(({ nhan, gtri }) => (
                    <div key={nhan} className="rounded-xl p-3.5" style={{ backgroundColor: '#f8faff' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{nhan}</div>
                      <div className="font-medium text-gray-800 text-sm">{gtri || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quy định mượn sách */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#cce0ff' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: '#e6f0ff', backgroundColor: '#f0f6ff' }}>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <span>📖</span> Quy định mượn sách
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {[
                  { so: '5',      nhan: 'Tối đa mượn',   donVi: 'cuốn/lần', mau: '#0066CC' },
                  { so: '14',     nhan: 'Thời hạn mượn', donVi: 'ngày',     mau: '#16a34a' },
                  { so: '2',      nhan: 'Gia hạn tối đa', donVi: 'lần',     mau: '#7c3aed' },
                  { so: '2.000đ', nhan: 'Phạt trễ hạn',  donVi: '/ngày',   mau: '#F47920' },
                ].map((item) => (
                  <div key={item.nhan} className="rounded-xl p-4 border"
                    style={{ backgroundColor: '#f0f6ff', borderColor: '#cce0ff' }}>
                    <div className="text-xl font-bold mb-1" style={{ color: item.mau }}>{item.so}</div>
                    <div className="text-[10px] text-gray-500">{item.nhan}</div>
                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: item.mau }}>{item.donVi}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-5">
                <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: '#fff3e6', color: '#92400e' }}>
                  💡 Để cập nhật thông tin cá nhân, vui lòng liên hệ thủ thư hoặc đến trực tiếp quầy thư viện.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL ĐỔI MẬT KHẨU ── */}
      {hienDoiMK && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">🔑 Đổi mật khẩu</h2>
              <button onClick={() => setHienDoiMK(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>

            <form onSubmit={xuLyDoiMatKhau} className="p-6 space-y-4">

              {/* Thông báo */}
              {thongBaoMK.noi && (
                <div className={`px-4 py-3 rounded-xl text-sm border ${
                  thongBaoMK.loai === 'ok'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {thongBaoMK.noi}
                </div>
              )}

              {/* Mật khẩu hiện tại */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Mật khẩu hiện tại *
                </label>
                <div className="relative">
                  <input
                    required
                    type={hienMK.cu ? 'text' : 'password'}
                    value={formMK.matKhauCu}
                    onChange={e => setFormMK(f => ({ ...f, matKhauCu: e.target.value }))}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={`${inputMKClass} ${mauDoiMK(formMK.matKhauCu.length > 0)}`}
                  />
                  <button type="button"
                    onClick={() => setHienMK(h => ({ ...h, cu: !h.cu }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {hienMK.cu ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Mật khẩu mới * <span className="font-normal text-gray-400">(tối thiểu 6 ký tự)</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={hienMK.moi ? 'text' : 'password'}
                    value={formMK.matKhauMoi}
                    onChange={e => setFormMK(f => ({ ...f, matKhauMoi: e.target.value }))}
                    placeholder="Nhập mật khẩu mới"
                    className={`${inputMKClass} ${mauDoiMK(formMK.matKhauMoi.length >= 6)}`}
                  />
                  <button type="button"
                    onClick={() => setHienMK(h => ({ ...h, moi: !h.moi }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {hienMK.moi ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Thanh độ mạnh mật khẩu */}
                {formMK.matKhauMoi && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: formMK.matKhauMoi.length >= i * 3
                              ? i <= 1 ? '#ef4444' : i <= 2 ? '#f59e0b' : i <= 3 ? '#3b82f6' : '#22c55e'
                              : '#e5e7eb'
                          }} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {formMK.matKhauMoi.length < 6 ? '⚠️ Quá ngắn'
                        : formMK.matKhauMoi.length < 9 ? '🟡 Trung bình'
                        : formMK.matKhauMoi.length < 12 ? '🔵 Tốt'
                        : '🟢 Rất mạnh'}
                    </p>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Xác nhận mật khẩu mới *
                </label>
                <div className="relative">
                  <input
                    required
                    type={hienMK.xacNhan ? 'text' : 'password'}
                    value={formMK.xacNhanMatKhau}
                    onChange={e => setFormMK(f => ({ ...f, xacNhanMatKhau: e.target.value }))}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`${inputMKClass} ${
                      formMK.xacNhanMatKhau
                        ? formMK.xacNhanMatKhau === formMK.matKhauMoi
                          ? 'border-green-400 bg-green-50'
                          : 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                  <button type="button"
                    onClick={() => setHienMK(h => ({ ...h, xacNhan: !h.xacNhan }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {hienMK.xacNhan ? '🙈' : '👁'}
                  </button>
                </div>
                {formMK.xacNhanMatKhau && formMK.xacNhanMatKhau !== formMK.matKhauMoi && (
                  <p className="text-[11px] text-red-500 mt-1">⚠️ Mật khẩu xác nhận không khớp</p>
                )}
                {formMK.xacNhanMatKhau && formMK.xacNhanMatKhau === formMK.matKhauMoi && (
                  <p className="text-[11px] text-green-600 mt-1">✅ Mật khẩu khớp</p>
                )}
              </div>

              {/* Nút */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setHienDoiMK(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                  Hủy
                </button>
                <button type="submit"
                  disabled={dangDoiMK || formMK.matKhauMoi !== formMK.xacNhanMatKhau || formMK.matKhauMoi.length < 6}
                  className="flex-1 py-2.5 text-sm text-white rounded-xl disabled:opacity-60 font-medium"
                  style={{ backgroundColor: '#0066CC' }}>
                  {dangDoiMK ? '⏳ Đang đổi...' : '🔑 Xác nhận đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChanTrang />
    </div>
  )
}
