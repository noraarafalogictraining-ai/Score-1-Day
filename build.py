"""Assemble the SCORE Performance Hub (Omar pilot) from src/ into public/index.html.
Vercel serves public/ and runs the API functions in api/.
Also rebuilds the classic one-day simulation into public/classic.html (legacy/)."""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ORDER = ["assets.js", "employees.js", "pilot.js", "content.js", "state.js", "appraisal_calc.js", "ui.js", "score.js",
         "views_core.js", "views_goals.js", "views_chat.js", "views_monitor.js", "views_appraisal.js", "views_review.js", "events.js"]
OUT = os.path.join(ROOT, "public")

def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

head = read("head.html")
js = "\n".join(read(n) for n in ORDER)
out = head + "\n" + js + "\n</script>\n"
os.makedirs(OUT, exist_ok=True)
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<meta name="description" content="NextWave | SCORE Performance Hub: performance management training simulation by LOGIC.">\n'
       '</head>\n<body>\n' + out + '</body>\n</html>\n')
with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
    f.write(doc)
print("index.html", len(doc))

legacy = os.path.join(ROOT, "legacy", "build_legacy.py")
if os.path.exists(legacy):
    subprocess.run([sys.executable, legacy], check=True, stdout=subprocess.DEVNULL)
    print("classic.html rebuilt")
