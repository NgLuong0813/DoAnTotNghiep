'use client'
/**
 * TRANG — Admin Quản Lý Sách
 * Bộ lọc đầy đủ + Modal báo sách lỗi + Thêm sách chỉ cần nhập tổng
 * Đường dẫn: src/app/admin/sach/page.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'
import { useDanhMuc } from '@/hooks/useDanhMuc'

// Danh mục được load động từ DB qua useDanhMuc hook

const TRANG_THAI_LABEL: Record<string, { nhan: string; mau: string }> = {
  choMuon: { nhan:'✅ Cho mượn', mau:'bg-green-100 text-green-700' },
  hetSach: { nhan:'⛔ Hết sách', mau:'bg-red-100 text-red-600' },
  baoTri:  { nhan:'🔧 Bảo trì',  mau:'bg-yellow-100 text-yellow-700' },
}

const LOAI_LOI = [
  { key:'doSinhVien', nhan:'👤 Do sinh viên làm hỏng', mau:'bg-red-50 border-red-300 text-red-700' },
  { key:'amUot',      nhan:'💧 Do ẩm ướt / nước',      mau:'bg-blue-50 border-blue-300 text-blue-700' },
  { key:'cuRach',     nhan:'📄 Bị cũ, rách',            mau:'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { key:'vietChuLen', nhan:'✏️ Bị viết chữ lên',        mau:'bg-purple-50 border-purple-300 text-purple-700' },
  { key:'banChu',     nhan:'🖊️ Chữ bị bẩn / mờ',       mau:'bg-orange-50 border-orange-300 text-orange-700' },
  { key:'khac',       nhan:'❓ Lý do khác',              mau:'bg-gray-50 border-gray-300 text-gray-600' },
]

const formMacDinh = {
  tenSach:'', tacGia:'', maSach:'', danhMuc:'',
  nhaXuatBan:'', namXuatBan: new Date().getFullYear(),
  tongSoBan:1, viTriKe:'', soTrang:0, kyHieu:'', taiBan:'',
  moTa:'', trangThai:'choMuon',
}

export default function TrangAdminSach() {
  const { data: phien, status } = useSession()
  const nguoiDung = phien?.user as any
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)
  const { danhMuc: DANH_MUC } = useDanhMuc()  // ✅ Load từ DB

  // Danh sách
  const [danhSachSach,  setDanhSachSach]  = useState<any[]>([])
  const [phanTrang,     setPhanTrang]     = useState({ tongSo:0, tongTrang:1 })
  const [dangTai,       setDangTai]       = useState(true)
  const [trang,         setTrang]         = useState(1)
  const [thongBao,      setThongBao]      = useState({ loai:'', noi:'' })

  // Bộ lọc
  const [tuKhoa,        setTuKhoa]        = useState('')
  const [locDanhMuc,    setLocDanhMuc]    = useState('')
  const [locTrangThai,  setLocTrangThai]  = useState('')
  const [locConLai,     setLocConLai]     = useState('')  // 'co'|'het'|''
  const [locCoLoi,      setLocCoLoi]      = useState(false) // ✅ Lọc sách có báo cáo lỗi
  const [locNamXB,      setLocNamXB]      = useState('')
  const [locTacGia,     setLocTacGia]     = useState('')
  const [soSachLoi,     setSoSachLoi]     = useState(0)  // ✅ Tổng sách có lỗi
  const [moRongLoc,     setMoRongLoc]     = useState(false)

  // Form sách
  const [hienForm,      setHienForm]      = useState(false)
  const [sachDangSua,   setSachDangSua]   = useState<any>(null)
  const [dangLuu,       setDangLuu]       = useState(false)
  const [form,          setForm]          = useState(formMacDinh)
  const [danhSachAnh,   setDanhSachAnh]   = useState<string[]>([])
  const [dangUpload,    setDangUpload]     = useState(false)
  const [loiAnh,        setLoiAnh]        = useState('')

  // Modal báo sách lỗi
  const [hienLoi,       setHienLoi]       = useState(false)
  const [bLSachId,      setBLSachId]      = useState('')
  const [bLSoLuong,     setBLSoLuong]     = useState(1)
  const [bLLoaiLoi,     setBLLoaiLoi]     = useState('')
  const [bLLyDo,        setBLLyDo]        = useState('')
  const [bLNguoiVP,     setBLNguoiVP]     = useState('')
  const [bLTenNguoiVP,  setBLTenNguoiVP]  = useState('')
  const [dsSachChon,    setDsSachChon]    = useState<any[]>([])
  const [dsNguoiDung,   setDsNguoiDung]   = useState<any[]>([])
  const [tuKhoaND,      setTuKhoaND]      = useState('')
  const [dangTimND,     setDangTimND]      = useState(false)
  const [dangGuiLoi,    setDangGuiLoi]    = useState(false)
  const [hienDropND,    setHienDropND]    = useState(false)

  // ✅ Modal nhập thêm sách
  const [hienNhapThem,  setHienNhapThem]  = useState(false)
  const [sachNhapThem,  setSachNhapThem]  = useState<any>(null)
  const [soNhapThem,    setSoNhapThem]    = useState(1)
  const [dangNhapThem,  setDangNhapThem]  = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nguoiDung?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nguoiDung, router])

  // Tải danh sách sách
  const taiSach = useCallback(async () => {
    setDangTai(true)
    const p = new URLSearchParams({ trang: String(trang), gioiHan:'10' })
    if (tuKhoa)       p.set('tuKhoa',   tuKhoa)
    if (locDanhMuc)   p.set('danhMuc',  locDanhMuc)
    if (locTrangThai) p.set('trangThai',locTrangThai)
    if (locTacGia)    p.set('tuKhoa',   locTacGia)

    const [resSach, resLoi] = await Promise.all([
      fetch(`/api/sach?${p}`),
      fetch('/api/baoCaoLoi?soSachDuy=true'),
    ])
    const [jSach, jLoi] = await Promise.all([resSach.json(), resLoi.json()])

    if (jSach.thanhCong) {
      let ds = jSach.duLieu.danhSachSach || []
      if (locConLai === 'co')  ds = ds.filter((s:any) => s.soBanConLai > 0)
      if (locConLai === 'het') ds = ds.filter((s:any) => s.soBanConLai === 0)
      if (locNamXB)            ds = ds.filter((s:any) => String(s.namXuatBan) === locNamXB)

      // ✅ Lọc sách có báo cáo lỗi
      if (locCoLoi && jLoi.thanhCong) {
        const sachCoLoi = new Set(jLoi.duLieu.danhSach.map((bc:any) => String(bc.sach?._id || bc.sach)))
        ds = ds.filter((s:any) => sachCoLoi.has(String(s._id)))
      }

      // ✅ Đính kèm thông tin lỗi vào từng sách
      if (jLoi.thanhCong) {
        const loiTheoSach: Record<string, { soLuong: number; soLan: number }> = {}
        for (const bc of jLoi.duLieu.danhSach) {
          const id = String(bc.sach?._id || bc.sach)
          if (!loiTheoSach[id]) loiTheoSach[id] = { soLuong: 0, soLan: 0 }
          loiTheoSach[id].soLuong += bc.soLuong
          loiTheoSach[id].soLan  += 1
        }
        ds = ds.map((s:any) => ({ ...s, _loiInfo: loiTheoSach[String(s._id)] }))
        setSoSachLoi(Object.keys(loiTheoSach).length)
      }

      setDanhSachSach(ds)
      setPhanTrang({ tongSo: jSach.duLieu.tongSo, tongTrang: jSach.duLieu.tongTrang })
    }
    setDangTai(false)
  }, [trang, tuKhoa, locDanhMuc, locTrangThai, locConLai, locNamXB, locTacGia, locCoLoi])

  useEffect(() => { taiSach() }, [taiSach])

  useEffect(() => {
    if (thongBao.noi) {
      const t = setTimeout(() => setThongBao({ loai:'', noi:'' }), 4000)
      return () => clearTimeout(t)
    }
  }, [thongBao])

  // Tìm người dùng
  useEffect(() => {
    if (!tuKhoaND.trim()) { setDsNguoiDung([]); return }
    const t = setTimeout(async () => {
      setDangTimND(true)
      const res  = await fetch(`/api/nguoidung?tuKhoa=${encodeURIComponent(tuKhoaND)}&gioiHan=8`)
      const json = await res.json()
      if (json.thanhCong) setDsNguoiDung(json.duLieu.danhSach || [])
      setDangTimND(false)
    }, 400)
    return () => clearTimeout(t)
  }, [tuKhoaND])

  // ✅ Nhận sách trực tiếp từ dòng bấm — không cần chọn lại
  const moModalNhapThem = (sach: any) => {
    setSachNhapThem(sach)
    setSoNhapThem(1)
    setHienNhapThem(true)
  }

  const xuLyNhapThem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (soNhapThem <= 0) return
    setDangNhapThem(true)
    const res  = await fetch(`/api/sach/${sachNhapThem._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ soNhapThem }),
    })
    const json = await res.json()
    setDangNhapThem(false)
    if (json.thanhCong) {
      setThongBao({ loai: 'ok', noi: json.thongBao })
      setHienNhapThem(false)
      taiSach()
    } else {
      setThongBao({ loai: 'loi', noi: json.thongBao })
    }
  }

  const moModalLoi = (sach: any) => {
    setBLSachId(sach._id)
    setBLSoLuong(1)
    setBLLoaiLoi('')
    setBLLyDo('')
    setBLNguoiVP('')
    setBLTenNguoiVP('')
    setTuKhoaND('')
    setDsNguoiDung([])
    // Lưu sách đang chọn để hiển thị thông tin
    setDsSachChon([sach])
    setHienLoi(true)
  }

  const guiBaoCaoLoi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bLSachId)  { setThongBao({ loai:'loi', noi:'Vui lòng chọn sách' }); return }
    if (!bLLoaiLoi) { setThongBao({ loai:'loi', noi:'Vui lòng chọn loại lỗi' }); return }
    if (!bLLyDo.trim()) { setThongBao({ loai:'loi', noi:'Vui lòng nhập lý do' }); return }
    if (bLLoaiLoi === 'doSinhVien' && !bLNguoiVP) {
      setThongBao({ loai:'loi', noi:'Vui lòng chọn sinh viên vi phạm' }); return
    }
    const sachChon = dsSachChon.find(s => s._id === bLSachId)
    if (sachChon && bLSoLuong > sachChon.tongSoBan) {
      setThongBao({ loai:'loi', noi:`Số lượng không được vượt quá tổng số bản (${sachChon.tongSoBan})` }); return
    }
    setDangGuiLoi(true)
    const res  = await fetch('/api/baoCaoLoi', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sachId:bLSachId, soLuong:bLSoLuong, loaiLoi:bLLoaiLoi, nguoiViPhamId:bLNguoiVP||null, lyDo:bLLyDo }),
    })
    const json = await res.json()
    setDangGuiLoi(false)
    if (json.thanhCong) {
      setThongBao({ loai:'ok', noi:'✅ Đã ghi nhận báo cáo lỗi sách, số lượng đã được cập nhật!' })
      setHienLoi(false); taiSach()
    } else setThongBao({ loai:'loi', noi: json.thongBao })
  }

  // Form thêm/sửa sách
  const moFormThem = () => {
    setSachDangSua(null)
    setForm({ ...formMacDinh, danhMuc: DANH_MUC[0] || 'Công nghệ thông tin' })
    setDanhSachAnh([]); setLoiAnh(''); setHienForm(true)
  }

  const moFormSua = (sach: any) => {
    setSachDangSua(sach)
    setForm({
      tenSach: sach.tenSach||'', tacGia: sach.tacGia||'', maSach: sach.maSach||'',
      danhMuc: sach.danhMuc||'Công nghệ thông tin', nhaXuatBan: sach.nhaXuatBan||'',
      namXuatBan: sach.namXuatBan||new Date().getFullYear(),
      tongSoBan: sach.tongSoBan||1, viTriKe: sach.viTriKe||'',
      soTrang: sach.soTrang||0, kyHieu: sach.kyHieu||'', taiBan: sach.taiBan||'',
      moTa: sach.moTa||'', trangThai: sach.trangThai||'choMuon',
    })
    const anhCu = sach.danhSachAnh || []
    setDanhSachAnh(sach.anhBia && !anhCu.includes(sach.anhBia) ? [sach.anhBia,...anhCu] : anhCu)
    setLoiAnh(''); setHienForm(true)
  }

  const xuLyUploadAnh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files||[])
    if (!files.length) return
    if (danhSachAnh.length + files.length > 5) { setLoiAnh('Chỉ được tối đa 5 ảnh.'); if(fileRef.current) fileRef.current.value=''; return }
    setDangUpload(true); setLoiAnh('')
    const anhMoi: string[] = []
    for (const f of files) {
      if (f.size > 5*1024*1024) { setLoiAnh(`"${f.name}" vượt 5MB`); continue }
      const fd = new FormData(); fd.append('file', f)
      try {
        const r = await fetch('/api/taiLen?loai=anhSach', { method:'POST', body:fd })
        const j = await r.json()
        if (j.thanhCong) anhMoi.push(j.duongDanAnh)
      } catch {}
    }
    setDanhSachAnh(prev => [...prev, ...anhMoi])
    setDangUpload(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const luuSach = async (e: React.FormEvent) => {
    e.preventDefault(); setDangLuu(true)
    // ✅ Khi thêm mới: soBanConLai = tongSoBan
    // Khi sửa: giữ nguyên soBanConLai
    const duLieu: any = {
      ...form,
      anhBia:      danhSachAnh[0]||'',
      danhSachAnh,
    }
    if (!sachDangSua) {
      duLieu.soBanConLai = form.tongSoBan  // ✅ Thêm mới: còn lại = tổng
    }
    const url    = sachDangSua ? `/api/sach/${sachDangSua._id}` : '/api/sach'
    const method = sachDangSua ? 'PUT' : 'POST'
    const res  = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(duLieu) })
    const json = await res.json()
    setDangLuu(false)
    if (json.thanhCong) {
      setThongBao({ loai:'ok', noi: sachDangSua ? 'Cập nhật thành công!' : 'Thêm sách thành công!' })
      setHienForm(false); taiSach()
    } else setThongBao({ loai:'loi', noi: json.thongBao })
  }

  const xoaSach = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuốn sách này?')) return
    const res = await fetch(`/api/sach/${id}`, { method:'DELETE' })
    const json = await res.json()
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:'Đã xóa sách!' }); taiSach() }
  }

  const xoaLoc = () => {
    setTuKhoa(''); setLocDanhMuc(''); setLocTrangThai('')
    setLocConLai(''); setLocNamXB(''); setLocTacGia('')
    setLocCoLoi(false)
    setTrang(1)
  }

  const soLocDung = [tuKhoa,locDanhMuc,locTrangThai,locConLai,locNamXB,locTacGia,locCoLoi?'1':''].filter(Boolean).length
  const ic = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-white border-r border-gray-200 hidden md:block shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div>
              <div className="font-bold text-sm text-gray-800">Admin UTT</div>
              <div className="text-[10px] text-gray-400 truncate">{nguoiDung?.name}</div>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { icon:'📊', nhan:'Tổng quan',   href:'/admin' },
            { icon:'📚', nhan:'Quản lý sách', href:'/admin/sach',           active:true },
            { icon:'🚨', nhan:'Sách lỗi',     href:'/admin/sach/loiSach' },
            { icon:'🗂️', nhan:'Danh mục',     href:'/admin/danhMuc' },
            { icon:'👥', nhan:'Người dùng',   href:'/admin/nguoidung' },
            { icon:'📋', nhan:'Mượn / Trả',   href:'/admin/muontra' },
            { icon:'📰', nhan:'Tin tức',       href:'/admin/tintuc' },
            { icon:'💬', nhan:'Tin nhắn',      href:'/admin/tinnhan' },
          ].map(m => (
            <Link key={m.href} href={m.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                (m as any).active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <span>{m.icon}</span>{m.nhan}
            </Link>
          ))}
          <hr className="my-2"/>
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
            🏠 Trang chủ
          </Link>
        </nav>
      </aside>

      {/* Nội dung */}
      <div className="flex-1 p-6 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý sách</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tổng: <strong>{phanTrang.tongSo}</strong> cuốn</p>
          </div>
          <button onClick={moFormThem}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ backgroundColor:'#0066CC' }}>
            + Thêm sách mới
          </button>
        </div>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            thongBao.loai==='ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {thongBao.loai==='ok'?'✅':'⚠️'} {thongBao.noi}
          </div>
        )}

        {/* ── Bộ lọc ── */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          {/* Hàng lọc chính */}
          <div className="p-3 flex flex-wrap gap-2 items-center">
            <input value={tuKhoa} onChange={e => { setTuKhoa(e.target.value); setTrang(1) }}
              placeholder="🔍 Tên sách, ISBN..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 w-44" />

            <input value={locTacGia} onChange={e => { setLocTacGia(e.target.value); setTrang(1) }}
              placeholder="👤 Tác giả..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 w-36" />

            <select value={locDanhMuc} onChange={e => { setLocDanhMuc(e.target.value); setTrang(1) }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="">📁 Tất cả danh mục</option>
              {DANH_MUC.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={locTrangThai} onChange={e => { setLocTrangThai(e.target.value); setTrang(1) }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="">📊 Tất cả trạng thái</option>
              <option value="choMuon">✅ Cho mượn</option>
              <option value="hetSach">⛔ Hết sách</option>
              <option value="baoTri">🔧 Bảo trì</option>
            </select>

            {/* ✅ Nút chuyển thẳng sang trang sách lỗi */}
            <Link href="/admin/sach/loiSach"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border-2 font-medium transition-all border-red-500 text-white bg-red-600 hover:bg-red-700">
              🚨 Sách lỗi {soSachLoi > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-red-600">{soSachLoi} cuốn</span>}
            </Link>

            {/* Nút lọc nâng cao */}
            <button onClick={() => setMoRongLoc(!moRongLoc)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                moRongLoc ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              ⚙️ Lọc thêm {moRongLoc?'▲':'▼'}
            </button>

            {soLocDung > 0 && (
              <button onClick={xoaLoc}
                className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                ✕ Xóa lọc ({soLocDung})
              </button>
            )}
          </div>

          {/* Lọc nâng cao */}
          {moRongLoc && (
            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 items-end">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Số bản còn lại</p>
                <select value={locConLai} onChange={e => { setLocConLai(e.target.value); setTrang(1) }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
                  <option value="">Tất cả</option>
                  <option value="co">📗 Còn sách ({">"} 0)</option>
                  <option value="het">📕 Hết sách (= 0)</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Năm xuất bản</p>
                <input type="number" min={1900} max={2030} value={locNamXB}
                  onChange={e => { setLocNamXB(e.target.value); setTrang(1) }}
                  placeholder="VD: 2023"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 w-28" />
              </div>
              <button onClick={xoaLoc} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Bảng sách */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? (
            <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          ) : danhSachSach.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">Không tìm thấy sách nào</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">STT</th>
                    <th className="px-4 py-3 text-left">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tên sách</th>
                    <th className="px-4 py-3 text-left">Tác giả</th>
                    <th className="px-4 py-3 text-left">Danh mục</th>
                    <th className="px-4 py-3 text-center">Tổng</th>
                    <th className="px-4 py-3 text-center">Còn</th>
                    <th className="px-4 py-3 text-left">Vị trí kệ</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {danhSachSach.map((sach, i) => {
                    const tt = TRANG_THAI_LABEL[sach.trangThai] || TRANG_THAI_LABEL.choMuon
                    return (
                      <tr key={sach._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{(trang-1)*10+i+1}</td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-12 rounded overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
                            {sach.anhBia ? <img src={sach.anhBia} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">📘</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-medium text-gray-800 truncate">{sach.tenSach}</p>
                          {sach.maSach  && <p className="text-[11px] text-gray-400">ISBN: {sach.maSach}</p>}
                          {sach.kyHieu  && <p className="text-[11px] text-purple-500">KH: {sach.kyHieu}</p>}
                          {sach.taiBan  && <p className="text-[11px] text-orange-500">{sach.taiBan}</p>}
                          {/* ✅ Badge sách lỗi */}
                          {sach._loiInfo && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                                🚨 {sach._loiInfo.soLuong} quyển lỗi · {sach._loiInfo.soLan} BC
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{sach.tacGia}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{sach.danhMuc}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{sach.tongSoBan}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-sm ${sach.soBanConLai > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {sach.soBanConLai}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{sach.viTriKe||'—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${tt.mau}`}>{tt.nhan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 justify-center flex-wrap">
                            <button onClick={() => moFormSua(sach)}
                              className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100">
                              ✏️ Sửa
                            </button>
                            <button onClick={() => moModalNhapThem(sach)}
                              className="px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
                              title="Nhập thêm sách vào kho">
                              ➕ Nhập
                            </button>
                            <button onClick={() => moModalLoi(sach)}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                              title="Báo sách bị lỗi / hỏng">
                              🚨 Lỗi
                            </button>
                            <button onClick={() => xoaSach(sach._id)}
                              className="px-3 py-1.5 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">
                              🗑 Xóa
                            </button>
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

      {/* ══ MODAL NHẬP THÊM SÁCH ══ */}
      {hienNhapThem && sachNhapThem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10"
              style={{ borderColor: '#bbf7d0' }}>
              <h2 className="text-lg font-bold text-green-700">➕ Nhập thêm sách vào kho</h2>
              <button onClick={() => setHienNhapThem(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={xuLyNhapThem} className="p-6 space-y-5">

              {/* Thông tin sách */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-white border border-green-100 shrink-0">
                  {sachNhapThem.anhBia
                    ? <img src={sachNhapThem.anhBia} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📘</div>}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{sachNhapThem.tenSach}</p>
                  <p className="text-xs text-gray-500">{sachNhapThem.tacGia}</p>
                  <div className="flex gap-3 mt-1.5 text-xs">
                    <span className="text-gray-500">Tổng: <strong>{sachNhapThem.tongSoBan}</strong></span>
                    <span className={sachNhapThem.soBanConLai > 0 ? 'text-green-600' : 'text-red-500'}>
                      Còn: <strong>{sachNhapThem.soBanConLai}</strong>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      sachNhapThem.trangThai === 'hetSach'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {sachNhapThem.trangThai === 'hetSach' ? '⛔ Hết sách' : '✅ Cho mượn'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Số lượng nhập thêm */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng nhập thêm *
                </label>
                <input
                  type="number" min={1} value={soNhapThem}
                  onChange={e => setSoNhapThem(parseInt(e.target.value) || 1)}
                  className="w-full border-2 border-green-200 rounded-xl px-4 py-3 text-2xl font-bold text-center text-green-700 outline-none focus:border-green-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Sau khi nhập: Tổng = <strong>{sachNhapThem.tongSoBan + soNhapThem}</strong> · Còn lại = <strong className="text-green-600">{sachNhapThem.soBanConLai + soNhapThem}</strong>
                  {sachNhapThem.trangThai === 'hetSach' && (
                    <span className="ml-2 text-green-600 font-medium">→ ✅ Cho mượn</span>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setHienNhapThem(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangNhapThem || soNhapThem <= 0}
                  className="flex-1 py-2.5 text-sm text-white font-semibold rounded-xl disabled:opacity-60"
                  style={{ backgroundColor: '#16a34a' }}>
                  {dangNhapThem ? '⏳ Đang lưu...' : `➕ Nhập thêm ${soNhapThem} quyển`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL BÁO SÁCH LỖI ══ */}
      {hienLoi && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10"
              style={{ borderColor:'#fecaca' }}>
              <div>
                <h2 className="text-lg font-bold text-red-700">🚨 Báo cáo sách lỗi / hỏng</h2>
                <p className="text-xs text-gray-500 mt-0.5">Số lượng sách sẽ được trừ sau khi ghi nhận</p>
              </div>
              <button onClick={() => setHienLoi(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={guiBaoCaoLoi} className="p-6 space-y-5">

              {/* Thông tin sách đã chọn */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">📚 Sách bị lỗi</label>
                {(() => {
                  const s = dsSachChon.find(x => x._id === bLSachId)
                  return s ? (
                    <div className="p-3 rounded-xl border-2 border-blue-200 bg-blue-50 flex items-center gap-3">
                      <div className="w-10 h-12 rounded overflow-hidden bg-white shrink-0 border border-blue-100">
                        {s.anhBia ? <img src={s.anhBia} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-xl">📘</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.tenSach}</p>
                        <p className="text-xs text-gray-500">{s.tacGia} · {s.danhMuc}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color:'#0066CC' }}>
                          Tổng: {s.tongSoBan} bản · Còn lại: <span className={s.soBanConLai > 0 ? 'text-green-600' : 'text-red-500'}>{s.soBanConLai}</span>
                        </p>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  🔢 Số lượng sách bị lỗi *
                  <span className="ml-1 font-normal text-gray-400">(sẽ bị trừ khỏi tổng số)</span>
                </label>
                <input type="number" min={1}
                  max={dsSachChon.find(s=>s._id===bLSachId)?.tongSoBan||999}
                  value={bLSoLuong}
                  onChange={e => setBLSoLuong(parseInt(e.target.value)||1)}
                  className={ic} required />
              </div>

              {/* Loại lỗi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">⚠️ Nguyên nhân *</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOAI_LOI.map(l => (
                    <button key={l.key} type="button"
                      onClick={() => setBLLoaiLoi(l.key)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        bLLoaiLoi === l.key
                          ? `${l.mau} border-current ring-2 ring-offset-1 ring-current`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {l.nhan}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn sinh viên vi phạm — chỉ hiện khi doSinhVien */}
              {bLLoaiLoi === 'doSinhVien' && (
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                  <label className="block text-xs font-semibold text-red-700 mb-2">
                    👤 Sinh viên vi phạm *
                  </label>
                  <div className="relative">
                    <input
                      value={bLNguoiVP ? `${bLTenNguoiVP}` : tuKhoaND}
                      onChange={e => {
                        if (bLNguoiVP) { setBLNguoiVP(''); setBLTenNguoiVP('') }
                        setTuKhoaND(e.target.value)
                        setHienDropND(true)
                      }}
                      onFocus={() => setHienDropND(true)}
                      placeholder="🔍 Tìm theo tên, mã SV, số thẻ..."
                      className="w-full border-2 border-red-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white"
                    />
                    {bLNguoiVP && (
                      <button type="button" onClick={() => { setBLNguoiVP(''); setBLTenNguoiVP(''); setTuKhoaND('') }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg">✕</button>
                    )}
                    {/* Dropdown kết quả */}
                    {hienDropND && !bLNguoiVP && tuKhoaND && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {dangTimND ? (
                          <div className="py-4 text-center text-xs text-gray-400">⏳ Đang tìm...</div>
                        ) : dsNguoiDung.length === 0 ? (
                          <div className="py-4 text-center text-xs text-gray-400">Không tìm thấy</div>
                        ) : dsNguoiDung.map(nd => (
                          <div key={nd._id}
                            onClick={() => { setBLNguoiVP(nd._id); setBLTenNguoiVP(`${nd.hoTen} — ${nd.soThe||nd.maSoSV}`); setHienDropND(false) }}
                            className="px-4 py-2.5 hover:bg-red-50 cursor-pointer border-b border-gray-50 last:border-0">
                            <p className="text-sm font-medium text-gray-800">{nd.hoTen}</p>
                            <p className="text-[11px] text-gray-400">{nd.soThe} · {nd.maSoSV} · {nd.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {bLNguoiVP && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium">
                      ✅ Đã chọn: {bLTenNguoiVP}
                    </p>
                  )}
                </div>
              )}

              {/* Lý do chi tiết */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">📝 Mô tả chi tiết *</label>
                <textarea rows={3} value={bLLyDo} onChange={e => setBLLyDo(e.target.value)}
                  placeholder="Mô tả tình trạng sách, thời gian phát hiện..."
                  className={ic + ' resize-none'} required />
              </div>

              {/* Cảnh báo */}
              <div className="p-3 rounded-xl text-xs flex gap-2" style={{ backgroundColor:'#fff3e6', color:'#92400e' }}>
                <span className="text-base shrink-0">⚠️</span>
                <span>
                  Sau khi xác nhận, <strong>{bLSoLuong} bản</strong> sẽ bị trừ khỏi tổng số sách
                  {bLSachId && (() => { const s = dsSachChon.find(x=>x._id===bLSachId); return s ? ` "${s.tenSach}"` : '' })()}.
                  Hành động này không thể hoàn tác.
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setHienLoi(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangGuiLoi}
                  className="flex-1 py-2.5 text-sm text-white font-semibold rounded-xl disabled:opacity-60"
                  style={{ backgroundColor:'#dc2626' }}>
                  {dangGuiLoi ? '⏳ Đang gửi...' : '🚨 Xác nhận báo cáo lỗi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL FORM THÊM/SỬA SÁCH ══ */}
      {hienForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{sachDangSua?'✏️ Chỉnh sửa sách':'📚 Thêm sách mới'}</h2>
              <button onClick={() => setHienForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={luuSach} className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Thông tin sách
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên sách *</label>
                    <input required value={form.tenSach} onChange={e=>setForm({...form,tenSach:e.target.value})} placeholder="Nhập tên sách..." className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tác giả *</label>
                    <input required value={form.tacGia} onChange={e=>setForm({...form,tacGia:e.target.value})} placeholder="Tên tác giả" className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã ISBN</label>
                    <input value={form.maSach} onChange={e=>setForm({...form,maSach:e.target.value})} placeholder="978-604-..." className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Danh mục *</label>
                    <select required value={form.danhMuc} onChange={e=>setForm({...form,danhMuc:e.target.value})} className={ic}>
                      {DANH_MUC.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nhà xuất bản</label>
                    <input value={form.nhaXuatBan} onChange={e=>setForm({...form,nhaXuatBan:e.target.value})} placeholder="NXB Bách Khoa..." className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Năm xuất bản</label>
                    <input type="number" min={1900} max={2030} value={form.namXuatBan} onChange={e=>setForm({...form,namXuatBan:parseInt(e.target.value)})} className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ký hiệu xếp giá</label>
                    <input value={form.kyHieu} onChange={e=>setForm({...form,kyHieu:e.target.value})} placeholder="005.13/NGU" className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lần tái bản</label>
                    <input value={form.taiBan} onChange={e=>setForm({...form,taiBan:e.target.value})} placeholder="Tái bản lần 3" className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số trang</label>
                    <input type="number" min={0} value={form.soTrang} onChange={e=>setForm({...form,soTrang:parseInt(e.target.value)||0})} className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vị trí kệ sách</label>
                    <input value={form.viTriKe} onChange={e=>setForm({...form,viTriKe:e.target.value})} placeholder="A1-K01" className={ic} />
                  </div>

                  {/* ✅ Chỉ nhập tổng số bản — soBanConLai tự tính khi thêm mới */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Tổng số bản *
                      {!sachDangSua && <span className="ml-1 text-[10px] font-normal text-blue-500">(số còn lại = tổng khi thêm mới)</span>}
                    </label>
                    <input type="number" required min={0} value={form.tongSoBan}
                      onChange={e=>setForm({...form,tongSoBan:parseInt(e.target.value)||0})} className={ic} />
                  </div>

                  {/* Khi sửa: hiển thị số còn lại để biết */}
                  {sachDangSua && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số bản còn lại</label>
                      <div className={`${ic} bg-gray-50 text-gray-500 cursor-not-allowed flex items-center`}>
                        <span className={`font-bold ${sachDangSua.soBanConLai > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {sachDangSua.soBanConLai}
                        </span>
                        <span className="ml-2 text-[10px] text-gray-400">(dùng "Báo sách lỗi" để điều chỉnh)</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái</label>
                    <select value={form.trangThai} onChange={e=>setForm({...form,trangThai:e.target.value})} className={ic}>
                      <option value="choMuon">Cho mượn</option>
                      <option value="hetSach">Hết sách</option>
                      <option value="baoTri">Bảo trì</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
                    <textarea rows={3} value={form.moTa} onChange={e=>setForm({...form,moTa:e.target.value})}
                      placeholder="Mô tả nội dung sách..." className={ic} />
                  </div>
                </div>
              </div>

              {/* Ảnh sách */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Ảnh sách
                  <span className="text-xs font-normal text-gray-400">({danhSachAnh.length}/5 — ảnh đầu là bìa)</span>
                </h3>
                {danhSachAnh.length < 5 && (
                  <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 text-center bg-blue-50 mb-4">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-xs text-gray-400 mb-3">JPG, PNG, WEBP — tối đa 5MB/ảnh — còn {5-danhSachAnh.length} slot</p>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                      onChange={xuLyUploadAnh} className="hidden" id="inputAnhSach" disabled={dangUpload} />
                    <label htmlFor="inputAnhSach"
                      className={`inline-block px-5 py-2 text-white text-sm rounded-lg ${dangUpload?'bg-gray-400 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                      {dangUpload?'⏳ Đang tải...':'📤 Chọn ảnh'}
                    </label>
                  </div>
                )}
                {loiAnh && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">⚠️ {loiAnh}</div>}
                {danhSachAnh.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {danhSachAnh.map((url, idx) => (
                      <div key={url+idx} className="relative group">
                        <div className={`aspect-[3/4] rounded-xl overflow-hidden border-2 ${idx===0?'border-blue-500':'border-gray-200'}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                        {idx===0 && <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BÌA</div>}
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          {idx!==0 && <button type="button" onClick={() => setDanhSachAnh(p=>{const a=[...p];const[c]=a.splice(idx,1);return[c,...a]})}
                            className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded-lg w-20">⭐ Đặt bìa</button>}
                          <button type="button" onClick={() => setDanhSachAnh(p=>p.filter((_,i)=>i!==idx))}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] rounded-lg w-20">🗑 Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400 text-center py-3">Chưa có ảnh — hiển thị icon mặc định 📘</p>}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setHienForm(false)}
                  className="px-5 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangLuu}
                  className="px-5 py-2.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                  {dangLuu && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                  {dangLuu ? 'Đang lưu...' : sachDangSua ? '💾 Cập nhật' : '➕ Thêm sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
