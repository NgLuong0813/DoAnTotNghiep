'use client'
/**
 * TRANG — Chi Tiết Bài Viết Tin Tức
 * Đường dẫn: src/app/tintuc/[slug]/page.tsx
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

const LOAI_TIN: Record<string, { nhan: string; mauNen: string; mauChu: string }> = {
  tinTuc:   { nhan: '📰 Tin tức',   mauNen: '#e6f0ff', mauChu: '#0052a3' },
  thongBao: { nhan: '📢 Thông báo', mauNen: '#fff3e6', mauChu: '#c36119' },
  suKien:   { nhan: '🎉 Sự kiện',   mauNen: '#dcfce7', mauChu: '#166534' },
  noiQuy:   { nhan: '📋 Nội quy',   mauNen: '#fef9c3', mauChu: '#854d0e' },
}

export default function TrangChiTietTinTuc() {
  const params = useParams()
  const router = useRouter()

  const [tin,     setTin]     = useState<any>(null)
  const [dangTai, setDangTai] = useState(true)
  const [loi,     setLoi]     = useState('')

  useEffect(() => {
    async function taiTin() {
      if (!params.slug) return
      try {
        const res  = await fetch(`/api/tintuc/${params.slug}`)
        const json = await res.json()
        if (json.thanhCong) {
          setTin(json.duLieu)
        } else {
          setLoi('Không tìm thấy bài viết')
        }
      } catch {
        setLoi('Đã có lỗi xảy ra')
      } finally {
        setDangTai(false)
      }
    }
    taiTin()
  }, [params.slug])

  const formatNgay = (ngay: string) => ngay
    ? new Date(ngay).toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      })
    : ''

  // ── Màn hình tải ─────────────────────────────────────────
  if (dangTai) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3 animate-bounce">📰</div>
          <div className="text-sm">Đang tải bài viết...</div>
        </div>
      </div>
      <ChanTrang />
    </div>
  )

  // ── Lỗi không tìm thấy ───────────────────────────────────
  if (loi || !tin) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-500 text-sm mb-6">Bài viết không tồn tại hoặc đã bị xóa</p>
          <Link href="/tintuc"
            className="px-6 py-2.5 text-white text-sm rounded-xl font-medium"
            style={{ backgroundColor: '#0066CC' }}>
            ← Quay lại tin tức
          </Link>
        </div>
      </div>
      <ChanTrang />
    </div>
  )

  const loaiInfo = LOAI_TIN[tin.loai] || LOAI_TIN.tinTuc

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:underline" style={{ color: '#0066CC' }}>Trang chủ</Link>
          <span>›</span>
          <Link href="/tintuc" className="hover:underline" style={{ color: '#0066CC' }}>Tin tức</Link>
          <span>›</span>
          <span className="text-gray-700 truncate max-w-[300px]">{tin.tieuDe}</span>
        </div>

        {/* Bài viết */}
        <article className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#cce0ff' }}>

          {/* Header */}
          <div className="p-8 border-b" style={{ borderColor: '#e6f0ff' }}>
            {/* Badge loại */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: loaiInfo.mauNen, color: loaiInfo.mauChu }}>
              {loaiInfo.nhan}
            </span>

            {/* Tiêu đề */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {tin.tieuDe}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>📅 {formatNgay(tin.ngayDang)}</span>
              <span>👁 {tin.luotXem || 0} lượt đọc</span>
              {tin.nguoiDang?.hoTen && (
                <span>✍️ {tin.nguoiDang.hoTen}</span>
              )}
              {tin.tenFileWord && (
                <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#f0f6ff', color: '#0066CC' }}>
                  📄 {tin.tenFileWord}
                </span>
              )}
            </div>

            {/* Tóm tắt */}
            {tin.tomTat && (
              <div className="mt-5 p-4 rounded-xl border-l-4 text-sm text-gray-600 italic leading-relaxed"
                style={{ backgroundColor: '#f0f6ff', borderLeftColor: '#F47920' }}>
                {tin.tomTat}
              </div>
            )}
          </div>

          {/* Nội dung HTML từ file Word */}
          <div className="p-8">
            <div
              className="noi-dung-bai-viet prose max-w-none"
              dangerouslySetInnerHTML={{ __html: tin.noiDungHtml }}
            />
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t flex items-center justify-between flex-wrap gap-3"
            style={{ borderColor: '#e6f0ff', backgroundColor: '#f8faff' }}>
            <Link href="/tintuc"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#0066CC' }}>
              ← Quay lại danh sách tin tức
            </Link>
            <span className="text-xs text-gray-400">
              Cập nhật: {formatNgay(tin.ngayCapNhat)}
            </span>
          </div>
        </article>
      </main>

      <ChanTrang />
    </div>
  )
}