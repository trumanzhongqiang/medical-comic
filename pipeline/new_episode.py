#!/usr/bin/env python3
"""脚手架：从模板创建新一期，并把选题登记进 queue/topics.json。

用法:
  python3 pipeline/new_episode.py ep003-hypertension "高血压：血管里的「水压」为什么会升高？"
"""
import json, shutil, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    slug, title = sys.argv[1], sys.argv[2]
    if not re.match(r"^ep\d{3}-[a-z0-9-]+$", slug):
        sys.exit("slug 格式: ep012-xxx（三位数字+小写短横线）")
    ep = ROOT / "episodes" / slug
    if ep.exists():
        sys.exit(f"{ep} 已存在")
    shutil.copytree(ROOT / "episodes" / "_template", ep)
    sj = json.loads((ep / "script.json").read_text("utf-8"))
    sj["title"] = title
    sj["slug"] = slug
    sj["output"] = f"医学科普漫画_{slug.split('-',1)[1]}_3x4.mp4"
    (ep / "script.json").write_text(json.dumps(sj, ensure_ascii=False, indent=2), "utf-8")

    qf = ROOT / "queue" / "topics.json"
    q = json.loads(qf.read_text("utf-8"))
    if not any(t["slug"] == slug for t in q["topics"]):
        q["topics"].insert(1, {"slug": slug, "title": title, "hook": title, "status": "scripting"})
    else:
        for t in q["topics"]:
            if t["slug"] == slug: t["status"] = "scripting"
    q["current"] = slug
    qf.write_text(json.dumps(q, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"✓ 已创建 {ep}")
    print(f"✓ queue/topics.json: {slug} → scripting")
    print("下一步：编写 story.js 与 script.json，然后 render → compose → qacheck")

if __name__ == "__main__":
    main()
