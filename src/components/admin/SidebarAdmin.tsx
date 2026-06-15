'use client'
/**
 * COMPONENT — Sidebar Admin dùng chung
 * Đường dẫn: src/components/admin/SidebarAdmin.tsx
 * Sử dụng: import SidebarAdmin from '@/components/admin/SidebarAdmin'
 *          <SidebarAdmin trangHienTai="/admin/sach" tenNguoiDung="Admin" />
 */

import Link from 'next/link'

const MENU = [
  { icon: '📊', nhan: 'Tổng quan',    href: '/admin' },
  { icon: '📚', nhan: 'Quản lý sách', href: '/admin/sach' },
  { icon: '🚨', nhan: 'Sách lỗi',     href: '/admin/sach/loiSach' },
  { icon: '🗂️', nhan: 'Danh mục',     href: '/admin/danhMuc' },
  { icon: '👥', nhan: 'Người dùng',   href: '/admin/nguoidung' },
  { icon: '📋', nhan: 'Mượn / Trả',   href: '/admin/muontra' },
  { icon: '📰', nhan: 'Tin tức',       href: '/admin/tintuc' },
  { icon: '💬', nhan: 'Tin nhắn',      href: '/admin/tinnhan' },
]

interface Props {
  trangHienTai: string
  tenNguoiDung?: string
  tinNhanMoi?: number
}

export default function SidebarAdmin({ trangHienTai, tenNguoiDung, tinNhanMoi = 0 }: Props) {
  // Kiểm tra active: khớp chính xác hoặc là sub-path
  // Khớp chính xác — không dùng startsWith để tránh /admin/sach match /admin/sach/loiSach
  const isActive = (href: string) => trangHienTai === href

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <div>
            <div className="font-bold text-sm text-gray-800">Admin UTT</div>
            <div className="text-[10px] text-gray-400 truncate max-w-[130px]">{tenNguoiDung || 'Quản trị viên'}</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-0.5 flex-1">
        {MENU.map(m => (
          <Link key={m.href} href={m.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(m.href)
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <span className="shrink-0">{m.icon}</span>
            <span className="flex-1">{m.nhan}</span>
            {/* Badge tin nhắn chưa đọc */}
            {m.href === '/admin/tinnhan' && tinNhanMoi > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                isActive(m.href) ? 'bg-white text-blue-600' : 'text-white'
              }`}
                style={!isActive(m.href) ? { backgroundColor: '#F47920' } : {}}>
                {tinNhanMoi}
              </span>
            )}
          </Link>
        ))}

        <hr className="my-2 border-gray-100" />
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
          <span>🏠</span><span>Trang chủ</span>
        </Link>
      </nav>
    </aside>
  )
}
