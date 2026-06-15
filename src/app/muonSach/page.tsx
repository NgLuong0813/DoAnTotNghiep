'use client'
/**
 * TRANG — Sinh Viên Xem Sách Đang Mượn & Lịch Sử
 * Đường dẫn: src/app/muonSach/page.tsx
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

const TRANG_THAI_CONFIG: Record<string, { nhan: string; mau: string }> = {
  choDuyet: { nhan: '⏳ Chờ duyệt',  mau: 'bg-yellow-100 text-yellow-700' },
  dangMuon: { nhan: '📖 Đang mượn',  mau: 'bg-blue-100 text-blue-700' },
  daTra:    { nhan: '✅ Đã trả',      mau: 'bg-green-100 text-green-700' },
  quaHan:   { nhan: '⚠️ Quá hạn',    mau: 'bg-red-100 text-red-700' },
  tuChoi:   { nhan: '❌ Từ chối',     mau: 'bg-gray-100 text-gray-600' },
}

export default function TrangMuonSach() {
  const { data: phien, status } = useSession()
  const nguoiDung = phien?.user as any
  const router    = useRouter()

  const [danhSach,  setDanhSach]  = useState<any[]>([])
  const [dangTai,   setDangTai]   = useState(true)
  const [tab,       setTab]       = useState<'dangMuon' | 'lichSu'>('dangMuon')
  const [thongBao,  setThongBao]  = useState({ loai: '', noi: '' })
  const [dangXuLy,  setDangXuLy]  = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    async function taiDuLieu() {
      setDangTai(true)
      const trangThai = tab === 'dangMuon' ? 'choDuyet,dangMuon' : 'daTra,tuChoi'
      const res  = await fetch(`/api/muontra?gioiHan=20`)
      const json = await res.json()
      if (json.thanhCong) {
        if (tab === 'dangMuon') {
          setDanhSach(json.duLieu.danhSach.filter((p: any) => ['choDuyet', 'dangMuon'].includes(p.trangThai)))
        } else {
          setDanhSach(json.duLieu.danhSach.filter((p: any) => ['daTra', 'tuChoi'].includes(p.trangThai)))
        }
      }
      setDangTai(false)
    }
    taiDuLieu()
  }, [status, tab])

  useEffect(() => {
    if (thongBao.noi) { const t = setTimeout(() => setThongBao({ loai: '', noi: '' }), 3000); return () => clearTimeout(t) }
  }, [thongBao])

  const giaHan = async (id: string) => {
    setDangXuLy(id)
    const res  = await fetch(`/api/muontra/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hanhDong: 'giaHan' }),
    })
    const json = await res.json()
    setDangXuLy('')
    if (json.thanhCong) {
      setThongBao({ loai: 'ok', noi: 'Gia hạn thành công! Hạn trả mới được cộng thêm 7 ngày.' })
      setDanhSach(ds => ds.map(p => p._id === id ? { ...p, ...json.duLieu } : p))
    } else {
      setThongBao({ loai: 'loi', noi: json.thongBao })
    }
  }

  const formatNgay = (ngay: string) => ngay ? new Date(ngay).toLocaleDateString('vi-VN') : '—'
  const soNgayCon  = (ngayHan: string) => {
    const con = Math.ceil((new Date(ngayHan).getTime() - Date.now()) / 86400000)
    return con
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <ThanhDieuHuong />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">📚 Quản lý mượn sách</h1>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${thongBao.loai === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {thongBao.loai === 'ok' ? '✅' : '⚠️'} {thongBao.noi}
          </div>
        )}

        {/* Thông tin thẻ */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80 mb-1">Thẻ thư viện</div>
            <div className="text-2xl font-bold font-mono">{nguoiDung?.soThe}</div>
            <div className="text-sm mt-1">{nguoiDung?.name}</div>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${nguoiDung?.trangThaiThe === 'hoatDong' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'}`}>
              {nguoiDung?.trangThaiThe === 'hoatDong' ? '● Hoạt động' : '○ Chờ kích hoạt'}
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('dangMuon')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'dangMuon' ? 'bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            📖 Đang mượn
          </button>
          <button onClick={() => setTab('lichSu')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'lichSu' ? 'bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            📋 Lịch sử
          </button>
        </div>

        {/* Danh sách phiếu mượn */}
        {dangTai ? (
          <div className="py-20 text-center text-gray-400">⏳ Đang tải...</div>
        ) : danhSach.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">
              {tab === 'dangMuon' ? 'Bạn chưa có sách nào đang mượn' : 'Chưa có lịch sử mượn trả'}
            </p>
            <Link href="/sach" className="mt-4 inline-block px-6 py-2.5 bg-red-700 text-white text-sm rounded-xl hover:bg-red-800">
              Khám phá sách ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {danhSach.map((phieu) => {
              const ttInfo  = TRANG_THAI_CONFIG[phieu.trangThai] || TRANG_THAI_CONFIG.choDuyet
              const ngayCon = phieu.trangThai === 'dangMuon' ? soNgayCon(phieu.ngayHanTra) : null
              const quaHan  = ngayCon !== null && ngayCon < 0

              return (
                <div key={phieu._id} className={`bg-white rounded-xl border p-5 flex gap-4 ${quaHan ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                  {/* Ảnh bìa */}
                  <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0">
                    <span className="text-3xl">📘</span>
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                        {phieu.sach?.tenSach}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${ttInfo.mau}`}>
                        {ttInfo.nhan}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{phieu.sach?.tacGia} · {phieu.sach?.danhMuc}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Ngày mượn</div>
                        <div className="font-medium text-gray-700">{formatNgay(phieu.ngayMuon)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Hạn trả</div>
                        <div className={`font-medium ${quaHan ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatNgay(phieu.ngayHanTra)}
                        </div>
                      </div>
                      {ngayCon !== null && (
                        <div>
                          <div className="text-gray-400">Còn lại</div>
                          <div className={`font-bold ${quaHan ? 'text-red-600' : ngayCon <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {quaHan ? `Trễ ${Math.abs(ngayCon)} ngày` : `${ngayCon} ngày`}
                          </div>
                        </div>
                      )}
                      {phieu.soLanGiaHan > 0 && (
                        <div>
                          <div className="text-gray-400">Đã gia hạn</div>
                          <div className="font-medium text-gray-700">{phieu.soLanGiaHan}/2 lần</div>
                        </div>
                      )}
                      {phieu.tienPhat > 0 && (
                        <div>
                          <div className="text-gray-400">Tiền phạt</div>
                          <div className="font-bold text-red-600">{phieu.tienPhat.toLocaleString()}đ</div>
                        </div>
                      )}
                    </div>

                    {/* Nút gia hạn */}
                    {phieu.trangThai === 'dangMuon' && phieu.soLanGiaHan < 2 && (
                      <button
                        disabled={dangXuLy === phieu._id}
                        onClick={() => giaHan(phieu._id)}
                        className="mt-3 px-4 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50">
                        {dangXuLy === phieu._id ? '⏳ Đang gia hạn...' : '🔄 Gia hạn thêm 7 ngày'}
                      </button>
                    )}

                    {phieu.ghiChu && (
                      <div className="mt-2 text-xs text-gray-500 italic">Ghi chú: {phieu.ghiChu}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <ChanTrang />
    </div>
  )
}
