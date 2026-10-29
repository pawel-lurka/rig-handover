---
touches:
  - rig.status
  - rig.views
opened: 2026-10-29
---

# F004 · Link nights from the board

Issue: https://github.com/pawel-lurka/rig-handover/issues/4
Source: plan.md § 2c

## Outcome

The status board lets a reader open each night's digest directly. Counts beside each link show how many entries were ok, retry, or fail before the reader opens the night.

## Scope

- Start in `src/status.ts` to collect per-night counts with the shared reader contract.
- Render each night as a digest link in the existing board.
- Keep the current newest-first night order and the existing layout.

## Out of scope

- Digest routes, a second JSONL parser, reader redesign, and route-test work.
- Changes to `runs/`, client JavaScript, previews, hosting, and plan archival.

## Acceptance

- Both fixture nights appear as links to digest pages that render.
- Each link shows correct ok / retry / fail counts from its log.
- Nights remain newest first.
- A local render check confirms that links and counts are readable.
- Relevant tests and `pnpm typecheck` pass.
