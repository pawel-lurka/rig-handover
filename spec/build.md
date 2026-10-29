# Build

> Coordinator-maintained narrative board. TRACK, NEXT, PARKED and DROPPED are coordinator prose: keep them true in the change that moves feature state. NOW and PROVEN are generated from the feature lanes by `limen land`, `limen ticket done` and `limen board --write`; edit the tickets, not those lines.

TRACK at most three bullets. NEXT one clause per ticket. PROVEN names the last ten landed features, then one count line per month.

Status marks are prose only: 🟠 ACTIVE · 🔴 PLANNED · 🟢 PROVEN · ⚪ DROPPED. Nothing in `limen` treats them as workflow state.

## TRACK

- **Morning digest (code landed locally, 2026-10-29):** issues #1–#5 are closed after owner-approved landings; sections 3–4, previews, public hosting, and plan archival stay with the owner; no Git push is authorized.
- **Standing models (owner, 2026-10-29), all via OpenRouter, always passed explicitly:** coordinator and workers `--engine pi --provider openrouter --model openai/gpt-6.1-sol --thinking high`; reviewer `--engine pi --provider openrouter --model anthropic/claude-opus-5.5 --thinking high`; Picture `--engine pi --provider openrouter --model openai/gpt-6.1-sol --thinking medium`; scout `--engine pi --provider openrouter --model anthropic/claude-haiku-5.5 --thinking medium`. Never the package default model.

- **Execution and HTTP contract:** pass `--prepare "pnpm install"` on every `limen spawn`; review section 1 on the reviewer route; obtain owner approval before any landing; JSON serializes the shared `NightDigest` result, and both digest routes return 404 for missing nights and 400 for invalid night arguments.

## NOW

<!-- Generated from spec/features/active/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

## NEXT


## PROVEN

<!-- Generated from spec/features/done/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

- `F005-test-digest-routes` (🟢 PROVEN): Test digest routes; landed 2026-10-29
- `F004-link-nights-from-the-board` (🟢 PROVEN): Link nights from the board; landed 2026-10-29
- `F003-serve-the-digest-as-json` (🟢 PROVEN): Serve the digest as JSON; landed 2026-10-29
- `F002-render-the-digest-page` (🟢 PROVEN): Render the digest page; landed 2026-10-29
- `F001-read-nightly-run-logs` (🟢 PROVEN): Read nightly run logs; landed 2026-10-29
- 2026-10: 5 landed. spec/features/done/2026-10/
