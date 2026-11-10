/* =========================================================
   SCRIPTED TEST PROVIDER — FOR AUTOMATED TESTS ONLY
   Enabled only when the server runs with SCORE_AI_PROVIDER=mock.
   It is NOT artificial intelligence: simple keyword rules that let the
   test suite exercise every workflow without an AI key. The app shows a
   "Test mode — scripted responses, not live AI" banner while it is active.
   ========================================================= */
const SC = require("./scenario_omar");
const RB = require("./rubrics");

const lc = (s) => String(s || "").toLowerCase();
const has = (s, rx) => rx.test(lc(s));
const lowScore = (a) => a && a.overall && a.overall.score != null && a.overall.score < 60; /* the form's "Unacceptable" band */
const BLAME = /(your fault|unacceptable|careless|you should have known|no excuse|stop challenging|you always|lazy|you failed)/;
const DISMISS = /(don't worry|do not worry|just accept|that's how it is|not up for discussion|no need to|just sign|stop worrying)/;
const ADDRESS_A = /(quality|relevan|useful|actionab|evidence-based|how well)/, ADDRESS_B = /(adopt|control|decision|not only|regardless|even if|whether management)/;

function firstSentence(text, rx) {
  const parts = String(text || "").split(/(?<=[.!?\n])\s+/);
  const hit = parts.find(p => rx.test(lc(p)));
  return hit ? hit.trim().slice(0, 160) : null;
}

/* ---------- conversations ---------- */
function converse(kind, history, ctx) {
  const mgr = history.filter(m => m.from === "manager").map(m => m.text);
  const last = mgr[mgr.length - 1] || "", all = mgr.join("\n");
  if (kind === "alignment") {
    const ready = has(all, ADDRESS_A) && has(all, ADDRESS_B);
    if (!ready && /(what('s| is) (the|your) concern|tell me more|what concern|go ahead|what's on your mind)/.test(lc(last))) return { reply: "Last year some of my recommendations weren't adopted, even though the analysis was solid. I don't want my rating to depend on whether management agrees with me.", ready: false, dismissive: false };
    const dismissive = !ready && has(last, DISMISS);
    const reply = ready ? "That's clear, thank you. Judged on quality, relevance and actionability, I'm happy to confirm the plan."
      : dismissive ? "This matters to me. How will my recommendations be evaluated if management doesn't follow them?"
      : "Thanks. But if my analysis is strong and management doesn't follow it, would that affect my rating?";
    return { reply, ready, dismissive };
  }
  if (kind === "diagnostic") {
    if (has(last, BLAME)) return { reply: "That's not a fair summary. The analysis passed review. What do you need from me?" };
    const rules = [
      [/(late|deadline|report|what happened|walk me through)/, "I spent two extra working days validating Valtora's pricing, so the June report slipped."],
      [/(flag|escalat|tell me|let me know|raise|warn)/, "No. I assumed I could manage both. I should have told you and asked which came first."],
      [/(nadine|meeting|present)/, "The analysis held up, but I defended the numbers instead of asking what Operations could implement."],
      [/(priorit|expect|clear|clarif)/, "I knew the deadline, but after Valtora nobody said which came first."],
      [/(skill|good at|develop|strength|hard for you)/, "The analysis is my strength. I could improve at presenting to non-analysts and influencing without debating."],
      [/(feel|recogni|fair|motivat|credit)/, "It feels like recommendations that challenge leadership get less recognition. That's my view."],
      [/(tool|resource|support|data|help)/, "I had the tools. The problem was competing deadlines I can't reprioritise alone."],
      [/(plan|next step|agree|going forward|what could|what would)/, "I could send Operations a one-page options summary, flag deadline conflicts early, and join a session with Sales."]
    ];
    const hit = rules.find(([rx]) => rx.test(lc(last)));
    return { reply: hit ? hit[1] : "It's been a lot to juggle. Where would you like to start?" };
  }
  return appraisalTurn(history, ctx);
}

/* ---------- year-end appraisal discussion (scripted keyword rules) ---------- */
const AP = {
  label: /\b(you are|you're|you were|you've been)\s+(so |too |very |quite |really )?(defensive|difficult|arrogant|stubborn|lazy|negative|rigid|hard to work with)|attitude problem|bad attitude/,
  vague: /(improve your attitude|communicate better|need to improve|do better|be better|work on yourself|step up)/,
  blame: /(sales (decline|drop|fell|went down|results)|revenue (drop|decline|fell)|lost (deals|customers)|your fault|because of you|you caused|recommendations? (were|was)n'?t? (adopted|used)|not adopted)/,
  situation: /(valtora|nadine|meeting|june|august|october|monthly report|reports? (was|were) late|stakeholder feedback|3\.25|consultation|contract-length|12-month|second half)/,
  behavior: /\byou (spent|focused|defended|explained|submitted|sent|delivered|identified|found|presented|shared|did not|didn't|kept|raised|missed)|when (nadine|she|they|sales) asked/,
  impact: /(made it harder|which meant|as a result|that meant|affected|delayed|couldn't plan|helped (the business|us|sales|the team)|so (sales|the team|operations))/,
  intent: /(what were you|what was (going through|your|on your)|how did you see|what made it|what's your view|how do you see|what do you think|help me understand|what was behind)/,
  ack: /(that's fair|that is fair|valid|i understand|makes sense|good point|i hear you|that concern was)/,
  ignore: /(doesn't matter|does not matter|irrelevant|not the point|regardless|anyway,|let's move on)/,
  strength: /(strong|valuable|great|excellent|well done|appreciate|quality of your analysis|accurate|important finding)/,
  gap: /(late|deadline|escalat|stakeholder feedback|practical options|proposed action|consult|3\.25|follow-up actions)/,
  devAction: /(escalat|options|one-page|summary|consult|joint session|format|template|share an initial|early)/,
  devSupport: /\b(i will|i'll|i can|my support|coach|coaching|together|with you)\b/,
  devFollow: /(review|check-in|checkpoint|monthly|every (two|2) weeks|quarterly|follow up|follow-up)/,
  devAny: /(next year|going forward|improve|develop)/,
  wrap: /(that's all|let's wrap|we're done|we are done|sign off|let's close|that is all|nothing else|thanks, bye|good luck next year)/,
  jan: /(january|we agreed|the plan we)/, mid: /(mid-year|july|summer|coaching|check-ins?)/
};
function readAppraisalTalk(history) {
  const mgr = history.filter(m => m.from === "manager").map(m => lc(m.text)), all = mgr.join("\n");
  const any = (rx) => rx.test(all);
  const intentIdx = mgr.findIndex(t => AP.intent.test(t));
  const dev = mgr.some(t => AP.devAction.test(t) && AP.devSupport.test(t) && AP.devFollow.test(t)) ? "specific" : (any(AP.devAction) || any(AP.devAny)) ? "vague" : "none";
  const f = { situation: any(AP.situation), behavior: any(AP.behavior), impact: any(AP.impact), strength: any(AP.strength), gap: any(AP.gap),
    intentAsked: intentIdx >= 0, intentHeard: intentIdx >= 0 && mgr.slice(intentIdx + 1).some(t => AP.ack.test(t)), ignored: any(AP.ignore),
    label: any(AP.label), blame: any(AP.blame), dev, all, mgr };
  f.complete = f.situation && f.behavior && f.strength && f.gap && f.intentAsked && dev === "specific" && !f.label && !f.blame;
  return f;
}
function appraisalTurn(history, ctx) {
  const a = ctx.appraisal, f = readAppraisalTalk(history), last = f.mgr[f.mgr.length - 1] || "", logs = ctx.priorLogs || {};
  const said = (log, rx) => (log || []).some(m => m.from === "manager" && rx.test(lc(m.text)));
  const r = (reply) => ({ reply, complete: f.complete });
  if (AP.label.test(last)) return r("That feels like a judgement about me rather than something I did. What specifically do you mean?");
  if (AP.blame.test(last)) return r("Sales results depend on much more than my reports, and adoption wasn't my decision. I'm accountable for the analysis and how I shared it. Which part do you mean?");
  if (lowScore(a) && /(rating|score|result|appraisal)/.test(last) && f.mgr.length <= 2) return r("I'm not sure I understand that result. Could you explain which results led to it?");
  if (AP.ignore.test(last)) return r("I'd still like you to consider what I said about the pricing risk.");
  if (f.complete && (AP.wrap.test(last) || AP.devFollow.test(last))) return r("Thanks for going through this with me. I'll work on raising deadline conflicts earlier and bringing practical options, and I appreciate that the analysis was recognised.");
  if (AP.wrap.test(last)) return r("Before we finish, I'm not sure what we've agreed for next year.");
  if (AP.jan.test(last)) return r(said(logs.alignment, /(quality|actionab|relevan)/) ? "Yes, we agreed my recommendations would be judged on their quality, not on whether they were adopted." : "I remember we discussed the plan in January, but I don't recall agreeing anything specific about that.");
  if (AP.mid.test(last)) return r(said(logs.diagnostic, /(coach|check-in|weekly|session|follow)/) ? "We talked about support in July, but I don't think much happened after the summer." : "I don't remember us agreeing any follow-up in July.");
  if (AP.intent.test(last)) return r("I was worried we'd make a rushed pricing decision. I wanted everyone to see the risks first.");
  if (AP.devAction.test(last) && AP.devSupport.test(last) && AP.devFollow.test(last)) return r("That works for me. Let's look at it again at the first check-in.");
  if (AP.vague.test(last) && !AP.situation.test(last) && !/(next year|going forward|from now on)/.test(last)) return r("Could you give me an example of what you mean?");
  if (AP.devAction.test(last) || (AP.devAny.test(last) && !AP.situation.test(last))) return r("What would that look like in practice, and how would we know it's working?");
  if (AP.situation.test(last) && AP.behavior.test(last)) return r("I was making sure the analysis held up. But I can see I could have brought practical options as well.");
  if (AP.strength.test(last) && !AP.gap.test(last)) return r("Thank you, I appreciate that. Is there anything I should still work on?");
  if (/(how would you|what would you do|differently|next time)/.test(last)) return r("I could bring two or three options instead of only the analysis, and flag deadline clashes earlier.");
  return r("Okay. Where would you like to start?");
}
function sbiiMock(inp) {
  const f = readAppraisalTalk(inp.history), first = (rx) => firstSentence(inp.history.filter(m => m.from === "manager").map(m => m.text).join("\n"), rx);
  const harsh = f.label || f.blame;
  const c = (id, score, rx, reason) => ({ id, score, evidence: score && rx ? [first(rx)].filter(Boolean) : [], reason: `[Scripted test assessment] ${reason}` });
  return {
    criteria: [
      c("situation", f.situation ? 2 : /(this year|sometimes|generally|in general)/.test(f.all) ? 1 : 0, AP.situation, "Situation."),
      c("behavior", f.label ? 0 : f.behavior ? 2 : f.gap ? 1 : 0, AP.behavior, "Behaviour."),
      c("impact", f.blame ? 0 : f.impact ? 2 : f.gap ? 1 : 0, AP.impact, "Impact."),
      c("intent", f.intentAsked && f.intentHeard && !f.ignored ? 2 : f.intentAsked ? 1 : 0, AP.intent, "Intent."),
      c("fairness", harsh ? 0 : f.strength && f.gap ? 2 : 1, AP.strength, "Fairness."),
      c("development", f.dev === "specific" ? 2 : f.dev === "vague" ? 1 : 0, AP.devFollow, "Development.")
    ],
    classification: { personality_labels: f.label, unsupported_blame: f.blame, praise_only: f.strength && !f.gap, ignored_explanation: f.ignored },
    feedback: { summary: "[Scripted test assessment]", strengths: "", improve: "" }
  };
}

/* ---------- assessments ---------- */
function crit(id, score, evidence, reason) {
  const d = RB.ALL.find(c => c.id === id);
  return { id, score: Math.min(d.max, Math.max(0, score)), evidence: evidence ? [evidence] : [], reason: `[Scripted test assessment] ${reason}`, confidence: "low", missing: "" };
}
function assess(task, inp) {
  if (task === "sbii") return sbiiMock(inp);
  if (task === "plan") {
    const o = inp.plan.objectives, cs = inp.plan.comps;
    const measurable = o.filter(x => /\d/.test(x.measure)).length / Math.max(1, o.length);
    const wsum = o.reduce((s, x) => s + (x.weight || 0), 0);
    const adoption = o.find(x => /(adopt|accepted by management|approved by management)/i.test(x.measure));
    const ev = o[0] ? (o[0].objective || o[0].measure).slice(0, 60) : null;
    const ref = ["Analytical Thinking", "Business Acumen", "Communication", "Stakeholder Management"];
    const relevant = cs.filter(c => ref.includes(c.name)).length, allAdv = cs.length && cs.every(c => /advanced/i.test(c.level));
    const k = measurable >= 0.75 ? 1 : measurable >= 0.4 ? 0.6 : 0.2;
    return {
      criteria: [
        crit("r1_kpi_relevance", Math.round(3 * k), ev, "Relevance estimated from measurement completeness."),
        crit("r1_kpi_clarity", Math.round(2 * k), ev, "Clarity estimated."),
        crit("r1_kpi_measurable", Math.round(4 * measurable), ev, `${Math.round(measurable * 100)}% of measurements contain a figure.`),
        crit("r1_kpi_target", Math.round(3 * k), ev, "Targets estimated."),
        crit("r1_kpi_control", adoption ? 1 : 3, adoption ? adoption.measure.slice(0, 60) : ev, adoption ? "A measurement depends on management adoption decisions." : "Objectives are within Omar's influence."),
        crit("r1_kpi_priorities", Math.round(2 * k), null, "Alignment with commercial priorities estimated."),
        crit("r1_kpi_balance", wsum === 100 ? Math.round(3 * k) : 0, null, `Weights total ${wsum}%.`),
        crit("r1_comp_relevance", Math.min(3, relevant), null, `${relevant} reference-set competencies selected.`),
        crit("r1_comp_level", allAdv ? 1 : 3, null, allAdv ? "Advanced selected for every competency." : "Levels look appropriate."),
        crit("r1_comp_clarity", cs.every(c => c.standard.split(/\s+/).length >= 6) ? 2 : 1, null, "Standards checked."),
        crit("r1_comp_alignment", cs.some(c => /communication|stakeholder/i.test(c.name)) ? 2 : 0, null, "Development needs coverage.")
      ],
      feedback: { objectives: o.map((x, i) => ({ index: i + 1, verdict: /\d/.test(x.measure) ? "strong" : "needs_improvement", comment: /\d/.test(x.measure) ? "[Test] Measurable target included." : "[Test] Add a measurable target." })), competencies: cs.map(c => ({ name: c.name, comment: "[Test] Comment." })), overall: "[Scripted test assessment]" }
    };
  }
  if (task === "alignment") {
    const all = inp.history.filter(m => m.from === "manager").map(m => m.text).join("\n");
    const fair = has(all, ADDRESS_A) && has(all, ADDRESS_B), dis = has(all, DISMISS);
    const q = firstSentence(all, ADDRESS_A) || firstSentence(all, /./);
    return { criteria: [crit("r1_align_ack", /(understand|hear|fair|valid)/.test(lc(all)) ? 1 : 0, firstSentence(all, /(understand|hear|fair|valid)/), "Acknowledgement."), crit("r1_align_clarify", fair ? 2 : 0, q, "Evaluation basis."), crit("r1_align_realistic", dis ? 0 : 1, null, "Realism."), crit("r1_align_shared", fair ? 1 : 0, null, "Shared understanding.")],
      classification: { behaviour: dis && !fair ? "dismissive" : fair && !dis ? "fair" : "mixed" }, feedback: { summary: "[Scripted test assessment]" } };
  }
  if (task === "round2") {
    const all = inp.history.filter(m => m.from === "manager").map(m => m.text).join("\n");
    const blaming = has(all, BLAME);
    const causes = [["expectations", /(priorit|expect|clear|clarif)/], ["situational", /(time|deadline|tool|resource|workload|competing)/], ["consequences", /(recogni|fair|credit|feel)/], ["skills", /(skill|strength|develop|good at)/]].filter(([, rx]) => rx.test(lc(all))).map(([k]) => k);
    const coach = [/(priorit|escalat|flag)/, /(nadine|session|operations|sales)/, /(recogni|value|credit)/, /(follow-up|follow up|check-in|checkpoint|weekly|review)/, /(what could you|what would you|your ideas|how would you)/].filter(rx => rx.test(lc(all))).length;
    const d = blaming ? 2 : causes.length * 3, c = blaming ? 1 : coach * 3;
    const ev = (rx) => firstSentence(all, rx);
    const interp = inp.interpretation, log = inp.evidence;
    const judge = log.some(e => /(difficult|lazy|attitude|arrogant|does not accept)/i.test(e.text));
    return {
      criteria: [
        crit("r2_data_accuracy", /\d/.test(interp) ? 2 : 0, firstSentence(interp, /\d/), "Uses figures."), crit("r2_data_separate", /(market|valtora|not omar|business)/i.test(interp) ? 2 : 0, firstSentence(interp, /(market|valtora|business)/), "Separates outcomes."), crit("r2_data_caution", interp.length > 80 ? 1 : 0, null, "Caution."),
        crit("r2_diag_expect", causes.includes("expectations") && !blaming ? 3 : 0, ev(/(priorit|expect|clear)/), "Expectations."), crit("r2_diag_situ", causes.includes("situational") && !blaming ? 3 : 0, ev(/(time|deadline|tool|workload)/), "Constraints."),
        crit("r2_diag_conseq", causes.includes("consequences") && !blaming ? 3 : 0, ev(/(recogni|fair|feel)/), "Consequences."), crit("r2_diag_skills", causes.includes("skills") && !blaming ? 3 : 0, ev(/(skill|strength|develop)/), "Skills."), crit("r2_diag_conclude", blaming ? 0 : Math.min(3, causes.length), null, "Conclusions."),
        crit("r2_coach_involve", /(what could you|what would you|your ideas|how would you)/.test(lc(all)) ? 3 : 0, null, "Involvement."), crit("r2_coach_priorities", /(priorit|escalat|flag)/.test(lc(all)) && !blaming ? 3 : 0, null, "Priorities."),
        crit("r2_coach_comm", /(nadine|session|options|summary)/.test(lc(all)) && !blaming ? 3 : 0, null, "Communication coaching."), crit("r2_coach_support", /(recogni|value|support)/.test(lc(all)) && !blaming ? 3 : 0, null, "Support."), crit("r2_coach_followup", /(follow-up|follow up|check-in|checkpoint|weekly|review)/.test(lc(all)) ? 3 : 0, null, "Follow-up."),
        crit("r2_log_factual", log.length && !judge ? 2 : 0, log[0] ? log[0].text.slice(0, 50) : null, judge ? "Personality judgement in the log." : "Factual entries."), crit("r2_log_relevance", log.every(e => e.source) && log.length ? 1 : 0, null, "Sources."),
        crit("r2_log_balance", log.length >= 2 ? 1 : 0, null, "Balance."), crit("r2_log_followup", log.some(e => e.action) ? 1 : 0, null, "Follow-up.")
      ],
      classification: { blaming, constructive: !blaming && coach >= 3, sided_against_stakeholder: false, vague_reassurance: !blaming && coach === 0, causes_explored: blaming ? [] : causes },
      feedback: { summary: "[Scripted test assessment]", overlooked: "" }
    };
  }
  if (task === "bias") {
    const text = [inp.appraisal.overall.managerComments, ...inp.appraisal.what.map(w => w.comments), ...inp.appraisal.how.map(h => h.comments)].join("\n");
    const flags = [];
    const anchor = firstSentence(text, /(last year|previous rating|previous year)/); if (anchor) flags.push({ bias: "anchoring", evidence: anchor, explanation: "[Test] The reasoning refers to the previous rating." });
    const adopt = lowScore(inp.appraisal) && firstSentence(text, /(not adopted|weren't adopted|were not adopted|not implemented)/); if (adopt) flags.push({ bias: "severity", evidence: adopt, explanation: "[Test] The rating appears to penalise non-adoption." });
    return { flags, overlooked: [], overemphasized: [], summary: flags.length ? "[Scripted test assessment] Possible biases found." : "[Scripted test assessment] No bias indicated by your reasoning." };
  }
  /* round3 */
  const a = inp.appraisal, j = a.overall.managerComments, allJ = [j, ...a.what.map(w => w.comments), ...a.how.map(h => h.comments)].join("\n");
  const adopt = lowScore(a) && /(not adopted|weren't adopted|were not adopted|not implemented)/i.test(allJ), rich = allJ.length > 200;
  return {
    criteria: [
      crit("r3_what_grounded", rich ? 3 : 1, firstSentence(allJ, /\d/), "Grounding."), crit("r3_what_limits", /(limitation|not available|no data|missing)/i.test(allJ) ? 2 : 0, null, "Limitations."), crit("r3_what_balance", adopt ? 0 : 2, null, "Balance."), crit("r3_what_overall", 2, null, "Overall WHAT."),
      crit("r3_how_behaviour", rich ? 2 : 1, null, "Behaviour."), crit("r3_how_levels", 1, null, "Levels."), crit("r3_how_balance", adopt ? 0 : 1, null, "Balance."),
      crit("r3_overall_defensible", adopt ? 0 : 2, null, "Defensible."), crit("r3_overall_justify", rich ? 2 : 1, null, "Justification."), crit("r3_overall_specific", (a.pdp.ld || []).some(x => x.action.length > 20) ? 1 : 0, null, "Specific."),
      crit("r3_conv_bias", inp.reflection.length > 30 ? 1 : 0, null, "Reflection.")
    ],
    classification: { appraisal: adopt ? "unfair" : rich ? "fair" : "mixed" }, feedback: { summary: "[Scripted test assessment]" }
  };
}
module.exports = { converse, assess };
