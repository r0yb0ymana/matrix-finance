# Restore PostgreSQL Service
# Run this as Administrator

Write-Host ""
Write-Host "PostgreSQL Recovery Script" -ForegroundColor Cyan
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

Write-Host "Restoring pg_hba.conf from backup..." -ForegroundColor Green
if (Test-Path $pgHbaBackup) {
    Copy-Item $pgHbaBackup $pgHbaPath -Force
    Write-Host "[OK] Restored from backup" -ForegroundColor Green
} else {
    Write-Host "[WARNING] No backup found at $pgHbaBackup" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Starting PostgreSQL service..." -ForegroundColor Green
$serviceName = "postgresql-x64-$pgVersion"
try {
    Start-Service $serviceName
    Start-Sleep -Seconds 2
    $service = Get-Service $serviceName
    if ($service.Status -eq "Running") {
        Write-Host "[OK] PostgreSQL is running" -ForegroundColor Green
        Write-Host ""
        Write-Host "Service recovered successfully!" -ForegroundColor Cyan
    } else {
        Write-Host "[ERROR] Service is not running. Status: $($service.Status)" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Failed to start service: $_" -ForegroundColor Red
}
Write-Host ""
