'use client'
/**
 * TRANG CHỦ — Load danh mục động từ DB
 * Đường dẫn: src/app/page.tsx
 */

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

// Icon theo tên danh mục
const ICON_MAP: Record<string, string> = {
  'Công nghệ thông tin': '💻',
  'Kinh tế':             '📈',
  'Kỹ thuật':            '⚙️',
  'Văn học':             '📖',
  'Ngoại ngữ':           '🌐',
  'Luật':                '⚖️',
  'Khoa học tự nhiên':   '🔬',
  'Khoa học xã hội':     '🏛️',
  'Y - Dược':            '🏥',
  'Nông - Lâm - Ngư':   '🌾',
  'Giáo dục':            '🎓',
  'Nghệ thuật':          '🎨',
  'Tham khảo':           '📚',
  'Khác':                '📁',
}

// Màu xoay vòng cho danh mục
const MAU_LIST = [
  { mauNen:'#e6f0ff', mauChu:'#0052a3', mauVien:'#99c2ff' },
  { mauNen:'#fff3e6', mauChu:'#c36119', mauVien:'#ffcf99' },
  { mauNen:'#f3e8ff', mauChu:'#6b21a8', mauVien:'#d8b4fe' },
  { mauNen:'#fefce8', mauChu:'#854d0e', mauVien:'#fde047' },
  { mauNen:'#fff7ed', mauChu:'#9a3412', mauVien:'#fdba74' },
  { mauNen:'#f0fdf4', mauChu:'#166534', mauVien:'#86efac' },
  { mauNen:'#fdf2f8', mauChu:'#831843', mauVien:'#f9a8d4' },
  { mauNen:'#ecfdf5', mauChu:'#065f46', mauVien:'#6ee7b7' },
  { mauNen:'#eff6ff', mauChu:'#1e40af', mauVien:'#93c5fd' },
  { mauNen:'#fef3c7', mauChu:'#92400e', mauVien:'#fcd34d' },
  { mauNen:'#fce7f3', mauChu:'#9d174d', mauVien:'#f9a8d4' },
  { mauNen:'#e0f2fe', mauChu:'#075985', mauVien:'#7dd3fc' },
  { mauNen:'#dcfce7', mauChu:'#14532d', mauVien:'#86efac' },
  { mauNen:'#f1f5f9', mauChu:'#334155', mauVien:'#cbd5e1' },
]

const THONG_KE = [
  { so: '58.000+', nhan: 'Đầu sách',       icon: '📚' },
  { so: '12.400+', nhan: 'Thành viên',     icon: '👥' },
  { so: '95.000+', nhan: 'Lượt mượn/năm', icon: '📋' },
  { so: '13.5h',   nhan: 'Mở cửa/ngày',   icon: '⏰' },
]

export default function TrangChu() {
  const { data: phienDangNhap, status } = useSession()
  const nguoiDung = phienDangNhap?.user as any

  const [danhSachSach,  setDanhSachSach]  = useState<any[]>([])
  const [danhSachTin,   setDanhSachTin]   = useState<any[]>([])
  const [danhMucDB,     setDanhMucDB]     = useState<any[]>([])  // ✅ Load từ DB
  const [dangTai,       setDangTai]       = useState(true)

  // Redirect admin khi vừa đăng nhập
  useEffect(() => {
    if (
      status === 'authenticated' &&
      (nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'thuThu') &&
      document.referrer.includes('/auth/dangnhap')
    ) {
      window.location.href = '/admin'
    }
  }, [status, nguoiDung])

  // Tải sách + tin tức + danh mục
  useEffect(() => {
    async function taiDuLieu() {
      try {
        const [resSach, resTin, resDM] = await Promise.all([
          fetch('/api/sach?gioiHan=8'),
          fetch('/api/tintuc?gioiHan=3'),
          fetch('/api/danhMuc'),
        ])
        const [jSach, jTin, jDM] = await Promise.all([resSach.json(), resTin.json(), resDM.json()])
        if (jSach.thanhCong) setDanhSachSach(jSach.duLieu.danhSachSach)
        if (jTin.thanhCong)  setDanhSachTin(jTin.duLieu.danhSach)
        if (jDM.thanhCong)   setDanhMucDB(jDM.duLieu.filter((d: any) => d.hoatDong !== false))
      } finally {
        setDangTai(false)
      }
    }
    taiDuLieu()
  }, [])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />

      {/* ── HERO ── */}
      <section className="relative text-white py-16 md:py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002952 0%, #0066CC 60%, #1a77ff 100%)' }}>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10"
          style={{ background: 'linear-gradient(to left, #F47920, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-1" style={{ backgroundColor: '#F47920' }} />
        <div className="relative max-w-7xl mx-auto px-4">
          {nguoiDung && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
              <span>👋</span>
              <span>Xin chào, <strong>{nguoiDung.name}</strong>! Số thẻ: {nguoiDung.soThe}</span>
            </div>
          )}
          <h1 className="tieu-de-thu-vien text-4xl md:text-5xl font-bold leading-tight mb-4">
            Kho tri thức<br />
            <span style={{ color: '#F47920' }}>không giới hạn</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Hàng nghìn đầu sách phục vụ học tập và nghiên cứu tại Trung tâm CNTT & Thư viện UTT.
          </p>
          <form action="/sach" method="get" className="flex gap-2 max-w-lg">
            <input name="tuKhoa" type="text" placeholder="Nhập tên sách, tác giả, mã ISBN..."
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 text-sm outline-none shadow-lg" />
            <button type="submit"
              className="font-semibold px-6 py-3.5 rounded-xl text-sm shadow-lg text-white"
              style={{ backgroundColor: '#F47920' }}>
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* ── THỐNG KÊ ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {THONG_KE.map((s) => (
            <div key={s.nhan} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: '#e6f0ff' }}>{s.icon}</div>
              <div>
                <div className="text-xl font-bold" style={{ color: '#0066CC' }}>{s.so}</div>
                <div className="text-xs text-gray-500">{s.nhan}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THÔNG TIN SINH VIÊN ── */}
      {nguoiDung?.vaiTro === 'sinhVien' && (
        <section className="border-b border-blue-100" style={{ backgroundColor: '#e6f0ff' }}>
          <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { so: nguoiDung.dangMuon ?? 0,                       nhan:'Đang mượn',     mauChu:'#0066CC' },
              { so: Math.max(0, 5-(nguoiDung.dangMuon??0)),        nhan:'Còn được mượn', mauChu:'#16a34a' },
              { so: 0,                                              nhan:'Quá hạn',        mauChu:'#dc2626' },
            ].map((item) => (
              <div key={item.nhan} className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                <div className="text-2xl font-bold" style={{ color: item.mauChu }}>{item.so}</div>
                <div className="text-xs text-gray-500 mt-1">{item.nhan}</div>
              </div>
            ))}
            <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
              <div className="text-sm font-semibold"
                style={{ color: nguoiDung.trangThaiThe==='hoatDong'?'#16a34a':'#ca8a04' }}>
                {nguoiDung.trangThaiThe==='hoatDong'?'✅ Thẻ hoạt động':'⏳ Chờ kích hoạt'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Trạng thái thẻ</div>
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full space-y-14">

        {/* ── DANH MỤC SÁCH — load từ DB ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 duong-trang-tri">Danh mục sách</h2>
            <Link href="/sach" className="text-sm font-medium hover:underline" style={{ color:'#0066CC' }}>Xem tất cả →</Link>
          </div>
          {dangTai ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
              {[...Array(7)].map((_,i) => <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {danhMucDB.map((dm, idx) => {
                const mau  = MAU_LIST[idx % MAU_LIST.length]
                const icon = ICON_MAP[dm.ten] || '📁'
                return (
                  <Link key={dm._id} href={`/sach?danhMuc=${encodeURIComponent(dm.ten)}`}>
                    <div className="border-2 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-1.5"
                      style={{ backgroundColor:mau.mauNen, borderColor:mau.mauVien, color:mau.mauChu }}>
                      <div className="text-2xl">{icon}</div>
                      <div className="text-[11px] font-semibold leading-snug">{dm.ten}</div>
                      {dm.soSach > 0 && (
                        <div className="text-[10px] opacity-60">{dm.soSach} cuốn</div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── SÁCH MỚI NHẤT ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 duong-trang-tri">Sách mới nhất</h2>
            <Link href="/sach" className="text-sm font-medium hover:underline" style={{ color:'#0066CC' }}>Xem tất cả →</Link>
          </div>
          {dangTai ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_,i) => <div key={i} className="bg-gray-100 rounded-xl h-56 animate-pulse"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {danhSachSach.map((sach: any) => (
                <Link key={sach._id} href={`/sach/${sach._id}`}>
                  <div className="bg-white rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-300 transition-all group overflow-hidden">
                    <div className="h-44 flex items-center justify-center" style={{ backgroundColor:'#e6f0ff' }}>
                      {sach.anhBia
                        ? <img src={sach.anhBia} alt={sach.tenSach} className="h-full w-full object-cover"/>
                        : <span className="text-5xl">📘</span>}
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-medium mb-1" style={{ color:'#0066CC' }}>{sach.danhMuc}</div>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
                        {sach.tenSach}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{sach.tacGia}</p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={sach.soBanConLai>0?{backgroundColor:'#dcfce7',color:'#166534'}:{backgroundColor:'#fee2e2',color:'#991b1b'}}>
                          {sach.soBanConLai>0?`Còn ${sach.soBanConLai} bản`:'Hết sách'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── TIN TỨC ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 duong-trang-tri">Tin tức & Thông báo</h2>
            <Link href="/tintuc" className="text-sm font-medium hover:underline" style={{ color:'#0066CC' }}>Xem tất cả →</Link>
          </div>
          {danhSachTin.length===0&&!dangTai ? (
            <div className="text-center py-10 text-gray-400 text-sm">Chưa có tin tức nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {danhSachTin.map((tin: any) => (
                <Link key={tin._id} href={`/tintuc/${tin.duongDan}`}>
                  <div className="bg-white rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-300 transition-all group p-5 h-full">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-2"
                      style={tin.loai==='thongBao'?{backgroundColor:'#fff3e6',color:'#c36119'}:tin.loai==='suKien'?{backgroundColor:'#dcfce7',color:'#166534'}:{backgroundColor:'#e6f0ff',color:'#0052a3'}}>
                      {tin.loai==='thongBao'?'📢 Thông báo':tin.loai==='suKien'?'🎉 Sự kiện':'📰 Tin tức'}
                    </span>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors text-sm leading-snug mb-2">{tin.tieuDe}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{tin.tomTat}</p>
                    <div className="text-xs text-gray-400 mt-3">{tin.ngayDang?new Date(tin.ngayDang).toLocaleDateString('vi-VN'):''}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── CTA ── */}
        {!phienDangNhap && (
          <section className="rounded-2xl px-8 py-12 text-white text-center relative overflow-hidden"
            style={{ background:'linear-gradient(135deg,#002952,#0066CC)' }}>
            <div className="relative">
              <div className="text-4xl mb-4">📚</div>
              <h2 className="tieu-de-thu-vien text-3xl font-bold mb-2">Chưa có thẻ thư viện?</h2>
              <p className="text-blue-200 text-sm mb-6">Đăng ký miễn phí — bắt đầu mượn sách ngay hôm nay</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/auth/dangky" className="font-semibold px-8 py-3 rounded-xl text-sm text-white" style={{ backgroundColor:'#F47920' }}>
                  Đăng ký thẻ miễn phí
                </Link>
                <Link href="/sach" className="border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
                  Khám phá sách
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <ChanTrang />
    </div>
  )
}
