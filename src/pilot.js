/* =========================================================
   OMAR HASSAN PILOT — PUBLIC SCENARIO CONFIGURATION
   Content participants may see. Hidden facts, reference answers, rubrics
   and year-end datasets live on the server (api/_lib/), never here.
   ========================================================= */
const PILOT = { active: ["omar"], employee: "omar" };

/* Company: uses COMPANY from employees.js unchanged (NextWave Digital company profile handout). */

/* Omar's profile (Omar Hassan Profile handout + Omar's Last Year Appraisal 2026 handout).
   Time in position: ~4 years (owner decision; the profile handout's "approximately 2 years" is superseded). */
Object.assign(EMPLOYEES.omar, {
  title: "Market Intelligence Analyst",
  tenure: "Approx. 4 years in position",
  total: "",
  prevRating: "91.08% overall · 2026 appraisal", prevScore: null,
  prevPerformance: "Recognised for his analytical contribution and his ability to adjust to changing reporting priorities.",
  strengths: ["Data gathering", "Competitor tracking", "Identifying patterns in customer and market information", "Adjusting to changing reporting priorities"],
  role: {
    purpose: "Provide timely, reliable market and competitor intelligence, identify customer and segment trends, and translate findings into useful insights for commercial decisions.",
    reportsTo: "You (Commercial Director)", reportsToRole: "Commercial Director",
    responsibilities: [
      "Monitor competitor activity and emerging market developments.",
      "Prepare regular market intelligence reports and competitor updates.",
      "Analyze customer and segment information to identify opportunities and risks.",
      "Prepare clear insight briefs and recommendations for commercial planning.",
      "Respond to agreed requests from Commercial and coordinate information with relevant departments.",
      "Maintain accuracy, traceability and timely delivery of analytical outputs."
    ]
  },
  /* 2026 appraisal exactly as documented (1–4 scale; not recalculated). */
  prev2026: {
    period: "01 Jan 2026 – 31 Dec 2026", supervisor: "Commercial Manager", timeInPosition: "Approx. 4 years",
    scale: "4 Exceptional · 3 Meets Expectations · 2 Needs Improvement · 1 Unsatisfactory",
    competencies: [
      ["Core", "Presenting & Communicating", 2, "Analyses were detailed, but recommendations were not consistently tailored to commercial stakeholders."],
      ["Core", "Adapting", 3, "Adjusted reporting priorities during changes in competitor activity and urgent requests."],
      ["Core", "Problem Solving", 3, "Identified trends and investigated inconsistencies in competitor and customer data."],
      ["Functional", "Persuading & Negotiating", 2, "Found it difficult to secure stakeholder agreement on the implications of his analysis."],
      ["Functional", "Relationship Building", 2, "Cross-functional relationships were mostly reactive; limited direct follow-up with stakeholders."],
      ["Managerial", "Managing Self & People", 3, "Managed assigned work independently and shared analytical methods with colleagues; people-management behaviours not directly observed."]
    ],
    competencyScore: "83.3%", average: "2.5 / 4",
    objectives: [
      ["Deliver scheduled market intelligence reports", "Reports delivered on time", "10", "9", "90%", "25%", "22.50%", "One report was late after priorities changed."],
      ["Complete competitor monitoring updates", "Monthly updates delivered", "12", "12", "100%", "30%", "30.00%", "Consistent monitoring and useful trend identification."],
      ["Produce customer and segment insights", "Approved insight briefs", "20", "19", "95%", "25%", "23.75%", "Strong analysis; business recommendations sometimes unclear."],
      ["Support commercial planning requests", "Requests completed by agreed dates", "15", "15", "100%", "20%", "20.00%", "Delivered analyses, but stakeholder engagement was reactive."]
    ],
    objectivesScore: "96.25%",
    overall: [["Objectives", "60%", "96.25%", "57.75%"], ["Competencies", "40%", "83.3%", "33.33%"]], overallScore: "91.08%"
  }
});
delete EMPLOYEES.omar.prevEvidence; delete EMPLOYEES.omar.prevFeedback;
const STAKEHOLDERS = {
  nadine: { name: "Nadine Farouk", title: "Operations Director", initials: "NF", img: "assets/people/nadine.jpg" },
  nour: { name: "Nour Khalil", title: "Account Manager", initials: "N", img: "assets/people/nour.jpg" },
  youssef: { name: "Youssef Ali", title: "Business Development Manager", emp: "youssef" },
  salma: { name: "Salma Tarek", title: "Sales Executive", emp: "salma" },
  mariam: { name: "Mariam Adel", title: "Proposal Designer", emp: "mariam" },
  hr: { name: "NextWave HR", title: "Human Resources", initials: "HR", img: "assets/brand/hr-team.png", logo: true }
};

/* ---------- Competency library ----------
   Names only. Participants use the printed competency dictionary for the Basic /
   Intermediate / Advanced descriptions; the descriptions live on the server
   (api/_lib/scenario_omar.js, COMPETENCY_LEVELS) for the assessment only. */
/* Shown in the dropdown in this (alphabetical) order. Ids are stable: saved plans refer to them. */
const COMPETENCY_LIBRARY = [
  { id: "accountability", name: "Accountability & Ownership" },
  { id: "adaptability", name: "Adaptability & Flexibility" },
  { id: "analytical", name: "Analytical Thinking" },
  { id: "acumen", name: "Business Acumen" },
  { id: "coaching", name: "Coaching" },
  { id: "communication", name: "Communication" },
  { id: "problem", name: "Problem Solving" },
  { id: "stakeholder", name: "Stakeholder Management" },
  { id: "strategic", name: "Strategic Thinking" },
  { id: "time", name: "Time Management & Prioritization" }
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

/* ---------- Mid-year: business event "The AI Acceleration" (Omar's Performance Evidence 2027, sections 02–03) ----------
   Released at mid-year (owner decision). No business figures are given in the documents, so none are shown. */
const VALTORA_ANNOUNCEMENT = "Valtora Technologies has announced a major AI-enabled solution enhancement, emphasizing faster implementation, simpler analytics and AI-supported decisions.\n\nNextWave Digital has decided to accelerate its own NextWave Insights enhancement in response. This will shape the second half of 2027 for the Commercial Department.\n\nAs Commercial Director, review Omar's mid-year evidence and the latest communications in your Performance Hub.";
const DASHBOARD = {
  event: [
    "Valtora Technologies announced a major AI-enabled solution enhancement: faster implementation, simpler analytics and AI-supported decisions.",
    "NextWave Digital is accelerating its own NextWave Insights enhancement in response.",
    "The event spans the second half of 2027 and is not under any one employee's control."
  ],
  /* Omar's mid-year evidence, before the business event (document section 02) */
  mi: [
    { t: "All scheduled market and competitor reports delivered on time", st: "ok" },
    { t: "Identified increasing competitive pressure around AI-enabled solutions; the available evidence supported his recommendation", st: "ok" },
    { t: "Commercial stakeholders described his analysis as useful", st: "ok" },
    { t: "Challenged two assumptions held by senior stakeholders", st: "open" },
    { t: "Two stakeholders reported that his responses became defensive and overly detailed when challenged", st: "late" }
  ]
};
/* Pilot assumption (approved): the two senior-stakeholder assumptions Omar challenged were
   (1) that Valtora's AI features were mostly marketing and would not change customer decisions, and
   (2) that NextWave Insights could keep its current release plan.
   The two stakeholders who reported defensive, overly detailed responses are Nadine and Youssef.
   Released with the business event. "me" = the participant (Commercial Director). */
const STAKEHOLDER_EMAILS = [
  { id: "nadine", from: "nadine", to: ["me"], subject: "NextWave Insights - Omar's Input in Our Review", date: "Mon 5 Jul 2027",
    body: ["Hi,", "Omar's work on Valtora Technologies' AI direction has been useful, and with their announcement it looks like he raised the issue at the right time.", "In our planning review he challenged our assumption that NextWave Insights could keep its current release plan. That was a fair point to raise. However, when I questioned his conclusions, his responses became defensive and he went into a lot of detail rather than helping us see the options.", "Now that we're accelerating the NextWave Insights enhancement, Operations needs his input in a form we can act on quickly.", "Could we discuss how we work together on this?", "Best,\nNadine\nOperations Director"] },
  { id: "youssef", from: "youssef", to: ["me"], subject: "Valtora Announcement - Working With Omar's Analysis", date: "Mon 2 Aug 2027",
    body: ["Hi,", "Omar flagged early that Valtora's AI features could change how customers compare us. Some of us thought it was mostly marketing, and he challenged that view. The announcement shows he had a point.", "His analysis is useful to the team. My concern is how the discussions go: when I pushed back on some of his conclusions, he became defensive and his answers got very detailed, and the team struggled to take away what to do next.", "I'd like us to find a better way to work through his findings together.", "Thanks,\nYoussef"] },
  { id: "salma", from: "salma", to: ["Youssef Ali, Business Development Manager"], cc: ["me"], subject: "Customer Questions - Valtora's AI Features", date: "Tue 3 Aug 2027",
    body: ["Hi Youssef,", "Since Valtora Technologies' announcement, a few customers have asked how NextWave Insights compares with Valtora's AI-supported features.", "Omar's competitor updates have helped me understand what Valtora is offering, which made these conversations easier.", "Could we agree what we can say to customers about our NextWave Insights plans before the next meetings?", "Thanks,\nSalma"] },
  { id: "mariam", from: "mariam", to: ["me"], subject: "Concern About Omar", date: "Wed 8 Sep 2027",
    body: ["Hi,", "I wanted to flag something following a conversation I had with Omar.", "He seemed quite frustrated after the recent planning discussions. He feels that when his analysis challenges what senior people expect, the discussion turns to how he said it rather than what the evidence shows.", "He also said he isn't sure it's worth raising difficult findings if they're not welcome.", "I thought you should know because he seemed more frustrated than usual.", "Best,\nMariam"] },
  { id: "nour", from: "nour", to: ["Sales Team", "Account Management Team", "Operations Team", "HR Team"], cc: ["Chief Executive Officer (CEO)", "Chief Human Resources Officer (CHRO)", "Nadine Farouk, Operations Director", "me"], subject: "Great Customer Feedback - Well Done, Team!", date: "Wed 6 Oct 2027",
    body: ["Hi everyone,", "I wanted to share some great feedback we received from one of our customers!", "The customer recently launched a new product and told us that the insights provided by NextWave helped them better understand their target market and make more confident launch decisions.", "They particularly appreciated the quality of our analysis and how useful the findings were in shaping their launch approach.", "It's great to see our work making a real difference for customers.", "Well done to everyone involved!", "Best,\nNour Khalil\nAccount Manager"] }
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
    midyear_disruption: { slot: "disruption", round: 2, label: "Mid-year business event (the AI Acceleration)", d: { performance: -5, trust: 0, development: 0 } },
    constructive: { slot: "coaching", round: 2, label: "Constructive diagnosis and coaching", d: { performance: 0, trust: 5, development: 4 } },
    punitive: { slot: "coaching", round: 2, label: "Punitive or blaming conversation", d: { performance: 0, trust: -9, development: -4 } },
    /* December: only DOCUMENTED follow-through (a development record marked followThrough) can raise Development. The 2027 record has none. */
    documented_followthrough: { slot: "intervention", round: 3, label: "Documented development follow-through (year-end record)", d: { performance: 2, trust: 2, development: 6 } },
    unfair_appraisal: { slot: "appraisal", round: 3, label: "Unfair final appraisal", d: { performance: 0, trust: -10, development: -4 } },
    fair_appraisal: { slot: "appraisal", round: 3, label: "Fair, evidence-based appraisal", d: { performance: 0, trust: 5, development: 4 } },
    /* Final appraisal discussion (from the conversation assessment; separate slots from the written appraisal, so nothing is counted twice) */
    fair_feedback: { slot: "feedback", round: 3, label: "Fair feedback and genuine listening in the appraisal discussion", d: { performance: 0, trust: 4, development: 0 } },
    blaming_feedback: { slot: "feedback", round: 3, label: "Blaming or personal feedback in the appraisal discussion", d: { performance: 0, trust: -6, development: -2 } },
    development_agreement: { slot: "dev_agreement", round: 3, label: "Clear development agreement with manager support", d: { performance: 0, trust: 0, development: 5 } }
  }
};

/* ---------- The participant: Commercial Director (My Profile) ----------
   Commercial Director Profile handout. The 2027 strategic targets are company-wide
   (NextWave company profile); the Director contributes to them but does not own every result. */
const DIRECTOR = {
  title: "Commercial Director", department: "Commercial", company: "NextWave Digital",
  joined: "December 2026", reportsTo: "Chief Executive Officer (CEO)", status: "Active",
  location: "Corporate Office", directReports: 3, year: "January – December 2027",
  leave: "Leave information not available in pilot",
  purpose: "Lead commercial growth while protecting the quality of customer relationships. Translate market intelligence into practical decisions, coordinate stakeholders and create the conditions for your team to deliver sustainable results.",
  responsibilities: [
    "Set clear departmental objectives and align individual work with the company's GROW and RETAIN priorities.",
    "Lead market development, customer acquisition and commercial opportunity management.",
    "Use market and competitor intelligence to inform commercial decisions and customer proposals.",
    "Build effective coordination with Product & Operations and Customer Success to deliver on customer commitments.",
    "Monitor progress using reliable evidence; respond to risks and changing priorities.",
    "Coach, recognize and develop team members; conduct fair, evidence-based performance conversations."
  ],
  team: ["omar", "youssef", "salma", "mariam"],
  /* reporting lines inside the Commercial Department */
  directs: ["omar", "youssef", "mariam"],
  indirect: { youssef: ["salma"] }
};
/* Company-wide 2027 priorities with the Director's documented contribution. Figures exactly as in the company profile. */
const CEO_OBJECTIVES = [
  { id: "GROW", title: "GROW", kpi: "Achieve 18% revenue growth.", target: "18% revenue growth", short: "Revenue growth", contribution: "Build qualified opportunities, improve conversion and support customer expansion." },
  { id: "RETAIN", title: "RETAIN", kpi: "Improve customer retention from 88% to 93%.", target: "88% → 93%", short: "Customer retention", contribution: "Strengthen expectations, handovers and proactive customer communication." },
  { id: "SCALE", title: "SCALE", kpi: "Improve on-time delivery from 82% to 92%.", target: "82% → 92%", short: "On-time delivery", contribution: "Coordinate realistic commitments and escalate delivery risks early." },
  { id: "BUILD", title: "BUILD", kpi: "Strengthen critical capabilities, succession readiness and the talent pipeline; reduce key-person dependency.", target: "Capability & talent", short: "Capabilities, succession and talent pipeline", contribution: "Develop people, share knowledge and reduce reliance on individuals." }
];
