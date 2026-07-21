# CertTrack Server — Backend & Database

Express 4 + Prisma 7 + PostgreSQL 16 backend for the CertTrack certification workflow system.

## Architecture

```
FREC-Monitoring-System-Server/
├── prisma/
│   ├── schema.prisma           # Database schema (4 models)
│   ├── migrations/             # Migration history
│   ├── seed.js                 # Seed script (7 roles, 6 users, 15 docs)
│   └── migration_lock.toml
├── prisma.config.ts            # Prisma v7 configuration
├── src/
│   ├── server.js               # Entry point (reads PORT from .env)
│   ├── app.js                  # Express app setup (middleware, routes, error handling)
│   └── routes/
│       ├── auth.js             # POST /api/auth/google
│       ├── users.js            # GET/PUT /api/users
│       └── documents.js        # POST/GET/PUT /api/documents
├── ERD/
│   ├── erd_design.md           # Entity-relationship documentation
│   └── erd.png                 # Visual ERD diagram
├── API-SPEC.md                 # Full API specification
├── .env.example                # Environment variable template
└── package.json
```

## Prerequisites

- **Node.js** 18+ (developed on 24.x)
- **PostgreSQL** 16+
- **npm**

## Database Setup

### 1. Install PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16
```

### 2. Create the database and user

```bash
psql postgres -c "CREATE USER certtrack_admin WITH PASSWORD 'certtrack_pass' CREATEDB;"
psql postgres -c "CREATE DATABASE certtrack_dev OWNER certtrack_admin;"
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set the `DATABASE_URL`:

```
DATABASE_URL=postgresql://certtrack_admin:certtrack_pass@localhost:5432/certtrack_dev
```

### 4. Install backend dependencies

```bash
npm install
```

### 5. Run the migration

```bash
npx prisma migrate dev
```

This creates all 4 tables (`ROLE`, `USER_ACCOUNT`, `DOCUMENT`, `DOCUMENT_HISTORY`) in the database.

### 6. Seed the database

```bash
node prisma/seed.js
```

Seeds 7 roles, 6 user accounts, and 15 sample documents.

## Running the Server

```bash
npm run dev      # Development (nodemon, auto-restart)
npm start        # Production
```

The server starts at `http://localhost:5000` by default (configurable via `PORT` in `.env`).

> **Note:** macOS may use port 5000 for AirPlay Receiver (Control Center). If you get `EADDRINUSE`, either:
> - Disable AirPlay Receiver in System Settings → AirDrop & Handoff, or
> - Set `PORT=5001` in `.env`

### Verify

```bash
curl http://localhost:5000/api/health
# {"status":"ok","message":"CertTrack API is running."}
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/google` | Public | Google OAuth login → JWT |
| GET | `/api/users` | IT Admin | List all users |
| PUT | `/api/users/:id/whitelist` | IT Admin | Toggle whitelist status |
| PUT | `/api/users/:id/role` | IT Admin | Update user role |
| POST | `/api/documents` | Student | Submit new document |
| GET | `/api/documents` | All roles | List documents (role-filtered) |
| GET | `/api/documents/:id` | Participants | Document detail + audit history |
| PUT | `/api/documents/:id/mode` | Adviser | Set certification mode (1/2/3) |
| PUT | `/api/documents/:id/approve` | Adviser/FREC/PC/Dean | Advance workflow state |
| PUT | `/api/documents/:id/disapprove` | Adviser/FREC/PC/Dean | Reject/halt workflow |

See [`API-SPEC.md`](./API-SPEC.md) for full request/response schemas and the state machine.

## Database Schema

4 tables, fully normalized:

```
ROLE (id, label)
  └── USER_ACCOUNT (id, name, email, role_id FK, program, whitelisted)
        ├── DOCUMENT (id, title, student_id FK, adviser_id FK, status, mode, submitted_date, updated_date, remarks)
        └── DOCUMENT_HISTORY (id, document_id FK, status, actor_id FK, remarks, created_at)
```

See [`ERD/erd_design.md`](./ERD/erd_design.md) for full data dictionary and relationships.

## Implementation Status

| Layer | Status |
|-------|--------|
| Database schema (Prisma) | ✅ Complete — 4 tables, FK constraints, unique index |
| Migration | ✅ Applied — `20260721062310_init` |
| Seed data | ✅ Complete — roles, users, documents |
| Route stubs | ✅ Files exist — awaiting DB + auth wiring |
| Auth (JWT + Google OAuth) | ❌ Not implemented — PBI-148 (Jaena) |
| Whitelist/user management | ❌ Not implemented — PBI-149 (Venice) |
| Document CRUD + state machine | ❌ Not implemented — PBI-147 (James/Trishia) |

Route files contain placeholder responses with detailed TODO comments. Implementation requires wiring each endpoint to Prisma queries and adding JWT auth middleware.
