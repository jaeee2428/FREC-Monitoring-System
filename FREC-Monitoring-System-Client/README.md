# CertTrack Client

React 19 + Vite 8 + Tailwind CSS v4 frontend for the CertTrack certification monitoring system.

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Build

```bash
npm run build        # production build to dist/
npm run start        # preview the production build
```

## Lint

```bash
npm run lint
```

ESLint 10 with flat config (`eslint.config.js`). Covers React hooks rules and JSX best practices.

## Design Decisions

- **No TypeScript** — all source files use `.jsx`
- **No router library** — views are conditionally rendered in `App.jsx` based on a `view` state string and session role
- **Tailwind v4** — uses `@import "tailwindcss"` in CSS, no `tailwind.config.js`
- **Inline SVGs** — all icons live in `src/components/icons.jsx` (no external icon library)
- **Mock data** — all data is hardcoded in page files; no API layer yet
- **Session** — stored in `window.sessionStorage` under `mockSession` key

## Project Structure

```
src/
├── main.jsx              # ReactDOM mount point
├── App.jsx               # View router (session + role driven)
├── index.css             # Tailwind import + theme variables
├── App.css               # Login page layout
├── data/accounts.js      # Mock accounts + role check helpers
├── components/           # Shared UI components
│   ├── AuthCard.jsx
│   ├── StatCard.jsx
│   ├── StatusBadge.jsx
│   ├── ModeBadge.jsx
│   ├── AllDocuments.jsx
│   ├── WorkflowGuide.jsx
│   └── icons.jsx
├── layouts/
│   ├── DashboardLayout.jsx
│   └── components/       # Header, Sidebar, TabsBar, Footer
└── pages/
    ├── LoginPage.jsx
    ├── adviser/
    ├── student/
    ├── program-chair/
    ├── dean/
    ├── reviewer/
    └── it-admin/
```
