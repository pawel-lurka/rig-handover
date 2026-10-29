---
touches:
  - rig.runtime
opened: 2026-10-29
landed: 2026-10-29
---

# F005 · Test digest routes

Issue: https://github.com/pawel-lurka/rig-handover/issues/5
Source: plan.md § 2d

## Outcome

Automated checks prove that the HTML page and JSON API agree on the same night. Missing, empty, and malformed input are covered without changing real night logs.

## Scope

- Start with a new digest route test file using the existing `app.request()` test pattern.
- Use temporary runs directories with automatic cleanup.
- Cover both routes for normal input, a missing file, an empty file, and input containing a malformed line.
- Compare HTML and JSON job membership and order.

## Out of scope

- Production route or reader implementation and board views.
- Changes to `runs/`, unrelated test expansion, previews, hosting, and plan archival.

## Acceptance

- Both routes return 200 for valid nights and 404 for a missing night.
- An empty night produces successful empty output on both routes.
- A malformed line leaves valid jobs visible and preserves the contract's bad-line accounting.
- HTML and JSON expose the same jobs in the same order.
- `pnpm test` and `pnpm typecheck` pass with temporary fixtures removed afterwards.
