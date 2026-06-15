import type { Metadata } from 'next'
import './globals.css'
import NhaCungCap from '@/components/layout/NhaCungCap'

export const metadata: Metadata = {
  title: 'Thư Viện UTT — Trung tâm CNTT và Thư viện',
  description: 'Hệ thống thư viện Trường Đại học Công nghệ Giao thông Vận tải',
}

export default function BoBucTrangGoc({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-viet bg-gray-50">
        <NhaCungCap>{children}</NhaCungCap>
      </body>
    </html>
  )
}
