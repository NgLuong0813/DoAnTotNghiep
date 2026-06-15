/**
 * MODEL — Cuộc Trò Chuyện & Tin Nhắn
 * Đường dẫn: src/models/TinNhan.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITinNhan {
  nguoiGui:     'khach' | 'nguoiDung' | 'admin'
  noiDung:      string
  thoiGian:     Date
  daDoc:        boolean
  tenNguoiGui?: string  // Tên admin/thủ thư gửi tin
}

export interface ICuocTroChuyen extends Document {
  maPhien:      string
  nguoiDungId:  string | null
  tenHienThi:   string
  loai:         'anDanh' | 'dangNhap'
  danhSachTin:  ITinNhan[]
  tinCuoi:      string
  thoiGianCuoi: Date
  soTinChuaDoc: number
  ngayTao:      Date
  ngayCapNhat:  Date
  ngayHetHan:   Date | null  // null = vĩnh viễn (đăng nhập)
}

const SchemaTinNhan = new Schema<ITinNhan>({
  nguoiGui:    { type: String, enum: ['khach', 'nguoiDung', 'admin'], required: true },
  noiDung:     { type: String, required: true, trim: true, maxlength: 1000 },
  thoiGian:    { type: Date, default: Date.now },
  daDoc:       { type: Boolean, default: false },
  tenNguoiGui: { type: String, default: '' },
}, { _id: false })

const SchemaCuocTroChuyen = new Schema<ICuocTroChuyen>({
  maPhien:      { type: String, required: true, unique: true, index: true },
  nguoiDungId:  { type: String, default: null, index: true },
  tenHienThi:   { type: String, default: 'Khách' },
  loai:         { type: String, enum: ['anDanh', 'dangNhap'], default: 'anDanh' },
  danhSachTin:  { type: [SchemaTinNhan], default: [] },
  tinCuoi:      { type: String, default: '' },
  thoiGianCuoi: { type: Date, default: Date.now },
  soTinChuaDoc: { type: Number, default: 0 },
  // null = không hết hạn (người dùng đăng nhập)
  // Date = tự xóa sau ngày đó (ẩn danh 3 ngày)
  ngayHetHan:   { type: Date, default: null },
}, {
  timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  collection: 'cuocTroChuyen',
})

// TTL: sparse=true để bỏ qua document có ngayHetHan = null
SchemaCuocTroChuyen.index({ ngayHetHan: 1 }, { expireAfterSeconds: 0, sparse: true })

const CuocTroChuyen: Model<ICuocTroChuyen> =
  mongoose.models.CuocTroChuyen ||
  mongoose.model<ICuocTroChuyen>('CuocTroChuyen', SchemaCuocTroChuyen)

export default CuocTroChuyen
