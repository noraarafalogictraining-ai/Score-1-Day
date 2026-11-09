/* =========================================================
   OMAR HASSAN PILOT — PUBLIC SCENARIO CONFIGURATION
   Content participants may see. Hidden facts, reference answers, rubrics
   and year-end datasets live on the server (api/_lib/), never here.
   ========================================================= */
const PILOT = { active: ["omar"], employee: "omar" };

/* Company (pilot brief) */
COMPANY.name = "NextWave";
COMPANY.products = [
  { id: "flowops", name: "FlowOps", kind: "Operations management solution" },
  { id: "c360", name: "Customer360", kind: "Customer management solution" },
  { id: "insightiq", name: "InsightIQ", kind: "Data analytics solution" }
];

/* Omar's profile (pilot brief — replaces the classic profile for this pilot) */
Object.assign(EMPLOYEES.omar, {
  title: "Market Intelligence Analyst",
  tenure: "4 years at NextWave",
  prevRating: "4/5 · Exceeds Expectations", prevScore: 4,
  prevPerformance: "Reliable, accurate market intelligence with valuable opportunity insights; development areas in business-friendly communication and stakeholder influence.",
  strengths: ["Strong analytical ability", "Accurate and reliable research", "Identifies valuable market opportunities", "Takes pride in evidence-based recommendations"],
  role: {
    purpose: "Turn market, competitor and customer information into accurate, timely intelligence and actionable commercial recommendations.",
    reportsTo: "You (Commercial Director)", reportsToRole: "Commercial Director",
    responsibilities: [
      "Monitor market trends, competitors, and customer needs.",
      "Analyze commercial pipeline, customer segments, and market opportunities.",
      "Prepare accurate and timely market intelligence reports.",
      "Translate analysis into actionable commercial recommendations.",
      "Communicate findings and collaborate with commercial stakeholders."
    ]
  },
  prevEvidence: [
    "11 of 12 monthly market intelligence reports delivered on time.",
    "95% of reports passed internal quality review without major corrections.",
    "Six evidence-based commercial recommendations submitted.",
    "Three recommendations adopted by management.",
    "Identified a promising customer segment that contributed to a successful commercial initiative."
  ],
  prevFeedback: [
    ["Commercial leadership", "Omar produces reliable analysis, but his presentations sometimes contain excessive technical detail."],
    ["Business Development Manager", "His insights are valuable, but he sometimes concentrates on defending the data rather than exploring stakeholder concerns."],
    ["Sales representative", "Omar's research contributed to an important opportunity, but the commercial team received most of the recognition."]
  ]
});
const STAKEHOLDERS = {
  nadine: { name: "Nadine Farouk", title: "Operations Director", initials: "NF" },
  youssef: { name: "Youssef Ali", title: "Business Development Manager", emp: "youssef" },
  salma: { name: "Salma Tarek", title: "Sales Executive", emp: "salma" },
  mariam: { name: "Mariam Adel", title: "Proposal Designer", emp: "mariam" }
};

/* ---------- Competency library ----------
   Names only. Participants use the printed competency dictionary for the Basic /
   Intermediate / Advanced descriptions; the descriptions live on the server
   (api/_lib/scenario_omar.js, COMPETENCY_LEVELS) for the assessment only. */
const COMPETENCY_LIBRARY = [
  { id: "analytical", name: "Analytical Thinking" },
  { id: "acumen", name: "Business Acumen" },
  { id: "communication", name: "Communication" },
  { id: "stakeholder", name: "Stakeholder Management" },
  { id: "problem", name: "Problem Solving" },
  { id: "time", name: "Time Management & Prioritization" },
  { id: "accountability", name: "Accountability & Ownership" },
  { id: "adaptability", name: "Adaptability & Flexibility" },
  { id: "coaching", name: "Coaching" }
];
function competencyLibrary() { return COMPETENCY_LIBRARY; }
function competencyById(_emp, id) { return COMPETENCY_LIBRARY.find(c => c.id === id); }

/* ---------- Omar chat: one continuous thread ----------
   December 2026 history is part of the existing relationship (never sent to the AI or scored).
   Later messages come from the three internal conversation contexts. */
const CHAT = {
  history: [
    { from: "employee", text: "Hi, congratulations on joining NextWave! Looking forward to working with you and getting to know you better in our first one-on-one.", at: "Tue 15 Dec 2026 · 09:12" },
    { from: "manager", text: "Thanks, Omar! Looking forward to meeting you and working together.", at: "Tue 15 Dec 2026 · 09:40" }
  ],
  dates: { history: "December 2026", alignment: "January 2027", diagnostic: "June 2027", appraisal: "December 2027" }
};

/* ---------- Round 2: Valtora event ---------- */
const VALTORA_ANNOUNCEMENT = "Valtora, one of NextWave's main competitors, has introduced a lower-priced alternative to Customer360 and launched an aggressive campaign targeting NextWave's existing and potential customers.\n\nThe announcement is creating pressure across the Commercial Department.\n\nAs Commercial Director, review the latest business performance information and communications in your Performance Hub.";
const DASHBOARD = {
  kpis: [
    { id: "opps", label: "Qualified opportunities", value: "−12%", sub: "vs pre-launch baseline", dir: "down" },
    { id: "obj", label: "Price-related objections", value: "29%", sub: "of recorded objections · was 18%", dir: "up-bad" },
    { id: "win", label: "Proposal win rate", value: "24%", sub: "was 32%", dir: "down" },
    { id: "val", label: "Valtora mentions", value: "35%", sub: "of active customer discussions", dir: "flat" }
  ],
  months: ["March", "April", "May", "June"],
  win: [33, 32, 31, 24],
  objections: [17, 18, 20, 29],
  mi: [
    { t: "Requested competitor analysis delivered", st: "ok" },
    { t: "Competitor analysis passed internal quality review", st: "ok" },
    { t: "Scheduled monthly market intelligence report submitted two working days late", st: "late" },
    { t: "Omar's recommendation remains under management review", st: "open" },
    { t: "NextWave's commercial response is still being evaluated", st: "open" }
  ]
};
const STAKEHOLDER_EMAILS = [
  { id: "nadine", from: "nadine", subject: "Urgent Commercial Response to Valtora", date: "Mon 5 Jul 2027", body: ["Following Valtora's launch, we need a practical response to the increased pricing pressure.", "Omar's analysis raises valid concerns about matching competitor prices. However, during our meeting, I felt that the discussion focused heavily on defending the analysis rather than identifying what we could implement immediately.", "We need clearer options and a faster way forward."] },
  { id: "youssef", from: "youssef", subject: "Sales Team Concerns — Valtora", date: "Mon 5 Jul 2027", body: ["The team is facing increasing pressure from customers comparing our prices with Valtora.", "Omar's analysis helped us understand why an immediate price reduction could be risky. However, we still need practical alternatives that the sales team can use in customer discussions.", "I believe a joint discussion between Market Intelligence and Sales would help."] },
  { id: "salma", from: "salma", subject: "Customer Objections and Competitive Offers", date: "Tue 6 Jul 2027", body: ["Several customers have recently asked why they should choose Customer360 when Valtora is offering a lower price.", "Omar's findings are useful, especially the risks of competing only on price. But we need a simpler explanation of our value and clearer alternatives to share with customers.", "Could we arrange a discussion to align on our response?"] },
  { id: "mariam", from: "mariam", subject: "Concern Regarding Omar", date: "Tue 6 Jul 2027", secondhand: true, body: ["I wanted to share something I noticed after the recent Valtora discussions.", "Omar and I were reviewing some of the information needed for the updated commercial proposals. He seemed quite frustrated and mentioned that he had spent a lot of time validating the competitor analysis but felt his recommendations weren't being given a fair chance.", "He also mentioned that he was struggling to keep up with his regular reporting alongside the urgent requests.", "I thought you should know because he doesn't seem like his usual self. I haven't discussed this with anyone else."] }
];

/* ---------- Employee Pulse (deterministic rules engine; configurable pilot values) ---------- */
const PULSE = {
  baseline: { performance: 80, trust: 60, development: 55 },
  dims: [
    { id: "performance", l: "Performance", d: "Omar's ability and conditions to deliver expected results." },
    { id: "trust", l: "Trust", d: "Omar's confidence in his manager's fairness, consistency and support." },
    { id: "development", l: "Development", d: "Useful growth opportunities, coaching and capability support Omar receives." }
  ],
  /* Each event belongs to a slot; a slot is applied once (prevents double-counting). */
  events: {
    fair_alignment: { slot: "alignment", round: 1, label: "Fair and clear alignment", d: { performance: 2, trust: 6, development: 3 } },
    dismissive_alignment: { slot: "alignment", round: 1, label: "Dismissive alignment", d: { performance: 0, trust: -8, development: -2 } },
    midyear_disruption: { slot: "disruption", round: 2, label: "Mid-year business disruption (Valtora)", d: { performance: -5, trust: 0, development: 0 } },
    constructive: { slot: "coaching", round: 2, label: "Constructive diagnosis and coaching", d: { performance: 0, trust: 5, development: 4 } },
    punitive: { slot: "coaching", round: 2, label: "Punitive or blaming conversation", d: { performance: 0, trust: -9, development: -4 } },
    intervention_followthrough: { slot: "intervention", round: 3, label: "Development intervention with follow-through (outcomes revealed)", d: { performance: 3, trust: 3, development: 8 } },
    unfair_appraisal: { slot: "appraisal", round: 3, label: "Unfair final appraisal", d: { performance: 0, trust: -10, development: -4 } },
    fair_appraisal: { slot: "appraisal", round: 3, label: "Fair, evidence-based appraisal", d: { performance: 0, trust: 5, development: 4 } }
  }
};

/* ---------- The participant: Commercial Director (My Profile) ----------
   CEO-set objectives are provisional fictional pilot targets; edit here.
   They are kept separate from Omar's individual objectives. */
const DIRECTOR = {
  title: "Commercial Director", department: "Commercial", company: "NextWave",
  joined: "December 2026", reportsTo: "Chief Executive Officer (CEO)", status: "Active",
  location: "Corporate Office", directReports: 4, year: "January – December 2027",
  leave: "Leave information not available in pilot",
  purpose: "Lead NextWave's commercial strategy and performance, ensuring sustainable revenue growth, effective market positioning, strong customer relationships, and alignment between commercial priorities and organizational objectives.",
  responsibilities: [
    "Translate company strategy into commercial objectives and measurable performance targets.",
    "Lead and develop the Commercial Department.",
    "Monitor commercial performance, sales opportunities, and customer trends.",
    "Evaluate market intelligence and competitor developments to support business decisions.",
    "Coordinate commercial activities across Sales, Business Development, Market Intelligence, and Proposal Design.",
    "Establish clear performance expectations and conduct regular performance reviews.",
    "Coach employees, address performance gaps, and support employee development.",
    "Collaborate with other departments to respond to market and customer needs.",
    "Report commercial performance and strategic recommendations to the CEO."
  ],
  team: ["omar", "youssef", "salma", "mariam"]
};
const CEO_OBJECTIVES = [
  { id: "growth", title: "Drive Commercial Growth", kpi: "Achieve at least 15% annual commercial revenue growth compared with 2026.", target: "≥ 15%", short: "Revenue growth vs 2026" },
  { id: "conversion", title: "Improve Sales Conversion", kpi: "Achieve an average annual proposal win rate of at least 35%.", target: "≥ 35%", short: "Average proposal win rate" },
  { id: "pipeline", title: "Strengthen Commercial Pipeline", kpi: "Increase qualified commercial opportunities by at least 20% compared with the 2026 baseline.", target: "+20%", short: "Qualified opportunities vs 2026" },
  { id: "responsiveness", title: "Strengthen Market Responsiveness", kpi: "Ensure significant competitor developments are assessed and translated into documented commercial response recommendations within an agreed business timeframe.", target: "Within agreed timeframe", short: "Competitor response" },
  { id: "team", title: "Build a High-Performing Commercial Team", kpi: "Complete performance goal alignment, scheduled check-ins, and final evaluations for all direct reports within the company's performance management cycle.", target: "All direct reports", short: "Performance cycle completion" }
];

/* ---------- Commercial dashboard: one data source for Home and Business Dashboard ----------
   Start of year: CEO targets with baseline placeholders (no invented results).
   After the Valtora event: the agreed mid-year figures (DASHBOARD above).
   Year-end: company figures delivered by the server with the year-end update. */
const DASHBOARD_INFO = {
  opps: { obj: "pipeline", def: "Qualified commercial opportunities in the pipeline, compared with the baseline.", source: "CRM pipeline report" },
  obj: { obj: "conversion", def: "Share of recorded customer objections that relate to price.", source: "CRM objection records" },
  win: { obj: "conversion", def: "Share of submitted proposals that were won.", source: "Proposal tracker" },
  val: { obj: "responsiveness", def: "Share of active customer discussions in which Valtora was mentioned.", source: "CRM discussion notes" }
};
