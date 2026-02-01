# PostgreSQL Password Reset Helper
# Run this as Administrator

Write-Host ""
Write-Host "PostgreSQL Password Reset Helper" -ForegroundColor Cyan
Write-Host ""

$pgVersion = "16"
$pgDataPath = "C:\Program Files\PostgreSQL\$pgVersion\data"
$pgHbaPath = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.backup"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERROR] This script requires administrator privileges." -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Step 1: Backing up pg_hba.conf..." -ForegroundColor Green
Copy-Item $pgHbaPath $pgHbaBackup -Force
Write-Host "[OK] Backup created: $pgHbaBackup" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Modifying pg_hba.conf to allow passwordless access..." -ForegroundColor Green
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$newContent | Set-Content $pgHbaPath
Write-Host "[OK] Modified pg_hba.conf" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Restarting PostgreSQL service..." -ForegroundColor Green
$serviceName = "postgresql-x64-$pgVersion"
Restart-Service $serviceName -Force
Start-Sleep -Seconds 2
Write-Host "[OK] PostgreSQL restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Setting new password..." -ForegroundColor Green
$newPassword = Read-Host "Enter new password for postgres user"

$env:PGPASSWORD = ""
& "C:\Program Files\PostgreSQL\$pgVersion\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres PASSWORD '$newPassword';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Password changed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[ERROR] Failed to change password" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    Restart-Service $serviceName -Force
    exit 1
}

Write-Host "Step 5: Restoring pg_hba.conf security..." -ForegroundColor Green
Copy-Item $pgHbaBackup $pgHbaPath -Force
Restart-Service $serviceName -Force
Start-Sleep -Seconds 2
Write-Host "[OK] Security restored" -ForegroundColor Green
Write-Host ""

Write-Host "Password reset complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your new password is: $newPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now run this command to complete database setup:" -ForegroundColor Green
Write-Host "node scripts/db-complete-setup.mjs $newPassword" -ForegroundColor White
Write-Host ""
