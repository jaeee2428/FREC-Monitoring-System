# CertTrack (FREC-Monitoring-System) — AGENTS.md

## Active code

- **`FREC-Monitoring-System-Client/`** — Live React SPA (mock data, no API connection)
- **`FREC-Monitoring-System-Server/`** — Express skeleton with Prisma + PostgreSQL
  - Database schema (4 tables), migration applied, seed data populated
  - Route stubs with TODO comments — awaiting auth + DB wiring

## Stack

### Frontend
React 19 + Vite 8 + Tailwind CSS v4 (JSX, not TypeScript). All source files use `.jsx`.

### Backend
Express 4 + Prisma 7 + PostgreSQL 16. All source files use `.js` (CommonJS).

## Setup & dev

```
cd FREC-Monitoring-System-Client && npm install && npm run dev
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint (flat config in `eslint.config.js`) |

### Server setup

```
cd FREC-Monitoring-System-Server && npm install && npm run dev
```

See `FREC-Monitoring-System-Server/README.md` for PostgreSQL + Prisma setup.

## Key quirks

- **No router library** — role-based views are conditionally rendered in `App.jsx` using a `view` state string and `mockSession` from `sessionStorage`. Routes: `login`, `home`, `all-documents`, `approvals`, `workflow-guide`.
- **No TypeScript** — all files are `.jsx`; `@types/react` devDep is unused.
- **Tailwind v4** — no `tailwind.config.js`; uses `@import "tailwindcss"` in `src/index.css` via the `@tailwindcss/vite` plugin.
- **Mock data** — all data is hardcoded in page files; mock accounts in `src/data/accounts.js` (6 roles: Student, Adviser, IT Admin, Program Chair, Dean, Reviewer). No API calls, no backend.
- **Login** — mock Google sign-in via account picker; session stored in `window.sessionStorage`.
- **CSS** — `App.css` for layout (login page); components use Tailwind utilities.
- **No tests** — no test framework configured.

## Project structure

```
FREC-Monitoring-System-Client/
└── src/
    ├── main.jsx              # Entry: mounts <App /> into #root
    ├── App.jsx               # Role-based view router (sessionStorage-driven)
    ├── index.css             # Tailwind import + CSS custom properties (light/dark)
    ├── App.css               # Login page + auth-card layout styles
    ├── data/accounts.js      # Mock user accounts + role helpers
    ├── components/
    │   ├── AuthCard.jsx, StatCard.jsx, StatusBadge.jsx
    │   ├── AllDocuments.jsx, icons.jsx
    ├── layouts/
    │   ├── DashboardLayout.jsx
    │   └── components/       # Header, Sidebar, TabsBar, Footer
    └── pages/
        ├── LoginPage.jsx
        ├── adviser/          # Dashboard.jsx, Approvals.jsx
        ├── student/          # dashboard.jsx
        └── program-chair/    # program-chair-dashboard.jsx, approvals

FREC-Monitoring-System-Server/
├── prisma/
│   ├── schema.prisma         # DB schema (4 models)
│   ├── migrations/           # Migration history
│   └── seed.js               # Seed script
├── prisma.config.ts          # Prisma v7 config
├── src/
│   ├── server.js             # Entry point
│   ├── app.js                # Express app
│   └── routes/
│       ├── auth.js           # Auth route stubs
│       ├── users.js          # User route stubs
│       └── documents.js      # Document route stubs
├── ERD/
│   ├── erd_design.md         # Entity-relationship docs
│   └── erd.png               # ERD diagram
├── API-SPEC.md               # Full API specification
├── .env.example              # Environment template
└── README.md                 # Backend setup guide
```

## Certification Modes

| Mode | Path |
|------|------|
| 1 | FREC generates cert → Adviser → Program Chair → **Complete** |
| 2 | FREC generates cert → Program Chair → Dean → **Complete** |
| 3 | Dean endorses → Reviewer confirms → FICS FREC final → **Complete** |

## Workflow conventions

- **Branch naming**: `feat/PBI-NN-description`, `fix/PBI-NN-description`, `hotfix/description`, `chore/description`, `refactor/description`
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`. Reference PBI number in body when applicable.
- **PRs**: Link to PBI. Fill all sections in `.github/PULL_REQUEST_TEMPLATE.md`. Keep scope small — one PBI per PR where possible.
- **Roles** (from `src/data/accounts.js`): Student, Adviser, IT Admin, Program Chair, Dean, Reviewer, FREC.
- **View naming**: PascalCase for components and pages, camelCase for hooks and utilities.
