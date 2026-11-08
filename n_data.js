
/* =========================================================
   SCORE ONE-DAY — STRUCTURE & CONTENT
   Three rounds: Behind the Performance · Setting KPIs · Performance Evaluation
   ========================================================= */
const STAGES = [
  { id: "r1", label: "Behind the Performance", short: "Round 1", month: "Before the performance year" },
  { id: "begins", label: "Setting KPIs", short: "Round 2", month: "Q1 2027" },
  { id: "evaluate", label: "Performance Evaluation", short: "Round 3", month: "Year-end" },
  { id: "summary", label: "Final Summary", short: "Summary", month: "" }
];
const STAGE_STEPS = {
  r1: ["CEO Message", "Define the Need"],
  begins: ["Strategy and Objectives", "Performance Contract"],
  evaluate: ["Performance Review", "Identify Gaps", "Evaluate & Rate"]
};
/* Facilitator release codes (local gate, per device) */
const RELEASE_CODES = { begins: "4826", evaluate: "7319" };

/* ---------- ROUND 1 · BEHIND THE PERFORMANCE ---------- */
const NEEDS = {
  omar: {
    theme: "Fairness & Recognition", icon: "target",
    line: "Strong performance does not necessarily mean agreeing with everyone.",
    message: "So, four years here now. Honestly, the part I enjoy most is when the numbers show us something nobody expected. And if the data says something uncomfortable, I'd rather say it early than sit on it. I just want my work judged on whether it's right and whether it helps us, not on whether people liked hearing it. Pushing back on an assumption doesn't mean I'm not part of the team."
  },
  youssef: {
    theme: "Trust & Autonomy", icon: "compass",
    line: "Balancing responsibility, control, and delegation.",
    message: "Last year was a good one. 108% of target, and then the promotion. I know how to close, and when a deal really matters, I want to be in the room. What I need is for you to trust me to run my area. Managing Salma is new for me, to be honest. I'm still figuring out what to hand over and what to keep close."
  },
  salma: {
    theme: "Growth & Development", icon: "spark",
    line: "Learning what good performance looks like and developing her capabilities.",
    message: "I've been here about a year now, and I really want to show I belong. I'm out with prospects every single day, and I like being busy. Just give me the feedback straight, I'll use it. What I'd love is for someone to show me what good actually looks like here, and give me the chance to get there."
  },
  mariam: {
    theme: "Clarity & Direction", icon: "flag",
    line: "Managing conflicting expectations and priorities.",
    message: "If a deal needs a proposal, I'll make the time, you know that. Customers notice the quality, and I'm proud of it. But the requests come from everyone at once, and everyone has their own idea of what good looks like. What would really help is knowing what matters most, and agreeing on the direction before I start designing, not after."
  }
};
const R1_STEPS = [
  { n: 1, t: "Meet the NextWave Team", m: 3, d: "Explore all four employee stories." },
  { n: 2, t: "Explore your employee", m: 4, d: "Your facilitator assigns your table one employee. Discuss what they need to perform at their best." },
  { n: 3, t: "Share your discoveries", m: 4, d: "Each table shares its findings with the room." },
  { n: 4, t: "CEO reflection", m: 1, d: "One question for everyone." }
];
const R1_QUESTIONS = ["What does this employee need to perform at their best?", "What could happen if this need is consistently unmet?"];
const R1_REFLECTION = "Despite their different needs, what should every employee be able to expect from their manager?";
const R1_CLOSE = ["Different people need different things to perform at their best.", "But every employee deserves fair treatment, clear expectations, and accountability."];

/* ---------- ROUND 2 · LEARNING SUPPORT (concise, in-context) ---------- */
const CASCADE = [["Strategy", "defines our direction"], ["Objectives", "define our destination"], ["KPIs", "measure our progress"], ["Competencies", "enable our performance"]];
const TOOLKIT = [
  { id: "cascade", t: "Strategy cascading", b: "Check vertical alignment: does each objective serve the 2027 strategy? Check cross-functional alignment: does it work with the roles around it?" },
  { id: "smart", t: "SMART objectives", b: "Specific · Measurable · Achievable · Relevant · Time-bound. Use ✦ Check quality on each objective to see how it holds up." },
  { id: "kpi", t: "KPIs: measuring what matters", b: "A KPI can be measurable without being meaningful. Ask whether the number tells you the result that matters is happening, not only that activity took place." },
  { id: "weights", t: "Weights: what we prioritise", b: "Weights tell the employee what matters most this year. They must total 100%." },
  { id: "how", t: "Competencies: the HOW", b: "Objectives and KPIs describe WHAT must be delivered. Competencies describe HOW it must be done, as behaviour you can observe." },
  { id: "guide", t: "Objective setting guidelines", ph: true }
];

/* ---------- ROUND 3 · FIXED PERFORMANCE RECORD (2027) ----------
   H1: v26 mid-year evidence file. H2: v26 neutral path + fixed year-end evidence.
   No coaching-dependent outcomes. Independent of Round 2 choices.
   kind: data | obs | interp | account | ctx      pol: pos | neg | mix | ctx      */
const NR = "Not recorded";
const KIND_LABEL = { data: "Data / record", obs: "Documented observation", interp: "Interpretation", account: "Personal account", ctx: "Business context" };
const FACT_KINDS = ["data", "obs"];
const CTX = {
  jul: { p: "Jul 2027", h: "H2", o: 50, std: null, dim: "CTX", kpi: "Business context", text: "Valtora Technologies announced a major enhancement to its AI-enabled business solution: faster implementation, simpler analytics and AI-supported decisions. Within weeks, prospects and customers began asking NextWave about AI.", src: "Market news", kind: "ctx", pol: "ctx", action: NR, status: "Completed" },
  aug: { p: "Aug 2027", h: "H2", o: 55, std: null, dim: "CTX", kpi: "Business context", text: "NextWave confirmed it would accelerate NextWave Insights, bringing forward capabilities planned for later. AI questions began appearing in commercial conversations, often before scope was final.", src: "Company announcement", kind: "ctx", pol: "ctx", impact: NR, action: NR, status: "Completed" },
  oct: { p: "Oct 2027", h: "H2", o: 70, std: null, dim: "CTX", kpi: "Business context", text: "The enhanced NextWave Insights was released to selected customers and the market.", src: "Company announcement", kind: "ctx", pol: "ctx", impact: NR, action: NR, status: "Completed" }
};
const E = (o) => Object.assign({ impact: NR, action: NR, status: "Completed" }, o);

const LOG = {
  omar: [
    E({ id: "o3", p: "Q2", h: "H1", o: 20, std: ["w2", "h2"], dim: "WHAT", text: "His Q2 analysis connected the AI trend to win/loss notes, deal-stage data and customer questions logged in CRM. It flagged that three recent losses cited ‘AI roadmap’ as a factor.", src: "Q2 leadership review", kind: "obs", pol: "pos" }),
    E({ id: "o7", p: "Q2", h: "H1", o: 25, std: ["h1"], dim: "HOW", text: "“Good analyst. But it became a debate about methodology, and we ran out of time to decide anything.”", src: "Senior stakeholder feedback", kind: "interp", pol: "neg", impact: "No decision reached in that review (stakeholder account).", status: "Recorded" }),
    E({ id: "o16", p: "H2 (Jul to Dec)", h: "H2", o: 83, std: ["w3"], dim: "WHAT", text: "Leadership adopted Omar's AI recommendation after a second review.", src: "Leadership reviews, H2", kind: "obs", pol: "mix", impact: "Recommendation adopted; the decision needed a second review." }),
    E({ id: "o17", p: "H2 (Jul to Dec)", h: "H2", o: 84, std: ["h1"], dim: "HOW", text: "Omar's briefings remain strong on content. Stakeholders still describe some discussions as difficult when his conclusions are challenged.", src: "Leadership reviews, H2", kind: "interp", pol: "neg", status: "Ongoing" }),
    E({ id: "o19", p: "Full year", h: "FY", o: 99, std: ["w1"], dim: "WHAT", text: "12 of 12 scheduled market and competitor reports delivered on time. Accuracy of competitor tracking confirmed in the Q4 win/loss review.", src: "Report delivery tracker · Q4 win/loss review", kind: "data", pol: "pos" })
  ],
  youssef: [
    E({ id: "y2", p: "Q1 to Q2", h: "H1", o: 10, std: ["w3", "h1"], dim: "WHAT", text: "Youssef joined 4 of Salma's client calls in Q1, and 11 of 15 in Q2. Three of her proposals show major sections rewritten by him before sending.", src: "Calendar · Proposal version history", kind: "data", pol: "neg", status: "Ongoing" }),
    E({ id: "y8", p: "June", h: "H1", o: 32, std: ["h1"], dim: "HOW", text: "Opportunities Youssef leads personally: 9, up from 5 at the start of the year, plus weekly reviews of Salma's pipeline.", src: "Workload record", kind: "data", pol: "mix", status: "Ongoing" }),
    E({ id: "y16", p: "H2 (Jul to Dec)", h: "H2", o: 81, std: ["w3"], dim: "WHAT", text: "Salma progressed several opportunities with greater independence, while Youssef still joined many of her important calls.", src: "Pipeline record · Calendar", kind: "obs", pol: "mix", note: "No counts recorded for H2." }),
    E({ id: "y18", p: "H2 (Jul to Dec)", h: "H2", o: 83, std: ["w2", "h2"], dim: "WHAT", text: "One proposal needed scope clarification with the customer after signature.", src: "Proposal records", kind: "data", pol: "neg" }),
    E({ id: "y19", p: "Full year", h: "FY", o: 99, std: ["w1", "h2"], dim: "WHAT", text: "New business closed: 104% of annual target.", src: "Area results", kind: "data", pol: "pos" })
  ],
  salma: [
    E({ id: "s5", p: "April", h: "H1", o: 12, std: ["h2"], dim: "HOW", text: "After feedback on her discovery calls in April, Salma rewrote her opening questions and now asks about budget and timeline earlier.", src: "1:1 notes", kind: "obs", pol: "pos", action: "Feedback given on her discovery calls (April 1:1)." }),
    E({ id: "s7", p: "June", h: "H1", o: 32, std: ["h1"], dim: "HOW", text: "Five opportunities rated low-probability for more than 60 days are still active and take a large share of her follow-up time.", src: "Pipeline record", kind: "obs", pol: "neg", impact: "A large share of follow-up time went to low-probability opportunities.", status: "Open at mid-year" }),
    E({ id: "s14", p: "H2 (Jul to Dec)", h: "H2", o: 80, std: ["w1"], dim: "WHAT", text: "Opportunities meeting qualification criteria: 29% in Q1, 41% in Q2, 52% in H2. Still uneven by month.", src: "CRM pipeline report", kind: "data", pol: "mix" }),
    E({ id: "s18", p: "Full year", h: "FY", o: 98, std: ["w3"], dim: "WHAT", text: "Prospecting activity for the year: 126% of plan.", src: "Activity dashboard", kind: "data", pol: "pos" }),
    E({ id: "s19", p: "Full year", h: "FY", o: 99, std: ["w2"], dim: "WHAT", text: "New customers closed in the year: 3. Her three largest wins came from opportunities she qualified early on need, budget and timeline.", src: "CRM pipeline report", kind: "data", pol: "pos", note: "Full-year figure." })
  ],
  mariam: [
    E({ id: "m2", p: "H1 (Jan to Jun)", h: "H1", o: 31, std: ["w1"], dim: "WHAT", text: "On-time delivery, all first-half proposals: 45%. Two of Salma's proposals waited 9 days for Mariam's design.", src: "Delivery date log · Pipeline review", kind: "data", pol: "neg" }),
    E({ id: "m6", p: "H1 (Jan to Jun)", h: "H1", o: 32, std: ["h2"], dim: "HOW", text: "On the two largest proposals, the direction changed after the design was finished. Each went through three revision rounds because stakeholders hadn't agreed the approach at the start.", src: "Revision log", kind: "obs", pol: "neg", impact: "Three revision rounds on each of the two largest proposals." }),
    E({ id: "m16", p: "H2 (Jul to Dec)", h: "H2", o: 80, std: ["w1"], dim: "WHAT", text: "On-time delivery, all second-half proposals: 55% (H1: 45%).", src: "Delivery date log", kind: "data", pol: "mix" }),
    E({ id: "m17", p: "H2 (Jul to Dec)", h: "H2", o: 81, std: ["h1", "h2"], dim: "HOW", text: "She still accepts most requests the day they arrive and starts designing before the direction is agreed.", src: "Request intake log", kind: "obs", pol: "neg", status: "Ongoing" }),
    E({ id: "m18", p: "Full year", h: "FY", o: 99, std: ["w2", "w3"], dim: "WHAT", text: "Proposal volume stayed the highest in Commercial (26 in H1 against a plan of 18). Customer feedback on her proposals remains the strongest in the team.", src: "Proposal tracker · customer feedback", kind: "data", pol: "pos" })
  ]
};
/* Impact · manager action · status for every log entry (status: Ongoing or Completed only) */
const LOG_EXTRA = {
  o3: ["Leadership had early warning of the AI pattern in recent losses.", "Asked Omar to present the analysis at the Q2 leadership review.", "Completed"],
  o7: ["The Q2 review ended without a decision on his recommendation.", "Shared the stakeholder feedback with Omar in his next 1:1.", "Completed"],
  o16: ["The Commercial AI positioning was agreed one review later than planned.", "Scheduled a second leadership review to close the decision.", "Completed"],
  o17: ["Decisions on his recommendations take longer to reach.", "Discussed the stakeholder feedback with Omar; agreed to revisit it at year-end.", "Ongoing"],
  o19: ["Commercial had reliable, accurate competitor data throughout the year.", "Recognised the delivery record in the Q4 review.", "Completed"],
  y2: ["Salma had few chances to lead client conversations or finalise her own proposals.", "Raised Youssef's involvement in Salma's calls during the Q2 1:1.", "Ongoing"],
  y8: ["Youssef's workload rose, and fewer opportunities sat with Salma.", "Reviewed his opportunity list with him at mid-year.", "Ongoing"],
  y16: ["Salma owned more of the early pipeline; larger deals still depended on Youssef.", "Asked Youssef to agree with Salma which opportunities she leads.", "Ongoing"],
  y18: ["Extra customer meetings were needed to reset the scope after signature.", "Asked Youssef to review proposal scope before signature.", "Completed"],
  y19: ["His area contributed above target to Commercial's growth objective.", "Recognised the result in the year-end business review.", "Completed"],
  s5: ["Budget and timeline now come up earlier in her discovery calls.", "Feedback given on her discovery calls in the April 1:1.", "Completed"],
  s7: ["A large share of her follow-up time went to low-probability opportunities.", "Youssef reviewed the five opportunities with Salma at mid-year.", "Ongoing"],
  s14: ["More of her pipeline can realistically convert into business.", "Youssef tracks qualification monthly in pipeline reviews.", "Ongoing"],
  s18: ["Wide coverage of the target segments.", "Reviewed monthly on the activity dashboard.", "Completed"],
  s19: ["Three new customer accounts added to Commercial's growth.", "Recognised the wins at the year-end team meeting.", "Completed"],
  m2: ["Late proposals held up deals; two of Salma's opportunities waited 9 days.", "Raised late deliveries with Mariam in the Q2 1:1.", "Completed"],
  m6: ["Three revision rounds on each of the two largest proposals, adding design time.", "Asked deal owners to agree the approach before design starts.", "Ongoing"],
  m16: ["Fewer late proposals than in H1, but nearly half still missed the agreed date.", "Reviews on-time delivery with Mariam each month.", "Ongoing"],
  m17: ["Requests are not prioritised, so urgent proposals compete with low-value ones.", "Discussed a request intake process with Mariam; not yet in place.", "Ongoing"],
  m18: ["Customers consistently receive clear, professional proposals.", "Shared the customer praise with Mariam and the team.", "Completed"]
};
Object.values(LOG).flat().forEach(e => { const x = LOG_EXTRA[e.id]; if (x) { e.impact = x[0]; e.action = x[1]; e.status = x[2]; } });
Object.values(LOG).forEach(list => list.sort((a, b) => ({ H1: 0, H2: 1, FY: 2 })[a.h] - ({ H1: 0, H2: 1, FY: 2 })[b.h] || a.o - b.o));

/* NextWave Agreed Performance Standards — proposed reference standards drafted from each role description
   and the 2027 priorities. No numeric targets are added beyond what the record documents. */
const STD = {
  omar: [
    { id: "w1", dim: "WHAT", w: 35, name: "Scheduled market & competitor reports", exp: "All scheduled reports delivered on time, with accurate competitor tracking.", basis: "Role: “Produce scheduled market and competitor reports”" },
    { id: "w2", dim: "WHAT", w: 35, name: "Insight that informs where Commercial competes", exp: "Analysis identifies market trends and opportunities and is used to shape Commercial decisions.", basis: "Role: “Recommend target segments and opportunities” · GROW" },
    { id: "w3", dim: "WHAT", w: 30, name: "Stakeholders act on his insight", exp: "Findings are presented so Commercial and leadership stakeholders can reach a decision.", basis: "Role: “Present findings and recommendations to stakeholders”" },
    { id: "h1", dim: "HOW", name: "Communication", exp: "Presents findings and recommendations clearly; answers the question asked when challenged.", basis: "NextWave competency" },
    { id: "h2", dim: "HOW", name: "Problem Solving", exp: "Builds evidence-based analysis that connects several data sources.", basis: "NextWave competency" }
  ],
  youssef: [
    { id: "w1", dim: "WHAT", w: 40, name: "New-business results for his area", exp: "100% of the annual new-business target.", basis: "Role: “Own new-business results for his area”" },
    { id: "w2", dim: "WHAT", w: 25, name: "Sound customer commitments", exp: "Customer commitments are commercially sound and realistic, so deals don't need rework after signature.", basis: "Role: “Ensure customer commitments are commercially sound and realistic” · RETAIN / SCALE" },
    { id: "w3", dim: "WHAT", w: 35, name: "Managing and developing the Sales Executive", exp: "Salma owns opportunities appropriate to her level; Youssef coaches rather than takes over.", basis: "Role: “Manage, coach and develop the Sales Executive” · BUILD" },
    { id: "h1", dim: "HOW", name: "Coaching", exp: "Develops others through questions and checkpoints instead of doing the work for them.", basis: "NextWave competency" },
    { id: "h2", dim: "HOW", name: "Accountability & Ownership", exp: "Owns his area's results and the commitments made to customers.", basis: "NextWave competency" }
  ],
  salma: [
    { id: "w1", dim: "WHAT", w: 40, name: "Opportunity quality", exp: "A growing share of her pipeline meets qualification criteria, consistently month to month.", basis: "Role: “Qualify opportunities and progress promising ones”" },
    { id: "w2", dim: "WHAT", w: 30, name: "Conversion into new business", exp: "Qualified opportunities convert into new customers.", basis: "Role contribution: “opportunities that can realistically become NextWave business” · GROW" },
    { id: "w3", dim: "WHAT", w: 30, name: "Prospecting activity", exp: "Prospecting activity at or above plan in target segments.", basis: "Role: “Prospect into target segments” · activity plan" },
    { id: "h1", dim: "HOW", name: "Time Management", exp: "Spends follow-up time on opportunities with real potential and pauses stalled ones.", basis: "NextWave competency" },
    { id: "h2", dim: "HOW", name: "Adaptability & Flexibility", exp: "Acts on feedback and adjusts her approach.", basis: "NextWave competency" }
  ],
  mariam: [
    { id: "w1", dim: "WHAT", w: 40, name: "On-time delivery", exp: "Proposals delivered on the date agreed with the deal owner.", basis: "Role: “Agree delivery dates with the deal owner and meet them” · SCALE" },
    { id: "w2", dim: "WHAT", w: 35, name: "Proposal quality and consistency", exp: "Clear, professional, consistent proposals that customers value.", basis: "Role: “Maintain professional quality and consistency across all proposals”" },
    { id: "w3", dim: "WHAT", w: 25, name: "Proposal output", exp: "Proposal volume in line with the Commercial proposal plan.", basis: "Proposal plan (H1 plan: 18)" },
    { id: "h1", dim: "HOW", name: "Time Management", exp: "Prioritises requests by business need and agrees realistic dates.", basis: "NextWave competency" },
    { id: "h2", dim: "HOW", name: "Communication", exp: "Agrees direction with stakeholders before designing and coordinates their input.", basis: "Role: “Coordinate input from Sales, Business Development and product stakeholders”" }
  ]
};

/* Facts vs interpretation — statements that could appear in a year-end review */
const SORT = {
  omar: [
    { id: "f1", t: "6 of 6 scheduled reports were delivered on time in H1.", a: "fact" },
    { id: "f2", t: "He went further into the data instead of answering the question.", a: "interp" },
    { id: "f3", t: "Leadership adopted his AI recommendation after a second review.", a: "fact" },
    { id: "f4", t: "Omar is difficult to work with.", a: "interp" },
    { id: "f5", t: "Three recent losses cited ‘AI roadmap’ as a factor.", a: "fact" },
    { id: "f6", t: "The discussion became a debate about methodology.", a: "interp" }
  ],
  youssef: [
    { id: "f1", t: "Youssef joined 11 of Salma's 15 client calls in Q2.", a: "fact" },
    { id: "f2", t: "Youssef doesn't trust his team.", a: "interp" },
    { id: "f3", t: "New business closed: 104% of annual target.", a: "fact" },
    { id: "f4", t: "Salma isn't ready for the bigger deals.", a: "interp" },
    { id: "f5", t: "Three of Salma's proposals had major sections rewritten by Youssef before sending.", a: "fact" },
    { id: "f6", t: "He is a natural leader.", a: "interp" }
  ],
  salma: [
    { id: "f1", t: "Prospecting activity was 131% of plan in H1.", a: "fact" },
    { id: "f2", t: "Salma confuses being busy with being productive.", a: "interp" },
    { id: "f3", t: "29% of her opportunities met qualification criteria in Q1; 41% in Q2.", a: "fact" },
    { id: "f4", t: "She is quick and responsive with prospects.", a: "interp" },
    { id: "f5", t: "Five low-probability opportunities had been open for more than 60 days at mid-year.", a: "fact" },
    { id: "f6", t: "She will make a great manager one day.", a: "interp" }
  ],
  mariam: [
    { id: "f1", t: "On-time delivery for first-half proposals was 45%.", a: "fact" },
    { id: "f2", t: "Mariam can't say no.", a: "interp" },
    { id: "f3", t: "She delivered 26 proposals in H1 against a plan of 18.", a: "fact" },
    { id: "f4", t: "Her proposals are the best in the company.", a: "interp" },
    { id: "f5", t: "Two of Salma's proposals waited 9 days for her design.", a: "fact" },
    { id: "f6", t: "She is overwhelmed by the workload.", a: "interp" }
  ]
};

/* Provisional reference evaluations (to be refined after testing) */
const REF = {
  omar: {
    rating: 3, what: 3, how: 1, std: { w1: 3, w2: 3, w3: 2, h1: 1, h2: 3 },
    ev: ["o19", "o3", "o16", "o7", "o17"],
    whatWhy: "Met to Above. All 12 scheduled reports were delivered on time, with accuracy confirmed in the Q4 win/loss review. His Q2 analysis linked several data sources and spotted the AI pattern in recent losses early. His recommendation was adopted, but only after a second review.",
    howWhy: "Below. Communication is the behaviour this role depends on: insight only creates value when people can act on it. In both halves stakeholders describe discussions becoming difficult when his conclusions are challenged, and his recommendation needed a second review. Problem Solving was a clear strength.",
    ratingWhy: "Defensible range 3 to 4. The results are strong; Communication, the behaviour this role depends on, stayed below standard in both halves. A 3 gives full weight to that behaviour gap; a 4 gives more weight to the results. A 5 would set the HOW evidence aside, and a 2 would discount a strong results record."
  },
  youssef: {
    rating: 3, what: 2, how: 2, std: { w1: 3, w2: 2, w3: 1, h1: 1, h2: 2 },
    ev: ["y19", "y2", "y8", "y16", "y18"],
    whatWhy: "Met. Results were strong (104% of annual target), but the role also owns developing the Sales Executive. In H1 he joined most of Salma's calls and rewrote her proposals. By H2 she was progressing more opportunities on her own, though he still joined many of her important calls. One proposal needed scope clarification after signature.",
    howWhy: "Met overall. He owns his results (Accountability met). Coaching stayed below standard: the opportunities he led personally rose from 5 to 9 by mid-year.",
    ratingWhy: "Defensible range 3 to 4. A 3 gives full weight to the people side of his role; a 4 is reasonable if you judge that the results outweigh it. A 5 would rate revenue alone and ignore a third of the role."
  },
  salma: {
    rating: 3, what: 2, how: 2, std: { w1: 2, w2: 2, w3: 3, h1: 1, h2: 3 },
    ev: ["s14", "s19", "s18", "s5", "s7"],
    whatWhy: "Met. Qualification improved from 29% (Q1) to 41% (Q2) to 52% (H2), though it was still uneven month to month. She closed 3 new customers in the year, and her largest wins came from opportunities she qualified early. Activity stayed above plan (126%), but activity is an input, not the result.",
    howWhy: "Met. She acts quickly on feedback: she rewrote her discovery questions after one round of feedback in April. At mid-year five low-probability opportunities had been open for more than 60 days.",
    ratingWhy: "Defensible rating 3. The record shows real improvement but uneven quality and stalled opportunities early in the year. A 2 or a 4 is plausible but harder to defend: a 4 would need consistent qualification gains, and a 2 would ignore the improvement and the new customers. Rating on activity (126% of plan) would reward busyness, not performance."
  },
  mariam: {
    rating: 2, what: 2, how: 1, std: { w1: 1, w2: 3, w3: 3, h1: 1, h2: 1 },
    ev: ["m2", "m16", "m18", "m6", "m17"],
    whatWhy: "Met overall, with a clear gap. Delivering on the agreed date is the core of the role: on-time delivery was 45% in H1 and 55% in H2, and two of Salma's proposals waited 9 days. Quality and output were above standard, with the highest volume in Commercial and the strongest customer feedback.",
    howWhy: "Below. She accepts requests the day they arrive and starts designing before the direction is agreed, a pattern recorded in both halves. The two largest proposals each went through three revision rounds.",
    ratingWhy: "Defensible range 2 to 3. A 2 gives full weight to the core expectation of the role, delivering on the agreed date, which was missed for most of the year. A 3 is defensible if you weight her quality and output and the late changes from stakeholders. A 4 or 5 would reward volume while the core expectation was missed."
  }
};

const R3_SCALE = [
  { v: 5, label: "Exceptional" }, { v: 4, label: "Exceeds" }, { v: 3, label: "Meets" }, { v: 2, label: "Below" }, { v: 1, label: "Unsatisfactory" }
];
const JUDG = [{ id: 1, l: "Below" }, { id: 2, l: "Met" }, { id: 3, l: "Above" }];
const WH_OPTS = [{ id: 1, l: "Below expectations" }, { id: 2, l: "Met expectations" }, { id: 3, l: "Above expectations" }];
const CONTEXT_OPTS = [{ id: "harder", l: "Made delivery harder" }, { id: "neutral", l: "Little effect" }, { id: "easier", l: "Made delivery easier" }];

/* Scoring criteria: see n_score.js */
