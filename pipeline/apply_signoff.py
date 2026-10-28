#!/usr/bin/env python3
"""把签字回填进 script.json，并生成一份复核记录。两种签字入口：

A. 签字页导出 JSON（逐条判断时用）
  python3 pipeline/apply_signoff.py factcheck-signoff-2026-10-28.json
  python3 pipeline/apply_signoff.py factcheck-signoff-2026-10-28.json --dry-run

B. 对话里确认（用户口头认可整期时用，不生成网页）
  python3 pipeline/apply_signoff.py --episode ep002-blood-sugar-report --by 用户 --sign-all
  python3 pipeline/apply_signoff.py --episode ep005-fatty-liver --by 用户 --sign-all --common
  # --sign-all 只签 verdict=通过；待核查要一并转「常识表述」再加 --common

动作含义（来自签字页）:
  sign    认可并签字    → 写 reviewer / reviewed_at
  common  保留为常识表述 → verdict 改为「常识表述」，写 reviewer / reviewed_at
  revise  需改文案      → 不改 script.json，列进复核记录等你改画面
  drop    建议删去      → verdict 改为「删去」，列进复核记录
"""
import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit import pending_signoff, validate_sources  # noqa: E402

CLEAN = re.compile(r"[^\u4e00-\u9fa5A-Za-z0-9]")


def norm(text):
    return CLEAN.sub("", text or "")


def value_span(raw, key):
    """返回 raw 中 "key": <value> 的 value 起止位置（字符串外的括号配平）。"""
    m = re.search(r'"%s"\s*:\s*' % re.escape(key), raw)
    if not m:
        return None
    start = m.end()
    if raw[start] not in "[{":
        raise ValueError(f"{key} 不是数组或对象")
    depth, i, in_str, esc = 0, start, False, False
    while i < len(raw):
        ch = raw[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch in "[{":
                depth += 1
            elif ch in "]}":
                depth -= 1
                if depth == 0:
                    return start, i + 1
        i += 1
    raise ValueError(f"{key} 括号未配平")


def write_block(raw, key, value, indent="  "):
    span = value_span(raw, key)
    if not span:
        raise KeyError(key)
    body = json.dumps(value, ensure_ascii=False, indent=2)
    body = body.replace("\n", "\n" + indent)
    return raw[:span[0]] + body + raw[span[1]:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("signoff", nargs="?", help="签字页导出的 JSON；用 --episode 时可省略")
    ap.add_argument("--episode", nargs="+", default=[], help="对话签字：要签的期次 slug")
    ap.add_argument("--by", default="", help="对话签字：签字人")
    ap.add_argument("--sign-all", action="store_true", help="对话签字：签掉所有 verdict=通过 的条目")
    ap.add_argument("--common", action="store_true", help="对话签字：把待核查一并转「常识表述」再签")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.signoff:
        payload = json.loads(Path(args.signoff).read_text("utf-8"))
        who = (payload.get("reviewer") or "").strip()
        when = (payload.get("reviewed_at") or date.today().isoformat()).strip()
        decisions = payload.get("decisions") or []
        if not who:
            raise SystemExit("签字文件里没有 reviewer，拒绝回填")
    else:
        if not (args.episode and args.by and (args.sign_all or args.common)):
            raise SystemExit(
                "用法：apply_signoff.py <签字文件>，或\n"
                "      apply_signoff.py --episode <slug...> --by <签字人> --sign-all [--common]")
        who = args.by
        when = date.today().isoformat()
        decisions = []
        for slug in args.episode:
            path = ROOT / "episodes" / slug / "script.json"
            if not path.exists():
                raise SystemExit(f"找不到 {path}")
            for i, item in enumerate(json.loads(path.read_text("utf-8")).get("sources") or [], 1):
                row = {"episode": slug, "idx": i, "claim": item.get("claim", ""), "note": ""}
                if item.get("verdict") == "通过":
                    decisions.append({**row, "action": "sign"})
                elif item.get("verdict") == "待核查" and args.common:
                    decisions.append({**row, "action": "common",
                                      "note": "对话确认：原文未取到，按通行常识表述留在画面"})
        if not decisions:
            raise SystemExit("没有可签的条目（没有 通过 条目；待核查需加 --common）")

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", when):
        raise SystemExit(f"reviewed_at 需 YYYY-MM-DD，收到 {when}")

    by_ep = {}
    for d in decisions:
        by_ep.setdefault(d["episode"], []).append(d)

    missing = [s for s in by_ep if not (ROOT / "episodes" / s / "script.json").exists()]
    if missing:
        raise SystemExit("这些期找不到 script.json，先确认路径：" + "、".join(missing))

    log = []
    for slug, rows in by_ep.items():
        path = ROOT / "episodes" / slug / "script.json"
        raw = path.read_text("utf-8")
        script = json.loads(raw)
        sources = script.get("sources") or []
        changed = False
        applied = 0
        for row in rows:
            idx = row.get("idx")
            action = row.get("action")
            if not isinstance(idx, int) or not 1 <= idx <= len(sources):
                log.append(f"跳过 {slug} #{idx}：序号越界")
                continue
            item = sources[idx - 1]
            if norm(item.get("claim")) != norm(row.get("claim")):
                log.append(f"跳过 {slug} #{idx}：claim 与 script.json 不一致（文件被改过？）")
                continue
            if action in ("sign", "common"):
                if action == "common":
                    item["verdict"] = "常识表述"
                elif item.get("verdict") != "通过":
                    log.append(f"跳过 {slug} #{idx}：verdict 是 {item.get('verdict')}，不能按「通过」签字")
                    continue
                item["reviewer"] = who
                item["reviewed_at"] = when
                changed = True
                applied += 1
            elif action == "drop":
                item["verdict"] = "删去"
                item["conflict"] = (item.get("conflict") or "") + f"｜人工判定删去（{who} {when}）"
                changed = True
            elif action == "revise":
                note = row.get("note") or "未写具体改法"
                item["conflict"] = (item.get("conflict") or "") + f"｜人工要求改文案（{who} {when}）：{note}"
                changed = True
            else:
                log.append(f"跳过 {slug} #{idx}：未知动作 {action}")

        script["sources"] = sources
        mr = script.get("medical_review")
        if isinstance(mr, dict):
            pending = pending_signoff(script)
            mr["signoff"] = {
                "by": who,
                "at": when,
                "signed": sum(1 for x in sources if x.get("reviewer")),
                "pending": len(pending),
            }

        new_raw = write_block(raw, "sources", sources)
        if isinstance(mr, dict):
            new_raw = write_block(new_raw, "medical_review", mr)
        check = json.loads(new_raw)  # 写盘前先确认还是合法 JSON
        problems = validate_sources(check)
        if problems:
            print(f"！ {slug} 回填后结构有问题：")
            for p in problems:
                print("   -", p)
        if not args.dry_run:
            path.write_text(new_raw, encoding="utf-8")
        log.append(f"{slug}：签字回填 {applied} 条，"
                   f"待签 {len(pending_signoff(check))} 条")

        # 复核记录，留痕在 out/qa
        qa = ROOT / "episodes" / slug / "out" / "qa"
        qa.mkdir(parents=True, exist_ok=True)
        lines = [f"# 事实核查复核记录 · {script.get('title', slug)}", "",
                 f"- 签字人：{who}", f"- 日期：{when}", f"- 条目：{len(sources)}",
                 f"- 待签：{len(pending_signoff(check))}", ""]
        for row in rows:
            label = {"sign": "认可", "common": "保留为常识", "revise": "需改文案", "drop": "建议删去"}[row["action"]]
            lines.append(f"- [{label}] #{row['idx']} {row['claim']}")
            if row.get("note"):
                lines.append(f"  - 备注：{row['note']}")
        notes = [(r, o) for r, o in ((r, script["sources"][r["idx"] - 1]) for r in rows)
                 if r["action"] in ("revise", "drop")]
        if notes:
            lines += ["", "## 画面要跟着改的", ""]
            for r, o in notes:
                lines.append(f"- #{r['idx']} 画面句「{o.get('conclusion')}」→ {r['action']}")
        review_md = qa / f"factcheck-review-{when}.md"
        if not args.dry_run:
            review_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
        log.append(f"  复核记录：{review_md.relative_to(ROOT)}")

    print(("（dry-run，未写盘）\n" if args.dry_run else "") + "\n".join(log))


if __name__ == "__main__":
    main()
