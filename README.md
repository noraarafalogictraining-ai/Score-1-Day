# SCORE One-Day Performance Management Simulation

An interactive simulation for LOGIC's one-day SCORE Performance Management program. Participants act as NextWave Digital's Commercial Director and manage one of four employees (Omar, Youssef, Salma, Mariam) across three rounds.

- **Live artifact:** https://claude.ai/artifact/XHbm1wXGUVL6bZYpGAbJQD
- **Format:** one self-contained HTML page (plain JavaScript, no framework, no server). Images and logos are embedded.
- **Progress:** saved in each participant's browser (localStorage key `score-oneday-nextwave-v3`).

---

## Simulation flow

| Step | Screen | Notes |
|---|---|---|
| Welcome | Home | NextWave and SCORE logos, round timeline |
| Round 1 · Behind the Performance | CEO Message + Meet the Team · Define the Need | Not scored. No group selection. |
| Pause 1 | Classroom learning | Facilitator release code **4826** |
| Group selection | Group 1–4 (numbers only) | Group 1 Omar · 2 Youssef · 3 Salma · 4 Mariam. Locks once the contract step starts. |
| Round 2 · Setting KPIs | Strategy and Objectives · Performance Contract | Role description, Commercial Objectives and Guide open as pop-ups |
| Round 2 results | Automated checks + guided self-assessment | |
| Pause 2 | Classroom learning | Facilitator release code **7319** |
| Round 3 · Performance Evaluation | Performance Review (evidence log) · Identify Gaps · Evaluate & Rate | 5 fixed evidence entries per employee; rating editable until submit |
| Round 3 results | Reference reading + automated results + guided self-assessment | |
| Final summary | SCORE Performance Debrief | Application Score, star rating, 10-criterion debrief, SCORE Practice Check |

Facilitator validation code: **5050** (results pages and summary).

Release codes are a local gate on each device. They are visible in the page source, so they prevent accidental skipping, not determined bypassing.

---

## Scoring (hybrid)

**Application Score = (Round 2 /10 + Round 3 /10) × 5 → out of 100.**
Each criterion: 2 Applied effectively · 1 Partially applied · 0 Not demonstrated. Round 1 is not scored.

| # | Criterion | Type |
|---|---|---|
| 1 | Strategic Alignment | Self-assessed, limited by automated checks |
| 2 | Role Relevance | Self-assessed, limited by automated checks |
| 3 | KPI Quality | Self-assessed |
| 4 | WHAT & HOW Balance | Self-assessed (Youssef limited to 1 without the people side) |
| 5 | Performance Clarity | Self-assessed |
| 6 | Evidence Coverage | Self-assessed, limited by automated checks |
| 7 | Facts vs. Interpretation | Automated |
| 8 | Standards-Based Evaluation | Automated against a provisional reference |
| 9 | Evidence-Based Justification | Self-assessed, limited by automated checks |
| 10 | Fair Evaluation | Self-assessed, limited by automated checks |

- Self-assessment happens after each round is submitted: the group picks a rubric level and writes a one-line reason. Levels above the automated limit are disabled.
- A facilitator can validate (override) any criterion except #7.
- The result is **provisional** until all ten criteria are assessed; unassessed criteria count as 0 and are flagged.
- The Black Mirror star rating starts at 3.00 and moves after each fully assessed round (9–10 +0.50 · 7–8 +0.25 · 5–6 0 · 3–4 −0.25 · 0–2 −0.50). It is a game indicator, not a validated leadership measure.
- Written text is never scored. No points for clicks or opening screens.

The exact rules are in `n_score.js` (`CRITERIA`, `R3_KEY`, `ROLE_GUIDE`) and in the project doc `14-score-one-day-scoring.md`.

---

## Source files

The page is assembled by `build.py` from the files in `src/`, in this order:

| File | Contents |
|---|---|
| `p_head.html` | Page head, styles from v26, embedded images (`IMG`: logos, portraits) |
| `n_style.css` | One-day additions to the styles (injected into the head) |
| `p_data.js` | Company, department, employee profiles, Commercial objective options, evidence sources, groups |
| `n_data.js` | Rounds and tabs, release codes, Round 1 content and voice-note scripts, Guide topics, Round 3 evidence logs (`LOG`), agreed standards (`STD`), fact/interpretation statements (`SORT`), reference evaluations (`REF`) |
| `n_state.js` | Saved state shape and loading |
| `p_engine.js` | Shared helpers from v26: saving, text helpers, icons, portraits, voice notes, form controls |
| `p_r2.js` | Round 2 screens: Commercial objectives step, performance contract editor (patched by `build.py`) |
| `p_company.js`, `p_profile.js` | Company profile page and employee profile pop-up |
| `n_app.js` | View helpers: CEO chat, evidence log table, standards table, Guide |
| `n_score.js` | Hybrid assessment engine: criteria, caps, rubrics, reference readings, debrief and self-assessment rendering, facilitator panel, Practice Check |
| `n_views.js` | Round 1 and Round 3 screens, results pages, summary, navigation, top bar, actions and events |

Files starting with `p_` were carried over from the approved v26 simulation; files starting with `n_` are new for the one-day version.

### Repository layout

```
index.html      built page (full HTML document) — this is what Vercel serves
artifact.html   same page without <html>/<body> tags, for republishing as a Claude artifact
build.py        assembles src/ into index.html and artifact.html
src/            source files listed above
tests/          test.py (UI click-through), qa.py (scoring engine tests)
vercel.json     static hosting settings
```

### Building

```bash
python3 build.py          # writes index.html and artifact.html
```

Commit the rebuilt `index.html` after any change; Vercel serves it as-is (no build step).

### Testing

Requires Python Playwright with Chromium. Run `python3 build.py` first.

```bash
python3 tests/test.py   # full click-through for all four groups, including self-assessment
python3 tests/qa.py     # scoring engine tests: strong, weak, wording, defensible ratings, clicks, provisional, overrides
```

### Pushing to GitHub with Claude Code

1. Unzip this folder on your computer and open it in Claude Code (`cd score-one-day` then `claude`).
2. Make sure GitHub is signed in (`gh auth login` if needed).
3. Paste this prompt:

> Initialise a git repository in this folder on branch `main`, commit all files, create a new **private** GitHub repository called `score-one-day` under my account, and push. Do not change any files. Then show me the repository URL.

To use an organisation account or a public repository, change the prompt accordingly.

### Deploying on Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Framework preset: **Other**. Leave Build Command and Output Directory empty.
3. Deploy. Every push to the main branch redeploys automatically.

---

## Editing common content

| To change | Edit |
|---|---|
| Release codes | `RELEASE_CODES` in `n_data.js` |
| Facilitator code | `FAC_CODE` in `n_score.js` |
| Voice-note scripts (Round 1) | `NEEDS[emp].message` in `n_data.js` |
| Evidence log entries | `LOG` and `LOG_EXTRA` (impact, manager action, status) in `n_data.js` |
| Agreed standards | `STD` in `n_data.js` |
| Reference ratings and rationale | `REF` in `n_data.js`; ranges and per-standard readings in `R3_KEY` in `n_score.js` |
| Rubrics, feedback text, model guidance | `CRITERIA` and `ROLE_GUIDE` in `n_score.js` |
| Guide topics (Round 2) | `TOOLKIT` in `n_data.js` |

After any change, run `python3 build.py`, commit and push; Vercel redeploys.

---

## Items awaiting validation

- Round 3 reference readings and rating ranges (Omar 3–4, Youssef 3–4, Salma 3, Mariam 2–3) and model guidance are provisional and need subject-matter expert review.
- Impact and manager action text in the evidence logs was written for this version; it does not change any employee's results.
- Fair Evaluation Test and Objective Setting Guidelines: course wording to be inserted.
- Interpretation entries appear only in Omar's evidence log.
- Voice notes use the device's built-in text-to-speech; real recordings would sound more natural.
