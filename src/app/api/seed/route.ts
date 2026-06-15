/**
 * API â€” Seed dá»¯ liá»‡u lá»›n (Ä‘Ãºng logic)
 * POST /api/seed
 * XÃ“A FILE SAU KHI SEED XONG!
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import Sach from '@/models/Sach'
import NguoiDung from '@/models/NguoiDung'
import PhieuMuon from '@/models/PhieuMuon'
import BaoCaoLoi from '@/models/BaoCaoLoi'
import bcrypt from 'bcryptjs'

const SACH_MOI = [
  { tenSach:'Láº­p trÃ¬nh Python nÃ¢ng cao', tacGia:'Nguyá»…n ThÃ nh Trung', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB BÃ¡ch Khoa', namXuatBan:2023, tongSoBan:12, viTriKe:'A1-K05', maSach:'978-604-67-2015-1' },
  { tenSach:'CÆ¡ sá»Ÿ dá»¯ liá»‡u phÃ¢n tÃ¡n', tacGia:'Tráº§n Quá»‘c Báº£o', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB KHKT', namXuatBan:2022, tongSoBan:8, viTriKe:'A2-K03', maSach:'978-604-67-2016-2' },
  { tenSach:'PhÃ¡t triá»ƒn Web vá»›i ReactJS', tacGia:'LÃª VÄƒn HÃ¹ng', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB BÃ¡ch Khoa', namXuatBan:2024, tongSoBan:15, viTriKe:'A1-K06', maSach:'978-604-67-2017-3' },
  { tenSach:'Há»c mÃ¡y vÃ  Deep Learning', tacGia:'Pháº¡m Minh Tuáº¥n', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB KHKT', namXuatBan:2023, tongSoBan:10, viTriKe:'A1-K07', maSach:'978-604-67-2018-4' },
  { tenSach:'Máº¡ng mÃ¡y tÃ­nh vÃ  Internet', tacGia:'VÅ© Thá»‹ Lan', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2022, tongSoBan:14, viTriKe:'A2-K04', maSach:'978-604-67-2019-5' },
  { tenSach:'An ninh máº¡ng thá»±c hÃ nh', tacGia:'HoÃ ng VÄƒn Nam', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB BÃ¡ch Khoa', namXuatBan:2023, tongSoBan:9, viTriKe:'A2-K05', maSach:'978-604-67-2020-6' },
  { tenSach:'Láº­p trÃ¬nh C++ hÆ°á»›ng Ä‘á»‘i tÆ°á»£ng', tacGia:'Nguyá»…n Thá»‹ Hoa', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB ÄHQG', namXuatBan:2021, tongSoBan:20, viTriKe:'A3-K03', maSach:'978-604-67-2021-7' },
  { tenSach:'Docker vÃ  Kubernetes thá»±c chiáº¿n', tacGia:'Tráº§n VÄƒn Äá»©c', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB BÃ¡ch Khoa', namXuatBan:2024, tongSoBan:7, viTriKe:'A1-K08', maSach:'978-604-67-2022-8' },
  { tenSach:'PhÃ¢n tÃ­ch vÃ  thiáº¿t káº¿ há»‡ thá»‘ng', tacGia:'LÃ½ Thá»‹ BÃ­ch', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2022, tongSoBan:11, viTriKe:'A2-K06', maSach:'978-604-67-2023-9' },
  { tenSach:'Há»‡ Ä‘iá»u hÃ nh Linux thá»±c hÃ nh', tacGia:'Äinh Thá»‹ Hoa', danhMuc:'CÃ´ng nghá»‡ thÃ´ng tin', nhaXuatBan:'NXB KHKT', namXuatBan:2023, tongSoBan:13, viTriKe:'A3-K04', maSach:'978-604-67-2024-0' },
  { tenSach:'Kinh táº¿ vÄ© mÃ´', tacGia:'Nguyá»…n VÄƒn Máº¡nh', danhMuc:'Kinh táº¿', nhaXuatBan:'NXB Kinh táº¿', namXuatBan:2022, tongSoBan:18, viTriKe:'B1-K01', maSach:'978-604-67-3010-1' },
  { tenSach:'TÃ i chÃ­nh doanh nghiá»‡p', tacGia:'Tráº§n Thá»‹ Minh', danhMuc:'Kinh táº¿', nhaXuatBan:'NXB TÃ i chÃ­nh', namXuatBan:2023, tongSoBan:12, viTriKe:'B1-K02', maSach:'978-604-67-3011-2' },
  { tenSach:'Marketing cÄƒn báº£n', tacGia:'LÃª Thanh BÃ¬nh', danhMuc:'Kinh táº¿', nhaXuatBan:'NXB Kinh táº¿', namXuatBan:2022, tongSoBan:16, viTriKe:'B2-K01', maSach:'978-604-67-3012-3' },
  { tenSach:'Káº¿ toÃ¡n tÃ i chÃ­nh', tacGia:'Pháº¡m Thá»‹ Thu', danhMuc:'Kinh táº¿', nhaXuatBan:'NXB TÃ i chÃ­nh', namXuatBan:2023, tongSoBan:14, viTriKe:'B2-K02', maSach:'978-604-67-3013-4' },
  { tenSach:'Quáº£n trá»‹ nhÃ¢n lá»±c', tacGia:'HoÃ ng Minh Äá»©c', danhMuc:'Kinh táº¿', nhaXuatBan:'NXB Lao Ä‘á»™ng', namXuatBan:2021, tongSoBan:10, viTriKe:'B1-K03', maSach:'978-604-67-3014-5' },
  { tenSach:'CÆ¡ há»c káº¿t cáº¥u', tacGia:'Nguyá»…n Äá»©c Tháº¯ng', danhMuc:'Ká»¹ thuáº­t', nhaXuatBan:'NXB XÃ¢y dá»±ng', namXuatBan:2022, tongSoBan:15, viTriKe:'E1-K01', maSach:'978-604-67-7010-1' },
  { tenSach:'Ká»¹ thuáº­t Ä‘iá»‡n tá»­ sá»‘', tacGia:'Tráº§n Quang Vinh', danhMuc:'Ká»¹ thuáº­t', nhaXuatBan:'NXB KHKT', namXuatBan:2023, tongSoBan:11, viTriKe:'E1-K02', maSach:'978-604-67-7011-2' },
  { tenSach:'Sá»©c bá»n váº­t liá»‡u', tacGia:'LÃª ÄÃ¬nh PhÆ°á»›c', danhMuc:'Ká»¹ thuáº­t', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2021, tongSoBan:13, viTriKe:'E2-K01', maSach:'978-604-67-7012-3' },
  { tenSach:'Truyá»‡n Kiá»u - Nguyá»…n Du', tacGia:'Nguyá»…n Du', danhMuc:'VÄƒn há»c', nhaXuatBan:'NXB VÄƒn há»c', namXuatBan:2020, tongSoBan:20, viTriKe:'C1-K01', maSach:'978-604-67-4010-3' },
  { tenSach:'ChÃ­ PhÃ¨o vÃ  truyá»‡n ngáº¯n Nam Cao', tacGia:'Nam Cao', danhMuc:'VÄƒn há»c', nhaXuatBan:'NXB VÄƒn há»c', namXuatBan:2021, tongSoBan:15, viTriKe:'C1-K04', maSach:'978-604-67-4011-4' },
  { tenSach:'Grammar in Use Intermediate', tacGia:'Raymond Murphy', danhMuc:'Ngoáº¡i ngá»¯', nhaXuatBan:'Cambridge', namXuatBan:2019, tongSoBan:20, viTriKe:'C3-K01', maSach:'978-604-67-5010-1' },
  { tenSach:'Tá»« Ä‘iá»ƒn Anh-Viá»‡t Oxford', tacGia:'Oxford Press', danhMuc:'Ngoáº¡i ngá»¯', nhaXuatBan:'NXB Tráº»', namXuatBan:2022, tongSoBan:8, viTriKe:'C3-K03', maSach:'978-604-67-5011-2' },
  { tenSach:'TOEIC 990 chiáº¿n lÆ°á»£c lÃ m bÃ i', tacGia:'Kim Daeyeon', danhMuc:'Ngoáº¡i ngá»¯', nhaXuatBan:'NXB Tá»•ng há»£p', namXuatBan:2023, tongSoBan:15, viTriKe:'C3-K05', maSach:'978-604-67-5012-3' },
  { tenSach:'Luáº­t DÃ¢n sá»± Viá»‡t Nam', tacGia:'Nguyá»…n VÄƒn Máº¡nh', danhMuc:'Luáº­t', nhaXuatBan:'NXB TÆ° phÃ¡p', namXuatBan:2022, tongSoBan:14, viTriKe:'D2-K02', maSach:'978-604-67-6010-3' },
  { tenSach:'Bá»™ Luáº­t HÃ¬nh sá»± 2015', tacGia:'Quá»‘c há»™i Viá»‡t Nam', danhMuc:'Luáº­t', nhaXuatBan:'NXB CTQG', namXuatBan:2022, tongSoBan:20, viTriKe:'D2-K03', maSach:'978-604-67-6011-4' },
  { tenSach:'Giáº£i tÃ­ch toÃ¡n há»c táº­p 1', tacGia:'Nguyá»…n ÄÃ¬nh TrÃ­', danhMuc:'Khoa há»c tá»± nhiÃªn', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2021, tongSoBan:18, viTriKe:'F1-K01', maSach:'978-604-67-8010-3' },
  { tenSach:'Váº­t lÃ½ Ä‘áº¡i cÆ°Æ¡ng', tacGia:'LÆ°Æ¡ng DuyÃªn BÃ¬nh', danhMuc:'Khoa há»c tá»± nhiÃªn', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2020, tongSoBan:15, viTriKe:'F1-K02', maSach:'978-604-67-8011-4' },
  { tenSach:'XÃ¡c suáº¥t thá»‘ng kÃª á»©ng dá»¥ng', tacGia:'ÄÃ o Há»¯u Há»“', danhMuc:'Khoa há»c tá»± nhiÃªn', nhaXuatBan:'NXB ÄHQG', namXuatBan:2022, tongSoBan:16, viTriKe:'F2-K01', maSach:'978-604-67-8012-5' },
  { tenSach:'Lá»‹ch sá»­ Viá»‡t Nam hiá»‡n Ä‘áº¡i', tacGia:'Äinh XuÃ¢n LÃ¢m', danhMuc:'Khoa há»c xÃ£ há»™i', nhaXuatBan:'NXB GiÃ¡o dá»¥c', namXuatBan:2021, tongSoBan:12, viTriKe:'G1-K01', maSach:'978-604-67-9001-1' },
  { tenSach:'Triáº¿t há»c MÃ¡c-LÃªnin', tacGia:'Bá»™ GD&ÄT', danhMuc:'Khoa há»c xÃ£ há»™i', nhaXuatBan:'NXB CTQG', namXuatBan:2022, tongSoBan:25, viTriKe:'G1-K02', maSach:'978-604-67-9002-2' },
]

const HO = ['Nguyá»…n','Tráº§n','LÃª','Pháº¡m','HoÃ ng','VÅ©','Phan','Äáº·ng','BÃ¹i','Äá»—','Há»“','NgÃ´']
const TEN_NAM = ['VÄƒn An','Minh Äá»©c','Quá»‘c Báº£o','Thanh HÃ¹ng','Trá»ng NghÄ©a','Anh Tuáº¥n','Quang Vinh','ThÃ nh Long','ÄÃ¬nh Kháº£i','Há»¯u PhÃºc']
const TEN_NU = ['Thá»‹ Hoa','Thu HÆ°Æ¡ng','Minh ChÃ¢u','Thanh Lan','PhÆ°Æ¡ng Linh','Ngá»c Mai','ThÃ¹y Dung','BÃ­ch Ngá»c','Kim Oanh','Thanh Tháº£o']
const KHOA = ['Khoa CNTT','Khoa Kinh táº¿','Khoa Ká»¹ thuáº­t','Khoa Ngoáº¡i ngá»¯','Khoa Luáº­t']
const NGANH = ['Ká»¹ thuáº­t pháº§n má»m','Há»‡ thá»‘ng thÃ´ng tin','An toÃ n thÃ´ng tin','Káº¿ toÃ¡n','Quáº£n trá»‹ kinh doanh','Ká»¹ thuáº­t Ä‘iá»‡n','NgÃ´n ngá»¯ Anh']

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
function randInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min }
function randDate(from: Date, to: Date) { return new Date(from.getTime()+Math.random()*(to.getTime()-from.getTime())) }
function addDays(d: Date, n: number) { const r=new Date(d); r.setDate(r.getDate()+n); return r }
function subDays(d: Date, n: number) { return addDays(d,-n) }

export async function POST() {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    const nd = phien?.user as any
    if (!phien || nd?.vaiTro !== 'admin') return NextResponse.json({thanhCong:false,thongBao:'Chá»‰ admin'},{status:403})

    await ketNoiMongoDB()
    const log: string[] = []

    // â”€â”€ 1. ThÃªm sÃ¡ch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let sachThem = 0
    for (const s of SACH_MOI) {
      const ton = await Sach.findOne({ maSach: s.maSach })
      if (ton) continue
      await Sach.create({ ...s, soBanConLai: s.tongSoBan, trangThai:'choMuon', moTa:`GiÃ¡o trÃ¬nh ${s.tenSach}` })
      sachThem++
    }
    log.push(`SÃ¡ch: +${sachThem}`)

    // â”€â”€ 2. ThÃªm sinh viÃªn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const matKhauHash = await bcrypt.hash('sinhvien123', 10)
    const ndCuoi = await NguoiDung.findOne({soThe:/^UTT/}).sort({soThe:-1})
    let soTheIdx = ndCuoi ? parseInt(ndCuoi.soThe.replace('UTT',''))+1 : 10
    let ndThem = 0

    for (let i=0; i<50; i++) {
      const gioi = Math.random()>0.5?'nam':'nu'
      const hoTen = `${rand(HO)} ${gioi==='nam'?rand(TEN_NAM):rand(TEN_NU)}`
      const email = `sv${String(soTheIdx).padStart(3,'0')}@sv.utt.edu.vn`
      const ton = await NguoiDung.findOne({email})
      if (ton) { soTheIdx++; continue }
      await NguoiDung.create({
        hoTen, email, matKhau:matKhauHash, vaiTro:'sinhVien',
        soThe:`UTT${String(soTheIdx).padStart(6,'0')}`,
        trangThaiThe:'hoatDong', hoatDong:true, gioiTinh:gioi,
        maSoSV:`73DCTT${String(randInt(20000,29999))}`,
        khoa:rand(KHOA), nganh:rand(NGANH), khoaHoc:`K${randInt(70,75)}`,
        dangMuon:0, tongSoLanMuon:0,
        ngayTao:randDate(new Date('2024-09-01'),new Date('2025-03-01')),
      })
      soTheIdx++; ndThem++
    }
    log.push(`Sinh viÃªn: +${ndThem}`)

    // â”€â”€ 3. Táº¡o phiáº¿u mÆ°á»£n Ä‘Ãºng logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Láº¥y toÃ n bá»™ sÃ¡ch + ngÆ°á»i dÃ¹ng
    const tatCaSach = await Sach.find({trangThai:'choMuon',soBanConLai:{$gt:0}})
    const tatCaND   = await NguoiDung.find({vaiTro:'sinhVien',trangThaiThe:'hoatDong'})
    const adminUser = await NguoiDung.findOne({vaiTro:'admin'})
    const now       = new Date()
    const ngayBD    = new Date('2025-09-01')

    // Map theo dÃµi soBanConLai trong bá»™ nhá»› Ä‘á»ƒ khÃ´ng vÆ°á»£t quÃ¡
    const sachConLai: Record<string,number> = {}
    for (const s of tatCaSach) sachConLai[String(s._id)] = s.soBanConLai

    // Map theo dÃµi sá»‘ sÃ¡ch Ä‘ang mÆ°á»£n cá»§a tá»«ng ngÆ°á»i (tá»‘i Ä‘a 5)
    const ndDangMuon: Record<string,number> = {}

    let phieuThem = 0
    const TONG_PHIEU = 150

    // Táº¡o phiáº¿u Ä‘Ã£ tráº£ trÆ°á»›c (lá»‹ch sá»­)
    for (let i=0; i<90 && phieuThem<TONG_PHIEU; i++) {
      const sach = rand(tatCaSach)
      const nd2  = rand(tatCaND)
      const sid  = String(sach._id)
      const nid  = String(nd2._id)

      const ngayMuon = randDate(ngayBD, subDays(now,15))
      const ngayHan  = addDays(ngayMuon, 14)
      const ngayTra  = randDate(ngayMuon, addDays(ngayMuon, randInt(3,18)))

      await PhieuMuon.create({
        nguoiMuon:   nd2._id,
        sach:        sach._id,
        trangThai:   'daTra',
        ngayTao:     ngayMuon,
        ngayMuon,
        ngayHanTra:  ngayHan,
        ngayTraThuc: ngayTra,
        thuThuXuLy:  adminUser?._id,
        tienPhat:    ngayTra>ngayHan ? Math.ceil((ngayTra.getTime()-ngayHan.getTime())/86400000)*2000 : 0,
      })
      // Cáº­p nháº­t tongSoLanMuon
      await NguoiDung.findByIdAndUpdate(nd2._id,{$inc:{tongSoLanMuon:1}})
      phieuThem++
    }

    // Táº¡o phiáº¿u Ä‘ang mÆ°á»£n (giáº£m soBanConLai thá»±c táº¿)
    for (let i=0; i<45 && phieuThem<TONG_PHIEU; i++) {
      const sach = rand(tatCaSach)
      const nd2  = rand(tatCaND)
      const sid  = String(sach._id)
      const nid  = String(nd2._id)

      if ((sachConLai[sid]||0) <= 0) continue
      if ((ndDangMuon[nid]||0) >= 5) continue

      const ngayMuon = randDate(subDays(now,30), subDays(now,1))
      const ngayHan  = addDays(ngayMuon, 14)

      await PhieuMuon.create({
        nguoiMuon:  nd2._id,
        sach:       sach._id,
        trangThai:  'dangMuon',
        ngayTao:    ngayMuon,
        ngayMuon,
        ngayHanTra: ngayHan,
        thuThuXuLy: adminUser?._id,
        tienPhat:   0,
      })

      // âœ… Giáº£m soBanConLai + cáº­p nháº­t dangMuon, tongSoLanMuon
      sachConLai[sid] = (sachConLai[sid]||0) - 1
      ndDangMuon[nid] = (ndDangMuon[nid]||0) + 1
      await Sach.findByIdAndUpdate(sach._id, {$inc:{soBanConLai:-1}})
      await NguoiDung.findByIdAndUpdate(nd2._id,{$inc:{dangMuon:1,tongSoLanMuon:1}})

      // Tá»± cáº­p nháº­t trangThai náº¿u háº¿t
      if (sachConLai[sid] <= 0) {
        await Sach.findByIdAndUpdate(sach._id,{$set:{trangThai:'hetSach'}})
      }
      phieuThem++
    }

    // Táº¡o phiáº¿u chá» duyá»‡t
    for (let i=0; i<15 && phieuThem<TONG_PHIEU; i++) {
      const sach = rand(tatCaSach)
      const nd2  = rand(tatCaND)
      const sid  = String(sach._id)
      const nid  = String(nd2._id)

      if ((sachConLai[sid]||0) <= 0) continue
      if ((ndDangMuon[nid]||0) >= 5) continue

      const ngayTao = randDate(subDays(now,7), now)
      await PhieuMuon.create({
        nguoiMuon:  nd2._id,
        sach:       sach._id,
        trangThai:  'choDuyet',
        ngayTao,
        ngayHanTra: addDays(ngayTao, 14),
        tienPhat:   0,
      })
      phieuThem++
    }

    log.push(`Phiáº¿u mÆ°á»£n: +${phieuThem} (90 Ä‘Ã£ tráº£, 45 Ä‘ang mÆ°á»£n, 15 chá» duyá»‡t)`)

    // â”€â”€ 4. Táº¡o bÃ¡o cÃ¡o lá»—i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const loaiLoiList = ['doSinhVien','amUot','cuRach','vietChuLen','banChu','khac']
    const sachCoNhieu = await Sach.find({soBanConLai:{$gte:3}}).limit(20)
    let loiThem = 0

    for (let i=0; i<25; i++) {
      if (!sachCoNhieu.length) break
      const sach = rand(sachCoNhieu)
      const loai = rand(loaiLoiList)
      const soLuong = 1
      const ngayBC = randDate(new Date('2025-10-01'), now)

      // âœ… Trá»« soBanConLai khi bÃ¡o lá»—i
      await Sach.findByIdAndUpdate(sach._id,{
        $inc:{soBanConLai:-soLuong, tongSoBan:-soLuong}
      })

      const ndViPham = loai==='doSinhVien' ? rand(tatCaND) : null
      await BaoCaoLoi.create({
        sach:        sach._id,
        soLuong,
        loaiLoi:     loai,
        nguoiViPham: ndViPham?._id || null,
        lyDo:        `PhÃ¡t hiá»‡n sÃ¡ch ${loai==='doSinhVien'?'bá»‹ sinh viÃªn lÃ m há»ng':loai==='amUot'?'áº©m Æ°á»›t':loai==='cuRach'?'cÅ© rÃ¡ch':loai==='vietChuLen'?'cÃ³ chá»¯ viáº¿t lÃªn':loai==='banChu'?'chá»¯ bá»‹ báº©n':'lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh'} ngÃ y ${ngayBC.toLocaleDateString('vi-VN')}`,
        nguoiBaoCao: adminUser?._id,
        ngayBaoCao:  ngayBC,
      })
      loiThem++
    }
    log.push(`BÃ¡o cÃ¡o lá»—i: +${loiThem}`)

    return NextResponse.json({
      thanhCong: true,
      thongBao:  `âœ… Seed xong!\n${log.join(' | ')}`,
      duLieu: { sachThem, ndThem, phieuThem, loiThem },
    })
  } catch(loi:any) {
    return NextResponse.json({thanhCong:false,thongBao:loi.message},{status:500})
  }
}

