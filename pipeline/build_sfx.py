#!/usr/bin/env python3
"""按画面动作铺音效：一页里几个动作就几个声音，不再一拍只给一个转场音。

`sfx.plan.json` 里写的是「这个场景第几成处、响什么、多大声」，这里把它乘以拍长
换算成绝对时间，顺带按素材实测起音位置写 lead（让真正出声那一下落在动作上）。

用法：
  python3 pipeline/build_sfx.py episodes/ep002-blood-sugar-report
  python3 pipeline/build_sfx.py episodes/ep002-blood-sugar-report --dry
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_sfx import find, onset  # noqa: E402

MAX_LEAD = 1.0


def apply(script, ep):
    """有 sfx.plan.json 就用画面动作表，否则返回 None 交给 sync_sfx 兜底。"""
    plan_p = Path(ep) / "sfx.plan.json"
    if not plan_p.exists():
        return None
    plan = json.loads(plan_p.read_text("utf-8"))
    scenes = plan.get("scenes", {})
    beats = script["beats"]

    sfx, missing, empty = [], [], []
    for i, b in enumerate(beats):
        acts = scenes.get(b["scene"])
        if not acts:
            empty.append(b["scene"])
            continue
        dur = float(b["end"]) - float(b["start"])
        if dur <= 0:
            continue
        for k, a in enumerate(acts):
            src = find(a["name"])
            if src is None:
                missing.append(a["name"])
                continue
            t = round(float(b["start"]) + float(a["at"]) * dur, 3)
            sfx.append({
                "id": f"{b.get('id') or f'b{i:02d}'}-{k}",
                "t": t,
                "name": a["name"],
                "gain": float(a.get("gain", 0.5)),
                "lead": round(min(MAX_LEAD, onset(src)), 3),
            })
    if missing:
        raise ValueError(f"缺素材：{sorted(set(missing))}")
    if empty:
        print(f"  提示：没有动作表的场景 {sorted(set(empty))}，这些拍不出声")
    sfx.sort(key=lambda x: x["t"])
    script["sfx"] = sfx
    return sfx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    sp = ep / "script.json"
    script = json.loads(sp.read_text("utf-8"))
    sfx = apply(script, ep)
    if sfx is None:
        sys.exit("这一期没有 sfx.plan.json，用 sync_sfx.py 兜底")

    if args.dry:
        for fx in sfx:
            print(f"{fx['t']:7.2f} gain={fx['gain']:.2f} lead={fx['lead']:.2f} {fx['name']}")
        print(f"共 {len(sfx)} 个，平均每 {script['duration'] / max(1, len(sfx)):.1f} 秒一个")
        return

    sp.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"{script['slug']}: {len(sfx)} 个动作音效 / {len(script['beats'])} 拍"
          f"（平均每 {script['duration'] / max(1, len(sfx)):.1f} 秒一个）")


if __name__ == "__main__":
    main()
