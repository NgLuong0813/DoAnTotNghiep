/**
 * COMPONENT — Chân Trang
 * Màu chủ đạo: Xanh #0066CC + Cam #F47920
 * Đường dẫn: src/components/layout/ChanTrang.tsx
 */
import Link from 'next/link'
import Image from 'next/image'

export default function ChanTrang() {
  return (
    <footer className="text-gray-300 mt-16" style={{ backgroundColor: '#002952' }}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Thông tin thư viện */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 relative bg-white rounded-lg p-1">
              <Image
                src="/logo.png"
                alt="Logo UTT"
                fill
                className="object-contain p-1"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                  t.parentElement!.innerHTML = `<div style="width:40px;height:40px;background:#0066CC;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:18px">📚</div>`
                }}
              />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Thư Viện UTT</div>
              <div className="text-[10px] text-gray-500">Trung tâm CNTT & Thư viện</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            Phục vụ nhu cầu học tập, nghiên cứu và phát triển tri thức cho cán bộ, giảng viên và sinh viên Trường Đại học Công nghệ Giao thông Vận tải.
          </p>
          {/* Đường cam trang trí */}
          <div className="mt-4 h-0.5 w-16 rounded" style={{ backgroundColor: '#F47920' }} />
        </div>

        {/* Dịch vụ */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
            <span style={{ color: '#F47920' }}>■</span> Dịch vụ
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {[
              ['Tra cứu sách',        '/sach'],
              ['Đăng ký thẻ thư viện', '/auth/dangky'],
              ['Tin tức & Thông báo',  '/tintuc'],
              ['Nội quy thư viện',     '/tintuc?loai=noiQuy'],
              ['Sách đang mượn',       '/muonSach'],
            ].map(([nhan, duongDan]) => (
              <li key={duongDan}>
                <Link href={duongDan}
                  className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span style={{ color: '#F47920' }}>→</span> {nhan}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
            <span style={{ color: '#F47920' }}>■</span> Liên hệ
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            {[
              ['📍', 'Số 54, Triều Khúc, Thanh Xuân, Hà Nội'],
              ['📞', '(024) 3869 0101'],
              ['✉',  'thuvien@utt.edu.vn'],
              ['⏰', 'Thứ 2–6: 7:30–21:00 | Thứ 7: 7:30–17:00'],
            ].map(([icon, noi]) => (
              <li key={noi} className="flex gap-2">
                <span>{icon}</span>
                <span>{noi}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Đường cam ngăn cách */}
      <div className="h-0.5" style={{ backgroundColor: '#F47920' }} />

      <div className="text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} Trường Đại học Công nghệ Giao thông Vận tải (UTT).
        Bản quyền thuộc về Trung tâm CNTT & Thư viện.
      </div>
    </footer>
  )
}
