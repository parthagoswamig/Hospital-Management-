# PowerShell script to fix remaining errors to 0

Write-Host "Fixing remaining errors to achieve 0 errors..." -ForegroundColor Green

# Fix telemedicine controller imports
$file = "apps\api\src\telemedicine\telemedicine.controller.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "  Query,", ""
    $content = $content -replace "import.*CreateInvoiceDto.*\r?\n", ""
    Set-Content $file -Value $content -NoNewline
    Write-Host "✓ Fixed telemedicine controller" -ForegroundColor Green
}

# Fix subscription service
$file = "apps\api\src\subscription\subscription.service.fixed.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "  Delete,", ""
    Set-Content $file -Value $content -NoNewline
    Write-Host "✓ Fixed subscription service" -ForegroundColor Green
}

# Fix test file
$file = "apps\api\test\app.e2e-spec.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "Test,", ""
    $content = $content -replace "TestingModuleBuilder,", ""
    $content = $content -replace "const moduleRef =", "// const moduleRef ="
    Set-Content $file -Value $content -NoNewline
    Write-Host "✓ Fixed test file" -ForegroundColor Green
}

# Fix app.module.ts
$file = "apps\api\src\app.module.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "import.*Prisma.*\r?\n", ""
    $content = $content -replace "const configService =", "// const configService ="
    Set-Content $file -Value $content -NoNewline
    Write-Host "✓ Fixed app.module.ts" -ForegroundColor Green
}

Write-Host "All fixes applied! Checking final error count..." -ForegroundColor Cyan
npm run lint:api 2>&1 | Select-String "problems"
Write-Host "Done!" -ForegroundColor Green
