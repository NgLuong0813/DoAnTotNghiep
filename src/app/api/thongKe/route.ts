/**
 * API â€” Thá»‘ng KÃª Tá»•ng Quan
 * GET /api/thongKe?loai=ngay|tuan|thang|nam
 * ÄÆ°á»ng dáº«n: src/app/api/thongKe/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import PhieuMuon from '@/models/PhieuMuon'
import Sach from '@/models/Sach'
import NguoiDung from '@/models/NguoiDung'
import BaoCaoLoi from '@/models/BaoCaoLoi'

function getThoiGian(loai: string) {
  const now = new Date()
  let tuNgay: Date
  const denNgay = new Date(now); denNgay.setHours(23,59,59,999)
  switch (loai) {
    case 'ngay':  tuNgay = new Date(now); tuNgay.setHours(0,0,0,0); break
    case 'tuan':
      tuNgay = new Date(now)
      const d = now.getDay(); tuNgay.setDate(now.getDate()-(d===0?6:d-1)); tuNgay.setHours(0,0,0,0); break
    case 'nam':   tuNgay = new Date(now.getFullYear(),0,1); break
    default:      tuNgay = new Date(now.getFullYear(),now.getMonth(),1)
  }
  return { tuNgay, denNgay }
}

export async function GET(req: NextRequest) {
  try {
    const phien = await getServerSession(cauHinhXacThuc)
    if (!phien) return NextResponse.json({ thanhCong:false, thongBao:'ChÆ°a Ä‘Äƒng nháº­p' },{status:401})
    const nd = phien.user as any
    if (!['admin','thuThu'].includes(nd?.vaiTro)) return NextResponse.json({ thanhCong:false, thongBao:'KhÃ´ng cÃ³ quyá»n' },{status:403})

    await ketNoiMongoDB()
    const { searchParams } = new URL(req.url)
    const loai = searchParams.get('loai') || 'thang'
    let tuNgay: Date, denNgay: Date
    const p1=searchParams.get('tuNgay'), p2=searchParams.get('denNgay')
    if (p1&&p2) { tuNgay=new Date(p1); denNgay=new Date(p2+'T23:59:59') }
    else { const t=getThoiGian(loai); tuNgay=t.tuNgay; denNgay=t.denNgay }

    const dk = { $gte:tuNgay, $lte:denNgay }

    // Thá»‘ng kÃª cÆ¡ báº£n
    const [tongSach,tongNguoiDung,tongMuonKy,dangMuon,daTra,choDuyet,tuChoi,tongLoiKy,soQuaHan] = await Promise.all([
      Sach.countDocuments(),
      NguoiDung.countDocuments({ vaiTro:'sinhVien' }),
      PhieuMuon.countDocuments({ ngayTao:dk }),
      PhieuMuon.countDocuments({ trangThai:'dangMuon' }),
      PhieuMuon.countDocuments({ trangThai:'daTra', ngayTraThuc:dk }),
      PhieuMuon.countDocuments({ trangThai:'choDuyet' }),
      PhieuMuon.countDocuments({ trangThai:'tuChoi', ngayTao:dk }),
      BaoCaoLoi.countDocuments({ ngayBaoCao:dk }),
      PhieuMuon.countDocuments({ trangThai:'dangMuon', ngayHanTra:{ $lt:new Date() } }),
    ])

    // Top sÃ¡ch mÆ°á»£n nhiá»u
    const topSachRaw = await PhieuMuon.aggregate([
      { $match:{ ngayTao:dk } },
      { $group:{ _id:'$sach', soLan:{ $sum:1 } } },
      { $sort:{ soLan:-1 } }, { $limit:7 },
    ])
    const sachMap: Record<string,any> = {}
    const sachList = await Sach.find({ _id:{ $in:topSachRaw.map(s=>s._id) } }).select('tenSach tacGia danhMuc anhBia').lean()
    for (const s of sachList) sachMap[String(s._id)]=s
    const topSach = topSachRaw.map(s=>({
      soLan:s.soLan,
      tenSach:sachMap[String(s._id)]?.tenSach||'?',
      tacGia: sachMap[String(s._id)]?.tacGia ||'',
      danhMuc:sachMap[String(s._id)]?.danhMuc||'',
      anhBia: sachMap[String(s._id)]?.anhBia ||'',
    }))

    // Top ngÆ°á»i mÆ°á»£n nhiá»u
    const topNDRaw = await PhieuMuon.aggregate([
      { $match:{ ngayTao:dk } },
      { $group:{ _id:'$nguoiMuon', soLan:{ $sum:1 } } },
      { $sort:{ soLan:-1 } }, { $limit:7 },
    ])
    const ndMap: Record<string,any> = {}
    const ndList = await NguoiDung.find({ _id:{ $in:topNDRaw.map(n=>n._id) } }).select('hoTen soThe maSoSV').lean()
    for (const n of ndList) ndMap[String(n._id)]=n
    const topNguoiMuon = topNDRaw.map(n=>({
      soLan:n.soLan,
      hoTen: ndMap[String(n._id)]?.hoTen ||'?',
      soThe: ndMap[String(n._id)]?.soThe ||'',
      maSoSV:ndMap[String(n._id)]?.maSoSV||'',
    }))

    // MÆ°á»£n theo danh má»¥c - join thá»§ cÃ´ng trÃ¡nh lá»—i collection name
    const phieuKy  = await PhieuMuon.find({ ngayTao:dk }).select('sach').lean()
    const allSIds  = [...new Set(phieuKy.map((p:any)=>String(p.sach)))]
    const allSachs = await Sach.find({ _id:{ $in:allSIds } }).select('danhMuc').lean()
    const sDmMap:Record<string,string> = {}
    for (const s of allSachs) sDmMap[String(s._id)]=(s as any).danhMuc||'KhÃ¡c'

    const dmCount:Record<string,number>={}
    for (const p of phieuKy) {
      const dm = sDmMap[String((p as any).sach)]||'KhÃ¡c'
      dmCount[dm]=(dmCount[dm]||0)+1
    }
    const muonTheoDanhMuc = Object.entries(dmCount)
      .map(([danhMuc,soLan])=>({ danhMuc, soLan }))
      .sort((a,b)=>b.soLan-a.soLan)

    // SÃ¡ch lá»—i theo loáº¡i
    // SÃ¡ch lá»—i theo loáº¡i â€” lá»c theo ká»³ Ä‘ang chá»n
    const loiTheoLoai = await BaoCaoLoi.aggregate([
      { $match:{ ngayBaoCao:dk } },
      { $group:{ _id:'$loaiLoi', soLuong:{ $sum:'$soLuong' }, soLan:{ $sum:1 } } },
      { $sort:{ soLuong:-1 } },
    ])

    // Xu hÆ°á»›ng
    const kN = Math.ceil((denNgay.getTime()-tuNgay.getTime())/86400000)
    const fmt = kN<=1?'%H:00':kN<=31?'%d/%m':'%m/%Y'
    const [trendMuon,trendTra] = await Promise.all([
      PhieuMuon.aggregate([
        { $match:{ ngayTao:dk } },
        { $group:{ _id:{ $dateToString:{ format:fmt, date:'$ngayTao' } }, soMuon:{ $sum:1 } } },
        { $sort:{ _id:1 } },
      ]),
      PhieuMuon.aggregate([
        { $match:{ ngayTraThuc:dk, trangThai:'daTra' } },
        { $group:{ _id:{ $dateToString:{ format:fmt, date:'$ngayTraThuc' } }, soTra:{ $sum:1 } } },
        { $sort:{ _id:1 } },
      ]),
    ])

    // SÃ¡ch sáº¯p háº¿t
    const sachSapHet = await Sach.find({ soBanConLai:{ $lte:2,$gte:0 } })
      .sort({ soBanConLai:1 }).limit(5).select('tenSach tacGia soBanConLai tongSoBan danhMuc').lean()

    return NextResponse.json({
      thanhCong:true,
      duLieu:{
        tongSach,tongNguoiDung,tongMuonKy,dangMuon,
        daTra,choDuyet,tuChoi,tongLoiKy,soQuaHan,
        topSach,topNguoiMuon,muonTheoDanhMuc,loiTheoLoai,
        trendMuon,trendTra,sachSapHet,
        tuNgay:tuNgay.toISOString(),denNgay:denNgay.toISOString(),
      },
    })
  } catch(loi:any) {
    return NextResponse.json({ thanhCong:false, thongBao:loi.message },{status:500})
  }
}

