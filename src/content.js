/* =========================================================
   SCORE PERFORMANCE HUB — CONTENT CONFIGURATION
   Everything a content owner may need to change lives in this file.

   Status of every content item:
     "approved"    existing SCORE content, carried over unchanged
     "provisional" existing content still awaiting SME validation
     "pending"     not written yet: the app shows a labelled placeholder
   Channel of every content item:
     "digital"     shown inside the Performance Hub
     "offline"     printed participant / facilitator materials only
     "facilitator" facilitator guidance only (never shown to participants)
   ========================================================= */

const APP = {
  name: "SCORE Performance Hub",
  company: "NextWave",
  cycleYear: 2027,
  cycleLabel: "January – December 2027",
  storeKey: "score-hub-nextwave-v1",
  legacyKey: "score-oneday-nextwave-v3"
};

/* Simulated calendar used in messages (fictional, never a real countdown) */
const SIM_DATES = {
  start: "Mon 4 Jan 2027",
  deadline: "Mon 11 Jan 2027",
  submitted: "Fri 8 Jan 2027",
  approved: "Mon 11 Jan 2027",
  midyear: "Thu 1 Jul 2027",
  yearend: "Wed 1 Dec 2027",
  closed: "Fri 17 Dec 2027"
};

/* Facilitator codes (local gate on each device; visible in page source) */
const FAC_CODE = "5050";
const RELEASE_CODES = { midyear: "4826", yearend: "7319" };

/* ---------- Form vocabularies ---------- */
/* EVIDENCE_SOURCES and FREQUENCIES come from employees.js (approved, unchanged) */
const PERIODS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Q1", "Q2", "Q3", "Q4", "H1 (Jan–Jun)", "H2 (Jul–Dec)", "Full year"];
const EVIDENCE_STATUS = ["Open", "Ongoing", "Completed"];
const RATING_SCALE = [
  { v: 5, l: "Exceptional" },
  { v: 4, l: "Exceeds Expectations" },
  { v: 3, l: "Meets Expectations" },
  { v: 2, l: "Below Expectations" },
  { v: 1, l: "Unsatisfactory" }
];
const LEVELS = [
  { id: "basic", l: "Basic" },
  { id: "intermediate", l: "Intermediate" },
  { id: "advanced", l: "Advanced" }
];
const OBJ_RANGE = { min: 3, max: 5, hardMax: 8 };
const COMP_RANGE = { min: 3, max: 5 };

/* ---------- Placeholder helper ---------- */
const PENDING_TAG = "Pending content approval";
function pending(what) { return { pending: true, text: `[Placeholder: ${what}]` }; }

/* ---------- Competency library ----------
   Core NextWave competencies (approved names from the company profile).
   Descriptions and the three proficiency levels are pending approval.
   Each employee library = core competencies + role-specific competencies.
   Add approved role-specific competencies to ROLE_COMPETENCIES[emp] using the same shape:
   { id, name, description, levels: { basic: [..], intermediate: [..], advanced: [..] } }
   ---------------------------------------------------------- */
function pendingCompetency(id, name) {
  return {
    id, name, status: "pending",
    description: pending(`description of ${name}`),
    levels: {
      basic: [pending(`${name}: observable behaviours at Basic level`)],
      intermediate: [pending(`${name}: observable behaviours at Intermediate level`)],
      advanced: [pending(`${name}: observable behaviours at Advanced level`)]
    }
  };
}
const CORE_COMPETENCIES = COMPANY.competencies.map((n, i) => pendingCompetency("core" + (i + 1), n));
const ROLE_COMPETENCIES = { omar: [], youssef: [], salma: [], mariam: [] };
const ROLE_COMPETENCY_SLOTS = 3; /* placeholder rows shown until role-specific content is approved */
function competencyLibrary(emp) { return [...CORE_COMPETENCIES, ...(ROLE_COMPETENCIES[emp] || [])]; }
function competencyById(emp, id) { return competencyLibrary(emp).find(c => c.id === id); }

/* ---------- Underlying employee needs (approved, from the classic Round 1) ---------- */
const NEEDS = {
  omar: { theme: "Fairness & Recognition", line: "Strong performance does not necessarily mean agreeing with everyone." },
  youssef: { theme: "Trust & Autonomy", line: "Balancing responsibility, control, and delegation." },
  salma: { theme: "Growth & Development", line: "Learning what good performance looks like and developing her capabilities." },
  mariam: { theme: "Clarity & Direction", line: "Managing conflicting expectations and priorities." }
};

/* ---------- Structured conversations ----------
   A script is a small graph: { start, nodes: { id: { from: "employee", text, options: [ { l, next | outcome } ] } } }
   outcome "align"  → contract can be confirmed
   outcome "revise" → goal plan returns to Draft for revision
   Employee-specific scripts go in EMP_CONTENT[emp].contractReaction.script (null → default placeholder). */
const ALIGNMENT_DEFAULT = {
  start: "concern",
  afterRevision: "revised",
  nodes: {
    concern: { from: "employee", ph: true, text: "Employee raises a concern about the expectations in the goal plan, linked to their underlying need, role or performance challenge.",
      options: [
        { l: "Ask what specifically concerns them about the goals", next: "explore" },
        { l: "Explain that the goals are set and move on", next: "dismissed" },
        { l: "Offer to revisit the goal plan with them", outcome: "revise", reply: "Employee agrees to look at the goal plan again." }
      ] },
    explore: { from: "employee", ph: true, text: "Employee explains the concern in more detail and what would make the expectations feel fair and achievable.",
      options: [
        { l: "Agree on a clarification and confirm the goals together", next: "agreed" },
        { l: "Revise the goal plan to reflect what you heard", outcome: "revise", reply: "Employee welcomes the chance to adjust the plan." }
      ] },
    dismissed: { from: "employee", ph: true, text: "Employee responds to having the concern set aside.",
      options: [
        { l: "Reopen the discussion and ask about the concern", next: "explore" },
        { l: "Revise the goal plan", outcome: "revise", reply: "Employee agrees to look at the plan again." },
        { l: "Ask the employee to accept the goals as they are", next: "agreed" }
      ] },
    revised: { from: "employee", ph: true, text: "Employee reacts to the revised goal plan.",
      options: [
        { l: "Confirm the revised goals together", next: "agreed" },
        { l: "Revise the plan again", outcome: "revise", reply: "Employee agrees to another revision." }
      ] },
    agreed: { from: "employee", ph: true, text: "Employee confirms they understand and accept the expectations.", options: [], outcome: "align" }
  }
};

/* Mid-year diagnostic check-in: the manager picks a few questions in any order. */
const DIAGNOSTIC_LIMITS = { min: 2, max: 4 };
const DIAGNOSTIC_DEFAULT = {
  opening: { ph: true, text: "Employee opens the mid-year check-in after the business event discussed in the training room." },
  questions: [
    { id: "what", purpose: "Clarify what happened", q: "Can you walk me through what has happened since the start of the year?", a: { ph: true, text: "Employee describes what happened, in their own words." } },
    { id: "cause", purpose: "Explore the causes of the gap", q: "What do you think is behind the gap between the plan and where we are now?", a: { ph: true, text: "Employee shares their view of what caused the gap." } },
    { id: "barriers", purpose: "Understand barriers and constraints", q: "What has been getting in the way of delivering what we agreed?", a: { ph: true, text: "Employee names the barriers and constraints they face." } },
    { id: "support", purpose: "Identify support needs", q: "What support would make the biggest difference for you right now?", a: { ph: true, text: "Employee explains the support they need." } },
    { id: "control", purpose: "Distinguish controllable from uncontrollable factors", q: "Which parts of this are within your control, and which are not?", a: { ph: true, text: "Employee separates what they can and cannot control." } },
    { id: "view", purpose: "Understand the employee's perspective", q: "How do you feel about how the year is going so far?", a: { ph: true, text: "Employee shares how they see their own performance and situation." } }
  ]
};

/* Post-appraisal employee reaction and bias reflection */
const BIASES = [
  { id: "recency", l: "Recency bias", d: "Recent events outweigh the whole year." },
  { id: "halo", l: "Halo effect", d: "One strength colours the judgment of everything else." },
  { id: "horn", l: "Horn effect", d: "One weakness colours the judgment of everything else." },
  { id: "leniency", l: "Leniency or severity", d: "Rating consistently too generously or too harshly against the standard." },
  { id: "similarity", l: "Similarity bias", d: "Rating people who are like us more favourably." },
  { id: "results", l: "Results over behaviours", d: "Focusing on the numbers while overlooking how they were achieved." }
];
const REACTION_DEFAULT = {
  message: { ph: true, text: "Employee responds to the final appraisal: they may question the rating, raise a fairness concern or point to a contribution they feel was overlooked." },
  options: [
    { id: "review", l: "Review the concern against the evidence" },
    { id: "ack", l: "Acknowledge the message and explain the rating" }
  ],
  reply: { review: { ph: true, text: "Employee responds to the manager reviewing the concern." }, ack: { ph: true, text: "Employee responds to the explanation of the rating." } }
};

/* ---------- Employee content packages ----------
   16 sections per employee. Values point at approved data where it exists;
   everything else is marked pending and must not be presented as final. */
function empPackage(emp) {
  const E = EMPLOYEES[emp];
  return {
    story:            { status: "approved", channel: "offline", label: "Employee story", value: E.story },
    jobDescription:   { status: "approved", channel: "digital", label: "Job description and strengths", value: { role: E.role, strengths: E.strengths } },
    underlyingNeed:   { status: "approved", channel: "offline", label: "Underlying employee need", value: NEEDS[emp] },
    previousYear:     { status: "approved", channel: "digital", label: "Previous-year evidence", value: { rating: E.prevRating, summary: E.prevPerformance } },
    objectiveGuidance:{ status: "provisional", channel: "facilitator", label: "Recommended objectives and KPI guidance", value: null, note: "Classic ROLE_GUIDE examples exist (legacy/src/n_score.js) but were written for the removed fields; awaiting SME review." },
    competencies:     { status: "pending", channel: "digital", label: "Role-relevant competencies", value: ROLE_COMPETENCIES[emp] },
    proficiencyLevels:{ status: "pending", channel: "digital", label: "Three proficiency levels per competency", value: null },
    contractReaction: { status: "pending", channel: "digital", label: "Employee reaction to the performance contract", script: null },
    midyearEvent:     { status: "pending", channel: "offline", label: "Mid-year business event and impact", value: null },
    stakeholderFeedback:{ status: "pending", channel: "offline", label: "Stakeholder feedback", value: null },
    diagnostic:       { status: "pending", channel: "digital", label: "Diagnostic conversation", script: null },
    interventions:    { status: "pending", channel: "offline", label: "Constructive and unhelpful intervention references", value: { constructive: null, unhelpful: null } },
    consequences:     { status: "pending", channel: "offline", label: "Intervention consequences", value: { constructive: null, unhelpful: null } },
    yearEndGuidance:  { status: "pending", channel: "facilitator", label: "Year-end evaluation guidance", value: null, ratingRange: null },
    sbiScenario:      { status: "pending", channel: "offline", label: "SBI feedback scenario", value: null },
    biasReflection:   { status: "pending", channel: "digital", label: "Post-appraisal bias reflection", script: null }
  };
}
const EMP_CONTENT = Object.fromEntries(EMP_ORDER.map(e => [e, empPackage(e)]));
function alignmentScript(emp) { return EMP_CONTENT[emp].contractReaction.script || ALIGNMENT_DEFAULT; }
function diagnosticScript(emp) { return EMP_CONTENT[emp].diagnostic.script || DIAGNOSTIC_DEFAULT; }
function reactionScript(emp) { return EMP_CONTENT[emp].biasReflection.script || REACTION_DEFAULT; }

/* ---------- HR messages (system text, not scenario content) ---------- */
const HR_SENDER = { name: "NextWave HR", addr: "hr@nextwave.example" };
function hrMessages(emp) {
  const E = emp ? EMPLOYEES[emp] : null, who = E ? E.name : "your employee";
  return {
    start: {
      subject: "Annual Performance Goal Setting — Action Required", date: SIM_DATES.start,
      body: [
        "Dear Manager,",
        `The ${APP.cycleYear} performance cycle (${APP.cycleLabel}) has started. Please complete the performance goal plan for ${who}.`,
        "__LIST__",
        `Deadline: ${SIM_DATES.deadline}.`,
        "Thank you for helping your team start the year with clear expectations.",
        "NextWave HR"
      ],
      list: ["Review your employee's role and previous performance.", "Define performance objectives and KPIs.", "Set objective weights.", "Identify evidence sources and review frequencies.", "Select role-relevant competencies.", "Define behavioral expectations.", "Align the expectations with your employee."],
      action: { l: "Open Performance Goal Plan", go: "goals" }
    },
    approved: {
      subject: "Performance Contract Confirmed — Monitoring Begins", date: SIM_DATES.approved,
      body: [
        "Dear Manager,",
        `The performance expectations for ${who} have been established and the performance contract is now confirmed.`,
        "Throughout the year, you are responsible for:",
        "__LIST__",
        "The next formal checkpoint will take place in six months. Please maintain your performance records throughout the year.",
        "NextWave HR"
      ],
      list: ["Tracking progress.", "Documenting evidence.", "Monitoring performance gaps.", "Maintaining regular employee communication.", "Taking appropriate management action."],
      action: { l: "Open Evidence Log", go: "evidence" }
    },
    midyear: {
      subject: "Mid-Year Performance Check-In Required", date: SIM_DATES.midyear,
      body: [
        "Dear Manager,",
        `The mid-year checkpoint has been reached. Please hold a performance check-in with ${who} to understand the current performance gap before deciding on any action.`,
        "Keep your Evidence Log up to date with what you learn.",
        "NextWave HR"
      ],
      action: { l: "Open Mid-Year Check-In", go: "conversations/midyear" }
    },
    yearend: {
      subject: "Year-End Performance Appraisal — Action Required", date: SIM_DATES.yearend,
      body: [
        "Dear Manager,",
        `The year-end appraisal for ${who} is now open. Evaluate performance results (WHAT) and competencies (HOW) against the expectations agreed at the start of the year, using the evidence you documented.`,
        "NextWave HR"
      ],
      action: { l: "Open Final Appraisal", go: "appraisal" }
    },
    closed: {
      subject: "Performance Appraisal Completed", date: SIM_DATES.closed,
      body: [
        "Dear Manager,",
        `Thank you. The ${APP.cycleYear} appraisal for ${who} has been completed and recorded.`,
        "NextWave HR"
      ]
    }
  };
}
