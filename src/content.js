/* =========================================================
   SCORE PERFORMANCE HUB — GENERAL CONTENT CONFIGURATION
   (Scenario content for the Omar pilot: src/pilot.js; confidential content: api/_lib/)
   ========================================================= */
const APP = {
  name: "SCORE Performance Hub",
  company: "NextWave",
  cycleYear: 2027,
  cycleLabel: "January – December 2027",
  storeKey: "score-pilot-omar-v1",
  legacyKeys: ["score-hub-nextwave-v1", "score-oneday-nextwave-v3"]
};
const SIM_DATES = {
  start: "Mon 4 Jan 2027", deadline: "Mon 11 Jan 2027", submitted: "Fri 8 Jan 2027", approved: "Mon 11 Jan 2027",
  alert: "Mon 5 Jul 2027", midyear: "Wed 7 Jul 2027", yearend: "Wed 1 Dec 2027", closed: "Fri 9 Jul 2027"
};
/* NextWave company website shown in the collapsible section at the bottom of each page.
   Leave url empty until the approved address is provided; never invent one. */
const NEXTWAVE_WEBSITE = { url: "" };
/* Codes the facilitator announces in the room; participants enter them on the "Wait for the facilitator message" card.
   (A local gate on each device; visible in the page source.) */
const RELEASE_CODES = { r2: "4826" };   /* the year-end round (former code 7319) was removed */

/* Form vocabularies (EVIDENCE_SOURCES and FREQUENCIES come from employees.js) */
const PERIODS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Q1", "Q2", "Q3", "Q4", "H1 (Jan–Jun)", "H2 (Jul–Dec)", "Full year"];
const EVIDENCE_STATUS = ["Open", "Ongoing", "Completed"];
/* Competency rating scale of the NextWave Performance Appraisal Form (3 = Meets Expectations = 100%) */
const RATING_SCALE = [
  { v: 4, l: "Exceptional", d: "Skillfully demonstrates the competency and acts as a role model or reference." },
  { v: 3, l: "Meets Expectations", d: "Demonstrates and performs the required competency independently." },
  { v: 2, l: "Needs Improvement", d: "Partially demonstrates the required competency and requires constant supervision." },
  { v: 1, l: "Unsatisfactory", d: "Performance is significantly below the criteria required for successful job performance." }
];
const LEVELS = [{ id: "basic", l: "Basic" }, { id: "intermediate", l: "Intermediate" }, { id: "advanced", l: "Advanced" }];
const OBJ_RANGE = { min: 3, max: 5, hardMax: 8 };
const COMP_RANGE = { min: 3, max: 5 };
const CHAT_LIMITS = { message: 1500, diagnosticMin: 3 };
const BIAS_LABEL = { recency: "Recency bias", halo: "Halo effect", horn: "Horn effect", confirmation: "Confirmation bias", leniency: "Leniency bias", severity: "Severity bias", anchoring: "Previous-rating anchoring" };

/* ---------- HR messages (system text) ---------- */
const HR_SENDER = { name: "NextWave HR", addr: "hr@nextwave.example" };
function hrMessages() {
  return {
    start: { subject: "Annual Performance Goal Setting — Action Required", date: SIM_DATES.start,
      body: ["Dear Commercial Director,", `The ${APP.cycleYear} performance cycle (${APP.cycleLabel}) has started. Please complete the performance goal plan for Omar Hassan, Market Intelligence Analyst.`, "__LIST__", `Deadline: ${SIM_DATES.deadline}.`, "NextWave HR"],
      list: ["Review Omar's role, previous-year evidence and job description (printed handouts).", "Complete the Objectives of the Year form: SMART objectives, each with a measurement, due date and weight (total 100%).", "Select role-relevant competencies, expected proficiency levels and behavioral standards.", "Discuss and acknowledge the performance standards and expectations with Omar."],
      action: { l: "Open Performance Goal Plan", go: "goals" } },
    approved: { subject: "Performance Contract Confirmed — Monitoring Begins", date: SIM_DATES.approved,
      body: ["Dear Commercial Director,", "Omar Hassan's performance expectations have been established and the performance contract is confirmed.", "Throughout the year, you are responsible for:", "__LIST__", "The next formal checkpoint will take place in six months. Please maintain your performance records throughout the year.", "NextWave HR"],
      list: ["Tracking progress.", "Documenting evidence.", "Monitoring performance gaps.", "Maintaining regular employee communication.", "Taking appropriate management action."],
      action: { l: "Open Evidence Log", go: "evidence" } },
    /* Closing email: delivered once, when the participant submits the mid-year review (the year-end round was removed) */
    closed: { subject: `Performance Cycle ${APP.cycleYear} — Thank You`, date: SIM_DATES.closed, closing: true,
      body: ["Dear Commercial Director,",
        `Thank you for leading Omar Hassan's ${APP.cycleYear} performance journey, from agreeing his performance expectations to reviewing his progress and coaching him through a changing business environment.`,
        "Your commitment to setting clear expectations, monitoring progress, providing feedback, and making evidence-based decisions helps build a culture where employees understand what is expected and have the support they need to perform and grow.",
        "As you continue through the year, remember that **performance management does not end with a single review or appraisal.** It is an ongoing process of setting direction, checking progress, coaching performance, reviewing results, and supporting continuous development.",
        "Thank you for your leadership and commitment to building a high-performance culture at NextWave.",
        "Best regards,\n**NextWave Human Resources**"] }
  };
}
