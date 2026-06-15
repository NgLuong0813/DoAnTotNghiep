'use client'
/**
 * TRANG — Quản Lý Danh Mục Sách
 * Đường dẫn: src/app/admin/danhMuc/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

export default function TrangDanhMuc() {
  const { data: phien, status } = useSession()
  const nd     = phien?.user as any
  const router = useRouter()

  const [danhSach, setDanhSach] = useState<any[]>([])
  const [dangTai,  setDangTai]  = useState(true)
  const [thongBao, setThongBao] = useState({ loai: '', noi: '' })
  const [tuKhoa,   setTuKhoa]   = useState('')

  // Form thêm/sửa
  const [hienForm, setHienForm] = useState(false)
  const [dmSua,    setDmSua]    = useState<any>(null)
  const [dangLuu,  setDangLuu]  = useState(false)
  const [formTen,  setFormTen]  = useState('')
  const [formMoTa, setFormMoTa] = useState('')

  // Xác nhận xóa
  const [dmXoa,   setDmXoa]   = useState<any>(null)
  const [dangXoa, setDangXoa] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nd?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nd, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const res  = await fetch('/api/danhMuc')
    const json = await res.json()
    if (json.thanhCong) setDanhSach(json.duLieu || [])
    setDangTai(false)
  }, [])

  useEffect(() => { if (status === 'authenticated') taiDuLieu() }, [taiDuLieu, status])

  useEffect(() => {
    if (thongBao.noi) {
      const t = setTimeout(() => setThongBao({ loai: '', noi: '' }), 5000)
      return () => clearTimeout(t)
    }
  }, [thongBao])

  const moFormThem = () => {
    setDmSua(null); setFormTen(''); setFormMoTa('')
    setHienForm(true)
  }

  const moFormSua = (dm: any) => {
    setDmSua(dm); setFormTen(dm.ten); setFormMoTa(dm.moTa || '')
    setHienForm(true)
  }

  const luuDanhMuc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTen.trim()) return
    setDangLuu(true)
    const url    = dmSua ? `/api/danhMuc/${dmSua._id}` : '/api/danhMuc'
    const method = dmSua ? 'PUT' : 'POST'
    const res    = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten: formTen, moTa: formMoTa }),
    })
    const json = await res.json()
    setDangLuu(false)
    if (json.thanhCong) {
      setThongBao({ loai: 'ok', noi: dmSua ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!' })
      setHienForm(false); taiDuLieu()
    } else setThongBao({ loai: 'loi', noi: json.thongBao })
  }

  const doiHoatDong = async (dm: any) => {
    const res = await fetch(`/api/danhMuc/${dm._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoatDong: !dm.hoatDong }),
    })
    const json = await res.json()
    if (json.thanhCong) taiDuLieu()
  }

  const xoaDanhMuc = async () => {
    if (!dmXoa) return
    setDangXoa(true)
    const res  = await fetch(`/api/danhMuc/${dmXoa._id}`, { method: 'DELETE' })
    const json = await res.json()
    setDangXoa(false)
    if (json.thanhCong) {
      setThongBao({ loai: 'ok', noi: 'Đã xóa danh mục!' })
      setDmXoa(null); taiDuLieu()
    } else {
      setThongBao({ loai: 'loi', noi: json.thongBao })
      setDmXoa(null)
    }
  }

  const danhSachLoc = danhSach.filter(dm =>
    !tuKhoa || dm.ten.toLowerCase().includes(tuKhoa.toLowerCase()) || dm.moTa?.toLowerCase().includes(tuKhoa.toLowerCase())
  )

  const tongSach = danhSach.reduce((s, dm) => s + (dm.soSach || 0), 0)

  const ic = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin trangHienTai="/admin/danhMuc" tenNguoiDung={nd?.name} />

      <div className="flex-1 p-6 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🗂️ Quản lý danh mục</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              <strong>{danhSach.length}</strong> danh mục · <strong>{tongSach}</strong> đầu sách
            </p>
          </div>
          <button onClick={moFormThem}
            className="px-4 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ backgroundColor: '#0066CC' }}>
            + Thêm danh mục
          </button>
        </div>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            thongBao.loai === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {thongBao.loai === 'ok' ? '✅' : '⚠️'} {thongBao.noi}
          </div>
        )}

        {/* Tìm kiếm */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
            placeholder="🔍 Tìm theo tên danh mục, mô tả..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        </div>

        {/* Bảng */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? (
            <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          ) : danhSachLoc.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="text-sm">Không tìm thấy danh mục nào</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">STT</th>
                  <th className="px-4 py-3 text-left">Tên danh mục</th>
                  <th className="px-4 py-3 text-left">Mô tả</th>
                  <th className="px-4 py-3 text-center">Số sách</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {danhSachLoc.map((dm, i) => (
                  <tr key={dm._id} className={`hover:bg-gray-50 ${!dm.hoatDong ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ backgroundColor: '#e6f0ff', color: '#0066CC' }}>
                          {dm.ten[0]}
                        </div>
                        <span className="font-medium text-gray-800">{dm.ten}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">
                      {dm.moTa || <span className="text-gray-300">—</span>}
                    </td>

                    {/* ✅ Cột số sách */}
                    <td className="px-4 py-3 text-center">
                      {dm.soSach > 0 ? (
                        <Link href={`/admin/sach?danhMuc=${encodeURIComponent(dm.ten)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          📚 {dm.soSach} cuốn
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-300">0 cuốn</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button onClick={() => doiHoatDong(dm)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          dm.hoatDong
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        {dm.hoatDong ? '✅ Hoạt động' : '⏸️ Tắt'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={() => moFormSua(dm)}
                          className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100">
                          ✏️ Sửa
                        </button>
                        {nd?.vaiTro === 'admin' && (
                          <button onClick={() => setDmXoa(dm)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
                            🗑 Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL THÊM/SỬA */}
      {hienForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{dmSua ? '✏️ Sửa danh mục' : '➕ Thêm danh mục'}</h2>
              <button onClick={() => setHienForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={luuDanhMuc} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên danh mục *</label>
                <input required value={formTen} onChange={e => setFormTen(e.target.value)}
                  placeholder="VD: Công nghệ thông tin" className={ic} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
                <textarea rows={3} value={formMoTa} onChange={e => setFormMoTa(e.target.value)}
                  placeholder="Mô tả ngắn về danh mục..." className={ic + ' resize-none'} />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setHienForm(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangLuu || !formTen.trim()}
                  className="flex-1 py-2.5 text-sm text-white rounded-xl disabled:opacity-60"
                  style={{ backgroundColor: '#0066CC' }}>
                  {dangLuu ? '⏳ Đang lưu...' : dmSua ? '💾 Cập nhật' : '➕ Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {dmXoa && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xóa danh mục?</h3>
            <p className="text-sm text-gray-600 mb-1">Bạn có chắc muốn xóa <strong>"{dmXoa.ten}"</strong>?</p>
            {dmXoa.soSach > 0 && (
              <p className="text-xs text-red-500 mb-3">⚠️ Danh mục này đang có <strong>{dmXoa.soSach} cuốn sách</strong> — không thể xóa!</p>
            )}
            {!dmXoa.soSach && <p className="text-xs text-gray-400 mb-3">Danh mục chưa có sách nào.</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDmXoa(null)}
                className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
              <button onClick={xoaDanhMuc} disabled={dangXoa || dmXoa.soSach > 0}
                className="flex-1 py-2.5 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40">
                {dangXoa ? '⏳...' : '🗑 Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
