/**
 * MODEL — Danh Mục Sách
 * Đường dẫn: src/models/DanhMuc.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDanhMuc extends Document {
  ten:      string
  moTa:     string
  thuTu:    number
  hoatDong: boolean
  ngayTao:  Date
}

const SchemaDanhMuc = new Schema<IDanhMuc>({
  ten:      { type: String, required: true, trim: true, unique: true },
  moTa:     { type: String, default: '', trim: true },
  thuTu:    { type: Number, default: 0 },
  hoatDong: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  collection: 'danhMuc',
})

const DanhMuc: Model<IDanhMuc> =
  mongoose.models.DanhMuc || mongoose.model<IDanhMuc>('DanhMuc', SchemaDanhMuc)

export default DanhMuc
