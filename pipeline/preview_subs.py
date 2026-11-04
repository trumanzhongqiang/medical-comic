#!/usr/bin/env python3
"""没有音频时也能出预览：按字数比例把字幕排进每一拍。
只用于看版式，出片前一定要跑 make_voice.py --write 换成真实时长。"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_beats import emit_ts  # noqa: E402

LEAD = 0.18
GAP = 0.11

ep = Path(sys.argv[1]).resolve()
sp = ep / "script.json"
d = json.loads(sp.read_text("utf-8"))

for b in d["beats"]:
    avail = b["end"] - b["start"] - LEAD - 0.26
    tot = sum(len(c["text"]) for c in b["clauses"]) or 1
    cur, subs = b["start"] + LEAD, []
    for c in b["clauses"]:
        dur = avail * len(c["text"]) / tot - GAP
        subs.append({"t": round(cur, 3), "end": round(cur + max(0.5, dur), 3), "text": c["text"]})
        cur += max(0.5, dur) + GAP
    b["subs"] = subs

sp.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", "utf-8")
emit_ts(d, d["remotion"]["composition"])
print("preview subs ok")
