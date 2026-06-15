/**
 * API â€” Seed danh má»¥c máº·c Ä‘á»‹nh
 * POST /api/danhMuc/seed â†’ Nháº­p táº¥t cáº£ danh má»¥c máº·c Ä‘á»‹nh (bá» qua náº¿u Ä‘Ã£ tá»“n táº¡i)
 * ÄÆ°á»ng dáº«n: src/app/api/danhMuc/seed/route.ts
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import DanhMuc from '@/models/DanhMuc'

const DANH_MUC_MAC_DINH = [
  { ten: 'CÃ´ng nghá»‡ thÃ´ng tin', moTa: 'Láº­p trÃ¬nh, máº¡ng mÃ¡y tÃ­nh, trÃ­ tuá»‡ nhÃ¢n táº¡o, an toÃ n thÃ´ng tin', thuTu: 1 },
  { ten: 'Kinh táº¿',             moTa: 'Kinh táº¿ há»c, quáº£n trá»‹ kinh doanh, tÃ i chÃ­nh, káº¿ toÃ¡n',           thuTu: 2 },
  { ten: 'Ká»¹ thuáº­t',            moTa: 'Ká»¹ thuáº­t cÆ¡ khÃ­, Ä‘iá»‡n, xÃ¢y dá»±ng, giao thÃ´ng váº­n táº£i',            thuTu: 3 },
  { ten: 'VÄƒn há»c',             moTa: 'VÄƒn há»c Viá»‡t Nam, vÄƒn há»c nÆ°á»›c ngoÃ i, thÆ¡, tiá»ƒu thuyáº¿t',          thuTu: 4 },
  { ten: 'Ngoáº¡i ngá»¯',           moTa: 'Tiáº¿ng Anh, tiáº¿ng Nháº­t, tiáº¿ng Trung, IELTS, TOEIC',               thuTu: 5 },
  { ten: 'Luáº­t',                moTa: 'Luáº­t dÃ¢n sá»±, luáº­t hÃ¬nh sá»±, luáº­t kinh táº¿, luáº­t hÃ nh chÃ­nh',        thuTu: 6 },
  { ten: 'Khoa há»c tá»± nhiÃªn',   moTa: 'ToÃ¡n há»c, váº­t lÃ½, hÃ³a há»c, sinh há»c',                             thuTu: 7 },
  { ten: 'Khoa há»c xÃ£ há»™i',     moTa: 'Lá»‹ch sá»­, Ä‘á»‹a lÃ½, triáº¿t há»c, tÃ¢m lÃ½ há»c, xÃ£ há»™i há»c',             thuTu: 8 },
  { ten: 'Y - DÆ°á»£c',            moTa: 'Y há»c, dÆ°á»£c há»c, sá»©c khá»e, dinh dÆ°á»¡ng',                           thuTu: 9 },
  { ten: 'NÃ´ng - LÃ¢m - NgÆ°',   moTa: 'NÃ´ng nghiá»‡p, lÃ¢m nghiá»‡p, thá»§y sáº£n, mÃ´i trÆ°á»ng',                   thuTu: 10 },
  { ten: 'GiÃ¡o dá»¥c',            moTa: 'SÆ° pháº¡m, giÃ¡o dá»¥c há»c, tÃ¢m lÃ½ giÃ¡o dá»¥c, phÆ°Æ¡ng phÃ¡p dáº¡y há»c',    thuTu: 11 },
  { ten: 'Nghá»‡ thuáº­t',          moTa: 'Ã‚m nháº¡c, há»™i há»a, kiáº¿n trÃºc, thiáº¿t káº¿',                           thuTu: 12 },
  { ten: 'Tham kháº£o',           moTa: 'Tá»« Ä‘iá»ƒn, bÃ¡ch khoa toÃ n thÆ°, giÃ¡o trÃ¬nh, tÃ i liá»‡u há»c táº­p',       thuTu: 13 },
  { ten: 'KhÃ¡c',                moTa: 'CÃ¡c loáº¡i sÃ¡ch khÃ¡c chÆ°a phÃ¢n loáº¡i',                                thuTu: 14 },
]

export async function POST() {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd    = phien?.user as any
    if (!phien || nd?.vaiTro !== 'admin') {
      return NextResponse.json({ thanhCong: false, thongBao: 'Chá»‰ admin má»›i Ä‘Æ°á»£c seed dá»¯ liá»‡u' }, { status: 403 })
    }

    await ketNoiMongoDB()

    let daCoSan = 0, themMoi = 0
    for (const dm of DANH_MUC_MAC_DINH) {
      const ton = await DanhMuc.findOne({ ten: dm.ten })
      if (ton) { daCoSan++; continue }
      await DanhMuc.create({ ...dm, hoatDong: true })
      themMoi++
    }

    return NextResponse.json({
      thanhCong: true,
      thongBao:  `HoÃ n thÃ nh! ThÃªm má»›i: ${themMoi}, Ä‘Ã£ cÃ³ sáºµn: ${daCoSan}`,
      duLieu:    { themMoi, daCoSan, tongDanhMuc: DANH_MUC_MAC_DINH.length },
    })
  } catch (loi: any) {
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}

