# Deployment Guide

This guide covers deploying the wedding invitation website to production.

## Prerequisites

- Git repository with your code
- Production database (PostgreSQL recommended)
- Environment variables configured

## Switching from SQLite to PostgreSQL

### 1. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Update Database URL

In your production environment, set `DATABASE_URL` to your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

Format: `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

### 4. Run Migrations

```bash
pnpm prisma migrate deploy
```

This applies all migrations in production mode (no prompts).

### 5. Seed Data

```bash
pnpm db:seed
```

Or manually add invitation codes via Prisma Studio or SQL.

## Deployment to Vercel (Recommended)

Vercel provides the best Next.js hosting experience with zero configuration.

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure `.env` is in `.gitignore` (it is by default)

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your repository
4. Vercel auto-detects Next.js configuration

### Step 3: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
ADMIN_PASSWORD=your-secure-production-password
```

**Important**: Use a strong, unique password for production.

### Step 4: Configure Build Settings

Vercel auto-detects, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (or leave default)
- **Output Directory**: `.next` (default)
- **Install Command**: `pnpm install`

### Step 5: Add Build Hook for Prisma

Add to `package.json` (already included):

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated during build.

### Step 6: Deploy

1. Click "Deploy"
2. Vercel builds and deploys your app
3. Access your site at `https://your-project.vercel.app`

### Step 7: Run Database Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migration in production
vercel env pull .env.production
pnpm prisma migrate deploy
```

Or use Vercel's dashboard to run commands.

### Step 8: Seed Invitation Codes

Either:
1. Use Prisma Studio locally connected to production DB
2. Create a one-time API endpoint to seed
3. Manually insert via SQL client

**Using Prisma Studio:**
```bash
# With production DATABASE_URL in .env.production
pnpm prisma studio
```

### Step 9: Set Up Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Vercel automatically provisions SSL certificate

## Database Hosting Options

### Vercel Postgres

**Pros:**
- Integrated with Vercel
- Easy setup
- Automatic connection pooling

**Setup:**
1. Go to Vercel dashboard → Storage → Create Database
2. Select Postgres
3. Copy `DATABASE_URL` to environment variables

### Supabase

**Pros:**
- Generous free tier
- Built-in backups
- Dashboard for database management

**Setup:**
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Use the "connection pooling" URL for serverless

### Railway

**Pros:**
- Simple setup
- Good free tier
- One-click PostgreSQL

**Setup:**
1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy `DATABASE_URL` from variables

### Neon

**Pros:**
- Serverless Postgres
- Instant branching
- Free tier available

**Setup:**
1. Create project at [neon.tech](https://neon.tech)
2. Get connection string
3. Use pooled connection for serverless

## Alternative Deployment Platforms

### Railway

1. Push code to GitHub
2. Connect repository in Railway
3. Add environment variables
4. Deploy automatically on push

Railway auto-detects Next.js and provides:
- Automatic HTTPS
- PostgreSQL addon available
- Custom domains

### Render

1. Create Web Service in Render
2. Connect repository
3. Set environment variables
4. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### Fly.io

Requires Dockerfile (not included). Example setup:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Deploy:
```bash
fly launch
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set ADMIN_PASSWORD="..."
fly deploy
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_PASSWORD` | Admin dashboard password | `SecureP@ssw0rd123!` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Invitation codes seeded
- [ ] Admin password is strong and secure
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (should be automatic)
- [ ] Test RSVP flow end-to-end
- [ ] Test admin dashboard login
- [ ] Test CSV export
- [ ] Monitor for errors in first 24 hours
- [ ] Set up error tracking (optional but recommended)

## Database Backups

### Automated Backups

Most managed database providers include automatic backups:
- **Vercel Postgres**: Daily backups (retained 7 days)
- **Supabase**: Daily backups on paid plans
- **Railway**: Automatic snapshots
- **Neon**: Point-in-time recovery

### Manual Backups

Use `pg_dump` to create manual backups:

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

Restore:
```bash
psql $DATABASE_URL < backup-20260120.sql
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard for:
- Page views
- Response times
- Error rates

### Error Tracking

Consider adding:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and error tracking

Add to `app/layout.tsx`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

## Performance Optimization

### Database Connection Pooling

For serverless environments (Vercel), use connection pooling:

```
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
```

### Caching

Add caching headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**

Solution: Ensure `postinstall` script runs:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Issues

**Error: "Can't reach database server"**

Solutions:
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from deployment platform
3. Ensure connection pooling is enabled for serverless
4. Verify SSL mode if required: `?sslmode=require`

### Admin Login Not Working

**Error: "Invalid password"**

Solutions:
1. Verify `ADMIN_PASSWORD` environment variable is set
2. Check for trailing spaces in password
3. Redeploy after setting environment variables

### CSP or CORS Errors

Next.js handles this automatically. If issues occur, add headers in `next.config.ts`.

## Rollback Strategy

### Vercel

Vercel keeps all deployments. To rollback:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback

Use Prisma migrations:
```bash
# Rollback last migration
pnpm prisma migrate resolve --rolled-back MIGRATION_NAME
```

Or restore from backup.

## Security Hardening

See [SECURITY.md](./SECURITY.md) for production security recommendations.

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Railway: [railway.app/help](https://railway.app/help)
- Render: [render.com/docs](https://render.com/docs)
