'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

const LOAI_TIN: Record<string, string> = {
  tinTuc:'📰 Tin tức', thongBao:'📢 Thông báo', suKien:'🎉 Sự kiện', noiQuy:'📋 Nội quy',
}
const formMacDinh = { tieuDe:'', tomTat:'', noiDungHtml:'', loai:'tinTuc', trangThai:'daXuatBan', tenFileWord:'', anhDaiDien:'' }

export default function TrangAdminTinTuc() {
  const { data: phien, status } = useSession()
  const nguoiDung = phien?.user as any
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [danhSach, setDanhSach] = useState<any[]>([])
  const [phanTrang, setPhanTrang] = useState({ tongSo:0, tongTrang:1 })
  const [dangTai, setDangTai] = useState(true)
  const [trang, setTrang] = useState(1)
  const [thongBao, setThongBao] = useState({ loai:'', noi:'' })
  const [hienForm, setHienForm] = useState(false)
  const [dangUpload, setDangUpload] = useState(false)
  const [dangLuu, setDangLuu] = useState(false)
  const [form, setForm] = useState(formMacDinh)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nguoiDung?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nguoiDung, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const res = await fetch(`/api/tintuc?trang=${trang}&gioiHan=10&tatCa=true`)
    const json = await res.json()
    if (json.thanhCong) { setDanhSach(json.duLieu.danhSach); setPhanTrang({ tongSo:json.duLieu.tongSo, tongTrang:json.duLieu.tongTrang }) }
    setDangTai(false)
  }, [trang])

  useEffect(() => { taiDuLieu() }, [taiDuLieu])
  useEffect(() => { if (thongBao.noi) { const t = setTimeout(()=>setThongBao({loai:'',noi:''}),3000); return ()=>clearTimeout(t) } }, [thongBao])

  const xuLyUploadWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.docx')) { setThongBao({ loai:'loi', noi:'Chỉ chấp nhận file Word (.docx)' }); return }
    setDangUpload(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/taiLen?loai=word', { method:'POST', body:fd })
    const json = await res.json()
    setDangUpload(false)
    if (json.thanhCong) {
      setForm(f => ({ ...f, tieuDe:json.tieuDe, noiDungHtml:json.noiDungHtml, tenFileWord:json.tenFileWord, anhDaiDien:json.anhDaiDien||'',
        tomTat: json.noiDungHtml.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().substring(0,200) }))
      setThongBao({ loai:'ok', noi:`Đã đọc file "${json.tenFileWord}"` })
    } else setThongBao({ loai:'loi', noi:json.thongBao })
    if (fileRef.current) fileRef.current.value = ''
  }

  const luuBaiViet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.tieuDe || !form.noiDungHtml) { setThongBao({ loai:'loi', noi:'Vui lòng upload file Word' }); return }
    setDangLuu(true)
    const res = await fetch('/api/tintuc', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, nguoiDang:nguoiDung?.id||null, ngayDang:form.trangThai==='daXuatBan'?new Date().toISOString():null }) })
    const json = await res.json()
    setDangLuu(false)
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:'Đăng bài thành công!' }); setHienForm(false); setForm(formMacDinh); taiDuLieu() }
    else setThongBao({ loai:'loi', noi:json.thongBao })
  }

  const xoaBaiViet = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return
    const res = await fetch(`/api/tintuc/${id}`, { method:'DELETE' })
    const json = await res.json()
    if (json.thanhCong) { setThongBao({ loai:'ok', noi:'Đã xóa!' }); taiDuLieu() }
  }

  const ic = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin trangHienTai="/admin/tintuc" tenNguoiDung={nguoiDung?.name} />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý tin tức</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tổng: {phanTrang.tongSo} bài viết</p>
          </div>
          <button onClick={()=>{setForm(formMacDinh);setHienForm(true)}} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
            + Đăng bài mới
          </button>
        </div>

        {thongBao.noi && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${thongBao.loai==='ok'?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>
            {thongBao.loai==='ok'?'✅':'⚠️'} {thongBao.noi}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {dangTai ? <div className="py-20 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          : danhSach.length===0 ? <div className="py-20 text-center text-gray-400"><div className="text-4xl mb-2">📭</div><div className="text-sm">Chưa có bài viết nào</div></div>
          : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Ảnh bìa</th>
                  <th className="px-4 py-3 text-left">Tiêu đề</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-center">Ngày đăng</th>
                  <th className="px-4 py-3 text-center">Lượt xem</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {danhSach.map((tin) => (
                  <tr key={tin._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="w-14 h-10 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">{tin.anhDaiDien?<img src={tin.anhDaiDien} alt={tin.tieuDe} className="w-full h-full object-cover"/>:<span className="text-xl">📰</span>}</div></td>
                    <td className="px-4 py-3 max-w-[260px]"><p className="font-medium text-gray-800 truncate">{tin.tieuDe}</p>{tin.tenFileWord&&<p className="text-xs text-gray-400 truncate">📄 {tin.tenFileWord}</p>}</td>
                    <td className="px-4 py-3"><span className="text-xs">{LOAI_TIN[tin.loai]||tin.loai}</span></td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">{tin.ngayDang?new Date(tin.ngayDang).toLocaleDateString('vi-VN'):'—'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{tin.luotXem||0}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${tin.trangThai==='daXuatBan'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{tin.trangThai==='daXuatBan'?'✅ Đã đăng':'📝 Nháp'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1.5 justify-center"><Link href={`/tintuc/${tin.duongDan}`} target="_blank" className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100">👁 Xem</Link><button onClick={()=>xoaBaiViet(tin._id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">🗑 Xóa</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {hienForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">📰 Đăng bài viết mới</h2>
              <button onClick={()=>setHienForm(false)} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={luuBaiViet} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 text-center bg-blue-50">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm font-medium text-gray-700 mb-1">Upload file Word (.docx)</p>
                <input ref={fileRef} type="file" accept=".docx" onChange={xuLyUploadWord} className="hidden" id="fileWord"/>
                <label htmlFor="fileWord" className={`inline-block px-5 py-2 text-white text-sm rounded-lg ${dangUpload?'bg-gray-400 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                  {dangUpload?'⏳ Đang đọc...':'📤 Chọn file Word'}
                </label>
                {form.tenFileWord && <p className="mt-2 text-xs text-green-600 font-medium">✅ {form.tenFileWord}</p>}
              </div>
              {form.anhDaiDien && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img src={form.anhDaiDien} alt="Ảnh bìa" className="w-20 h-14 object-cover rounded-lg border"/>
                  <div><p className="text-xs font-semibold text-gray-700">🖼 Ảnh bìa</p><button type="button" onClick={()=>setForm(f=>({...f,anhDaiDien:''}))} className="text-[10px] text-red-500 hover:underline mt-1">Xóa ảnh bìa</button></div>
                </div>
              )}
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Tiêu đề *</label><input required value={form.tieuDe} onChange={e=>setForm(f=>({...f,tieuDe:e.target.value}))} className={ic}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại</label><select value={form.loai} onChange={e=>setForm(f=>({...f,loai:e.target.value}))} className={ic}><option value="tinTuc">📰 Tin tức</option><option value="thongBao">📢 Thông báo</option><option value="suKien">🎉 Sự kiện</option><option value="noiQuy">📋 Nội quy</option></select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái</label><select value={form.trangThai} onChange={e=>setForm(f=>({...f,trangThai:e.target.value}))} className={ic}><option value="daXuatBan">✅ Xuất bản ngay</option><option value="nhap">📝 Lưu nháp</option></select></div>
              </div>
              {form.noiDungHtml && <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Xem trước</label><div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto text-sm" dangerouslySetInnerHTML={{__html:form.noiDungHtml}}/></div>}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={()=>setHienForm(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={dangLuu||!form.noiDungHtml} className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">{dangLuu?'⏳ Đang lưu...':'📰 Đăng bài'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
