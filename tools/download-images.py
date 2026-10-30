"""
Copies every image the site still loads from Squarespace into this folder,
then points the pages at the local copies.

Run it ONCE, from the site folder, BEFORE cancelling Squarespace:
    python3 tools/download-images.py

Needs Python 3 only (nothing to install). Safe to run again; finished
downloads are skipped.
"""
import hashlib, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, "images", "portfolio")
PATTERN = re.compile(r'https://images\.squarespace-cdn\.com/content/v1/[^"\s)]+')

os.makedirs(DEST, exist_ok=True)
pages = [os.path.join(d, f) for d, _, fs in os.walk(ROOT) for f in fs if f.endswith(".html")]
urls = sorted({u for p in pages for u in PATTERN.findall(open(p, encoding="utf-8").read())})
print(f"Found {len(urls)} images across {len(pages)} pages.")

local = {}
for i, url in enumerate(urls, 1):
    base = url.split("?")[0]
    ext = os.path.splitext(base)[1].lower() or ".png"
    size = re.search(r"format=(\d+)w", url)
    name = hashlib.sha1(base.encode()).hexdigest()[:12] + (f"-{size.group(1)}" if size else "") + ext
    path = os.path.join(DEST, name)
    if not os.path.exists(path):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
                f.write(r.read())
        except Exception as e:
            print(f"  ! could not download {base}: {e}")
            continue
    local[url] = path
    print(f"  [{i}/{len(urls)}] {name}")

for p in pages:
    s = open(p, encoding="utf-8").read()
    for url, path in local.items():
        rel = os.path.relpath(path, os.path.dirname(p)).replace(os.sep, "/")
        s = s.replace(url, rel)
    open(p, "w", encoding="utf-8").write(s)

missing = len(urls) - len(local)
print("Done." if not missing else f"Done, but {missing} image(s) failed. Run the script again to retry them.")
sys.exit(1 if missing else 0)
