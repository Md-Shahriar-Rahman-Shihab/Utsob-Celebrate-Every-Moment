# UTSOB (উৎসব) — Folder Structure & Codebase Organization

> **Document Version:** 1.0.0  
> **Status:** APPROVED (Phase 01)  
> **Pattern:** Feature-Driven Modular Monolith with Next.js App Router  

---

## 1. Architectural Philosophy

Utsob utilizes a **Feature-Driven Modular Monolith** folder organization. Rather than grouping code exclusively by technical artifact (e.g., all controllers in one folder, all models in another), code is primarily partitioned by **Business Domain Features** (`src/features/*`).

### Core Rules:
1. **Domain Encapsulation**: Each feature folder contains its own domain components, hooks, services, repositories, schemas, and types.
2. **Clear Public Interface**: A feature exposes external capabilities through an `index.ts` barrier file. Other features or routes should not reach deep into private feature internals.
3. **Shared Foundation**: Cross-cutting utilities, common UI primitives (`shadcn/ui`), foundational database access, and global configuration reside in `src/lib/`, `src/components/ui/`, and `src/config/`.
4. **App Router as Transport / Page Shells**: The `src/app/` directory handles routing, layout composition, server-side data loading, and API Route Handler delegation. Business logic stays in `src/features/`.

---

## 2. Directory Tree Layout

```
utsob/
├── .github/                       # GitHub Actions workflows & issue templates
│   └── workflows/
│       └── ci.yml                 # Lint, Typecheck, Test, Prisma validation
├── docs/                          # Comprehensive Architectural & Technical Documentation
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── folder-structure.md
│   │   ├── technical-decisions.md # Architecture Decision Records (ADRs)
│   │   ├── development-roadmap.md
│   │   └── phase-01-acceptance-criteria.md
│   ├── database/
│   │   ├── database-design.md
│   │   └── erd.md
│   ├── api/
│   │   └── api-conventions.md
│   ├── security/
│   │   └── security-architecture.md
│   └── testing/
│       └── testing-strategy.md
├── prisma/                        # Database Schema & Migrations
│   ├── schema.prisma              # Normalized PostgreSQL Schema (Neon)
│   └── migrations/                # Version-controlled SQL migrations
├── public/                        # Static Public Assets
│   ├── fonts/                     # Bengali WOFF2 font files (Hind Siliguri, etc.)
│   ├── images/                    # Platform logos, badges, cultural motifs
│   └── favicon.ico
├── src/
│   ├── app/                       # Next.js App Router (Pages, Layouts, Route Handlers)
│   │   ├── (auth)/                # Route Group: Authentication flows (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (marketing)/           # Route Group: Landing pages, catalog discovery
│   │   │   ├── page.tsx           # Home landing page
│   │   │   ├── templates/         # Public template browsing
│   │   │   └── pricing/
│   │   ├── (dashboard)/           # Route Group: Authenticated user workspace
│   │   │   ├── dashboard/
│   │   │   ├── my-cards/
│   │   │   └── settings/
│   │   ├── c/                     # Public Card Viewer (High-speed, SEO-friendly)
│   │   │   └── [slug]/            # Share link landing page
│   │   ├── editor/                # Fullscreen Visual Card Editor Shell
│   │   │   └── [cardId]/
│   │   ├── api/                   # Next.js Route Handlers (RESTful API Layer)
│   │   │   ├── auth/              # Auth.js route handlers ([...nextauth])
│   │   │   └── v1/                # Versioned REST API endpoints
│   │   │       ├── cards/
│   │   │       ├── templates/
│   │   │       ├── assets/
│   │   │       ├── share/
│   │   │       ├── ai/
│   │   │       └── invitations/
│   │   ├── layout.tsx             # Root layout (fonts, providers, metadata)
│   │   ├── globals.css            # Tailwind CSS imports & theme definitions
│   │   └── not-found.tsx          # Custom 404 page (Bengali localized)
│   ├── components/                # Shared Presentation Components
│   │   ├── common/                # Shared application widgets (Headers, Footers)
│   │   └── ui/                    # shadcn/ui primitive components (Button, Dialog, etc.)
│   ├── config/                    # Application Configuration
│   │   ├── site.ts                # App metadata, OpenGraph defaults, brand constants
│   │   └── fonts.ts               # Bengali font definitions & CSS variables
│   ├── features/                  # Domain Feature Modules (Modular Monolith)
│   │   ├── auth/                  # Authentication & Identity domain
│   │   │   ├── components/
│   │   │   ├── schemas/           # Login / Registration Zod schemas
│   │   │   ├── services/          # Session and user profile logic
│   │   │   └── types/
│   │   ├── templates/             # Template catalog & category domain
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── cards/                 # User greeting card lifecycle domain
│   │   │   ├── components/
│   │   │   ├── schemas/           # Card creation, update, canvas JSON schemas
│   │   │   ├── services/          # Card persistence, ownership checks, cloning
│   │   │   └── types/
│   │   ├── editor/                # Fabric.js visual canvas editor domain (Future)
│   │   │   ├── components/        # Canvas viewport, toolbar, layers panel, color picker
│   │   │   ├── hooks/             # useFabric, useCanvasHistory, useFontLoader
│   │   │   ├── lib/               # Fabric serialization, SVG export, filters
│   │   │   └── types/             # Fabric object definitions & event types
│   │   ├── assets/                # Media asset management (Cloudinary integration)
│   │   │   ├── components/
│   │   │   ├── services/          # Signed upload URL generator, asset registry
│   │   │   └── schemas/
│   │   ├── sharing/               # Public share link & export domain
│   │   │   ├── components/
│   │   │   ├── services/          # Token generation, access validation, view counter
│   │   │   └── schemas/
│   │   ├── ai/                    # Gemini AI Bengali greeting generation domain
│   │   │   ├── components/
│   │   │   ├── services/          # Prompt builder, Gemini client, Bengali safety checks
│   │   │   └── schemas/
│   │   └── invitations/           # Digital invitation & RSVP domain
│   │       ├── components/
│   │       ├── services/          # Event scheduling, RSVP submission, analytics
│   │       └── schemas/
│   ├── lib/                       # Foundational Utilities & Infrastructure
│   │   ├── bengali/               # Dedicated Bengali Localization Utilities
│   │   │   ├── numbers.ts         # English ↔ Bengali numeral conversion
│   │   │   ├── typography.ts      # Font loading coordinators, ligature helpers
│   │   │   └── dates.ts           # Bengali calendar & date formatting (Future)
│   │   ├── db/                    # Database Client
│   │   │   └── prisma.ts          # Singleton PrismaClient instance with Neon pooling
│   │   ├── env.ts                 # Strict environment variable validation (Zod)
│   │   ├── errors.ts              # Custom ApplicationError hierarchy & HTTP status mappings
│   │   ├── logger.ts              # Structured JSON logging utility with PII scrubbing
│   │   └── utils.ts               # Common helpers (cn helper for Tailwind merging)
│   └── types/                     # Shared Global TypeScript Type Definitions
│       ├── api.ts                 # Standard API response envelopes
│       └── canvas.ts              # Canonical Utsob Canvas Document specification
├── tests/                         # Automated Test Suites
│   ├── unit/                      # Fast unit tests (Vitest)
│   │   ├── bengali/               # Bengali numeral, text, and ligature tests
│   │   ├── env.test.ts            # Environment validation tests
│   │   ├── errors.test.ts         # Error mapping & envelope tests
│   │   └── logger.test.ts         # Logger & PII masking tests
│   ├── integration/               # API route handler and service integration tests
│   │   └── api/
│   └── e2e/                       # Playwright browser end-to-end tests (Future)
├── .env.example                   # Safe template of required environment variables
├── .eslintrc.json                 # ESLint rules and Next.js plugin config
├── .gitignore                     # Git ignore rules
├── components.json                # shadcn/ui configuration
├── next.config.ts                 # Next.js configuration (strict mode, image domains)
├── package.json                   # Project dependencies and script commands
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration with Bengali theme tokens
├── tsconfig.json                  # Strict TypeScript configuration
└── vitest.config.ts               # Vitest configuration for unit testing
```

---

## 3. Path Aliases & Import Conventions

The TypeScript configuration specifies the `@/*` alias pointing directly to `src/*`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Import Rules:
- **Foundational utilities**: `import { prisma } from "@/lib/db/prisma";`
- **Feature services**: `import { cardService } from "@/features/cards/services/card.service";`
- **UI primitives**: `import { Button } from "@/components/ui/button";`
- **Zod schemas**: `import { createCardSchema } from "@/features/cards/schemas/card.schema";`
- **Bengali helpers**: `import { toBengaliNumeral } from "@/lib/bengali/numbers";`

---

## 4. File Naming Conventions

| Category | Convention | Example |
| :--- | :--- | :--- |
| React Components | PascalCase or kebab-case file, PascalCase export | `button.tsx` (`export function Button`), `CardEditor.tsx` |
| Route Handlers | Lowercase `route.ts` inside App Router path | `src/app/api/v1/cards/route.ts` |
| Services | `{name}.service.ts` | `card.service.ts`, `ai.service.ts` |
| Schemas | `{name}.schema.ts` | `card.schema.ts`, `env.ts` |
| Types | `{name}.types.ts` or `types.ts` | `canvas.ts`, `api.ts` |
| Test Files | `{name}.test.ts` or `{name}.spec.ts` | `numbers.test.ts`, `errors.test.ts` |
