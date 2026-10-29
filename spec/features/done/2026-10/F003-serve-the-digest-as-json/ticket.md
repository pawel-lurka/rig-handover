---
touches:
  - rig.runtime
opened: 2026-10-29
landed: 2026-10-29
---

# F003 · Serve the digest as JSON

Issue: https://github.com/pawel-lurka/rig-handover/issues/3
Source: plan.md § 2b

## Outcome

Agents can read a night's digest as JSON. The API and HTML page expose the same job rows in the same order rather than separate interpretations of the log.

## Scope

- Start at `src/app.tsx` to serve `GET /api/digest/:night` from the shared digest reader.
- Preserve row values, time offsets, ordering, and malformed-line accounting from the shared contract.
- Distinguish a missing file from a successful empty night.

## Out of scope

- HTML views, board links, reader redesign, and the separate route-test issue.
- Changes to `runs/`, new dependencies, previews, hosting, and plan archival.

## Acceptance

- JSON for `2026-10-28` has the same jobs in the same order as the digest page.
- A missing night returns 404.
- An empty file returns a successful empty digest.
- A malformed line does not remove valid rows.
- Relevant tests and `pnpm typecheck` pass.
