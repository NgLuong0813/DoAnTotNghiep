/**
 * MODEL — Tin Tức (TinTuc)
 * Hỗ trợ upload file Word (.docx) → tự parse nội dung HTML
 * Tiêu đề = tên file Word (bỏ phần mở rộng .docx)
 * Đường dẫn: src/models/TinTuc.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITinTuc extends Document {
  // ── NỘI DUNG BÀI VIẾT ────────────────────────────────────
  tieuDe:      string        // Tên bài viết (lấy từ tên file Word)
  tomTat:      string        // Tóm tắt ngắn (tự động lấy 200 ký tự đầu)
  noiDungHtml: string        // Nội dung HTML được parse từ file Word
  tenFileWord: string        // Tên file Word gốc (vd: "thong-bao-lich-nghi.docx")
  duongDanFile: string       // Đường dẫn file Word lưu trên server

  // ── PHÂN LOẠI ────────────────────────────────────────────
  loai:
    | 'tinTuc'       // Tin tức chung
    | 'thongBao'     // Thông báo
    | 'suKien'       // Sự kiện
    | 'noiQuy'       // Nội quy thư viện

  // ── HÌNH ẢNH ─────────────────────────────────────────────
  anhDaiDien:  string        // Ảnh thumbnail bài viết

  // ── THÔNG TIN ĐĂNG ───────────────────────────────────────
  nguoiDang:   mongoose.Types.ObjectId   // Ref → NguoiDung (admin đăng bài)
  ngayDang:    Date          // Ngày xuất bản
  trangThai:   'nhap' | 'daXuatBan'     // nhap: chưa đăng | daXuatBan: đã đăng

  // ── THỐNG KÊ ─────────────────────────────────────────────
  luotXem:     number        // Số lượt đọc bài viết

  // ── URL THÂN THIỆN ───────────────────────────────────────
  duongDan:    string        // Slug URL (tự sinh từ tieuDe)

  ngayTao:     Date
  ngayCapNhat: Date
}

const SchemaTinTuc = new Schema<ITinTuc>(
  {
    tieuDe:       { type: String, required: true, trim: true },
    tomTat:       { type: String, default: '' },
    noiDungHtml:  { type: String, default: '' },
    tenFileWord:  { type: String, default: '' },
    duongDanFile: { type: String, default: '' },

    loai: {
      type: String,
      enum: ['tinTuc', 'thongBao', 'suKien', 'noiQuy'],
      default: 'tinTuc',
    },

    anhDaiDien:  { type: String, default: '' },

    nguoiDang: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
    ngayDang:    { type: Date, default: null },
    trangThai:   { type: String, enum: ['nhap', 'daXuatBan'], default: 'nhap' },

    luotXem:     { type: Number, default: 0 },
    duongDan:    { type: String, unique: true, sparse: true },
  },
  {
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    collection: 'tinTuc',
  }
)

// ── Tự sinh duongDan (slug) từ tieuDe trước khi lưu ─────────
SchemaTinTuc.pre('save', function (next) {
  if (this.isModified('tieuDe') || !this.duongDan) {
    // Bỏ dấu tiếng Việt và tạo slug
    const slug = this.tieuDe
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    // Thêm timestamp để tránh trùng
    this.duongDan = slug || `bai-viet-${Math.random().toString(36).slice(2, 6)}`
  }
  // Tóm tắt tự động lấy 200 ký tự đầu từ nội dung (bỏ thẻ HTML)
  if (this.isModified('noiDungHtml') && !this.tomTat) {
    const vanBanThuang = this.noiDungHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    this.tomTat = vanBanThuang.substring(0, 200) + (vanBanThuang.length > 200 ? '...' : '')
  }
  next()
})

const TinTuc: Model<ITinTuc> =
  mongoose.models.TinTuc || mongoose.model<ITinTuc>('TinTuc', SchemaTinTuc)

export default TinTuc
