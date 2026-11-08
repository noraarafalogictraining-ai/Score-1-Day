# SCORE One-Day Simulation — notes for Claude

The live site is served by Vercel straight from `index.html` on `main` (no build step on Vercel). Every push to `main` redeploys.

## Editing workflow
1. Edit the source files in `src/` (see "Editing common content" in README.md for where things live). Never hand-edit `index.html` or `artifact.html`.
2. Rebuild: `python3 build.py` (writes `index.html` and `artifact.html`).
3. Test: `python3 tests/qa.py` and `python3 tests/test.py` (need Python Playwright + Chromium). "Failed to load resource" errors are the Google Fonts requests the tests block on purpose.
4. Commit `src/` changes together with the rebuilt `index.html` and `artifact.html`, then push to `main`.
5. After the push, check the production site loads (home page shows the NextWave logo and round timeline).

The owner is not a developer: explain changes in plain language.
