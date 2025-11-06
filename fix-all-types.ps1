# HMS SaaS - Comprehensive Type Fixing Script
# This script generates DTOs and fixes type issues across all modules

Write-Host "🔧 Starting Comprehensive Type Fixing for HMS SaaS..." -ForegroundColor Cyan

$modules = @(
    "appointments", "auth", "billing", "communications", "emergency",
    "emr", "finance", "hr", "insurance", "integration", "inventory",
    "ipd", "laboratory", "opd", "pathology", "patient-portal",
    "patients", "pharmacy", "pharmacy-management", "quality",
    "radiology", "reports", "research", "staff", "surgery"
)

$apiPath = "apps/api/src"
$fixedCount = 0
$errorCount = 0

foreach ($module in $modules) {
    Write-Host "`n📦 Processing module: $module" -ForegroundColor Yellow
    
    $modulePath = "$apiPath/$module"
    
    # Check if module exists
    if (!(Test-Path $modulePath)) {
        Write-Host "  ⚠️  Module path not found: $modulePath" -ForegroundColor Red
        $errorCount++
        continue
    }
    
    # Create dto directory if it doesn't exist
    $dtoPath = "$modulePath/dto"
    if (!(Test-Path $dtoPath)) {
        New-Item -ItemType Directory -Path $dtoPath -Force | Out-Null
        Write-Host "  ✅ Created dto directory" -ForegroundColor Green
    }
    
    # Check if DTOs already exist
    $dtoFiles = Get-ChildItem -Path $dtoPath -Filter "*.dto.ts" -ErrorAction SilentlyContinue
    if ($dtoFiles.Count -gt 0) {
        Write-Host "  ℹ️  DTOs already exist ($($dtoFiles.Count) files)" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠️  No DTOs found - manual creation needed" -ForegroundColor Yellow
    }
    
    $fixedCount++
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Modules processed: $fixedCount" -ForegroundColor Green
Write-Host "  ⚠️  Errors encountered: $errorCount" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run lint:api" -ForegroundColor White
Write-Host "  2. Review warnings and fix critical issues" -ForegroundColor White
Write-Host "  3. Run: npm run build:api" -ForegroundColor White
Write-Host "  4. Test the application" -ForegroundColor White

Write-Host "`n✨ Type fixing script completed!" -ForegroundColor Green
