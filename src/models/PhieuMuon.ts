/**
 * MODEL — Phiếu Mượn Trả (PhieuMuon)
 * Đường dẫn: src/models/PhieuMuon.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPhieuMuon extends Document {
  // ── LIÊN KẾT ─────────────────────────────────────────────
  nguoiMuon:   mongoose.Types.ObjectId   // Ref → NguoiDung
  sach:        mongoose.Types.ObjectId   // Ref → Sach
  thuThuXuLy:  mongoose.Types.ObjectId   // Ref → NguoiDung (thủ thư duyệt)

  // ── THỜI GIAN ────────────────────────────────────────────
  ngayMuon:    Date          // Ngày bắt đầu mượn
  ngayHanTra:  Date          // Hạn phải trả (ngayMuon + 14 ngày)
  ngayTraThuc: Date          // Ngày trả thực tế (null nếu chưa trả)
  soLanGiaHan: number        // Đã gia hạn bao nhiêu lần (tối đa 2)
  ngayGiaHan:  Date          // Ngày gia hạn gần nhất

  // ── TRẠNG THÁI ───────────────────────────────────────────
  trangThai:
    | 'choDuyet'   // Sinh viên vừa gửi yêu cầu, chờ thủ thư duyệt
    | 'dangMuon'   // Thủ thư đã duyệt, sách đang được mượn
    | 'daTra'      // Đã trả sách
    | 'quaHan'     // Quá hạn trả
    | 'matSach'    // Báo mất sách
    | 'tuChoi'     // Thủ thư từ chối yêu cầu

  // ── TIỀN PHẠT ────────────────────────────────────────────
  tienPhat:    number        // Tổng tiền phạt (VNĐ) — 2.000đ/ngày quá hạn
  daThanhToan: boolean       // Đã nộp tiền phạt chưa
  ngayThanhToan: Date        // Ngày nộp tiền phạt

  // ── GHI CHÚ ──────────────────────────────────────────────
  ghiChu:      string        // Ghi chú của thủ thư (lý do từ chối, tình trạng sách...)

  ngayTao:     Date
  ngayCapNhat: Date
}

const SchemaPhieuMuon = new Schema<IPhieuMuon>(
  {
    nguoiMuon:   { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    sach:        { type: Schema.Types.ObjectId, ref: 'Sach',      required: true },
    thuThuXuLy:  { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },

    ngayMuon:    { type: Date, default: Date.now },
    ngayHanTra:  { type: Date, required: true },
    ngayTraThuc: { type: Date, default: null },
    soLanGiaHan: { type: Number, default: 0 },
    ngayGiaHan:  { type: Date, default: null },

    trangThai: {
      type: String,
      enum: ['choDuyet', 'dangMuon', 'daTra', 'quaHan', 'matSach', 'tuChoi'],
      default: 'choDuyet',
    },

    tienPhat:      { type: Number, default: 0 },
    daThanhToan:   { type: Boolean, default: false },
    ngayThanhToan: { type: Date, default: null },

    ghiChu:      { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    collection: 'phieuMuon',
  }
)

// ── Tính tiền phạt (2.000 VNĐ/ngày quá hạn) ─────────────────
SchemaPhieuMuon.methods.tinhTienPhat = function (): number {
  const ngayTra  = this.ngayTraThuc || new Date()
  const chenh    = ngayTra.getTime() - this.ngayHanTra.getTime()
  const soNgay   = Math.max(0, Math.ceil(chenh / 86400000))
  return soNgay * 2000
}

const PhieuMuon: Model<IPhieuMuon> =
  mongoose.models.PhieuMuon || mongoose.model<IPhieuMuon>('PhieuMuon', SchemaPhieuMuon)

export default PhieuMuon
