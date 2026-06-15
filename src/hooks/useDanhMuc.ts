/**
 * HOOK — useDanhMuc
 * Load danh sách danh mục từ API, fallback về danh mục cứng nếu lỗi
 * Đường dẫn: src/hooks/useDanhMuc.ts
 */

import { useState, useEffect } from 'react'

const DANH_MUC_FALLBACK = [
  'Công nghệ thông tin','Kinh tế','Kỹ thuật','Văn học',
  'Ngoại ngữ','Luật','Khoa học tự nhiên','Khoa học xã hội',
  'Y - Dược','Nông - Lâm - Ngư','Giáo dục','Nghệ thuật',
  'Tham khảo','Khác',
]

export function useDanhMuc() {
  const [danhMuc, setDanhMuc] = useState<string[]>(DANH_MUC_FALLBACK)
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    fetch('/api/danhMuc')
      .then(r => r.json())
      .then(j => {
        if (j.thanhCong && j.duLieu?.length > 0) {
          // Chỉ lấy danh mục đang hoạt động, sắp xếp theo thuTu
          const ds = j.duLieu
            .filter((d: any) => d.hoatDong !== false)
            .sort((a: any, b: any) => (a.thuTu||99) - (b.thuTu||99))
            .map((d: any) => d.ten)
          setDanhMuc(ds)
        }
      })
      .catch(() => {}) // giữ fallback
      .finally(() => setDangTai(false))
  }, [])

  return { danhMuc, dangTai }
}
