'use client'
/**
 * TRANG — Danh Sách Sách
 * Đường dẫn: src/app/sach/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

export default function TrangDanhSachSach() {
  const searchParams = useSearchParams()

  const [danhSach,  setDanhSach]  = useState<any[]>([])
  const [phanTrang, setPhanTrang] = useState({ tongSo: 0, tongTrang: 1 })
  const [dangTai,   setDangTai]   = useState(true)
  const [tuKhoa,    setTuKhoa]    = useState(searchParams.get('tuKhoa') || '')
  const [danhMuc,   setDanhMuc]   = useState(searchParams.get('danhMuc') || '')
  const [trangThai, setTrangThai] = useState('')
  const [trang,     setTrang]     = useState(1)

  // ✅ Load danh mục từ DB
  const [dsDanhMuc, setDsDanhMuc] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/danhMuc')
      .then(r => r.json())
      .then(j => {
        if (j.thanhCong && j.duLieu?.length > 0) {
          setDsDanhMuc(
            j.duLieu
              .filter((d: any) => d.hoatDong !== false)
              .sort((a: any, b: any) => a.ten.localeCompare(b.ten, 'vi'))
              .map((d: any) => d.ten)
          )
        }
      })
      .catch(() => {})
  }, [])

  const taiSach = useCallback(async () => {
    setDangTai(true)
    const params = new URLSearchParams({
      trang: String(trang), gioiHan: '12',
      ...(tuKhoa    && { tuKhoa }),
      ...(danhMuc   && { danhMuc }),
      ...(trangThai && { trangThai }),
    })
    const res  = await fetch(`/api/sach?${params}`)
    const json = await res.json()
    if (json.thanhCong) {
      setDanhSach(json.duLieu.danhSachSach)
      setPhanTrang({ tongSo: json.duLieu.tongSo, tongTrang: json.duLieu.tongTrang })
    }
    setDangTai(false)
  }, [trang, tuKhoa, danhMuc, trangThai])

  useEffect(() => { taiSach() }, [taiSach])

  return (
    <div className="min-h-screen flex flex-col">
      <ThanhDieuHuong />

      {/* Banner */}
      <div className="text-white py-10 px-4" style={{ background: 'linear-gradient(135deg, #002952, #0066CC)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📚 Danh mục sách</h1>
          <p className="text-blue-200 text-sm">Tra cứu và tìm kiếm trong kho sách của thư viện UTT</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Thanh tìm kiếm */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
          <div className="flex flex-1 min-w-[240px] border border-gray-200 rounded-lg overflow-hidden">
            <input
              value={tuKhoa}
              onChange={(e) => { setTuKhoa(e.target.value); setTrang(1) }}
              placeholder="🔍 Tìm tên sách, tác giả, ISBN..."
              className="flex-1 px-4 py-2.5 text-sm outline-none"
            />
            {tuKhoa && (
              <button onClick={() => { setTuKhoa(''); setTrang(1) }}
                className="px-3 text-gray-400 hover:text-red-500">✕</button>
            )}
          </div>

          {/* ✅ Dropdown danh mục load từ DB */}
          <select
            value={danhMuc}
            onChange={(e) => { setDanhMuc(e.target.value); setTrang(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-w-[180px]">
            <option value="">Tất cả danh mục</option>
            {dsDanhMuc.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={trangThai} onChange={(e) => { setTrangThai(e.target.value); setTrang(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="choMuon">Còn sách</option>
            <option value="hetSach">Hết sách</option>
          </select>

          {(tuKhoa || danhMuc || trangThai) && (
            <button onClick={() => { setTuKhoa(''); setDanhMuc(''); setTrangThai(''); setTrang(1) }}
              className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              ✕ Xóa lọc
            </button>
          )}
          <span className="ml-auto self-center text-xs text-gray-400">
            Tổng: <strong className="text-gray-700">{phanTrang.tongSo}</strong> cuốn
          </span>
        </div>

        {/* Lưới sách */}
        {dangTai ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : danhSach.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">Không tìm thấy sách phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {danhSach.map((sach: any) => (
              <Link key={sach._id} href={`/sach/${sach._id}`}>
                <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group overflow-hidden h-full flex flex-col">
                  <div className="h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                    {sach.anhBia
                      ? <img src={sach.anhBia} alt={sach.tenSach} className="h-full w-full object-cover" />
                      : <span className="text-5xl">📘</span>
                    }
                    <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      sach.soBanConLai > 0 ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {sach.soBanConLai > 0 ? `Còn ${sach.soBanConLai}` : 'Hết'}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-[10px] font-medium mb-1" style={{ color: '#0066CC' }}>{sach.danhMuc}</div>
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug flex-1">
                      {sach.tenSach}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{sach.tacGia}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {phanTrang.tongTrang > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button disabled={trang <= 1} onClick={() => setTrang(t => t - 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Trước
            </button>
            {[...Array(Math.min(phanTrang.tongTrang, 10))].map((_, i) => (
              <button key={i} onClick={() => setTrang(i + 1)}
                className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                  trang === i + 1
                    ? 'text-white border-blue-600'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                style={trang === i + 1 ? { backgroundColor: '#0066CC' } : {}}>
                {i + 1}
              </button>
            ))}
            <button disabled={trang >= phanTrang.tongTrang} onClick={() => setTrang(t => t + 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Sau →
            </button>
          </div>
        )}
      </main>
      <ChanTrang />
    </div>
  )
}
