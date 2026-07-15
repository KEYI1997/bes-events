# batch-update.ps1
$adminPwd = "bes2024admin"
$baseUrl = "http://localhost:3000"
$imgBase = "C:\Users\User\OneDrive\Desktop\客戶管理\08-境曜有限公司\網站架設\啟動儀式商品\商品圖"

$items = @(
    @{folder="LED 魔方啟動儀式"; yt="https://www.youtube.com/watch?v=IEE9RouVA-A"},
    @{folder="LED電視球"; yt="https://www.youtube.com/watch?v=YSHsvuPIM30"},
    @{folder="LED柱"; yt="https://www.youtube.com/watch?v=D2kspHVaxoQ"},
    @{folder="禮物盒啟動儀式"; yt="https://www.youtube.com/watch?v=Awtx0rlYu3g"},
    @{folder="魔法書啟動儀式"; yt="https://www.youtube.com/watch?v=js7gJlOUt98"},
    @{folder="3D魔球"; yt="https://www.youtube.com/watch?v=f4VrFzWNWSY"},
    @{folder="倒沙啟動儀式"; yt="https://www.youtube.com/watch?v=vg7RHzd17P4"},
    @{folder="卷軸啟動儀式"; yt="https://www.youtube.com/watch?v=z41suKvyt8M"},
    @{folder="布幕啟動儀式"; yt="https://www.youtube.com/watch?v=PsXiqbIGQ9I"},
    @{folder="3D全息投影風扇"; yt="https://www.youtube.com/watch?v=Ey0dVEg0Cw4"},
    @{folder="手掌啟動儀式"; yt="https://www.youtube.com/watch?v=lsZCNJhdMhs"},
    @{folder="七彩燈球柱啟動儀式"; yt="https://www.youtube.com/watch?v=wvnShwsgwas"},
    @{folder="沙漏啟動儀式"; yt="https://www.youtube.com/watch?v=gJ5ucfpYXBc"},
    @{folder="聚焦啟動儀式"; yt="https://www.youtube.com/watch?v=U1u0xHDZvA8"},
    @{folder="星辰運轉"; yt="https://www.youtube.com/watch?v=JrwpywnkSn0"}
)

# 取得產品
$r = Invoke-WebRequest -Uri "$baseUrl/api/admin?table=products" -Headers @{"x-admin-password"=$adminPwd} -UseBasicParsing
$products = ($r.Content | ConvertFrom-Json).data | Sort-Object sort_order

$log = @()
for ($i = 0; $i -lt $products.Count; $i++) {
    $prod = $products[$i]
    $item = $items[$i]
    $id = $prod.id
    $yt = $item.yt
    
    # 更新 description 確保有 YouTube
    $desc = $prod.description
    if ($desc -and (-not $desc.Contains($yt))) {
        $desc = $desc -replace "(?s)\n*\u3010YouTube\u3011.*$", ""
        $desc = "$desc`n`n【YouTube】`n$yt"
    } elseif (-not $desc) {
        $desc = "【YouTube】`n$yt"
    }
    
    $putBody = @{table="products"; id=$id; record=@{description=$desc}} | ConvertTo-Json -Depth 5
    $putBytes = [System.Text.Encoding]::UTF8.GetBytes($putBody)
    try {
        Invoke-WebRequest -Uri "$baseUrl/api/admin" -Method PUT -ContentType "application/json" -Body $putBytes -Headers @{"x-admin-password"=$adminPwd} -UseBasicParsing -TimeoutSec 15 | Out-Null
        $log += "OK YT: $($prod.name)"
    } catch {
        $log += "FAIL YT: $($prod.name)"
    }
}

[System.IO.File]::WriteAllText("C:\Users\User\Downloads\batch_update_log.txt", ($log -join "`n"), [System.Text.Encoding]::UTF8)
Write-Output "Done: $($log.Count) updates"
