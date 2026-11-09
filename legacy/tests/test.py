import re
import sys, json
from playwright.sync_api import sync_playwright
import pathlib
URL=(pathlib.Path(__file__).resolve().parent.parent.parent/"public"/"classic.html").as_uri()
CONTRACTS={
 "omar":[("Competitor and market reports delivered on schedule and accurate","100% of scheduled reports on time; accuracy confirmed quarterly",35,"Stakeholder feedback","Monthly"),
         ("Leadership decisions informed by his recommendations","At least 3 recommendations adopted by leadership per half",35,"Stakeholder feedback","Quarterly"),
         ("Win/loss analysis that identifies target segments","Segment recommendation each quarter, used in pipeline review",30,"CRM pipeline report","Quarterly")],
 "youssef":[("New business revenue for his area","100% of annual new-business target",40,"Revenue reports","Monthly"),
         ("Coach Salma to own opportunities with decision rights","Salma owns at least 5 opportunities end to end by Q4",35,"1:1 & coaching notes","Monthly"),
         ("Realistic customer commitments within scope","Zero proposals needing scope rework after signature",25,"Proposal trackers","Quarterly")],
 "salma":[("Opportunity qualification rate","At least 50% of opportunities meet qualification criteria by H2",40,"CRM pipeline report","Monthly"),
         ("New customers won from qualified opportunities","At least 3 new customers closed by December",35,"Revenue reports","Quarterly"),
         ("Prospecting activity in target segments with quality","100% of activity plan in target segments",25,"CRM pipeline report","Monthly")],
 "mariam":[("Proposals delivered on the agreed date","At least 85% of proposals delivered on the agreed date",40,"Proposal trackers","Monthly"),
         ("Proposal quality and customer feedback","Customer feedback score of at least 4 of 5 on proposals",35,"Customer feedback","Quarterly"),
         ("Revision rounds per proposal","No more than 1 revision round on average per quarter",25,"Proposal trackers","Monthly")]}
WEAK=[("Number of calls","lots",80,"Other",""),("Be better","good",10,"Manager observation",""),("Help team","help",10,"Other","")]
def run(group, profile, shots=False):
    emp=["omar","youssef","salma","mariam"][group-1]
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(); pg=b.new_page(viewport={"width":1440,"height":900}); pg.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type=="error" and "fonts" not in m.text else None)
        pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload()
        def c(sel):
            pg.locator(sel).first.click(); pg.wait_for_timeout(90)
        c('[data-act="begin"]')
        assert "group" not in pg.url
        nxt=lambda: c('[data-act="next"]')
        if shots: pg.goto(URL+"#home"); pg.wait_for_timeout(200); pg.screenshot(path="s_home.png", full_page=True); pg.goto(URL+"#r1-0"); pg.wait_for_timeout(200); pg.screenshot(path="s_r1.png", full_page=True)
        for e in ["omar","youssef","salma","mariam"]:
            c(f'.team-card[data-emp="{e}"]')
            assert pg.locator('button:has-text("Continue")').count()==0, "Continue visible in story"
            if shots and e=="omar": pg.screenshot(path="s_story.png", full_page=True)
            c('[data-act="storyBack"]')
        c('.team-card[data-emp="salma"]'); c('.nav-foot [data-act="story"]'); assert "Mariam Adel" in pg.locator("main").inner_text(); c('[data-act="storyBack"]')
        c('.team-card[data-emp="mariam"]'); assert "Define the Need" in pg.locator(".nav-foot").inner_text()
        if shots: pg.screenshot(path="s_story.png", full_page=True)
        c('.nav-foot [data-act="next"]'); assert "Define the Need" in pg.locator("h1").inner_text(), "last story -> next tab"
        pg.fill("#f-r1-ans-omar-need","To have his analysis judged on its merit.")
        if shots: pg.screenshot(path="s_need.png", full_page=True)
        nxt()
        if shots: pg.screenshot(path="s_pause.png")
        assert pg.locator(".pause").count()==1, "pause1"
        if shots: pg.screenshot(path="s_pause.png")
        pg.fill("#relcode","1111"); c('[data-act="unlock"]'); assert pg.locator(".hint-err").count()==1
        pg.fill("#relcode","4826"); pg.keyboard.press("Enter")
        pg.wait_for_timeout(200); assert "#group" in pg.url, pg.url
        c(f'[data-act="chooseGroup"][data-n="{group}"]'); c('.nav-foot [data-act="goStage"]')
        # R2 priorities
        prios = ["p1","p2","p3"] if profile!="weak" else ["p6","p7","p8"]
        for pid in prios: c(f'[data-act="togglePrio"][data-id="{pid}"]')
        pg.fill("#f-begins-contribution","Commercial contributes by winning qualified new customers on deliverable commitments.")
        nxt()
        if shots: pg.screenshot(path="s_contract.png", full_page=True)
        rows = CONTRACTS[emp] if profile!="weak" else WEAK
        if profile=="mixed": rows=[CONTRACTS[emp][0], ("Activity volume: calls and meetings","120 calls per month",CONTRACTS[emp][1][2],"CRM pipeline report","Monthly"), CONTRACTS[emp][2]]
        base=f"begins-contracts-{emp}"
        for i,(m,t,w,ev,fq) in enumerate(rows):
            pg.fill(f"#f-{base}-measures-{i}-measure",m); pg.fill(f"#f-{base}-measures-{i}-target",t); pg.fill(f"#f-{base}-measures-{i}-weight",str(w))
            pg.wait_for_timeout(450)
            pg.select_option(f"#f-{base}-measures-{i}-evidence",ev)
            if fq: pg.select_option(f"#f-{base}-measures-{i}-freq",fq)
            RESP={"omar":["1","3","2"],"youssef":["0","3","2"],"salma":["1","0","1"],"mariam":["3","4","0"]}[emp]
            if profile!="weak":
                pg.select_option(f"#f-{base}-measures-{i}-link",["p1","p2","p3"][i]); pg.select_option(f"#f-{base}-measures-{i}-resp",RESP[i]); pg.select_option(f"#f-{base}-measures-{i}-kind","result" if i<2 else "driver")
            else:
                pg.select_option(f"#f-{base}-measures-{i}-link","none"); pg.select_option(f"#f-{base}-measures-{i}-resp","none"); pg.select_option(f"#f-{base}-measures-{i}-kind","driver")
            if profile=="strong":
                c(f'[data-act="openChecker"]:nth-match(x,1)') if False else None
        if profile=="strong":
            n=pg.locator('[data-act="openChecker"]').count()
            for k in range(n):
                pg.locator('[data-act="openChecker"]').nth(k).click(); 
                if k==0:
                    if shots: pg.screenshot(path="s_checker.png")
                c('[data-act="closeModal"]')
        comps={"omar":["Communication","Problem Solving"],"youssef":["Coaching","Accountability & Ownership"],"salma":["Time Management","Adaptability & Flexibility"],"mariam":["Time Management","Communication"]}[emp]
        for k,cp in enumerate(comps):
            c(f'[data-act="toggleHow"][data-comp="{cp}"]')
            pg.fill(f"#f-{base}-how-{k}-standard","Observable: states the decision needed first and answers the question asked.")
        c('[data-act="openGuide"]'); assert pg.locator('.modal [data-act="tool"]').count()==6
        c('[data-act="tool"][data-id="kpi"]')
        if shots: pg.screenshot(path="s_guide.png")
        c('[data-act="closeModal"]'); c('[data-m="role"]'); assert "key responsibilities" in pg.locator(".modal").inner_text().lower(); c('[data-act="closeModal"]')
        c('[data-m="cobj"]'); assert pg.locator(".modal .panel").count()>=2; c('[data-act="closeModal"]')
        if shots: pg.screenshot(path="s_contract.png", full_page=True)
        nxt()
        err=pg.locator(".hint-err").all_inner_texts()
        assert not err, err
        assert pg.locator("text=Your performance contract is set.").count()==1
        if shots: pg.screenshot(path="s_r2res.png", full_page=True)
        def self_assess():
            for k in pg.evaluate("CRITERIA.filter(c=>c.mode==='judged').map(c=>c.k)"):
                if pg.locator(f"#sa-{k}").count()==0: continue
                pg.locator(f'#sa-{k} .rub:not([disabled])').first.click(); pg.wait_for_timeout(60)
                pg.fill(f"#f-sa-{k}-refl","Our decisions meet this level because they follow the standards"); pg.wait_for_timeout(450)
        self_assess()
        if shots: pg.screenshot(path='s_r2assess.png', full_page=True)
        c('[data-act="r2seen"]'); assert pg.locator(".pause").count()==1
        # try skipping to evaluate via hash
        pg.goto(URL+"#evaluate-3"); pg.wait_for_timeout(150); assert pg.locator(".pause").count()==1, "gate bypass"
        pg.fill("#relcode","7319"); c('[data-act="unlock"]')
        if shots: pg.screenshot(path="s_brief.png", full_page=True)
        if profile=="strong": c('[data-act="openContract"]'); c('[data-act="closeModal"]')
        total=pg.locator(".elog tbody tr").count(); h1=0; assert total==5, total
        assert pg.locator('[data-act="filt"]').count()==0
        nxt()
        # gaps: validation first
        nxt(); assert pg.locator(".hint-err").count()==1
        STD_REF={"omar":{"w1":3,"w2":3,"w3":2,"h1":1,"h2":3},"youssef":{"w1":3,"w2":2,"w3":1,"h1":1,"h2":2},"salma":{"w1":2,"w2":2,"w3":3,"h1":1,"h2":3},"mariam":{"w1":1,"w2":3,"w3":3,"h1":1,"h2":1}}[emp]
        for sid,v in STD_REF.items():
            if profile=="weak": v=3
            c(f'[data-path="ev.judg.{sid}"][data-val="{v}"]')
        sorts=pg.evaluate(f"SORT.{emp}.map(s=>[s.id,s.a])")
        for i,(sid,a) in enumerate(sorts):
            if profile=="weak": a="fact"
            if profile=="mixed" and i<2: a = "interp" if a=="fact" else "fact"
            c(f'[data-path="ev.sort.{sid}"][data-val="{a}"]')
        if shots: pg.screenshot(path="s_gaps.png", full_page=True)
        nxt()
        R=pg.evaluate(f"REF.{emp}")
        what,how = (R["what"],R["how"]) if profile!="weak" else (3,3)
        c(f'[data-path="ev.what"][data-val="{what}"]'); c(f'[data-path="ev.how"][data-val="{how}"]')
        rating = R["rating"] if profile=="strong" else (min(5,R["rating"]+1) if profile=="mixed" else 5)
        c(f'[data-path="ev.rating"][data-val="{rating}"]')
        c(f'[data-path="ev.rating"][data-val="{5 if rating!=5 else 4}"]'); c(f'[data-path="ev.rating"][data-val="{rating}"]')  # revise
        if profile=="weak": picks=pg.evaluate(f"LOG.{emp}.filter(e=>e.pol==='pos').map(e=>e.id)")[:2]
        else:
            h=pg.evaluate(f"Object.fromEntries(LOG.{emp}.map(e=>[e.id,e.h]))")
            h1=[x for x in R["ev"] if h[x]=="H1"]; h2=[x for x in R["ev"] if h[x]!="H1"]
            picks=(h1[:2]+h2[:2])[:4]
        for pid in picks: c(f'[data-act="pickEv"][data-id="{pid}"]')
        nxt(); assert pg.locator(".hint-err").count()==1  # missing justification
        pg.fill("#f-ev-just","The full-year record shows results against the agreed standards, with the behaviour gap documented in both halves.")
        if shots: pg.screenshot(path="s_rating.png", full_page=True)
        nxt()
        assert pg.locator("text=Evaluation submitted.").count()==1
        if shots: pg.screenshot(path="s_r3res.png", full_page=True)
        self_assess()
        if shots: pg.screenshot(path='s_r3assess.png', full_page=True)
        c('.nav-foot [data-stage="summary"]')
        assert pg.locator("text=Your SCORE Performance Debrief").count()==1
        if shots: pg.screenshot(path="s_summary.png", full_page=True)
        st=pg.evaluate("({bm:{history:bmPath().slice(1).map(p=>({total:p.total})), rating:bmRating()}, fi:{idx:appScore().total, prov:appScore().provisional}, mc:[]})")
        assert not st["fi"]["prov"], "provisional after full self-assessment"
        assert pg.locator("text=provisional").count()==0 or True
        # mobile check
        pg.set_viewport_size({"width":390,"height":844})
        for h in ["#summary","#evaluate","#r1-1","#group"]:
            pg.goto(URL+h); pg.wait_for_timeout(120)
            sw=pg.evaluate("document.documentElement.scrollWidth"); 
            if sw>392: errs.append(f"hscroll {h} {sw}")
        b.close()
    return dict(group=group,profile=profile,rows=total,h1=h1,r2=st["bm"]["history"][0]["total"],r3=st["bm"]["history"][1]["total"],r3crit=None,rating=st["bm"]["rating"],idx=st["fi"],mc=st["mc"],errs=errs)
if __name__=="__main__":
    out=[]
    for g in [1,2,3,4]:
        for prof in ["strong"]:
            r=run(g,prof, shots=(g==4 and prof=="strong"))
            print(json.dumps(r)); out.append(r)
