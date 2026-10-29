# Build

> Coordinator-maintained narrative board. TRACK, NEXT, PARKED and DROPPED are coordinator prose: keep them true in the change that moves feature state. NOW and PROVEN are generated from the feature lanes by `limen land`, `limen ticket done` and `limen board --write`; edit the tickets, not those lines.

TRACK at most three bullets. NEXT one clause per ticket. PROVEN names the last ten landed features, then one count line per month.

Status marks are prose only: 🟠 ACTIVE · 🔴 PLANNED · 🟢 PROVEN · ⚪ DROPPED. Nothing in `limen` treats them as workflow state.

## TRACK

- **Morning digest (approved split, 2026-10-29):** implement issues #1–#5 with one worker each, section 1 first and sections 2a–2d in parallel after shared types reach main; sections 3–4, previews, public hosting, and plan archival stay with the owner.
- **Standing models (owner, 2026-10-29), all via OpenRouter, always passed explicitly:** coordinator and workers `--engine pi --provider openrouter --model openai/gpt-6.1-sol --thinking high`; reviewer `--engine pi --provider openrouter --model anthropic/claude-opus-5.5 --thinking high`; Picture `--engine pi --provider openrouter --model openai/gpt-6.1-sol --thinking medium`; scout `--engine pi --provider openrouter --model anthropic/claude-haiku-5.5 --thinking medium`. Never the package default model.

- **Execution:** pass `--prepare "pnpm install"` on every `limen spawn`; review section 1 on the reviewer route; obtain owner approval before any landing.

## NOW

<!-- Generated from spec/features/active/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

## NEXT

- `F002-render-the-digest-page` (PLANNED): HTML digest starts after shared reader types reach main.
- `F003-serve-the-digest-as-json` (PLANNED): JSON digest starts after shared reader types reach main; comparison needs the HTML route.
- `F004-link-nights-from-the-board` (PLANNED): night links and counts start after shared reader types reach main; destination checks need the HTML route.
- `F005-test-digest-routes` (PLANNED): route tests start after shared reader types reach main; final proof needs HTML and JSON routes.

## PROVEN

<!-- Generated from spec/features/done/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

- `F001-read-nightly-run-logs` (🟢 PROVEN): Read nightly run logs; landed 2026-10-29
- 2026-10: 1 landed. spec/features/done/2026-10/
