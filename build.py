"""Assemble the SCORE Performance Hub from src/ into index.html (served by Vercel)
and artifact.html (same page without <html>/<body>, for a Claude artifact).
Also rebuilds the classic one-day simulation into classic.html (legacy/)."""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ORDER = ["assets.js", "employees.js", "content.js", "state.js", "score.js", "ui.js",
         "views_core.js", "views_goals.js", "views_monitor.js", "views_appraisal.js", "views_review.js", "events.js"]

def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

head = read("head.html")
js = "\n".join(read(n) for n in ORDER)
out = head + "\n" + js + "\n</script>\n"
with open(os.path.join(ROOT, "artifact.html"), "w", encoding="utf-8") as f:
    f.write(out)
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<meta name="description" content="NextWave | SCORE Performance Hub: performance management training simulation by LOGIC.">\n'
       '</head>\n<body>\n' + out + '</body>\n</html>\n')
with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
    f.write(doc)
print("index.html", len(doc))

legacy = os.path.join(ROOT, "legacy", "build_legacy.py")
if os.path.exists(legacy):
    subprocess.run([sys.executable, legacy], check=True, stdout=subprocess.DEVNULL)
    print("classic.html rebuilt")
