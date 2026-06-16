# USM Evently

A full-stack campus events platform for **Universiti Sains Malaysia (USM)** students — browse upcoming and past events, register (RSVP), pay for ticketed events, track your MyCSD points, and manage everything from an admin dashboard.

Built with **Next.js (Pages Router) + TypeScript**, a **PostgreSQL** database via **Prisma**, and authentication with **NextAuth**.

---

## Features

**For students**
- 🔐 Email/password sign-up & login (sessions via NextAuth + bcrypt-hashed passwords)
- 🗓️ Browse upcoming & past events, with detail pages pulled from the database
- ✅ Register / cancel registration for events (with capacity limits & past-event guards)
- 💳 Simulated payment flow for ticketed events, recorded as real transactions
- 👤 Profile page with editable details, MyCSD points, and real registration history
- 📅 **Add to Calendar** — generates a downloadable `.ics` file for any event
- 🔗 **Share Event** — uses the Web Share API with a clipboard fallback

**For admins**
- 🛠️ Protected admin dashboard to **create, edit, and delete** events (full CRUD)
- 👮 Role-based access control — admin routes & actions are blocked for students (403)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (Pages Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth (Credentials provider, JWT sessions) |
| Validation | Zod |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Animation | Framer Motion |

---

## Architecture

```
pages/
  index.tsx              # Redirects by auth state (login vs home)
  register.tsx           # Combined login / sign-up
  home.tsx               # Upcoming & past events (SSR from DB)
  events/[id].tsx        # Event detail + RSVP + calendar/share
  profile.tsx            # User profile + registration history
  payment.tsx            # Simulated checkout
  admin/index.tsx        # Admin-only event CRUD dashboard
  api/
    auth/[...nextauth].ts  # NextAuth handler
    auth/register.ts       # Sign-up endpoint
    events/                # Events CRUD (GET public, POST/PUT/DELETE admin)
    registrations/         # RSVP / cancel / list mine
    profile.ts             # Update profile
    payments.ts            # Record a payment
lib/
  prisma.ts              # PrismaClient singleton
  auth.ts                # NextAuth options
  api-auth.ts            # requireAuth / requireAdmin guards (API)
  page-auth.ts           # SSR auth/redirect helpers (pages)
  validations.ts         # Zod schemas
  events.ts              # Event serialization + date formatting
  calendar.ts            # .ics generation
prisma/
  schema.prisma          # User, Event, Registration, Payment models
  seed.ts                # Demo data
```

Pages read data directly through Prisma in `getServerSideProps` (server-rendered), while all mutations go through validated API routes guarded by `requireAuth` / `requireAdmin`.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local, or a free cloud DB like [Neon](https://neon.tech) / [Supabase](https://supabase.com))

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the template and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npm run db:migrate   # apply schema / create tables
npm run db:seed      # load demo users + events
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (from the seed)

| Role | Email | Password |
|------|-------|----------|
| Student | `noormohammadsowan@student.usm.my` | `student123` |
| Admin | `admin@usm.my` | `admin123` |

---

## Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run db:migrate` | Create/apply a migration (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio to browse the DB |

---

## Deploying to Vercel

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com/new).
2. Create a PostgreSQL database (Neon / Supabase / Vercel Postgres) and copy its connection string.
3. In the Vercel project settings, add the environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your production URL).
4. Set the **Build Command** to `npm run vercel-build` (runs `prisma migrate deploy` before building).
5. Deploy. After the first deploy, run `npm run db:seed` once against the production database if you want demo data.

---

## Notes

- The payment flow is a **simulation** — no real card is charged and raw card numbers are never stored. The payment record (amount, description, event) is persisted to demonstrate the data model. Swapping in a real provider (e.g. Stripe) would only touch `pages/payment.tsx` and `pages/api/payments.ts`.
- MyCSD points reflect USM's Co-curriculum & Soft-skill Development scheme; events carry point values that could be awarded on attendance.
