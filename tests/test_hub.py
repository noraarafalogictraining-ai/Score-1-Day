"""End-to-end test of the SCORE Performance Hub (Python Playwright + Chromium).
Run `python3 build.py` first, then `python3 tests/test_hub.py [--shots]`.
--shots saves screenshots of every screen into tests/shots/ (git-ignored)."""
import json, os, pathlib, re, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
SHOTS = "--shots" in sys.argv
SHOT_DIR = ROOT / "tests" / "shots"
EXE = os.environ.get("CHROMIUM_PATH")
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))

def shot(pg, name, full=True):
    if SHOTS:
        SHOT_DIR.mkdir(exist_ok=True)
        pg.wait_for_timeout(150)
        pg.screenshot(path=str(SHOT_DIR / f"{name}.png"), full_page=full)

def state(pg):
    """Live app state (saving to localStorage is debounced by 200 ms)."""
    return pg.evaluate("typeof S === 'undefined' ? null : JSON.parse(JSON.stringify(S))")

def saved(pg):
    pg.wait_for_timeout(300)
    return json.loads(pg.evaluate("localStorage.getItem('score-hub-nextwave-v1')") or "null")

def act(pg, a, **data):
    sel = f'[data-act="{a}"]' + "".join(f'[data-{k}="{v}"]' for k, v in data.items())
    pg.locator(sel).first.click(); pg.wait_for_timeout(120)

def fill_bind(pg, suffix, value):
    loc = pg.locator(f'[data-bind$="{suffix}"]').first
    if loc.evaluate("e => e.tagName") == "SELECT": loc.select_option(value)
    else: loc.fill(str(value))
    pg.wait_for_timeout(60)

def add_objective(pg, i, obj, kpi, weight, evidence, freq, other=None):
    act(pg, "addObj")
    base = f".objectives.{i}."
    fill_bind(pg, base + "objective", obj); fill_bind(pg, base + "kpi", kpi); fill_bind(pg, base + "weight", weight)
    fill_bind(pg, base + "freq", freq); fill_bind(pg, base + "evidence", evidence)
    if other: fill_bind(pg, base + "evidenceOther", other)
    act(pg, "doneObj")

def run():
    with sync_playwright() as p:
        kw = {"executable_path": EXE, "args": ["--no-sandbox"]} if EXE else {}
        b = p.chromium.launch(**kw)
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())

        # ---- legacy data on this device (classic version) ----
        legacy = {"v": 1, "group": 4, "begins": {"contracts": {"mariam": {"measures": [
            {"measure": "Deliver proposals on the agreed date", "target": "85% on time", "weight": 60, "evidence": "Proposal trackers", "freq": "Monthly"},
            {"measure": "Customer feedback on proposals", "target": "4 of 5", "weight": 40, "evidence": "Customer feedback", "freq": "Quarterly"}]}}}}
        pg.goto(URL); pg.evaluate(f"localStorage.clear(); localStorage.setItem('score-oneday-nextwave-v3', {json.dumps(json.dumps(legacy))})"); pg.reload(); pg.wait_for_timeout(300)
        shot(pg, "01_login", False)
        check("Login screen shows", pg.locator("#signin-btn").count() == 1)
        check("Legacy import offered", pg.locator("#login-legacy").count() == 1)

        # ---- 1. login without real credentials ----
        pg.fill("#login-name", "Table 4"); pg.fill("#login-pass", "secret-password-123")
        pg.click("#signin-btn"); pg.wait_for_timeout(300)
        raw = pg.evaluate("JSON.stringify(localStorage)")
        check("Login works without credentials", saved(pg) and saved(pg)["session"]["name"] == "Table 4")
        raw = pg.evaluate("JSON.stringify(localStorage) + JSON.stringify(sessionStorage)")
        check("Password is never stored", "secret-password-123" not in raw)
        check("Legacy objectives imported as draft", state(pg)["emp"] == "mariam" and len(state(pg)["recs"]["mariam"]["goals"]["objectives"]) == 2)
        check("Legacy data left untouched", pg.evaluate("localStorage.getItem('score-oneday-nextwave-v3')") is not None)
        check("First screen is the HR goal-setting email", "Annual Performance Goal Setting" in pg.inner_text("main"))
        shot(pg, "02_hr_email")

        # ---- 2. employee selection: all four ----
        for e in ["omar", "youssef", "salma", "mariam"]:
            act(pg, "pick", emp=e)
            check(f"Employee selectable: {e}", state(pg)["emp"] == e)
        act(pg, "pick", emp="omar")
        pg.goto(URL + "#home"); pg.wait_for_timeout(200)
        shot(pg, "03_dashboard")
        check("Dashboard shows stage tiles", pg.locator(".tile").count() == 4)

        # ---- 3. objectives: create, edit, delete, undo ----
        pg.goto(URL + "#goals"); pg.wait_for_timeout(200)
        add_objective(pg, 0, "Deliver market intelligence leadership acts on", "At least 3 of 4 major recommendations decided in the review where presented", 40, "Stakeholder feedback", "Quarterly")
        add_objective(pg, 1, "Scheduled competitor reports", "All scheduled reports delivered on time", 30, "Other", "Monthly", other="Report calendar")
        add_objective(pg, 2, "Win/loss analysis", "Quarterly win/loss review completed", 20, "CRM pipeline report", "Quarterly")
        check("Objectives created", len(state(pg)["recs"]["omar"]["goals"]["objectives"]) == 3)
        check("Goal plan status Draft", state(pg)["recs"]["omar"]["goals"]["status"] == "draft")
        shot(pg, "04_goals_objectives")
        # weights 90% → submission blocked
        pg.goto(URL + "#goals/submit"); pg.wait_for_timeout(150); act(pg, "submitGoals")
        check("Weights ≠ 100% blocks submission", state(pg)["recs"]["omar"]["goals"]["status"] == "draft" and "must total 100%" in pg.inner_text("main"))
        # edit objective 3 weight to 30
        pg.goto(URL + "#goals"); pg.wait_for_timeout(150)
        pg.locator('[data-act="editObj"]').nth(2).click(); pg.wait_for_timeout(100)
        fill_bind(pg, ".objectives.2.weight", 30); act(pg, "doneObj")
        check("Objective edited", state(pg)["recs"]["omar"]["goals"]["objectives"][2]["weight"] == 30)
        # delete + undo, then delete for real an extra one
        add_objective(pg, 3, "Temporary", "Temp", 5, "Revenue reports", "Monthly")
        pg.locator('[data-act="delObj"]').nth(3).click(); pg.wait_for_timeout(120)
        check("Objective deleted", len(state(pg)["recs"]["omar"]["goals"]["objectives"]) == 3)
        act(pg, "undo")
        check("Delete can be undone", len(state(pg)["recs"]["omar"]["goals"]["objectives"]) == 4)
        pg.locator('[data-act="delObj"]').nth(3).click(); pg.wait_for_timeout(120)
        check("Weights validate at 100%", "Weights total 100%" in pg.inner_text("main"))

        # ---- 4. competencies with proficiency levels ----
        pg.goto(URL + "#goals/competencies"); pg.wait_for_timeout(150)
        check("Competency placeholders labelled", "Pending content approval" in pg.inner_text("main"))
        for cid in ["core1", "core2", "core5"]:
            act(pg, "compAdd", id=cid)
        pg.goto(URL + "#goals/submit"); pg.wait_for_timeout(150); act(pg, "submitGoals")
        check("Missing proficiency level blocks submission", state(pg)["recs"]["omar"]["goals"]["status"] == "draft")
        pg.goto(URL + "#goals/competencies"); pg.wait_for_timeout(150)
        for i, lv in enumerate(["advanced", "intermediate", "intermediate"]):
            act(pg, "compLevel", i=i, v=lv)
        act(pg, "libOpen", id="core1")
        fill_bind(pg, ".comps.0.standard", "Opens each briefing with the decision needed and one recommendation.")
        comps = state(pg)["recs"]["omar"]["goals"]["comps"]
        check("Competencies saved with levels", len(comps) == 3 and comps[0]["level"] == "advanced" and comps[0]["standard"].startswith("Opens"))
        shot(pg, "05_goals_competencies")

        # ---- 5. persistence across refresh ----
        check("Saved to browser storage", len(saved(pg)["recs"]["omar"]["goals"]["comps"]) == 3)
        pg.reload(); pg.wait_for_timeout(300)
        check("Progress persists after refresh (still signed in)", pg.locator("#signin-btn").count() == 0 and len(state(pg)["recs"]["omar"]["goals"]["comps"]) == 3)

        # ---- 6. submission → alignment, cannot approve early ----
        pg.goto(URL + "#goals/submit"); pg.wait_for_timeout(150)
        shot(pg, "06_goals_submit")
        act(pg, "submitGoals")
        st = state(pg)["recs"]["omar"]["goals"]["status"]
        check("Submission sets Pending Employee Alignment", st == "pending_alignment")
        check("Employee pop-up opens", pg.locator(".modal").count() == 1)
        check("Alignment dialogue is labelled placeholder", "Pending content approval" in pg.inner_text(".modal"))
        check("Contract not approvable before alignment", pg.locator("#align-confirm").count() == 0)
        shot(pg, "07_alignment_popup", False)
        act(pg, "closeModal")
        pg.goto(URL + "#evidence"); pg.wait_for_timeout(150)
        check("Evidence Log locked before approval", "Available once the performance contract is approved" in pg.inner_text("main"))
        # revise path
        pg.goto(URL + "#conversations/alignment"); pg.wait_for_timeout(150)
        act(pg, "alignOpt", i=0)   # ask what concerns them
        act(pg, "alignOpt", i=1)   # revise the plan
        check("Manager can return plan for revision", state(pg)["recs"]["omar"]["goals"]["status"] == "draft")
        pg.goto(URL + "#goals"); pg.wait_for_timeout(150)
        pg.locator('[data-act="editObj"]').first.click(); pg.wait_for_timeout(100)
        fill_bind(pg, ".objectives.0.kpi", "At least 3 of 4 major recommendations decided in the review where they are presented, per half")
        act(pg, "doneObj")
        pg.goto(URL + "#goals/submit"); pg.wait_for_timeout(150); act(pg, "submitGoals")
        check("Resubmission returns to alignment", state(pg)["recs"]["omar"]["goals"]["status"] == "pending_alignment")
        act(pg, "alignOpt", i=0)  # confirm revised goals → agreed
        check("Confirm button only after agreement", pg.locator("#align-confirm").count() == 1)
        pg.click("#align-confirm"); pg.wait_for_timeout(200)
        check("Contract approved after alignment", state(pg)["recs"]["omar"]["goals"]["status"] == "approved")
        check("HR 'Contract Confirmed' email shown", "Performance Contract Confirmed" in pg.inner_text("main") and "six months" in pg.inner_text("main"))
        shot(pg, "08_hr_approved")

        # ---- 7. Evidence Log CRUD + filter ----
        pg.goto(URL + "#evidence"); pg.wait_for_timeout(150)
        objs = state(pg)["recs"]["omar"]["goals"]["objectives"]
        def add_ev(period, link, text, source, impact="", action="", status="Open"):
            pg.click("#ev-add"); pg.wait_for_timeout(100)
            pg.fill("#ev-period", period); pg.select_option("#ev-link", link); pg.fill("#ev-text", text)
            pg.select_option("#ev-source", source); pg.wait_for_timeout(80)
            pg.fill("#ev-impact", impact); pg.fill("#ev-action", action); pg.select_option("#ev-status", status)
            pg.click("#ev-save"); pg.wait_for_timeout(120)
        pg.click("#ev-add"); pg.wait_for_timeout(100); pg.click("#ev-save"); pg.wait_for_timeout(100)
        check("Evidence entry requires fields", pg.locator(".modal .notice.risk").count() == 1)
        act(pg, "closeModal")
        add_ev("Q1", objs[0]["id"], "2 of 4 recommendations decided in the review where presented.", "Stakeholder feedback", "Decisions delayed", "Discussed briefing structure", "Ongoing")
        add_ev("H2 (Jul–Dec)", objs[1]["id"], "All monthly competitor reports delivered on time.", "Manager observation", "", "", "Completed")
        add_ev("Q3", "core1", "Opened the Q3 briefing with the decision needed.", "Manager observation")
        add_ev("May", objs[2]["id"], "Win/loss review completed for Q1.", "CRM pipeline report")
        check("Evidence entries added", len(state(pg)["recs"]["omar"]["evidence"]) == 4)
        pg.locator('[data-act="evEdit"]').first.click(); pg.wait_for_timeout(100)
        pg.fill("#ev-text", "2 of 4 major recommendations decided in the review where they were presented."); pg.click("#ev-save"); pg.wait_for_timeout(100)
        check("Evidence entry edited", state(pg)["recs"]["omar"]["evidence"][0]["text"].startswith("2 of 4 major"))
        pg.select_option("#ev-filter", objs[0]["id"]); pg.wait_for_timeout(120)
        check("Filter by KPI works", pg.locator("tbody tr").count() == 1)
        pg.select_option("#ev-filter", "all"); pg.wait_for_timeout(120)
        add_ev("June", "general", "Temporary entry", "Other")  # Other needs a name
        check("Other source must be named", pg.locator(".modal").count() == 1)
        pg.fill("#ev-sourceOther", "Team meeting"); pg.click("#ev-save"); pg.wait_for_timeout(100)
        pg.locator('[data-act="evDel"]').last.click(); pg.wait_for_timeout(100)
        check("Evidence entry deleted", len(state(pg)["recs"]["omar"]["evidence"]) == 4)
        shot(pg, "09_evidence_log")

        # ---- 8. mid-year: facilitator-controlled ----
        pg.goto(URL + "#conversations/midyear"); pg.wait_for_timeout(150)
        check("Mid-year locked until released", pg.locator("#code-midyear").count() == 1)
        pg.fill("#code-midyear", "1111"); act(pg, "releaseCode", k="midyear")
        check("Wrong release code rejected", "not correct" in pg.inner_text("main"))
        pg.fill("#code-midyear", "4826"); act(pg, "releaseCode", k="midyear")
        check("Mid-year released", state(pg)["released"]["midyear"] is True)
        check("Mid-year notification appears", "Mid-Year Performance Check-In Required" in pg.inner_text("main"))
        pg.click("#mid-start"); pg.wait_for_timeout(100)
        check("Close disabled before 2 questions", pg.locator("#mid-close").is_disabled())
        act(pg, "midAsk", q="barriers"); act(pg, "midAsk", q="what"); act(pg, "midAsk", q="support")
        check("Questions in any order, answers shown", len(state(pg)["recs"]["omar"]["midyear"]["asked"]) == 3 and "Pending content approval" in pg.inner_text(".chat-log"))
        fill_bind(pg, "midyear.note", "Capacity and stakeholder timing look like the main barriers.")
        shot(pg, "10_midyear_chat")
        pg.click("#mid-close"); pg.wait_for_timeout(120)
        check("Mid-year check-in closes", state(pg)["recs"]["omar"]["midyear"]["closed"] is True)

        # ---- 9. year-end: facilitator release via facilitator view ----
        pg.goto(URL + "#appraisal"); pg.wait_for_timeout(150)
        check("Appraisal locked until released", pg.locator("#code-yearend").count() == 1)
        pg.goto(URL + "#facilitator"); pg.wait_for_timeout(150)
        pg.fill("#fac-code", "5050"); act(pg, "facUnlock")
        act(pg, "release", k="yearend")
        check("Facilitator releases year-end", state(pg)["released"]["yearend"] is True)
        shot(pg, "11_facilitator")
        pg.goto(URL + "#appraisal"); pg.wait_for_timeout(200)
        main = pg.inner_text("main")
        o = state(pg)["recs"]["omar"]["goals"]["objectives"]
        check("Round 1 objectives appear in appraisal", all(x["objective"] in main for x in o) and all(x["kpi"] in main for x in o))
        check("Round 1 competencies appear in appraisal", "Communication" in main and "Expected: Advanced" in main and "Opens each briefing" in main)
        act(pg, "submitAppraisal")
        check("Incomplete appraisal blocked", state(pg)["recs"]["omar"]["appraisal"]["status"] == "draft")
        for x in o:
            fill_bind(pg, f"what.{x['id']}.actual", "Result recorded in the Evidence Log.")
            act(pg, "rate", path=f"recs.omar.appraisal.what.{x['id']}.rating", v=3)
            fill_bind(pg, f"what.{x['id']}.just", "Supported by the documented entries.")
        for c in state(pg)["recs"]["omar"]["goals"]["comps"]:
            fill_bind(pg, f"how.{c['id']}.observed", "Observed in briefings during the year.")
            act(pg, "rate", path=f"recs.omar.appraisal.how.{c['id']}.rating", v=3)
            fill_bind(pg, f"how.{c['id']}.just", "Matches the expected level most of the time.")
        for k in ["what", "how", "final"]:
            act(pg, "rate", path=f"recs.omar.appraisal.overall.{k}", v=3)
        fill_bind(pg, "overall.just", "Met the agreed expectations across the year.")
        fill_bind(pg, "overall.strengths", "Analytical quality.")
        fill_bind(pg, "overall.dev", "Influencing stakeholders.")
        saved(pg); pg.reload(); pg.wait_for_timeout(300)
        a = state(pg)["recs"]["omar"]["appraisal"]
        check("Appraisal ratings and justifications saved", a["overall"]["final"] == 3 and a["overall"]["dev"] == "Influencing stakeholders." and len(a["what"]) == 3)
        shot(pg, "12_appraisal")
        act(pg, "submitAppraisal"); pg.wait_for_timeout(150)
        check("Appraisal submitted", state(pg)["recs"]["omar"]["appraisal"]["status"] == "submitted")
        check("Employee reaction pop-up opens", pg.locator(".modal").count() == 1)
        shot(pg, "13_reaction_popup", False)

        # ---- 10. bias reflection ----
        act(pg, "reactOpt", id="review")
        pg.locator('.modal input[value="recency"]').check(); pg.wait_for_timeout(80)
        act(pg, "reflDecision", v="revise")
        pg.click("#refl-save"); pg.wait_for_timeout(120)
        check("Reflection needs a justification", state(pg)["recs"]["omar"]["reflection"]["done"] is False and pg.locator(".modal .ta.err").count() == 1)
        fill_bind(pg, "reflection.just", "The Q1 entries were underweighted; adjusting the WHAT rating.")
        pg.click("#refl-save"); pg.wait_for_timeout(200)
        check("Revise reopens the appraisal", state(pg)["recs"]["omar"]["appraisal"]["status"] == "draft" and state(pg)["recs"]["omar"]["appraisal"]["revising"] is True)
        act(pg, "rate", path="recs.omar.appraisal.overall.what", v=4)
        act(pg, "submitAppraisal"); pg.wait_for_timeout(200)
        r = state(pg)["recs"]["omar"]
        check("Revised appraisal completes the cycle", r["reflection"]["done"] is True and r["reflection"]["biases"] == ["recency"] and r["appraisal"]["overall"]["what"] == 4)
        check("HR completion email shown", "Performance Appraisal Completed" in pg.inner_text("main"))

        # ---- 11. SCORE review (assessment layer) ----
        pg.goto(URL + "#review/1"); pg.wait_for_timeout(150)
        for k in ["align", "role", "kpi", "whathow", "clarity"]:
            act(pg, "saLevel", k=k, v=2); fill_bind(pg, f"sa.{k}.refl", "Our objectives fit the role.")
        shot(pg, "14_review_round1")
        pg.goto(URL + "#review/2"); pg.wait_for_timeout(150)
        for k in ["coverage", "facts", "standards", "justify", "fair"]:
            loc = pg.locator(f'[data-act="saLevel"][data-k="{k}"][data-v="2"]')
            act(pg, "saLevel", k=k, v=2 if not loc.is_disabled() else 1); fill_bind(pg, f"sa.{k}.refl", "Evidence supports the rating.")
        pg.goto(URL + "#review/summary"); pg.wait_for_timeout(150)
        total = int(re.search(r"(\d+)\s*/ 100", pg.inner_text("main")).group(1))
        check("Application Score computed", 0 < total <= 100, str(total))
        check("No game indicator in participant review", "Black Mirror" not in pg.inner_text("body") and "★" not in pg.inner_text("main"))
        shot(pg, "15_review_summary")
        pg.goto(URL + "#facilitator"); pg.wait_for_timeout(150)
        check("Facilitator code required again after reload", pg.locator("#fac-code").count() == 1)
        pg.fill("#fac-code", "5050"); act(pg, "facUnlock")
        act(pg, "facSet", k="facts", v=1)
        check("Facilitator validation overrides", state(pg)["recs"]["omar"]["fac"]["facts"] == 1)

        # ---- 12. sign out / resume ----
        act(pg, "dd", dd="user"); act(pg, "signout")
        check("Sign out shows resume option", pg.locator("#resume-btn").count() == 1)
        pg.click("#resume-btn"); pg.wait_for_timeout(200)
        check("Resume restores the session", state(pg)["recs"]["omar"]["reflection"]["done"] is True and pg.locator(".tile").count() == 4)

        # ---- 13. records are per employee ----
        act(pg, "pick", emp="salma")
        check("Other employees start fresh", state(pg)["recs"]["salma"]["goals"]["status"] == "not_started")
        check("Mariam's imported draft still there", len(state(pg)["recs"]["mariam"]["goals"]["objectives"]) == 2)

        # ---- 14. no unapproved content shown as final; no SAP branding ----
        body_all = (ROOT / "index.html").read_text(encoding="utf-8")
        check("No SAP branding in the page", not re.search(r"\bSAP\b|SuccessFactors", body_all))
        check("No Black Mirror name shown to participants", "Black Mirror" not in pg.inner_text("body"))

        # ---- 15. tablet layout ----
        act(pg, "pick", emp="omar")
        for (w, h, nm) in [(1024, 1366, "tablet_portrait"), (1180, 820, "tablet_landscape")]:
            tp = ctx.new_page(); tp.set_viewport_size({"width": w, "height": h}); tp.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())
            tp.goto(URL + "#home"); tp.wait_for_timeout(200)
            if tp.locator("#resume-btn").count(): tp.click("#resume-btn"); tp.wait_for_timeout(200)
            for route in ["home", "goals", "evidence", "appraisal", "conversations/alignment", "review/1", "inbox"]:
                tp.goto(URL + "#" + route); tp.wait_for_timeout(200)
                over = tp.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                check(f"No horizontal scroll at {w}×{h} on {route}", over <= 0, str(over))
            tp.goto(URL + "#goals"); tp.wait_for_timeout(200); shot(tp, f"16_{nm}_goals", False)
            if w <= 1100:
                act(tp, "side"); check(f"Navigation drawer opens at {w}px", tp.locator(".side.open").count() == 1); shot(tp, f"17_{nm}_drawer", False)
            else:
                check(f"Sidebar visible at {w}px", tp.locator(".side").is_visible())
            tp.close()

        check("No JavaScript errors", not errs, "; ".join(errs[:3]))
        b.close()
    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    run()
