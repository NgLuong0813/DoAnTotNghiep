/**
 * TẠO DỮ LIỆU MẪU — Chạy bằng lệnh: npm run taoMauDuLieu
 * Tạo tài khoản admin, thủ thư, sinh viên + sách mẫu + tin tức mẫu
 * Đường dẫn: src/lib/taoMauDuLieu.js
 */

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const path     = require('path')
const fs       = require('fs')

// Đọc file .env.local
const envFile = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile })
} else {
  console.error('❌ Không tìm thấy file .env.local')
  process.exit(1)
}

const DUONG_DAN_DB = process.env.MONGODB_URI
if (!DUONG_DAN_DB) {
  console.error('❌ Chưa cấu hình MONGODB_URI trong .env.local')
  process.exit(1)
}

// ── Khai báo Schema ───────────────────────────────────────────
const SchemaNguoiDung = new mongoose.Schema({
  hoTen: String, email: { type: String, unique: true }, matKhau: String,
  vaiTro: { type: String, default: 'sinhVien' },
  maSoSV: String, soDienThoai: String, diaChi: String,
  gioiTinh: { type: String, default: 'nam' },
  khoa: String, nganh: String, khoaHoc: String, anhDaiDien: String,
  soThe: { type: String, unique: true }, trangThaiThe: { type: String, default: 'choKichHoat' },
  ngayHetHan: Date, tongSoLanMuon: { type: Number, default: 0 },
  dangMuon: { type: Number, default: 0 }, hoatDong: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' }, collection: 'nguoiDung' })

const SchemaSach = new mongoose.Schema({
  tenSach: String, tacGia: String, maSach: String,
  danhMuc: String, danhMucCon: String, nhaXuatBan: String,
  namXuatBan: Number, lanTaiBan: String, ngonNgu: { type: String, default: 'Tiếng Việt' },
  soTrang: Number, tongSoBan: Number, soBanConLai: Number,
  viTriKe: String, kyHieuPhanLoai: String, anhBia: String, moTa: String,
  luotXem: { type: Number, default: 0 }, luotMuon: { type: Number, default: 0 },
  trangThai: { type: String, default: 'choMuon' },
}, { timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' }, collection: 'sach' })

const SchemaTinTuc = new mongoose.Schema({
  tieuDe: String, tomTat: String, noiDungHtml: String, tenFileWord: String,
  loai: { type: String, default: 'tinTuc' }, anhDaiDien: String,
  nguoiDang: mongoose.Schema.Types.ObjectId,
  ngayDang: Date, trangThai: { type: String, default: 'daXuatBan' },
  luotXem: { type: Number, default: 0 }, duongDan: { type: String, unique: true },
}, { timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' }, collection: 'tinTuc' })

// ── Dữ liệu mẫu ──────────────────────────────────────────────
const DANH_SACH_TAI_KHOAN = [
  {
    hoTen: 'Quản trị viên UTT', email: 'admin@utt.edu.vn',
    matKhau: 'admin123', vaiTro: 'admin',
    soThe: 'UTT000001', trangThaiThe: 'hoatDong',
    khoa: 'Trung tâm CNTT', soDienThoai: '0987654321',
  },
  {
    hoTen: 'Nguyễn Thị Thu Hà', email: 'thuthu@utt.edu.vn',
    matKhau: 'thuthu123', vaiTro: 'thuThu',
    soThe: 'UTT000002', trangThaiThe: 'hoatDong',
    khoa: 'Trung tâm Thư viện', soDienThoai: '0912345678',
  },
  {
    hoTen: 'Nguyễn Văn An', email: 'sv001@sv.utt.edu.vn',
    matKhau: 'sinhvien123', vaiTro: 'sinhVien',
    maSoSV: 'DTH20220001', soThe: 'UTT000003', trangThaiThe: 'hoatDong',
    khoa: 'Khoa Công nghệ thông tin', nganh: 'Kỹ thuật phần mềm',
    khoaHoc: 'K62', gioiTinh: 'nam', soDienThoai: '0901234567',
  },
  {
    hoTen: 'Trần Thị Bích Ngọc', email: 'sv002@sv.utt.edu.vn',
    matKhau: 'sinhvien123', vaiTro: 'sinhVien',
    maSoSV: 'DTH20220002', soThe: 'UTT000004', trangThaiThe: 'hoatDong',
    khoa: 'Khoa Kinh tế vận tải', nganh: 'Quản trị kinh doanh',
    khoaHoc: 'K62', gioiTinh: 'nu', soDienThoai: '0902345678',
  },
  {
    hoTen: 'Lê Minh Đức', email: 'sv003@sv.utt.edu.vn',
    matKhau: 'sinhvien123', vaiTro: 'sinhVien',
    maSoSV: 'DTH20230001', soThe: 'UTT000005', trangThaiThe: 'choKichHoat',
    khoa: 'Khoa Công nghệ thông tin', nganh: 'Hệ thống thông tin',
    khoaHoc: 'K63', gioiTinh: 'nam', soDienThoai: '0903456789',
  },
]

const DANH_SACH_SACH = [
  {
    tenSach: 'Giáo trình Lập trình Web với Node.js và React',
    tacGia: 'Nguyễn Văn Học', maSach: '978-604-67-1001-1',
    danhMuc: 'Công nghệ thông tin', danhMucCon: 'Lập trình Web',
    nhaXuatBan: 'NXB Bách Khoa Hà Nội', namXuatBan: 2023,
    tongSoBan: 5, soBanConLai: 3, viTriKe: 'A1-K01',
    kyHieuPhanLoai: '005.133/L201', soTrang: 380,
    moTa: 'Giáo trình lập trình web hiện đại với Node.js và React, từ cơ bản đến nâng cao.',
  },
  {
    tenSach: 'Cơ sở dữ liệu — Lý thuyết và thực hành',
    tacGia: 'Trần Đức Quảng', maSach: '978-604-67-1002-2',
    danhMuc: 'Công nghệ thông tin', danhMucCon: 'Cơ sở dữ liệu',
    nhaXuatBan: 'NXB Giáo dục Việt Nam', namXuatBan: 2022,
    tongSoBan: 8, soBanConLai: 5, viTriKe: 'A1-K02',
    kyHieuPhanLoai: '005.74/C452', soTrang: 290,
    moTa: 'Lý thuyết và bài tập thực hành về hệ quản trị cơ sở dữ liệu MySQL, PostgreSQL.',
  },
  {
    tenSach: 'Phân tích và thiết kế hệ thống thông tin',
    tacGia: 'Nguyễn Văn Ba', maSach: '978-604-67-1003-3',
    danhMuc: 'Công nghệ thông tin', danhMucCon: 'Phân tích hệ thống',
    nhaXuatBan: 'NXB Đại học Quốc gia Hà Nội', namXuatBan: 2021,
    tongSoBan: 6, soBanConLai: 4, viTriKe: 'A2-K01',
    kyHieuPhanLoai: '004.2/P121', soTrang: 340,
    moTa: 'Phương pháp phân tích và thiết kế hệ thống thông tin hướng đối tượng với UML.',
  },
  {
    tenSach: 'Mạng máy tính — Từ lý thuyết đến thực tiễn',
    tacGia: 'Nguyễn Thị Lan', maSach: '978-604-67-1004-4',
    danhMuc: 'Công nghệ thông tin', danhMucCon: 'Mạng máy tính',
    nhaXuatBan: 'NXB Bách Khoa Hà Nội', namXuatBan: 2023,
    tongSoBan: 6, soBanConLai: 0, viTriKe: 'A1-K03',
    kyHieuPhanLoai: '004.6/M107', soTrang: 420,
    moTa: 'Giao thức mạng, mô hình OSI, TCP/IP, bảo mật mạng và thực hành cấu hình.',
    trangThai: 'hetSach',
  },
  {
    tenSach: 'Kinh tế học vi mô',
    tacGia: 'Phạm Văn Minh', maSach: '978-604-67-1005-5',
    danhMuc: 'Kinh tế', danhMucCon: 'Kinh tế vi mô',
    nhaXuatBan: 'NXB Kinh tế Quốc dân', namXuatBan: 2020,
    tongSoBan: 10, soBanConLai: 7, viTriKe: 'B1-K01',
    kyHieuPhanLoai: '338.5/K312', soTrang: 310,
    moTa: 'Giáo trình kinh tế học vi mô dành cho sinh viên khối ngành kinh tế, quản trị.',
  },
  {
    tenSach: 'Kế toán doanh nghiệp',
    tacGia: 'Lê Thị Hương', maSach: '978-604-67-1006-6',
    danhMuc: 'Kinh tế', danhMucCon: 'Kế toán',
    nhaXuatBan: 'NXB Tài chính', namXuatBan: 2022,
    tongSoBan: 7, soBanConLai: 5, viTriKe: 'B1-K02',
    kyHieuPhanLoai: '657/K250', soTrang: 280,
    moTa: 'Giáo trình kế toán doanh nghiệp theo chuẩn mực kế toán Việt Nam hiện hành.',
  },
  {
    tenSach: 'Giáo trình Tiếng Anh chuyên ngành CNTT',
    tacGia: 'Lê Thị Hoa', maSach: '978-604-67-1007-7',
    danhMuc: 'Ngoại ngữ', danhMucCon: 'Tiếng Anh CNTT',
    nhaXuatBan: 'NXB Đại học Quốc gia', namXuatBan: 2021,
    tongSoBan: 12, soBanConLai: 9, viTriKe: 'C1-K05',
    kyHieuPhanLoai: '428.24/T452', soTrang: 240,
    moTa: 'Tiếng Anh chuyên ngành CNTT dành cho sinh viên năm 3, năm 4.',
  },
  {
    tenSach: 'Luật Công nghệ thông tin và An toàn thông tin mạng',
    tacGia: 'Bộ Thông tin và Truyền thông',
    danhMuc: 'Luật', danhMucCon: 'Luật CNTT',
    nhaXuatBan: 'NXB Chính trị Quốc gia', namXuatBan: 2023,
    tongSoBan: 4, soBanConLai: 4, viTriKe: 'D1-K01',
    kyHieuPhanLoai: '343.0999/L504', soTrang: 196,
    moTa: 'Luật CNTT, an toàn thông tin mạng và các văn bản hướng dẫn thi hành.',
  },
]

const DANH_SACH_TIN_TUC = [
  {
    tieuDe: 'Thông báo lịch mở cửa thư viện học kỳ II năm học 2025-2026',
    tomTat: 'Trung tâm CNTT và Thư viện UTT thông báo lịch mở cửa phục vụ sinh viên trong học kỳ II...',
    noiDungHtml: '<h2>Thông báo lịch mở cửa</h2><p>Trung tâm CNTT và Thư viện UTT thông báo lịch mở cửa phục vụ sinh viên trong <strong>học kỳ II năm học 2025-2026</strong> như sau:</p><ul><li>Thứ 2 - Thứ 6: 7:30 - 21:00</li><li>Thứ 7: 7:30 - 17:00</li><li>Chủ nhật: Nghỉ</li></ul><p>Sinh viên cần xuất trình thẻ thư viện còn hiệu lực khi vào đọc phòng.</p>',
    loai: 'thongBao', duongDan: 'lich-mo-cua-hk2-2025-2026',
    ngayDang: new Date('2026-02-01'), trangThai: 'daXuatBan', luotXem: 340,
  },
  {
    tieuDe: 'Hội thảo kỹ năng tìm kiếm tài liệu khoa học với AI',
    tomTat: 'Thư viện UTT phối hợp với Khoa CNTT tổ chức hội thảo hướng dẫn sinh viên tìm kiếm tài liệu...',
    noiDungHtml: '<h2>Hội thảo kỹ năng tìm kiếm tài liệu</h2><p>Thư viện UTT phối hợp cùng <strong>Khoa Công nghệ thông tin</strong> tổ chức buổi hội thảo:</p><p><strong>Thời gian:</strong> 8:00 - 11:00, Thứ Bảy ngày 15/03/2026</p><p><strong>Địa điểm:</strong> Phòng hội thảo A - Tòa nhà Thư viện</p><p><strong>Nội dung:</strong> Hướng dẫn sử dụng các công cụ AI hỗ trợ tìm kiếm tài liệu học thuật, trích dẫn đúng chuẩn APA/MLA.</p>',
    loai: 'suKien', duongDan: 'hoi-thao-ky-nang-tim-kiem-tai-lieu',
    ngayDang: new Date('2026-03-01'), trangThai: 'daXuatBan', luotXem: 892,
  },
  {
    tieuDe: 'Bổ sung 200 đầu sách mới tháng 3 năm 2026',
    tomTat: 'Thư viện vừa bổ sung 200 đầu sách mới thuộc nhiều lĩnh vực, đặc biệt là CNTT và Kinh tế...',
    noiDungHtml: '<h2>Bổ sung sách mới tháng 3/2026</h2><p>Trung tâm CNTT và Thư viện UTT vừa tiếp nhận và đưa vào phục vụ <strong>200 đầu sách mới</strong> thuộc các lĩnh vực:</p><ul><li>Công nghệ thông tin: 80 cuốn</li><li>Kinh tế - Quản trị: 60 cuốn</li><li>Ngoại ngữ: 40 cuốn</li><li>Luật và Xã hội: 20 cuốn</li></ul><p>Sinh viên có thể tra cứu và đặt mượn ngay trên hệ thống.</p>',
    loai: 'tinTuc', duongDan: 'bo-sung-sach-moi-thang-3-2026',
    ngayDang: new Date('2026-03-10'), trangThai: 'daXuatBan', luotXem: 1205,
  },
]

// ── Hàm chính ─────────────────────────────────────────────────
async function taoMauDuLieu() {
  const duongDanMaHoa = DUONG_DAN_DB.replace(/:([^@]+)@/, ':****@')
  console.log(`\n🔌 Đang kết nối: ${duongDanMaHoa}\n`)

  await mongoose.connect(DUONG_DAN_DB, { serverSelectionTimeoutMS: 10000 })
  console.log('✅ Kết nối MongoDB Atlas thành công!\n')

  const NguoiDung = mongoose.models.NguoiDung || mongoose.model('NguoiDung', SchemaNguoiDung)
  const Sach      = mongoose.models.Sach      || mongoose.model('Sach', SchemaSach)
  const TinTuc    = mongoose.models.TinTuc    || mongoose.model('TinTuc', SchemaTinTuc)

  // Xóa dữ liệu cũ
  await NguoiDung.deleteMany({})
  await Sach.deleteMany({})
  await TinTuc.deleteMany({})
  console.log('🗑  Đã xóa dữ liệu cũ\n')

  // Tạo tài khoản
  console.log('👥 Đang tạo tài khoản...')
  const danhSachTaiKhoan = []
  for (const tk of DANH_SACH_TAI_KHOAN) {
    const matKhauMaHoa = await bcrypt.hash(tk.matKhau, 10)
    const ngayHetHan   = new Date()
    ngayHetHan.setFullYear(ngayHetHan.getFullYear() + 4)
    const taoMoi = await NguoiDung.create({ ...tk, matKhau: matKhauMaHoa, ngayHetHan })
    danhSachTaiKhoan.push(taoMoi)
    console.log(`   ✓ ${tk.vaiTro.padEnd(10)} | ${tk.hoTen.padEnd(25)} | ${tk.email}`)
  }

  // Tạo sách
  console.log('\n📚 Đang tạo sách...')
  const sachDaTao = await Sach.insertMany(DANH_SACH_SACH)
  sachDaTao.forEach((s, i) => console.log(`   ✓ [${i + 1}] ${s.tenSach}`))

  // Tạo tin tức (gán admin làm người đăng)
  console.log('\n📰 Đang tạo tin tức...')
  const adminId = danhSachTaiKhoan[0]._id
  for (const tin of DANH_SACH_TIN_TUC) {
    await TinTuc.create({ ...tin, nguoiDang: adminId })
    console.log(`   ✓ ${tin.tieuDe}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('🎉 TẠO DỮ LIỆU MẪU THÀNH CÔNG!')
  console.log('═'.repeat(60))
  console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:')
  console.log('   Admin:    admin@utt.edu.vn    / admin123')
  console.log('   Thủ thư:  thuthu@utt.edu.vn   / thuthu123')
  console.log('   Sinh viên: sv001@sv.utt.edu.vn / sinhvien123')
  console.log('\n🌐 Truy cập: http://localhost:3000')
  console.log('   → Trang chủ (không cần đăng nhập): http://localhost:3000')
  console.log('   → Trang admin: http://localhost:3000/admin/sach\n')

  await mongoose.disconnect()
  process.exit(0)
}

taoMauDuLieu().catch((loi) => {
  console.error('❌ Lỗi:', loi.message)
  process.exit(1)
})
