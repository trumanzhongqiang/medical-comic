#!/usr/bin/env python3
"""多时点画面与布局审计。用法：peek.py <期目录> [秒 ...] [--beats] [--strict]"""
import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from audit import audit_text, validate_script


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("times", nargs="*", type=float)
    ap.add_argument("--beats", action="store_true", help="检查每个节拍的开始/中间/结束")
    ap.add_argument("--strict", action="store_true", help="脚本或画面审计失败时退出码 1")
    args = ap.parse_args()
    ep = Path(args.episode).resolve()
    script = json.loads((ep / "script.json").read_text("utf-8"))
    times = list(args.times)
    if args.beats:
        for beat in script.get("beats", []):
            mid = (beat["start"] + beat["end"]) / 2
            times.extend([beat["start"] + .12, mid, max(mid, beat["end"] - .12)])
    if not times:
        times = [1.0]
    times = sorted(set(max(0, min(script["duration"] - .001, t)) for t in times))
    failures = validate_script(script)
    if failures:
        print("脚本结构审计：")
        for problem in failures:
            print("  -", problem)

    qa = ep / "out" / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    records = []
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb", "--disable-lcd-text"])
        page = browser.new_page(viewport={"width": 1080, "height": 1440}, device_scale_factor=1)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto((ep / "stage.html").as_uri())
        page.wait_for_function("document.title === 'ready' && !!window.__seek", timeout=30000)
        page.evaluate("document.fonts && document.fonts.ready")
        for t in times:
            page.evaluate(f"window.__seek({t:.6f})")
            page.wait_for_function("!window.__ASSETS_PENDING", timeout=30000)
            page.evaluate(f"window.__seek({t:.6f})")
            audit = page.evaluate("window.__audit()")
            problems = audit_text(audit["text"])
            records.append({"t": t, "problems": problems, "text": audit["text"]})
            out = qa / f"peek_{t:.2f}s.png"
            page.screenshot(path=str(out), type="png", clip={"x": 0, "y": 0, "width": 1080, "height": 1440})
            print(f"→ {out.name}  " + ("布局通过" if not problems else "；".join(problems)))
        browser.close()
    if errors:
        failures.extend("JS: " + e for e in errors[:10])
    failures.extend(f"{r['t']:.2f}s {p}" for r in records for p in r["problems"])
    (qa / "peek_audit.json").write_text(json.dumps({"frames": records, "failures": failures}, ensure_ascii=False, indent=2), "utf-8")
    if failures:
        print(f"审计发现 {len(failures)} 项问题；详情见 out/qa/peek_audit.json")
        sys.exit(1)
    print(f"无 JS/布局错误，共检查 {len(times)} 帧")
    if args.strict and not script.get("beats"):
        sys.exit("strict 模式需要 script.json.beats")


if __name__ == "__main__":
    main()
