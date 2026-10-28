#!/usr/bin/env python3
"""从当前会话的 wire.jsonl 汇总模型与 token，写入 episodes/<slug>/usage.json。

每期收尾（qacheck 通过后）跑一次：
  python3 pipeline/usage.py episodes/ep004-lipid-report

默认只统计会话里出现次数最多的模型（本期主模型），其它模型的用量列在 other_models 里，
避免一个会话顺手做了别的事把用量混进来。--all 则把全部模型都算进本期。
"""
import argparse, json, os
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def session_wire():
    home = os.environ.get("KIMI_SESSION_HOME") or os.environ.get("KIMI_AGENT_HOME")
    if home:
        p = Path(home) / "wire.jsonl"
        if p.exists():
            return p
    # 当前会话的 state.json 指向自己的 homedir；按它找，避免误拿别的会话
    # （别的会话可能因为后台任务更晚写盘）
    base = Path.home() / ".kimi-code" / "sessions"
    states = sorted(base.glob("*/session_*/state.json"), key=lambda x: x.stat().st_mtime)
    if states:
        st = json.loads(states[-1].read_text("utf-8"))
        homedir = (st.get("agents") or {}).get("main", {}).get("homedir")
        if homedir and (Path(homedir) / "wire.jsonl").exists():
            return Path(homedir) / "wire.jsonl"
    cands = sorted(base.glob("*/session_*/agents/main/wire.jsonl"), key=lambda x: x.stat().st_mtime)
    if not cands:
        raise SystemExit("找不到 wire.jsonl，请用 --wire 指定")
    return cands[-1]

def aggregate(wire):
    by_model = defaultdict(lambda: defaultdict(int))
    turns = defaultdict(int)
    with wire.open() as f:
        for line in f:
            if '"usage.record"' not in line:
                continue
            o = json.loads(line)
            m = o.get("model", "unknown")
            turns[m] += 1
            for k, v in (o.get("usage") or {}).items():
                if isinstance(v, (int, float)):
                    by_model[m][k] += int(v)
    return by_model, turns

def pack(model, d, n):
    uncached = d.get("inputOther", 0)
    cached = d.get("inputCacheRead", 0)
    out = d.get("output", 0)
    return {
        "model": model,
        "turns": n,
        "tokens": {
            "input_uncached": uncached,
            "input_cache_read": cached,
            "output": out,
            "total": uncached + cached + out,
        },
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--wire", default=None)
    ap.add_argument("--all", action="store_true", help="把会话里所有模型的用量都计入本期")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    script = json.loads((ep / "script.json").read_text("utf-8"))
    wire = Path(args.wire) if args.wire else session_wire()
    by_model, turns = aggregate(wire)
    if not by_model:
        raise SystemExit(f"{wire} 里没有 usage.record")

    primary = max(turns, key=turns.get)
    rec = pack(primary, by_model[primary], turns[primary])
    others = [pack(m, by_model[m], turns[m]) for m in sorted(turns) if m != primary]

    out = {
        "slug": script.get("slug", ep.name),
        "title": script.get("title", ""),
        "model": rec["model"],
        "session": wire.parents[2].name,
        "measured_at": datetime.now().strftime("%Y-%m-%d"),
        "turns": rec["turns"],
        "tokens": rec["tokens"],
        "note": "来自本会话 wire.jsonl 的逐轮 usage 合计。缓存读取是重复送入的上下文，按缓存计费，不是新生成内容。",
    }
    if args.all and others:
        extra = defaultdict(int)
        for o in [rec, *others]:
            for k, v in o["tokens"].items():
                extra[k] += v
        out["tokens"] = dict(extra)
        out["model"] = ", ".join(o["model"] for o in [rec, *others])
        out["turns"] = sum(o["turns"] for o in [rec, *others])
    elif others:
        out["other_models"] = others
        out["note"] += " 同一会话里其它模型的用量见 other_models，未计入本期合计。"

    dest = ep / "usage.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", "utf-8")
    t = out["tokens"]
    print(f"✓ {dest.relative_to(ROOT)}")
    print(f"  模型 {out['model']}  {out['turns']} 轮")
    print(f"  输入(未缓存) {t['input_uncached']:,}  缓存读取 {t['input_cache_read']:,}  输出 {t['output']:,}")
    print(f"  合计 {t['total']:,} token")

if __name__ == "__main__":
    main()
