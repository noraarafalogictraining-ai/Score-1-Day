# NextWave | SCORE Performance Hub

The SCORE one-day performance management simulation, redesigned as a corporate performance management platform. Participants manage one NextWave Digital employee (Omar Hassan, Youssef Ali, Salma Tarek or Mariam Adel) through a full performance year: goal setting, alignment, monitoring, a mid-year check-in and the year-end appraisal.

- **Format:** one self-contained HTML page (plain JavaScript, no framework, no server). Images are embedded.
- **Hosting:** Vercel serves `index.html` as-is (no build step on Vercel).
- **Progress:** saved in each participant's browser (localStorage key `score-hub-nextwave-v1`).
- **Classic version:** the previous three-round simulation is preserved unchanged at `/classic` (source in `legacy/`). Rollback branch: `rollback/v1-classic`.

---

## Workflow (login → final appraisal)

| # | Screen | What happens | SCORE |
|---|---|---|---|
| 1 | **Login** | Manager name + password field (training mode: nothing is stored). Resume a saved session on this device. | |
| 2 | **HR email** “Annual Performance Goal Setting — Action Required” | Opens automatically after sign-in. Button: *Open Performance Goal Plan*. | |
| 3 | **Home** | Select the employee (facilitator assigns one per table). Stage tiles with status, pending actions, HR inbox. | |
| 4 | **Performance Goals** | Objectives & KPIs · Competencies & Behavioral Expectations · Review & Submit. | Round 1 |
| 5 | **Employee alignment** pop-up | Status *Pending Employee Alignment*. Structured conversation: respond, revise the plan, or reach agreement and *Confirm alignment*. | Round 1 |
| 6 | **HR email** “Performance Contract Confirmed — Monitoring Begins” | Contract approved and locked. Evidence Log opens. | |
| 7 | **Evidence Log** | Managers record evidence from the printed handouts. | |
| 8 | Offline: business event | Facilitator releases the mid-year check-in (code **4826**, or from the Facilitator view). | |
| 9 | **Mid-Year Check-In** chat | “Mid-Year Performance Check-In Required”. Manager picks 2–4 diagnostic questions in any order, then closes the check-in. | |
| 10 | Offline: intervention | Facilitator runs the intervention activity, hands out year-end evidence, then releases the appraisal (code **7319**). | |
| 11 | **Final Appraisal** | Section A WHAT, Section B HOW, Section C Overall, all pre-filled from Round 1. | Round 2 |
| 12 | **Employee reaction** pop-up | Employee responds; manager reflects on possible biases, keeps or revises the evaluation, and records a justification. | Round 2 |
| 13 | **SCORE Review** | Guided self-assessment per criterion, Application Score, SCORE Practice Check. | Assessment |

Facilitator view (user menu → *Facilitator view*, code **5050**): round structure and status, stage releases, criterion validation, game indicator, employee content status, reset.

Codes are a local gate on each device and are visible in the page source.

### Status values

| Area | Statuses |
|---|---|
| Performance Goals | Not Started → Draft → Pending Employee Alignment → Approved (a revision returns it to Draft) |
| Evidence Log | Not Yet Open → Not Started → In Progress |
| Mid-Year Check-In | Not Yet Open → Action Required → In Progress → Completed |
| Final Appraisal | Not Yet Open → Not Started → Draft → Submitted → Completed |

---

## Form fields

**Performance objective** (3–5 recommended, up to 8; weights must total 100%)
Objective* · KPI / Performance measure* · Weight (%)* · Evidence source* (list + Other → name it) · Review frequency*.
Removed on purpose: linked business objective, separate target, due date, competency inside the objective.

**Competency plan** (3–5 required)
Competency (from the employee's library) · Expected proficiency level* (Basic / Intermediate / Advanced) · observable behaviours for that level (shown) · Expected behavioral standard (optional).

**Evidence Log entry**
Date / Period* · KPI / Competency* (linked to the plan) · Evidence / Observation* · Source* · Impact · Manager action / Follow-up · Status (Open / Ongoing / Completed). Add, edit, delete (with undo), filter by objective or competency.

**Final Appraisal**
- A · per objective: objective, KPI, weight (from Round 1) · Actual performance* · Rating 1–5* · Supporting evidence / justification*.
- B · per competency: name, description, expected level, expected behaviours, agreed standard (from Round 1) · Observed behaviours* · Rating 1–5* · Supporting justification*.
- C · Overall WHAT rating* · Overall HOW rating* · Final overall rating 1–5* · Final justification* · Key strengths* · Development priorities*. No fixed WHAT/HOW formula.

**Post-appraisal reflection**
Response choice · optional bias checklist (recency, halo, horn, leniency/severity, similarity, results over behaviours) · Decision (keep / revise)* · Short justification*.

Rating scale: 5 Exceptional · 4 Exceeds Expectations · 3 Meets Expectations · 2 Below Expectations · 1 Unsatisfactory.

---

## Assessment (SCORE layer)

**Application Score = (Round 1 /10 + Round 2 /10) × 5 → out of 100.** Each criterion: 2 Applied effectively · 1 Partially applied · 0 Not demonstrated.

| Round | Criteria |
|---|---|
| 1 · Setting Performance Expectations | Strategic Alignment · Role Relevance · KPI Quality · WHAT & HOW Balance · Performance Clarity |
| 2 · Final Performance Appraisal | Evidence Coverage · Facts vs. Interpretation · Standards-Based Evaluation · Evidence-Based Justification · Fair Evaluation |

- **Automated checks** verify structure only (weights, completeness, evidence linked to each objective/competency, consistency of the final rating with WHAT/HOW, reflection completed). They set the highest level a group can self-assess.
- **Guided self-assessment**: the group picks a rubric level and gives a one-line reason.
- **Facilitator validation** overrides any criterion.
- Free text is never scored automatically; a number in a KPI is not treated as proof of quality; which competencies are chosen is not scored automatically.
- Reference ratings and rating ranges are **not configured** until the employee scenarios are approved (`EMP_CONTENT[emp].yearEndGuidance.ratingRange`).
- The star-rating game indicator (internally “Black Mirror”, starts at 3.00, moves ±0.50 per fully assessed round) appears only in the Facilitator view.

Rules: `src/score.js`.

---

## Employee content configuration

All content lives in `src/content.js`. Each employee has a package of 16 sections in `EMP_CONTENT[emp]`, each with a **status** (`approved` · `provisional` · `pending`) and a **channel** (`digital` · `offline` · `facilitator`):

| # | Section | Status now | Channel |
|---|---|---|---|
| 1 | Employee story | approved (classic) | offline |
| 2 | Job description and strengths | approved | digital (profile) |
| 3 | Underlying employee need | approved (classic Round 1) | offline |
| 4 | Previous-year evidence | approved | digital (profile) |
| 5 | Recommended objectives and KPI guidance | provisional | facilitator |
| 6 | Role-relevant competencies | **pending** | digital |
| 7 | Three proficiency levels per competency | **pending** | digital |
| 8 | Employee reaction to the performance contract | **pending** | digital |
| 9 | Mid-year business event and impact | **pending** | offline |
| 10 | Stakeholder feedback | **pending** | offline |
| 11 | Diagnostic conversation | **pending** | digital |
| 12 | Constructive and unhelpful intervention references | **pending** | offline |
| 13 | Intervention consequences | **pending** | offline |
| 14 | Year-end evaluation guidance | **pending** | facilitator |
| 15 | SBI feedback scenario | **pending** | offline |
| 16 | Post-appraisal bias reflection | **pending** | digital |

### Adding approved content

- **Competencies**: add entries to `ROLE_COMPETENCIES[emp]` (`{ id, name, description, levels: { basic: [...], intermediate: [...], advanced: [...] } }`). Core NextWave competencies are in `CORE_COMPETENCIES`; replace their `pending(...)` descriptions and levels with approved text.
- **Contract reaction**: set `EMP_CONTENT[emp].contractReaction.script` to a script with the same shape as `ALIGNMENT_DEFAULT` (nodes with employee text and 2–3 manager options; `outcome: "align"` or `"revise"`).
- **Diagnostic conversation**: set `EMP_CONTENT[emp].diagnostic.script` (shape of `DIAGNOSTIC_DEFAULT`: opening + question bank with purpose, question and employee answer).
- **Post-appraisal reaction**: set `EMP_CONTENT[emp].biasReflection.script` (shape of `REACTION_DEFAULT`).
- Text objects written as `{ ph: true, text }` or created with `pending(...)` display with a yellow **Pending content approval** label. Approved text is plain strings (or `{ text }` without `ph`).
- Then set the section's `status` to `"approved"`. The Facilitator view shows the status of every section for every employee.

---

## Source files

`build.py` assembles `src/` in this order into `index.html` and `artifact.html`, and rebuilds `classic.html` from `legacy/`:

| File | Contents |
|---|---|
| `head.html` | Page head and styles (SCORE navy chrome, light workspace, responsive rules) |
| `assets.js` | Embedded images (`IMG`: logos, portraits), unchanged from the classic version |
| `employees.js` | Approved company and employee data, unchanged copy of the classic `p_data.js` |
| `content.js` | Content configuration: vocabularies, competency library, conversation scripts, HR emails, employee packages, codes |
| `state.js` | Saved state, migration from the classic version, workflow status, validation |
| `score.js` | SCORE assessment layer |
| `ui.js` | Icons, routing, header, sidebar, rendering |
| `views_core.js` | Login, Home, HR Inbox, Facilitator view |
| `views_goals.js` | Performance Goals, alignment conversation |
| `views_monitor.js` | Evidence Log, mid-year check-in, release gates |
| `views_appraisal.js` | Final Appraisal, employee reaction and bias reflection |
| `views_review.js` | SCORE Review |
| `events.js` | Actions and event handling |

### Building and testing

```bash
python3 build.py
```

```bash
python3 tests/test_hub.py --shots
```

The test (Python Playwright + Chromium; set `CHROMIUM_PATH` if Playwright's own browser is not installed) walks the whole workflow (86 checks) and saves screenshots to `tests/shots/`. Classic tests: `legacy/tests/`.

### Migration from the classic version

The classic version saved under `score-oneday-nextwave-v3`. On sign-in the hub offers to bring in that group's employee and objectives as a draft goal plan; the classic data is never modified or deleted.
