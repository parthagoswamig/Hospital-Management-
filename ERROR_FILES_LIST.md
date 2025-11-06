# Complete List of Files with Errors (32 Total)

## Files with Errors:

1. **apps/api/src/core/tenant/services/tenant.service.ts**
   - Line 99: 'subdomain' unused variable (1 error)

2. **apps/api/src/ipd/dto/ipd.dto.ts**
   - Line 17: 'WardType' defined but never used (1 error)

3. **apps/api/src/laboratory/laboratory.controller.ts**
   - Line 9: 'Query' unused import (1 error)
   - Line 37: 'query' unused parameter (1 error)
   - Line 82: 'query' unused parameter (1 error)

4. **apps/api/src/laboratory/laboratory.service.ts**
   - Line 28: 'LabOrderQueryDto' unused import (1 error)
   - Line 29: 'LabTestQueryDto' unused import (1 error)

5. **apps/api/src/laboratory/dto/laboratory.dto.ts**
   - Line 7: 'Query' unused import (1 error)
   - Line 16: 'QueryDto' unused import (1 error)

6. **apps/api/src/pathology/dto/pathology.dto.ts**
   - Line 10: 'IsJSON' unused import (1 error)

7. **apps/api/src/pharmacy-management/pharmacy-management.service.ts**
   - Line 23: 'CurrentUser' unused import (1 error)
   - Line 26: 'User' unused import (1 error)

8. **apps/api/src/prisma/prisma.service.ts**
   - Line 606: Enum comparison error (1 error)
   - Line 609: Enum comparison error (1 error)

9. **apps/api/src/surgery/dto/surgery.dto.ts**
   - Line 12: 'ApiProperty' unused import (1 error)
   - Line 13: 'Transform' unused import (1 error)

10. **apps/api/src/surgery/surgery.service.ts**
    - Line 34: 'error' unused variable (1 error)

11. **apps/api/src/telemedicine/telemedicine.service.ts**
    - Line 64: Template literal type error (1 error)
    - Line 139: Template literal type error (1 error)
    - Line 158: Template literal type error (1 error)
    - Line 181: Template literal type error (1 error)
    - Line 110: Unexpected await error (1 error)

12. **apps/api/src/telemedicine/telemedicine.controller.ts**
    - Line 9: 'Query' unused import (1 error)
    - Line 18: 'CreateInvoiceDto' unused import (1 error)

13. **apps/api/src/subscription/subscription.service.fixed.ts**
    - Line 8: 'Delete' unused import (1 error)

14. **apps/api/test/app.e2e-spec.ts**
    - Line 1: 'Test' unused import (1 error)
    - Line 1: 'TestingModuleBuilder' unused import (1 error)
    - Line 2: 'INestApplication' unused import (1 error)
    - Line 11: 'moduleRef' unused variable (1 error)

15. **apps/api/test/jest-e2e.json** (or test helper)
    - Line 1: 'TestApp' unused import (1 error)

16. **apps/api/src/app.module.ts**
    - Line 3: 'Prisma' unused import (1 error)
    - Line 47: 'configService' unused variable (1 error)

---

## Total: 32 Errors across 16 files

## Fix Strategy:
1. Fix each file one by one
2. Test build after each fix
3. Verify error count decreases
4. Continue until 0 errors
