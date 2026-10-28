#!/usr/bin/env python3
"""逐帧渲染器：加载 episodes/<slug>/stage.html，按 fps 输出帧序列到 out/frames/。

用法:
  python3 pipeline/render.py episodes/ep002-blood-sugar-report --fps 60
  python3 pipeline/render.py episodes/ep002-blood-sugar-report --fps 60 --format png --from 12 --to 20
"""
import argparse, json, sys, time
from pathlib import Path

from playwright.sync_api import sync_playwright

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode", help="期目录，如 episodes/ep002-blood-sugar-report")
    ap.add_argument("--fps", type=int, default=None)
    ap.add_argument("--format", choices=["jpg", "png"], default="jpg")
    ap.add_argument("--quality", type=int, default=95)
    ap.add_argument("--from", dest="t0", type=float, default=None, help="只渲染 [t0,t1] 秒（用于局部修补）")
    ap.add_argument("--to", dest="t1", type=float, default=None)
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    script = json.loads((ep / "script.json").read_text("utf-8"))
    fps = args.fps or script.get("fps", 60)
    duration = script["duration"]
    t0 = args.t0 if args.t0 is not None else 0.0
    t1 = args.t1 if args.t1 is not None else duration
    t0 = max(0.0, t0); t1 = min(duration, t1)

    frames_dir = ep / "out" / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    # 帧号全局连续：frame_000001.jpg 从 t=0 计
    i0 = int(round(t0 * fps)); i1 = int(round(t1 * fps)) - 1
    stage = ep / "stage.html"
    if not stage.exists():
        sys.exit(f"找不到 {stage}")

    ext = "jpeg" if args.format == "jpg" else "png"
    start = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb", "--disable-lcd-text"])
        page = browser.new_page(viewport={"width": 1080, "height": 1440}, device_scale_factor=2)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(stage.as_uri() + f"?fps={fps}")
        page.wait_for_function("document.title === 'ready' && !!window.__seek", timeout=30000)
        page.evaluate("document.fonts && document.fonts.ready")
        page.wait_for_function("!window.__ASSETS_PENDING", timeout=30000)
        dur = page.evaluate("window.__DURATION")
        if abs(dur - duration) > 0.01:
            browser.close()
            sys.exit(f"script.json duration={duration}s 与 story.js __DURATION={dur}s 不一致")

        n = i1 - i0 + 1
        for k in range(n):
            i = i0 + k
            t = i / fps
            page.evaluate(f"window.__seek({t:.6f})")
            path = frames_dir / f"frame_{i:06d}.{args.format}"
            page.screenshot(path=str(path), type=ext, quality=args.quality,
                            clip={"x": 0, "y": 0, "width": 1080, "height": 1440})
            if errors:
                browser.close()
                sys.exit("页面 JS 错误: " + "; ".join(errors[:3]))
            if k % 120 == 0 or k == n - 1:
                el = time.time() - start
                eta = el / (k + 1) * (n - k - 1)
                print(f"  帧 {i+1}/{i1+1}  t={t:.2f}s  耗时{el:.0f}s 预计剩余{eta:.0f}s", flush=True)
        browser.close()
    el = time.time() - start
    print(f"完成：{n} 帧 → {frames_dir}  共{el:.0f}s ({n/max(el,0.1):.1f} fps)")

if __name__ == "__main__":
    main()
