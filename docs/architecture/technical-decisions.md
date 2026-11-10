# UTSOB (উৎসব) — Architecture Decision Records (ADRs)

> **Document Version:** 1.1.0 (Audited & Remediated)  
> **Status:** APPROVED  
> **Format:** MADR (Markdown Architectural Decision Records)  

---

## Index of Decisions

- [ADR-001: Next.js App Router as Unified Full-Stack Platform](#adr-001-nextjs-app-router-as-unified-full-stack-platform)
- [ADR-002: PostgreSQL (Neon) with Prisma ORM and JSONB for Canvas State](#adr-002-postgresql-neon-with-prisma-orm-and-jsonb-for-canvas-state)
- [ADR-003: Auth.js (v5) with Google OAuth, Database Session Strategy and Prisma Adapter](#adr-003-authjs-v5-with-google-oauth-database-session-strategy-and-prisma-adapter)
- [ADR-004: Fabric.js for 2D Visual Greeting Card & Invitation Canvas](#adr-004-fabricjs-for-2d-visual-greeting-card--invitation-canvas)
- [ADR-005: Bengali Typography Strategy & Multi-Stage WebFont Preloading](#adr-005-bengali-typography-strategy--multi-stage-webfont-preloading)
- [ADR-006: Zod for Multi-Tier Strict Validation (Env, Requests, Canvas)](#adr-006-zod-for-multi-tier-strict-validation-env-requests-canvas)
- [ADR-007: Media Asset Management via Cloudinary Signed Direct Uploads](#adr-007-media-asset-management-via-cloudinary-signed-direct-uploads)
- [ADR-008: Dual Testing Pipeline with Vitest & Playwright](#adr-008-dual-testing-pipeline-with-vitest--playwright)
- [ADR-009: Cryptographic Share Passkey Derivation & Constant-Time Verification](#adr-009-cryptographic-share-passkey-derivation--constant-time-verification)
- [ADR-010: Multi-Vector Canvas JSON Security & DoS Prevention](#adr-010-multi-vector-canvas-json-security--dos-prevention)

---

## ADR-001: Next.js App Router as Unified Full-Stack Platform

### Context
Utsob requires a high-performance web application supporting fast public card sharing, SEO-optimized template discovery, authenticated user dashboard management, and a rich interactive client-side card editor. The team must choose between a decoupled architecture (Separate React SPA + Express.js/Nest.js API server) and a unified Next.js App Router Modular Monolith.

### Decision
Adopt **Next.js App Router (Modular Monolith)** deployed on **Vercel**. All backend endpoints are implemented as Next.js Route Handlers (`src/app/api/v1/*`).

### Consequences
- **Positive**:
  - Zero API deployment drift; shared TypeScript models, schemas, and types between front-end and back-end.
  - Server Components (RSC) enable instant streaming and SEO rendering of public cards and template catalogs without client-side waterfalls.
  - Reduced operational complexity and zero cross-origin resource sharing (CORS) overhead for native routes.
  - Native Vercel Edge integration for dynamic social preview card image generation (`@vercel/og`).
- **Negative / Trade-offs**:
  - Long-running background processes (e.g., bulk video rendering or PDF generation) cannot run inside standard serverless timeout windows; they must be offloaded to asynchronous background jobs or edge endpoints.
  - Strict discipline is required to maintain architectural modularity in `src/features/` to prevent monolithic coupling.

---

## ADR-002: PostgreSQL (Neon) with Prisma ORM and JSONB for Canvas State

### Context
Greeting cards and invitations require structured relational data (users, categories, subscriptions, RSVPs, permissions) alongside semi-structured, highly dynamic 2D canvas scene graphs (Fabric.js layers, text objects, transformation matrices, and style trees). We evaluated MongoDB, pure relational normalization (tables for every canvas layer/object), and PostgreSQL with JSONB.

### Decision
Use **PostgreSQL on Neon Serverless** with **Prisma ORM**. Normalized tables represent identity, billing, templates, cards, and invitations. The visual scene graph is stored in a dedicated `canvasJSON` column of type `Json` (`JSONB` in PostgreSQL).

### Consequences
- **Positive**:
  - ACID transactions across relational boundaries (e.g., creating an invitation and generating a card share link).
  - High read/write throughput for canvas persistence without schema migrations whenever Fabric.js object attributes change.
  - PostgreSQL GIN indexes on `canvasJSON` allow querying specific canvas attributes (e.g., fonts used, template version) if needed.
  - Neon connection pooling (PgBouncer) avoids connection exhaustion in serverless environments.
- **Negative / Trade-offs**:
  - Unstructured JSON requires strict application-level validation via Zod before database persistence to prevent schema corruption.

---

## ADR-003: Auth.js (v5) with Google OAuth, Database Session Strategy and Prisma Adapter

### Context
Utsob requires secure, low-friction authentication for Bangladeshi creators, casual users, and event hosts. In evaluating Auth.js (v5) integration with Prisma Adapter, an official architectural constraint was identified: **Auth.js Credentials Provider fundamentally requires JWT sessions (`strategy: "jwt"`) and is strictly incompatible with the Database Session strategy (`strategy: "database"`)**. Attempting to combine Credentials Provider with Prisma Adapter database sessions results in unpersisted sessions, configuration errors, or silent auth failures.

### Decision
Standardize the **Initial MVP exclusively on Google OAuth (OIDC)** using **`@auth/prisma-adapter`** with **Database Sessions (`strategy: "database"`)**:
1. **Google OAuth Only for MVP**: Leverages Google as the primary identity provider in Bangladesh (driven by high Android and Gmail penetration).
2. **Database Session Persistence**: Every active session is stored in the PostgreSQL `Session` table, providing immediate server-side session revocation.
3. **No Credentials Provider in MVP**: Email/Password credentials are explicitly excluded from the initial release, eliminating password storage risks, credential stuffing vectors, and session strategy conflicts. If email/password authentication is revisited in future phases, it must use a separately architected JWT strategy or a dedicated passwordless magic link mechanism.

### Consequences
- **Positive**:
  - Full compatibility with Auth.js v5 and `@auth/prisma-adapter` with zero session mismatch anomalies.
  - 100% database session ownership with immediate session revocation upon security events.
  - Simplified onboarding for Bangladeshi users via one-click Google login.
  - Zero password storage, hashing overhead, or credential leak risks.
- **Negative / Trade-offs**:
  - Users without Google accounts cannot log in during the initial MVP. Mitigated by future evaluation of Magic Links or phone OTP.

---

## ADR-004: Fabric.js for 2D Visual Greeting Card & Invitation Canvas

### Context
The visual editor requires a robust 2D object manipulation engine capable of handling image transformation, multi-layer stacking, curved text, clipping masks, Bengali font rendering, and raster/vector export. Alternatives considered: Konva.js / React-Konva, custom HTML5 Canvas context, and SVG DOM manipulation.

### Decision
Adopt **Fabric.js (v6 / latest stable)** as the visual editor rendering engine.

### Consequences
- **Positive**:
  - Mature object model with built-in selection, rotation, scaling, grouping, and z-index ordering.
  - Native JSON serialization/deserialization matching our PostgreSQL `JSONB` schema.
  - High-performance vector-to-raster export (`toDataURL`, `toBlob`, SVG parser).
  - Robust active community and enterprise adoption in web graphic editors.
- **Negative / Trade-offs**:
  - Fabric.js manipulates the HTML5 Canvas imperatively; requires careful React lifecycle synchronization (`useRef`, `useEffect`) and must only run on the client (`next/dynamic` with `ssr: false`).
  - Text rendering depends strictly on browser font loading state.

---

## ADR-005: Bengali Typography Strategy & Multi-Stage WebFont Preloading

### Context
Bengali script relies on complex conjuncts (যুক্তবর্ণ), vowel diacritics (কার), and ligature substitutions. When HTML5 Canvas renders text before web fonts are fully loaded, glyphs fall back to system fonts, causing layout shifts, missing conjuncts, and broken exported images.

### Decision
Implement a **Multi-Stage WebFont Preloader** utilizing the native browser `FontFace` API and `document.fonts.ready`:
1. Preload key Bengali fonts in WOFF2 format via `next/font/google` and public font manifests.
2. Maintain a whitelist of approved Bengali typefaces:
   - **Hind Siliguri** (Default clean UI and body text)
   - **Noto Serif Bengali** (Traditional, formal wedding & literature)
   - **Anek Bangla** (Modern geometric display for headlines)
   - **Tiro Bangla** (Refined poetic and literary serif)
   - **Galada** (Festive calligraphic display)
3. Gate all Fabric.js canvas text additions and export routines behind an explicit font readiness check (`document.fonts.load(fontSpec)`).

### Consequences
- **Positive**:
  - Zero broken ligatures or misplaced vowel marks in exported cards and preview thumbnails.
  - Deterministic canvas measurements across different operating systems (Windows, macOS, Android, iOS).
- **Negative / Trade-offs**:
  - Introduces slight font-loading latency on first edit on slow mobile connections in rural Bangladesh. Mitigated by caching WOFF2 assets locally.

---

## ADR-006: Zod for Multi-Tier Strict Validation (Env, Requests, Canvas)

### Context
Input validation must be foolproof across environment configuration, API route request bodies, and canvas JSON serialization. We evaluated Joi, Yup, TypeBox, and Zod.

### Decision
Standardize exclusively on **Zod** for all validation tiers across the entire application:
1. **Environment Variables**: Validated at build and runtime via `src/lib/env.ts`.
2. **HTTP Transports**: Request DTOs and query parameters validated inside route handlers.
3. **Canvas State**: Strict schema validating canvas dimensions, object types, and disallowing dangerous attributes before persisting to PostgreSQL.

### Consequences
- **Positive**:
  - Single validation library across client and server.
  - Automatic TypeScript type inference (`z.infer<typeof schema>`).
  - Safe parsing (`safeParse`) yields structured validation errors for user-friendly Bengali error messages.

---

## ADR-007: Media Asset Management via Cloudinary Signed Direct Uploads

### Context
Utsob users will upload personal photos for greeting cards, and templates will use stickers, floral borders, and cultural motifs. Serving and transforming images from our serverless functions would cause excessive bandwidth costs and memory limits.

### Decision
Utilize **Cloudinary** with **Server-Side Signed Direct Uploads**:
1. Client requests a cryptographic upload signature from a dedicated Next.js Route Handler (`/api/v1/assets/sign-upload`).
2. The client uploads the asset directly to Cloudinary over HTTPS.
3. Next.js server validates asset metadata and records the public ID, URL, and dimensions in the PostgreSQL `Asset` table.

### Consequences
- **Positive**:
  - Zero file payload passes through Next.js serverless functions, keeping memory low and avoiding request size limits.
  - Dynamic on-the-fly image transformations, auto-format (AVIF/WebP), and smart responsive cropping.
  - Global CDN delivery with low latency for mobile users in Bangladesh.
- **Negative / Trade-offs**:
  - External dependency on Cloudinary service availability and tier quotas.

---

## ADR-008: Dual Testing Pipeline with Vitest & Playwright

### Context
The project requires rapid feedback for unit/integration logic and robust end-to-end verification of browser canvas rendering, font rendering, and user journeys.

### Decision
Adopt **Vitest** for unit and integration testing, and **Playwright** for end-to-end browser testing.

### Consequences
- **Positive**:
  - Vitest provides native ESM and TypeScript support with near-instant execution speed and Jest-compatible assertions.
  - Playwright allows cross-browser testing (Chromium, Firefox, WebKit) on real rendering engines to verify Bengali typography and canvas pixel accuracy.
  - Clean separation: unit tests run on every git commit; Playwright runs on PR merges and release pipelines.

---

## ADR-009: Cryptographic Share Passkey Derivation & Constant-Time Verification

### Context
Card creators can protect private cards (e.g. personal family invitations) with an optional passkey. If passkeys are stored in plaintext or compared using standard equality operators (`===`), the platform is vulnerable to credential theft and timing side-channel attacks.

### Decision
Use **Node.js Native `crypto.scryptSync` with random 16-byte salts** for key derivation and **`crypto.timingSafeEqual`** for verification:
1. Passkeys are never stored in plaintext. They are derived using `scrypt` (N=16384, r=8, p=1).
2. Verification uses byte-level constant-time comparison (`timingSafeEqual`) to eliminate timing variance attacks.
3. Public share tokens are generated using `crypto.randomBytes(16).toString("base64url")`, providing 128 bits of cryptographic entropy.

### Consequences
- **Positive**:
  - Zero third-party dependency overhead (native `node:crypto`).
  - Resistance to GPU/ASIC rainbow table attacks via memory-hard `scrypt` hashing.
  - Immunity to timing side-channel attacks.

---

## ADR-010: Multi-Vector Canvas JSON Security & DoS Prevention

### Context
Fabric.js canvas scene graphs represent complex multi-layered objects in JSON. Untrusted canvas JSON could carry stored XSS payloads, SVG script injections, prototype pollution attempts, SSRF image links (targeting cloud metadata services or internal networks), or memory exhaustion bombs (thousands of objects or deeply nested group trees).

### Decision
Implement a **Multi-Vector Hardened Canvas Zod Schema** (`canvasDocumentSchema`):
1. **Object Whitelist & Strict Schema**: Only approved Fabric.js types allowed; `.strict()` rejects unknown properties (blocking prototype pollution via `__proto__` or `constructor`).
2. **SSRF & Scheme Restriction**: Image URLs must strictly use `https:` and are validated against internal IP ranges (`localhost`, `127.0.0.1`, `169.254.*`, `10.*`, `192.168.*`, `172.16-31.*`). Data URIs and unencrypted HTTP are rejected.
3. **SVG Path Validation**: Path commands are strictly restricted to standard SVG syntax (`MmLlHhVvCcSsQqTtAaZz0-9\s,.-+`), rejecting XML/HTML `<script>` tags.
4. **CSS Expression Blocking**: Color properties (`fill`, `stroke`, `backgroundColor`) forbid `url()`, `expression()`, `<` and `>`.
5. **DoS & Recursion Caps**: Enforce maximum 200 objects per canvas, max 50 objects per group, max 2,000 characters per text object, and strictly disallow nested groups.

### Consequences
- **Positive**:
  - Eliminates stored XSS, SSRF, prototype pollution, and canvas recursion DoS.
  - Zero runtime impact during rendering.
