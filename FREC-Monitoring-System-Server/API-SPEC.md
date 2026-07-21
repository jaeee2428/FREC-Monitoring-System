# CertTrack API Specification

This document defines the HTTP endpoints for the CertTrack backend API.
It is intended for frontend developers connecting the React client to the Express server,
and for backend developers (James, Jaena, Venice) implementing the database and auth logic.

> **Implementation status:** Route files contain placeholder stubs with TODOs.
> The database (Prisma + PostgreSQL) is set up and seeded. See `README.md` for setup.
> Actual DB queries and auth middleware have not been wired in yet.

> For a high-level overview of roles, certification modes, and the workflow, see the root [`README.md`](../README.md).

---

## Base URL

```
http://localhost:5000/api
```

> **Note:** macOS may use port 5000 for AirPlay Receiver. If the server fails to start with `EADDRINUSE`, set `PORT=5001` in your `.env` file and use `http://localhost:5001/api`.

---

## Authentication

All private endpoints require a `Bearer` JWT token in the `Authorization` header.
The token is obtained from `POST /api/auth/google`.

```
Authorization: Bearer <jwt_token>
```

> **TODO (Jaena — PBI-148):** Implement JWT verification middleware and attach `req.user` to all protected routes.

---

## Health Check

### `GET /api/health`

Checks that the server is running.

- **Access:** Public
- **Response `200`:**
```json
{ "status": "ok", "message": "CertTrack API is running." }
```

---

## Auth Routes

### `POST /api/auth/google`

Verifies a Google OAuth ID token, checks that the user's email is whitelisted, and returns a signed JWT.

- **Access:** Public
- **Request Body:**
```json
{ "token": "google_id_token_string" }
```
- **Response `200`:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "google_uid",
    "name": "Maria Santos",
    "email": "m.santos@university.edu.ph",
    "role": "Student",
    "program": "BS Computer Science"
  }
}
```
- **Response `403`** — Account not whitelisted:
```json
{ "error": "Account is not whitelisted to access the portal." }
```
- **Response `401`** — Invalid token:
```json
{ "error": "Invalid or expired Google token." }
```

---

## User Routes

> **Role required:** IT Admin only

### `GET /api/users`

Returns a list of all registered user accounts. Used by IT Admin to audit accounts.

- **Access:** Private — IT Admin
- **Response `200`:**
```json
{
  "users": [
    {
      "id": "google_uid",
      "name": "Maria Santos",
      "email": "m.santos@university.edu.ph",
      "role": "Student",
      "program": "BS Computer Science",
      "whitelisted": true
    }
  ]
}
```

---

### `PUT /api/users/:id/whitelist`

Toggles the whitelisted status of a user account, granting or revoking portal access.

- **Access:** Private — IT Admin
- **URL Params:** `id` — the `USER_ACCOUNT.id` of the target user
- **Request Body:**
```json
{ "whitelisted": true }
```
- **Response `200`:**
```json
{ "message": "User whitelist status updated.", "userId": "google_uid", "whitelisted": true }
```
- **Response `404`:**
```json
{ "error": "User not found." }
```

---

### `PUT /api/users/:id/role`

Updates the assigned role of a user account.

- **Access:** Private — IT Admin
- **URL Params:** `id` — the `USER_ACCOUNT.id` of the target user
- **Request Body:**
```json
{ "role_id": 2 }
```
- **Response `200`:**
```json
{ "message": "User role updated successfully.", "userId": "google_uid", "role_id": 2 }
```
- **Response `400`:**
```json
{ "error": "'role_id' numeric field is required in body" }
```
- **Response `404`:**
```json
{ "error": "User not found." }
```

---

## Document Routes

### `POST /api/documents`

Student submits a new document for certification tracking. Creates a `DOCUMENT` record
with `status = "SUBMITTED"` and `mode = null`, and logs the first `DOCUMENT_HISTORY` entry.

- **Access:** Private — Student only
- **Request Body:**
```json
{
  "title": "Thesis Certification Request",
  "adviserId": "adviser_user_id"
}
```
- **Response `201`:**
```json
{
  "id": "DOC-2026-9021",
  "title": "Thesis Certification Request",
  "status": "SUBMITTED",
  "mode": null,
  "submittedDate": "2026-07-20T11:00:00Z"
}
```
- **Response `400`:**
```json
{ "error": "title and adviserId are required." }
```

---

### `GET /api/documents`

Returns a filtered list of documents. The filter applied depends on the requesting user's role:

| Role | Filter Applied |
|---|---|
| Student | Documents where `student_id = current user` |
| Adviser | Documents where `adviser_id = current user` |
| Reviewer (FREC) | `status` IN `FORWARDED-FREC`, `DEAN ENDORSED`, `FOR REVIEW` |
| Program Chair | `status = AWAITING_CHAIR_REVIEW` |
| Dean | `status = FORWARDED-DEAN` |
| IT Admin | All documents (no filter) |

- **Access:** Private — All roles
- **Response `200`:**
```json
{
  "documents": [
    {
      "id": "DOC-2026-9021",
      "title": "Thesis Certification Request",
      "student": "Maria Santos",
      "adviser": "Dr. Elena Reyes",
      "mode": 1,
      "status": "FORWARDED-FREC",
      "updatedDate": "2026-07-20T11:00:00Z"
    }
  ]
}
```

---

### `GET /api/documents/:id`

Returns full details of a single document, including its complete `DOCUMENT_HISTORY` audit log.

- **Access:** Private — Any participant associated with the document
- **URL Params:** `id` — the `DOCUMENT.id` (e.g. `DOC-2026-9021`)
- **Response `200`:**
```json
{
  "id": "DOC-2026-9021",
  "title": "Thesis Certification Request",
  "student": "Maria Santos",
  "adviser": "Dr. Elena Reyes",
  "mode": 1,
  "status": "FORWARDED-FREC",
  "submittedDate": "2026-07-20T10:00:00Z",
  "updatedDate": "2026-07-20T11:00:00Z",
  "remarks": null,
  "history": [
    {
      "status": "SUBMITTED",
      "actorName": "Maria Santos",
      "remarks": null,
      "createdAt": "2026-07-20T10:00:00Z"
    },
    {
      "status": "FORWARDED-FREC",
      "actorName": "Dr. Elena Reyes",
      "remarks": "Looks good. Forwarding to FREC under Mode 1.",
      "createdAt": "2026-07-20T11:00:00Z"
    }
  ]
}
```
- **Response `404`:**
```json
{ "error": "Document not found." }
```

---

### `PUT /api/documents/:id/mode`

Adviser assigns or updates the certification routing mode before forwarding to FREC.
Must be set before the Adviser can call the approve endpoint.

- **Access:** Private — Adviser only
- **URL Params:** `id` — the `DOCUMENT.id`
- **Request Body:**
```json
{ "mode": 1 }
```
- **Response `200`:**
```json
{ "id": "DOC-2026-9021", "mode": 1 }
```
- **Response `400`:**
```json
{ "error": "mode must be 1, 2, or 3." }
```

---

### `PUT /api/documents/:id/approve`

Advances the document to the next status in the certification workflow.
The transition applied is determined automatically by the actor's **role** and the document's **mode**.

- **Access:** Private — Adviser, Reviewer (FREC), Program Chair, Dean

#### State Machine Transitions

| Current Status | Actor Role | Mode | Next Status |
|---|---|---|---|
| `SUBMITTED` | Adviser | 1, 2, or 3 | `FORWARDED-FREC` |
| `FORWARDED-FREC` | Reviewer (FREC) | 1, 2, or 3 | `AWAITING_CHAIR_REVIEW` |
| `AWAITING_CHAIR_REVIEW` | Program Chair | 1 | `COMPLETED` |
| `AWAITING_CHAIR_REVIEW` | Program Chair | 2 or 3 | `FORWARDED-DEAN` |
| `FORWARDED-DEAN` | Dean | 2 | `COMPLETED` |
| `FORWARDED-DEAN` | Dean | 3 | `DEAN ENDORSED` |
| `DEAN ENDORSED` | Reviewer (FREC) | 3 | `FOR REVIEW` |
| `FOR REVIEW` | Reviewer (FREC) | 3 | `COMPLETED` |

Each transition automatically appends a new `DOCUMENT_HISTORY` record.

- **URL Params:** `id` — the `DOCUMENT.id`
- **Request Body:**
```json
{ "remarks": "Approved after review." }
```
- **Response `200`:**
```json
{
  "id": "DOC-2026-9021",
  "previousStatus": "SUBMITTED",
  "nextStatus": "FORWARDED-FREC",
  "remarks": "Approved after review."
}
```
- **Response `400`:**
```json
{ "error": "Cannot approve from current status with this role." }
```

---

### `PUT /api/documents/:id/disapprove`

Rejects the document at its current stage, halting the workflow permanently.
Sets `status = "DISAPPROVED"` and appends a `DOCUMENT_HISTORY` record with the actor's remarks.

- **Access:** Private — Adviser, Reviewer (FREC), Program Chair, Dean
- **URL Params:** `id` — the `DOCUMENT.id`
- **Request Body:**
```json
{ "remarks": "Missing signature on page 4." }
```
- **Response `200`:**
```json
{
  "id": "DOC-2026-9021",
  "status": "DISAPPROVED",
  "remarks": "Missing signature on page 4."
}
```
- **Response `400`:**
```json
{ "error": "remarks are required when disapproving." }
```

---

## Document Status Reference

| Status | Description |
|---|---|
| `SUBMITTED` | Student submitted. Awaiting Adviser review. |
| `FORWARDED-FREC` | Adviser approved and set mode. Sent to Reviewer (FREC). |
| `AWAITING_CHAIR_REVIEW` | FREC processed. Awaiting Program Chair signature. |
| `FORWARDED-DEAN` | Program Chair signed. Forwarded to Dean (Mode 2 & 3). |
| `DEAN ENDORSED` | Dean issued endorsement letter (Mode 3). |
| `FOR REVIEW` | Reviewer accepted endorsed document for final review (Mode 3). |
| `COMPLETED` | ✅ Terminal — Workflow complete. |
| `DISAPPROVED` | ❌ Terminal — Workflow halted. |
