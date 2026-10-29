---
touches:
  - rig.runtime
  - rig.views
opened: 2026-10-29
---

# F002 · Render the digest page

Issue: https://github.com/pawel-lurka/rig-handover/issues/2
Source: plan.md § 2a

## Outcome

A reader can see a night's job summary on one page in the existing layout. Failed jobs and jobs with three or more retries stand out without hiding any data.

## Scope

- Start at `src/app.tsx` to serve `GET /digest/:night` using the shared digest reader.
- Render one table sorted by job, showing all summary fields and original time offsets.
- Show missing values as `—`, including null owners.
- Return 404 for a missing night and render `nothing ran` for an empty file.
- Use the same rows and ordering as the JSON endpoint.

## Out of scope

- JSON route, board links, reader redesign, and the separate route-test issue.
- Changes to `runs/`, client JavaScript, previews, hosting, and plan archival.

## Acceptance

- `/digest/2026-10-28` renders locally with the usual layout and all five job rows.
- Rows are sorted by job; failures and retry counts of at least three are marked.
- Missing and empty nights produce the specified status and content.
- A local render check shows complete values, visible missing-value markers, and no client scripts.
- Relevant tests and `pnpm typecheck` pass.
