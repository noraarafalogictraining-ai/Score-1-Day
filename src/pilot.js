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
   The four competencies from the pilot brief carry the approved level descriptors.
   The other NextWave competencies carry DRAFT descriptors written for the pilot
   (status "draft") so every competency shows three levels; review before scaling. */
const C = (id, name, basic, intermediate, advanced, status = "approved") => ({ id, name, status, levels: { basic, intermediate, advanced } });
const COMPETENCY_LIBRARY = [
  C("analytical", "Analytical Thinking",
    "Organizes data, identifies straightforward trends, and produces accurate analysis using established methods and guidance.",
    "Independently analyzes information from multiple sources, identifies meaningful trends, and explains implications.",
    "Interprets complex or conflicting data, anticipates market shifts, and develops well-supported insights that inform strategic decisions."),
  C("acumen", "Business Acumen",
    "Understands NextWave's products, customers, and commercial objectives.",
    "Connects market findings to commercial priorities, assesses opportunities and risks, and proposes practical actions.",
    "Anticipates broader commercial implications, evaluates strategic trade-offs, and influences priorities through commercially grounded recommendations."),
  C("communication", "Communication",
    "Explains findings accurately and responds to straightforward questions.",
    "Adapts technical findings to the audience, highlights business implications, and responds constructively to questions.",
    "Communicates complex or sensitive insights persuasively, facilitates difficult discussions, and builds understanding across audiences."),
  C("stakeholder", "Stakeholder Management",
    "Identifies stakeholders, shares information, and responds professionally to requests.",
    "Clarifies stakeholder needs, seeks input, and manages disagreements constructively.",
    "Builds alignment among stakeholders with competing priorities and influences complex decisions while preserving trust."),
  C("problem", "Problem Solving",
    "Identifies the problem and applies known approaches to resolve routine issues.",
    "Analyses root causes, weighs options and recommends practical solutions.",
    "Resolves complex, ambiguous problems across functions and anticipates the consequences of solutions.", "draft"),
  C("time", "Time Management & Prioritization",
    "Plans own tasks and meets agreed deadlines when priorities are stable.",
    "Prioritises competing requests against agreed objectives and flags deadline risks early.",
    "Manages shifting, high-stakes priorities across stakeholders and renegotiates commitments proactively.", "draft"),
  C("accountability", "Accountability & Ownership",
    "Completes assigned work and reports progress when asked.",
    "Takes ownership of outcomes, admits mistakes and follows through on commitments without reminders.",
    "Owns cross-functional outcomes, holds self and others to commitments and drives corrective action.", "draft"),
  C("adaptability", "Adaptability & Flexibility",
    "Adjusts to changes when given clear direction.",
    "Adapts plans and approach quickly when circumstances change, keeping quality.",
    "Leads others through change and turns disruption into opportunities.", "draft"),
  C("coaching", "Coaching",
    "Shares knowledge with colleagues when asked.",
    "Gives constructive feedback and helps colleagues build capability.",
    "Builds team capability systematically and develops successors.", "draft")
];
function competencyLibrary() { return COMPETENCY_LIBRARY; }
function competencyById(_emp, id) { return COMPETENCY_LIBRARY.find(c => c.id === id); }

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
