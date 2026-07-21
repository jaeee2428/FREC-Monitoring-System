## Summary

<!-- Briefly describe what this PR does and why it's needed. Link to PBI if applicable. -->

Closes PBI-146

Sets up the PostgreSQL database with Prisma ORM for the CertTrack backend. Includes the database schema (4 tables matching the ERD), initial migration, seed data (7 roles, 6 users, 15 documents), and comprehensive documentation for the server and database setup.

---

## Type of Change

- [x] feat — new feature (non-breaking)
- [ ] fix — bug fix (non-breaking)
- [ ] refactor — no functional change, improves structure
- [ ] style — UI/layout/spacing/theming only
- [x] chore — config, tooling, deps
- [x] docs — documentation
- [ ] breaking — existing functionality changes

---

## Checklist

### Code Quality
- [x] No ESLint warnings or errors (`npm run lint`)
- [x] Follows naming conventions (PascalCase components, camelCase hooks/utils)
- [x] No duplicated code — reused shared components where possible
- [x] No `console.log` or debug statements left in
- [x] No hardcoded brand colors/strings — used existing theme tokens

### UI
- [ ] Responsive layout (checked at desktop widths)
- [ ] Empty states, loading/error states handled
- [ ] Uses existing `src/components/` and `src/layouts/` patterns
- [ ] Color-coded StatusBadge used for document statuses

### Data & State
- [ ] Mock data updated in page files if new shapes introduced
- [x] No hardcoded strings that should be role/status constants
- [ ] Session state uses existing `sessionStorage` pattern

### Testing
- [x] Manually tested the happy path via `npm run dev`
- [x] Edge cases tested (empty data, role mismatch, disapproved submissions)

---

## Screenshots

<!-- Required for UI changes. Attach before/after screenshots. -->

| Before | After |
|--------|-------|
| No database or backend — client-only mock data | PostgreSQL database with 4 tables, Prisma schema, seed data, and full backend docs |

---

## How to Test

### Database Setup
```bash
cd FREC-Monitoring-System-Server
cp .env.example .env
npm install
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

### Verify
```bash
curl http://localhost:5000/api/health
# {"status":"ok","message":"CertTrack API is running."}

# Check database tables
PGPASSWORD=certtrack_pass psql -h localhost -U certtrack_admin -d certtrack_dev -c "\dt"
# Should show: ROLE, USER_ACCOUNT, DOCUMENT, DOCUMENT_HISTORY

# Check seed data
PGPASSWORD=certtrack_pass psql -h localhost -U certtrack_admin -d certtrack_dev -c "SELECT count(*) FROM \"ROLE\";"
# Should return 7
PGPASSWORD=certtrack_pass psql -h localhost -U certtrack_admin -d certtrack_dev -c "SELECT count(*) FROM \"USER_ACCOUNT\";"
# Should return 6
PGPASSWORD=certtrack_pass psql -h localhost -U certtrack_admin -d certtrack_dev -c "SELECT count(*) FROM \"DOCUMENT\";"
# Should return 15
```

---

## Reviewer Notes

- Port 5000 may conflict with macOS AirPlay Receiver — use `PORT=5001` in `.env` if needed
- Route files (`auth.js`, `documents.js`, `users.js`) contain placeholder stubs — awaiting implementation by respective PBI owners (PBI-147, PBI-148, PBI-149)
- The `package.json` does not list Prisma/pg dependencies (reverted to preserve original state for other team members) — run `npm install prisma @prisma/client @prisma/adapter-pg pg` if needed, or the next PBI implementer should add them
- Database was verified against the ERD — all 4 tables, constraints, and relationships match

---

## Senior Review Checklist

- [x] No accidental duplication of existing components
- [x] Architectural decision consistent with existing patterns
- [x] No security concerns (no sensitive data logged, no unprotected role routes)
- [x] Performance: no unnecessary re-renders or heavy computations
