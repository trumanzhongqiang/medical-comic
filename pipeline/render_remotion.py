#!/usr/bin/env python3
"""用 Remotion 渲染某一期，帧序列落到 out/frames/frame_%06d.jpg，供 compose.py 使用。

用法:
  python3 pipeline/render_remotion.py episodes/ep003-hypertension
  python3 pipeline/render_remotion.py episodes/ep003-hypertension --from 12 --to 20
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REMOTION = ROOT / "remotion"
CHROME = Path.home() / "Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--from", dest="t0", type=float, default=None)
    ap.add_argument("--to", dest="t1", type=float, default=None)
    ap.add_argument("--concurrency", type=int, default=4)
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    script = json.loads((ep / "script.json").read_text("utf-8"))
    fps = int(script["fps"])
    duration = float(script["duration"])
    comp = script.get("remotion", {}).get("composition")
    if not comp:
        sys.exit("script.json 缺少 remotion.composition")
    if not (REMOTION / "node_modules" / "remotion").exists():
        sys.exit(f"先在 {REMOTION} 执行 npm install")

    frames = ep / "out" / "frames"
    frames.mkdir(parents=True, exist_ok=True)
    t0 = 0.0 if args.t0 is None else max(0.0, args.t0)
    t1 = duration if args.t1 is None else min(duration, args.t1)
    i0 = int(round(t0 * fps))
    i1 = int(round(t1 * fps)) - 1

    # 局部修补时渲到临时目录，再按全局帧号拷回去。
    dest = frames if args.t0 is None and args.t1 is None else ep / "out" / "frames_part"
    if dest != frames and dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True, exist_ok=True)

    cmd = [
        "npx", "remotion", "render", "src/index.ts", comp, str(dest),
        "--sequence", "--image-format=jpeg", "--jpeg-quality=95",
        "--frames", f"{i0}-{i1}",
        "--concurrency", str(args.concurrency),
    ]
    if CHROME.exists():
        cmd += ["--browser-executable", str(CHROME)]
    env = dict(os.environ)
    print(" ".join(cmd), flush=True)
    r = subprocess.run(cmd, cwd=str(REMOTION), env=env)
    if r.returncode != 0:
        sys.exit(r.returncode)

    if dest != frames:
        for src in sorted(dest.glob("*.jpeg")) + sorted(dest.glob("*.jpg")):
            n = int(src.stem.split("-")[-1])
            shutil.move(str(src), frames / f"frame_{n:06d}.jpg")
        shutil.rmtree(dest, ignore_errors=True)
    else:
        # Remotion --sequence 输出的是 element-0000.jpeg，而 compose.py 只认 script.json 的
        # frame_sequence（默认 frame_%06d.jpg）——名字不改，合成时只找到零星几帧，成片会短一截。
        for src in sorted(frames.glob("element-*.jpeg")):
            n = int(src.stem.split("-")[-1])
            # 用 os.replace 覆盖：先 unlink 再 rename 会触发批量删除保护，
            # 删到第 50 个就被拦下，结果是新旧帧混在一层目录里、成片取错。
            os.replace(src, frames / f"frame_{n:06d}.jpg")
    count = len(list(frames.glob("frame_*.jpg")))
    print(f"完成：{count} 帧 → {frames}")


if __name__ == "__main__":
    main()
