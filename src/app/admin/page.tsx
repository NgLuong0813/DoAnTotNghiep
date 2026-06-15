'use client'
/**
 * TRANG — Admin Tổng Quan / Dashboard Thống Kê
 * Đường dẫn: src/app/admin/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const LOAI_LOI_LABEL: Record<string, string> = {
  doSinhVien: '👤 Do sinh viên', amUot: '💧 Ẩm ướt',
  cuRach: '📄 Cũ rách', vietChuLen: '✏️ Viết lên',
  banChu: '🖊️ Bẩn/mờ', khac: '❓ Khác',
}

const MAUS = ['#0066CC','#F47920','#16a34a','#7c3aed','#dc2626','#0891b2','#d97706','#9ca3af']

const LOC_OPTIONS = [
  { key: 'ngay',  nhan: 'Hôm nay' },
  { key: 'tuan',  nhan: 'Tuần này' },
  { key: 'thang', nhan: 'Tháng này' },
  { key: 'nam',   nhan: 'Năm nay' },
  { key: 'tuy',   nhan: 'Tùy chọn' },
]

export default function TrangAdminTongQuan() {
  const { data: phien, status } = useSession()
  const nd     = phien?.user as any
  const router = useRouter()

  const [duLieu,    setDuLieu]    = useState<any>(null)
  const [dangTai,   setDangTai]   = useState(true)
  const [loai,      setLoai]      = useState('thang')
  const [tuNgay,    setTuNgay]    = useState('')
  const [denNgay,   setDenNgay]   = useState('')
  const [tinNhanMoi, setTinNhanMoi] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nd?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nd, router])

  const taiDuLieu = useCallback(async () => {
    setDangTai(true)
    const p = new URLSearchParams({ loai })
    if (loai === 'tuy' && tuNgay && denNgay) {
      p.set('tuNgay', tuNgay); p.set('denNgay', denNgay)
    }
    try {
      const [resThongKe, resChat] = await Promise.all([
        fetch(`/api/thongKe?${p}`),
        fetch('/api/chat'),
      ])
      const [jTK, jChat] = await Promise.all([resThongKe.json(), resChat.json()])
      if (jTK.thanhCong) setDuLieu(jTK.duLieu)
      if (jChat.thanhCong) {
        const ds = jChat.duLieu || []
        setTinNhanMoi(ds.reduce((s: number, c: any) => s + (c.soTinChuaDoc || 0), 0))
      }
    } catch {}
    setDangTai(false)
  }, [loai, tuNgay, denNgay])

  useEffect(() => {
    if (status === 'authenticated') taiDuLieu()
  }, [taiDuLieu, status])

  const fLoai = (l: string) => LOC_OPTIONS.find(x => x.key === l)?.nhan || l

  // Merge trend data
  const trendData = (() => {
    if (!duLieu) return []
    const map: Record<string, any> = {}
    for (const d of duLieu.trendMuon || []) map[d._id] = { nhan: d._id, soMuon: d.soMuon, soTra: 0 }
    for (const d of duLieu.trendTra  || []) {
      if (map[d._id]) map[d._id].soTra = d.soTra
      else map[d._id] = { nhan: d._id, soMuon: 0, soTra: d.soTra }
    }
    return Object.values(map).sort((a: any, b: any) => a.nhan.localeCompare(b.nhan))
  })()

  const KhungSo = ({ icon, nhan, so, mauNen, mauChu, href, badge }: any) => (
    <Link href={href || '#'}>
      <div className="rounded-2xl p-4 border hover:shadow-md transition-all cursor-pointer h-full"
        style={{ backgroundColor: mauNen, borderColor: mauNen }}>
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          {badge && <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-red-500">{badge}</span>}
        </div>
        <div className="text-3xl font-bold" style={{ color: mauChu }}>
          {dangTai ? '—' : (so ?? 0).toLocaleString()}
        </div>
        <div className="text-xs mt-0.5 opacity-80" style={{ color: mauChu }}>{nhan}</div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin trangHienTai="/admin" tenNguoiDung={nd?.name} tinNhanMoi={tinNhanMoi} />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* Header + Bộ lọc */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 Tổng quan hệ thống</h1>
            <p className="text-sm text-gray-500 mt-0.5">Trung tâm CNTT & Thư viện UTT</p>
          </div>

          {/* Bộ lọc thời gian */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
              {LOC_OPTIONS.filter(o => o.key !== 'tuy').map(o => (
                <button key={o.key} onClick={() => setLoai(o.key)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    loai === o.key ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={loai === o.key ? { backgroundColor: '#0066CC' } : {}}>
                  {o.nhan}
                </button>
              ))}
              <button onClick={() => setLoai('tuy')}
                className={`px-3 py-2 text-xs font-medium transition-colors border-l ${
                  loai === 'tuy' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={loai === 'tuy' ? { backgroundColor: '#0066CC' } : {}}>
                📅 Tùy chọn
              </button>
            </div>

            {loai === 'tuy' && (
              <div className="flex items-center gap-2">
                <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400" />
                <span className="text-gray-400 text-xs">—</span>
                <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400" />
                <button onClick={taiDuLieu}
                  className="px-3 py-2 text-xs text-white rounded-lg font-medium"
                  style={{ backgroundColor: '#0066CC' }}>Xem</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Thẻ thống kê ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <KhungSo icon="📚" nhan="Tổng đầu sách"     so={duLieu?.tongSach}      mauNen="#e6f0ff" mauChu="#0066CC" href="/admin/sach" />
          <KhungSo icon="👥" nhan="Sinh viên"          so={duLieu?.tongNguoiDung} mauNen="#dcfce7" mauChu="#16a34a" href="/admin/nguoidung" />
          <KhungSo icon="📋" nhan="Phiếu mượn kỳ này" so={duLieu?.tongMuonKy}    mauNen="#f3e8ff" mauChu="#7c3aed" href="/admin/muontra" />
          <KhungSo icon="📖" nhan="Đang mượn"          so={duLieu?.dangMuon}      mauNen="#fff3e6" mauChu="#F47920" href="/admin/muontra?trangThai=dangMuon" />
          <KhungSo icon="⚠️" nhan="Quá hạn chưa trả"  so={duLieu?.soQuaHan}      mauNen="#fee2e2" mauChu="#dc2626" href="/admin/muontra?trangThai=dangMuon"
            badge={duLieu?.soQuaHan > 0 ? '!' : undefined} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KhungSo icon="✅" nhan="Đã trả kỳ này"   so={duLieu?.daTra}      mauNen="#f0fdf4" mauChu="#16a34a" href="/admin/muontra?trangThai=daTra" />
          <KhungSo icon="⏳" nhan="Chờ duyệt"        so={duLieu?.choDuyet}   mauNen="#fef9c3" mauChu="#854d0e" href="/admin/muontra?trangThai=choDuyet" />
          <KhungSo icon="❌" nhan="Từ chối kỳ này"   so={duLieu?.tuChoi}     mauNen="#fef2f2" mauChu="#b91c1c" href="/admin/muontra?trangThai=tuChoi" />
          <KhungSo icon="🚨" nhan="Tổng sách lỗi" so={duLieu?.tongLoiKy}  mauNen="#fef2f2" mauChu="#dc2626" href="/admin/sach/loiSach" />
        </div>

        {/* ── Biểu đồ xu hướng mượn/trả ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              📈 Xu hướng mượn / trả
              <span className="text-xs font-normal text-gray-400">({fLoai(loai)})</span>
            </h2>
            {dangTai ? (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">⏳ Đang tải...</div>
            ) : trendData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nhan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="soMuon" name="Mượn" stroke="#0066CC" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="soTra"  name="Trả"  stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Phân bổ trạng thái phiếu mượn */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">🥧 Trạng thái phiếu</h2>
            {dangTai ? (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">⏳ Đang tải...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Đang mượn', value: duLieu?.dangMuon || 0 },
                      { name: 'Đã trả',    value: duLieu?.daTra    || 0 },
                      { name: 'Chờ duyệt', value: duLieu?.choDuyet || 0 },
                      { name: 'Quá hạn',   value: duLieu?.soQuaHan || 0 },
                    ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {['#0066CC','#16a34a','#854d0e','#dc2626'].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {[
                    { nhan:'Đang mượn', so:duLieu?.dangMuon, mau:'#0066CC' },
                    { nhan:'Đã trả',    so:duLieu?.daTra,    mau:'#16a34a' },
                    { nhan:'Chờ duyệt', so:duLieu?.choDuyet, mau:'#854d0e' },
                    { nhan:'Quá hạn',   so:duLieu?.soQuaHan, mau:'#dc2626' },
                  ].map(i => (
                    <div key={i.nhan} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: i.mau }} />
                      <span className="text-gray-600">{i.nhan}: <strong>{i.so || 0}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Top sách + Top người mượn ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Top sách mượn nhiều */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">🏆 Top sách được mượn nhiều</h2>
            {dangTai ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">⏳</div>
            ) : !duLieu?.topSach?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={duLieu.topSach.map((s: any) => ({ ...s, ten: s.tenSach.length > 20 ? s.tenSach.slice(0,20)+'…' : s.tenSach }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="ten" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} lần`, 'Số lượt mượn']} labelFormatter={(l) => l} />
                  <Bar dataKey="soLan" name="Lượt mượn" radius={[0, 4, 4, 0]}>
                    {(duLieu.topSach || []).map((_: any, i: number) => <Cell key={i} fill={MAUS[i % MAUS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top người mượn */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">👑 Top người mượn nhiều nhất</h2>
            {dangTai ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">⏳</div>
            ) : !duLieu?.topNguoiMuon?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Không có dữ liệu</div>
            ) : (
              <div className="space-y-2">
                {duLieu.topNguoiMuon.slice(0, 7).map((nd: any, i: number) => (
                  <div key={nd._id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: i < 3 ? ['#F47920','#9ca3af','#d97706'][i] : '#e5e7eb', color: i < 3 ? 'white' : '#6b7280' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{nd.hoTen}</p>
                      <p className="text-[11px] text-gray-400">{nd.soThe}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.round((nd.soLan / (duLieu.topNguoiMuon[0]?.soLan || 1)) * 80)}px`, backgroundColor: MAUS[i % MAUS.length] }} />
                      <span className="text-xs font-bold text-gray-600 w-8 text-right">{nd.soLan}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Mượn theo danh mục + Sách lỗi theo loại ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Theo danh mục */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">🗂️ Mượn theo danh mục</h2>
            {dangTai ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">⏳</div>
            ) : !duLieu?.muonTheoDanhMuc?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={duLieu.muonTheoDanhMuc.map((d: any) => ({ ...d, ten: (d.danhMuc||'Khác').length > 16 ? (d.danhMuc||'Khác').slice(0,16)+'…' : (d.danhMuc||'Khác') }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ten" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} lần`, 'Lượt mượn']} />
                  <Bar dataKey="soLan" name="Lượt mượn" radius={[4, 4, 0, 0]}>
                    {(duLieu.muonTheoDanhMuc || []).map((_: any, i: number) => <Cell key={i} fill={MAUS[i % MAUS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sách lỗi theo loại */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">🚨 Sách lỗi theo nguyên nhân</h2>
            {dangTai ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">⏳</div>
            ) : !duLieu?.loiTheoLoai?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Không có báo cáo lỗi nào</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={duLieu.loiTheoLoai.map((l: any) => ({ name: LOAI_LOI_LABEL[l._id]||l._id, value: l.soLuong }))}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${value}`}>
                      {(duLieu.loiTheoLoai || []).map((_: any, i: number) => <Cell key={i} fill={MAUS[i % MAUS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {duLieu.loiTheoLoai.map((l: any, i: number) => (
                    <div key={l._id} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MAUS[i % MAUS.length] }} />
                      <span className="text-gray-600 truncate">{LOAI_LOI_LABEL[l._id]||l._id}: <strong>{l.soLuong}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Sách sắp hết ── */}
        {duLieu?.sachSapHet?.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 p-5 mb-4">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚠️ Sách sắp hết kho
              <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Còn ≤ 2 bản</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {duLieu.sachSapHet.map((sach: any) => (
                <Link key={sach._id} href="/admin/sach"
                  className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors">
                  <div className="shrink-0">
                    <div className={`text-lg font-bold ${sach.soBanConLai === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {sach.soBanConLai}
                    </div>
                    <div className="text-[10px] text-gray-400">/{sach.tongSoBan}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{sach.tenSach}</p>
                    <p className="text-[11px] text-gray-400 truncate">{sach.tacGia}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
