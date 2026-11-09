# NextWave | SCORE Performance Hub — Omar Hassan pilot (Version 1)

A three-round performance management simulation for senior managers. The participant is NextWave's **Commercial Director** and manages **Omar Hassan, Market Intelligence Analyst**, across a simulated year. Omar's journey is the only active one; Youssef Ali, Salma Tarek and Mariam Adel appear as colleagues and stakeholders.

- **Front end:** one static page (`public/index.html`, plain JavaScript), built from `src/` by `build.py`.
- **Server:** Vercel serverless functions in `api/` (Node 20+, Anthropic SDK). Omar's conversations and all assessments run here, so hidden facts, rubrics and the API key never reach the browser.
- **Progress:** saved in the participant's browser (`localStorage` key `score-pilot-omar-v1`); survives refresh.
- **Classic version:** unchanged at `/classic` (source in `legacy/`). Rollback branch: `rollback/v1-classic`.

---

## Running the pilot

### On Vercel
1. In the Vercel project, open **Settings → Environment Variables** and add `ANTHROPIC_API_KEY` (your Anthropic API key) for Production and Preview. Optional: `SCORE_MODEL` (default `claude-opus-5-5`).
2. `vercel.json` already sets the install command (`npm install`), the output folder (`public`) and the function timeout. Leave the dashboard's Build Command empty.
3. Push the branch; Vercel builds a preview. Open it, sign in, and check the yellow/red banner at the top: no banner means live AI is working.

### On a laptop
```bash
npm install
```
```bash
python3 build.py
```
```bash
ANTHROPIC_API_KEY=your-key node server/dev.js
```
Open http://localhost:3000. Without a key the app runs but clearly states that live AI conversations are unavailable. `SCORE_AI_PROVIDER=mock node server/dev.js` starts the **scripted test mode** used by the automated tests (labelled on screen; it is not AI).

### Tests
```bash
python3 tests/test_pilot.py --shots
```
Walks the full Omar journey in Chromium against the local server (test mode and no-AI mode) and checks the API. Screenshots go to `tests/shots/`. Set `CHROMIUM_PATH` if Playwright's own browser is not installed. Classic tests: `legacy/tests/`.

---

## Participant interface (Phase 1 UI)

The participant sees a corporate employee platform, not a training exercise: no round labels, progress trackers or simulation wording. The three rounds still run internally (content release, events, conversations, scoring) and remain visible in the Facilitator view.

- **Login:** "Welcome to NextWave", Username, Password, Sign In. It follows the original SCORE artifact design (navy with cyan and purple glows, NextWave logo). This is training sign-in: any username, the password is not checked or stored. A saved session shows a discreet "Continue as …" link.
- **Top bar:** NextWave logo, Employee Pulse (three ring indicators: Performance blue, Trust teal, Development purple; hover for meaning, click for details and history), notifications, and a user menu with **My Profile**, **Facilitator View** and **Sign Out**.
- **Sidebar:** Home · My Inbox · Business Dashboard · Performance Management (Objectives, Evidence Log, Final Appraisal) · Employee Conversations.
- **Home (Commercial overview):** Omar's employee overview and the commercial dashboard. At the start of the year it shows the CEO targets with baseline placeholders; after the Valtora release, the agreed mid-year figures; after the year-end update, the company's December figures. Home and Business Dashboard use the same data. KPI cards expand, chart months are clickable, and there is a trend / period-comparison switch and an expandable business alert.
- **My Profile:** the participant as Commercial Director (name from login): employment information, job description, the CEO-set objectives for 2027 (read-only) and the reporting line with four direct reports.
- **Relocated:**
  - The year-end update arrives as an HR email with the evidence attached ("Open"), and the appraisal is opened from that email.
  - The Round 2 checklist is now **Mid-year review**, reached from the Evidence Log and the conversation.
  - SCORE Review is now a **feedback report**, shown to participants after the final appraisal (via the HR completion email) and to the facilitator at any time.
  - Release codes are typed into the Facilitator View code box: **4826** releases the business event, **7319** releases the year-end update, **5050** opens the Facilitator view.

Configuration: the director profile, job description and CEO objectives are `DIRECTOR` and `CEO_OBJECTIVES` in `src/pilot.js` (provisional fictional targets, separate from Omar's data). Company year-end figures for the dashboard come from the server (`COMPANY_YEAR_END.metrics` in `api/_lib/scenario_omar.js`), so they stay hidden until released.

## Phase 2: objectives, competencies and the Omar chat

- **Objectives** has two tabs, **Performance Objectives** and **Competencies**. Each objective is Objective, KPI / Performance measure (target written into it) and Weight. Evidence Source and Review Frequency were removed from the form, the validation and the assessment. *Add Objective* sits above the list; validation (blocking gaps plus advisory quality prompts) sits under each tab. *Submit for Employee Alignment* is enabled when both tabs are complete.
- **Competencies:** select 3–5 from the library (names only), choose Basic / Intermediate / Advanced, and write a required **Expected Behavioral Standard**. Level descriptions are no longer shown; participants use the printed competency dictionary. The descriptions stay on the server (`COMPETENCY_LEVELS` in `api/_lib/scenario_omar.js`) for the assessment, which judges whether each written standard is observable and fits its level.
- **KPI scoring** (still 20 points): relevance 3, clarity 2, measurability 4, target specificity and reasonableness 3, controllability 3, alignment with commercial priorities 2, weights and balance 3.
- **One continuous chat with Omar**, opened from his round photo button (red unread badge) or from the **Chat** entry at the top of My Inbox. It replaces the Employee Conversations page. The thread shows a December 2026 welcome exchange (configured in `CHAT.history`, never scored), then:
  - Omar's January message after the plan is submitted;
  - his June support request when the business event is released;
  - his December reply after the appraisal is submitted.

  The chat never opens by itself, and messages are added once only, so they don't repeat on refresh or repeat clicks.
- **Internally** each message still belongs to its own context (alignment, diagnostic, appraisal). Only that context's messages go to the AI and to its assessment, with earlier agreements passed as background. The mid-year conversation closes when the mid-year review is submitted. The appraisal conversation closes with *Continue to bias reflection* on the appraisal page.
- **Omar's style:** natural workplace chat, usually 1–3 short sentences, concrete when asked, no theory, no coaching the manager, no automatic agreement. In January he says only that he has a concern; he explains it when asked.

## Phase 3: communications, dashboard and profile

- **Mid-year emails (5)** arrive in My Inbox as soon as the business event is released (`STAKEHOLDER_EMAILS` in `src/pilot.js`):
  - Nadine Farouk, Operations Director;
  - Youssef Ali;
  - Salma Tarek, addressed to Youssef with the Commercial Director in Cc;
  - Mariam Adel, labelled secondhand and unverified;
  - Nour, Account Manager, a company-wide email with To and Cc in hierarchy order.

  Each email shows From, To and Cc. Nour's positive customer feedback is not attributed to Omar and does not change the Pulse.
- **Sender images** are stored in `public/assets/`: `people/nadine.jpg`, `people/nour.jpg` and `brand/hr-team.png` (the approved HR TEAM logo, transparent outside the circle). Employees keep their existing photos. To swap Nadine's and Nour's photos, edit `img` in `STAKEHOLDERS`.
- **Email notifications:** each new email shows an Outlook-style pop-up (top right) with the sender's photo, name, subject, preview and an unread dot. They appear one at a time, about 1.4 s apart, and close after 6.5 s or when dismissed. Clicking one opens the email and marks it read. Announced emails are saved, so a refresh never repeats them. Omar's chat message arrives independently: "Hi, do you have a few minutes? Things have been quite difficult since the Valtora announcement, and I'd appreciate your support."
- **Competencies** are added from an *Add Competency* dropdown that hides the ones already selected. Each one becomes a compact card with level, written standard and remove.
- **My Profile** has three tabs:
  - **Overview:** information cards and an interactive organisation chart. There are 3 direct reports, and Salma reports to Youssef in a branch that can be opened and closed.
  - **My Responsibilities:** the job purpose and expandable responsibility groups.
  - **My Performance Objectives:** clickable, read-only cards for the CEO's objectives.
- **Sidebar:** Home · My Inbox · Performance Management (Objectives, Evidence Log, Final Appraisal). The old Business Dashboard link opens Home. The interpretation of the business data is now written on the **Mid-year review** page.
- **Home dashboard (Power BI style):**
  - title bar, a period filter (Start of Year / Mid-Year / Year-End) and focus chips (All / Conversion / Pipeline / Market / Growth);
  - five KPI cards that expand to show definition, source, CEO objective and values by period;
  - a trend chart with hover values, month selection and series toggles, and a period comparison with target markers;
  - a win-rate gauge, donut charts and business insights.

  A period unlocks only after its release, and the dashboard switches to the newest period when results arrive. All figures come from one source (`bizData` in `src/views_monitor.js`, using `DASHBOARD` and the server's year-end company figures). Figures the scenario doesn't define (for example revenue growth actuals) show "—" with "Not published".

## The three-round experience (facilitator view of the structure)

| Round | What happens | Facilitator |
|---|---|---|
| **1 · Setting Performance Expectations** | HR email → Goal Plan (objective, KPI with target, weight, evidence source, review frequency; weights must total 100%) → 3–5 competencies with expected proficiency levels (three observable levels shown) → *Submit for Employee Alignment* → status **Pending Employee Alignment** → **open-text AI conversation** with Omar, who opens with his fairness concern → *Confirm alignment* appears only when Omar's concern has been meaningfully addressed → HR "Contract Confirmed" email | — |
| **2 · Performance Gaps, Diagnosis & Coaching** | Business alert → **Business Dashboard** (KPI cards, March–June trend chart, before/after bars, market intelligence indicators kept separate from business outcomes) → four stakeholder emails (Mariam's marked *secondhand, unverified*) → Omar's chat request → **open-text diagnostic and coaching conversation** (dashboard and inbox stay one click away) → participant writes their interpretation of the data and completes the Evidence Log → *Submit Round 2* | Announces Valtora (script in the Facilitator view), then releases it (code **4826** in the Facilitator View code box, or the release button) |
| **3 · Final-Year Performance Evaluation** | Year-end performance update (dataset depends on the Round 2 pathway) → appraisal pre-filled with the Round 1 objectives, KPIs, weights and competencies (WHAT, HOW, overall) → Omar responds in an **open-text appraisal conversation** → **bias reflection** grounded in the participant's own reasoning → reconsider or finalise → final SCORE assessment and Employee Pulse outcome | Releases the year-end update (code **7319**) |

The **Employee Pulse** (Performance, Trust, Development; 0–100) is always visible in the header, with a full event history. The **SCORE Review** shows each round's criteria with the score, evidence quotes, reason, confidence and missing information.

Facilitator view: user menu → *Facilitator view* (code **5050**). It shows the AI status, round releases, the Valtora announcement, the Round 2 pathway, the Pulse history, per-criterion score overrides, and manual controls for when AI is unavailable (confirm alignment, end conversations, set pathway A/B/C, finalise the appraisal). Codes are a local gate on each device and are visible in the page source.

---

## Configuration (for the instructional design team)

| What | File | Visible to participants? |
|---|---|---|
| Omar's profile, previous-year evidence and feedback, products, competency library and levels, dashboard numbers, stakeholder emails, Valtora announcement, **Pulse rules and baseline** | `src/pilot.js` | Yes |
| HR emails, dates, codes, form vocabularies | `src/content.js` | Yes |
| Omar's character, hidden scenario facts, conversation openings and behaviour rules, **reference model answers**, strong-diagnosis reference, **year-end evidence datasets** | `api/_lib/scenario_omar.js` | **No** (server only) |
| **Assessment rubrics and point weights**, pathway and Pulse-event rules | `api/_lib/rubrics.js` | **No** (server only) |
| Assessment and character prompts | `api/_lib/prompts.js` | **No** (server only) |

After editing `src/`, run `python3 build.py`. Server files take effect on the next deploy.

---

## AI conversation engine

Three separate responsibilities:

1. **Employee simulation model** (`api/converse.js`): generates Omar's replies from his profile, fairness need, the submitted plan, the manager's messages, the conversation so far, earlier decisions and the current Pulse (Trust sets his openness). Hidden facts are revealed progressively when the manager asks relevant questions. Plain text, kept short (1–3 sentences, normally under 50 words, one point per reply), no multiple choice.
2. **Assessment model** (`api/assess.js`): evaluates the participant's demonstrated behaviour against the rubric and returns structured JSON for each criterion: `id`, `score`, `max`, `evidence` (verbatim quotes), `reason`, `confidence`, `missing`. In Round 1 a short assessment after each manager message decides whether Omar's concern has been meaningfully addressed; empathy alone ("I understand") is not enough.
3. **Rules engine**: deterministic code applies scores, Round 2 pathway, Pulse changes and progression (`RULES` in `api/_lib/rubrics.js`; Pulse values in `src/pilot.js`, applied by `applyPulse` in `src/state.js`).

Safeguards: the API key, hidden facts, rubrics and datasets stay on the server; Vercel serves only `public/`. Inputs are validated (types, lengths, history size). The conversation history must start with the real scenario opening. Participant text is treated as data: attempts to make Omar reveal facts or scores, or to award full marks, are ignored. Evidence quotes are checked against what the participant actually wrote, and fabricated quotes are removed. Inputs that are empty earn zero (no conversation, no log, no interpretation). With no AI provider configured, the server answers `503 ai_unavailable` and the app says so plainly; it never substitutes scripted replies. Refusal fallback is enabled (`fallbacks: "default"`), so a safety refusal is retried on another model by Anthropic.

Model: `claude-opus-5-5` (change with `SCORE_MODEL`). Omar replies use low effort for speed; assessments use medium effort.

---

## Scoring (provisional pilot weights, total 100)

| Round | Group | Points |
|---|---|---|
| 1 (35) | Objectives and KPI quality (relevance, clarity, measurability, target, controllability, evidence, review frequency, balance) | 20 |
| | Competency selection and expectations | 10 |
| | Employee alignment conversation | 5 |
| 2 (40) | Business data interpretation | 5 |
| | Performance gap diagnosis (four causes + evidence-based conclusions) | 15 |
| | Coaching and intervention | 15 |
| | Evidence Log | 5 |
| 3 (25) | WHAT evaluation | 10 |
| | HOW evaluation | 5 |
| | Overall rating and justification | 5 |
| | Appraisal conversation and bias reflection | 5 |

Change the `max` values in `api/_lib/rubrics.js`. The Learning Score is separate from the Employee Pulse.

**Round 2 pathway** (from diagnosis D and coaching C scores plus behaviour flags): blaming, or D + C < 12 → **C**; D ≥ 10 and C ≥ 10 → **A**; otherwise **B**.

## Employee Pulse rules (configurable in `src/pilot.js`)

Baseline: Performance 80, Trust 60, Development 55 (fictional). Each event belongs to a slot that can be applied only once.

| Event | When | Perf. | Trust | Dev. |
|---|---|---|---|---|
| Fair and clear alignment | Round 1 alignment assessed "fair" | +2 | +6 | +3 |
| Dismissive alignment | assessed "dismissive" | 0 | −8 | −2 |
| Mid-year business disruption | Round 2 released | −5 | 0 | 0 |
| Constructive diagnosis and coaching | not blaming, constructive, coaching ≥ 9/15 | 0 | +5 | +4 |
| Punitive or blaming conversation | blaming | 0 | −9 | −4 |
| Development intervention with follow-through | pathway A, when year-end outcomes are revealed | +3 | +3 | +8 |
| Unfair final appraisal | appraisal assessed "unfair" | 0 | −10 | −4 |
| Fair, evidence-based appraisal | assessed "fair" | 0 | +5 | +4 |

"Mixed" outcomes are recorded in the history with no change. Values are clamped to 0–100.

## Year-end evidence datasets (fictional pilot test data)

Fixed, internally consistent datasets in `api/_lib/scenario_omar.js`. Company-level results are identical in all three, so business outcomes are never attributed to Omar.

| | A · Effective | B · Partially effective | C · Ineffective |
|---|---|---|---|
| Reports on time | 11/12 (June late only) | 10/12 | 9/12 |
| Quality review passed | 12/12 | 12/12 | 11/12 |
| Deadline conflicts escalated | 3 of 3 | 1 of 2 | 0 of 3 |
| Recommendations (with action) | 7 (all) · 3 adopted | 6 (5) · 2 adopted | 5 (3) · 1 adopted |
| Stakeholder feedback Q3 / Q4 | 3.9 / 4.3 | 3.6 / 3.8 | 3.2 / 3.3 |
| Consultations in H2 | 4, documented | 2 | 1, undocumented |
| Development | 2 coaching sessions, monthly checkpoints | 1 session, no follow-up | none |

Each dataset also has stakeholder comments, observed behaviours per competency and Omar's own view. Company results (all pathways): win rate 24% (June) → 28% (Dec); price objections 29% → 24%; value-based response approved in September, no general price cut.

---

## Pilot assumptions (to review after the first test)

1. **Products and Omar's profile** follow the pilot brief (FlowOps, Customer360, InsightIQ; new profile and previous-year evidence). They replace the classic content for this pilot only; the classic version is unchanged.
2. **Competency library**: the four brief competencies use the approved level descriptors. Five other NextWave competencies (Problem Solving, Time Management & Prioritization, Accountability & Ownership, Adaptability & Flexibility, Coaching) have **draft** level descriptors written for the pilot so that every competency shows three levels. Review them.
3. **Year-end datasets, stakeholder comments and observed behaviours** were written for the pilot (the brief asked for fixed, consistent datasets). Dates: Valtora launch June, emails 5–6 July, mid-year conversation 7 July, year-end December 2027.
4. **Nadine Farouk** is shown with initials (no portrait available).
5. **Pathway thresholds** (above) and the **"constructive" threshold** (coaching ≥ 9/15) are pilot values.
6. Round 2 assessment uses everything submitted at *Submit Round 2*; Evidence Log edits after that are not re-scored.
7. Participants may reconsider the appraisal once or more after the bias reflection; the appraisal conversation is not repeated.
8. The participant sees the Pulse and the SCORE scores after each round; the pathway label is shown only to the facilitator.
9. Previous SCORE Hub features replaced in this pilot: the 0–2 self-assessment layer (replaced by rubric-based AI assessment with facilitator override), scripted multiple-choice conversations (replaced by open-text AI), employee selection (Omar only), and placeholder content (replaced by the pilot brief's content).

## Testing results

`tests/test_pilot.py`: 84 checks pass in scripted test mode and no-AI mode. They cover:
- the API (methods, invalid JSON, oversized or tampered input, unknown pathway, no-AI 503s);
- that confidential files are not downloadable and the page source contains no hidden facts, model answers or datasets;
- the scoring total (100 = 35/40/25) and the blaming → pathway C → punitive rule;
- removal of fabricated quotes;
- the full UI journey: weights validation, the three-level competency display, the "I understand" check, a double-click guard, refresh persistence, the Pulse values at every event, the dashboard values, four emails, Mariam labelled secondhand, Omar initiating both conversations, unexpected and injection-style messages, the Evidence Log starting empty, carry-forward into the appraisal, grounded bias flags, reconsider, finalise and Pulse history consistency;
- the facilitator overrides and the tablet layout.

**Not yet verified:** the quality of live AI conversations and assessments. No AI key was available while building this pilot, so the live path has only been exercised up to the authentication check. Run a live test session (see the checklist below) before the workshop.

### Live-AI checklist for the first test session
- Round 1: "I understand your concern" alone should not unlock *Confirm alignment*; a clear explanation of how recommendations are judged should.
- Round 2: open questions should reveal facts gradually; blaming should make Omar guarded and lead to pathway C; a strong coaching conversation should lead to pathway A.
- Round 3: a low rating justified by "recommendations were not adopted" should make Omar challenge it and should produce a severity/unfair flag.
- Check typical response time (expect a few seconds per message) and cost on the Anthropic console.

## Unresolved dependencies

- `ANTHROPIC_API_KEY` must be set in Vercel (Production and Preview) for live conversations.
- Vercel must run `npm install` (set in `vercel.json`) so the functions can load the Anthropic SDK.
- Progress is stored per browser; a participant who switches device starts again.
