# UTSOB (উৎসব) — Phase 01 Acceptance Criteria & Verification Matrix

> **Document Version:** 1.0.0  
> **Status:** APPROVED (Phase 01)  
> **Evaluation Mode:** Mandatory Quality Gate  

---

## 1. Acceptance Criteria Checklist

### Part A — Architecture Planning & Documentation

| Item ID | Requirement Description | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **DOC-01** | `docs/architecture/system-architecture.md` created with C4 diagram, domain boundaries, and component roles | Architectural Review | **COMPLETE** |
| **DOC-02** | `docs/architecture/folder-structure.md` created establishing Modular Monolith layout | Architectural Review | **COMPLETE** |
| **DOC-03** | `docs/architecture/technical-decisions.md` created with 8 detailed ADRs | Architectural Review | **COMPLETE** |
| **DOC-04** | `docs/architecture/development-roadmap.md` covering Phase 01 to Phase 10 | Architectural Review | **COMPLETE** |
| **DOC-05** | `docs/database/database-design.md` covering all 12 entities, indexes, and Neon pooling | Database Architecture Review | **COMPLETE** |
| **DOC-06** | `docs/database/erd.md` created with Mermaid diagram and cascade deletion rules | Schema Review | **COMPLETE** |
| **DOC-07** | `docs/api/api-conventions.md` defining standard envelopes, error codes, and routes | API Review | **COMPLETE** |
| **DOC-08** | `docs/security/security-architecture.md` detailing BOLA, canvas JSON sanitization, and PII masking | Security Review | **COMPLETE** |
| **DOC-09** | `docs/testing/testing-strategy.md` outlining Vitest, Playwright, and localization testing | QA Review | **COMPLETE** |
| **DOC-10** | `docs/architecture/phase-01-acceptance-criteria.md` establishing verification gates | Product Owner Review | **COMPLETE** |

---

### Part B — Project Foundation & Engineering Toolchain

| Item ID | Requirement Description | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **CODE-01** | Next.js App Router initialized with strict TypeScript configuration | `tsconfig.json` & Next.js config | **READY FOR IMPLEMENTATION** |
| **CODE-02** | Tailwind CSS installed and configured with custom Bengali cultural color tokens | `tailwind.config.ts` | **READY FOR IMPLEMENTATION** |
| **CODE-03** | `shadcn/ui` tooling configured with `components.json` | `components.json` validation | **READY FOR IMPLEMENTATION** |
| **CODE-04** | ESLint configured with Next.js and TypeScript plugins | `npm run lint` | **READY FOR IMPLEMENTATION** |
| **CODE-05** | Modular folder structure created matching `docs/architecture/folder-structure.md` | Filesystem inspection | **READY FOR IMPLEMENTATION** |
| **CODE-06** | Prisma initialized with PostgreSQL schema containing all 12 entities | `npx prisma validate` | **READY FOR IMPLEMENTATION** |
| **CODE-07** | Prisma client generated successfully | `npx prisma generate` | **READY FOR IMPLEMENTATION** |
| **CODE-08** | Strict Zod environment variable validation (`src/lib/env.ts`) | Unit tests (`env.test.ts`) | **READY FOR IMPLEMENTATION** |
| **CODE-09** | Safe `.env.example` created with zero production secrets | File inspection | **READY FOR IMPLEMENTATION** |
| **CODE-10** | Standardized error classes and API response envelopes (`src/lib/errors.ts`) | Unit tests (`errors.test.ts`) | **READY FOR IMPLEMENTATION** |
| **CODE-11** | Structured JSON logger with automated PII redaction (`src/lib/logger.ts`) | Unit tests (`logger.test.ts`) | **READY FOR IMPLEMENTATION** |
| **CODE-12** | Bengali numeral converter & typography manifests (`src/lib/bengali/*`) | Unit tests (`numbers.test.ts`) | **READY FOR IMPLEMENTATION** |
| **CODE-13** | Vitest test runner configured and executing all test suites | `npm test` passing | **READY FOR IMPLEMENTATION** |
| **CODE-14** | Production Next.js build passes cleanly without compilation or type errors | `npm run build` | **READY FOR IMPLEMENTATION** |
| **CODE-15** | Comprehensive README.md created with developer setup instructions | File inspection | **READY FOR IMPLEMENTATION** |

---

### Part C — Boundary Enforcement & Out-of-Scope Checks

| Item ID | Scope Boundary Rule | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **SCOPE-01**| No fake greeting templates, card editor, AI generation, or payment logic built | Codebase inspection | **ENFORCED** |
| **SCOPE-02**| No placeholder dashboard UI or dummy product mockups created | Route inspection | **ENFORCED** |
| **SCOPE-03**| No MongoDB, Express server, or unapproved microservices introduced | Architecture inspection | **ENFORCED** |
| **SCOPE-04**| Phase 02 has not been started | Phase gate verification | **ENFORCED** |
