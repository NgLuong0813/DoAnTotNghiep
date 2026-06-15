'use client'
/**
 * COMPONENT — Thanh Điều Hướng
 * Đã ẩn nút Đăng ký — tài khoản do admin cấp
 * Đường dẫn: src/components/layout/ThanhDieuHuong.tsx
 */

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

const MENU_TINTUC = [
  { nhan: '📰 Tin tức',   duongDan: '/tintuc' },
  { nhan: '📢 Thông báo', duongDan: '/tintuc?loai=thongBao' },
  { nhan: '🎉 Sự kiện',   duongDan: '/tintuc?loai=suKien' },
  { nhan: '📋 Nội quy',   duongDan: '/tintuc?loai=noiQuy' },
]

export default function ThanhDieuHuong() {
  const { data: phienDangNhap } = useSession()
  const nguoiDung = phienDangNhap?.user as any

  const [moMenu,          setMoMenu]          = useState(false)
  const [moMenuNguoiDung, setMoMenuNguoiDung] = useState(false)
  const [moDropdownTin,   setMoDropdownTin]   = useState(false)

  return (
    <>
      {/* Thanh trên cùng */}
      <div className="text-white text-xs py-1.5 px-4 hidden md:block" style={{ backgroundColor: '#004d99' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>🏛 Trường Đại học Công nghệ Giao thông Vận tải (UTT)</span>
          <div className="flex gap-5">
            <span>📞 (024) 3869 0101</span>
            <span>✉ thuvien@utt.edu.vn</span>
            <span>⏰ Thứ 2–6: 7:30–21:00 | Thứ 7: 7:30–17:00</span>
          </div>
        </div>
      </div>

      {/* Header chính */}
      <header className="bg-white border-b-4 sticky top-0 z-50 shadow-sm" style={{ borderBottomColor: '#F47920' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 relative">
              <Image src="/logo.png" alt="Logo UTT" fill className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<div style="width:48px;height:48px;background:#0066CC;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:20px">📚</div>`
                }} />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-base leading-tight" style={{ color: '#0066CC' }}>Thư Viện UTT</div>
              <div className="text-[10px] text-gray-500 tracking-wide">Trung tâm CNTT & Thư viện</div>
            </div>
          </Link>

          {/* Ô tìm kiếm */}
          <form action="/sach" method="get" className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full rounded-lg overflow-hidden border-2" style={{ borderColor: '#0066CC' }}>
              <input name="tuKhoa" type="text" placeholder="Tìm kiếm sách, tác giả, mã sách..."
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-gray-50" />
              <button type="submit" className="text-white px-5 text-sm transition-colors"
                style={{ backgroundColor: '#0066CC' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004d99')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0066CC')}>
                🔍
              </button>
            </div>
          </form>

          {/* Phần bên phải */}
          <div className="flex items-center gap-2">
            {phienDangNhap ? (
              <>
                {(nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'thuThu') && (
                  <Link href="/admin/sach"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-white text-xs font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#F47920' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c36119')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F47920')}>
                    🛠 Quản trị
                  </Link>
                )}

                {/* Menu người dùng */}
                <div className="relative">
                  <button onClick={() => setMoMenuNguoiDung(!moMenuNguoiDung)}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: '#0066CC', borderColor: '#F47920' }}>
                      {nguoiDung?.anhDaiDien ? (
                        <Image src={nguoiDung.anhDaiDien} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        nguoiDung?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">{nguoiDung?.name}</div>
                      <div className="text-[10px] text-gray-400">{nguoiDung?.soThe}</div>
                    </div>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  {moMenuNguoiDung && (
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{nguoiDung?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{nguoiDung?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          nguoiDung?.trangThaiThe === 'hoatDong' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {nguoiDung?.trangThaiThe === 'hoatDong' ? '● Thẻ hoạt động' : '○ Chờ kích hoạt'}
                        </span>
                      </div>
                      <Link href="/hoSo" onClick={() => setMoMenuNguoiDung(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                        👤 Hồ sơ của tôi
                      </Link>
                      <Link href="/muonSach" onClick={() => setMoMenuNguoiDung(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                        📖 Sách đang mượn
                      </Link>
                      {(nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'thuThu') && (
                        <Link href="/admin/sach" onClick={() => setMoMenuNguoiDung(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-orange-50"
                          style={{ color: '#F47920' }}>
                          🛠 Trang quản trị
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        🚪 Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Chưa đăng nhập — CHỈ hiện nút Đăng nhập, KHÔNG có Đăng ký */
              <Link href="/auth/dangnhap"
                className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#0066CC' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004d99')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0066CC')}>
                Đăng nhập
              </Link>
            )}

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMoMenu(!moMenu)}>
              {moMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* ── Thanh nav chính ── */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 items-stretch">

            {/* Trang chủ */}
            <Link href="/"
              className="px-4 py-3 text-sm font-medium text-gray-700 border-b-2 border-transparent transition-all whitespace-nowrap"
              onMouseEnter={e => { e.currentTarget.style.color = '#0066CC'; e.currentTarget.style.borderBottomColor = '#F47920' }}
              onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.borderBottomColor = 'transparent' }}>
              Trang chủ
            </Link>

            {/* Danh mục sách */}
            <Link href="/sach"
              className="px-4 py-3 text-sm font-medium text-gray-700 border-b-2 border-transparent transition-all whitespace-nowrap"
              onMouseEnter={e => { e.currentTarget.style.color = '#0066CC'; e.currentTarget.style.borderBottomColor = '#F47920' }}
              onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.borderBottomColor = 'transparent' }}>
              Danh mục sách
            </Link>

            {/* Dropdown Tin tức */}
            <div className="relative"
              onMouseEnter={() => setMoDropdownTin(true)}
              onMouseLeave={() => setMoDropdownTin(false)}>
              <button
                className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 border-b-2 border-transparent transition-all whitespace-nowrap h-full"
                style={moDropdownTin ? { color: '#0066CC', borderBottomColor: '#F47920' } : {}}>
                Tin tức
                <span className="text-[10px] ml-0.5" style={{ color: moDropdownTin ? '#F47920' : '#9ca3af' }}>▾</span>
              </button>
              {moDropdownTin && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
                  style={{ borderTop: `3px solid #F47920` }}>
                  {MENU_TINTUC.map((muc) => (
                    <Link key={muc.duongDan} href={muc.duongDan}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e6f0ff'; e.currentTarget.style.color = '#0066CC' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' }}>
                      {muc.nhan}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Giới thiệu */}
            <Link href="/gioiThieu"
              className="px-4 py-3 text-sm font-medium text-gray-700 border-b-2 border-transparent transition-all whitespace-nowrap"
              onMouseEnter={e => { e.currentTarget.style.color = '#0066CC'; e.currentTarget.style.borderBottomColor = '#F47920' }}
              onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.borderBottomColor = 'transparent' }}>
              Giới thiệu
            </Link>
          </div>
        </nav>

        {/* Menu mobile */}
        {moMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <form action="/sach" method="get" className="flex mb-3">
              <input name="tuKhoa" type="text" placeholder="Tìm sách..."
                className="flex-1 border-2 rounded-l-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#0066CC' }} />
              <button type="submit" className="text-white px-4 rounded-r-lg text-sm"
                style={{ backgroundColor: '#0066CC' }}>🔍</button>
            </form>
            {[
              { nhan: '🏠 Trang chủ',    duongDan: '/' },
              { nhan: '📚 Danh mục sách', duongDan: '/sach' },
              { nhan: '📰 Tin tức',       duongDan: '/tintuc' },
              { nhan: '📢 Thông báo',     duongDan: '/tintuc?loai=thongBao' },
              { nhan: '🎉 Sự kiện',       duongDan: '/tintuc?loai=suKien' },
              { nhan: '📋 Nội quy',       duongDan: '/tintuc?loai=noiQuy' },
              { nhan: 'ℹ️ Giới thiệu',    duongDan: '/gioiThieu' },
            ].map((muc) => (
              <Link key={muc.duongDan} href={muc.duongDan}
                onClick={() => setMoMenu(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 rounded-lg transition-colors"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e6f0ff')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                {muc.nhan}
              </Link>
            ))}
            {!phienDangNhap && (
              <div className="pt-2 border-t border-gray-100">
                <Link href="/auth/dangnhap"
                  className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: '#0066CC' }}>
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {moMenuNguoiDung && (
        <div className="fixed inset-0 z-40" onClick={() => setMoMenuNguoiDung(false)} />
      )}
    </>
  )
}
