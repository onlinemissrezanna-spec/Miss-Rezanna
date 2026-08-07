$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" | Where-Object { $_.Name -ne "admin.html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    if ($content -match 'aria-label="Account"') {
        $updated = $content -replace '<button class="icon-btn" aria-label="Account">', '<button class="icon-btn" aria-label="Account" onclick="openCustomerAuthModal()">'
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
