'use client'
/**
 * COMPONENT - Hop Thoai Chat
 * Duong dan: src/components/HopThoaiChat.tsx
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface ITinNhan {
  nguoiGui:     'khach' | 'nguoiDung' | 'admin'
  noiDung:      string
  thoiGian:     string
  daDoc:        boolean
  tenNguoiGui?: string
}

function layMaPhienAnDanh(): string {
  if (typeof window === 'undefined') return ''
  const key = 'utt_phien_an_danh'
  let ma = localStorage.getItem(key)
  if (!ma) {
    ma = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(key, ma)
  }
  return ma
}

// Icon SVG thay the emoji de tranh loi encoding
const IconChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
)

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)

const IconBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
)

const IconLock = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#92400e">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
  </svg>
)

export default function HopThoaiChat() {
  const { data: phien, status } = useSession()
  const nd = phien?.user as any

  const [moRong,      setMoRong]      = useState(false)
  const [danhSachTin, setDanhSachTin] = useState<ITinNhan[]>([])
  const [noiDung,     setNoiDung]     = useState('')
  const [dangGui,     setDangGui]     = useState(false)
  const [maPhien,     setMaPhien]     = useState('')
  const [soTinMoi,    setSoTinMoi]    = useState(0)
  const [daCoTC,      setDaCoTC]      = useState(false)

  const cuoiRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (status === 'loading') return
    if (nd?.id) {
      setMaPhien(`user_${nd.id}`)
    } else if (status === 'unauthenticated') {
      setMaPhien(layMaPhienAnDanh())
    }
  }, [status, nd?.id])

  const moRongRef = useRef(false)
  useEffect(() => { moRongRef.current = moRong }, [moRong])

  const taiTinNhan = useCallback(async () => {
    if (!maPhien) return
    try {
      const res  = await fetch(`/api/chat/${maPhien}`)
      const json = await res.json()
      if (json.thanhCong && json.duLieu) {
        setDaCoTC(true)
        const ds = json.duLieu.danhSachTin || []
        setDanhSachTin(ds)
        // Chi dem badge khi chat dang dong
        if (!moRongRef.current) {
          setSoTinMoi(ds.filter((t: ITinNhan) => t.nguoiGui === 'admin' && !t.daDoc).length)
        }
      }
    } catch {}
  }, [maPhien])

  useEffect(() => {
    if (!maPhien) return
    taiTinNhan()
    pollingRef.current = setInterval(taiTinNhan, 4000)
    return () => clearInterval(pollingRef.current)
  }, [maPhien, taiTinNhan])

  useEffect(() => {
    if (moRong) setTimeout(() => cuoiRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [danhSachTin.length, moRong])

  useEffect(() => {
    if (moRong && maPhien && soTinMoi > 0 && daCoTC) {
      setSoTinMoi(0)
      fetch(`/api/chat/${maPhien}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'daDoc' }),
      }).catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [moRong, maPhien, soTinMoi, daCoTC])

  const guiTinNhan = async () => {
    if (!noiDung.trim() || dangGui || !maPhien) return
    setDangGui(true)
    const text = noiDung.trim()
    setNoiDung('')
    setDaCoTC(true)

    const tinMoi: ITinNhan = {
      nguoiGui:    nd ? 'nguoiDung' : 'khach',
      noiDung:     text,
      thoiGian:    new Date().toISOString(),
      daDoc:       false,
      tenNguoiGui: '',
    }
    setDanhSachTin(prev => [...prev, tinMoi])

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maPhien, noiDung: text, tenHienThi: nd?.name || null }),
      })
    } catch {
      setDanhSachTin(prev => prev.slice(0, -1))
    }
    setDangGui(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const formatGio = (tg: string) => {
    try { return new Date(tg).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {moRong && (
        <div style={{
          width: '320px', height: '460px', display: 'flex', flexDirection: 'column',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #cce0ff', backgroundColor: 'white', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#002952,#0066CC)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <IconBook />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }} />
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                  Ho tro Thu vien UTT
                </div>
                <div style={{ color: '#93c5fd', fontSize: 10 }}>
                  {nd ? `Xin chao, ${nd.name}` : 'Thuong phan hoi trong vai phut'}
                </div>
              </div>
            </div>
            <button onClick={() => setMoRong(false)}
              style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconClose />
            </button>
          </div>

          {/* Danh sach tin nhan */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8faff' }}>
            {/* Tin chao */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconBook />
              </div>
              <div style={{ backgroundColor: 'white', border: '1px solid #e6f0ff', borderRadius: '0 12px 12px 12px', padding: '8px 12px', maxWidth: '80%' }}>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                  Xin chao{nd?.name ? ` ${nd.name}` : ''}!<br />
                  Toi co the giup gi cho ban?
                  {!nd && (
                    <><br /><span style={{ color: '#9ca3af', fontSize: 10 }}>
                      (Chat an danh - lich su luu 3 ngay)
                    </span></>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Thu vien UTT</div>
              </div>
            </div>

            {danhSachTin.map((tin, i) => {
              const laMinh = tin.nguoiGui !== 'admin'
              const kyTuDau = tin.tenNguoiGui ? tin.tenNguoiGui[0].toUpperCase() : 'A'
              return (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexDirection: laMinh ? 'row-reverse' : 'row' }}>
                  {!laMinh && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', flexShrink: 0, fontWeight: 700 }}>
                      {kyTuDau}
                    </div>
                  )}
                  <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: laMinh ? 'flex-end' : 'flex-start' }}>
                    {/* Ten admin/thu thu */}
                    {!laMinh && tin.tenNguoiGui && (
                      <div style={{ fontSize: 10, color: '#0066CC', fontWeight: 600, marginBottom: 2, paddingLeft: 4 }}>
                        {tin.tenNguoiGui}
                      </div>
                    )}
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: laMinh ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      fontSize: 12, lineHeight: 1.5, wordBreak: 'break-word',
                      background: laMinh ? 'linear-gradient(135deg,#0066CC,#004d99)' : 'white',
                      color: laMinh ? 'white' : '#374151',
                      border: laMinh ? 'none' : '1px solid #e6f0ff',
                    }}>
                      {tin.noiDung}
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, padding: '0 4px' }}>
                      {formatGio(tin.thoiGian)}
                      {laMinh && tin.daDoc && (
                        <span style={{ marginLeft: 4, color: '#60a5fa' }}>&#10003;&#10003;</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={cuoiRef} />
          </div>

          {/* Canh bao an danh */}
          {!nd && (
            <div style={{ padding: '5px 12px', backgroundColor: '#fff3e6', borderTop: '1px solid #fcd9a0', textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <IconLock />
              <span style={{ fontSize: 10, color: '#92400e' }}>
                Chat an danh &middot; Luu 3 ngay &middot;{' '}
                <a href="/auth/dangnhap" style={{ color: '#0066CC', textDecoration: 'underline' }}>
                  Dang nhap
                </a>{' '}
                de luu vinh vien
              </span>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', backgroundColor: 'white', borderTop: '1px solid #e6f0ff', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={noiDung}
              onChange={e => setNoiDung(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && guiTinNhan()}
              placeholder="Nhap tin nhan..."
              maxLength={500}
              style={{ flex: 1, fontSize: 12, padding: '8px 12px', borderRadius: 10, border: '1px solid #cce0ff', backgroundColor: '#f0f6ff', outline: 'none' }}
            />
            <button
              onClick={guiTinNhan}
              disabled={!noiDung.trim() || dangGui}
              style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: !noiDung.trim() || dangGui ? '#9ca3af' : '#0066CC', border: 'none', cursor: !noiDung.trim() || dangGui ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {dangGui
                ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <IconSend />
              }
            </button>
          </div>
        </div>
      )}

      {/* Nut mo chat */}
      <button
        onClick={() => setMoRong(!moRong)}
        style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#0066CC,#004d99)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,102,204,0.4)', position: 'relative' }}>
        {moRong ? <IconClose /> : <IconChat />}
        {!moRong && soTinMoi > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#F47920', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            {soTinMoi > 9 ? '9+' : soTinMoi}
          </div>
        )}
      </button>
    </div>
  )
}
