# patch_sosaachloi.ps1
# Chay: powershell -ExecutionPolicy Bypass -File ".\patch_soSachLoi.ps1"

$path = "src\app\admin\sach\page.tsx"
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Sửa fetch baoCaoLoi - thay gioiHan=500 bằng soSachDuy=true để đếm chính xác
$old = "fetch('/api/baoCaoLoi?gioiHan=500'),"
$new = "fetch('/api/baoCaoLoi?soSachDuy=true'),"
$c = $c.Replace($old, $new)

# Sửa logic tính soSachLoi - dùng tongSo từ API thay vì đếm client
$old2 = @'
        // ✅ Đính kèm thông tin lỗi vào từng sách
      if (jLoi.thanhCong) {
        const loiTheoSach: Record<string, { soLuong: number; soLan: number }> = {}
        for (const bc of jLoi.duLieu.danhSach) {
          const id = String(bc.sach?._id || bc.sach)
          if (!loiTheoSach[id]) loiTheoSach[id] = { soLuong: 0, soLan: 0 }
          loiTheoSach[id].soLuong += bc.soLuong
          loiTheoSach[id].soLan  += 1
        }
        ds = ds.map((s:any) => ({ ...s, _loiInfo: loiTheoSach[String(s._id)] }))
        setSoSachLoi(Object.keys(loiTheoSach).length)
      }
'@
$new2 = @'
        // Đính kèm thông tin lỗi vào từng sách
      if (jLoi.thanhCong) {
        const loiTheoSach: Record<string, { soLuong: number; soLan: number }> = {}
        for (const bc of (jLoi.duLieu.danhSach || [])) {
          const id = String(bc.sach?._id || bc.sach)
          if (!loiTheoSach[id]) loiTheoSach[id] = { soLuong: 0, soLan: 0 }
          loiTheoSach[id].soLuong += bc.soLuong
          loiTheoSach[id].soLan  += 1
        }
        ds = ds.map((s:any) => ({ ...s, _loiInfo: loiTheoSach[String(s._id)] }))
        // Dùng soSachDuy từ API - chính xác 100%
        setSoSachLoi(jLoi.duLieu.soSachDuy ?? Object.keys(loiTheoSach).length)
      }
'@
$c = $c.Replace($old2, $new2)

[System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done patch sach/page.tsx!"
