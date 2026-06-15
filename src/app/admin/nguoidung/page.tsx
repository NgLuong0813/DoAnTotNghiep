'use client'
/**
 * TRANG — Admin Quản Lý Người Dùng
 * Đường dẫn: src/app/admin/nguoidung/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

const VAI_TRO_LABEL: Record<string, string> = {
  admin:    '👑 Admin',
  thuThu:   '📋 Thủ thư',
  sinhVien: '🎓 Sinh viên',
}

const THE_LABEL: Record<string, { nhan: string; mau: string }> = {
  hoatDong:    { nhan: 'Hoạt động',  mau: 'bg-green-100 text-green-700' },
  choKichHoat: { nhan: 'Chờ duyệt', mau: 'bg-yellow-100 text-yellow-700' },
  dinhChi:     { nhan: 'Đình chỉ',  mau: 'bg-red-100 text-red-600' },
  hetHan:      { nhan: 'Hết hạn',   mau: 'bg-gray-100 text-gray-600' },
}

const formTaoMacDinh = {
  hoTen: '', email: '', vaiTro: 'sinhVien',
  maSoSV: '', soDienThoai: '', khoa: '', nganh: '', khoaHoc: '',
  gioiTinh: 'nam',
}

export default function TrangQuanLyNguoiDung() {
  const { data: phien, status } = useSession()
  const nguoiDung = phien?.user as any
  const laThuThu  = nguoiDung?.vaiTro === 'thuThu'
  const router    = useRouter()

  const [danhSach,   setDanhSach]   = useState<any[]>([])
  const [phanTrang,  setPhanTrang]  = useState({ tongSo: 0, tongTrang: 1 })
  const [dangTai,    setDangTai]    = useState(true)
  const [tuKhoa,     setTuKhoa]     = useState('')
  const [trang,      setTrang]      = useState(1)
  const [thongBao,   setThongBao]   = useState({ loai: '', noi: '' })
  const [xemChiTiet, setXemChiTiet] = useState<any>(null)
  const [hienForm,   setHienForm]   = useState(false)
  const [dangLuu,    setDangLuu]    = useState(false)
  const [form,       setForm]       = useState(formTaoMacDinh)
  const [ketQuaTao,  setKetQuaTao]  = useState<any>(null)
  const [dangXuLy,   setDangXuLy]   = useState('')
  const [hienSua,    setHienSua]    = useState(false)
  const [dangSua,    setDangSua]    = useState(false)
  const [formSua,    setFormSua]    = useState<any>({})

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nguoiDung?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nguoiDung, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const p = new URLSearchParams({ trang: String(trang), gioiHan: '10', ...(tuKhoa && { tuKhoa }) })
    const res  = await fetch(`/api/nguoidung?${p}`)
    const json = await res.json()
    if (json.thanhCong) {
      setDanhSach(json.duLieu.danhSach)
      setPhanTrang({ tongSo: json.duLieu.tongSo, tongTrang: json.duLieu.tongTrang })
    }
    setDangTai(false)
  }, [trang, tuKhoa])

  useEffect(() => { taiDuLieu() }, [taiDuLieu])

  useEffect(() => {
    if (thongBao.noi) {
      const t = setTimeout(() => setThongBao({ loai: '', noi: '' }), 5000)
      return () => clearTimeout(t)
    }
  }, [thongBao])

  const coQuyenThaoTac = (nd: any) => {
    if (!laThuThu) return true
    return !['admin', 'thuThu'].includes(nd.vaiTro)
  }

  const moModalSua = (nd: any) => {
    setFormSua({
      hoTen: nd.hoTen||'', email: nd.email||'', soDienThoai: nd.soDienThoai||'',
      gioiTinh: nd.gioiTinh||'nam',
      ngaySinh: nd.ngaySinh ? new Date(nd.ngaySinh).toISOString().slice(0,10) : '',
      diaChi: nd.diaChi||'', maSoSV: nd.maSoSV||'', khoa: nd.khoa||'',
      nganh: nd.nganh||'', khoaHoc: nd.khoaHoc||'',
      vaiTro: nd.vaiTro||'sinhVien', trangThaiThe: nd.trangThaiThe||'hoatDong',
      _id: nd._id, emailCu: nd.email||'',
    })
    setXemChiTiet(null)
    setHienSua(true)
  }

  const luuThongTin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSua.hoTen) { setThongBao({ loai:'loi', noi:'Vui lòng nhập họ tên' }); return }
    if (formSua.email !== formSua.emailCu) {
      if (!confirm(`Bạn đang đổi email đăng nhập từ:\n"${formSua.emailCu}"\nthành:\n"${formSua.email}"\n\nXác nhận?`)) return
    }
    setDangSua(true)
    const { _id, emailCu, ...duLieu } = formSua
    if (duLieu.ngaySinh) duLieu.ngaySinh = new Date(duLieu.ngaySinh)
    else delete duLieu.ngaySinh
    const res  = await fetch(`/api/nguoidung/${_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(duLieu) })
    const json = await res.json()
    setDangSua(false)
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:'Cập nhật thành công!' }); setHienSua(false); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const taoTaiKhoan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hoTen || !form.email) { setThongBao({ loai:'loi', noi:'Vui lòng nhập đầy đủ họ tên và email' }); return }
    setDangLuu(true)
    const res  = await fetch('/api/nguoidung', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const json = await res.json()
    setDangLuu(false)
    if (json.thanhCong) { setKetQuaTao(json.duLieu); setThongBao({ loai:'ok', noi:json.thongBao }); setForm(formTaoMacDinh); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const capNhatThe = async (id: string, trangThaiThe: string) => {
    const nhan = trangThaiThe === 'hoatDong' ? 'kích hoạt' : 'đình chỉ'
    if (!confirm(`Bạn có chắc muốn ${nhan} thẻ này?`)) return
    setDangXuLy(id)
    const res  = await fetch(`/api/nguoidung/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ trangThaiThe }) })
    const json = await res.json()
    setDangXuLy('')
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:`Đã ${nhan} thẻ!` }); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const capNhatTaiKhoan = async (id: string, hoatDong: boolean) => {
    if (!confirm(`Bạn có chắc muốn ${hoatDong?'mở':'khóa'} tài khoản này?`)) return
    setDangXuLy(id)
    const res  = await fetch(`/api/nguoidung/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ hoatDong }) })
    const json = await res.json()
    setDangXuLy('')
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:`Đã ${hoatDong?'mở':'khóa'} tài khoản!` }); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const ic = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar dùng chung */}
      <SidebarAdmin trangHienTai="/admin/nguoidung" tenNguoiDung={nguoiDung?.name} />

      <div className="flex-1 p-6 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng: {phanTrang.tongSo} tài khoản
              {laThuThu && <span className="ml-2 text-xs text-orange-500">(Thủ thư — chỉ quản lý sinh viên)</span>}
            </p>
          </div>
          <button onClick={() => { setHienForm(true); setKetQuaTao(null) }}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl shadow-sm hover:opacity-90"
            style={{ backgroundColor: '#0066CC' }}>
            + Tạo tài khoản mới
          </button>
        </div>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            thongBao.loai==='ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {thongBao.loai==='ok'?'✅':'⚠️'} {thongBao.noi}
          </div>
        )}

        {laThuThu && (
          <div className="mb-4 px-4 py-3 rounded-xl text-xs border bg-orange-50 border-orange-200 text-orange-700">
            🔒 Với vai trò <strong>Thủ thư</strong>, bạn chỉ có thể tạo và quản lý tài khoản <strong>sinh viên</strong>.
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <input value={tuKhoa} onChange={(e) => { setTuKhoa(e.target.value); setTrang(1) }}
            placeholder="🔍 Tìm theo tên, email, mã SV, số thẻ..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? (
            <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">STT</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Vai trò</th>
                    <th className="px-4 py-3 text-left">Số thẻ</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Đang mượn</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {danhSach.map((nd, i) => {
                    const theInfo = THE_LABEL[nd.trangThaiThe] || THE_LABEL.choKichHoat
                    const coQuyen = coQuyenThaoTac(nd)
                    return (
                      <tr key={nd._id} className={`hover:bg-gray-50 ${!nd.hoatDong?'opacity-50':''}`}>
                        <td className="px-4 py-3 text-gray-400">{(trang-1)*10+i+1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                              style={{ backgroundColor:'#0066CC' }}>
                              {nd.hoTen?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-xs">{nd.hoTen}</div>
                              {nd.maSoSV && <div className="text-[10px] text-gray-400">{nd.maSoSV}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{nd.email}</td>
                        <td className="px-4 py-3 text-xs">{VAI_TRO_LABEL[nd.vaiTro]}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{nd.soThe}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${theInfo.mau}`}>{theInfo.nhan}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          <span className={nd.dangMuon > 0 ? 'text-blue-600' : 'text-gray-400'}>{nd.dangMuon}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center flex-wrap">
                            <button onClick={() => setXemChiTiet(nd)}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100">
                              👁 Xem
                            </button>
                            {coQuyen && (
                              <button onClick={() => moModalSua(nd)}
                                className="px-2 py-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100">
                                ✏️ Sửa
                              </button>
                            )}
                            {coQuyen ? (
                              <>
                                {nd.trangThaiThe === 'choKichHoat' && (
                                  <button onClick={() => capNhatThe(nd._id, 'hoatDong')} disabled={dangXuLy===nd._id}
                                    className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">
                                    ✅ Duyệt
                                  </button>
                                )}
                                {nd.trangThaiThe === 'hoatDong' && (
                                  <button onClick={() => capNhatThe(nd._id, 'dinhChi')} disabled={dangXuLy===nd._id}
                                    className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
                                    🚫 Đình chỉ
                                  </button>
                                )}
                                {nd.trangThaiThe === 'dinhChi' && (
                                  <button onClick={() => capNhatThe(nd._id, 'hoatDong')} disabled={dangXuLy===nd._id}
                                    className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">
                                    ✅ Mở thẻ
                                  </button>
                                )}
                                <button onClick={() => capNhatTaiKhoan(nd._id, !nd.hoatDong)} disabled={dangXuLy===nd._id}
                                  className={`px-2 py-1 text-xs border rounded-lg disabled:opacity-50 ${
                                    nd.hoatDong ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  }`}>
                                  {nd.hoatDong ? '🔒 Khóa' : '🔓 Mở'}
                                </button>
                              </>
                            ) : (
                              <span className="px-2 py-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg">🔒 Chỉ admin</span>
                            )}
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
            <button disabled={trang<=1} onClick={() => setTrang(t=>t-1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Trước</button>
            <span className="text-sm text-gray-600">Trang <strong>{trang}</strong> / {phanTrang.tongTrang}</span>
            <button disabled={trang>=phanTrang.tongTrang} onClick={() => setTrang(t=>t+1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Sau →</button>
          </div>
        )}
      </div>

      {/* MODAL SỬA */}
      {hienSua && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">✏️ Sửa thông tin người dùng</h2>
              <button onClick={() => setHienSua(false)} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={luuThongTin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và tên *</label>
                  <input required value={formSua.hoTen} onChange={e=>setFormSua((f:any)=>({...f,hoTen:e.target.value}))} className={ic} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email đăng nhập
                    {formSua.email !== formSua.emailCu && (
                      <span className="ml-2 text-[10px] font-normal text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">⚠️ Email đã thay đổi</span>
                    )}
                  </label>
                  <input type="email" value={formSua.email}
                    onChange={e=>setFormSua((f:any)=>({...f,email:e.target.value}))}
                    className={`${ic} ${formSua.email!==formSua.emailCu?'border-orange-400 bg-orange-50':''}`} />
                  {formSua.email !== formSua.emailCu && (
                    <p className="text-[10px] text-orange-600 mt-1">📧 Email cũ: <strong>{formSua.emailCu}</strong></p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại</label>
                  <input value={formSua.soDienThoai} onChange={e=>setFormSua((f:any)=>({...f,soDienThoai:e.target.value}))} placeholder="0901234567" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới tính</label>
                  <select value={formSua.gioiTinh} onChange={e=>setFormSua((f:any)=>({...f,gioiTinh:e.target.value}))} className={ic}>
                    <option value="nam">Nam</option><option value="nu">Nữ</option><option value="khac">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày sinh</label>
                  <input type="date" value={formSua.ngaySinh} onChange={e=>setFormSua((f:any)=>({...f,ngaySinh:e.target.value}))} className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vai trò</label>
                  <select value={formSua.vaiTro} onChange={e=>setFormSua((f:any)=>({...f,vaiTro:e.target.value}))} className={ic} disabled={laThuThu}>
                    <option value="sinhVien">🎓 Sinh viên</option>
                    {!laThuThu && <><option value="thuThu">📋 Thủ thư</option><option value="admin">👑 Admin</option></>}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Địa chỉ</label>
                  <input value={formSua.diaChi} onChange={e=>setFormSua((f:any)=>({...f,diaChi:e.target.value}))} placeholder="Số nhà, đường, quận, thành phố" className={ic} />
                </div>
                <div className="col-span-2"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-t pt-3">Thông tin học tập</div></div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã số SV</label>
                  <input value={formSua.maSoSV} onChange={e=>setFormSua((f:any)=>({...f,maSoSV:e.target.value}))} placeholder="73DCTT22129" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khóa học</label>
                  <input value={formSua.khoaHoc} onChange={e=>setFormSua((f:any)=>({...f,khoaHoc:e.target.value}))} placeholder="K73" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khoa</label>
                  <input value={formSua.khoa} onChange={e=>setFormSua((f:any)=>({...f,khoa:e.target.value}))} placeholder="Khoa CNTT" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngành</label>
                  <input value={formSua.nganh} onChange={e=>setFormSua((f:any)=>({...f,nganh:e.target.value}))} placeholder="Kỹ thuật phần mềm" className={ic} />
                </div>
                <div className="col-span-2"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-t pt-3">Trạng thái thẻ</div></div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái thẻ</label>
                  <select value={formSua.trangThaiThe} onChange={e=>setFormSua((f:any)=>({...f,trangThaiThe:e.target.value}))} className={ic}>
                    <option value="hoatDong">✅ Hoạt động</option>
                    <option value="choKichHoat">⏳ Chờ kích hoạt</option>
                    <option value="dinhChi">🚫 Đình chỉ</option>
                    <option value="hetHan">⌛ Hết hạn</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setHienSua(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangSua} className="px-5 py-2 text-sm text-white rounded-xl disabled:opacity-60" style={{ backgroundColor:'#0066CC' }}>
                  {dangSua ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {xemChiTiet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">👤 Chi tiết người dùng</h2>
              <button onClick={() => setXemChiTiet(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ['Họ tên', xemChiTiet.hoTen],
                ['Email', xemChiTiet.email],
                ['Vai trò', VAI_TRO_LABEL[xemChiTiet.vaiTro]],
                ['Mã SV', xemChiTiet.maSoSV||'—'],
                ['Số điện thoại', xemChiTiet.soDienThoai||'—'],
                ['Giới tính', xemChiTiet.gioiTinh==='nam'?'Nam':xemChiTiet.gioiTinh==='nu'?'Nữ':xemChiTiet.gioiTinh||'—'],
                ['Ngày sinh', xemChiTiet.ngaySinh ? new Date(xemChiTiet.ngaySinh).toLocaleDateString('vi-VN') : '—'],
                ['Địa chỉ', xemChiTiet.diaChi||'—'],
                ['Khoa', xemChiTiet.khoa||'—'],
                ['Ngành', xemChiTiet.nganh||'—'],
                ['Khóa học', xemChiTiet.khoaHoc||'—'],
                ['Số thẻ', xemChiTiet.soThe],
                ['Trạng thái thẻ', THE_LABEL[xemChiTiet.trangThaiThe]?.nhan||'—'],
                ['Đang mượn', `${xemChiTiet.dangMuon} cuốn`],
                ['Tổng đã mượn', `${xemChiTiet.tongSoLanMuon} lần`],
              ].map(([nhan, giaTri]) => (
                <div key={String(nhan)} className="flex gap-3 text-sm">
                  <span className="text-gray-500 w-36 shrink-0">{nhan}:</span>
                  <span className="font-medium text-gray-800">{giaTri}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              {coQuyenThaoTac(xemChiTiet) && (
                <button onClick={() => moModalSua(xemChiTiet)} className="flex-1 py-2 text-sm font-medium text-white rounded-xl" style={{ backgroundColor:'#F47920' }}>
                  ✏️ Sửa thông tin
                </button>
              )}
              <button onClick={() => setXemChiTiet(null)} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO TÀI KHOẢN */}
      {hienForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">➕ Tạo tài khoản mới</h2>
                {laThuThu && <p className="text-xs text-orange-500 mt-0.5">🔒 Thủ thư chỉ được tạo tài khoản sinh viên</p>}
              </div>
              <button onClick={() => { setHienForm(false); setKetQuaTao(null) }} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            {ketQuaTao && (
              <div className="mx-6 mt-5 p-4 rounded-xl border-2 border-green-200 bg-green-50">
                <p className="font-bold text-green-700 mb-3">✅ Tài khoản đã được tạo!</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Số thẻ:</span><span className="font-bold font-mono text-blue-600">{ketQuaTao.soThe}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Mật khẩu tạm:</span><span className="font-bold font-mono text-red-600 text-base">{ketQuaTao.matKhauTam}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Email đã gửi:</span><span className={`font-medium ${ketQuaTao.guiEmailOk?'text-green-600':'text-red-500'}`}>{ketQuaTao.guiEmailOk?'✅ Thành công':'❌ Thất bại'}</span></div>
                </div>
              </div>
            )}
            <form onSubmit={taoTaiKhoan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và tên *</label>
                  <input required value={form.hoTen} onChange={e=>setForm(f=>({...f,hoTen:e.target.value}))} placeholder="Nguyễn Văn A" className={ic} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="example@utt.edu.vn" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vai trò *</label>
                  <select value={form.vaiTro} onChange={e=>setForm(f=>({...f,vaiTro:e.target.value}))} className={ic}>
                    <option value="sinhVien">🎓 Sinh viên</option>
                    {!laThuThu && <><option value="thuThu">📋 Thủ thư</option><option value="admin">👑 Admin</option></>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới tính</label>
                  <select value={form.gioiTinh} onChange={e=>setForm(f=>({...f,gioiTinh:e.target.value}))} className={ic}>
                    <option value="nam">Nam</option><option value="nu">Nữ</option><option value="khac">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại</label>
                  <input value={form.soDienThoai} onChange={e=>setForm(f=>({...f,soDienThoai:e.target.value}))} placeholder="0901234567" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã số SV</label>
                  <input value={form.maSoSV} onChange={e=>setForm(f=>({...f,maSoSV:e.target.value}))} placeholder="DTH20220001" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khoa</label>
                  <input value={form.khoa} onChange={e=>setForm(f=>({...f,khoa:e.target.value}))} placeholder="Khoa CNTT" className={ic} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngành</label>
                  <input value={form.nganh} onChange={e=>setForm(f=>({...f,nganh:e.target.value}))} placeholder="Kỹ thuật phần mềm" className={ic} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khóa học</label>
                  <input value={form.khoaHoc} onChange={e=>setForm(f=>({...f,khoaHoc:e.target.value}))} placeholder="K65" className={ic} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => { setHienForm(false); setKetQuaTao(null) }} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                  {ketQuaTao ? 'Đóng' : 'Hủy'}
                </button>
                {!ketQuaTao && (
                  <button type="submit" disabled={dangLuu} className="px-5 py-2 text-sm text-white rounded-xl disabled:opacity-60" style={{ backgroundColor:'#0066CC' }}>
                    {dangLuu ? '⏳ Đang tạo...' : '📧 Tạo tài khoản & Gửi email'}
                  </button>
                )}
                {ketQuaTao && (
                  <button type="button" onClick={() => setKetQuaTao(null)} className="px-5 py-2 text-sm text-white rounded-xl" style={{ backgroundColor:'#0066CC' }}>
                    ➕ Tạo tài khoản khác
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
