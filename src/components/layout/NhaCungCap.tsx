'use client'
/**
 * COMPONENT — Nhà Cung Cấp (Provider)
 * Đường dẫn: src/components/layout/NhaCungCap.tsx
 */

import { SessionProvider } from 'next-auth/react'
import HopThoaiChat from '@/components/HopThoaiChat'
import { usePathname } from 'next/navigation'

function ChatWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Chỉ hiển thị chat ở trang chính (không phải admin, không phải auth)
  const hienChat = pathname
    && !pathname.startsWith('/admin')
    && !pathname.startsWith('/auth')

  return (
    <>
      {children}
      {hienChat && <HopThoaiChat />}
    </>
  )
}

export default function NhaCungCap({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatWrapper>{children}</ChatWrapper>
    </SessionProvider>
  )
}