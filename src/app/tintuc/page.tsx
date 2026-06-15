'use client'
/**
 * TRANG — Tin Tức & Thông Báo
 * Đường dẫn: src/app/tintuc/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

const LOAI_TIN = [
  { key: '',         nhan: 'Tất cả',    mau: 'bg-gray-100 text-gray-700' },
  { key: 'tinTuc',   nhan: '📰 Tin tức',   mau: 'bg-blue-100 text-blue-700' },
  { key: 'thongBao', nhan: '📢 Thông báo', mau: 'bg-red-100 text-red-700' },
  { key: 'suKien',   nhan: '🎉 Sự kiện',   mau: 'bg-green-100 text-green-700' },
  { key: 'noiQuy',   nhan: '📋 Nội quy',   mau: 'bg-yellow-100 text-yellow-700' },
]

export default function TrangTinTuc() {
  const searchParams = useSearchParams()

  const [danhSach,  setDanhSach]  = useState<any[]>([])
  const [phanTrang, setPhanTrang] = useState({ tongSo: 0, tongTrang: 1 })
  const [dangTai,   setDangTai]   = useState(true)
  const [loai,      setLoai]      = useState(searchParams.get('loai') || '')
  const [trang,     setTrang]     = useState(1)

  const taiTin = useCallback(async () => {
    setDangTai(true)
    const params = new URLSearchParams({ trang: String(trang), gioiHan: '9', ...(loai && { loai }) })
    const res  = await fetch(`/api/tintuc?${params}`)
    const json = await res.json()
    if (json.thanhCong) {
      setDanhSach(json.duLieu.danhSach)
      setPhanTrang({ tongSo: json.duLieu.tongSo, tongTrang: json.duLieu.tongTrang })
    }
    setDangTai(false)
  }, [trang, loai])

  useEffect(() => { taiTin() }, [taiTin])

  const formatNgay = (ngay: string) => ngay
    ? new Date(ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="min-h-screen flex flex-col">
      <ThanhDieuHuong />

      {/* Banner */}
      <div className="text-white py-10 px-4" style={{ background: 'linear-gradient(135deg, #002952, #0066CC)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📰 Tin tức & Thông báo</h1>
          <p className="text-red-200 text-sm">Cập nhật thông tin mới nhất từ Thư viện UTT</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Lọc loại */}
        <div className="flex flex-wrap gap-2 mb-7">
          {LOAI_TIN.map((l) => (
            <button key={l.key}
              onClick={() => { setLoai(l.key); setTrang(1) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${loai === l.key ? 'bg-red-700 text-white border-red-700' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'}`}>
              {l.nhan}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-gray-400">
            {phanTrang.tongSo} bài viết
          </span>
        </div>

        {/* Danh sách tin */}
        {dangTai ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : danhSach.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {danhSach.map((tin: any) => {
              const loaiInfo = LOAI_TIN.find(l => l.key === tin.loai) || LOAI_TIN[1]
              return (
                <Link key={tin._id} href={`/tintuc/${tin.duongDan}`}>
                  <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group h-full flex flex-col overflow-hidden">
                    {/* Thumbnail */}
                    <div className="h-44 bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center relative overflow-hidden">
                      {tin.anhDaiDien
                        ? <img src={tin.anhDaiDien} alt={tin.tieuDe} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <span className="text-5xl opacity-50">📰</span>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium ${loaiInfo.mau}`}>
                        {loaiInfo.nhan}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 transition-colors text-sm leading-snug mb-2 flex-1">
                        {tin.tieuDe}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{tin.tomTat}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>📅 {formatNgay(tin.ngayDang)}</span>
                        <span>👁 {tin.luotXem}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Phân trang */}
        {phanTrang.tongTrang > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button disabled={trang <= 1} onClick={() => setTrang(t => t - 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Trước</button>
            <span className="text-sm text-gray-600">Trang <strong>{trang}</strong> / {phanTrang.tongTrang}</span>
            <button disabled={trang >= phanTrang.tongTrang} onClick={() => setTrang(t => t + 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Sau →</button>
          </div>
        )}
      </main>
      <ChanTrang />
    </div>
  )
}
