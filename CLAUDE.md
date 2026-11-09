# SCORE Performance Hub — Omar pilot — notes for Claude

Vercel serves `public/` (built from `src/` by `python3 build.py`) and runs the serverless functions in `api/` (Node 20+, `@anthropic-ai/sdk`). Live AI needs `ANTHROPIC_API_KEY` in Vercel's environment variables. `main` is live; other branches get preview deployments.

## Editing workflow
1. Participant-visible content: `src/pilot.js`, `src/content.js`. Confidential content (hidden facts, reference answers, year-end datasets): `api/_lib/scenario_omar.js`. Rubrics, points and rules: `api/_lib/rubrics.js`. Never put confidential content in `src/`.
2. Rebuild: `python3 build.py` (writes `public/index.html` and `public/classic.html`). Never hand-edit files in `public/`.
3. Test: `npm install`, then `python3 tests/test_pilot.py` (starts `server/dev.js` itself; set `CHROMIUM_PATH` if needed). All checks must pass.
4. Commit `src/`, `api/` and the rebuilt `public/` together. Large changes go to a branch for a Vercel preview; push to `main` only when the owner approves.

## Rules
- Do not present scripted responses as AI. Test mode (`SCORE_AI_PROVIDER=mock`) is for automated tests only and is labelled on screen.
- Do not invent important performance facts; document any pilot assumption in README.md.
- "Black Mirror" is an internal name only. The classic version in `legacy/` is a frozen rollback copy.

The owner is not a developer: explain changes in plain language.
