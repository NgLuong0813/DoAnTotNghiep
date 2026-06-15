/**
 * API — Tải lên file
 * POST /api/taiLen?loai=word        → Upload file Word (lưu ảnh đầu tiên làm bìa)
 * POST /api/taiLen?loai=anhDaiDien  → Upload ảnh đại diện người dùng
 * POST /api/taiLen?loai=anhSach     → Upload ảnh sách (tối đa 5 ảnh)
 * Đường dẫn: src/app/api/taiLen/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const loaiFile   = searchParams.get('loai') || 'anhDaiDien'
    const duLieuForm = await req.formData()

    // ── Upload File Word ──────────────────────────────────────
    if (loaiFile === 'word') {
      const fileWord = duLieuForm.get('file') as File
      if (!fileWord) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chưa chọn file Word' }, { status: 400 })
      }
      if (!fileWord.name.endsWith('.docx')) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chỉ chấp nhận file Word .docx' }, { status: 400 })
      }

      const tieuDe       = fileWord.name.replace(/\.docx$/i, '').trim()
      const duLieuBuffer = Buffer.from(await fileWord.arrayBuffer())

      // Lưu file Word gốc
      const thuMucWord = path.join(process.cwd(), 'public', 'uploads', 'tintuc')
      if (!existsSync(thuMucWord)) await mkdir(thuMucWord, { recursive: true })
      const tenFileLuu = `${Date.now()}-${fileWord.name.replace(/\s+/g, '-')}`
      await writeFile(path.join(thuMucWord, tenFileLuu), duLieuBuffer)

      // Thư mục lưu ảnh từ Word
      const thuMucAnh = path.join(process.cwd(), 'public', 'uploads', 'tintuc-anh')
      if (!existsSync(thuMucAnh)) await mkdir(thuMucAnh, { recursive: true })

      // Biến theo dõi ảnh
      let anhDauTien = ''
      let soAnh = 0

      // Parse Word → HTML, lưu ảnh ra file thay vì base64
      const ketQua = await mammoth.convertToHtml(
        { buffer: duLieuBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='heading 1'] => h1:fresh",
            "p[style-name='heading 2'] => h2:fresh",
            "p[style-name='heading 3'] => h3:fresh",
            "p[alignment='center']     => p.center:fresh",
            "p[alignment='right']      => p.right:fresh",
            "p[alignment='both']       => p.justify:fresh",
            "b => strong",
            "i => em",
            "u => u",
          ],
          // Lưu ảnh ra file → trả URL thay vì base64
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const bufferAnh = await image.read()
              const duoiFile  = (image.contentType || 'image/png').split('/')[1] || 'png'
              const tenAnh    = `${Date.now()}-${soAnh++}.${duoiFile}`
              await writeFile(path.join(thuMucAnh, tenAnh), bufferAnh)
              const duongDanAnh = `/uploads/tintuc-anh/${tenAnh}`
              // Ảnh đầu tiên trong Word → dùng làm bìa bài viết
              if (!anhDauTien) anhDauTien = duongDanAnh
              return { src: duongDanAnh }
            } catch {
              return { src: '' }
            }
          }),
        }
      )

      return NextResponse.json({
        thanhCong:    true,
        tieuDe,
        noiDungHtml:  ketQua.value,
        tenFileWord:  fileWord.name,
        duongDanFile: `/uploads/tintuc/${tenFileLuu}`,
        anhDaiDien:   anhDauTien,  // ✅ Ảnh đầu tiên trong Word làm bìa
      })
    }

    // ── Upload Ảnh Đại Diện người dùng ───────────────────────
    if (loaiFile === 'anhDaiDien') {
      const fileAnh = duLieuForm.get('file') as File
      if (!fileAnh) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chưa chọn ảnh' }, { status: 400 })
      }
      const dinhDangChapNhan = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!dinhDangChapNhan.includes(fileAnh.type)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chỉ chấp nhận JPG, PNG, WEBP, GIF' }, { status: 400 })
      }
      if (fileAnh.size > 5 * 1024 * 1024) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Ảnh không quá 5MB' }, { status: 400 })
      }
      const duLieuBuffer = Buffer.from(await fileAnh.arrayBuffer())
      const thuMuc = path.join(process.cwd(), 'public', 'uploads', 'anhDaiDien')
      if (!existsSync(thuMuc)) await mkdir(thuMuc, { recursive: true })
      const duoiFile   = fileAnh.name.split('.').pop()
      const tenFileLuu = `${Date.now()}.${duoiFile}`
      await writeFile(path.join(thuMuc, tenFileLuu), duLieuBuffer)
      return NextResponse.json({ thanhCong: true, duongDanAnh: `/uploads/anhDaiDien/${tenFileLuu}` })
    }

    // ── Upload Ảnh Sách ───────────────────────────────────────
    if (loaiFile === 'anhSach') {
      const fileAnh = duLieuForm.get('file') as File
      if (!fileAnh) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chưa chọn ảnh' }, { status: 400 })
      }
      const dinhDangChapNhan = ['image/jpeg', 'image/png', 'image/webp']
      if (!dinhDangChapNhan.includes(fileAnh.type)) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Chỉ chấp nhận JPG, PNG, WEBP' }, { status: 400 })
      }
      if (fileAnh.size > 5 * 1024 * 1024) {
        return NextResponse.json({ thanhCong: false, thongBao: 'Ảnh không quá 5MB' }, { status: 400 })
      }
      const duLieuBuffer = Buffer.from(await fileAnh.arrayBuffer())
      const thuMuc = path.join(process.cwd(), 'public', 'uploads', 'anhSach')
      if (!existsSync(thuMuc)) await mkdir(thuMuc, { recursive: true })
      const duoiFile   = fileAnh.name.split('.').pop()
      const tenFileLuu = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${duoiFile}`
      await writeFile(path.join(thuMuc, tenFileLuu), duLieuBuffer)
      return NextResponse.json({ thanhCong: true, duongDanAnh: `/uploads/anhSach/${tenFileLuu}` })
    }

    return NextResponse.json({ thanhCong: false, thongBao: 'Loại file không hợp lệ' }, { status: 400 })

  } catch (loi: any) {
    console.error('Lỗi tải lên:', loi)
    return NextResponse.json({ thanhCong: false, thongBao: loi.message }, { status: 500 })
  }
}
