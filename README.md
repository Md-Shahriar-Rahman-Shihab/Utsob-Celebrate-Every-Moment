# UTSOB (উৎসব) — Celebrate Every Moment

> **Bangla-First Digital Greeting Card & Invitation Platform for Bangladesh**  
> *Phase 01: Foundation & System Architecture*

---

## 🌸 About Utsob

**Utsob (উৎসব)** is a dedicated, Bengali-first digital celebration platform designed to enable individuals, families, and businesses across Bangladesh to design, customize, download, and share culturally rich greeting cards and interactive invitations.

### Core Product Pillars
1. **Bengali Greeting Card Creation**: Native celebrations for Pohela Boishakh, Eid-ul-Fitr, Eid-ul-Adha, Durga Puja, weddings, and birthdays.
2. **Customizable Visual Card Editor**: Interactive 2D canvas editor powered by Fabric.js with multi-layer arrangement and stickers.
3. **Bengali Typography & Font Engine**: Preloaded native typefaces (Hind Siliguri, Noto Serif Bengali, Anek Bangla, Tiro Bangla, Galada) with conjunct (যুক্তবর্ণ) preservation.
4. **AI-Powered Bengali Wishes & Poetry**: Culturally authentic celebration wishes, rhyming poems, and formal invitation messages powered by the Google Gemini API.
5. **Digital Invitations with RSVP Lifecycle**: Interactive wedding and event invitations with attendee confirmation and host dashboards.
6. **Public Sharing & Distribution**: High-speed public share links (`/c/[token]`), dynamic social preview cards (OpenGraph), and print-ready high-res exports.
7. **Monetization & Bangladeshi Payments**: Premium templates and designer asset packs monetized via bKash, Nagad, and SSLCommerz.
8. **Creator Marketplace**: Community platform for Bangladeshi artists, illustrators, and typographers.

---

## 🛠️ Approved Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | React Server Components & Route Handlers |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict mode enabled, zero implicit any |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Custom Bengali cultural color tokens |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) | Radix UI primitives with accessible Tailwind styling |
| **Visual Editor** | [Fabric.js](http://fabricjs.com/) | 2D HTML5 Canvas rendering engine (Phase 04) |
| **Database** | [PostgreSQL via Neon](https://neon.tech/) | Serverless PostgreSQL with JSONB canvas state |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Strongly typed schema, pooled & direct connections |
| **Authentication** | [Auth.js](https://authjs.dev/) | Session & OAuth authentication with Prisma adapter |
| **Validation** | [Zod](https://zod.dev/) | End-to-end schema validation (Env, Requests, Canvas) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) | Direct signed uploads and optimized image delivery |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/) | Generative Bengali copywriter and poet |
| **Testing** | [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/) | Fast unit tests and browser rendering validation |
| **Deployment** | [Vercel](https://vercel.com/) | Edge-optimized serverless deployment |

---

## 📁 Repository & Documentation Structure

Comprehensive architectural specifications are located in the [`docs/`](docs/) directory:

- 📐 **[System Architecture](docs/architecture/system-architecture.md)**: High-level C4 diagram, components, and modular boundaries.
- 📂 **[Folder Structure](docs/architecture/folder-structure.md)**: Feature-driven Modular Monolith layout.
- 📋 **[Technical Decisions (ADRs)](docs/architecture/technical-decisions.md)**: Records for 8 foundational architectural decisions.
- 🗺️ **[Development Roadmap](docs/architecture/development-roadmap.md)**: Detailed roadmap from Phase 01 through Phase 10.
- 🗄️ **[Database Design](docs/database/database-design.md)**: Normalized PostgreSQL schema for all 12 core entities.
- 📊 **[Entity Relationship Diagram (ERD)](docs/database/erd.md)**: Visual Mermaid ERD and cascading delete rules.
- 🔌 **[API Conventions](docs/api/api-conventions.md)**: Standard RESTful envelopes, status codes, and error catalog.
- 🛡️ **[Security Architecture](docs/security/security-architecture.md)**: BOLA prevention, canvas JSON sanitization, and PII masking.
- 🧪 **[Testing Strategy](docs/testing/testing-strategy.md)**: Testing pyramid, Vitest suites, and localization verification.
- 🎯 **[Phase 01 Acceptance Criteria](docs/architecture/phase-01-acceptance-criteria.md)**: Verification checklist and quality gate.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later (or `pnpm`)
- **Git**
- A **Neon PostgreSQL** database instance (or local PostgreSQL 16+)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/utsob/utsob.git
cd utsob
npm install
```

### 2. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Neon database credentials and authentication secrets:
```env
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/utsob?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/utsob?sslmode=require"
AUTH_SECRET="your-secure-32-character-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run Automated Unit Tests
```bash
npm test
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the Phase 01 foundation.

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Start development server with Hot Module Replacement |
| `npm run build` | `next build` | Create optimized production build |
| `npm run start` | `next start` | Run production server |
| `npm run lint` | `eslint src/` | Lint TypeScript and React source files |
| `npm run typecheck` | `tsc --noEmit` | Check TypeScript compilation and strict types |
| `npm test` | `vitest run` | Execute unit test suite with Vitest |
| `npm run test:watch` | `vitest` | Run unit tests in interactive watch mode |
| `npm run prisma:generate`| `prisma generate` | Generate strongly typed Prisma Client |
| `npm run prisma:validate`| `prisma validate` | Validate `schema.prisma` syntax and consistency |

---

## 🇧🇩 Bengali Typography & Font Engine

Utsob includes a dedicated typography whitelist and preloading coordinator in `src/lib/bengali/typography.ts`:

| Font Family | Category | Weights | Primary Application |
| :--- | :--- | :--- | :--- |
| **Hind Siliguri** | Sans-Serif | 300, 400, 500, 600, 700 | Platform UI, body copy, modern cards |
| **Noto Serif Bengali** | Serif | 400, 500, 600, 700 | Formal wedding invitations, traditional cards |
| **Anek Bangla** | Display | 400, 600, 700, 800 | Bold headlines, festive Pohela Boishakh posters |
| **Tiro Bangla** | Serif | 400 | Formal invitations, poetry stanzas |
| **Galada** | Cursive | 400 | Calligraphic Eid greetings, celebratory headers |

---

## 🔒 Security & Privacy Commitments

- **No Secret Leakage**: Strict Zod environment validation prevents unexposed variables from reaching the client bundle.
- **Server-Side Authorization**: Card and asset mutations verify `session.user.id` on every query; client-submitted `userId` is never trusted.
- **Canvas JSON Sanitization**: Stored canvas scene graphs are checked against `canvasDocumentSchema` to block `javascript:` protocols, script tags, and malicious SVG content.
- **Automated PII Masking**: The structured JSON logger (`src/lib/logger.ts`) redacts passwords, bearer tokens, Bangladeshi phone numbers, and email addresses automatically.

---

## 📄 License

Proprietary © 2026 Utsob (উৎসব). All rights reserved.
