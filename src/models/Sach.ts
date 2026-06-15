/**
 * MODEL — Sách
 * Thêm trường danhSachAnh: tối đa 5 ảnh cho mỗi cuốn sách
 * Đường dẫn: src/models/Sach.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISach extends Document {
  tenSach:        string
  tacGia:         string
  maSach:         string
  danhMuc:        string
  danhMucCon:     string
  nhaXuatBan:     string
  namXuatBan:     number
  lanTaiBan:      string
  ngonNgu:        string
  soTrang:        number

  tongSoBan:      number
  soBanConLai:    number
  viTriKe:        string
  kyHieuPhanLoai: string

  anhBia:         string       // Ảnh bìa chính (ảnh đầu tiên trong danhSachAnh)
  danhSachAnh:    string[]     // Danh sách tối đa 5 ảnh
  moTa:           string

  luotXem:        number
  luotMuon:       number

  trangThai:      'choMuon' | 'hetSach' | 'baoTri'

  ngayTao:        Date
  ngayCapNhat:    Date
}

const SchemaSach = new Schema<ISach>(
  {
    tenSach:        { type: String, required: true, trim: true },
    tacGia:         { type: String, required: true, trim: true },
    maSach:         { type: String, default: '', trim: true },
    danhMuc:        { type: String, required: true },
    danhMucCon:     { type: String, default: '' },
    nhaXuatBan:     { type: String, default: '' },
    namXuatBan:     { type: Number, default: new Date().getFullYear() },
    lanTaiBan:      { type: String, default: '' },
    ngonNgu:        { type: String, default: 'Tiếng Việt' },
    soTrang:        { type: Number, default: 0 },

    tongSoBan:      { type: Number, required: true, min: 0, default: 1 },
    soBanConLai:    { type: Number, required: true, min: 0, default: 1 },
    viTriKe:        { type: String, default: '' },
    kyHieuPhanLoai: { type: String, default: '' },

    anhBia:         { type: String, default: '' },
    danhSachAnh:    { type: [String], default: [], validate: {
      validator: (arr: string[]) => arr.length <= 5,
      message:   'Tối đa 5 ảnh cho mỗi cuốn sách',
    }}, 
    moTa:           { type: String, default: '' },

    luotXem:        { type: Number, default: 0 },
    luotMuon:       { type: Number, default: 0 },

    trangThai: {
      type:    String,
      enum:    ['choMuon', 'hetSach', 'baoTri'],
      default: 'choMuon',
    },
  },
  {
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    collection: 'sach',
  }
)

SchemaSach.index({ tenSach: 'text', tacGia: 'text', moTa: 'text', maSach: 'text' })

const Sach: Model<ISach> = mongoose.models.Sach || mongoose.model<ISach>('Sach', SchemaSach)
export default Sach
