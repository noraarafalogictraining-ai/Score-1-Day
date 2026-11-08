/* =========================================================
   SCORE — CONTENT & DATA LAYER
   Participant-facing content + hidden instructional architecture.
   Hidden fields (prefixed _hidden) are never rendered in play.
   ========================================================= */

const COMPANY = {
  name: "NextWave Digital",
  slogan: "Smarter Business. Better Experiences.",
  plain: "We sell technology that helps companies manage their operations, customers and data.",
  facts: [
    { icon: "calendar", label: "Founded", value: "2017" },
    { icon: "pin", label: "Headquarters", value: "Cairo, Egypt" },
    { icon: "people", label: "Employees", value: "Approximately 650" },
    { icon: "globe", label: "Markets", value: "Egypt and selected MENA markets" }
  ],
  customers: "Primarily mid-sized and large organizations across banking, telecom, retail, hospitality and professional services.",
  sectors: ["Banking", "Telecom", "Retail", "Hospitality", "Professional services"],
  mission: "To help organizations manage their operations, customers and data more effectively through smart technology that improves performance and creates lasting customer value.",
  vision: "To shape the future of business through smarter, connected digital experiences.",
  products: [
    { id: "one", name: "NextWave One", kind: "Business Management Platform", desc: "Helps companies manage customers, daily operations and workflows in one place.", importance: "Core Business", icon: "layers" },
    { id: "insights", name: "NextWave Insights", kind: "Data & AI Solution", desc: "Helps companies analyze data, identify trends and make better decisions.", importance: "Future Growth", icon: "spark" },
    { id: "solutions", name: "NextWave Solutions", kind: "Customized Technology Solutions", desc: "Helps customers solve specific needs or connect existing systems with NextWave products.", importance: "High-Value Business", icon: "link" }
  ],
  challenge: "Scale Without Losing What Made Us Successful",
  priorities: [
    { id: "GROW", title: "Grow", line: "18% revenue growth through new business and growth within existing customer relationships.", from: null, to: "18%", metric: "revenue growth" },
    { id: "RETAIN", title: "Retain", line: "Increase customer retention from 88% to 93%.", from: 88, to: 93, metric: "customer retention" },
    { id: "SCALE", title: "Scale", line: "Increase on-time delivery from 82% to 92% while maintaining quality and efficiency.", from: 82, to: 92, metric: "on-time delivery" },
    { id: "BUILD", title: "Build", line: "Strengthen the talent pipeline, succession readiness and critical capabilities while reducing key-person dependency.", from: null, to: null, metric: "talent & capability" }
  ],
  values: [
    { name: "Customer First", icon: "heart" },
    { name: "Own the Outcome", icon: "target" },
    { name: "Better Together", icon: "people" },
    { name: "Keep Evolving", icon: "spark" }
  ],
  competencies: ["Communication", "Problem Solving", "Coaching", "Adaptability & Flexibility", "Accountability & Ownership", "Time Management"],
  competitor: { name: "Valtora Technologies", line: "A fast-growing technology company competing through faster implementation, competitive pricing and increasingly AI-enabled solutions.", tags: ["Faster implementation", "Competitive pricing", "AI-enabled solutions"] }
};

const DEPT = {
  name: "Commercial",
  purpose: "Identify attractive market opportunities and turn them into new customer business.",
  description: "Commercial drives growth by understanding markets, identifying new opportunities and winning new customers. The team manages the journey from market intelligence and prospecting through solution development, proposal creation, negotiation and closing, while ensuring customer commitments are commercially sound and realistic.",
  reporting: "You lead the Commercial team. Omar and Youssef report to you. Salma reports to Youssef."
};

const EMP_ORDER = ["omar", "youssef", "salma"];

const EMPLOYEES = {
  omar: {
    id: "omar", first: "Omar", name: "Omar Hassan", title: "Market Intelligence Analyst",
    tenure: "4 years at NextWave Digital", total: "6 years total professional experience",
    prevRating: "Exceeded Expectations", prevScore: 4,
    prevPerformance: "Omar consistently delivered accurate market and competitor analysis and was recognized for the quality of his insights. His work supported several commercial decisions and helped leadership identify emerging opportunities.",
    story: "Omar is analytical, confident and willing to challenge assumptions when the evidence points in a different direction. His recommendations are often valuable, but discussions can become difficult when stakeholders challenge his analysis or disagree with his conclusions.",
    strengths: ["Strong analytical thinking", "High-quality market intelligence", "Evidence-based recommendations", "Willingness to challenge assumptions"],
    voice: "If the data points somewhere uncomfortable, I'd rather say it early.",
    role: {
      purpose: "Help Commercial and leadership understand where NextWave should compete, by turning market, customer and competitor information into evidence-based insight.",
      reportsTo: "You (Commercial leadership)",
      reportsToRole: "Commercial Director",
      responsibilities: [
        "Monitor market trends and competitor activity, including Valtora Technologies",
        "Produce scheduled market and competitor reports",
        "Analyse win/loss and pipeline data to identify patterns",
        "Recommend target segments and opportunities",
        "Present findings and recommendations to Commercial and leadership stakeholders"
      ],
      contribution: "Timely, accurate insight that informs where and how Commercial competes."
    },
    _hidden: {
      devAreas: ["Influencing Through Insight", "Stakeholder Communication"],
      challenge: "Evaluate strong analysis fairly when recommendations challenge leadership while helping Omar improve how he communicates his thinking.",
      biases: ["Confirmation Bias", "Halo Effect", "Recency Bias"],
      tension: "Strong performance is not agreement."
    }
  },
  youssef: {
    id: "youssef", first: "Youssef", name: "Youssef Ali", title: "Business Development Manager",
    tenure: "5 years at NextWave Digital", total: "Recently promoted into his first formal management role",
    prevRating: "Exceeded Expectations", prevScore: 4,
    prevPerformance: "Youssef had a strong commercial year and achieved 108% of his target. His results and customer skills contributed to his promotion into the Business Development Manager role.",
    story: "Youssef is highly capable commercially and is accustomed to personally stepping in when an opportunity becomes difficult. As a new manager, he sometimes solves problems himself rather than creating enough ownership for others, particularly Salma.",
    strengths: ["Strong commercial judgment", "Customer credibility", "Results orientation", "Strong opportunity management"],
    voice: "When a deal matters, I want to be in the room.",
    role: {
      purpose: "Turn qualified opportunities into new customer business and lead business development for his area, including managing the Sales Executive who reports to this role.",
      reportsTo: "You (Commercial leadership) · Manages: Salma Tarek",
      reportsToRole: "Commercial Director · Manages: Sales Executive",
      responsibilities: [
        "Own new-business results for his area",
        "Lead solution development, proposals, negotiation and closing on key opportunities",
        "Ensure customer commitments are commercially sound and realistic",
        "Manage, coach and develop the Sales Executive reporting to him",
        "Maintain pipeline visibility and forecast accuracy"
      ],
      contribution: "New business that supports growth targets, won on commitments NextWave can deliver, while leading the Sales Executive."
    },
    _hidden: {
      devAreas: ["Coaching and Delegation", "Managerial Prioritization"],
      challenge: "Help Youssef move from being excellent at commercial work to enabling others to perform without weakening results.",
      biases: ["Halo Effect", "Results Bias", "Recency Bias"],
      tension: "Being excellent at the work does not automatically mean being excellent at managing the work."
    }
  },
  salma: {
    id: "salma", first: "Salma", name: "Salma Tarek", title: "Sales Executive",
    tenure: "1 year at NextWave Digital", total: "",
    prevRating: "Met Expectations", prevScore: 3,
    prevPerformance: "Salma showed strong energy and consistently high prospecting activity during her first year. However, the quality of opportunities entering her pipeline was inconsistent, and she was still developing her ability to distinguish promising opportunities from low-probability ones.",
    story: "Salma is motivated, responsive to feedback and eager to prove herself. She tends to associate visible activity with strong performance and can spend too much time pursuing opportunities that are unlikely to convert.",
    strengths: ["High energy", "Strong prospecting activity", "Responsive to feedback", "Willingness to learn"],
    voice: "Give me the feedback straight. I'll use it.",
    role: {
      purpose: "Identify and develop potential opportunities that can become new customer business.",
      reportsTo: "Youssef Ali, Business Development Manager",
      reportsToRole: "Business Development Manager",
      responsibilities: [
        "Prospect into target segments and open new customer conversations",
        "Qualify opportunities and progress promising ones through the early pipeline",
        "Prepare for and lead discovery conversations",
        "Support proposal development with her manager",
        "Keep CRM pipeline records accurate and current"
      ],
      contribution: "A steady flow of opportunities that can realistically become NextWave business."
    },
    _hidden: {
      devAreas: ["Opportunity Qualification", "Prioritization"],
      challenge: "Help Salma shift from measuring success through activity toward judging the quality and value of opportunities.",
      biases: ["Recency Bias", "Comparison Bias", "Halo/Horns Effect"],
      tension: "High activity does not always mean high performance, but developing employees need opportunities to learn through experience."
    }
  }
};

const CONSIDERATIONS = [
  { id: "current", label: "Current Performance" },
  { id: "development", label: "Development Need" },
  { id: "potential", label: "Future Potential" },
  { id: "value", label: "Business Value Now" }
];

/* ---------- THE YEAR BEGINS ---------- */
const COMMERCIAL_PRIORITY_OPTIONS = [
  { id: "p1", text: "Win new customers in target segments", links: ["GROW"] },
  { id: "p2", text: "Build a pipeline of opportunities that can realistically convert", links: ["GROW"] },
  { id: "p3", text: "Make only customer commitments NextWave can deliver well", links: ["RETAIN", "SCALE"] },
  { id: "p4", text: "Use market insight to decide where to compete against Valtora", links: ["GROW"] },
  { id: "p5", text: "Build commercial capability and reduce dependency on individuals", links: ["BUILD"] },
  { id: "p6", text: "Maximise prospecting activity across all segments", links: ["GROW"], _trap: true },
  { id: "p7", text: "Match Valtora on price to protect win rates", links: ["GROW"], _trap: true },
  { id: "p8", text: "Own the company's on-time delivery improvement", links: ["SCALE"], _trap: true }
];

const EVIDENCE_SOURCES = ["CRM pipeline report", "Revenue reports", "Proposal trackers", "Stakeholder feedback", "Customer feedback", "Manager observation", "1:1 & coaching notes", "Other"];
const FREQUENCIES = ["Weekly", "Monthly", "Quarterly", "Half-yearly", "Annually"];
const ROLE_VIEW = {
  omar: [
    { label: "report delivery and accuracy", cats: ["insight", "activity"] },
    { label: "whether stakeholders act on his insight", cats: ["influence"] }
  ],
  youssef: [
    { label: "new-business results", cats: ["revenue", "quality"] },
    { label: "soundness of customer commitments", cats: ["delivery"] },
    { label: "how he leads Salma", cats: ["people"] }
  ],
  salma: [
    { label: "prospecting activity", cats: ["activity"] },
    { label: "opportunity quality", cats: ["quality"] },
    { label: "conversion into business", cats: ["revenue"] }
  ]
};
EMP_ORDER.push("mariam");

EMPLOYEES.mariam = {
  id: "mariam", first: "Mariam", name: "Mariam Adel", title: "Proposal Designer",
  tenure: "4 years at NextWave Digital", total: "6 years total design experience",
  prevRating: "Met Expectations", prevScore: 3,
  prevPerformance: "Mariam produced professional customer-facing proposals and supported most of the year's largest opportunities with strong visual communication. Customers regularly praised her work. During peak periods, several proposals were delivered later than agreed, and stakeholder feedback on her drafts sometimes varied significantly.",
  story: "Mariam is the person everyone sends proposals to. Her work is polished and customers notice it. She rarely says no: she accepts requests the day they arrive and absorbs late changes from stakeholders who each have their own view of what good looks like. As requests grow, she works longer hours and some of her commitments slip.",
  strengths: ["Strong visual communication", "Professional proposal quality", "Customer-oriented design thinking", "Collaborative and generous with her time"],
  voice: "If a deal needs a proposal, I'll find the time.",
  role: {
    purpose: "Turn Commercial thinking into clear, professional and persuasive customer-facing proposals, delivered on the date agreed.",
    reportsTo: "You (Commercial leadership)",
    reportsToRole: "Commercial Director",
    responsibilities: [
      "Develop customer-facing proposals and commercial materials",
      "Translate complex product and pricing information into clear communication",
      "Coordinate input from Sales, Business Development and product stakeholders",
      "Agree delivery dates with the deal owner and meet them",
      "Maintain professional quality and consistency across all proposals"
    ],
    contribution: "Clear, persuasive proposals for the deals that matter most, delivered when the deal needs them."
  },
  _hidden: {
    devAreas: ["Prioritization & Time Management", "Setting Boundaries", "Stakeholder Alignment"],
    challenge: "Help Mariam move from saying yes to everything toward prioritising the work that matters most and agreeing direction early, without losing the quality customers value.",
    biases: ["Halo Effect", "Recency Bias", "Similarity / Affinity"],
    tension: "Being indispensable is not the same as being effective."
  }
};

/* ---------- Groups ---------- */
const GROUPS = [
  { n: 1, emp: "omar" },
  { n: 2, emp: "youssef" },
  { n: 3, emp: "salma" },
  { n: 4, emp: "mariam" }
];
ROLE_VIEW.mariam = [
  { label: "proposal output", cats: ["activity"] },
  { label: "on-time delivery", cats: ["delivery"] },
  { label: "proposal quality as customers see it", cats: ["quality", "influence"] }
];