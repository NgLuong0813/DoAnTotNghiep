'use client'
/**
 * TRANG — Giới Thiệu Thư Viện UTT
 * Đường dẫn: src/app/gioiThieu/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ThanhDieuHuong from '@/components/layout/ThanhDieuHuong'
import ChanTrang from '@/components/layout/ChanTrang'

const SLIDES = [
  {
    id: 1,
    tieuDe: 'Chào mừng đến với Thư Viện UTT',
    moTa: 'Trung tâm tri thức hàng đầu của Trường Đại học Công nghệ Giao thông Vận tải — nơi hội tụ hơn 58.000 đầu sách và tài liệu học thuật phong phú.',
    icon: '📚',
    mauNen: 'linear-gradient(135deg, #002952 0%, #0066CC 60%, #1a77ff 100%)',
    thongKe: [
      { so: '58.000+', nhan: 'Đầu sách' },
      { so: '12.400+', nhan: 'Thành viên' },
      { so: '95.000+', nhan: 'Lượt mượn/năm' },
      { so: '500m²',   nhan: 'Không gian đọc' },
    ],
  },
  {
    id: 2,
    tieuDe: 'Kho Tài Nguyên Phong Phú',
    moTa: 'Với hơn 58.000 đầu sách thuộc 8 lĩnh vực chuyên ngành, thư viện UTT đáp ứng đầy đủ nhu cầu học tập và nghiên cứu của sinh viên từ năm nhất đến năm cuối.',
    icon: '🗂️',
    mauNen: 'linear-gradient(135deg, #003d7a 0%, #0066CC 100%)',
    danhMuc: [
      { ten: 'Công nghệ thông tin', so: '8.500+', icon: '💻' },
      { ten: 'Kỹ thuật & Giao thông', so: '12.000+', icon: '⚙️' },
      { ten: 'Kinh tế & Quản trị', so: '9.200+', icon: '📈' },
      { ten: 'Ngoại ngữ', so: '6.800+', icon: '🌐' },
      { ten: 'Văn học & Xã hội', so: '7.400+', icon: '📖' },
      { ten: 'Khoa học tự nhiên', so: '5.100+', icon: '🔬' },
      { ten: 'Luật & Pháp lý', so: '4.600+', icon: '⚖️' },
      { ten: 'Tài liệu khác', so: '4.400+', icon: '📋' },
    ],
  },
  {
    id: 3,
    tieuDe: 'Không Gian Học Tập Hiện Đại',
    moTa: 'Thư viện UTT được trang bị cơ sở vật chất hiện đại, tạo môi trường học tập lý tưởng cho sinh viên và cán bộ giảng viên.',
    icon: '🏛️',
    mauNen: 'linear-gradient(135deg, #002952 0%, #004d99 100%)',
    tienIch: [
      { icon: '🪑', ten: '400+ chỗ ngồi', moTa: 'Không gian đọc rộng rãi, yên tĩnh' },
      { icon: '💻', ten: '80 máy tính', moTa: 'Máy tính hiện đại với phần mềm mới nhất' },
      { icon: '📡', ten: 'WiFi tốc độ cao', moTa: 'Kết nối internet miễn phí toàn khu vực' },
      { icon: '👥', ten: '10 phòng học nhóm', moTa: 'Đặt trước qua hệ thống trực tuyến' },
      { icon: '🖨️', ten: 'Dịch vụ in ấn', moTa: 'Photocopy, in ấn tài liệu học tập' },
      { icon: '🔇', ten: 'Không gian im lặng', moTa: 'Khu vực tập trung cao độ cho học tập' },
    ],
  },
  {
    id: 4,
    tieuDe: 'Dịch Vụ Thư Viện Số',
    moTa: 'Hệ thống thư viện số hiện đại cho phép tra cứu, đặt mượn và gia hạn sách trực tuyến mọi lúc mọi nơi — tiết kiệm thời gian và nâng cao hiệu quả học tập.',
    icon: '💡',
    mauNen: 'linear-gradient(135deg, #003366 0%, #0066CC 50%, #0080ff 100%)',
    dichVu: [
      { icon: '🔍', ten: 'Tra cứu trực tuyến', moTa: 'Tìm kiếm sách theo tên, tác giả, ISBN, danh mục' },
      { icon: '📱', ten: 'Đặt mượn online', moTa: 'Gửi yêu cầu mượn sách từ xa, tiết kiệm thời gian' },
      { icon: '🔄', ten: 'Gia hạn tự động', moTa: 'Gia hạn sách trực tuyến không cần đến thư viện' },
      { icon: '🔔', ten: 'Nhắc hạn qua email', moTa: 'Thông báo tự động khi sách sắp đến hạn trả' },
      { icon: '📊', ten: 'Lịch sử mượn', moTa: 'Theo dõi toàn bộ lịch sử mượn trả sách' },
      { icon: '👤', ten: 'Quản lý hồ sơ', moTa: 'Cập nhật thông tin cá nhân và ảnh đại diện' },
    ],
  },
  {
    id: 5,
    tieuDe: 'Giờ Mở Cửa & Liên Hệ',
    moTa: 'Thư viện UTT phục vụ xuyên suốt trong tuần với thời gian dài, đảm bảo sinh viên luôn có không gian học tập thuận tiện.',
    icon: '🕐',
    mauNen: 'linear-gradient(135deg, #002952 0%, #0066CC 100%)',
    lienHe: {
      gioMoCua: [
        { thu: 'Thứ 2 — Thứ 6', gio: '7:30 — 21:00' },
        { thu: 'Thứ 7', gio: '7:30 — 17:00' },
        { thu: 'Chủ nhật & Lễ', gio: 'Đóng cửa' },
      ],
      thongTin: [
        { icon: '📍', nhan: 'Địa chỉ', gtri: 'Tầng 1, Nhà A — Số 54, Triều Khúc, Thanh Xuân, Hà Nội' },
        { icon: '📞', nhan: 'Điện thoại', gtri: '(024) 3869 0101' },
        { icon: '✉️', nhan: 'Email', gtri: 'thuvien@utt.edu.vn' },
        { icon: '🌐', nhan: 'Website', gtri: 'thuvien.utt.edu.vn' },
      ],
    },
  },
]

export default function TrangGioiThieu() {
  const [slideHienTai, setSlideHienTai] = useState(0)
  const [dangChuyenDong, setDangChuyenDong] = useState(false)

  const chuyenSlide = useCallback((index: number) => {
    if (dangChuyenDong) return
    setDangChuyenDong(true)
    setSlideHienTai(index)
    setTimeout(() => setDangChuyenDong(false), 500)
  }, [dangChuyenDong])

  // Tự động chuyển slide
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideHienTai(prev => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[slideHienTai]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f6ff' }}>
      <ThanhDieuHuong />

      {/* ── SLIDE CHÍNH ── */}
      <section className="relative text-white overflow-hidden"
        style={{ background: slide.mauNen, minHeight: '85vh', transition: 'background 0.8s ease' }}>

        {/* Trang trí nền */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{ backgroundColor: '#F47920' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: '#F47920' }} />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5 border-4 border-white" />
          {/* Đường kẻ trang trí */}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#F47920' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 flex flex-col min-h-[85vh]">

          {/* Số slide */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => chuyenSlide(i)}
                  className="transition-all duration-300"
                  style={{
                    width:  i === slideHienTai ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: i === slideHienTai ? '#F47920' : 'rgba(255,255,255,0.4)',
                  }} />
              ))}
            </div>
            <span className="text-white/50 text-xs">{slideHienTai + 1} / {SLIDES.length}</span>
          </div>

          {/* Nội dung slide */}
          <div className="flex-1 flex flex-col justify-center">

            {/* Icon + Tiêu đề */}
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                {slide.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {slide.tieuDe}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                {slide.moTa}
              </p>
            </div>

            {/* Nội dung theo loại slide */}

            {/* Slide 1 — Thống kê */}
            {slide.thongKe && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {slide.thongKe.map((item, i) => (
                  <div key={i} className="rounded-2xl p-5 text-center backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#F47920' }}>{item.so}</div>
                    <div className="text-white/70 text-sm">{item.nhan}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 2 — Danh mục */}
            {slide.danhMuc && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {slide.danhMuc.map((item, i) => (
                  <div key={i} className="rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-xs">{item.ten}</div>
                      <div className="text-sm font-bold" style={{ color: '#F47920' }}>{item.so}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 3 — Tiện ích */}
            {slide.tienIch && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {slide.tienIch.map((item, i) => (
                  <div key={i} className="rounded-xl p-4 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-white font-semibold text-sm mb-1">{item.ten}</div>
                    <div className="text-white/60 text-xs">{item.moTa}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 4 — Dịch vụ số */}
            {slide.dichVu && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {slide.dichVu.map((item, i) => (
                  <div key={i} className="rounded-xl p-4 backdrop-blur-sm flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{item.ten}</div>
                      <div className="text-white/60 text-xs">{item.moTa}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 5 — Liên hệ */}
            {slide.lienHe && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Giờ mở cửa */}
                <div className="rounded-2xl p-5 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span style={{ color: '#F47920' }}>⏰</span> Giờ mở cửa
                  </h3>
                  <div className="space-y-3">
                    {slide.lienHe.gioMoCua.map((g, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-white/70">{g.thu}</span>
                        <span className="font-bold" style={{ color: g.gio === 'Đóng cửa' ? '#fca5a5' : '#F47920' }}>
                          {g.gio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Thông tin liên hệ */}
                <div className="rounded-2xl p-5 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span style={{ color: '#F47920' }}>📞</span> Thông tin liên hệ
                  </h3>
                  <div className="space-y-3">
                    {slide.lienHe.thongTin.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span>{t.icon}</span>
                        <div>
                          <span className="text-white/50 text-xs">{t.nhan}: </span>
                          <span className="text-white font-medium">{t.gtri}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nút điều hướng + CTA */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={() => chuyenSlide((slideHienTai - 1 + SLIDES.length) % SLIDES.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                ←
              </button>
              <button
                onClick={() => chuyenSlide((slideHienTai + 1) % SLIDES.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                →
              </button>
            </div>

            <div className="flex gap-3">
              <Link href="/sach"
                className="px-5 py-2.5 rounded-xl text-sm font-medium backdrop-blur-sm transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                Khám phá sách
              </Link>
              <Link href="/auth/dangnhap"
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ backgroundColor: '#F47920', color: 'white' }}>
                Đăng nhập →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHẦN BÊN DƯỚI — Tóm tắt ── */}
      <section className="max-w-7xl mx-auto px-4 py-14 w-full">

        {/* Sứ mệnh */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
            style={{ backgroundColor: '#e6f0ff', color: '#0066CC' }}>
            Sứ mệnh của chúng tôi
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nơi kết nối tri thức với tương lai
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Thư viện UTT không chỉ là nơi lưu trữ sách — đây là trung tâm học tập, nghiên cứu và phát triển bản thân của hơn 15.000 sinh viên và cán bộ Trường Đại học Công nghệ Giao thông Vận tải.
          </p>
          <div className="mt-4 h-1 w-16 rounded mx-auto" style={{ backgroundColor: '#F47920' }} />
        </div>

        {/* Giá trị cốt lõi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: '🎯',
              ten: 'Phục vụ tận tâm',
              moTa: 'Đội ngũ cán bộ thư viện nhiệt tình, chuyên nghiệp, luôn sẵn sàng hỗ trợ sinh viên tìm kiếm và tiếp cận tài liệu học tập.',
              mauNen: '#e6f0ff', mauVien: '#99c2ff', mauIcon: '#0066CC',
            },
            {
              icon: '🚀',
              ten: 'Đổi mới sáng tạo',
              moTa: 'Không ngừng cập nhật tài nguyên số, ứng dụng công nghệ hiện đại vào quản lý thư viện để mang lại trải nghiệm tốt nhất.',
              mauNen: '#fff3e6', mauVien: '#fcd9a0', mauIcon: '#F47920',
            },
            {
              icon: '🌱',
              ten: 'Phát triển bền vững',
              moTa: 'Xây dựng văn hóa đọc, nuôi dưỡng tinh thần học hỏi suốt đời — nền tảng vững chắc cho sự phát triển của thế hệ trẻ.',
              mauNen: '#dcfce7', mauVien: '#86efac', mauIcon: '#16a34a',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-6 border shadow-sm"
              style={{ backgroundColor: item.mauNen, borderColor: item.mauVien }}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.ten}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.moTa}</p>
            </div>
          ))}
        </div>

        {/* Thành tựu */}
        <div className="rounded-2xl p-8 text-white mb-14"
          style={{ background: 'linear-gradient(135deg, #002952, #0066CC)' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Thành tựu nổi bật</h2>
            <div className="h-0.5 w-12 mx-auto rounded" style={{ backgroundColor: '#F47920' }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { so: '25+', nhan: 'Năm thành lập', icon: '🏛️' },
              { so: '98%', nhan: 'Sinh viên hài lòng', icon: '⭐' },
              { so: '500+', nhan: 'Đầu sách mới/năm', icon: '📚' },
              { so: '15+', nhan: 'Đơn vị hợp tác', icon: '🤝' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: '#F47920' }}>{item.so}</div>
                <div className="text-white/70 text-sm">{item.nhan}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA cuối */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sẵn sàng khám phá kho tri thức?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Đăng nhập để mượn sách, tra cứu tài liệu và trải nghiệm đầy đủ các dịch vụ của Thư viện UTT.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sach"
              className="px-8 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
              style={{ borderColor: '#0066CC', color: '#0066CC' }}>
              📚 Xem danh mục sách
            </Link>
            <Link href="/auth/dangnhap"
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: '#0066CC' }}>
              Đăng nhập ngay →
            </Link>
          </div>
        </div>
      </section>

      <ChanTrang />
    </div>
  )
}
