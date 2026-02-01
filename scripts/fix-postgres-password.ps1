# Fix PostgreSQL Password
# Run this as Administrator with PostgreSQL already running

Write-Host ""
Write-Host "PostgreSQL Password Fix Script" -ForegroundColor Cyan
Write-Host ""

$pgVersion = "16"
$pgBinPath = "C:\Program Files\PostgreSQL\$pgVersion\bin"
$pgDataPath = "C:\Program Files\PostgreSQL\$pgVersion\data"
$pgHbaPath = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.original"

# Backup original if not exists
if (-not (Test-Path $pgHbaBackup)) {
    Write-Host "Creating backup of original pg_hba.conf..." -ForegroundColor Green
    Copy-Item $pgHbaPath $pgHbaBackup -Force
    Write-Host "[OK] Backup created" -ForegroundColor Green
} else {
    Write-Host "Using existing backup" -ForegroundColor Yellow
}
Write-Host ""

# Read and modify pg_hba.conf
Write-Host "Modifying pg_hba.conf to allow passwordless access..." -ForegroundColor Green
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$newContent | Set-Content $pgHbaPath -Force
Write-Host "[OK] Modified pg_hba.conf" -ForegroundColor Green
Write-Host ""

# Reload PostgreSQL configuration (not restart)
Write-Host "Reloading PostgreSQL configuration..." -ForegroundColor Green
& "$pgBinPath\pg_ctl.exe" reload -D $pgDataPath 2>&1 | Out-Null
Start-Sleep -Seconds 2
Write-Host "[OK] Configuration reloaded" -ForegroundColor Green
Write-Host ""

# Set new password
Write-Host "Setting new password..." -ForegroundColor Green
$newPassword = "postgres"
$env:PGPASSWORD = ""

$result = & "$pgBinPath\psql.exe" -U postgres -d postgres -c "ALTER USER postgres PASSWORD '$newPassword';" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Password changed to: $newPassword" -ForegroundColor Green
    Write-Host ""

    # Restore original pg_hba.conf
    Write-Host "Restoring original pg_hba.conf..." -ForegroundColor Green
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    Write-Host "[OK] Restored" -ForegroundColor Green
    Write-Host ""

    # Reload again
    Write-Host "Reloading PostgreSQL configuration..." -ForegroundColor Green
    & "$pgBinPath\pg_ctl.exe" reload -D $pgDataPath 2>&1 | Out-Null
    Write-Host "[OK] Configuration reloaded" -ForegroundColor Green
    Write-Host ""

    Write-Host "Password reset complete!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your PostgreSQL password is now: $newPassword" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Now run this command to complete database setup:" -ForegroundColor Green
    Write-Host "node scripts/db-complete-setup.mjs $newPassword" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] Failed to change password" -ForegroundColor Red
    Write-Host "Output: $result" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restoring original pg_hba.conf..." -ForegroundColor Yellow
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    & "$pgBinPath\pg_ctl.exe" reload -D $pgDataPath 2>&1 | Out-Null
    Write-Host "[OK] Restored" -ForegroundColor Green
}
