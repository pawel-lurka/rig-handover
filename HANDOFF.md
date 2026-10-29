# Hand-off: s01e04 · nightly run-log reader

Challenge id: not supplied; implementation source is GitHub issue #1 in pawel-lurka/rig-handover.
State: started; candidate requires independent review and owner approval before landing.
Receipts: no course submission was made.

## Sources
| Source file | Kind | Clock / time zone | Transcript |
|:--|:--|:--|:--|
| `spec/features/active/F001-read-nightly-run-logs/ticket.md` | Implementation ticket | Not timed | Not applicable |
| GitHub issue https://github.com/pawel-lurka/rig-handover/issues/1 | Implementation issue | Not timed | Not applicable |
| `plan.md` §1–2 | Reader and consumer requirements | Not timed | Not applicable |
| `spec/build.md` TRACK | Work boundaries | Not timed | Not applicable |
| `runs/2026-10-28.jsonl` | Read-only test fixture | Recorded `+01:00` offsets | Not applicable |

## Findings, by source
### `plan.md` §1–2 and GitHub issue #1
- Consumers need one shared reader, sorted rows, missing-versus-empty results, bad-line counts, and status counts.
- The contract is committed first as `ff1a5fc` (`src/digest/types.ts`). The implementation exports `readNight` from `src/digest/reader.ts`, checked against the `ReadNight` function type.

### `src/digest/types.ts` — consumer contract
- `readNight(runsDir, night)` is synchronous and returns `NightDigest`.
- `kind: 'missing'` carries `night`. `kind: 'found'` carries `night`, `rows`, `badLines`, and `statusCounts`.
- An existing empty file has zero rows, zero bad lines, and zero counts. Malformed-only input has zero rows but nonzero `badLines`.
- Rows are sorted by job in code-unit order. `runs` counts all valid events; `retries` counts retry events. Per-row and night `statusCounts` count all events, not final job states.
- `owner` and `lastStatus` come from the last valid event in file order. Null and empty-string owners remain distinct. `lastError` is the latest error string, retained after recovery; no error is null and an empty error is an empty string.
- `firstAt` and `lastAt` are the first and last valid event timestamps in file order, not chronological extrema. Their original offsets and fractional seconds are unchanged.
- Invalid JSON or event fields count once per nonblank line and do not affect valid rows. Blank lines do not count. Input requires a valid offset-bearing ISO timestamp, nonempty job, known status, string-or-null owner, and optional string error. Extra fields are ignored.
- Invalid calendar dates or non-YYYY-MM-DD night arguments throw `RangeError` before I/O. Missing files/directories return missing; other filesystem errors propagate.

### `spec/features/active/F001-read-nightly-run-logs/ticket.md` — acceptance map (five items)
1. Real fixture: `test/digest.test.ts`, test “reads the real night”, asserts all five rows and one bad line, including every field, sorting, and unchanged fixture bytes.
2. Repeated-job aggregation: “aggregates in file order” asserts runs/retries, all-event counts including recovered failure, latest values, and original first/last timestamps. “keeps the latest empty error string” covers absent-versus-empty errors.
3. Null owner: the real fixture and aggregation tests retain null-owner rows and distinguish an empty owner string.
4. Missing/empty/malformed: empty-night, malformed-only, and invalid-line tests distinguish each state and retain valid events around a bad line.
5. Native checks: run `pnpm test` and `pnpm typecheck` after the reader commit. Their authoritative outputs belong in the job artifacts directory below, not this pre-check document.

### `plan.md` §2 — consumer-to-contract map
| Consumer | Shared fields and call |
|:--|:--|
| 2a HTML | Call `readNight`; missing means 404, found/no rows means nothing ran; render sorted `rows`; flag `retries >= 3` and `row.statusCounts.fail > 0`. |
| 2b JSON | Return the same typed `rows` in the same order; no second parser or local sort. |
| 2c Board | Use the existing night listing, call `readNight` for each night, and use night `statusCounts.ok/retry/fail` (event counts). |
| 2d Route tests | Write temp log files; use the same missing/found union and fields to check HTTP behavior. Do not modify `runs/`. |

### Check evidence
- Review artifacts: `/Users/pawellurka/MEGADev/s01e04/repo/.limen/jobs/2026-10-29-f001-read-nightly-run-logs-502f75b8/artifacts/`.
- `contract-check.txt`: isolated strict TypeScript contract check. The first attempt without `--ignoreConfig` failed with TS5112 under TypeScript 6; the corrected command is the one captured here.
- `reader-focused.txt`: focused reader checks on the restored implementation.
- `reader-types.txt`: isolated strict reader/test TypeScript check with `--types node`. The first isolated invocation omitted that flag and failed with TS2591 because `--ignoreConfig` also skips the project's Node type setting; its output is retained as `reader-types-initial.txt`.
- `recovery-negative-control.txt`: intentional mutation cleared the latest error after recovery. The aggregation assertion failed on `lastError: null` versus `latest`. The mutation was then reverted. This checks the acceptance item most likely to regress: last-value aggregation through recovery.
- Existing status-board tests are unchanged. No earlier reader test existed to retire.

## Combined texts and where each part came from
| Part | Source file | Starts with | Ends with | Span in source |
|:--|:--|:--|:--|:--|
| Data and consumer requirements | `plan.md` | “## 1. Run log reader” | “green with the new tests.” | §1–2; not timed |
| Acceptance map | `spec/features/active/F001-read-nightly-run-logs/ticket.md` | “## Acceptance” | “pnpm typecheck` pass.” | All five acceptance bullets; not timed |
| Boundary | `spec/build.md` | “Morning digest” | “obtain owner approval before any landing.” | TRACK; not timed |
| Real-fixture assertion | `runs/2026-10-28.jsonl` | `{"at":"2026-10-28T23:00:02+01:00"` | `"job":"lane/sy` | Lines 1–16; valid event times 2026-10-28T23:00:02+01:00 through 2026-10-29T05:41:09+01:00 |

## Next step
Independent review of the two implementation commits, then owner approval before landing. Do not merge, push, close issue #1, edit planning files, or implement section 2 routes in this slice. The untracked `pnpm-lock.yaml` was present at job entry and must not enter either commit. No service or watcher is needed for this reader-only change.
