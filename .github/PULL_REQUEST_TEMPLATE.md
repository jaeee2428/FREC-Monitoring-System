## Summary

<!-- Briefly describe what this PR does and why it's needed. Link to PBI if applicable. -->

Closes PBI-NN

---

## Type of Change

- [ ] feat — new feature (non-breaking)
- [ ] fix — bug fix (non-breaking)
- [ ] refactor — no functional change, improves structure
- [ ] style — UI/layout/spacing/theming only
- [ ] chore — config, tooling, deps
- [ ] docs — documentation
- [ ] breaking — existing functionality changes

---

## Checklist

### Code Quality
- [ ] No ESLint warnings or errors (`npm run lint`)
- [ ] Follows naming conventions (PascalCase components, camelCase hooks/utils)
- [ ] No duplicated code — reused shared components where possible
- [ ] No `console.log` or debug statements left in
- [ ] No hardcoded brand colors/strings — used existing theme tokens

### UI
- [ ] Responsive layout (checked at desktop widths)
- [ ] Empty states, loading/error states handled
- [ ] Uses existing `src/components/` and `src/layouts/` patterns
- [ ] Color-coded StatusBadge used for document statuses

### Data & State
- [ ] Mock data updated in page files if new shapes introduced
- [ ] No hardcoded strings that should be role/status constants
- [ ] Session state uses existing `sessionStorage` pattern

### Testing
- [ ] Manually tested the happy path via `npm run dev`
- [ ] Edge cases tested (empty data, role mismatch, disapproved submissions)

---

## Screenshots

<!-- Required for UI changes. Attach before/after screenshots. -->

| Before | After |
|--------|-------|
|        |       |

---

## How to Test

1. `cd FREC-Monitoring-System-Client && npm run dev`
2. Sign in as `<role>` from the account picker
3. Navigate to …
4. Verify that …

---

## Reviewer Notes

<!-- Anything to pay special attention to, known limitations, follow-ups. -->

---

## Senior Review Checklist

- [ ] No accidental duplication of existing components
- [ ] Architectural decision consistent with existing patterns
- [ ] No security concerns (no sensitive data logged, no unprotected role routes)
- [ ] Performance: no unnecessary re-renders or heavy computations
