---
touches:
  - rig.logs
opened: 2026-10-29
landed: 2026-10-29
---

# F001 · Read nightly run logs

Issue: https://github.com/pawel-lurka/rig-handover/issues/1
Source: plan.md § 1

## Outcome

The service can read a night log as one summary row per job without failing on a bad line. Page, JSON, and board workers share one typed result, so the same log cannot produce different summaries.

## Scope

- Start in `src/digest/types.ts` with `DigestRow` and the `readNight(runsDir, night)` contract; commit that contract before the reader implementation.
- Aggregate job, owner, run and retry counts, last status and error, and first and last time.
- Count malformed input while retaining valid jobs, including jobs with null owners.
- Give consumers explicit missing-night, empty-night, bad-line, and status-count semantics without another parser.
- Preserve the time offsets recorded in the log.

## Out of scope

- HTTP routes, digest views, board links, and route-test work.
- Changes to `runs/`, client JavaScript, new dependencies, previews, hosting, and plan archival.

## Acceptance

- Reader tests on `runs/2026-10-28.jsonl` report five jobs and one bad line.
- Aggregation tests verify counts, last values, and first and last times across repeated jobs.
- A null owner retains its job row and stays distinguishable from an empty string.
- Missing and empty nights are distinct results; malformed input does not discard valid rows.
- `pnpm test` and `pnpm typecheck` pass.
