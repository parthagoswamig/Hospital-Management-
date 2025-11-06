# PowerShell script to fix all remaining lint errors

Write-Host "Fixing all 48 remaining errors..." -ForegroundColor Green

# Fix 1: Remove unused WardType from ipd.dto.ts (it's exported but not used elsewhere)
# This is actually used in the file, so we keep it

# Fix 2-7: Remove unused imports from laboratory.controller.ts
(Get-Content "apps\api\src\laboratory\laboratory.controller.ts") -replace "  Req,", "" | Set-Content "apps\api\src\laboratory\laboratory.controller.ts"

# Fix 8-9: Remove unused imports from laboratory.service.ts  
(Get-Content "apps\api\src\laboratory\laboratory.service.ts") -replace "import \{ Injectable, NotFoundException \} from '@nestjs/common';", "import { Injectable } from '@nestjs/common';" | Set-Content "apps\api\src\laboratory\laboratory.service.ts"

# Fix 10-14: Comment out unused DTOs in pathology.dto.ts
$pathologyFile = "apps\api\src\pathology\dto\pathology.dto.ts"
if (Test-Path $pathologyFile) {
    (Get-Content $pathologyFile) -replace "  IsJSON,", "" | Set-Content $pathologyFile
}

# Fix 15-16: Remove unused imports from pharmacy-management.controller.ts
$pharmacyController = "apps\api\src\pharmacy-management\pharmacy-management.controller.ts"
if (Test-Path $pharmacyController) {
    (Get-Content $pharmacyController) -replace "  Delete,", "" | Set-Content $pharmacyController
}

# Fix 17-24: Remove unused DTOs from radiology service
$radiologyService = "apps\api\src\radiology\radiology.service.ts"
if (Test-Path $radiologyService) {
    $content = Get-Content $radiologyService -Raw
    $content = $content -replace "  CreateStudyDto,\r?\n", ""
    $content = $content -replace "  UpdateStudyDto,\r?\n", ""
    $content = $content -replace "  CreateReportDto,\r?\n", ""
    $content = $content -replace "  UpdateReportDto,\r?\n", ""
    $content = $content -replace "  CreateRadiologyOrderDto,\r?\n", ""
    $content = $content -replace "  UpdateRadiologyOrderDto,\r?\n", ""
    Set-Content $radiologyService -Value $content -NoNewline
}

# Fix 25-30: Remove unused DTOs from reports and research services
$reportsService = "apps\api\src\reports\reports.service.ts"
if (Test-Path $reportsService) {
    (Get-Content $reportsService) -replace "  GenerateReportDto,", "" | Set-Content $reportsService
    (Get-Content $reportsService) -replace "  QueryReportDto,", "" | Set-Content $reportsService
}

$researchService = "apps\api\src\research\research.service.ts"
if (Test-Path $researchService) {
    (Get-Content $researchService) -replace "  UpdateResearchProjectDto,", "" | Set-Content $researchService
    (Get-Content $researchService) -replace "  QueryResearchDto,", "" | Set-Content $researchService
}

# Fix 31-35: Remove unused imports from surgery service
$surgeryService = "apps\api\src\surgery\surgery.service.ts"
if (Test-Path $surgeryService) {
    (Get-Content $surgeryService) -replace "  UpdateSurgeryDto,", "" | Set-Content $surgeryService
}

# Fix 36-40: Remove unused imports from telemedicine service
$telemedicineService = "apps\api\src\telemedicine\telemedicine.service.ts"
if (Test-Path $telemedicineService) {
    (Get-Content $telemedicineService) -replace "  CreateInvoiceDto,", "" | Set-Content $telemedicineService
}

Write-Host "All fixes applied! Running lint check..." -ForegroundColor Green
npm run lint:api 2>&1 | Select-String "problems"
