# Wedding Invitation Website

A modern, production-ready wedding invitation website with RSVP system protected by invitation code verification.

## Overview

This is a premium single-page wedding invitation website for **Gann & Som's Wedding Reception** on March 28, 2026, at Miracle Grand Hotel, Bangkok. The site features a complete RSVP system where guests can confirm their attendance using unique invitation codes.

## Features

- **Single-Page Design**: Modern, premium UI with smooth scrolling sections
- **Bilingual Support**: Full English and Thai language support with toggle
- **Invitation Code Verification**: Secure RSVP system protected by unique codes
- **RSVP Management**: Guests can indicate attendance, specify number of guests, and dietary restrictions
- **Calendar Integration**: Add to Google Calendar, Apple Calendar, or Outlook with webview detection
- **Webview Support**: Smart detection of in-app browsers (LINE, Instagram, etc.) with helpful instructions
- **Photo Gallery**: Showcase couple's moments with image gallery
- **PromptPay QR Code**: Display QR code for cashless gifts
- **Admin Dashboard**: Protected admin panel with statistics, CSV export, and invitation management
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
- **State Management**: React Context (Language)
- **Image Optimization**: Next.js Image component
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
- **Hero**: Couple names, date, venue with CTAs and language toggle
- **Details**: Event date, time, venue information, and calendar integration with dress code
- **Photo Gallery**: Couple's memorable moments
- **Schedule**: Timeline of events
- **Location**: Venue details with Google Maps integration and PromptPay QR code
- **RSVP**: Invitation code-protected RSVP form with dietary restrictions
- **Contact**: Contact information section

### Language Support

The site is fully bilingual (English/Thai):
- Language toggle in navigation and hero section
- All content dynamically translates
- User preference persists across visits
- Seamless switching without page reload

### RSVP Flow

1. Guest enters their invitation code
2. System verifies the code (must be active)
3. Guest fills out RSVP form:
   - Full Name (required)
   - Phone Number (required)
   - Attendance (Attending/Regret)
   - Number of Guests (required if attending)
   - Dietary Restrictions (optional): Halal, Vegetarian, Non-Beef, Allergies
4. System saves or updates the RSVP
5. Success confirmation displayed

### Calendar Features

**Add to Calendar**: Guests can add the event to their preferred calendar app:
- Google Calendar
- Apple Calendar (downloads .ics file)
- Outlook Calendar

**Webview Detection**: Smart detection for in-app browsers:
- Automatically detects LINE, Instagram, Facebook, and other webview apps
- Shows helpful instructions to open in Safari/Chrome
- Provides copy link functionality with fallback for restricted environments
- Distinguishes real Safari from in-app webviews using user agent analysis

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
│   ├── HeroSection.tsx   # Hero with language toggle
│   ├── DetailsSection.tsx # Event details & calendar
│   ├── PhotoGallery.tsx  # Image gallery
│   ├── RSVPSection.tsx   # RSVP form with dietary options
│   ├── LanguageToggle.tsx # Language switcher
│   └── ...               # Other UI components
├── lib/                  # Utilities and configuration
│   ├── auth.ts          # Admin authentication
│   ├── db.ts            # Database client
│   ├── siteConfig.ts    # Event configuration
│   ├── translations.ts  # Bilingual content
│   ├── LanguageContext.tsx # Language state management
│   └── validations.ts   # Zod schemas
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── docs/                # Documentation
└── public/              # Static assets
    └── gallery/         # Photo gallery images
```

## Configuration

Event details and bilingual content are configured in:

- `lib/siteConfig.ts` - Event information (dates, venue, schedule, etc.)
- `lib/translations.ts` - All text content in English and Thai

Edit these files to update:
- Couple names
- Event date and time
- Venue and location
- Schedule and timeline
- Contact information
- All displayed text in both languages

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
