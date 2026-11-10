# UTSOB (উৎসব) — API Design & Conventions Specification

> **Document Version:** 1.0.0  
> **Status:** APPROVED (Phase 01)  
> **Base URL Path:** `/api/v1`  
> **Transport:** HTTPS / JSON  

---

## 1. Architectural Philosophy

All API interactions within Utsob are served via Next.js Route Handlers (`src/app/api/v1/*`). The API adheres to strict RESTful design principles, predictable JSON envelope contracts, and type-safe Zod validation.

---

## 2. Standardized Response Envelopes

Every API endpoint must respond with one of the two standard envelope structures. Ad-hoc raw JSON or divergent shapes are strictly disallowed.

### 2.1 Success Envelope

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNextPage?: boolean;
    nextCursor?: string | null;
    timestamp?: string; // ISO 8601 UTC
  };
}
```

#### Example 200 OK:
```json
{
  "success": true,
  "data": {
    "id": "e4a2c56b-8b21-4f51-9e73-b26a57008cf1",
    "title": "শুভ নববর্ষ শুভেচ্ছা কার্ড",
    "status": "ACTIVE"
  },
  "meta": {
    "timestamp": "2026-11-10T08:00:00.000Z"
  }
}
```

---

### 2.2 Error Envelope

```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable uppercase snake_case identifier
    message: string;        // Human-readable summary (in English or localized Bengali)
    details?: unknown;      // Structured field validation issues or debugging metadata
    timestamp: string;      // ISO 8601 UTC
  };
}
```

#### Example 400 Bad Request (Validation Failure):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters"
      }
    ],
    "timestamp": "2026-11-10T08:00:00.000Z"
  }
}
```

---

## 3. Standard HTTP Status Codes

| HTTP Status | Condition | Example Usage |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded with data payload | Fetching a card, template list, or profile |
| `201 Created` | New resource successfully created | Card created, invitation created |
| `204 No Content` | Mutation succeeded with no response body | Card deleted, share link revoked |
| `400 Bad Request` | Malformed JSON or invalid syntax | Broken JSON body |
| `401 Unauthorized` | Missing, expired, or invalid session | User not logged in |
| `402 Payment Required` | Premium template accessed without license | Unlocking premium designer asset |
| `403 Forbidden` | Authenticated but lacks ownership/permission | Editing another user's card |
| `404 Not Found` | Resource does not exist | Card or share token does not exist |
| `409 Conflict` | Unique constraint collision | Category slug already exists |
| `422 Unprocessable` | Zod schema validation failed on inputs | Required fields missing, invalid dimensions |
| `429 Too Many Requests`| Rate limit exceeded | Excessive AI prompt requests |
| `500 Server Error` | Unhandled runtime exception | Database connection timeout |

---

## 4. Standard Error Codes Catalog

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | User must authenticate before accessing resource |
| `SESSION_EXPIRED` | 401 | Authenticated session has expired |
| `FORBIDDEN` | 403 | User does not own the requested resource |
| `RESOURCE_NOT_FOUND` | 404 | The requested entity was not found |
| `VALIDATION_ERROR` | 422 | Input fails Zod schema validation rules |
| `DUPLICATE_RESOURCE` | 409 | Unique constraint violated |
| `CANVAS_CORRUPTED` | 422 | Stored or submitted canvasJSON failed schema checks |
| `RATE_LIMITED` | 429 | Rate limit window exceeded |
| `AI_GENERATION_FAILED`| 502 | Gemini API error or safety block |
| `INTERNAL_SERVER_ERROR`| 500 | Uncaught server exception |

---

## 5. Security & Boundary Conventions

1. **Authentication Boundary**:
   - Protected routes extract the session server-side using Auth.js `auth()` helper.
   - Never accept `userId` as an untrusted input parameter from the client body or query string.

2. **Server-Side Ownership Enforcement**:
   - All update and delete database queries must strictly include `userId` in the `where` clause:
     ```typescript
     await prisma.card.findFirstOrThrow({
       where: { id: cardId, userId: session.user.id }
     });
     ```

3. **Public Share Endpoints**:
   - Route `/api/v1/share/[token]` allows unauthenticated access.
   - It **strictly projects** only public attributes (`id`, `title`, `canvasJSON`, `width`, `height`, `thumbnailUrl`). It **never** leaks `userId`, creator emails, or edit histories.

4. **Pagination**:
   - Standard queries support `?page=1&limit=20` (max limit: 100).
   - High-throughput listing (e.g. templates) uses cursor-based pagination `?cursor={id}&limit=20`.
