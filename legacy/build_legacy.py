import re, os
# Builds the classic (pre-Performance Hub) one-day simulation into /classic.html. Kept unchanged for rollback.
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
head=open('p_head.html').read()
css=open('n_style.css').read()
head=head.replace('\n</style>\n<div id="app"></div>', '\n'+css+'\n</style>\n<div id="app"></div>',1)
assert css[:40] in head
head=head.replace('<title>SCORE Performance Simulation</title>','<title>SCORE One-Day Simulation</title>',1)
r2=open('p_r2.js').read()
def rep(s,a,b):
    assert a in s, a[:60]
    return s.replace(a,b,1)
r2=rep(r2,'${stageHead("begins", "The Year Begins", "")}','${stageHead("begins", "Strategy and Objectives", "")}\n      ${cascadeStrip()}<div style="height:26px"></div>')
r2=rep(r2,'Write the contract for the role your group manages: what the role must deliver, and how it must be done.','Write the contract for the role your group manages: WHAT the role must deliver, and HOW it must be done.')
comp=open('p_company.js').read()
comp=re.sub(r'\n    \$\{!S\.prog\.done\.firstcall.*?\n','\n',comp)
assert 'firstcall' not in comp
js='\n'.join(open(f).read() for f in ['p_data.js','n_data.js','n_state.js','p_engine.js']) + '\n' + r2 + '\n' + comp + '\n' + open('p_profile.js').read() + '\n' + open('n_app.js').read()+'\n'+open('n_score.js').read()+'\n'+open('n_views.js').read()
out=head+'\n'+js+'\n</script>\n'
doc = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="description" content="SCORE: one-day performance management simulation by LOGIC, set at NextWave Digital.">\n</head>\n<body>\n' + out + '</body>\n</html>\n'
open('../../public/classic.html','w').write(doc)
print(len(out))
