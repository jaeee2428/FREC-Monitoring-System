# CertTrack — Certification Monitoring & Tracking System

A role-based certification workflow management system for academic institutions. Students submit theses, research papers, and projects for certification; faculty roles process them through configurable routing modes.

## Architecture

```
FREC-Monitoring-System/
├── FREC-Monitoring-System-Client/   # React 19 + Vite 8 web app (active)
└── FREC-Monitoring-System-Server/   # Express 4 + Prisma 7 + PostgreSQL 16
```

The client is a single-page application with mock authentication and hardcoded data. The server has a PostgreSQL database (Prisma schema, migration, seed data) and Express route stubs awaiting implementation.

## Roles

| Role | Responsibilities |
|------|-----------------|
| **Student** | Upload PDFs, link Google Drive files, track submission status, download certificates |
| **Adviser** | Review advisee submissions, select processing mode (1/2/3), approve/forward or disapprove |
| **FREC** | Review forwarded documents, approve, generate certificates, route per mode |
| **Program Chair** | Review/approve certificates (Mode 1), forward to Dean (Mode 2) |
| **Dean** | Final approval (Mode 2), issue endorsement letters (Mode 3) |
| **Reviewer** | Review endorsed submissions, give final FICS FREC confirmation (Mode 3) |
| **IT Admin** | Manage whitelisted accounts, assign roles, audit system access |

## Certification Modes

The Adviser selects a mode when approving a submission. Each mode routes the certificate through a different approval chain:

| Mode | Path | Complete at |
|------|------|-------------|
| **1** | FREC → Adviser (return) → **Program Chair** | Program Chair sign-off |
| **2** | FREC → Program Chair → **Dean** | Dean final approval |
| **3** | FREC → Dean (endorsement) → Reviewer → **FICS FREC** | FICS FREC confirmation |

### Full Step Flow

**Mode 1** — Certification (Return to Adviser → PC)
```
Student → Adviser (Approve, Mode 1) → FREC (Approve) → Generate Certificate → Return to Adviser → Program Chair → Completed
```

**Mode 2** — Certification (Return to PC → Dean)
```
Student → Adviser (Approve, Mode 2) → FREC (Approve) → Generate Certificate → Program Chair → Dean → Completed
```

**Mode 3** — Endorsement (Forward to Dean → Reviewer → FICS FREC)
```
Student → Adviser (Approve, Mode 3) → FREC (Approve) → Dean (Endorsement Letter) → Reviewer → Generate Certificate → FICS FREC → Completed
```

## Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (JSX, no TypeScript) |
| Bundler | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin, no config file) |
| Linting | ESLint 10 (flat config) |
| Routing | Conditional render in `App.jsx` — no router library |
| Auth | Mock session in `sessionStorage` — no backend |
| Icons | Inline SVGs — no icon library |

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | Google OAuth (JWT) — not yet implemented |

## Quick Start

### Client

```bash
cd FREC-Monitoring-System-Client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Select an account from the picker to sign in.

### Server

```bash
cd FREC-Monitoring-System-Server
cp .env.example .env       # then edit .env with your DATABASE_URL
npm install
npx prisma migrate dev      # creates database tables
node prisma/seed.js          # seeds roles, users, and documents
npm run dev                  # starts dev server on port 5000
```

See [`FREC-Monitoring-System-Server/README.md`](./FREC-Monitoring-System-Server/README.md) for detailed setup.

## Mock Accounts

All accounts are defined in `src/data/accounts.js`. To sign in, click any account from the login page:

| Name | Role | Email |
|------|------|-------|
| Maria Santos | Student | m.santos@university.edu.ph |
| Dr. Elena Reyes | Adviser | e.reyes@university.edu.ph |
| Admin Dela Rosa | IT Admin | it.admin@university.edu.ph |
| Dr. Jose Santos | Program Chair | j.santos@university.edu.ph |
| Dr. Amalia Cruz | Dean | a.cruz@university.edu.ph |
| Prof. Ramon Dela Cruz | Reviewer | r.delacruz@university.edu.ph |

## Project Structure

```
FREC-Monitoring-System-Client/
├── index.html                  # HTML entry
├── vite.config.js              # Vite config (React + Tailwind)
├── eslint.config.js            # ESLint flat config
├── package.json                # Dependencies and scripts
├── public/                     # Static assets (favicon, icons)
└── src/
    ├── main.jsx                # ReactDOM mount
    ├── App.jsx                 # Role-based view router
    ├── index.css               # Tailwind import + CSS vars
    ├── App.css                 # Login page layout styles
    ├── data/
    │   └── accounts.js         # Mock user accounts + role helpers
    ├── components/
    │   ├── AuthCard.jsx        # Login card wrapper
    │   ├── StatCard.jsx        # Dashboard stat display
    │   ├── StatusBadge.jsx     # Color-coded status tag
    │   ├── ModeBadge.jsx       # Colored mode indicator (1/2/3)
    │   ├── AllDocuments.jsx    # Master document table with filters
    │   ├── WorkflowGuide.jsx   # Mode flow diagrams
    │   └── icons.jsx           # Inline SVG icons
    ├── layouts/
    │   ├── DashboardLayout.jsx # App shell (header + sidebar + content)
    │   └── components/
    │       ├── DashboardHeader.jsx   # Top bar with logo + user
    │       ├── DashboardSidebar.jsx  # Left icon nav + logout
    │       ├── DashboardTabsBar.jsx  # Thesis/Research/Project tabs
    │       └── DashboardFooter.jsx   # Copyright footer
    └── pages/
        ├── LoginPage.jsx       # Mock Google sign-in
        ├── adviser/            # Adviser dashboard + approvals
        ├── student/            # Student dashboard
        ├── program-chair/      # Program Chair dashboard + approvals
        ├── dean/               # Dean dashboard + approvals
        ├── reviewer/           # Reviewer dashboard + approvals
        └── it-admin/           # IT Admin dashboard + accounts view
```

## Available Scripts

### Client (`FREC-Monitoring-System-Client/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Preview production build locally |
| `npm run lint` | Run ESLint across all source files |

### Server (`FREC-Monitoring-System-Server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express dev server (nodemon, auto-restart) |
| `npm start` | Start Express server (production) |
| `npx prisma migrate dev` | Apply database migrations |
| `node prisma/seed.js` | Seed database with sample data |
| `npx prisma studio` | Open Prisma Studio (GUI database browser) |

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint and build on every push to `main`/`develop` and all pull requests.

## Contributing

See [AGENTS.md](./AGENTS.md) for:
- Branch naming conventions (`feat/PBI-NN-*`, `fix/PBI-NN-*`, etc.)
- Commit message format (Conventional Commits)
- Pull request expectations
