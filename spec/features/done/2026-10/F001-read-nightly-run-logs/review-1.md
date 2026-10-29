PASS a31fba9d375560743731c55375f8dde52f0981a9

The nightly log reader (F001, issue #1) meets all five acceptance bullets in `spec/features/active/F001-read-nightly-run-logs/ticket.md` and the issue's "Done when" list. I found no blocking findings. `git rev-parse HEAD` returned a31fba9d375560743731c55375f8dde52f0981a9, which matches the candidate.

Reviewed: the complete diff `9127431..a31fba9` (`src/digest/types.ts`, `src/digest/reader.ts`, `test/digest.test.ts`, `HANDOFF.md`), plan.md §1–2, issue #1, and spec/build.md TRACK. The contract commit `ff1a5fc` (adds only `types.ts`) is the parent of the reader commit `a31fba9`, so the contract-first rule holds. `package.json`, `runs/`, and the routes are not in the diff.

Unverified: none of the acceptance checks. The repo has no tracked lockfile. The install used the untracked `pnpm-lock.yaml` that the `--prepare "pnpm install"` step created, and the worker left that file uncommitted on purpose. I did not use the retained worker artifacts as proof. Their test run is time-stamped after the commit, but they do not record the commit or the tree state. I reran the checks myself.

Acceptance, bullet by bullet (all proven by the test source plus my test run):
1. Real fixture, 5 jobs and 1 bad line. The test "reads the real night" compares the full `readNight` result for `runs/2026-10-28.jsonl` with `toEqual`: all 5 rows, `badLines: 1`, status counts ok 10, retry 4, fail 1. It also checks that the fixture bytes do not change.
2. Aggregation. The test "aggregates in file order" covers the repeated job `z`: runs, retries, per-status counts, last owner/status/error, and firstAt/lastAt with their original offsets (`+02:00` with fractional seconds, `-05:30`). The fixture rows `lane/sync` (8 runs) and `fixtures/refresh` (4 runs) are also asserted field by field.
3. Null owner. The fixture row `digest/render` keeps `owner: null`. The aggregation test gives `a` the owner `''` and `z` the owner `null`, and `toEqual` treats those as different values.
4. Missing, empty, malformed. Missing returns `{kind:'missing'}`. An empty file or a blank-only file returns `found` with zero rows, zero bad lines, and zero counts. A malformed-only file returns `found` with `badLines: 2`. Sixteen invalid-line cases (`it.each`) each count exactly 1 bad line and keep the valid rows around them.
5. `pnpm test` and `pnpm typecheck` pass (results below).

Checks run in this session, with real results:
- `pnpm install --frozen-lockfile`: "Lockfile is up to date", done.
- `pnpm test`: 2 files, 33 tests, all passed (vitest 5.0.5).
- `pnpm -s typecheck` (`tsc --noEmit`, which includes `src` and `test`): exit 0.
- `shasum -c` on `runs/*.jsonl` before and after the run: both files OK, unchanged.
- I ran a probe script with tsx from /tmp; it is not in the repo:
  - `readNight` on 2026-10-27 gives 4 jobs, 0 bad lines, ok 7.
  - A file that starts with a UTF-8 BOM counts its first valid line as bad.
  - A basic-format offset such as `+0100` counts as bad.
  - The night `'latest'` throws `RangeError`.
- `git status --short && git rev-parse HEAD && git diff --stat 9127431..HEAD`: exit 0. It shows only `?? pnpm-lock.yaml`, HEAD a31fba9, and 4 files changed.

Notes (none blocking):
- **Both commits say "closes #1"** (plausible risk). TRACK says sections 2a–2d start "after shared types reach main". If the coordinator lands `ff1a5fc` alone to unblock them, GitHub closes issue #1 before the reader exists. AGENTS.md rule 5 forbids that. If the contract lands first, change the message or land both commits together.
- **`HANDOFF.md` is committed at the root of the product repo** (proven by the diff). The workspace CLAUDE.md puts the handoff at `<challenge>/HANDOFF.md`, which is `s01e04/HANDOFF.md`, outside the product repo. When this lands, a challenge-process file with absolute local paths goes to main. The ticket does not forbid it, but it is scope drift. The coordinator should decide whether to drop it from the landing.
- **The reader is strict about timestamps** (proven by the probe). It counts these as bad lines: a UTF-8 BOM, basic ISO offsets (`+0100`), timestamps without an offset, and impossible dates. Neither night in `runs/` contains any of these, so the acceptance bullets are not affected. This could raise bad-line counts on future logs from a different writer.
- **The reader uses file order, not time order** (design choice). `firstAt`/`lastAt` and the "last" values follow the order of lines in the file. The contract and the tests document this, and both fixtures are already in time order.
- **`lastError` keeps the latest error after a job recovers** (design choice). A job whose last status is `ok` can still carry an error string, for example `fixtures/refresh` → 'upstream 503'. The contract documents this. The page and JSON workers (F002/F003) must decide how to show it.
- **An invalid night string throws `RangeError`** (proven). The route workers (F002/F003) must turn it into a 4xx response. Otherwise `/digest/latest` returns 500. The contract documents this.
- **The draft closing comment** (`artifacts/closing-comment.txt`) has the AGENTS.md shape. Its model route, pi · openai/gpt-6.1-sol · high, matches the worker route in TRACK. Issue #1 is still OPEN, as it should be.

Next step: the owner approves the landing or does not. Settle the "closes #1" wording on `ff1a5fc` and whether `HANDOFF.md` lands before merging.

Note check
- Diff read at the candidate HEAD: proven. `git status --short && git rev-parse HEAD && git diff --stat 9127431..HEAD`.
- Acceptance 1, real fixture with 5 jobs and 1 bad line: proven. `test/digest.test.ts`, test "reads the real night".
- Acceptance 2, aggregation across repeated jobs: proven. `test/digest.test.ts`, test "aggregates in file order".
- Acceptance 3, null owner distinct from the empty string: proven. `test/digest.test.ts`, the real-night and aggregation tests.
- Acceptance 4, missing, empty, and malformed results: proven. `test/digest.test.ts`, the empty/missing, malformed-only, and invalid-line `it.each` tests.
- Acceptance 5, `pnpm test` and `pnpm typecheck` pass: not proven by the note rule. Both ran in this session: 33 tests passed and tsc exited 0. But my bash calls joined commands with `;` and pipes, and I saved no log. The worker's `artifacts/pnpm-test.txt` and `artifacts/pnpm-typecheck.txt` do not record the commit. I did not repeat the full run only to clear the note.
- Verdict line: proven. The first line of this handoff is `PASS a31fba9d375560743731c55375f8dde52f0981a9`.
- Easy-to-miss rule (review only: no code or planning edits, no issue closure, merge, push, preview, or hosting): followed. `git status --short && git rev-parse HEAD && git diff --stat 9127431..HEAD` shows only the existing untracked `pnpm-lock.yaml`, and I ran no gh write, push, or merge command. The only file I wrote is this job's note.md, which the task required.
