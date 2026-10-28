#!/usr/bin/env python3
"""全时间轴布局扫描：按固定步长（默认 0.25s）调 __seek + __audit，只查布局不截图。

用法：sweep.py <期目录> [--step 0.25]
结果写入 out/qa/sweep_audit.json；发现问题时退出码 1。
"""
import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from audit import audit_text, validate_script


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--step", type=float, default=0.25)
    args = ap.parse_args()
    ep = Path(args.episode).resolve()
    script = json.loads((ep / "script.json").read_text("utf-8"))
    duration = script["duration"]
    step = max(0.05, args.step)
    times = []
    t = 0.0
    while t < duration:
        times.append(round(t, 3))
        t += step

    failures = validate_script(script)
    if failures:
        print("脚本结构审计：")
        for problem in failures:
            print("  -", problem)

    qa = ep / "out" / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    bad = []
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb", "--disable-lcd-text"])
        page = browser.new_page(viewport={"width": 1080, "height": 1440}, device_scale_factor=1)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto((ep / "stage.html").as_uri())
        page.wait_for_function("document.title === 'ready' && !!window.__seek", timeout=30000)
        page.evaluate("document.fonts && document.fonts.ready")
        page.wait_for_function("!window.__ASSETS_PENDING", timeout=30000)
        for i, tt in enumerate(times):
            page.evaluate(f"window.__seek({tt:.6f})")
            audit = page.evaluate("window.__audit()")
            problems = audit_text(audit["text"])
            if problems:
                bad.append({"t": tt, "problems": problems})
            if i % 40 == 0:
                print(f"  扫描 {i+1}/{len(times)}  t={tt:.2f}s  问题{len(bad)}", flush=True)
        browser.close()

    if errors:
        failures.extend("JS: " + e for e in errors[:10])
    failures.extend(f"{b['t']:.2f}s " + "；".join(b["problems"]) for b in bad)
    (qa / "sweep_audit.json").write_text(
        json.dumps({"step": step, "samples": len(times), "problems": bad, "failures": failures},
                   ensure_ascii=False, indent=2), "utf-8")
    if failures:
        print(f"扫描发现 {len(failures)} 项问题；详情见 out/qa/sweep_audit.json")
        sys.exit(1)
    print(f"全时间轴扫描通过：{len(times)} 个采样点，步长 {step}s")


if __name__ == "__main__":
    main()
