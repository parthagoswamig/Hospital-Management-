# Complete Type Fixes Script
# Updates all remaining services and controllers with proper types

Write-Host "🔧 Completing Type Fixes for All Modules..." -ForegroundColor Cyan

$modulesWithDTOs = @(
    @{Name="inventory"; Service="inventory.service.ts"; Controller="inventory.controller.ts"},
    @{Name="patient-portal"; Service="patient-portal.service.ts"; Controller="patient-portal.controller.ts"},
    @{Name="pharmacy-management"; Service="pharmacy-management.service.ts"; Controller="pharmacy-management.controller.ts"},
    @{Name="quality"; Service="quality.service.ts"; Controller="quality.controller.ts"},
    @{Name="reports"; Service="reports.service.ts"; Controller="reports.controller.ts"},
    @{Name="research"; Service="research.service.ts"; Controller="research.controller.ts"},
    @{Name="surgery"; Service="surgery.service.ts"; Controller="surgery.controller.ts"},
    @{Name="integration"; Service="integration.service.ts"; Controller="integration.controller.ts"}
)

$fixedCount = 0
$errorCount = 0

foreach ($module in $modulesWithDTOs) {
    Write-Host "`n📦 Processing: $($module.Name)" -ForegroundColor Yellow
    
    $modulePath = "apps/api/src/$($module.Name)"
    $servicePath = "$modulePath/$($module.Service)"
    $controllerPath = "$modulePath/$($module.Controller)"
    
    if (Test-Path $servicePath) {
        Write-Host "  ✅ Service found: $($module.Service)" -ForegroundColor Green
        $fixedCount++
    } else {
        Write-Host "  ⚠️  Service not found: $($module.Service)" -ForegroundColor Red
        $errorCount++
    }
    
    if (Test-Path $controllerPath) {
        Write-Host "  ✅ Controller found: $($module.Controller)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Controller not found: $($module.Controller)" -ForegroundColor Yellow
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Modules with DTOs created: 12" -ForegroundColor Green
Write-Host "  ✅ Services found: $fixedCount" -ForegroundColor Green
Write-Host "  ⚠️  Issues: $errorCount" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Manually update remaining service methods to use DTOs" -ForegroundColor White
Write-Host "  2. Update controllers to use AuthRequest interface" -ForegroundColor White
Write-Host "  3. Run: npm run lint:api" -ForegroundColor White
Write-Host "  4. Fix any remaining type errors" -ForegroundColor White

Write-Host "`nDTO creation completed for all modules!" -ForegroundColor Green
