# USM Evently

A full-stack campus events platform for **Universiti Sains Malaysia (USM)** students — browse upcoming and past events, register (RSVP), pay for ticketed events, track your MyCSD points, and manage everything from an admin dashboard.

Built with **Next.js (Pages Router) + TypeScript**, a **PostgreSQL** database via **Prisma**, and authentication with **NextAuth**.

> 📣 **Looking for collaborators!** This is an open student project for the USM community. See [Contributing](#contributing) below — beginners welcome.

---

## Screenshots

| Home — upcoming & past events | Event detail — campus, safety & cultural info |
|---|---|
| ![Home page](docs/screenshots/01-home.png) | ![Event detail](docs/screenshots/02-event-detail.png) |

| Admin — create event (full organiser form) | User Agreement / rules |
|---|---|
| ![Admin create event](docs/screenshots/03-admin-create-event.png) | ![User Agreement](docs/screenshots/04-user-agreement.png) |

> Screenshots are generated from the seeded demo data with `node scripts/screenshots.js` (Puppeteer) while the app runs locally.

---

## Features

**For everyone (no login required)**
- 🌐 Browse **upcoming & past events** — thumbnails and full detail pages are public; you only need an account to register

**For students**
- 🔐 Email/password sign-up & login (sessions via NextAuth + bcrypt-hashed passwords)
- 🪪 **Identity-verified accounts** — every sign-up must provide a matric number, IC, or passport so users are traceable USM students/staff (stored privately, never shown publicly)
- ✅ Register / cancel registration for events (with capacity limits & past-event guards)
- 💳 Simulated payment flow for ticketed events, recorded as real transactions
- 👤 Profile page with editable details, MyCSD points, and real registration history
- 📅 **Add to Calendar** — generates a downloadable `.ics` file for any event
- 🔗 **Share Event** — uses the Web Share API with a clipboard fallback

**For event organisers / admins**
- 🛠️ Protected admin dashboard to **create, edit, and delete** events (full CRUD)
- 📋 Rich event form capturing everything attendees need to know:
  - Organising **school / faculty** and **USM campus** (Main / Engineering / Health)
  - **Free for all vs. ticketed**, and whether **outsiders (non-USM) are allowed**
  - **Dress code** and **cultural / etiquette notes** visitors must observe
  - A required **organiser emergency helpline**
  - **Poster upload** (JPG/PNG, max 5 MB) with client- & server-side validation
  - A required **Organizer Agreement** checkbox before publishing
- 💸 **Flexible payments** — use the built-in checkout, *or* provide your own **bank details, Touch 'n Go, and a payment QR code** for attendees to pay you directly (optional)
- 👮 Role-based access control — admin routes & actions are blocked for students (403)
- 🚫 **Moderation tools** — block/unblock any user (with their verified ID visible for tracing), or ban any email address (e.g. Gmail) so it can neither sign in nor register
- 📜 Public **User Agreement** (`/terms`) — admins may delete any rule-violating event and block any user or email

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
  index.tsx              # Redirects to the public home page
  register.tsx           # Combined login / sign-up (with ID verification)
  home.tsx               # Upcoming & past events — PUBLIC (SSR from DB)
  events/[id].tsx        # Event detail — PUBLIC; RSVP/calendar/share need login
  profile.tsx            # User profile + registration history
  payment.tsx            # Simulated checkout
  terms.tsx              # Public User Agreement / rules
  admin/index.tsx        # Admin event CRUD + user/email moderation
  api/
    auth/[...nextauth].ts  # NextAuth handler
    auth/register.ts       # Sign-up endpoint (rejects blocked emails)
    events/                # Events CRUD (GET public, POST/PUT/DELETE admin)
    registrations/         # RSVP / cancel / list mine
    profile.ts             # Update profile
    payments.ts            # Record a payment
    admin/users.ts         # List users, block/unblock
    admin/blocked-emails.ts# List/add/remove banned email addresses
lib/
  prisma.ts              # PrismaClient singleton
  auth.ts                # NextAuth options (blocks banned accounts/emails)
  api-auth.ts            # requireAuth / requireAdmin guards (API)
  page-auth.ts           # SSR auth/redirect helpers (pages)
  validations.ts         # Zod schemas
  events.ts              # Event serialization + date formatting
  calendar.ts            # .ics generation
  constants.ts           # USM campuses & schools reference data
prisma/
  schema.prisma          # User, BlockedEmail, Event, Registration, Payment
  seed.ts                # Demo data
scripts/
  screenshots.js         # Puppeteer README screenshot capture
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

### Windows quick start (`start.bat`)

On Windows you can skip the manual steps and just double-click **`start.bat`** in the project root (or run it from a terminal):

```bat
start.bat
```

It installs dependencies on first run, creates a `.env` from `.env.example` if one is missing (prompting you to fill it in), generates the Prisma client, and launches the dev server at [http://localhost:3000](http://localhost:3000). You still need a configured `DATABASE_URL` and to run `npm run db:migrate` / `npm run db:seed` once to set up the database.

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

## Contributing

Contributions from the USM community (and anyone else) are very welcome — this is a friendly project to learn full-stack development on.

1. **Fork** the repo and clone your fork.
2. Follow [Getting Started](#getting-started) to run it locally (or just run `start.bat` on Windows).
3. Create a branch: `git checkout -b feature/your-idea`.
4. Make your change and run `npm run build` to make sure it compiles.
5. Commit, push to your fork, and open a **Pull Request** describing what you changed.

**Good first issues / ideas:**
- Replace the data-URL poster storage with object storage (e.g. Vercel Blob / S3)
- Real email verification on sign-up
- Event search & category filters on the home page
- A "my registrations" / ticket QR page
- Map embed on the event detail page
- Unit/integration tests

Not sure where to start? Open an issue and say hi. 🙂

---

## Notes

- The payment flow is a **simulation** — no real card is charged and raw card numbers are never stored. The payment record (amount, description, event) is persisted to demonstrate the data model. Swapping in a real provider (e.g. Stripe) would only touch `pages/payment.tsx` and `pages/api/payments.ts`.
- MyCSD points reflect USM's Co-curriculum & Soft-skill Development scheme; events carry point values that could be awarded on attendance.
- Event **posters** are validated (JPG/PNG, ≤ 5 MB) and currently stored as base64 data URLs in the database to keep setup zero-config. For production scale, swap this for object storage (Vercel Blob / S3) — a great [first contribution](#contributing).
