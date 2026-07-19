# Entity-Relationship Diagram (ERD) — CertTrack

This document details the database schema and Entity-Relationship Diagram (ERD) for **CertTrack** (FREC Monitoring & Tracking System), designed from the provided React/TypeScript prototype models.

---

## 1. Data Dictionary

### Entity: `ROLE`
Stores the role configurations.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY` | Unique role identifier (e.g. 1 for Student, 2 for Adviser, etc.). |
| `label` | `VARCHAR(100)` | `NOT NULL` | Display friendly name: `Student`, `Program Chair`, etc. |

### Entity: `USER_ACCOUNT`
Represents users logging into the system.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Matches external auth ID or generated user ID (e.g., `U001`). |
| `name` | `VARCHAR(150)` | `NOT NULL` | Full name of the user. |
| `email` | `VARCHAR(150)` | `NOT NULL`, `UNIQUE` | University email. |
| `role_id` | `INT` | `FOREIGN KEY`, `NOT NULL` | References `ROLE(id)`. |
| `program` | `VARCHAR(150)` | `NULL` | Optional degree program (e.g., "BS Computer Science") set in profile. |
| `whitelisted` | `BOOLEAN` | `DEFAULT TRUE` | Whitelisting toggle for user access control. |

### Entity: `DOCUMENT`
Represents submitted certificates and requests.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Document identifier (e.g., `DOC-2024-001`). |
| `title` | `VARCHAR(255)` | `NOT NULL` | Title of the certification request. |
| `student_id` | `VARCHAR(50)` | `FOREIGN KEY`, `NOT NULL` | References `USER_ACCOUNT(id)`. |
| `adviser_id` | `VARCHAR(50)` | `FOREIGN KEY`, `NULL` | References `USER_ACCOUNT(id)`. The assigned faculty adviser. |
| `status` | `VARCHAR(50)` | `NOT NULL` | Workflow status. Enum value. |
| `mode` | `TINYINT` | `CHECK (mode IN (1, 2, 3))`, `NULL` | Selected routing mode: 1, 2, or 3. |
| `submitted_date` | `DATETIME` | `NOT NULL` | Date when document was first submitted. |
| `updated_date` | `DATETIME` | `NOT NULL` | Date of last state update. |
| `remarks` | `TEXT` | `NULL` | Feedback remarks (e.g. rejection reason). |

### Entity: `DOCUMENT_HISTORY` (Audit Trail)
Tracks workflow state transitions (e.g. transition from `submitted` -> `approved_adviser`).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique entry identifier. |
| `document_id` | `VARCHAR(50)` | `FOREIGN KEY`, `NOT NULL` | References `DOCUMENT(id)`. |
| `status` | `VARCHAR(50)` | `NOT NULL` | Document status at this point in time. |
| `actor_id` | `VARCHAR(50)` | `FOREIGN KEY`, `NOT NULL` | References `USER_ACCOUNT(id)`. User who performed the approval/rejection. |
| `remarks` | `TEXT` | `NULL` | Optional comments left during this step. |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of the action. |

---

## 2. Key Relationships Explained

1. **One-to-Many (`ROLE` to `USER_ACCOUNT`)**:
   - A single role (e.g., `adviser`) can be assigned to multiple users.
   
2. **One-to-Many (`USER_ACCOUNT` to `DOCUMENT` - Student)**:
   - A student (`USER_ACCOUNT`) can submit multiple certification requests over their academic stay.
   
3. **One-to-Many (`USER_ACCOUNT` to `DOCUMENT` - Adviser)**:
   - An adviser can be assigned to guide and approve multiple student documents.
   
4. **One-to-Many (`DOCUMENT` to `DOCUMENT_HISTORY`)**:
   - Each document accumulates history logs as it goes through the multi-stage approval workflow.
