'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

const TRANG_THAI_CONFIG: Record<string, { nhan: string; mau: string }> = {
  choDuyet: { nhan: '⏳ Chờ duyệt', mau: 'bg-yellow-100 text-yellow-700' },
  dangMuon: { nhan: '📖 Đang mượn', mau: 'bg-blue-100 text-blue-700' },
  daTra:    { nhan: '✅ Đã trả',     mau: 'bg-green-100 text-green-700' },
  quaHan:   { nhan: '⚠️ Quá hạn',   mau: 'bg-red-100 text-red-700' },
  tuChoi:   { nhan: '❌ Từ chối',    mau: 'bg-gray-100 text-gray-600' },
  matSach:  { nhan: '🚫 Mất sách',  mau: 'bg-red-100 text-red-700' },
}
const locMacDinh = { trangThai:'', tuKhoa:'', tenSach:'', tuNgayMuon:'', denNgayMuon:'', tuNgayTra:'', denNgayTra:'', tuHanTra:'', denHanTra:'' }

export default function TrangQuanLyMuonTra() {
  const { data: phien, status } = useSession()
  const nguoiDung = phien?.user as any
  const router = useRouter()
  const [danhSach, setDanhSach] = useState<any[]>([])
  const [phanTrang, setPhanTrang] = useState({ tongSo: 0, tongTrang: 1 })
  const [dangTai, setDangTai] = useState(true)
  const [trang, setTrang] = useState(1)
  const [loc, setLoc] = useState(locMacDinh)
  const [locTam, setLocTam] = useState(locMacDinh)
  const [moRongLoc, setMoRongLoc] = useState(false)
  const [thongBao, setThongBao] = useState({ loai: '', noi: '' })
  const [dangXuLy, setDangXuLy] = useState('')
  const [hienXacNhan, setHienXacNhan] = useState(false)
  const [phieuHoanTac, setPhieuHoanTac] = useState<any>(null)
  const [loaiHoanTac, setLoaiHoanTac] = useState<'hoanTacDuyet'|'hoanTacTra'>('hoanTacDuyet')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nguoiDung?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nguoiDung, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const p = new URLSearchParams({ trang: String(trang), gioiHan: '10' })
    Object.entries(loc).forEach(([k, v]) => { if (v) p.set(k, v) })
    const res = await fetch(`/api/muontra?${p}`)
    const json = await res.json()
    if (json.thanhCong) { setDanhSach(json.duLieu.danhSach); setPhanTrang({ tongSo: json.duLieu.tongSo, tongTrang: json.duLieu.tongTrang }) }
    setDangTai(false)
  }, [trang, loc])

  useEffect(() => { taiDuLieu() }, [taiDuLieu])
  useEffect(() => { if (thongBao.noi) { const t = setTimeout(() => setThongBao({ loai:'', noi:'' }), 4000); return () => clearTimeout(t) } }, [thongBao])

  const applyLoc = () => { setLoc(locTam); setTrang(1); setMoRongLoc(false) }
  const xoaLoc = () => { setLoc(locMacDinh); setLocTam(locMacDinh); setTrang(1) }
  const soLocDangDung = Object.values(loc).filter(v => v !== '').length

  const xuLy = async (id: string, hanhDong: string, ghiChu = '') => {
    setDangXuLy(id)
    const res = await fetch(`/api/muontra/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ hanhDong, ghiChu }) })
    const json = await res.json()
    setDangXuLy('')
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:`${hanhDong} thành công!` }); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const moXacNhanHoanTac = (phieu: any, loai: 'hoanTacDuyet'|'hoanTacTra') => { setPhieuHoanTac(phieu); setLoaiHoanTac(loai); setHienXacNhan(true) }
  const xacNhanHoanTac = async () => { if (!phieuHoanTac) return; setHienXacNhan(false); await xuLy(phieuHoanTac._id, loaiHoanTac); setPhieuHoanTac(null) }

  const fN = (ngay: string) => ngay ? new Date(ngay).toLocaleDateString('vi-VN') : '—'
  const fNGio = (ngay: string) => ngay ? new Date(ngay).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
  const quaHan = (ngayHan: string) => ngayHan && new Date(ngayHan) < new Date()
  const ic = "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin trangHienTai="/admin/muontra" tenNguoiDung={nguoiDung?.name} />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý mượn / trả</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tổng: {phanTrang.tongSo} phiếu</p>
          </div>
        </div>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${thongBao.loai==='ok'?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>
            {thongBao.loai==='ok'?'✅':'⚠️'} {thongBao.noi}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <div className="p-3 flex flex-wrap gap-2 items-center border-b border-gray-100">
            <input value={locTam.tuKhoa} onChange={e=>setLocTam(f=>({...f,tuKhoa:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyLoc()}
              placeholder="🔍 Tên người mượn, số thẻ..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 w-52"/>
            <input value={locTam.tenSach} onChange={e=>setLocTam(f=>({...f,tenSach:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyLoc()}
              placeholder="📚 Tên sách..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 w-44"/>
            <select value={locTam.trangThai} onChange={e=>setLocTam(f=>({...f,trangThai:e.target.value}))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="">Tất cả trạng thái</option>
              <option value="choDuyet">⏳ Chờ duyệt</option>
              <option value="dangMuon">📖 Đang mượn</option>
              <option value="daTra">✅ Đã trả</option>
              <option value="tuChoi">❌ Từ chối</option>
            </select>
            <button onClick={()=>setMoRongLoc(!moRongLoc)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${moRongLoc?'bg-blue-50 border-blue-300 text-blue-700':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              🗓 Lọc theo ngày {moRongLoc?'▲':'▼'}
            </button>
            <button onClick={applyLoc} className="px-4 py-1.5 text-xs text-white rounded-lg hover:opacity-90" style={{backgroundColor:'#0066CC'}}>Áp dụng</button>
            {soLocDangDung > 0 && <button onClick={xoaLoc} className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50">✕ Xóa lọc ({soLocDangDung})</button>}
          </div>
          {moRongLoc && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[['📅 Ngày mượn','tuNgayMuon','denNgayMuon'],['⏰ Hạn trả','tuHanTra','denHanTra'],['✅ Ngày trả thực tế','tuNgayTra','denNgayTra']].map(([label,tu,den])=>(
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
                    <div className="flex gap-2 items-center">
                      <input type="date" value={(locTam as any)[tu]} onChange={e=>setLocTam(f=>({...f,[tu]:e.target.value}))} className={ic}/>
                      <span className="text-xs text-gray-400 shrink-0">—</span>
                      <input type="date" value={(locTam as any)[den]} onChange={e=>setLocTam(f=>({...f,[den]:e.target.value}))} className={ic}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button onClick={()=>setLocTam(f=>({...f,tuNgayMuon:'',denNgayMuon:'',tuNgayTra:'',denNgayTra:'',tuHanTra:'',denHanTra:''}))}
                  className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Xóa lọc ngày</button>
                <button onClick={applyLoc} className="px-4 py-1.5 text-xs text-white rounded-lg" style={{backgroundColor:'#0066CC'}}>Áp dụng</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          : danhSach.length === 0 ? <div className="py-20 text-center text-gray-400"><div className="text-4xl mb-2">📭</div><div className="text-sm">Không có phiếu mượn nào</div></div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3 text-left">Người mượn</th>
                    <th className="px-3 py-3 text-left">Sách</th>
                    <th className="px-3 py-3 text-center">Ngày mượn</th>
                    <th className="px-3 py-3 text-center">Hạn trả</th>
                    <th className="px-3 py-3 text-center">Ngày trả</th>
                    <th className="px-3 py-3 text-center">Trạng thái</th>
                    <th className="px-3 py-3 text-center">Tiền phạt</th>
                    <th className="px-3 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {danhSach.map((phieu) => {
                    const ttInfo = TRANG_THAI_CONFIG[phieu.trangThai] || TRANG_THAI_CONFIG.choDuyet
                    const lqHan = phieu.trangThai === 'dangMuon' && quaHan(phieu.ngayHanTra)
                    return (
                      <tr key={phieu._id} className={`hover:bg-gray-50 ${lqHan?'bg-red-50':''}`}>
                        <td className="px-3 py-3"><div className="font-medium text-gray-800 text-xs">{phieu.nguoiMuon?.hoTen}</div><div className="text-[11px] text-gray-400">{phieu.nguoiMuon?.soThe}</div></td>
                        <td className="px-3 py-3 max-w-[160px]"><div className="font-medium text-gray-800 text-xs truncate">{phieu.sach?.tenSach}</div><div className="text-[11px] text-gray-400 truncate">{phieu.sach?.tacGia}</div></td>
                        <td className="px-3 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{fN(phieu.ngayMuon)}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap"><span className={`text-xs font-medium ${lqHan?'text-red-600':'text-gray-600'}`}>{fN(phieu.ngayHanTra)}{lqHan&&' ⚠️'}</span></td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {phieu.ngayTraThuc ? <div><div className="text-xs font-medium text-green-700">{fN(phieu.ngayTraThuc)}</div><div className="text-[10px] text-gray-400">{fNGio(phieu.ngayTraThuc).split(',')[1]?.trim()}</div></div> : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-3 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${ttInfo.mau}`}>{ttInfo.nhan}</span></td>
                        <td className="px-3 py-3 text-center text-xs">{phieu.tienPhat>0?<span className="text-red-600 font-semibold">{phieu.tienPhat.toLocaleString()}đ</span>:<span className="text-gray-400">—</span>}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {phieu.trangThai==='choDuyet'&&<><button disabled={dangXuLy===phieu._id} onClick={()=>xuLy(phieu._id,'duyetMuon')} className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">✅ Duyệt</button><button disabled={dangXuLy===phieu._id} onClick={()=>xuLy(phieu._id,'tuChoi','Không đủ điều kiện')} className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">❌ Từ chối</button></>}
                            {phieu.trangThai==='dangMuon'&&<><button disabled={dangXuLy===phieu._id} onClick={()=>xuLy(phieu._id,'xacNhanTra')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50">📥 Xác nhận trả</button><button disabled={dangXuLy===phieu._id} onClick={()=>moXacNhanHoanTac(phieu,'hoanTacDuyet')} className="px-2 py-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50">↩️ Hoàn tác</button></>}
                            {phieu.trangThai==='daTra'&&<button disabled={dangXuLy===phieu._id} onClick={()=>moXacNhanHoanTac(phieu,'hoanTacTra')} className="px-2 py-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50">↩️ Hoàn tác trả</button>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {phanTrang.tongTrang > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button disabled={trang<=1} onClick={()=>setTrang(t=>t-1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Trước</button>
            <span className="text-sm text-gray-600">Trang <strong>{trang}</strong> / {phanTrang.tongTrang}</span>
            <button disabled={trang>=phanTrang.tongTrang} onClick={()=>setTrang(t=>t+1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Sau →</button>
          </div>
        )}
      </div>

      {hienXacNhan && phieuHoanTac && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">↩️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận hoàn tác</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {loaiHoanTac==='hoanTacDuyet'?<>Phiếu của <strong>{phieuHoanTac.nguoiMuon?.hoTen}</strong> sẽ về <span className="text-yellow-600 font-medium">Chờ duyệt</span>.</>:<>Phiếu của <strong>{phieuHoanTac.nguoiMuon?.hoTen}</strong> sẽ về <span className="text-blue-600 font-medium">Đang mượn</span>.</>}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>{setHienXacNhan(false);setPhieuHoanTac(null)}} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
              <button onClick={xacNhanHoanTac} className="flex-1 py-2.5 text-sm text-white font-semibold rounded-xl" style={{backgroundColor:'#F47920'}}>↩️ Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
