'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

interface ITinNhan { nguoiGui:'khach'|'nguoiDung'|'admin'; noiDung:string; thoiGian:string; daDoc:boolean }
interface ICuoc { _id:string; maPhien:string; tenHienThi:string; loai:'anDanh'|'dangNhap'; tinCuoi:string; thoiGianCuoi:string; soTinChuaDoc:number; ngayHetHan:string; danhSachTin?:ITinNhan[] }

export default function TrangTinNhan() {
  const { data: phien, status } = useSession()
  const nd = phien?.user as any
  const router = useRouter()
  const [danhSach, setDanhSach] = useState<ICuoc[]>([])
  const [cuocChon, setCuocChon] = useState<ICuoc|null>(null)
  const [noiDung, setNoiDung] = useState('')
  const [dangGui, setDangGui] = useState(false)
  const [dangTai, setDangTai] = useState(true)
  const [tuKhoa, setTuKhoa] = useState('')
  const [locLoai, setLocLoai] = useState<'tat_ca'|'anDanh'|'dangNhap'>('tat_ca')
  const cuoiRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout>()
  const maRef = useRef('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/dangnhap')
    if (status === 'authenticated' && nd?.vaiTro === 'sinhVien') router.replace('/')
  }, [status, nd, router])

  const taiDs = useCallback(async () => {
    try { const r = await fetch('/api/chat'); const j = await r.json(); if (j.thanhCong) { setDanhSach(j.duLieu||[]); setDangTai(false) } } catch {}
  }, [])

  const taiCuoc = useCallback(async (ma: string) => {
    if (!ma) return
    try { const r = await fetch(`/api/chat/${ma}`); const j = await r.json(); if (j.thanhCong && j.duLieu && maRef.current===ma) { setCuocChon(p => p?.maPhien===ma?{...p,danhSachTin:j.duLieu.danhSachTin||[]}:p) } } catch {}
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    taiDs()
    pollingRef.current = setInterval(()=>{taiDs();if(maRef.current)taiCuoc(maRef.current)},3000)
    return () => clearInterval(pollingRef.current)
  }, [status, taiDs, taiCuoc])

  useEffect(() => { setTimeout(()=>cuoiRef.current?.scrollIntoView({behavior:'smooth'}),100) }, [cuocChon?.danhSachTin?.length])

  const chonCuoc = async (cuoc: ICuoc) => {
    maRef.current = cuoc.maPhien
    try {
      const r = await fetch(`/api/chat/${cuoc.maPhien}`); const j = await r.json()
      setCuocChon({...cuoc,danhSachTin:j.duLieu?.danhSachTin||[]})
      if (cuoc.soTinChuaDoc>0) { fetch(`/api/chat/${cuoc.maPhien}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({hanhDong:'daDoc'})}); setDanhSach(p=>p.map(c=>c.maPhien===cuoc.maPhien?{...c,soTinChuaDoc:0}:c)) }
    } catch {}
    setTimeout(()=>inputRef.current?.focus(),300)
  }

  const gui = async () => {
    if (!noiDung.trim()||!cuocChon||dangGui) return
    setDangGui(true); const text=noiDung.trim(); setNoiDung('')
    setCuocChon(p=>p?{...p,danhSachTin:[...(p.danhSachTin||[]),{nguoiGui:'admin',noiDung:text,thoiGian:new Date().toISOString(),daDoc:true}]}:null)
    try { await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({maPhien:cuocChon.maPhien,noiDung:text})}); await fetch(`/api/chat/${cuocChon.maPhien}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({hanhDong:'giaHan'})}); taiDs() } catch {}
    setDangGui(false); setTimeout(()=>inputRef.current?.focus(),100)
  }

  const fTG = (tg:string) => { try { const d=Date.now()-new Date(tg).getTime(); if(isNaN(d)||d<0)return''; if(d<60000)return'Vừa xong'; if(d<3600000)return`${Math.floor(d/60000)}p`; if(d<86400000)return`${Math.floor(d/3600000)}h`; return new Date(tg).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}) } catch{return''} }
  const fGio = (tg:string) => { try{return new Date(tg).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}catch{return''} }
  const dsLoc = danhSach.filter(c=>(locLoai==='tat_ca'||c.loai===locLoai)&&(!tuKhoa||c.tenHienThi.toLowerCase().includes(tuKhoa.toLowerCase())))
  const tongMoi = danhSach.reduce((s,c)=>s+(c.soTinChuaDoc||0),0)

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',backgroundColor:'#f9fafb',overflow:'hidden'}}>
      {/* ✅ SidebarAdmin với inline style để không xung đột */}
      <div style={{width:224,backgroundColor:'white',borderRight:'1px solid #e5e7eb',display:'flex',flexDirection:'column',flexShrink:0,height:'100vh',overflowY:'auto'}}>
        <div style={{padding:16,borderBottom:'1px solid #f3f4f6'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:20}}>📚</span>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:'#111827'}}>{nd?.vaiTro==='thuThu'?'Thủ Thư UTT':'Admin UTT'}</div>
              <div style={{fontSize:10,color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:120}}>{nd?.name}</div>
            </div>
          </div>
        </div>
        <nav style={{padding:12,flex:1}}>
          {[
            {icon:'📊',nhan:'Tổng quan',href:'/admin'},
            {icon:'📚',nhan:'Quản lý sách',href:'/admin/sach'},
            {icon:'🚨',nhan:'Sách lỗi',href:'/admin/sach/loiSach'},
            {icon:'🗂️',nhan:'Danh mục',href:'/admin/danhMuc'},
            {icon:'👥',nhan:'Người dùng',href:'/admin/nguoidung'},
            {icon:'📋',nhan:'Mượn / Trả',href:'/admin/muontra'},
            {icon:'📰',nhan:'Tin tức',href:'/admin/tintuc'},
            {icon:'💬',nhan:'Tin nhắn',href:'/admin/tinnhan',active:true},
          ].map(m=>(
            <Link key={m.href} href={m.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,fontSize:14,marginBottom:2,backgroundColor:(m as any).active?'#2563eb':'transparent',color:(m as any).active?'white':'#4b5563',textDecoration:'none'}}>
              <span>{m.icon}</span>
              <span style={{flex:1}}>{m.nhan}</span>
              {m.href==='/admin/tinnhan'&&tongMoi>0&&<span style={{backgroundColor:'#F47920',color:'white',fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:10}}>{tongMoi>99?'99+':tongMoi}</span>}
            </Link>
          ))}
          <hr style={{margin:'8px 0',borderColor:'#f3f4f6'}}/>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,fontSize:14,color:'#6b7280',textDecoration:'none'}}>🏠 Trang chủ</Link>
        </nav>
      </div>

      {/* Chat area */}
      <div style={{display:'flex',flex:1,height:'100vh',overflow:'hidden'}}>
        {/* Danh sách */}
        <div style={{width:288,borderRight:'1px solid #e5e7eb',backgroundColor:'white',display:'flex',flexDirection:'column',height:'100vh',flexShrink:0}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:700,color:'#111827'}}>
                💬 Tin nhắn
                {tongMoi>0&&<span style={{backgroundColor:'#F47920',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10}}>{tongMoi} mới</span>}
              </div>
              <span style={{fontSize:12,color:'#9ca3af'}}>{danhSach.length}</span>
            </div>
            <input value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} placeholder="🔍 Tìm theo tên..."
              style={{width:'100%',fontSize:12,padding:'6px 12px',borderRadius:8,border:'1px solid #e5e7eb',outline:'none',boxSizing:'border-box',marginBottom:8}}/>
            <div style={{display:'flex',gap:4}}>
              {[{k:'tat_ca',n:'Tất cả'},{k:'dangNhap',n:'👤 TV'},{k:'anDanh',n:'🔒 Ẩn'}].map(item=>(
                <button key={item.k} onClick={()=>setLocLoai(item.k as any)}
                  style={{flex:1,padding:'4px 0',fontSize:10,fontWeight:600,borderRadius:6,border:'none',cursor:'pointer',backgroundColor:locLoai===item.k?'#0066CC':'#f3f4f6',color:locLoai===item.k?'white':'#6b7280'}}>
                  {item.n}
                </button>
              ))}
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {dangTai?<div style={{textAlign:'center',padding:'60px 0',color:'#9ca3af',fontSize:14}}>⏳ Đang tải...</div>
            :dsLoc.length===0?<div style={{textAlign:'center',padding:'60px 0',color:'#9ca3af'}}><div style={{fontSize:40,marginBottom:8}}>💬</div><div style={{fontSize:14}}>Chưa có tin nhắn</div></div>
            :dsLoc.map(cuoc=>(
              <div key={cuoc._id} onClick={()=>chonCuoc(cuoc)}
                style={{padding:'12px 16px',borderBottom:'1px solid #f9fafb',cursor:'pointer',backgroundColor:cuocChon?.maPhien===cuoc.maPhien?'#eff6ff':'white',borderLeft:cuocChon?.maPhien===cuoc.maPhien?'4px solid #2563eb':'4px solid transparent',userSelect:'none'}}
                onMouseEnter={e=>{if(cuocChon?.maPhien!==cuoc.maPhien)(e.currentTarget as HTMLDivElement).style.backgroundColor='#f9fafb'}}
                onMouseLeave={e=>{if(cuocChon?.maPhien!==cuoc.maPhien)(e.currentTarget as HTMLDivElement).style.backgroundColor='white'}}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',backgroundColor:cuoc.loai==='anDanh'?'#9ca3af':'#0066CC',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
                    {cuoc.loai==='anDanh'?'?':(cuoc.tenHienThi?.[0]?.toUpperCase()||'?')}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:14,fontWeight:cuoc.soTinChuaDoc>0?700:500,color:cuoc.soTinChuaDoc>0?'#111827':'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}>{cuoc.tenHienThi}</span>
                      <span style={{fontSize:10,color:'#9ca3af',flexShrink:0,marginLeft:4}}>{fTG(cuoc.thoiGianCuoi)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:12,color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{cuoc.tinCuoi||'...'}</span>
                      {cuoc.soTinChuaDoc>0&&<span style={{backgroundColor:'#F47920',color:'white',fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:10,flexShrink:0,marginLeft:4}}>{cuoc.soTinChuaDoc}</span>}
                    </div>
                    <span style={{fontSize:10,padding:'2px 6px',borderRadius:4,marginTop:4,display:'inline-block',backgroundColor:cuoc.loai==='anDanh'?'#f3f4f6':'#eff6ff',color:cuoc.loai==='anDanh'?'#6b7280':'#2563eb'}}>
                      {cuoc.loai==='anDanh'?'🔒 Ẩn danh':'👤 Thành viên'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khu vực chat */}
        <div style={{flex:1,display:'flex',flexDirection:'column',backgroundColor:'#f8faff',height:'100vh',overflow:'hidden'}}>
          {!cuocChon?(
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:72,marginBottom:16}}>💬</div>
                <h2 style={{fontSize:20,fontWeight:700,color:'#4b5563',marginBottom:8}}>Chọn cuộc trò chuyện</h2>
                <p style={{color:'#9ca3af',fontSize:14}}>để xem và phản hồi tin nhắn</p>
                {tongMoi>0&&<div style={{marginTop:16,display:'inline-flex',alignItems:'center',gap:8,backgroundColor:'#F47920',color:'white',padding:'10px 20px',borderRadius:12,fontSize:14,fontWeight:600}}>🔔 {tongMoi} tin nhắn mới</div>}
              </div>
            </div>
          ):(
            <>
              <div style={{padding:'12px 20px',backgroundColor:'white',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',backgroundColor:cuocChon.loai==='anDanh'?'#9ca3af':'#0066CC',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14}}>
                    {cuocChon.loai==='anDanh'?'?':cuocChon.tenHienThi?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:600,color:'#111827',fontSize:14}}>{cuocChon.tenHienThi}</div>
                    <div style={{fontSize:10,color:'#9ca3af'}}>{cuocChon.loai==='anDanh'?'🔒 Ẩn danh':'👤 Thành viên'} · {cuocChon.danhSachTin?.length||0} tin</div>
                  </div>
                </div>
                <button onClick={()=>{setCuocChon(null);maRef.current=''}} style={{width:32,height:32,borderRadius:'50%',border:'none',cursor:'pointer',backgroundColor:'transparent',fontSize:18,color:'#9ca3af'}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
                {(cuocChon.danhSachTin||[]).map((tin,i)=>{
                  const laA=tin.nguoiGui==='admin'
                  return (
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-end',flexDirection:laA?'row-reverse':'row'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',backgroundColor:laA?'#0066CC':tin.nguoiGui==='khach'?'#9ca3af':'#F47920',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',fontWeight:700,flexShrink:0}}>
                        {laA?'🛠':tin.nguoiGui==='khach'?'?':'👤'}
                      </div>
                      <div style={{maxWidth:'60%',display:'flex',flexDirection:'column',alignItems:laA?'flex-end':'flex-start'}}>
                        <div style={{padding:'10px 14px',borderRadius:laA?'12px 12px 0 12px':'12px 12px 12px 0',fontSize:14,lineHeight:1.5,wordBreak:'break-word',background:laA?'linear-gradient(135deg,#0066CC,#004d99)':'white',color:laA?'white':'#374151',border:laA?'none':'1px solid #e6f0ff'}}>
                          {tin.noiDung}
                        </div>
                        <span style={{fontSize:10,color:'#9ca3af',marginTop:4,padding:'0 4px'}}>{fGio(tin.thoiGian)}</span>
                      </div>
                    </div>
                  )
                })}
                <div ref={cuoiRef}/>
              </div>
              <div style={{padding:'12px 16px',backgroundColor:'white',borderTop:'1px solid #e5e7eb',flexShrink:0}}>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{flex:1,display:'flex',alignItems:'center',gap:8,border:'2px solid #cce0ff',borderRadius:12,padding:'8px 12px',backgroundColor:'#f0f6ff'}}>
                    <span style={{fontSize:12,fontWeight:600,color:'#0066CC',flexShrink:0}}>{nd?.name}:</span>
                    <input ref={inputRef} value={noiDung} onChange={e=>setNoiDung(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();gui()}}}
                      placeholder="Nhập phản hồi... (Enter để gửi)" maxLength={1000}
                      style={{flex:1,fontSize:14,outline:'none',backgroundColor:'transparent',border:'none'}}/>
                  </div>
                  <button onClick={gui} disabled={!noiDung.trim()||dangGui}
                    style={{padding:'10px 16px',fontSize:14,fontWeight:600,color:'white',backgroundColor:!noiDung.trim()||dangGui?'#93c5fd':'#0066CC',border:'none',borderRadius:12,cursor:!noiDung.trim()||dangGui?'not-allowed':'pointer',flexShrink:0}}>
                    {dangGui?'⏳':'📤 Gửi'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
