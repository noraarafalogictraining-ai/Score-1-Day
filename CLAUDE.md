# SCORE Performance Hub — notes for Claude

The live site is served by Vercel straight from `index.html` on `main` (no build step on Vercel). Every push to `main` redeploys. Other branches get a Vercel preview deployment.

## Editing workflow
1. Edit the source files in `src/` (content and employee scenarios: `src/content.js`; see README.md). Never hand-edit `index.html`, `artifact.html` or `classic.html`.
2. Rebuild: `python3 build.py` (writes `index.html`, `artifact.html`, and `classic.html` from `legacy/`).
3. Test: `python3 tests/test_hub.py` (Python Playwright + Chromium; set `CHROMIUM_PATH` if needed). All checks must pass.
4. Commit `src/` changes together with the rebuilt HTML files.
5. Large changes go to a branch for a Vercel preview first; push to `main` only when the owner approves.

## Content rules
- Do not invent employee scenarios, business events, performance data or reference answers. Unapproved content stays as a labelled placeholder (`pending(...)` or `{ ph: true, text }`) and its `EMP_CONTENT` status stays `pending`.
- “Black Mirror” is an internal name only; never show it to participants.
- The classic version in `legacy/` is a frozen rollback copy: do not change it.

The owner is not a developer: explain changes in plain language.
