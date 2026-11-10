# UTSOB (উৎসব) — Entity Relationship Diagram (ERD)

> **Document Version:** 1.0.0  
> **Status:** APPROVED (Phase 01)  
> **Engine:** PostgreSQL (Neon)  

---

## 1. Visual Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "authenticates"
    User ||--o{ Card : "owns"
    User ||--o{ Template : "authors"
    User ||--o{ Asset : "uploads"
    User ||--o{ AIGeneration : "prompts"
    User ||--o{ Invitation : "hosts"

    Category ||--o{ Template : "classifies"

    Template ||--o{ Card : "instantiates"

    Card ||--o{ ShareLink : "shares_via"
    Card ||--o| Invitation : "associates_event"

    Invitation ||--o{ RSVP : "receives"

    User {
        string id PK "UUID"
        string name "Display Name"
        string email UK "Unique Normalized"
        datetime emailVerified "Verification Timestamp"
        string image "Avatar URL"
        string role "USER | CREATOR | ADMIN"
        string phoneNumber "Bangladeshi Mobile"
        string locale "bn-BD | en-US"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    Account {
        string id PK "UUID"
        string userId FK "References User(id)"
        string type "oauth | credentials"
        string provider "google | credentials"
        string providerAccountId "OAuth Provider ID"
        string refresh_token "OAuth Token"
        string access_token "OAuth Token"
        int expires_at "Expiration Epoch"
        string token_type "Bearer"
        string scope "OAuth Scope"
        string id_token "JWT ID Token"
        string session_state "Session State"
    }

    Session {
        string id PK "UUID"
        string sessionToken UK "Unique Session Token"
        string userId FK "References User(id)"
        datetime expires "Expiration Timestamp"
    }

    VerificationToken {
        string identifier "Email or Phone"
        string token UK "Unique Token"
        datetime expires "Expiration Timestamp"
    }

    Category {
        string id PK "UUID"
        string slug UK "Unique Slug"
        string nameEn "English Name"
        string nameBn "Bengali Name"
        string descriptionEn "English Description"
        string descriptionBn "Bengali Description"
        string icon "Icon Identifier"
        int sortOrder "Display Ordering"
        boolean isActive "Active Flag"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    Template {
        string id PK "UUID"
        string slug UK "Unique Slug"
        string titleEn "English Title"
        string titleBn "Bengali Title"
        string descriptionEn "English Description"
        string descriptionBn "Bengali Description"
        string thumbnailUrl "Cloudinary URL"
        jsonb canvasJSON "Fabric.js Scene Graph"
        int width "Canvas Width (px)"
        int height "Canvas Height (px)"
        boolean isPremium "Free vs Premium"
        decimal priceBdt "Price in BDT"
        string categoryId FK "References Category(id)"
        string createdById FK "References User(id)"
        string status "DRAFT | PUBLISHED | ARCHIVED"
        int viewCount "Total Views"
        int useCount "Total Uses"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    Card {
        string id PK "UUID"
        string title "Card Title"
        jsonb canvasJSON "Fabric.js Scene Graph"
        string thumbnailUrl "Rendered Preview URL"
        int width "Canvas Width"
        int height "Canvas Height"
        string userId FK "References User(id)"
        string templateId FK "References Template(id)"
        boolean isPublic "Public Discovery"
        string status "ACTIVE | ARCHIVED | DELETED"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    ShareLink {
        string id PK "UUID"
        string cardId FK "References Card(id)"
        string shareToken UK "Unique Share Token"
        string accessType "VIEW_ONLY | CAN_DUPLICATE"
        string passwordHash "Optional Password Hash"
        datetime expiresAt "Optional Expiration"
        int viewCount "Total Views"
        datetime lastAccessedAt "Access Timestamp"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    Asset {
        string id PK "UUID"
        string name "Asset Name"
        string type "IMAGE | STICKER | FONT | BACKGROUND | AUDIO"
        string url "Cloudinary CDN URL"
        string publicId "Cloudinary Public ID"
        string mimeType "MIME Type"
        int width "Pixel Width"
        int height "Pixel Height"
        int sizeBytes "Byte Size"
        string userId FK "References User(id)"
        boolean isSystemAsset "Global Stock Asset"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    AIGeneration {
        string id PK "UUID"
        string userId FK "References User(id)"
        string prompt "Original Prompt"
        string promptBn "Bengali Prompt"
        string generatedText "Generated Bengali Wish"
        string category "EID | BIRTHDAY | WEDDING"
        string tone "FORMAL | AFFECTIONATE | POETIC"
        string modelVersion "gemini-1.5-flash"
        int inputTokens "Input Token Count"
        int outputTokens "Output Token Count"
        datetime createdAt "UTC"
    }

    Invitation {
        string id PK "UUID"
        string cardId UK, FK "References Card(id)"
        string createdById FK "References User(id)"
        string eventTitle "Event Headline"
        datetime eventDate "Event Start Time"
        datetime eventEndDate "Event End Time"
        string venueName "Venue Name"
        string venueAddress "Physical Address"
        string mapUrl "Map Link"
        int maxGuests "Guest Capacity"
        datetime rsvpDeadline "RSVP Cutoff Date"
        string status "DRAFT | PUBLISHED | CANCELLED | COMPLETED"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }

    RSVP {
        string id PK "UUID"
        string invitationId FK "References Invitation(id)"
        string guestName "Guest Name"
        string guestPhone "Guest Phone Number"
        string guestEmail "Guest Email"
        int guestCount "Attending Count"
        string status "ATTENDING | DECLINED | TENTATIVE"
        string responseNote "Guest Message"
        datetime createdAt "UTC"
        datetime updatedAt "UTC"
    }
```

---

## 2. Relational Integrity & Cascade Rules

| Relation | Parent Entity | Child Entity | Foreign Key | On Delete Rule | Business Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| User ➔ Account | User | Account | `userId` | `CASCADE` | Removing a user account must remove all associated authentication identities. |
| User ➔ Session | User | Session | `userId` | `CASCADE` | Sessions must instantly terminate upon user deletion. |
| User ➔ Card | User | Card | `userId` | `CASCADE` | Deleting a user removes all their personal greeting cards. |
| Category ➔ Template | Category | Template | `categoryId` | `RESTRICT` | Cannot delete a category that has active templates assigned to it. |
| Template ➔ Card | Template | Card | `templateId` | `SET NULL` | Deleting a template does not delete customized user cards already created from it. |
| Card ➔ ShareLink | Card | ShareLink | `cardId` | `CASCADE` | Deleting a greeting card immediately destroys all public sharing tokens. |
| Card ➔ Invitation | Card | Invitation | `cardId` | `CASCADE` | An invitation cannot exist without its underlying digital card. |
| Invitation ➔ RSVP | Invitation | RSVP | `invitationId` | `CASCADE` | Deleting an invitation removes all associated guest responses. |

