# Architecture

This document describes the technical architecture of the wedding invitation website.

## Overview

The application is a Next.js 15 server-side rendered (SSR) web application using the App Router. It consists of a public-facing wedding invitation with an RSVP system and a protected admin dashboard.

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router for routing and SSR
- **React 19**: UI library with Server and Client Components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Next.js Route Handlers**: API endpoints as serverless functions
- **Prisma ORM**: Type-safe database access
- **SQLite**: Development database (easily switchable to PostgreSQL)
- **Zod**: Runtime validation and type inference

### Forms & Validation
- **React Hook Form**: Efficient form handling
- **Zod**: Schema validation on client and server

## Application Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         Client (Browser)                 │
│  ┌─────────────────────────────────┐   │
│  │   Public Pages                   │   │
│  │   - Wedding Invitation (/)       │   │
│  │   - Admin Dashboard (/admin)     │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS
┌──────────────▼──────────────────────────┐
│         Next.js Server                   │
│  ┌─────────────────────────────────┐   │
│  │   API Routes                     │   │
│  │   - /api/invitations/verify      │   │
│  │   - /api/rsvp                    │   │
│  │   - /api/admin/*                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Server Components              │   │
│  │   - Page rendering               │   │
│  │   - Authentication checks        │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ Prisma Client
┌──────────────▼──────────────────────────┐
│         Database (SQLite/PostgreSQL)     │
│  - InvitationCode                        │
│  - RSVP                                  │
└──────────────────────────────────────────┘
```

## Data Model

### Prisma Schema

```prisma
model InvitationCode {
  id        String   @id @default(cuid())
  code      String   @unique
  status    String   @default("active")
  note      String?
  createdAt DateTime @default(now())
  rsvp      RSVP?
}

model RSVP {
  id               String         @id @default(cuid())
  invitationCodeId String         @unique
  invitationCode   InvitationCode @relation(...)
  name             String
  phone            String
  attending        Boolean
  guestsCount      Int?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}
```

### Relationships
- **One-to-One**: Each `InvitationCode` can have at most one `RSVP`
- **Cascade Delete**: Deleting an invitation code removes its RSVP

### Constraints
- `code` is unique across all invitation codes
- `invitationCodeId` is unique in RSVP (enforces one response per code)
- `guestsCount` is nullable (only required when attending)

## Routing

### Public Routes

- **`/`** - Home page (wedding invitation single-page app)
  - Server Component for initial render
  - Client Components for interactive sections (RSVP form, navigation)

### Admin Routes

- **`/admin`** - Admin dashboard
  - Client Component with authentication check
  - Protected by session cookie

### API Routes

#### Public APIs
- **`POST /api/invitations/verify`** - Verify invitation code
- **`GET /api/rsvp?code=CODE`** - Get existing RSVP for code
- **`POST /api/rsvp`** - Submit or update RSVP

#### Protected APIs
- **`POST /api/admin/auth`** - Admin login
- **`DELETE /api/admin/auth`** - Admin logout
- **`GET /api/admin/summary`** - Get RSVP statistics and list
- **`GET /api/admin/export.csv`** - Export RSVPs as CSV

All admin endpoints check for authentication cookie.

## Authentication

### Admin Authentication

Simple session-based authentication using HTTP-only cookies:

1. Admin submits password to `/api/admin/auth`
2. Server validates against `ADMIN_PASSWORD` environment variable
3. On success, sets `admin_session` cookie (HTTP-only, secure in production)
4. Protected routes check for this cookie via `checkAdminAuth()`

**No third-party authentication** - intentionally simple for this use case.

### Security Considerations
- Password stored in environment variable (not in code)
- HTTP-only cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- SameSite: Strict (CSRF protection)
- 24-hour session expiration

## Validation Strategy

### Dual Validation (Client + Server)

All user inputs are validated on both client and server:

1. **Client-side**: React Hook Form + Zod
   - Immediate feedback
   - Better UX
   - Reduces server load

2. **Server-side**: Zod schemas in API handlers
   - Security boundary
   - Prevents malicious requests
   - Authoritative validation

### Shared Schemas

Validation schemas in `lib/validations.ts` are used on both sides:
- `invitationCodeSchema` - Code verification
- `rsvpFormSchema` - RSVP submission
- `adminLoginSchema` - Admin login

## State Management

### Client State
- React `useState` for component-local state
- No global state management needed (simple app)

### Server State
- Prisma provides data layer
- No caching layer (database queries are fast enough)

## Component Architecture

### Server Components
- Layout components
- Static sections (when possible)

### Client Components
- Interactive forms (RSVP, admin login)
- Navigation with smooth scrolling
- Admin dashboard with data fetching

### Shared Components
- UI primitives (Button, Input, Card, etc.)
- Reusable across client and server contexts

## Configuration Management

### Environment Variables
- `DATABASE_URL` - Database connection string
- `ADMIN_PASSWORD` - Admin authentication password

### Site Configuration
- `lib/siteConfig.ts` - All event details (hardcoded)
- Type-safe, centralized configuration
- Imported throughout the application

## Performance Considerations

### Optimization Techniques
- Server Components by default (reduced JavaScript)
- Client Components only when needed (interactivity)
- Tailwind CSS for minimal CSS bundle
- No heavy animation libraries
- Optimized images (if any are added)

### Database
- SQLite for local dev (zero configuration)
- Prisma connection pooling for PostgreSQL (production)
- Indexed `code` field (unique constraint provides index)

## Error Handling

### API Errors
- Consistent error response format: `{ error: string }`
- Appropriate HTTP status codes (400, 401, 403, 404, 500)
- Try-catch blocks in all API handlers
- Server-side logging

### Client Errors
- Form validation errors displayed inline
- Network errors shown to user with retry option
- Loading states for all async operations

## Extensibility

### Email Notifications
The architecture includes extension points for email:
- RSVP submission returns success before email
- Add email service in `/lib/email.ts`
- Call from API handler after database save
- Use services like SendGrid, Resend, or AWS SES

### Multiple Events
To support multiple weddings:
- Add `eventId` to schema
- Update all queries to filter by event
- Add event selection in admin
- Namespace invitation codes

### Guest Management
Current system uses invitation codes. To add guest names:
- Add `Guest` model with pre-loaded names
- Link to `InvitationCode`
- Pre-fill RSVP form with guest name

## Deployment Architecture

### Vercel (Recommended)
- Next.js App Router fully supported
- Serverless functions for API routes
- Automatic HTTPS
- Edge caching for static assets
- PostgreSQL via Vercel Postgres or external provider

### Alternative Platforms
- Any Node.js host (Railway, Render, Fly.io)
- Docker container (Dockerfile not included but straightforward)
- VPS with PM2 or systemd

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
