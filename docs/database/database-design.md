# UTSOB (উৎসব) — Database Design Specification

> **Document Version:** 1.1.0 (Audited & Remediated)  
> **Status:** APPROVED  
> **Target Database Engine:** PostgreSQL 16+ on Neon Serverless  
> **ORM:** Prisma ORM  

---

## 1. Overview & Architectural Principles

The Utsob database is designed as a normalized, relational data store with optimized semi-structured `JSONB` support for complex 2D canvas scene graphs. It is hosted on **Neon Serverless PostgreSQL** to take advantage of compute auto-scaling, branching for testing, and integrated connection pooling via PgBouncer.

### Design Principles:
1. **Universally Unique Identifiers (UUID v4)**: All primary keys use `String @id @default(uuid())`, avoiding sequential integer enumeration attacks on sensitive cards and invitations.
2. **Auth.js Compatibility with Database Sessions**: Identity tables (`User`, `Account`, `Session`, `VerificationToken`) adhere to the standard `@auth/prisma-adapter` specification. In accordance with Auth.js architecture, **Database Sessions (`strategy: "database"`)** are used with **Google OAuth**, and Credentials Provider is explicitly excluded from the MVP.
3. **Optimized Multi-Layer Canvas Storage**: The visual representation of greeting cards and templates is stored in a PostgreSQL `JSONB` column (`canvasJSON`), validated via strict Zod schemas before storage.
4. **Ownership & Access Separation**: Clear boundary between private creator resources and public consumer views. Deletions cascade cleanly without leaving orphaned links or media records.
5. **Audit Timestamps**: All business entities include `createdAt` and `updatedAt` timestamps with automated timezone-aware UTC handling.

---

## 2. Entity Dictionary & Detailed Schema Specifications

### 2.1 Identity & Authentication Domain

#### `User`
Represents an authenticated platform user, creator, or administrator.
- `id`: `String` (UUID PK).
- `name`: `String?` (Full display name in English or Bengali).
- `email`: `String?` (Unique, lowercase normalized).
- `emailVerified`: `DateTime?` (Timestamp when email was confirmed).
- `image`: `String?` (Profile avatar URL from Google OAuth).
- `role`: `UserRole` (Enum: `USER`, `CREATOR`, `ADMIN`; default `USER`).
- `phoneNumber`: `String?` (Bangladeshi mobile number, e.g., `+8801XXXXXXXXX`).
- `locale`: `String` (Default `bn-BD`; supports `en-US`).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Relations**: Accounts (1:N), Sessions (1:N), Cards (1:N), Templates (1:N), Assets (1:N), AIGenerations (1:N), Invitations (1:N).

#### `Account`
Stores OAuth provider linkages (Google OIDC) per Auth.js specification.
- `id`: `String` (UUID PK).
- `userId`: `String` (FK -> `User.id`, `onDelete: Cascade`).
- `type`: `String` (e.g., `oauth`, `oidc`).
- `provider`: `String` (e.g., `google`).
- `providerAccountId`: `String` (Unique subject ID from Google).
- `refresh_token`: `String?` (`@db.Text`).
- `access_token`: `String?` (`@db.Text`).
- `expires_at`: `Int?`.
- `token_type`: `String?`.
- `scope`: `String?`.
- `id_token`: `String?` (`@db.Text`).
- `session_state`: `String?`.
- **Unique Constraint**: `@@unique([provider, providerAccountId])`.
- **Index**: `@@index([userId])`.

#### `Session`
Stores active authenticated web sessions per Auth.js database session specification.
- `id`: `String` (UUID PK).
- `sessionToken`: `String` (Unique session cookie token).
- `userId`: `String` (FK -> `User.id`, `onDelete: Cascade`).
- `expires`: `DateTime` (Session expiration timestamp).
- **Index**: `@@index([userId])`.

#### `VerificationToken`
Stores magic link tokens and email verification hashes.
- `identifier`: `String` (Email or phone).
- `token`: `String` (Unique cryptographically secure token).
- `expires`: `DateTime`.
- **Unique Constraint**: `@@unique([identifier, token])`.

---

### 2.2 Template & Catalog Domain

#### `Category`
Hierarchical taxonomy for cultural events, festivals, and celebrations.
- `id`: `String` (UUID PK).
- `slug`: `String` (Unique, URL-safe slug, e.g., `pohela-boishakh`, `eid-ul-fitr`).
- `nameEn`: `String` (English name, e.g., "Pohela Boishakh").
- `nameBn`: `String` (Bengali name, e.g., "পহেলা বৈশাখ").
- `descriptionEn`: `String?` (`@db.Text`).
- `descriptionBn`: `String?` (`@db.Text`).
- `icon`: `String?` (SVG icon identifier or URL).
- `sortOrder`: `Int` (Default `0`).
- `isActive`: `Boolean` (Default `true`).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Index**: `@@index([slug])`, `@@index([isActive, sortOrder])`.

#### `Template`
Master curated greeting card designs available for users to customize.
- `id`: `String` (UUID PK).
- `slug`: `String` (Unique, e.g., `boishakhi-shuvo-noboborsho-alpona`).
- `titleEn`: `String` (e.g., "Traditional Boishakh Alpona").
- `titleBn`: `String` (e.g., "ঐতিহ্যবাহী বৈশাখী আলপনা").
- `descriptionEn`: `String?` (`@db.Text`).
- `descriptionBn`: `String?` (`@db.Text`).
- `thumbnailUrl`: `String` (Cloudinary optimized preview URL).
- `canvasJSON`: `Json` (`JSONB` Fabric.js document tree).
- `width`: `Int` (Base canvas pixel width, e.g., `1080`).
- `height`: `Int` (Base canvas pixel height, e.g., `1920` for stories or `1080` for square).
- `isPremium`: `Boolean` (Default `false`).
- `priceBdt`: `Decimal?` (Price in BDT if premium, `@db.Decimal(10, 2)`).
- `categoryId`: `String` (FK -> `Category.id`, `onDelete: Restrict`).
- `createdById`: `String?` (FK -> `User.id` for creator templates, `onDelete: SetNull`).
- `status`: `TemplateStatus` (Enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`; default `DRAFT`).
- `viewCount`: `Int` (Default `0`).
- `useCount`: `Int` (Default `0`).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Indexes**: `@@index([categoryId, status])`, `@@index([isPremium])`, `@@index([slug])`.

---

### 2.3 User Creations & Sharing Domain

#### `Card`
A customized greeting card instance created and owned by a user.
- `id`: `String` (UUID PK).
- `title`: `String` (User-defined title or inherited template title).
- `canvasJSON`: `Json` (`JSONB` current serialized Fabric.js canvas state).
- `thumbnailUrl`: `String?` (Generated preview image URL).
- `width`: `Int` (Canvas pixel width).
- `height`: `Int` (Canvas pixel height).
- `userId`: `String` (FK -> `User.id`, `onDelete: Cascade`).
- `templateId`: `String?` (FK -> `Template.id`, `onDelete: SetNull`).
- `isPublic`: `Boolean` (Default `false`; whether discoverable in community feed).
- `status`: `CardStatus` (Enum: `ACTIVE`, `ARCHIVED`, `DELETED`; default `ACTIVE`).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Indexes**: `@@index([userId, status])`, `@@index([templateId])`.

#### `ShareLink`
Secure public or restricted access link for sharing rendered cards and digital greetings.
- `id`: `String` (UUID PK).
- `cardId`: `String` (FK -> `Card.id`, `onDelete: Cascade`).
- `shareToken`: `String` (Unique, 128-bit cryptographically secure URL-safe token).
- `accessType`: `ShareAccessType` (Enum: `VIEW_ONLY`, `CAN_DUPLICATE`; default `VIEW_ONLY`).
- `passwordHash`: `String?` (Optional salted scrypt hash for private family cards).
- `expiresAt`: `DateTime?` (Optional expiration time).
- `viewCount`: `Int` (Default `0`).
- `lastAccessedAt`: `DateTime?`.
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Unique Constraint**: `@@unique([shareToken])`.
- **Index**: `@@index([cardId])`.

---

### 2.4 Media & AI Domain

#### `Asset`
Uploaded user photos, stock graphics, decorative stickers, and fonts.
- `id`: `String` (UUID PK).
- `name`: `String` (Original filename or label).
- `type`: `AssetType` (Enum: `IMAGE`, `STICKER`, `FONT`, `BACKGROUND`, `AUDIO`; default `IMAGE`).
- `url`: `String` (Secure CDN URL).
- `publicId`: `String` (Cloudinary public ID for asset management).
- `mimeType`: `String` (e.g., `image/webp`, `font/woff2`).
- `width`: `Int?` (Image pixel width).
- `height`: `Int?` (Image pixel height).
- `sizeBytes`: `Int` (File size in bytes).
- `userId`: `String?` (FK -> `User.id`, `onDelete: Cascade`; null for global system assets).
- `isSystemAsset`: `Boolean` (Default `false`; accessible to all users).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Indexes**: `@@index([userId, type])`, `@@index([isSystemAsset, type])`.

#### `AIGeneration`
Audit and history record of AI-assisted Bengali wish and poem completions.
- `id`: `String` (UUID PK).
- `userId`: `String` (FK -> `User.id`, `onDelete: Cascade`).
- `prompt`: `String` (`@db.Text`; user prompt).
- `promptBn`: `String?` (`@db.Text`; Bengali translated prompt if English input).
- `generatedText`: `String` (`@db.Text`; Gemini response in Bengali).
- `category`: `String` (e.g., `EID`, `BIRTHDAY`, `WEDDING`, `POETRY`).
- `tone`: `String` (e.g., `FORMAL`, `AFFECTIONATE`, `HUMOROUS`, `RHYMING`).
- `modelVersion`: `String` (e.g., `gemini-1.5-flash`).
- `inputTokens`: `Int?`.
- `outputTokens`: `Int?`.
- `createdAt`: `DateTime` (Default `now()`).
- **Privacy & Retention**: Deleting a User account cascades to delete all their `AIGeneration` records. Recommended 90-day retention pruning.
- **Index**: `@@index([userId, createdAt])`.

---

### 2.5 Digital Invitation & RSVP Domain (Schema Prepared)

#### `Invitation`
An event invitation linked to a designed digital card.
- `id`: `String` (UUID PK).
- `cardId`: `String` (FK -> `Card.id`, `onDelete: Cascade`, Unique: 1:1 with card).
- `createdById`: `String` (FK -> `User.id`, `onDelete: Cascade`).
- `eventTitle`: `String` (e.g., "তানভীর ও সুমাইয়ার বিয়ে").
- `eventDate`: `DateTime` (Event start date and time).
- `eventEndDate`: `DateTime?` (Optional end time).
- `venueName`: `String` (e.g., "Senakunja, Dhaka").
- `venueAddress`: `String` (`@db.Text`).
- `mapUrl`: `String?` (Google Maps link).
- `maxGuests`: `Int?` (Total capacity limit).
- `rsvpDeadline`: `DateTime?` (RSVP response cutoff).
- `status`: `InvitationStatus` (Enum: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`; default `DRAFT`).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Indexes**: `@@index([createdById])`, `@@index([eventDate])`.

#### `RSVP`
Guest attendance response to an invitation.
- `id`: `String` (UUID PK).
- `invitationId`: `String` (FK -> `Invitation.id`, `onDelete: Cascade`).
- `guestName`: `String` (Full name of respondent).
- `guestPhone`: `String` (Bangladeshi phone number for verification).
- `guestEmail`: `String?`.
- `guestCount`: `Int` (Number of attending persons, default `1`).
- `status`: `RSVPStatus` (Enum: `ATTENDING`, `DECLINED`, `TENTATIVE`; default `ATTENDING`).
- `responseNote`: `String?` (`@db.Text`; dietary preferences or congratulatory note).
- `createdAt`: `DateTime` (Default `now()`).
- `updatedAt`: `DateTime` (Updated automatically).
- **Unique Constraint**: `@@unique([invitationId, guestPhone])`.
- **Index**: `@@index([invitationId, status])`.

---

## 3. PostgreSQL JSONB Canvas Document Specification

The `canvasJSON` field adheres to the following canonical TypeScript structure:

```typescript
export interface CanvasDocument {
  version: "1.0.0";
  dimensions: {
    width: number;       // min 100, max 4000
    height: number;      // min 100, max 4000
    unit: "px";
  };
  backgroundColor: string; // Sanitized hex/rgb/rgba (no url(), expression())
  backgroundImage?: {
    src: string;         // Strict HTTPS URL (no SSRF / private IPs)
    opacity: number;
  };
  fontsUsed: string[];   // Pre-parsed list of font families needed (max 20)
  objects: CanvasObject[]; // Maximum 200 objects (no nested groups)
}
```

---

## 4. Connection Pooling & Database Strategy for Neon

- **Prisma Client Setup**: Neon provides a pooled connection string via PgBouncer for transactional queries and a direct unpooled connection string for migrations and DDL operations.
- **Environment Separation**:
  - `DATABASE_URL`: Set to Neon pooled connection (`postgres://...pooler.neon.tech/utsob?sslmode=require&pgbouncer=true`).
  - `DIRECT_URL`: Set to Neon direct connection without PgBouncer for Prisma CLI operations (`prisma migrate dev`).
- **Connection Management**: Instantiated as a single global instance via `src/lib/db/prisma.ts` to prevent multiple connection pools during Next.js Hot Module Replacement (HMR).

---

## 5. Migration History & Live Database Status

- **Prisma Schema Validation**: Validated via `npx prisma validate` (100% compliant).
- **Prisma Client Generation**: Generated via `npx prisma generate` (Client v6.19.3).
- **Migration History Initialization**: Pending live Neon PostgreSQL credentials from the Product Owner in `.env.local`. The migration directory `prisma/migrations` will be created when `npx prisma migrate dev --name init` is executed against an active database.
