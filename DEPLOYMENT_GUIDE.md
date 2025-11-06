# HMS SaaS - Vercel + Supabase Deployment Guide

**Platform**: Vercel (Frontend + Backend) + Supabase (Database)  
**Architecture**: Serverless Multi-Tenant SaaS  
**Last Updated**: 2025-01-06

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Backend API Deployment (Vercel)](#backend-api-deployment-vercel)
4. [Frontend Web Deployment (Vercel)](#frontend-web-deployment-vercel)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Database Migrations](#database-migrations)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Stripe Webhook Configuration](#stripe-webhook-configuration-optional)
9. [Custom Domain Setup](#custom-domain-setup-optional)
10. [Monitoring & Logging](#monitoring--logging)
11. [Troubleshooting](#troubleshooting)
12. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Accounts
- ✅ [Vercel Account](https://vercel.com) (Free or Pro)
- ✅ [Supabase Account](https://supabase.com) (Free tier sufficient for testing)
- ✅ [GitHub Account](https://github.com) (for repository hosting)

### Required Tools
- ✅ Git
- ✅ Node.js 18+ and npm
- ✅ Vercel CLI (optional but recommended): `npm install -g vercel`

### Repository Setup
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/HMA-SAAS-main.git
cd HMA-SAAS-main

# Install dependencies
npm install
```

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `hms-saas-production` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `ap-southeast-1` for Asia)
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Connection Strings

Once your project is ready:

1. Navigate to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the following:

#### **Direct Connection** (for migrations):
```
postgresql://postgres.uoxyyqbwuzjraxhaypko:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### **Pooled Connection** (for runtime):
```
postgresql://postgres.uoxyyqbwuzjraxhaypko:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10&connect_timeout=10
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual database password.

### Step 3: Get Supabase API Keys

1. Navigate to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://uoxyyqbwuzjraxhaypko.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

---

## Backend API Deployment (Vercel)

### Step 1: Create Vercel Project for API

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: Leave empty (serverless function)
   - **Install Command**: `npm install`

#### Option B: Using Vercel CLI

```bash
cd apps/api
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** `hma-saas-api`
- **Directory?** `./` (current directory)
- **Override settings?** Yes
  - **Build Command**: `npm run vercel-build`
  - **Output Directory**: Leave empty
  - **Development Command**: `npm run start:dev`

### Step 2: Configure Environment Variables

In Vercel Dashboard → Your API Project → **Settings** → **Environment Variables**, add:

#### **Database Variables**
```bash
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10&connect_timeout=10

DIRECT_DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### **JWT Secrets**
```bash
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==

JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=

JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=

JWT_ACCESS_EXPIRATION=15m

JWT_REFRESH_EXPIRATION=7d
```

#### **CORS & URLs**
```bash
CORS_ORIGINS=https://hma-sass-web.vercel.app

FRONTEND_URL=https://hma-sass-web.vercel.app

PUBLIC_API_URL=https://hma-saas-api.vercel.app
```

#### **Supabase**
```bash
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE
```

#### **App Configuration**
```bash
NODE_ENV=production

VERCEL=1

BCRYPT_SALT_ROUNDS=12
```

#### **Optional: Payment Providers**
```bash
# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Razorpay (if using)
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

**Important**: Set all variables for **Production**, **Preview**, and **Development** environments.

### Step 3: Deploy

```bash
# Trigger deployment
vercel --prod

# Or push to main branch (auto-deploys if connected to GitHub)
git push origin main
```

### Step 4: Verify API Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://hma-saas-api.vercel.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-06T...",
  "uptime": 123.45,
  "environment": "production"
}

# API Documentation
# Open in browser:
https://hma-saas-api.vercel.app/docs
```

---

## Frontend Web Deployment (Vercel)

### Step 1: Create Vercel Project for Web

#### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (same repo, different project)
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables

In Vercel Dashboard → Your Web Project → **Settings** → **Environment Variables**, add:

```bash
NEXT_PUBLIC_API_URL=https://hma-saas-api.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

NEXT_PUBLIC_APP_ENV=production

NEXT_PUBLIC_APP_NAME=HMS SaaS
```

### Step 3: Deploy

```bash
cd apps/web
vercel --prod

# Or push to main branch
git push origin main
```

### Step 4: Verify Web Deployment

Open your deployment URL in a browser:
```
https://hma-sass-web.vercel.app
```

You should see the HMS SaaS login page.

---

## Environment Variables Reference

### Backend API (apps/api)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Pooled connection for runtime | `postgresql://...@...6543/postgres?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | ✅ | Direct connection for migrations | `postgresql://...@...5432/postgres` |
| `JWT_SECRET` | ✅ | Main JWT signing secret | 64+ char random string |
| `JWT_ACCESS_SECRET` | ✅ | Access token secret | 32+ char random string |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret | 32+ char random string |
| `JWT_ACCESS_EXPIRATION` | ✅ | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRATION` | ✅ | Refresh token lifetime | `7d` |
| `CORS_ORIGINS` | ✅ | Allowed frontend origins | `https://hma-sass-web.vercel.app` |
| `FRONTEND_URL` | ✅ | Frontend base URL | `https://hma-sass-web.vercel.app` |
| `PUBLIC_API_URL` | ✅ | API base URL | `https://hma-saas-api.vercel.app` |
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJhbGci...` |
| `NODE_ENV` | ✅ | Environment | `production` |
| `VERCEL` | ✅ | Vercel flag | `1` |
| `BCRYPT_SALT_ROUNDS` | ✅ | Password hashing rounds | `12` |
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe webhook secret | `whsec_...` |
| `RAZORPAY_KEY_ID` | ❌ | Razorpay key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | ❌ | Razorpay secret | `...` |

### Frontend Web (apps/web)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL | `https://hma-saas-api.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_ENV` | ✅ | App environment | `production` |
| `NEXT_PUBLIC_APP_NAME` | ✅ | App display name | `HMS SaaS` |

---

## Database Migrations

### Initial Migration (First Deployment)

```bash
# 1. Set environment variable locally
export DIRECT_DATABASE_URL="postgresql://postgres.xxx:PASSWORD@...5432/postgres"

# 2. Navigate to API directory
cd apps/api

# 3. Run migrations
npx prisma migrate deploy

# 4. Verify
npx prisma studio
```

### Subsequent Migrations

```bash
# 1. Create migration locally
npx prisma migrate dev --name your_migration_name

# 2. Commit migration files
git add prisma/migrations
git commit -m "Add migration: your_migration_name"
git push

# 3. Deploy migration to production
export DIRECT_DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

**Important**: 
- Always use `DIRECT_DATABASE_URL` (port 5432) for migrations
- Never use pooled connection for migrations
- Test migrations in staging environment first

---

## Post-Deployment Verification

### 1. API Health Check

```bash
curl https://hma-saas-api.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "message": "HMS SaaS API is running - Fast Deployment Mode"
}
```

### 2. API Documentation

Open in browser:
```
https://hma-saas-api.vercel.app/docs
```

You should see Swagger UI with all endpoints documented.

### 3. Test Authentication

```bash
# Register a new user
curl -X POST https://hma-saas-api.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST https://hma-saas-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": { ... }
}
```

### 4. Test Protected Endpoint

```bash
# Get user profile (requires auth)
curl https://hma-saas-api.vercel.app/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Test Multi-Tenancy

```bash
# Create tenant (if endpoint exists)
curl -X POST https://hma-saas-api.vercel.app/tenants \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "slug": "test-hospital"
  }'

# Access tenant data
curl https://hma-saas-api.vercel.app/patients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Tenant-Id: YOUR_TENANT_ID"
```

### 6. Frontend Verification

1. Open `https://hma-sass-web.vercel.app`
2. Register a new account
3. Login
4. Navigate through dashboard
5. Verify API calls in browser DevTools Network tab

---

## Stripe Webhook Configuration (Optional)

If using Stripe for payments:

### Step 1: Get Webhook Endpoint

Your webhook URL will be:
```
https://hma-saas-api.vercel.app/stripe/webhook
```

### Step 2: Configure in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter webhook URL: `https://hma-saas-api.vercel.app/stripe/webhook`
5. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)

### Step 3: Add Webhook Secret to Vercel

In Vercel Dashboard → API Project → Environment Variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET
```

Redeploy the API after adding the secret.

---

## Custom Domain Setup (Optional)

### For API

1. Go to Vercel Dashboard → API Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update environment variables:
   ```bash
   PUBLIC_API_URL=https://api.yourdomain.com
   CORS_ORIGINS=https://yourdomain.com
   ```

### For Web

1. Go to Vercel Dashboard → Web Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Update environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

---

## Monitoring & Logging

### Vercel Analytics

1. Go to Vercel Dashboard → Project → **Analytics**
2. Enable **Web Analytics** (free)
3. View performance metrics, page views, etc.

### Vercel Logs

```bash
# View real-time logs
vercel logs hma-saas-api --follow

# View logs for specific deployment
vercel logs hma-saas-api --since 1h
```

### Recommended: Add Sentry

```bash
# Install Sentry
npm install @sentry/node @sentry/nextjs

# Configure in apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

Add to Vercel environment variables:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## Troubleshooting

### Issue: "Prisma Client not found"

**Cause**: Prisma Client not generated during build

**Solution**:
```bash
# Ensure postinstall script exists in package.json
"postinstall": "prisma generate"

# Or add to vercel-build script
"vercel-build": "prisma generate && nest build"
```

### Issue: "Connection pool exhausted"

**Cause**: Too many concurrent connections

**Solution**:
```bash
# Ensure connection_limit=1 in DATABASE_URL
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
```

### Issue: "CORS error from frontend"

**Cause**: Frontend URL not in CORS_ORIGINS

**Solution**:
```bash
# Add frontend URL to CORS_ORIGINS (comma-separated)
CORS_ORIGINS=https://hma-sass-web.vercel.app,https://your-custom-domain.com
```

### Issue: "401 Unauthorized on protected endpoints"

**Cause**: JWT token not being sent or invalid

**Solution**:
1. Check browser localStorage for `accessToken`
2. Verify token is being sent in `Authorization` header
3. Check JWT secrets match between deployments
4. Verify token hasn't expired

### Issue: "Tenant data not isolated"

**Cause**: `X-Tenant-Id` header not being sent

**Solution**:
1. Ensure `tenantId` is stored in localStorage after login
2. Verify API client is attaching `X-Tenant-Id` header
3. Check PrismaService middleware is active

### Issue: "Slow cold starts"

**Cause**: Serverless function initialization

**Solutions**:
1. Upgrade to Vercel Pro (faster cold starts)
2. Implement warming strategy (cron job to ping API every 5 minutes)
3. Optimize imports (lazy load heavy dependencies)

### Issue: "Database migration failed"

**Cause**: Using pooled connection for migration

**Solution**:
```bash
# Always use DIRECT_DATABASE_URL for migrations
export DIRECT_DATABASE_URL="postgresql://...5432/postgres"
npx prisma migrate deploy
```

---

## Rollback Procedures

### Rollback to Previous Deployment

#### Using Vercel Dashboard

1. Go to Vercel Dashboard → Project → **Deployments**
2. Find the previous working deployment
3. Click **"..."** → **"Promote to Production"**

#### Using Vercel CLI

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

### Rollback Database Migration

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or restore database from backup
# (Supabase provides automatic backups)
```

### Emergency Rollback

If critical issues arise:

1. **Disable API**: Set maintenance mode or return 503
2. **Rollback deployment**: Use Vercel dashboard
3. **Restore database**: From Supabase backup
4. **Notify users**: Via status page or email
5. **Investigate**: Review logs and fix issues
6. **Redeploy**: After fixes are verified

---

## Production Checklist

Before going live:

- [ ] All environment variables configured correctly
- [ ] Database migrations applied successfully
- [ ] Health check endpoint returns 200 OK
- [ ] API documentation accessible at `/docs`
- [ ] Authentication flow works (register, login, logout)
- [ ] Multi-tenancy tested (data isolation verified)
- [ ] CORS configured for production domains
- [ ] SSL certificates active (automatic with Vercel)
- [ ] Custom domains configured (if applicable)
- [ ] Stripe webhooks configured (if using payments)
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place (Supabase automatic backups)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Rate limiting tested
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## Support & Resources

### Official Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### Community
- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://discord.supabase.com)
- [NestJS Discord](https://discord.gg/nestjs)

### Emergency Contacts
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: 2025-01-06  
**Maintained By**: HMS SaaS Team
