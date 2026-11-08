import re, json
from playwright.sync_api import sync_playwright
import pathlib
U=(pathlib.Path(__file__).resolve().parent.parent/"index.html").as_uri()
JS=r"""
(args) => {
 const {emp, r2, r3, alt, sa, fac, clicks} = args;
 localStorage.clear(); S = freshState();
 const g = GROUPS.find(x=>x.emp===emp).n; S.group = g;
 S.prog.done = {r1:true, begins:true, evaluate: !!r3}; S.prog.released = {r1:true,begins:true,evaluate:true,summary:true};
 const RESP = {omar:["1","3","2"], youssef:["0","3","2"], salma:["1","0","1"], mariam:["3","4","0"]}[emp];
 const COMPS = {omar:["Communication","Problem Solving"], youssef:["Coaching","Accountability & Ownership"], salma:["Time Management","Adaptability & Flexibility"], mariam:["Time Management","Communication"]}[emp];
 const c = S.begins.contracts[emp];
 if (r2 === "strong") {
   S.begins.priorities = ["p1","p2","p3"];
   const txt = alt ? [["Grow qualified new business","At least 60% of opportunities qualified by Q4"],["Customer outcomes","No more than 1 escalation per quarter"],["Deliver on plan","Zero late deliveries each month"]]
                   : [["Lift opportunity conversion","Convert 25% of qualified opportunities by December"],["Sound commitments","0 deals reworked after signature"],["Steady pipeline cover","3x pipeline cover each quarter"]];
   c.measures.forEach((m,i)=>Object.assign(m,{measure:txt[i][0],target:txt[i][1],weight:[40,35,25][i],evidence:"CRM pipeline report",freq:"Monthly",link:["p1","p2","p3"][i],resp:RESP[i],kind:i<2?"result":"driver"}));
   c.how = COMPS.map(x=>({comp:x, standard:"Observable standard described in detail here"}));
 } else {
   S.begins.priorities = ["p6","p7","p8"];
   c.measures.forEach((m,i)=>Object.assign(m,{measure:"Do more",target:"good",weight:[80,10,10][i],evidence:"Other",freq:"Annually",link:"none",resp:"none",kind:"driver"}));
   const bad = {omar:["Coaching","Time Management"], youssef:["Communication","Problem Solving"], salma:["Coaching","Communication"], mariam:["Coaching","Problem Solving"]}[emp];
   c.how = bad.map(x=>({comp:x, standard:"Observable standard described in detail here"}));
 }
 if (r3) {
   const K = R3_KEY[emp], R = REF[emp];
   if (r3.startsWith("strong")) {
     STD[emp].forEach(s=>S.ev.judg[s.id]=K.std[s.id][0]);
     S.ev.what = K.what[0]; S.ev.how = K.how[0];
     S.ev.rating = r3==="strong-alt" ? K.def[K.def.length-1] : K.def[0];
     if (r3==="strong-alt") { S.ev.what = Math.max(...K.what); S.ev.how = Math.max(...K.how); STD[emp].forEach(s=>S.ev.judg[s.id]=Math.max(...K.std[s.id])); }
     SORT[emp].forEach(s=>S.ev.sort[s.id]=s.a);
     S.ev.picks = R.ev.slice(0,4);
   } else {
     STD[emp].forEach(s=>S.ev.judg[s.id]=3); S.ev.what=3; S.ev.how=3; S.ev.rating=5;
     SORT[emp].forEach(s=>S.ev.sort[s.id]="fact");
     S.ev.picks = LOG[emp].filter(e=>e.pol==="pos").map(e=>e.id).slice(0,2);
     if (S.ev.picks.length<2) S.ev.picks = LOG[emp].map(e=>e.id).slice(0,2);
   }
   S.ev.just = "Justification text for the rating chosen here.";
 }
 if (sa !== undefined && sa !== null) { S.sa = {}; CRITERIA.filter(c=>c.mode==="judged").forEach(c=>{ const lv = typeof sa === "number" ? sa : sa[c.k]; if (lv!=null) S.sa[c.k] = {lvl: lv, refl: "Our objectives link to the strategy and role"}; }); }
 if (fac) S.fac = fac;
 if (clicks) { S.ev.viewed = {contract:true}; S.begins.checks = {}; S.begins.contracts[emp].measures.forEach(m=>S.begins.checks[m.id]={count:9,last:"ok"}); }
 const a = roundResult("begins"), b = r3 ? roundResult("evaluate") : null;
 const fmt = r => r ? {total:r.total, pending:r.pending, crit:Object.fromEntries(r.rows.map(x=>[x.c.k,x.s])), cap:Object.fromEntries(r.rows.filter(x=>x.cap!=null).map(x=>[x.c.k,x.cap])), src:Object.fromEntries(r.rows.map(x=>[x.c.k,x.src]))} : null;
 return {r2: fmt(a), r3: fmt(b), app: appScore(), bm: bmPath().map(p=>p.v)};
}
"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r: r.abort())
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(300)
    run=lambda **k: pg.evaluate(JS, k)
    E=["omar","youssef","salma","mariam"]
    print("T1 strong decisions + honest top self-assessment")
    for e in E:
        r=run(emp=e,r2="strong",r3="strong",sa=2); print(" ",e.ljust(8),"R2",r["r2"]["total"],"R3",r["r3"]["total"],"app",r["app"]["total"],"provisional",r["app"]["provisional"],"auto",r["app"]["auto"],"self",r["app"]["self"],"★",r["bm"])
    print("T2 weak decisions: caps from automated checks")
    for e in E:
        r=run(emp=e,r2="weak",r3="weak",sa=None); print(" ",e.ljust(8),"R2 caps",r["r2"]["cap"],"| R3 caps",r["r3"]["cap"],"| auto R3",{k:v for k,v in r["r3"]["crit"].items() if r["r3"]["src"][k]=="auto"})
    print("T2b weak decisions, group over-claims 2 everywhere")
    for e in E:
        r=run(emp=e,r2="weak",r3="weak",sa=2); print(" ",e.ljust(8),"R2",r["r2"]["total"],r["r2"]["crit"],"R3",r["r3"]["total"],r["r3"]["crit"],"app",r["app"]["total"])
    print("T2c weak decisions, honest self-assessment (0)")
    for e in E:
        r=run(emp=e,r2="weak",r3="weak",sa=0); print(" ",e.ljust(8),"R2",r["r2"]["total"],"R3",r["r3"]["total"],"app",r["app"]["total"],"★",r["bm"])
    print("T3 alternative wording")
    for e in E:
        a=run(emp=e,r2="strong",r3=None,sa=2); b2=run(emp=e,r2="strong",r3=None,alt=True,sa=2); print(" ",e.ljust(8),"same caps+scores:",a["r2"]["crit"]==b2["r2"]["crit"] and a["r2"]["cap"]==b2["r2"]["cap"])
    print("T3b activity KPI (driver) not penalised: strong contract has 1 driver -> kpi cap", run(emp="salma",r2="strong",r3=None,sa=2)["r2"]["cap"]["kpi"])
    print("T4 different defensible ratings")
    for e in E:
        x=run(emp=e,r2="strong",r3="strong",sa=2); y=run(emp=e,r2="strong",r3="strong-alt",sa=2)
        print(" ",e.ljust(8),"low-end fair cap",x["r3"]["cap"]["fair"],"R3",x["r3"]["total"],"| high-end fair cap",y["r3"]["cap"]["fair"],"R3",y["r3"]["total"])
    print("T7 no points for clicks")
    a=run(emp="omar",r2="strong",r3="strong",sa=2); c=run(emp="omar",r2="strong",r3="strong",sa=2,clicks=True); print("  identical:",a["app"]==c["app"])
    print("T7 provisional when not self-assessed")
    r=run(emp="mariam",r2="strong",r3="strong",sa=None); print("  app",r["app"],"R2 pending",r["r2"]["pending"],"★ path",r["bm"])
    print("T7 facilitator override")
    r=run(emp="mariam",r2="strong",r3="strong",sa=2,fac={"kpi":1,"standards":2}); print("  R2",r["r2"]["crit"],r["r2"]["src"]["kpi"],"| R3 standards",r["r3"]["crit"]["standards"],r["r3"]["src"]["standards"],"| app",r["app"])
    print("errors:",errs)
