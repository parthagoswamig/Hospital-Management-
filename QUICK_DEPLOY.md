# Quick Deploy Guide - TL;DR

**Time to Deploy**: ~15 minutes  
**Difficulty**: Easy  
**Prerequisites**: Vercel + Supabase accounts

---

## Step 1: Supabase (5 minutes)

1. Create project at [supabase.com](https://supabase.com)
2. Copy these from Settings → Database:
   - Direct URL (port 5432)
   - Pooled URL (port 6543)
3. Copy these from Settings → API:
   - Project URL
   - anon key
   - service_role key

---

## Step 2: Deploy API to Vercel (5 minutes)

```bash
cd apps/api
vercel --prod
```

**Or use Vercel Dashboard:**
- Import repo → Root Directory: `apps/api`
- Build Command: `npm run vercel-build`

**Add Environment Variables** (copy from your `.env` or use provided values):

```bash
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@...6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_DATABASE_URL=postgresql://postgres.xxx:PASSWORD@...5432/postgres
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==
JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGINS=https://hma-sass-web.vercel.app
FRONTEND_URL=https://hma-sass-web.vercel.app
PUBLIC_API_URL=https://hma-saas-api.vercel.app
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE
NODE_ENV=production
VERCEL=1
BCRYPT_SALT_ROUNDS=12
```

---

## Step 3: Run Migrations (2 minutes)

```bash
cd apps/api
export DIRECT_DATABASE_URL="postgresql://postgres.xxx:PASSWORD@...5432/postgres"
npx prisma migrate deploy
```

---

## Step 4: Deploy Web to Vercel (3 minutes)

```bash
cd apps/web
vercel --prod
```

**Or use Vercel Dashboard:**
- Import repo → Root Directory: `apps/web`
- Framework: Next.js (auto-detected)

**Add Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://hma-saas-api.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=HMS SaaS
```

---

## Step 5: Verify (2 minutes)

```bash
# Test API
curl https://hma-saas-api.vercel.app/health

# Test Docs
open https://hma-saas-api.vercel.app/docs

# Test Web
open https://hma-sass-web.vercel.app
```

---

## Done! 🎉

Your HMS SaaS is now live on:
- **API**: https://hma-saas-api.vercel.app
- **Web**: https://hma-sass-web.vercel.app
- **Docs**: https://hma-saas-api.vercel.app/docs

---

## Troubleshooting

**"Prisma Client not found"**
→ Ensure `postinstall: prisma generate` in package.json

**"Connection pool exhausted"**
→ Check `connection_limit=1` in DATABASE_URL

**"CORS error"**
→ Add frontend URL to `CORS_ORIGINS`

**Need help?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.
