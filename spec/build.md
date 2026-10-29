# Build

> Coordinator-maintained narrative board. TRACK, NEXT, PARKED and DROPPED are coordinator prose: keep them true in the change that moves feature state. NOW and PROVEN are generated from the feature lanes by `limen land`, `limen ticket done` and `limen board --write`; edit the tickets, not those lines.

TRACK at most three bullets. NEXT one clause per ticket. PROVEN names the last ten landed features, then one count line per month.

Status marks are prose only: 🟠 ACTIVE · 🔴 PLANNED · 🟢 PROVEN · ⚪ DROPPED. Nothing in `limen` treats them as workflow state.

## TRACK

- **Morning digest (plan.md, 2026-10-29):** split plan.md into GitHub issues with the plan-to-issues skill after the owner approves the split; one worker per issue; previews and public hosting stay with the owner.
- **Standing models (owner, 2026-10-29), all via OpenRouter, always passed explicitly:** coordinator and workers `--engine pi --provider openrouter --model openai/gpt-6.1-sol --thinking high`; reviewer `--engine pi --provider openrouter --model anthropic/claude-opus-5.5 --thinking high`; scout and Picture `--engine pi --provider openrouter --model anthropic/claude-haiku-5.5 --thinking medium`. Never the package default model.

## NOW

<!-- Generated from spec/features/active/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

## NEXT

- `FNNN-slug` (PLANNED): <!-- One clause: likely outcome, dependency, or sequencing reason. -->

## PROVEN

<!-- Generated from spec/features/done/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->
