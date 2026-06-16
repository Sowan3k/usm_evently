# USM Evently

A full-stack campus events platform for **Universiti Sains Malaysia (USM)** students. Browse upcoming and past events, register (RSVP), pay for ticketed events, track your MyCSD points, and manage everything from an admin dashboard.

Built with **Next.js (Pages Router) + TypeScript**, a **PostgreSQL** database via **Prisma**, and authentication with **NextAuth**.

> 📣 **Looking for collaborators!** This is an open student project for the USM community. See [Contributing](#contributing) below; beginners welcome.

---

## Screenshots

A glassmorphism UI with an animated aurora backdrop, Space Grotesk display type, and fluid motion.

### Home

![Home page](docs/screenshots/01-home.png)

### Login & event detail

| Login / Sign-up (ID-verified) | Event detail: campus, safety & organiser payment |
|---|---|
| ![Login](docs/screenshots/05-login.png) | ![Event detail](docs/screenshots/02-event-detail.png) |

### Student profile & checkout

| Profile: MyCSD points & event history | Payment checkout (simulated) |
|---|---|
| ![Profile](docs/screenshots/06-profile.png) | ![Payment](docs/screenshots/07-payment.png) |

### My Tickets (QR check-in) & organizer self-service

| My Tickets: a QR code per registration | Organizer: submit events for approval |
|---|---|
| ![My Tickets](docs/screenshots/10-tickets.png) | ![Organizer](docs/screenshots/11-organizer.png) |

### Admin tools

| Create event (full organiser form) | User & email moderation |
|---|---|
| ![Admin create event](docs/screenshots/03-admin-create-event.png) | ![Admin moderation](docs/screenshots/08-admin-moderation.png) |

**Admin analytics dashboard**

![Analytics](docs/screenshots/09-analytics.png)

**Approval queue** (organizer-submitted events await review)

![Pending approvals](docs/screenshots/12-admin-queues.png)

### Bilingual (English / Bahasa Malaysia)

The same home page with the language toggled to Bahasa Malaysia:

![Home in Bahasa Malaysia](docs/screenshots/13-home-bm.png)

### User Agreement

![User Agreement](docs/screenshots/04-user-agreement.png)

> Screenshots are generated from the seeded demo data with `node scripts/screenshots.js` (Puppeteer) while the app runs locally.

---

## Features

**For everyone (no login required)**
- 🌐 Browse **upcoming & past events**: thumbnails and full detail pages are public; you only need an account to register
- 🔎 **Search & filters**: search by title and filter by campus, category, and price (free/paid), all driven by the URL query

**For students**
- 🔐 Email/password sign-up & login (sessions via NextAuth + bcrypt-hashed passwords)
- 🪪 **Identity-verified accounts**: every sign-up must provide a matric number, IC, or passport so users are traceable USM students/staff (stored privately, never shown publicly)
- ✅ Register / cancel registration for events (with capacity limits & past-event guards)
- 🎟️ **My Tickets + QR check-in**: each registration gets a QR code; an organizer/admin scan checks the attendee in and **awards their MyCSD points automatically**
- 💳 Simulated payment flow for ticketed events, recorded as real transactions
- 👤 Profile page with editable details, MyCSD points, and real registration history
- 📅 **Add to Calendar** (`.ics`) and 🔗 **Share Event** (Web Share API + clipboard fallback)

**For organisers (self-service)**
- 🙋 **Request organizer access** for your club/society; an admin reviews each request
- 📨 Approved organisers **submit events** that enter a **moderation queue** and go live only after admin approval
- 📋 Rich event form capturing everything attendees need to know:
  - Organising **school / faculty** and **USM campus** (Main / Engineering / Health)
  - **Free for all vs. ticketed**, and whether **outsiders (non-USM) are allowed**
  - **Dress code** and **cultural / etiquette notes** visitors must observe
  - A required **organiser emergency helpline**
  - **Poster upload** (JPG/PNG, max 5 MB) with client- & server-side validation
- 💸 **Flexible payments**: use the built-in checkout, *or* provide your own **bank details, Touch 'n Go, and a payment QR code** for attendees to pay you directly (optional)

**For admins**
- 🛠️ Protected dashboard to **create, edit, and delete** events (full CRUD)
- ✅ **Approval queues** for pending events and organizer requests (approve / reject)
- 📊 **Analytics dashboard** (Recharts): registrations over time, popular categories, revenue by event, and key totals
- 👮 Role-based access control: admin routes & actions are blocked for students (403)
- 🚫 **Moderation tools**: block/unblock any user (with their verified ID visible for tracing), or ban any email address (e.g. Gmail) so it can neither sign in nor register
- 📜 Public **User Agreement** (`/terms`): admins may delete any rule-violating event and block any user or email

**Platform**
- 🌏 **Bilingual (i18n)**: English / Bahasa Malaysia toggle, cookie-persisted and SSR-safe
- 🖼️ **Image storage**: posters/QRs offload to **Vercel Blob** when configured, with a zero-config inline fallback otherwise

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
| Charts | Recharts |
| QR codes | qrcode |
| Image storage | Vercel Blob (with inline fallback) |
| i18n | Custom cookie-based context (EN / BM) |

---

## Architecture

```
pages/
  index.tsx              # Redirects to the public home page
  register.tsx           # Combined login / sign-up (with ID verification)
  home.tsx               # Upcoming & past events, PUBLIC (SSR from DB)
  events/[id].tsx        # Event detail, PUBLIC; RSVP/calendar/share need login
  profile.tsx            # User profile + registration history
  payment.tsx            # Simulated checkout
  tickets.tsx            # My Tickets (QR code per registration)
  checkin/[regId].tsx    # Organizer/admin ticket check-in (awards MyCSD)
  organizer.tsx          # Request organizer access + submit events
  terms.tsx              # Public User Agreement / rules
  admin/index.tsx        # Event CRUD + approval queues + moderation
  admin/analytics.tsx    # Charts: registrations, categories, revenue
  api/
    auth/[...nextauth].ts  # NextAuth handler
    auth/register.ts       # Sign-up endpoint (ID-verified, rejects bans)
    events/                # Events CRUD (public GET approved-only; image offload)
    registrations/         # RSVP / cancel / list mine
    checkin.ts             # Mark attended + award MyCSD points
    profile.ts             # Update profile
    payments.ts            # Record a payment
    organizer/request.ts   # Request organizer access
    admin/users.ts         # List users, block/unblock
    admin/blocked-emails.ts# List/add/remove banned email addresses
    admin/events.ts        # Approve / reject submitted events
    admin/organizers.ts    # Approve / reject organizer requests
components/
  EventForm.tsx          # Shared create/edit event form (admin + organizer)
  AnalyticsCharts.tsx    # Recharts charts (client-only)
  QrImage.tsx            # Client QR-code renderer
lib/
  prisma.ts              # PrismaClient singleton
  auth.ts                # NextAuth options (blocks banned accounts/emails)
  api-auth.ts            # requireAuth / requireAdmin guards (API)
  page-auth.ts           # SSR auth/redirect helpers (pages)
  validations.ts         # Zod schemas
  events.ts              # Event serialization + date formatting
  calendar.ts            # .ics generation
  constants.ts           # USM campuses & schools reference data
  storage.ts             # Vercel Blob image storage (inline fallback)
  i18n.tsx               # EN/BM dictionaries + language context
prisma/
  schema.prisma          # User, BlockedEmail, Event, Registration, Payment
  seed.ts                # Demo data
scripts/
  screenshots.js         # Puppeteer README screenshot capture
```

Pages read data directly through Prisma in `getServerSideProps` (server-rendered), while all mutations go through validated API routes guarded by `requireAuth` / `requireAdmin`. Public event APIs return only `APPROVED` events; unapproved submissions are visible solely to their organizer and admins.

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
| Student (with tickets & history) | `noormohammadsowan@student.usm.my` | `student123` |
| Approved organizer | `limwei@student.usm.my` | `organizer123` |
| Admin | `admin@usm.my` | `admin123` |

The seed also creates a student with a **pending organizer request** and an organizer-submitted **event awaiting approval**, so the admin approval queues have content to review.

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

Contributions from the USM community (and anyone else) are very welcome; this is a friendly project to learn full-stack development on.

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

- The payment flow is a **simulation**: no real card is charged and raw card numbers are never stored. The payment record (amount, description, event) is persisted to demonstrate the data model. Swapping in a real provider (e.g. Stripe) would only touch `pages/payment.tsx` and `pages/api/payments.ts`.
- MyCSD points reflect USM's Co-curriculum & Soft-skill Development scheme; events carry point values that could be awarded on attendance.
- Event **posters** are validated (JPG/PNG, ≤ 5 MB) and currently stored as base64 data URLs in the database to keep setup zero-config. For production scale, swap this for object storage (Vercel Blob / S3), a great [first contribution](#contributing).
