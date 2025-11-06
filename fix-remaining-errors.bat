@echo off
echo Fixing remaining errors to achieve 0 errors...

:: Fix telemedicine controller - remove unused imports
powershell -Command "(Get-Content 'apps\api\src\telemedicine\telemedicine.controller.ts') -replace '  Query,', '' | Set-Content 'apps\api\src\telemedicine\telemedicine.controller.ts'"
powershell -Command "(Get-Content 'apps\api\src\telemedicine\telemedicine.controller.ts') -replace 'import.*CreateInvoiceDto.*', '' | Set-Content 'apps\api\src\telemedicine\telemedicine.controller.ts'"

:: Fix subscription service - remove unused Delete
powershell -Command "(Get-Content 'apps\api\src\subscription\subscription.service.fixed.ts') -replace '  Delete,', '' | Set-Content 'apps\api\src\subscription\subscription.service.fixed.ts'"

:: Fix test file - remove unused imports
powershell -Command "(Get-Content 'apps\api\test\app.e2e-spec.ts') -replace 'Test,', '' | Set-Content 'apps\api\test\app.e2e-spec.ts'"
powershell -Command "(Get-Content 'apps\api\test\app.e2e-spec.ts') -replace 'TestingModuleBuilder,', '' | Set-Content 'apps\api\test\app.e2e-spec.ts'"
powershell -Command "(Get-Content 'apps\api\test\app.e2e-spec.ts') -replace 'const moduleRef =', '// const moduleRef =' | Set-Content 'apps\api\test\app.e2e-spec.ts'"

:: Fix app.module.ts - remove unused imports and variables
powershell -Command "(Get-Content 'apps\api\src\app.module.ts') -replace 'import.*Prisma.*', '' | Set-Content 'apps\api\src\app.module.ts'"
powershell -Command "(Get-Content 'apps\api\src\app.module.ts') -replace 'const configService =', '// const configService =' | Set-Content 'apps\api\src\app.module.ts'"

echo All fixes applied! Checking final error count...
npm run lint:api 2>&1 | Select-String "problems"
echo Done!
