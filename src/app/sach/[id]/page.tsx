'use client'
/**
 * TRANG — Chi Tiết Sách
 * Đường dẫn: src/app/sach/[id]/page.tsx
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

export default function TrangChiTietSach() {
  const { data: phien } = useSession()
  const nguoiDung = phien?.user as any
  const params    = useParams()
  const router    = useRouter()

  const [sach,        setSach]        = useState<any>(null)
  const [dangTai,     setDangTai]     = useState(true)
  const [dangMuon,    setDangMuon]    = useState(false)
  const [anhDangXem,  setAnhDangXem]  = useState(0)
  const [thongBao,    setThongBao]    = useState({ loai: '', noi: '' })

  // Tải thông tin sách
  useEffect(() => {
    async function taiSach() {
      try {
        const res  = await fetch(`/api/sach/${params.id}`)
        const json = await res.json()
        if (json.thanhCong) {
          setSach(json.duLieu)
        } else {
          router.replace('/sach')
        }
      } catch {
        router.replace('/sach')
      } finally {
        setDangTai(false)
      }
    }
    if (params.id) taiSach()
  }, [params.id, router])

  // Thông báo tự ẩn
  useEffect(() => {
    if (thongBao.noi) {
      const t = setTimeout(() => setThongBao({ loai: '', noi: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [thongBao])

  // Gửi yêu cầu mượn sách
  const guiYeuCauMuon = async () => {
    if (!phien) {
      router.push('/auth/dangnhap')
      return
    }
    if (nguoiDung?.trangThaiThe !== 'hoatDong') {
      setThongBao({ loai: 'loi', noi: 'Thẻ thư viện của bạn chưa được kích hoạt. Vui lòng liên hệ thủ thư.' })
      return
    }

    setDangMuon(true)
    try {
      const res  = await fetch('/api/muontra', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sachId: params.id }),
      })
      const json = await res.json()
      if (json.thanhCong) {
        setThongBao({ loai: 'ok', noi: '✅ Gửi yêu cầu mượn thành công! Thủ thư sẽ duyệt trong thời gian sớm nhất.' })
      } else {
        setThongBao({ loai: 'loi', noi: json.thongBao })
      }
    } catch {
      setThongBao({ loai: 'loi', noi: 'Có lỗi xảy ra, vui lòng thử lại.' })
    } finally {
      setDangMuon(false)
    }
  }

  // ── Màn hình tải ─────────────────────────────────────────
  if (dangTai) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3 animate-bounce">📚</div>
          <div className="text-sm">Đang tải thông tin sách...</div>
        </div>
      </div>
    </div>
  )

  if (!sach) return null

  // Danh sách ảnh (ưu tiên danhSachAnh, fallback về anhBia)
  const danhSachAnh: string[] = sach.danhSachAnh?.length > 0
    ? sach.danhSachAnh
    : sach.anhBia ? [sach.anhBia] : []

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:underline" style={{ color: '#0066CC' }}>Trang chủ</Link>
          <span>›</span>
          <Link href="/sach" className="hover:underline" style={{ color: '#0066CC' }}>Danh mục sách</Link>
          <span>›</span>
          <span className="text-gray-700 truncate max-w-[200px]">{sach.tenSach}</span>
        </div>

        {/* Thông báo */}
        {thongBao.noi && (
          <div className={`mb-5 px-4 py-3 rounded-xl text-sm border ${
            thongBao.loai === 'ok'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {thongBao.noi}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Cột trái — Ảnh + Nút mượn */}
          <div className="md:col-span-1">

            {/* Ảnh chính */}
            <div className="bg-white rounded-2xl overflow-hidden border border-blue-100 shadow-sm mb-3">
              <div className="aspect-[3/4] flex items-center justify-center"
                style={{ backgroundColor: '#e6f0ff' }}>
                {danhSachAnh.length > 0 ? (
                  <img
                    src={danhSachAnh[anhDangXem]}
                    alt={sach.tenSach}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">📘</span>
                )}
              </div>
            </div>

            {/* Thumbnail nhiều ảnh */}
            {danhSachAnh.length > 1 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {danhSachAnh.map((url, idx) => (
                  <button key={idx} onClick={() => setAnhDangXem(idx)}
                    className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      anhDangXem === idx ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-blue-300'
                    }`}>
                    <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trạng thái sách */}
            <div className={`text-center py-2.5 rounded-xl text-sm font-semibold mb-4 ${
              sach.soBanConLai > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {sach.soBanConLai > 0
                ? `✅ Còn ${sach.soBanConLai}/${sach.tongSoBan} bản`
                : `❌ Hết sách (${sach.tongSoBan} bản)`
              }
            </div>

            {/* Nút mượn sách */}
            {sach.soBanConLai > 0 ? (
              phien ? (
                <button
                  onClick={guiYeuCauMuon}
                  disabled={dangMuon}
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#0066CC' }}
                  onMouseEnter={e => !dangMuon && (e.currentTarget.style.backgroundColor = '#004d99')}
                  onMouseLeave={e => !dangMuon && (e.currentTarget.style.backgroundColor = '#0066CC')}
                >
                  {dangMuon ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Đang gửi yêu cầu...
                    </>
                  ) : '📚 Gửi yêu cầu mượn sách'}
                </button>
              ) : (
                <Link href="/auth/dangnhap"
                  className="block w-full text-center text-white font-semibold py-3.5 rounded-xl text-sm"
                  style={{ backgroundColor: '#0066CC' }}>
                  🔐 Đăng nhập để mượn sách
                </Link>
              )
            ) : (
              <button disabled
                className="w-full bg-gray-200 text-gray-500 font-semibold py-3.5 rounded-xl text-sm cursor-not-allowed">
                Hết sách — Không thể mượn
              </button>
            )}

            {/* Quy định mượn nhanh */}
            <div className="mt-4 p-3 rounded-xl text-xs text-gray-500 space-y-1 border"
              style={{ backgroundColor: '#e6f0ff', borderColor: '#99c2ff' }}>
              <div>⏰ Thời hạn mượn: <strong>14 ngày</strong></div>
              <div>🔄 Gia hạn tối đa: <strong>2 lần</strong> (+7 ngày/lần)</div>
              <div>💰 Phạt trễ hạn: <strong>2.000đ/ngày</strong></div>
            </div>

            {/* Thống kê */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-3 text-center border border-blue-100">
                <div className="text-lg font-bold" style={{ color: '#0066CC' }}>{sach.luotXem || 0}</div>
                <div className="text-xs text-gray-500">Lượt xem</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-blue-100">
                <div className="text-lg font-bold" style={{ color: '#F47920' }}>{sach.luotMuon || 0}</div>
                <div className="text-xs text-gray-500">Lượt mượn</div>
              </div>
            </div>
          </div>

          {/* Cột phải — Thông tin chi tiết */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-5">

              {/* Danh mục + tên sách */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{ backgroundColor: '#e6f0ff', color: '#0052a3' }}>
                {sach.danhMuc}
              </span>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {sach.tenSach}
              </h1>
              <p className="text-gray-600 mb-6">✍️ {sach.tacGia}</p>

              {/* Thông tin chi tiết */}
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#f0f6ff' }}>
                <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide" style={{ color: '#0066CC' }}>
                  Thông tin sách
                </h3>
                <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                  {[
                    ['Nhà xuất bản',  sach.nhaXuatBan   || '—'],
                    ['Năm xuất bản',  sach.namXuatBan    || '—'],
                    ['Số trang',      sach.soTrang ? `${sach.soTrang} trang` : '—'],
                    ['Ngôn ngữ',      sach.ngonNgu       || '—'],
                    ['Mã ISBN',       sach.maSach        || '—'],
                    ['Vị trí kệ',    sach.viTriKe       || '—'],
                    ['Ký hiệu',       sach.kyHieuPhanLoai || '—'],
                    ['Tái bản',       sach.lanTaiBan     || '—'],
                  ].map(([nhan, gtri]) => (
                    <div key={nhan} className="flex gap-2">
                      <span className="text-gray-500 w-28 shrink-0 text-xs">{nhan}:</span>
                      <span className="font-medium text-gray-800 text-xs">{gtri}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mô tả */}
              {sach.moTa && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 uppercase tracking-wide" style={{ color: '#0066CC' }}>
                    Mô tả
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{sach.moTa}</p>
                </div>
              )}
            </div>

            {/* Nút quay lại */}
            <Link href="/sach"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#0066CC' }}>
              ← Quay lại danh mục sách
            </Link>
          </div>
        </div>
      </main>

      <ChanTrang />
    </div>
  )
}