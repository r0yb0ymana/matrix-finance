# Fix PostgreSQL Password - Version 2
# Try different connection methods

Write-Host ""
Write-Host "PostgreSQL Password Fix Script v2" -ForegroundColor Cyan
Write-Host ""

$pgVersion = "16"
$pgBinPath = "C:\Program Files\PostgreSQL\$pgVersion\bin"
$pgDataPath = "C:\Program Files\PostgreSQL\$pgVersion\data"
$pgHbaPath = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.original"

# Ensure we have a backup
if (-not (Test-Path $pgHbaBackup)) {
    Copy-Item $pgHbaPath $pgHbaBackup -Force
}

# Stop PostgreSQL completely
Write-Host "Stopping PostgreSQL..." -ForegroundColor Green
& "$pgBinPath\pg_ctl.exe" stop -D $pgDataPath -m fast 2>&1 | Out-Null
Start-Sleep -Seconds 3
Write-Host "[OK] Stopped" -ForegroundColor Green
Write-Host ""

# Modify pg_hba.conf
Write-Host "Modifying pg_hba.conf to allow passwordless access..." -ForegroundColor Green
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$newContent | Set-Content $pgHbaPath -Force
Write-Host "[OK] Modified" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL with new config
Write-Host "Starting PostgreSQL with trust authentication..." -ForegroundColor Green
& "$pgBinPath\pg_ctl.exe" start -D $pgDataPath -w 2>&1 | Out-Null
Start-Sleep -Seconds 3
Write-Host "[OK] Started" -ForegroundColor Green
Write-Host ""

# Set new password (force IPv4)
Write-Host "Setting new password..." -ForegroundColor Green
$newPassword = "postgres"
$env:PGPASSWORD = ""

# Try multiple connection methods
Write-Host "Trying connection via 127.0.0.1..." -ForegroundColor Yellow
$result = & "$pgBinPath\psql.exe" -h 127.0.0.1 -U postgres -d postgres -c "ALTER USER postgres PASSWORD '$newPassword';" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Password changed successfully!" -ForegroundColor Green
    Write-Host ""

    # Restore original pg_hba.conf
    Write-Host "Restoring original pg_hba.conf..." -ForegroundColor Green
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    Write-Host "[OK] Restored" -ForegroundColor Green
    Write-Host ""

    # Reload configuration
    Write-Host "Reloading PostgreSQL configuration..." -ForegroundColor Green
    & "$pgBinPath\pg_ctl.exe" reload -D $pgDataPath 2>&1 | Out-Null
    Write-Host "[OK] Reloaded" -ForegroundColor Green
    Write-Host ""

    Write-Host "Password reset complete!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PostgreSQL password is now: $newPassword" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Now run this command to complete database setup:" -ForegroundColor Green
    Write-Host "node scripts/db-complete-setup.mjs $newPassword" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] Failed: $result" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restoring original config and restarting..." -ForegroundColor Yellow
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    & "$pgBinPath\pg_ctl.exe" restart -D $pgDataPath -w 2>&1 | Out-Null
}
