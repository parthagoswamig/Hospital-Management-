# Run Database Migrations in Supabase SQL Editor

## ⚠️ Your Local Connection is Blocked

Your local machine cannot connect to Supabase database (network/firewall issue).

**Solution**: Run migrations directly in Supabase SQL Editor.

---

## 📝 Step-by-Step Instructions

### 1. Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

---

### 2. Run Migrations in Order

You have 4 migration files that need to be run in order:

#### Migration 1: Initial PostgreSQL Schema
**File**: `apps/api/prisma/migrations/20251004131600_postgresql_init/migration.sql`

1. Open this file in your code editor
2. Copy ALL the SQL content (1338 lines)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for completion (should take 10-30 seconds)

#### Migration 2: Add Aadhar Number
**File**: `apps/api/prisma/migrations/20251009162749_add_aadhar_number_to_patient/migration.sql`

1. Open this file
2. Copy the SQL content
3. Paste into Supabase SQL Editor
4. Click **"Run"**

#### Migration 3: Add Complex Modules
**File**: `apps/api/prisma/migrations/20251009175541_add_complex_modules_models/migration.sql`

1. Open this file
2. Copy the SQL content
3. Paste into Supabase SQL Editor
4. Click **"Run"**

#### Migration 4: Add RBAC System
**File**: `apps/api/prisma/migrations/1761280332032_add_rbac_system/migration.sql`

1. Open this file
2. Copy the SQL content
3. Paste into Supabase SQL Editor
4. Click **"Run"**

---

### 3. Create Prisma Migrations Table

After running all migrations, create the Prisma tracking table:

```sql
-- Create Prisma migrations tracking table
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

-- Insert migration records
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
VALUES 
  (gen_random_uuid()::text, '', '20251004131600_postgresql_init', now(), now(), 1),
  (gen_random_uuid()::text, '', '20251009162749_add_aadhar_number_to_patient', now(), now(), 1),
  (gen_random_uuid()::text, '', '20251009175541_add_complex_modules_models', now(), now(), 1),
  (gen_random_uuid()::text, '', '1761280332032_add_rbac_system', now(), now(), 1);
```

---

### 4. Verify Migrations

Run this query to check all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- Tenant
- User
- patients
- Appointment
- Department
- Specialty
- Staff
- Invoice
- Payment
- LabTest
- LabOrder
- Medication
- PharmacyOrder
- And many more...

---

## ✅ After Migrations Complete

### 1. Test Your API

```bash
curl https://hma-saas-api.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Test Swagger Documentation

Open in browser:
```
https://hma-saas-api.vercel.app/docs
```

### 3. Test Your Frontend

Open in browser:
```
https://hma-sass-web.vercel.app
```

---

## 🎯 Quick Summary

1. ✅ **Environment variables configured** in Vercel (both API and Web)
2. ⏳ **Run 4 migrations** in Supabase SQL Editor (in order)
3. ⏳ **Create Prisma tracking table**
4. ✅ **Test your deployed applications**

---

## 🚨 Troubleshooting

### If you get "relation already exists" errors:

This means some tables already exist. You can either:

**Option A**: Drop all tables and start fresh:
```sql
-- WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run all migrations again.

**Option B**: Skip the error and continue with next migration.

### If you get permission errors:

Make sure you're logged into Supabase with the project owner account.

---

## 📁 Migration Files Location

All migration files are in:
```
apps/api/prisma/migrations/
├── 20251004131600_postgresql_init/
│   └── migration.sql (1338 lines - main schema)
├── 20251009162749_add_aadhar_number_to_patient/
│   └── migration.sql
├── 20251009175541_add_complex_modules_models/
│   └── migration.sql
└── 1761280332032_add_rbac_system/
    └── migration.sql
```

---

## ⏱️ Estimated Time

- Opening Supabase SQL Editor: 1 minute
- Running Migration 1 (main schema): 30 seconds
- Running Migrations 2-4: 10 seconds each
- Creating tracking table: 5 seconds
- Verification: 1 minute

**Total**: ~3-5 minutes

---

## 🎉 You're Almost Done!

After running migrations:
1. Your database will be fully set up
2. Your API will be able to connect
3. Your frontend will work
4. You can start using your HMS SaaS application!

---

**Next Step**: Open Supabase SQL Editor and start with Migration 1!
