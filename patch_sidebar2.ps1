# patch_sidebar2.ps1
# Chay tu: powershell -ExecutionPolicy Bypass -File ".\patch_sidebar2.ps1"

$ErrorActionPreference = "Stop"

function PatchFile($path, $trang, $ndVar) {
    $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    
    # Them import neu chua co
    if ($c -notmatch "SidebarAdmin") {
        $c = $c.Replace("import Link from 'next/link'", "import Link from 'next/link'`nimport SidebarAdmin from '@/components/admin/SidebarAdmin'")
        Write-Host "  + Import added"
    }
    
    # Tim vi tri aside va xoa
    $start = $c.IndexOf("<aside ")
    $end   = $c.IndexOf("</aside>", $start) + "</aside>".Length
    
    if ($start -ge 0 -and $end -gt $start) {
        $replace = "<SidebarAdmin trangHienTai=""$trang"" tenNguoiDung={$ndVar?.name} />"
        $c = $c.Substring(0, $start) + $replace + $c.Substring($end)
        Write-Host "  + Sidebar replaced"
    } else {
        Write-Host "  ! aside not found in $path"
    }
    
    [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
    Write-Host "  Saved: $path"
}

Write-Host "Patching sach/page.tsx..."
PatchFile "src\app\admin\sach\page.tsx" "/admin/sach" "nguoiDung"

Write-Host "Patching sach/loiSach/page.tsx..."
PatchFile "src\app\admin\sach\loiSach\page.tsx" "/admin/sach/loiSach" "nd"

Write-Host "Done!"
