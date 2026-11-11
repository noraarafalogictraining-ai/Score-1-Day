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
- **Top bar:** NextWave logo, Employee Pulse (three ring indicators: Performance blue, Trust teal, Development purple; hover for meaning, click for details and history), notifications, and a user menu with **My Profile** and **Sign Out**.
- **Sidebar:** Home · My Inbox · Business Dashboard · Performance Management (Objectives, Evidence Log, Final Appraisal) · Employee Conversations.
- **Home (Commercial overview):** Omar's employee overview and the commercial dashboard. At the start of the year it shows the CEO targets with baseline placeholders; after the Valtora release, the agreed mid-year figures; after the year-end update, the company's December figures. Home and Business Dashboard use the same data. KPI cards expand, chart months are clickable, and there is a trend / period-comparison switch and an expandable business alert.
- **My Profile:** the participant as Commercial Director (name from login): employment information, job description, the CEO-set objectives for 2027 (read-only) and the reporting line with four direct reports.
- **Relocated:**
  - The year-end update arrives as an HR email with the evidence attached ("Open"), and the appraisal is opened from that email.
  - The Round 2 checklist is now **Mid-year review**, reached from the Evidence Log and the conversation.
  - SCORE Review is now a **feedback report**, shown to participants after the final appraisal (via the HR completion email) and to the facilitator at any time.
  - **Event release:** when the next event is due, Home and the Inbox show **"Wait for the facilitator message"** with a code box. The facilitator announces the code in the room and participants enter it: **4826** releases the mid-year business event (after the January plan is confirmed), **7319** releases the year-end update (after the mid-year review is submitted). Codes only work at the right moment.

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

## Year-end refinement and simulation closure

**Year-End Performance Summary** (replaces the long record in the participant view; `yearEndBody` in `src/views_appraisal.js`, mapping in `objectiveEvidence` in `src/evidence_map.js`). It has four compact sections, and only A is open by default.
- **A. Results against agreed objectives:** only the participant's own January objectives, each with its weight, target, actual result, achievement and one key evidence line. Results come from one fixed outcome expressed in the unit of the agreed measurement:
  - submitted reports: 12 (100%);
  - on-time reports: 9 (75%);
  - late reports: 3 (lower is better);
  - quality review passed: 11 (91.7%);
  - recommendations: 5, with a proposed action: 3 (60%);
  - feedback: 3.4/5 for the year, 3.25 for H2.

  Where no record matches, the measurement is a department result, the period can't be matched, or a milestone has no completion record, it shows "Not verifiable" and no number. Consultations are only partly verifiable, because there are no records for January–June.
- **B. Competency evidence:** one card per January competency, with the expected level, one strength and one development observation. No ratings.
- **C. Stakeholder feedback:** the quarterly trend, three comments, positive contributions and documented gaps.
- **D. Development & manager follow-up:** a timeline built from the participant's own records (plan, mid-year conversation, Evidence Log actions), the HR note ("no HR record ≠ no action") and Omar's self-assessment.

Section B observations are new scenario summaries drawn from the established record.

**Appraisal simplifications:**
- The evidence-review checkbox, the measurement-basis field and the calculation-method selector are removed.
- The method follows the agreed measurement.
- Where no formula applies (qualitative objectives, a late or partial milestone, a lower-is-better actual of 0), the manager enters the % and explains it in the required comments.

**Removed:** the bias check, overlooked/overemphasised evidence, the reflection, reconsider, and the review & finalize page (old links open the form). The reflection's 1 point moved into the conversation score: 12-point check × 5 ÷ 12 = 5 points. The year-end stage stays at 25 and the total at 100.

**Sequence:**
1. Review the summary.
2. Complete Parts I–II and select **Submit appraisal**. Omar's opening message arrives.
3. Hold the conversation. Part III stays editable and is recommended, not required.
4. Select **Complete Performance Conversation**, on the form or in the chat window. If no next steps were agreed, a second click confirms.
5. The cycle is complete. HR's **"Performance Cycle 2027 — Thank You"** email arrives once, with a notification, and ends with the **2027 PERFORMANCE CYCLE COMPLETED** block and SET → CHECK → OPTIMIZE → REVIEW → EVOLVE.

The final learning-score assessment runs in the background and never delays the email. The SCORE feedback report still exists at `#review` but is no longer linked.

## Objectives of the Year and Performance Appraisal Form (follows the NextWave HR forms)

The January form and the December appraisal follow the two reference documents (*Objective Setting form* and *Performance Appraisal form*). Participant screens, Omar's AI context and the assessors no longer use the term "KPI".

**January: Objectives of the Year** (`src/views_goals.js`). The header shows Employee Name, Job Title, BU / Department, Direct Manager (the participant · Commercial Director), Performance Year and Rating Period. It is followed by **PERFORMANCE STANDARDS AND EXPECTATIONS** with the table No. · Objective / Project · Measurement · Due date (date selector) · Weight, plus a total. Rows open into an editing panel, and participants write every objective themselves.
- **SMART check:** each objective gets S, M, A, R and T indicators and constructive feedback, judged from the objective, measurement and due date together. It never rewrites anything.
- **What blocks submission:** a missing field, weights not totalling 100%, a measurement with no identifiable target or completion rule (including two targets, a change stated "by X%" with no level, or an ambiguous figure), or a due date outside 2027.
- **What is advisory only:** S, A and R warnings.
- **Acknowledgement:** the template's wording, with manager and employee status and date. Omar is only shown as acknowledging after the alignment discussion ends in agreement. A facilitator override is labelled as such, with no employee acknowledgement recorded.
- **Agreed definition:** at submission, each objective stores the target and calculation definition it was agreed with (`o.agreed`), so year-end uses what was agreed.
- **Competencies:** selection, expected levels and behavioral standards are unchanged.

**December: Performance Appraisal Form** (`src/views_appraisal.js`, calculations in `src/appraisal_calc.js`). It is one activity with three parts, a progress indicator, a live score strip, Save draft, a year-end evidence drawer and a review step. The header shows Employee Name, Position, Department, Time in Present Position ("Not recorded · 4 years at NextWave", because only company tenure is established), Type of Rating (Annual), Rating Period, and Manager Name and Title. The form's instructions are included.
- **Part I · Competencies (40%):** the January competencies, each row Competency · Expected proficiency · Rating · Comments, expandable to show the agreed standard. The rating scale is exactly 4 Exceptional · 3 Meets Expectations · 2 Needs Improvement · 1 Unsatisfactory, and comments are required. **Competencies score = (average rating ÷ 3) × 100** (3 = 100%), shown with the form's formula.
- **Part II · Objectives (60%):** columns No. · Objective(s) · Measure · Target · Due date · Actual achievement · % Achieved · Weight · Weighted score · Comments. Objective, measure, target, due date and weight come from January and are read-only. The manager enters the actual achievement and comments; the percentages are calculated and never pre-filled.
- **Overall:** objectives × 60/100 + competencies × 40/100, shown with the form's Employee Performance Profile. The overall % is rounded to a whole number (half up) for classification only: **101%+ Exceptional · 86–100 Very Good · 76–85 Good · 60–75 Needs Improvement · below 60 Unacceptable**.
- **Part III · Development Plan:** Career Planning (short term, long term), Learning & Development Plan rows (improvement area, action), Training & Development rows (course, institute or source, preferred date) and Additional Comments (Employee, Direct Manager, kept separate). The signature blocks for employee, manager and department manager are never filled in automatically.

**Calculation methods per objective.** No cap applies anywhere, so results above 100% are possible.

| Measure type | Rule |
|---|---|
| Quantity or percentage (higher is better) | % achieved = actual ÷ target × 100 |
| Lower is better: reductions to a level, time limits such as "within 2 working days", "no more than 2" | target ÷ actual × 100, only when both are above 0; otherwise a manager assessment |
| Milestone or completion with a due date | Completed by the due date = 100%. Not completed = 0%. Completed late or partly = manager assessment |
| Unclear or qualitative | Manager assessment: a % plus a documented measurement basis plus confirmed evidence review. Until all three are given it "needs clarification" and is excluded from the score |

Other rules:
- Weighted score = % achieved × weight ÷ 100, and the objectives score is the sum of the weighted scores.
- The actual must use the target's unit: a % target needs a % sign, a 1–5 score must stay at or below 5, and a count target rejects %.
- Dates in the wording are never read as targets, and "11 of 12" is read as a target of 11.
- If the weights don't total 100%, no objectives score is calculated.
- Values stay unrounded internally.

**Flow.**
1. Complete Parts I–II.
2. **Share Parts I–II with Omar.** His neutral opening message arrives, and Parts I–II become read-only.
3. The appraisal discussion happens in the chat. Part III stays editable throughout.
4. Closing the discussion returns the participant to Part III.
5. **Review & finalize:** a summary of the whole form, the bias check and reflection, then finalize. Finalizing requires all three parts to be complete. "Reconsider" reopens Parts I–II.

**Data migration** (`migrateRecord` in `src/state.js`, applied to saved sessions on load):
- Old KPI text becomes the Measurement word for word; no due date is invented.
- Old 1–5 competency ratings are **not converted**: they are cleared, kept as `legacyRating` and flagged for re-rating, and their comments are kept.
- Single-measure results move into the new fields. Multi-measure results are kept for review.
- Old strengths, development and justification text moves into Direct Manager comments.
- A shared appraisal that needs re-rating returns to draft. The flags are shown at the top of the form.

## Year-end evidence repository and measurement matching (Phase 5)

*Since the form redesign: one target per objective (no KPI splitting), no KPI wording, and the January evidence check is part of the SMART feedback. The evidence registers below are unchanged.*

**One record for everyone.** `api/_lib/evidence_omar.js` (server only, versioned `2027.1`) holds Omar's 2027 year-end evidence. Every participant receives the same record; the former per-pathway datasets (A/B/C) are retired as evidence. The mid-year result still drives the Employee Pulse, but no longer changes Omar's results. The browser receives the record only after the December event is released (`/api/yearend`). A reconciliation guard stops the server if the registers stop matching the approved totals.

**Year-end record (4 expandable sections).** 1 Performance Results (summary + Register 1 monthly reporting + Register 2 recommendations) · 2 Stakeholder Feedback (Register 3 scores, H2 comments, Register 4 engagement) · 3 Business Contributions (Register 5 competitive intelligence, observed behaviours, department results marked "context, not individual performance") · 4 Development & Follow-Up (Register 6 HR records + the participant's own records: January plan, mid-year conversation, follow-up actions from their Evidence Log). No ratings or judgements are shown.

**Summary records.** EV-REP-01…05 (12 scheduled; 9 of 12 on time = 75%; 3 missed = 25%; 11 of 12 passed QA = 91.7%; 0 of 3 conflicts escalated), EV-REC-01…03 (5 submitted; 3 of 5 with an action = 60%; 1 adopted, 1 under review, 3 not adopted = 20%, marked *business outcome*), EV-FB-01/02 (Q1 3.6 · Q2 3.4 · Q3 3.2 · Q4 3.3; H1 3.5, H2 3.25, year 3.375, quarters weighted equally; no respondent counts), EV-ENG-01/02 (1 structured consultation in H2, called by Youssef; 0 with documented actions), EV-CI-01 (12-month-contract condition; email; used by Sales in December), EV-DEV-01 (no formal coaching recorded after July), EV-BIZ-01…03 (department results).

**Scenario details (approved direction; record v2027.2):**
1. **Business calendar** (one definition in `evidence_omar.js`): working days Monday–Friday; company holiday Fri 1 Jan 2027. Each monthly report covers one month and is due on the **first working day of the following month**. The 12 reports due in 2027 cover December 2026 – November 2027, and on-time reports are submitted on the deadline day. All dates are computed from this calendar, and the server re-counts the working days at start-up.
   - **June report:** due Thu 1 Jul, submitted Mon 5 Jul (2 working days late). This is the "latest scheduled report" in Mariam's 6 July email and the late report on the mid-year dashboard.
   - **August report:** due Wed 1 Sep, submitted Mon 6 Sep (3 working days late).
   - **October report:** due Mon 1 Nov, submitted Wed 3 Nov (2 working days late). It also needed a major correction.
2. **Late submissions and escalation:** 3 late submissions in the year, 2 of them after the July mid-year review (August, October). None was escalated in advance (0 of 3 in the year; 0 of 2 after mid-year). The record and Omar's AI context use the same wording.
3. **Recommendations:** REC-03 (28 Jun, Valtora pricing response from the June competitor analysis) is the adopted one, matching the September value-based decision. It is explicitly separate from the July 12-month-contract finding (CI-02), which was shared by email and used by Sales only in December. REC-04 was changed to an unrelated topic (InsightIQ renewal usage evidence) to avoid confusion. Decision owners: "Not documented".
4. **Engagement:** ENG-01 is the late-June Valtora meeting that Nadine's 5 July email refers to. ENG-02 is the July consultation Youssef called after his 5 July request for practical options, with no documented follow-up actions. ENG-03 is the September meeting with Nadine, which ended without agreed next steps.
5. **Pulse:** there is no automatic December Development increase. Mid-year coaching still affects the Pulse in July (the existing *constructive* event). In December, Development rises only if the record contains documented follow-through (a development record marked `followThrough`); the 2027 record has none. A specific development agreement in the December discussion (+5 Development) still counts.

**KPI → evidence matching** (`src/evidence_map.js`, deterministic, no AI): each KPI from the January text is matched by the first rule that fits (escalation → late reports → quality → on-time → report count → adoption → recommendations with action → recommendation count → feedback → development → consultations → competitive intelligence → department results). The result records the measure, relevant evidence IDs, unit (count / % / 1–5 scale), period (year / quarter / month / half) and direction. The file holds definitions and record IDs only, never values.

| Coverage | When |
|---|---|
| Supported | A measure matched, the target is numeric, and the unit fits the records |
| Needs clarification | No target, a milestone, two figures, a zero target, % for a 1–5 feedback score, or more than 12 monthly reports |
| Evidence unavailable | Department results (win rate, revenue, pipeline…), measures that are not recorded, or counts of analyses/insights |

In **January** the check is advisory (it never blocks submission) and its wording never mentions results or events. In **December** each KPI shows its coverage, links to the relevant records (opening the right section) and notes on standards and periods (e.g. "Your target is per quarter", "Consultation records cover July – December only"). Actual results are **never pre-filled**.

**Unresolved KPIs.** A KPI that isn't Supported (or that the manager moves to manager review) is flagged **"Unresolved: not included in the score"**. It counts only after three things: the manager ticks *"I have reviewed the relevant evidence records"*, writes a **measurement basis** (at least 20 characters: what was counted, against what, and why it's a fair reading of the January KPI), and enters the assessed %. Until then WHAT and the overall score stay "—" and submission is blocked with a clear message. KPIs marked *Evidence unavailable*, and clarifications other than "more than 12 reports", cannot be switched to a formula. The basis is passed to Omar's AI and the assessors.

**Compound KPIs.** If a January KPI contains two targets ("95% on time and 95% passing review"), January shows a *Suggestion* to write them as separate KPIs; at year-end they are assessed as separate KPIs with equal shares. If one KPI combines two measures under a single target ("95% of reports on time and without major corrections"), it is marked *Needs clarification* with the same suggestion. The participant's wording is never changed.

**Scoring** (`src/appraisal_calc.js`): KPI = actual ÷ target × 100. Lower is better = target ÷ actual × 100, only when both are above 0 (otherwise manager review). **No cap.** The actual must use the target's unit: a % target needs a % sign, a 1–5 target must stay at or below 5, and a count target rejects %. Objective = equal-share average of its KPIs (no subweights exist in the January plan). WHAT = Σ objective × weight; it is not calculated if the weights don't total 100% (no silent rescaling). HOW = average rating × 20. Overall = WHAT × 60% + HOW × 40%; it can exceed 100. Values stay unrounded until display. Example with the same evidence (9 of 12 on time): a target of 10 reports → 90%; a target of 90% (actual 75%) → 83.3%; a target of 12 reports → 75%.

## Final appraisal discussion with Omar (SBII, experimental)

**Trigger.** Submitting the final appraisal adds one fixed, neutral message from Omar to the same chat thread ("Hi, I've seen my appraisal. Do you have a few minutes to go through it together?"). The chat bubble shows a red **1**; the chat does not open by itself and the participant stays on the appraisal page. The opening is added once only (safe on refresh and on revised submissions).

**What Omar's AI sees** (`api/_lib/prompts.js` → `omarSystem("appraisal")`): the submitted appraisal (each objective's weight and achievement; each KPI's target, measure type, actual, achievement and evidence; each competency's expected level, standard, observed behaviour, 1–5 rating and justification; WHAT %, HOW %, overall score out of 100, justification, strengths and development priorities), the full January and mid-year chat transcripts, the manager's Evidence Log entries, the agreed plan, the canonical year-end evidence record, and Omar's hidden perspective and reactions (`api/_lib/scenario_omar.js` → `APPRAISAL`). The prompt never names SBII.

**Each reply** (`api/converse.js`): a short structured reading of the manager's messages (vague feedback, personality labels, unsupported blame, ignored explanation, praise only, vague next steps, wrapping up; and, for the whole conversation, whether the appraisal, specific feedback, strengths and gaps, Omar's view and a specific development agreement have been covered). Code — not the AI — then picks Omar's stance and decides completion.

**Completion.** "Appraisal Discussion Completed" appears (small status in the chat and on the appraisal page) only when all of these are true: the appraisal was discussed; feedback named a specific situation and observable behaviour; a strength and a documented gap were both addressed; Omar's view was asked for and responded to; and a **specific** development agreement was reached (what to improve, an action, the manager's support and a review point) — with no personal labels or unsupported blame in the latest message. The participant can still end the discussion earlier (a second click confirms); it is then recorded as **not completed** and Omar is never made to agree.

**SBII assessment (behind the scenes, 12 points).** When the discussion is closed, `/api/assess` task `sbii` scores Situation, Behavior, Impact, Intent, Fairness and Development 0–2 each from the whole conversation (meaning, not keywords; naming the model earns nothing). A score of 2 needs a verbatim quote from the manager's own messages, otherwise it is reduced to 1; no manager messages = 0. Results are shown only in the feedback report after the year is complete, never in the chat.

**No double counting in the Learning Score.** The 100-point total is unchanged. The former year-end conversation criteria (explain 2 + listen 1 + development focus 1 = 4 points) are replaced by one derived criterion, `r3_conv_feedback` (max 4) = round(SBII total × 4 ÷ 12). The written-appraisal assessment no longer scores the conversation.

**Employee Pulse** (deterministic rules in `api/_lib/rubrics.js` → `RULES.feedbackEvents`; values in `src/pilot.js`, provisional):

| Event | Rule | Change | Slot |
|---|---|---|---|
| Fair feedback and genuine listening | Fairness 2 and Intent ≥ 1, no blame/labels | Trust +4 | feedback |
| Blaming or personal feedback | Personality labels, unsupported blame, or Fairness 0 | Trust −6, Development −2 | feedback |
| Clear development agreement | Development 2 and the discussion was completed (and not blaming) | Development +5 | dev_agreement |

These slots are separate from the written appraisal's slot (fair/unfair appraisal), so the appraisal and the conversation are each counted once; KPI results are never changed by the conversation. Vague praise without improvement actions gives no Development increase.

**Pilot assumptions.** The reference year-end figures in the Phase 4 brief (9 of 12 on time, 11 of 12 passed QA, 5 recommendations, 3 with an action, H2 feedback 3.25, one consultation without actions, no coaching after July) are exactly Pathway C; Pathways A and B keep their own datasets. The 12 → 4 mapping and the Pulse values above are provisional and need sign-off.

## The three-round experience (facilitator view of the structure)

| Round | What happens | Facilitator |
|---|---|---|
| **1 · Setting Performance Expectations** | HR email → Goal Plan (objective, KPI with target, weight, evidence source, review frequency; weights must total 100%) → 3–5 competencies with expected proficiency levels (three observable levels shown) → *Submit for Employee Alignment* → status **Pending Employee Alignment** → **open-text AI conversation** with Omar, who opens with his fairness concern → *Confirm alignment* appears only when Omar's concern has been meaningfully addressed → HR "Contract Confirmed" email | — |
| **2 · Performance Gaps, Diagnosis & Coaching** | Business alert → **Business Dashboard** (KPI cards, March–June trend chart, before/after bars, market intelligence indicators kept separate from business outcomes) → four stakeholder emails (Mariam's marked *secondhand, unverified*) → Omar's chat request → **open-text diagnostic and coaching conversation** (dashboard and inbox stay one click away) → participant writes their interpretation of the data and completes the Evidence Log → *Submit Round 2* | Announces Valtora (script in the Facilitator view), then releases it (code **4826** in the Facilitator View code box, or the release button) |
| **3 · Final-Year Performance Evaluation** | Year-end performance record (the same for every participant) → appraisal pre-filled with the Round 1 objectives, KPIs, weights and competencies (WHAT, HOW, overall) → Omar responds in an **open-text appraisal conversation** → **bias reflection** grounded in the participant's own reasoning → reconsider or finalise → final SCORE assessment and Employee Pulse outcome | Releases the year-end update (code **7319**) |

The **Employee Pulse** (Performance, Trust, Development; 0–100) is always visible in the header, with a full event history. The **SCORE Review** shows each round's criteria with the score, evidence quotes, reason, confidence and missing information.

There is no facilitator view. Events are released only by the codes participants enter on the "Wait for the facilitator message" card (`waitCard` in `src/views_monitor.js`; codes in `src/content.js` → `RELEASE_CODES`). The master code 5050 and the manual controls (confirm alignment, end conversations, set pathway, finalize without AI, per-criterion overrides, device reset) were removed. Without live AI, a session can't pass the January alignment. Codes are a local gate on each device and are visible in the page source.

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
| | Appraisal feedback conversation (SBII, mapped 12 → 4) and bias reflection | 5 |

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
| Documented development follow-through | only if the year-end record documents follow-through (none in 2027) | +2 | +2 | +6 |
| Unfair final appraisal | appraisal assessed "unfair" | 0 | −10 | −4 |
| Fair, evidence-based appraisal | assessed "fair" | 0 | +5 | +4 |

"Mixed" outcomes are recorded in the history with no change. Values are clamped to 0–100.

## Year-end evidence (fictional pilot test data)

Since Phase 5 there is a single canonical record for every participant: see *Year-end evidence repository and KPI matching* above (`api/_lib/evidence_omar.js`). Its figures are those of the former Pathway C dataset. The former A and B datasets have been removed (they are still in the git history if needed).

## Pilot assumptions (to review after the first test)

1. **Products and Omar's profile** follow the pilot brief (FlowOps, Customer360, InsightIQ; new profile and previous-year evidence). They replace the classic content for this pilot only; the classic version is unchanged.
2. **Competency library** (10, alphabetical in the dropdown): the four brief competencies use the approved level descriptors. Six others (Accountability & Ownership, Adaptability & Flexibility, Coaching, Problem Solving, Strategic Thinking, Time Management & Prioritization) have **draft** level descriptors written for the pilot (server only, used by the assessor). Strategic Thinking was added in this update. Review them.
3. **Year-end datasets, stakeholder comments and observed behaviours** were written for the pilot (the brief asked for fixed, consistent datasets). Dates: Valtora launch June, emails 5–6 July, mid-year conversation 7 July, year-end December 2027.
4. **Nadine Farouk** is shown with initials (no portrait available).
5. **Pathway thresholds** (above) and the **"constructive" threshold** (coaching ≥ 9/15) are pilot values.
6. Round 2 assessment uses everything submitted at *Submit Round 2*; Evidence Log edits after that are not re-scored.
7. Participants may reconsider the appraisal once or more after the bias reflection; the appraisal conversation is not repeated.
8. The participant sees the Pulse and the SCORE scores after each round; the pathway label is shown only to the facilitator.
9. Previous SCORE Hub features replaced in this pilot: the 0–2 self-assessment layer (replaced by rubric-based AI assessment with facilitator override), scripted multiple-choice conversations (replaced by open-text AI), employee selection (Omar only), and placeholder content (replaced by the pilot brief's content).

## Testing results

`tests/test_pilot.py`: 289 checks pass in scripted test mode and no-AI mode (including the Objectives of the Year form, SMART checks, the Performance Appraisal Form calculations, rating bands, development plan, migration and the full January–December flow). They cover:
- the API (methods, invalid JSON, oversized or tampered input, the same year-end record for everyone, no-AI 503s);
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
