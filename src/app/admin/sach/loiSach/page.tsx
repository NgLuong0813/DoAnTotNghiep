'use client'
/**
 * TRANG — Danh Sách Sách Lỗi / Hỏng
 * Đường dẫn: src/app/admin/sach/loiSach/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

const LOAI_LOI_LABEL: Record<string, { nhan: string; mau: string; icon: string }> = {
  doSinhVien: { nhan: 'Do sinh viên',   mau: 'bg-red-100 text-red-700',       icon: '👤' },
  amUot:      { nhan: 'Ẩm ướt / nước', mau: 'bg-blue-100 text-blue-700',     icon: '💧' },
  cuRach:     { nhan: 'Cũ, rách',       mau: 'bg-yellow-100 text-yellow-700', icon: '📄' },
  vietChuLen: { nhan: 'Viết chữ lên',   mau: 'bg-purple-100 text-purple-700', icon: '✏️' },
  banChu:     { nhan: 'Chữ bẩn / mờ',  mau: 'bg-orange-100 text-orange-700', icon: '🖊️' },
  khac:       { nhan: 'Lý do khác',     mau: 'bg-gray-100 text-gray-600',     icon: '❓' },
}

export default function TrangLoiSach() {
  const { data: phien, status } = useSession()
  const nd     = phien?.user as any
  const router = useRouter()

  const [danhSach,  setDanhSach]  = useState<any[]>([])
  const [tongSo,    setTongSo]    = useState(0)
  const [tongTrang, setTongTrang] = useState(1)
  const [thongKe,   setThongKe]   = useState<any[]>([])
  const [dangTai,   setDangTai]   = useState(true)
  const [trang,     setTrang]     = useState(1)
  const [tuKhoa,    setTuKhoa]    = useState('')
  const [locLoai,   setLocLoai]   = useState('')
  const [tuNgay,    setTuNgay]    = useState('')
  const [denNgay,   setDenNgay]   = useState('')
  const [bcChon,    setBcChon]    = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nd?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nd, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const p = new URLSearchParams({ trang: String(trang), gioiHan: '15' })
    if (tuKhoa)  p.set('tuKhoa',  tuKhoa)
    if (locLoai) p.set('loaiLoi', locLoai)
    if (tuNgay)  p.set('tuNgay',  tuNgay)
    if (denNgay) p.set('denNgay', denNgay)
    const res  = await fetch(`/api/baoCaoLoi?${p}`)
    const json = await res.json()
    if (json.thanhCong) {
      setDanhSach(json.duLieu.danhSach || [])
      setTongSo(json.duLieu.tongSo || 0)
      setTongTrang(json.duLieu.tongTrang || 1)
      setThongKe(json.duLieu.thongKe || [])
    }
    setDangTai(false)
  }, [trang, tuKhoa, locLoai, tuNgay, denNgay])

  useEffect(() => { if (status === 'authenticated') taiDuLieu() }, [taiDuLieu, status])

  const fNgay = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
  const fNgayGio = (d: string) => d ? new Date(d).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
  const tongSachLoi = thongKe.reduce((s, t) => s + t.tongSoLuong, 0)

  const MENU = [
    { icon:'📊', nhan:'Tổng quan',   href:'/admin' },
    { icon:'📚', nhan:'Quản lý sách', href:'/admin/sach' },
    { icon:'🚨', nhan:'Sách lỗi',     href:'/admin/sach/loiSach', active:true },
    { icon:'👥', nhan:'Người dùng',   href:'/admin/nguoidung' },
    { icon:'📋', nhan:'Mượn / Trả',   href:'/admin/muontra' },
    { icon:'📰', nhan:'Tin tức',       href:'/admin/tintuc' },
    { icon:'💬', nhan:'Tin nhắn',      href:'/admin/tinnhan' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin trangHienTai="/admin/sach/loiSach" tenNguoiDung={nd?.name} />

      <div className="flex-1 p-6 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="mb-1"><Link href="/admin/sach" className="text-sm text-gray-400 hover:text-gray-600">← Quản lý sách</Link></div>
            <h1 className="text-2xl font-bold text-gray-800">🚨 Sách lỗi / hỏng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng: <strong>{tongSo}</strong> lần báo cáo · <strong className="text-red-600 ml-1">{tongSachLoi}</strong> quyển bị lỗi
            </p>
          </div>
          <Link href="/admin/sach" className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">
            📚 Về danh sách sách
          </Link>
        </div>

        {/* Thống kê */}
        {thongKe.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Object.entries(LOAI_LOI_LABEL).map(([key, cfg]) => {
              const tk = thongKe.find(t => t._id === key)
              return (
                <button key={key} onClick={() => { setLocLoai(locLoai===key?'':key); setTrang(1) }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${locLoai===key?'border-red-400 bg-red-50':'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="text-xl mb-1">{cfg.icon}</div>
                  <div className="text-lg font-bold text-gray-800">{tk?.tongSoLuong||0}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{cfg.nhan}</div>
                  {tk && <div className="text-[10px] text-gray-400">{tk.soLanBaoCao} lần</div>}
                </button>
              )
            })}
          </div>
        )}

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Tìm sách</p>
            <input value={tuKhoa} onChange={e=>{setTuKhoa(e.target.value);setTrang(1)}}
              placeholder="🔍 Tên sách, tác giả..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400 w-48"/>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Loại lỗi</p>
            <select value={locLoai} onChange={e=>{setLocLoai(e.target.value);setTrang(1)}}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400">
              <option value="">Tất cả loại lỗi</option>
              {Object.entries(LOAI_LOI_LABEL).map(([k,v])=>(
                <option key={k} value={k}>{v.icon} {v.nhan}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Từ ngày</p>
            <input type="date" value={tuNgay} onChange={e=>{setTuNgay(e.target.value);setTrang(1)}}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400"/>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Đến ngày</p>
            <input type="date" value={denNgay} onChange={e=>{setDenNgay(e.target.value);setTrang(1)}}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400"/>
          </div>
          {(tuKhoa||locLoai||tuNgay||denNgay) && (
            <button onClick={()=>{setTuKhoa('');setLocLoai('');setTuNgay('');setDenNgay('');setTrang(1)}}
              className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 self-end">
              ✕ Xóa lọc
            </button>
          )}
        </div>

        {/* Bảng */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? (
            <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          ) : danhSach.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-sm">Không có báo cáo lỗi nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Sách</th>
                    <th className="px-4 py-3 text-center">Số lượng lỗi</th>
                    <th className="px-4 py-3 text-center">Loại lỗi</th>
                    <th className="px-4 py-3 text-left">Sinh viên vi phạm</th>
                    <th className="px-4 py-3 text-left">Người báo cáo</th>
                    <th className="px-4 py-3 text-center">Ngày báo cáo</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {danhSach.map((bc: any) => {
                    const loiInfo = LOAI_LOI_LABEL[bc.loaiLoi] || LOAI_LOI_LABEL.khac
                    return (
                      <tr key={bc._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
                              {bc.sach?.anhBia ? <img src={bc.sach.anhBia} alt="" className="w-full h-full object-cover"/> : <span className="text-lg">📘</span>}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-xs max-w-[180px] truncate">{bc.sach?.tenSach||'—'}</p>
                              <p className="text-[11px] text-gray-400">{bc.sach?.tacGia}</p>
                              {bc.sach?.danhMuc && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{bc.sach.danhMuc}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xl font-bold text-red-600">{bc.soLuong}</span>
                          <p className="text-[10px] text-gray-400">quyển</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${loiInfo.mau}`}>
                            {loiInfo.icon} {loiInfo.nhan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {bc.nguoiViPham ? (
                            <div>
                              <p className="text-xs font-medium text-red-700">{bc.nguoiViPham.hoTen}</p>
                              <p className="text-[11px] text-gray-400">{bc.nguoiViPham.soThe}</p>
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-700">{bc.nguoiBaoCao?.hoTen||'—'}</p>
                          <p className="text-[11px] text-gray-400">{bc.nguoiBaoCao?.vaiTro==='admin'?'👑 Admin':'📋 Thủ thư'}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-xs text-gray-700">{fNgay(bc.ngayBaoCao)}</p>
                        </td>
                        {/* ✅ Chỉ nút Xem */}
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setBcChon(bc)}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100">
                            👁 Xem
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {tongTrang > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button disabled={trang<=1} onClick={()=>setTrang(t=>t-1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Trước</button>
            <span className="text-sm text-gray-600">Trang <strong>{trang}</strong> / {tongTrang}</span>
            <button disabled={trang>=tongTrang} onClick={()=>setTrang(t=>t+1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Sau →</button>
          </div>
        )}
      </div>

      {/* ── MODAL XEM CHI TIẾT ── */}
      {bcChon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10" style={{borderColor:'#fecaca'}}>
              <h2 className="text-lg font-bold text-red-700">🚨 Chi tiết báo cáo lỗi</h2>
              <button onClick={()=>setBcChon(null)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 space-y-5">

              {/* Thông tin sách */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-14 rounded-lg overflow-hidden bg-white border border-blue-100 shrink-0" style={{height:72}}>
                  {bcChon.sach?.anhBia
                    ? <img src={bcChon.sach.anhBia} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📘</div>}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{bcChon.sach?.tenSach}</p>
                  <p className="text-sm text-gray-500">{bcChon.sach?.tacGia}</p>
                  {bcChon.sach?.danhMuc && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mt-1 inline-block">{bcChon.sach.danhMuc}</span>}
                </div>
              </div>

              {/* Số lượng & loại lỗi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                  <p className="text-xs text-red-500 font-semibold uppercase mb-1">Số quyển lỗi</p>
                  <p className="text-4xl font-bold text-red-600">{bcChon.soLuong}</p>
                  <p className="text-xs text-gray-400 mt-1">quyển sách</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 text-center bg-gray-50">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Loại lỗi</p>
                  {(() => {
                    const info = LOAI_LOI_LABEL[bcChon.loaiLoi] || LOAI_LOI_LABEL.khac
                    return (<><div className="text-3xl mb-1">{info.icon}</div><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${info.mau}`}>{info.nhan}</span></>)
                  })()}
                </div>
              </div>

              {/* Sinh viên vi phạm */}
              {bcChon.nguoiViPham && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-xs font-bold text-red-700 uppercase mb-3">👤 Sinh viên vi phạm</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-sm">
                      {bcChon.nguoiViPham.hoTen?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{bcChon.nguoiViPham.hoTen}</p>
                      <p className="text-xs text-gray-500">{bcChon.nguoiViPham.soThe} · {bcChon.nguoiViPham.maSoSV}</p>
                      <p className="text-xs text-gray-400">{bcChon.nguoiViPham.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mô tả */}
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">📝 Mô tả chi tiết</p>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{bcChon.lyDo}</p>
                </div>
              </div>

              {/* Người báo cáo & ngày */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Người báo cáo</p>
                  <p className="text-sm font-medium text-gray-800">{bcChon.nguoiBaoCao?.hoTen||'—'}</p>
                  <p className="text-xs text-gray-400">{bcChon.nguoiBaoCao?.vaiTro==='admin'?'👑 Admin':'📋 Thủ thư'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Ngày báo cáo</p>
                  <p className="text-sm font-medium text-gray-800">{fNgay(bcChon.ngayBaoCao)}</p>
                  <p className="text-xs text-gray-400">{fNgayGio(bcChon.ngayBaoCao)}</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button onClick={()=>setBcChon(null)}
                className="w-full py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}