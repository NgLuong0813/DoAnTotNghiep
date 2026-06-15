/**
 * MODEL — Báo Cáo Lỗi Sách
 * Đường dẫn: src/models/BaoCaoLoi.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBaoCaoLoi extends Document {
  sach:         mongoose.Types.ObjectId
  soLuong:      number
  loaiLoi:      'doSinhVien' | 'amUot' | 'cuRach' | 'vietChuLen' | 'banChu' | 'khac'
  nguoiViPham?: mongoose.Types.ObjectId
  lyDo:         string
  nguoiBaoCao:  mongoose.Types.ObjectId
  ngayBaoCao:   Date
}

const SchemaBaoCaoLoi = new Schema<IBaoCaoLoi>({
  sach:        { type: Schema.Types.ObjectId, ref: 'Sach',      required: true },
  soLuong:     { type: Number, required: true, min: 1 },
  loaiLoi:     { type: String, required: true, enum: ['doSinhVien','amUot','cuRach','vietChuLen','banChu','khac'] },
  nguoiViPham: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
  lyDo:        { type: String, required: true, trim: true },
  nguoiBaoCao: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  ngayBaoCao:  { type: Date, default: Date.now },
}, { timestamps: true, collection: 'baoCaoLoi' })

const BaoCaoLoi: Model<IBaoCaoLoi> =
  mongoose.models.BaoCaoLoi || mongoose.model<IBaoCaoLoi>('BaoCaoLoi', SchemaBaoCaoLoi)

export default BaoCaoLoi
