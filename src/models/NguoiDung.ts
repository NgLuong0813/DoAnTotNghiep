/**
 * MODEL — Người Dùng (NguoiDung)
 * Áp dụng cho: sinh viên, thủ thư, admin
 * Đường dẫn: src/models/NguoiDung.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INguoiDung extends Document {
  // ── THÔNG TIN ĐĂNG NHẬP ──────────────────────────────────
  email:       string        // Email đăng nhập (duy nhất)
  matKhau:     string        // Mật khẩu đã mã hóa (bcrypt)
  vaiTro:      'sinhVien' | 'thuThu' | 'admin'

  // ── THÔNG TIN CÁ NHÂN ────────────────────────────────────
  hoTen:       string        // Họ và tên đầy đủ
  maSoSV:      string        // Mã sinh viên / mã giảng viên
  soDienThoai: string        // Số điện thoại
  diaChi:      string        // Địa chỉ thường trú
  ngaySinh:    Date          // Ngày sinh
  gioiTinh:    'nam' | 'nu' | 'khac'
  khoa:        string        // Tên khoa (vd: Khoa CNTT)
  nganh:       string        // Chuyên ngành (vd: Kỹ thuật phần mềm)
  khoaHoc:     string        // Khóa học (vd: K62, K63)
  anhDaiDien:  string        // Đường dẫn ảnh đại diện: /uploads/anhDaiDien/xxx.jpg

  // ── THẺ THƯ VIỆN ─────────────────────────────────────────
  soThe:       string        // Số thẻ (tự động sinh: UTT000001)
  trangThaiThe: 'hoatDong' | 'choKichHoat' | 'dinh Chi' | 'hetHan'
  ngayHetHan:  Date          // Ngày hết hạn thẻ (4 năm kể từ ngày cấp)

  // ── THỐNG KÊ MƯỢN SÁCH ───────────────────────────────────
  tongSoLanMuon:   number    // Tổng số lần đã mượn từ trước đến nay
  dangMuon:        number    // Số sách đang mượn hiện tại (tối đa 5)

  // ── TRẠNG THÁI TÀI KHOẢN ─────────────────────────────────
  hoatDong:    boolean       // Tài khoản có đang hoạt động không

  ngayTao:     Date
  ngayCapNhat: Date
}

const SchemaNguoiDung = new Schema<INguoiDung>(
  {
    // Đăng nhập
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    matKhau:     { type: String, required: true },
    vaiTro:      { type: String, enum: ['sinhVien', 'thuThu', 'admin'], default: 'sinhVien' },

    // Thông tin cá nhân
    hoTen:       { type: String, required: true, trim: true },
    maSoSV:      { type: String, default: '', trim: true },
    soDienThoai: { type: String, default: '' },
    diaChi:      { type: String, default: '' },
    ngaySinh:    { type: Date, default: null },
    gioiTinh:    { type: String, enum: ['nam', 'nu', 'khac'], default: 'nam' },
    khoa:        { type: String, default: '' },
    nganh:       { type: String, default: '' },
    khoaHoc:     { type: String, default: '' },
    anhDaiDien:  { type: String, default: '' },

    // Thẻ thư viện
    soThe:       { type: String, unique: true, sparse: true },
    trangThaiThe: {
      type: String,
      enum: ['hoatDong', 'choKichHoat', 'dinhChi', 'hetHan'],
      default: 'choKichHoat',
    },
    ngayHetHan:  { type: Date, default: null },

    // Thống kê
    tongSoLanMuon: { type: Number, default: 0 },
    dangMuon:      { type: Number, default: 0 },

    hoatDong:    { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    collection: 'nguoiDung',
  }
)

// ── Tự sinh soThe và ngayHetHan trước khi lưu ────────────────
SchemaNguoiDung.pre('save', async function (next) {
  // Sinh số thẻ tự động nếu chưa có
  if (!this.soThe) {
    const soLuong = await mongoose.models.NguoiDung.countDocuments()
    this.soThe    = `UTT${String(soLuong + 1).padStart(6, '0')}`
  }
  // Thẻ có hiệu lực 4 năm kể từ ngày tạo
  if (!this.ngayHetHan) {
    const ngay = new Date()
    ngay.setFullYear(ngay.getFullYear() + 4)
    this.ngayHetHan = ngay
  }
  next()
})

const NguoiDung: Model<INguoiDung> =
  mongoose.models.NguoiDung || mongoose.model<INguoiDung>('NguoiDung', SchemaNguoiDung)

export default NguoiDung
