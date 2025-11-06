# Database Migration Guide

## Issue: Local Connection Blocked

Your local machine cannot connect to Supabase database (port 6543 is blocked by firewall/network).

**Error**: `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:6543`

---

## ✅ Solution: Run Migrations from Supabase SQL Editor

Since your local connection is blocked, you can run migrations directly in Supabase:

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**:
   - https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration SQL**:
   - Copy all SQL from your migration files in `apps/api/prisma/migrations/`
   - Paste into SQL Editor
   - Click "Run"

4. **Create Prisma Migrations Table**:
   First, run this to create the migrations tracking table:
   ```sql
   CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
     "id" VARCHAR(36) PRIMARY KEY,
     "checksum" VARCHAR(64) NOT NULL,
     "finished_at" TIMESTAMPTZ,
     "migration_name" VARCHAR(255) NOT NULL,
     "logs" TEXT,
     "rolled_back_at" TIMESTAMPTZ,
     "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
     "applied_steps_count" INTEGER NOT NULL DEFAULT 0
   );
   ```

5. **Run Your Schema**:
   Then run all your table creation SQL from the migration files.

---

### Option 2: Run Migrations from Vercel Serverless Function

Create a temporary migration endpoint:

1. **Create migration endpoint** in `apps/api/src/`:

```typescript
// apps/api/src/migration.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('admin')
export class MigrationController {
  constructor(private prisma: PrismaService) {}

  @Post('migrate')
  async runMigrations() {
    try {
      // This will apply pending migrations
      await this.prisma.$executeRawUnsafe(`
        -- Your migration SQL here
      `);
      return { success: true, message: 'Migrations applied' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

2. **Add to app.module.ts**:
```typescript
import { MigrationController } from './migration.controller';

@Module({
  controllers: [..., MigrationController],
  // ...
})
```

3. **Deploy to Vercel**

4. **Call the endpoint**:
```bash
curl -X POST https://hma-saas-api.vercel.app/admin/migrate
```

5. **Remove the endpoint after migration** (security)

---

### Option 3: Use Supabase Connection Pooler Settings

Your Supabase might need IPv4 pooler enabled:

1. Go to: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/settings/database

2. Check **Connection Pooling** settings:
   - Ensure "Connection pooling" is enabled
   - Check if IPv4 is enabled
   - Try using the IPv4 pooler URL if available

3. Update your connection string to use IPv4 pooler if available

---

### Option 4: Run from GitHub Actions / CI

Create a GitHub Action to run migrations:

```yaml
# .github/workflows/migrate.yml
name: Run Database Migrations

on:
  workflow_dispatch:  # Manual trigger

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/api
          npm install
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_DATABASE_URL: ${{ secrets.DIRECT_DATABASE_URL }}
        run: |
          cd apps/api
          npx prisma migrate deploy
```

Then trigger manually from GitHub Actions tab.

---

## ✅ Recommended Approach

**Use Option 1 (Supabase SQL Editor)** - It's the fastest and most reliable:

1. Go to Supabase SQL Editor
2. Find your migration files in `apps/api/prisma/migrations/`
3. Copy the SQL content
4. Run in SQL Editor
5. Done!

---

## Your Migration Files Location

```
apps/api/prisma/migrations/
├── 20231201_init/
│   └── migration.sql
├── 20231202_add_tenants/
│   └── migration.sql
└── ... (other migrations)
```

---

## After Migrations Are Applied

1. **Test your API**:
   ```bash
   curl https://hma-saas-api.vercel.app/health
   ```

2. **Test Swagger docs**:
   ```
   https://hma-saas-api.vercel.app/docs
   ```

3. **Test your frontend**:
   ```
   https://hma-sass-web.vercel.app
   ```

---

## Environment Variables Already Configured ✅

You've already set these in Vercel:

### Backend (hma-saas-api)
- ✅ DATABASE_URL
- ✅ DIRECT_DATABASE_URL  
- ✅ JWT secrets
- ✅ CORS_ORIGINS
- ✅ Supabase keys
- ✅ All other variables

### Frontend (hma-sass-web)
- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ App settings

---

## Next Steps

1. ✅ **Run migrations** using Supabase SQL Editor (Option 1)
2. ✅ **Test API endpoints**
3. ✅ **Test frontend application**
4. ✅ **Create first tenant and user**

---

## Troubleshooting

### If migrations fail in Supabase SQL Editor:

1. **Check syntax errors** - Supabase uses PostgreSQL 15
2. **Run migrations one by one** - Don't run all at once
3. **Check for existing tables** - Use `\dt` to list tables
4. **Check permissions** - Ensure you're using the service role

### If API still doesn't work after migrations:

1. **Check Vercel logs**:
   - https://vercel.com/parthas-projects-3f9259b0/hma-saas-api/logs

2. **Verify environment variables** are set correctly

3. **Redeploy** if you changed environment variables

---

**Status**: Environment variables configured ✅  
**Next**: Run migrations via Supabase SQL Editor  
**Then**: Test your deployed applications
