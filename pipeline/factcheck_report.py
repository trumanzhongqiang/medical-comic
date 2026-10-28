#!/usr/bin/env python3
"""打印事实核查签字清单：逐条列出 claim / verdict / 来源 / 原文摘录 / 签字人。

用法:
  python3 pipeline/factcheck_report.py episodes/ep002-blood-sugar-report
  python3 pipeline/factcheck_report.py episodes/ep002-blood-sugar-report --pending   # 只列待签与待核查
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit import pending_signoff  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--pending", action="store_true", help="只列待签与待核查")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    s = json.loads((ep / "script.json").read_text("utf-8"))
    sources = s.get("sources") or []
    pending = set(pending_signoff(s))

    print(f"# 事实核查签字单 · {s.get('title', ep.name)}")
    print(f"共 {len(sources)} 条；待人工签字 {len(pending)} 条；"
          f"待核查 {sum(1 for x in sources if x.get('verdict') == '待核查')} 条\n")

    for i, x in enumerate(sources, 1):
        verdict = x.get("verdict", "?")
        if args.pending and verdict != "待核查" and x.get("claim") not in pending:
            continue
        if verdict == "通过" and x.get("reviewer"):
            flag = f"已签 · {x['reviewer']} {x.get('reviewed_at', '')}".strip()
        elif verdict == "通过":
            flag = "待签"
        else:
            flag = verdict
        print(f"{i}. [{flag}] {x.get('claim')}")
        print(f"   画面：{x.get('conclusion', '')}")
        print(f"   来源：{x.get('source', '')}")
        if x.get("quote"):
            print(f"   原文：{x['quote']}")
        if x.get("url"):
            print(f"   链接：{x['url']}")
        if x.get("conflict"):
            print(f"   备注：{x['conflict']}")
        print()

    if pending:
        print("签字方式：在 script.json 对应条目的 reviewer 填名字、reviewed_at 填 YYYY-MM-DD。")
        print("不认同时改 verdict，或改 story.js 的画面文案，再重跑本清单。")


if __name__ == "__main__":
    main()
