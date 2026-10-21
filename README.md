# BrightCore Recruitment

A recruitment platform built for BrightCore. Candidates browse open roles and apply with their CV; admins post jobs, review applications, and manage the whole hiring flow from a dashboard.

**Stack:** Next.js 16 (App Router), Neon PostgreSQL, Drizzle ORM, Tailwind CSS.

---

## What's inside

### For candidates

- A landing page with a hero, live search, and filters by employment type
- Paginated job listings (8 per page) with search and filters preserved across pages
- Job detail pages with a sticky application form on desktop
- Drag-and-drop CV upload (PDF, max 5 MB) with validation and a consent checkbox
- Automatic "application received" email

### For admins

- Login with password reset via a 6-digit code
- Admin avatar in the public header with a dropdown (Dashboard, Sign out) when signed in
- Dashboard with stats on jobs, applications, and views, plus a table of the latest candidates
- Create, edit, close, and delete jobs (with confirmation)
- Open/close toggle directly from the job edit form
- Paginated job list (10 per page) with search and status filters
- Rich-text editor (Tiptap) for descriptions, and requirements managed as a tag list
- Applicants per job, filterable by status, with a side drawer to review each candidate
- Paginated global applications page (15 per page) with status filters
- Accept/reject with an optional note — the candidate gets a matching email
- Profile page to update name, email, and password

---

## Tech choices

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components for the public site, Server Actions for mutations. Routing and streaming come free. |
| Database | **Neon PostgreSQL** | Real relational DB, serverless-friendly, free tier. HTTP connections mean no pool to manage. |
| ORM | **Drizzle** | Type-safe, lightweight, close to SQL. Better cold starts than Prisma on serverless. |
| Validation | **Zod** | One schema shared between client and server, no duplication. |
| Forms | **react-hook-form** | Minimal re-renders, works well with uncontrolled inputs. |
| Auth | **JWT cookie** (`jose` + `bcryptjs`) | Single admin — a full auth library would be overkill. Cookie is httpOnly, signed, lasts 7 days. |
| Rich text | **Tiptap** | Headless editor with clean HTML output, easy to sanitize. |
| Files | **ImageKit** | Private CV storage with signed URLs. No S3 setup. |
| Email | **Nodemailer** | Works with any SMTP provider. |
| UI | **Tailwind + lucide-react** | No component library, full control over the look. |
| Tests | **Vitest** | Fast, ESM-native, zero config friction. |

---

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free tier is fine)
- An [ImageKit](https://imagekit.io) account for CV storage
- An SMTP provider — Gmail App Password, Mailtrap, or Brevo all work

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | Random 32-byte hex string (see command below) |
| `NEXT_PUBLIC_APP_URL` | Base URL, `http://localhost:3000` in dev |
| `IMAGEKIT_PUBLIC_KEY` | From ImageKit → Developer Options |
| `IMAGEKIT_PRIVATE_KEY` | Same place |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/your_id` |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587`, or `465` for SSL |
| `SMTP_SECURE` | `true` if port is 465, `false` otherwise |
| `SMTP_USER` | Your SMTP username |
| `SMTP_PASS` | Your SMTP password or app password |
| `SMTP_FROM` | Sender address, e.g. `BrightCore <you@gmail.com>` |

Generate an auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Push the schema to Neon

```bash
npm run db:push
```

### 4. Seed an admin and sample jobs

```bash
npm run db:seed
```

This creates:

- **Admin:** `admin@brightcore.test` / `Admin12345`
- **3 sample jobs** across various industries

### 5. Run

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/login](http://localhost:3000/login)

---

## Tests

```bash
npm test               # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

**49 tests across four files**, covering the parts that are worth pinning down:

- **`tests/validations.test.ts`** — Zod schemas for applications, jobs, login, and password. Invalid emails, short names, weak passwords, past dates, empty requirements, more than 20 requirements.
- **`tests/slug.test.ts`** — Slug generation. Normal titles, accented characters, emoji-only titles falling back to random hex, deduplication when two jobs share a title.
- **`tests/sanitize.test.ts`** — Anti-XSS. Strips `<script>`, `onclick`, `javascript:` URLs, `<iframe>`, `<style>`, and unknown tags. Keeps lists, headings, code blocks, and blockquotes intact. Rewrites links with `rel="noopener noreferrer"`.
- **`tests/application-logic.test.ts`** — Business rules. `isJobOpen`, `canApplyToJob`. Covers open jobs, closed jobs, and past closing dates.

### Coverage

| Module | Coverage |
|---|---:|
| `lib/application-logic.ts` | 100% |
| `lib/sanitize.ts` | 100% |
| `lib/slug.ts` | 100% |
| `lib/validations/*` | ~96% |

**What's not tested:** Server Actions and email templates. They depend on the database, session cookies, SMTP, and ImageKit. Testing them properly means a test database and mocks for every external call — more setup than value for this project. The pure helpers they rely on are fully covered.

---

## CI/CD with Vercel

Every push to `development` triggers a **Preview Deployment**. Every push to `main` triggers a **Production Deployment**.

**What runs on every PR:**

- `npm install` with a clean lockfile
- `next build` — full TypeScript compilation + ESLint + static generation check
- A preview URL is generated and commented on the PR
- The PR can only be merged if the build passes (required check)

**What doesn't run automatically:**

- `npm test` (Vitest) — would need a separate GitHub Actions workflow. Not configured here, but the 49 tests pass locally with `npm test`.

**Workflow:**

```
feature branch → development (preview deploy)
                     ↓
              Pull Request to main
                     ↓
         Vercel build check 
                     ↓
                  Merge
                     ↓
         main (production deploy)
```

If the Vercel build fails on a PR, the PR shows a red check and can't be merged until it's fixed.

---

## Docker

The project ships with a `Dockerfile` and `docker-compose.yml`. The app runs standalone in the container; the database stays on Neon, so no local Postgres to manage.

```bash
# Build and run
docker compose up --build

# Stop
docker compose down
```

The container listens on `http://localhost:3000`. Environment variables come from `.env.local` (mounted as `env_file` in the compose file).

`output: "standalone"` is on in `next.config.ts`, so the production image only carries what it needs — around 200 MB.

---

## Project structure

```
app/
├── (public)/              # Landing, job detail, apply form
├── (auth)/login/          # Login, forgot password, reset
├── admin/                 # Dashboard, jobs, applications, profile
├── api/cv/[id]/           # Signed CV download (admin only)
├── actions/               # Server Actions (auth, jobs, applications, profile)
└── lib/                   # Auth, imagekit, mailer, sanitize, slug, validations

components/
├── public/                # JobCard, JobFilters, ApplyForm, ...
└── admin/                 # AdminSidebar, JobForm, RichTextEditor, RequirementsInput, ApplicationDrawer, ...

db/
├── schema.ts              # Tables, enums, indexes
├── index.ts               # Neon + Drizzle client
└── seed.ts                # Admin + 3 sample jobs

tests/
├── validations.test.ts
├── slug.test.ts
├── sanitize.test.ts
└── application-logic.test.ts
```

---

## Security

- **Admin routes** go through `requireAdmin()` in the layout. Server Actions call `assertAdmin()`, so they fail closed if someone hits them directly.
- **CVs** are uploaded to ImageKit as private files. Admins get a 5-minute signed URL, generated on demand. The CV never has a permanent public URL.
- **Rich text** (job descriptions) is sanitized with `sanitize-html` before storage, then rendered through `prose` classes.
- **Requirements** are stored as a `jsonb` array of strings, validated by Zod (min 1, max 20, each 1–200 chars).
- **Passwords** are bcrypt-hashed (cost 10). The reset flow uses a 6-digit code, hashed in the DB, valid for 15 minutes, with a 5-attempt limit.
- **Duplicate applications** are blocked at the database level (unique index on job + email), and the job status is re-checked server-side before accepting a submission.
- **No email enumeration** on the forgot-password form. The same success message appears whether or not the email exists.
- **Server Action body size** is raised to 6 MB in `next.config.ts`, enough for a 5 MB CV plus the rest of the form.
- **Closing dates** can't be in the past — enforced both client-side (`min` on the date input) and server-side (Zod refine).
- **Session cleanup** — an invalid or expired JWT cookie is deleted by the proxy before redirecting to `/login`.
- **Admin redirect** — an authenticated admin visiting `/login` is redirected to `/admin`.

---

## Assumptions and limitations

- **One admin.** The brief mentions a single seeded admin, so multi-user roles aren't implemented.
- **Three statuses.** Pending, Accepted, Rejected — exactly as specified. No "shortlisted" state. If you need to signal an interview step, say it in the admin note; it gets included in the accepted email.
- **Requirements as tags.** The brief doesn't specify a format. A tag list fits short, scannable items better than rich text. The description stays rich text for paragraphs, headings, and lists.
- **View counts** go up on every render of the job detail page. There's no per-visitor dedupe because Next.js 16 doesn't let Server Components set cookies. Doing it properly means a client-side effect or a Route Handler.
- **CVs aren't deleted from ImageKit** when a job is deleted. A production system would add a cleanup job. I left it out and noted it here.
- **Emails are best-effort.** If SMTP is down, the application or status change still goes through. The error is logged server-side.
- **Pagination** is implemented on:
  - Public jobs page (8 per page, search and type filters preserved)
  - Admin jobs list (10 per page, search and status filters)
  - Admin applications page (15 per page, status filter)
  

---

## What I'd improve with more time

- **Integration tests** for the Server Actions, with a throwaway Postgres. Would cover `submitApplication` and `updateApplicationStatus` end-to-end.
- **Playwright** for the happy path: browse → apply → admin login → accept.
- **GitHub Actions** workflow to run `npm test` on every PR, alongside the Vercel build check.
- **Cleanup job** for orphan CVs on ImageKit after a job is deleted.
- **Pagination** on the per-job applicant list.
- **Optimistic UI** for status changes in the drawer, instead of a full `router.refresh()`.
- **Rate limiting** on the apply form. Currently only the forgot-password flow is throttled.
- **Audit log** for admin actions — who changed what, when.
- **Email templates** as React components (`@react-email/components`) instead of inline HTML strings.
- **CI pipeline** running lint, typecheck, and tests on every push.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:push` | Push the schema to Neon |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed admin + 20 sample jobs |

---

## Admin login for reviewers

```
Email:    admin@brightcore.test
Password: Admin12345
```

The seed also creates 3 sample jobs, so the public site isn't empty on first run.

