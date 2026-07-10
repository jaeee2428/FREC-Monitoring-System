# CertTrack — Certification Monitoring & Tracking System

A role-based certification workflow management system for academic institutions. Students submit theses, research papers, and projects for certification; faculty roles (Adviser, Program Chair, Dean, Reviewer) process them through configurable routing modes.

## Roles

| Role | Responsibilities |
|------|-----------------|
| **Student** | Upload PDFs, link Google Drive files, track submission status, download certificates |
| **Adviser** | Review advisee submissions, select processing mode (1/2/3), approve/forward or disapprove |
| **FREC** | Review forwarded documents, approve, generate certificates, route per mode |
| **Program Chair** | Review/approve certificates (Mode 1), forward to Dean (Mode 2) |
| **Dean** | Final approval (Mode 2), issue endorsement letters (Mode 3) |
| **Reviewer** | Review endorsed submissions, give final FICS FREC confirmation (Mode 3) |
| **IT Admin** | Manage whitelisted accounts, assign roles, audit user access |

## Certification Modes

- **Mode 1**: FREC → Adviser → Program Chair _(completes workflow)_
- **Mode 2**: FREC → Program Chair → Dean _(completes workflow)_
- **Mode 3**: Dean → Reviewer → FICS FREC _(completes workflow)_

## Tech Stack

- **React 19** — UI library
- **Vite 8** — Bundler & dev server
- **Tailwind CSS v4** — Utility-first styling (via `@tailwindcss/vite` plugin)
- **ESLint** — Code quality (flat config)

## Quick Start

```bash
cd FREC-Monitoring-System-Client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Use the account picker to sign in with any mock account from `src/data/accounts.js`.

## Project Structure

```
FREC-Monitoring-System-Client/
├── index.html               # HTML entry point
├── vite.config.js           # Vite config (React + Tailwind plugins)
├── eslint.config.js         # ESLint flat config
├── package.json             # Dependencies & scripts
└── src/
    ├── main.jsx             # App mount
    ├── App.jsx              # Role-based view router
    ├── index.css            # Tailwind import & theme variables
    ├── App.css              # Login page layout
    ├── data/accounts.js     # Mock user accounts
    ├── components/          # Reusable UI (AuthCard, StatCard, StatusBadge, etc.)
    ├── layouts/             # Dashboard shell (Header, Sidebar, Tabs, Footer)
    └── pages/               # Role-scoped page components
```

Available at the project root:
```
FREC-Monitoring-System-Server/   # Backend skeleton (empty)
```

## Available Scripts

Run these from `FREC-Monitoring-System-Client/`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Contributing

See [AGENTS.md](./AGENTS.md) for workflow conventions (branch naming, commits, PRs).
