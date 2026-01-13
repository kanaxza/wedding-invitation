# Wedding Invitation Website

A modern, production-ready wedding invitation website with RSVP system protected by invitation code verification.

## Overview

This is a premium single-page wedding invitation website for **Gann & Som's Wedding Reception** on March 28, 2026, at Miracle Grand Hotel, Bangkok. The site features a complete RSVP system where guests can confirm their attendance using unique invitation codes.

## Features

- **Single-Page Design**: Modern, premium UI with smooth scrolling sections
- **Invitation Code Verification**: Secure RSVP system protected by unique codes
- **RSVP Management**: Guests can indicate attendance and specify number of guests
- **Admin Dashboard**: Protected admin panel with statistics and CSV export
- **Mobile-First**: Fully responsive design optimized for all devices
- **Fast Performance**: Lightweight, minimal animations, optimized for mobile
- **Accessible**: Proper labels, focus states, and keyboard navigation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Validation**: Zod
- **Forms**: React Hook Form
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Installation

1. **Clone or download the project**

```bash
cd wedding-invitation
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your admin password:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="your-secure-password-here"
```

4. **Initialize the database**

```bash
pnpm prisma migrate dev --name init
```

5. **Seed invitation codes**

```bash
pnpm db:seed
```

This creates three sample invitation codes:
- `GANN-SOM-001` (active)
- `GANN-SOM-002` (active)
- `GANN-SOM-TEST` (disabled)

6. **Start the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Public Site

Visit the home page to view the wedding invitation. Sections include:
- **Hero**: Couple names, date, venue with CTAs
- **Details**: Event date, time, and venue information
- **Schedule**: Timeline of events
- **Location**: Venue details with Google Maps integration
- **RSVP**: Invitation code-protected RSVP form
- **Contact**: Contact information section

### RSVP Flow

1. Guest enters their invitation code
2. System verifies the code (must be active)
3. Guest fills out RSVP form:
   - Full Name (required)
   - Phone Number (required)
   - Attendance (Attending/Regret)
   - Number of Guests (required if attending)
4. System saves or updates the RSVP
5. Success confirmation displayed

### Admin Dashboard

1. Navigate to `/admin`
2. Enter admin password (from `.env`)
3. View dashboard with:
   - Summary statistics (responses, attending, guests count)
   - Complete RSVP table
   - CSV export functionality

## Adding Invitation Codes

### Using Prisma Studio

```bash
pnpm db:studio
```

Navigate to the `InvitationCode` model and add new records with:
- `code`: Unique code (e.g., "GANN-SOM-003")
- `status`: "active" or "disabled"
- `note`: Optional description

### Using Database Directly

```bash
npx prisma db push
```

Then manually insert records into the database.

### Programmatically

Add codes to `prisma/seed.ts` and run:

```bash
pnpm db:seed
```

## Project Structure

```
wedding-invitation/
├── app/
│   ├── api/              # API route handlers
│   │   ├── admin/        # Admin endpoints
│   │   ├── invitations/  # Invitation verification
│   │   └── rsvp/         # RSVP endpoints
│   ├── admin/            # Admin dashboard page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utilities and configuration
│   ├── auth.ts          # Admin authentication
│   ├── db.ts            # Database client
│   ├── siteConfig.ts    # Event configuration
│   └── validations.ts   # Zod schemas
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── docs/                # Documentation
└── public/              # Static assets
```

## Configuration

Event details are configured in `lib/siteConfig.ts`. Edit this file to update:
- Couple names
- Event date and time
- Venue and location
- Schedule
- Contact information

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed the database
- `pnpm db:studio` - Open Prisma Studio

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design
- [API Reference](docs/API.md) - API endpoints and examples
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide
- [Security](docs/SECURITY.md) - Security considerations

## License

Private project for Gann & Som's wedding.
