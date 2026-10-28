#!/usr/bin/env python3
"""成片技术检查 + 节拍布局审计 + 手机尺寸联览。异常时退出码 1。"""
import argparse
import json
import math
import re
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

from playwright.sync_api import sync_playwright

from audit import SIGNOFF, audit_text, lint_copy, pending_signoff, validate_script


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--frames", type=int, default=12)
    ap.add_argument("--skip-layout", action="store_true")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    s = json.loads((ep / "script.json").read_text("utf-8"))
    dur = s["duration"]
    video = ep / "out" / s.get("output", f"{ep.name}.mp4")
    if not video.exists():
        sys.exit(f"找不到成片 {video}，先运行 compose.py")
    qa = ep / "out" / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    report = [f"# QA 报告 · {s.get('title', ep.name)}", ""]
    fails = validate_script(s)
    if fails:
        report.append("- 脚本结构: " + "；".join(fails))
    pending = pending_signoff(s)
    legacy = s.get("factcheck_legacy")
    if legacy:
        report.append(f"- 事实核查: 已归档（{legacy.get('since', '')}）— {legacy.get('reason', '')}")
    elif pending:
        report.append(f"- 事实核查: {len(pending)} 条已核，{SIGNOFF}（逐条见 script.json 的 sources.reviewer）")
    else:
        report.append("- 事实核查: 已有签字或无需签字")
    _, copy_soft = lint_copy(s)
    if copy_soft:
        report.append(f"- 文案精度: {len(copy_soft)} 处待确认（铁律 14，口语化不得降精度）")
        report.extend(f"  - {item}" for item in copy_soft)
    else:
        report.append("- 文案精度: 无问题")
    music = s.get("music") or {}
    if music:
        report.append(f"- 音乐网格: {music['bpm']} BPM，每拍 {60/music['bpm']:.4f}s，offset {music.get('offset', 0):.4f}s，{music.get('beats_per_bar', 4)} 拍/小节")
        report.append("- 硬卡点: " + "，".join(music.get("hard_cues", [])))

    probe = sh(["ffprobe", "-v", "quiet", "-count_frames", "-print_format", "json", "-show_format", "-show_streams", str(video)])
    if probe.returncode:
        sys.exit(probe.stderr)
    info = json.loads(probe.stdout)
    v = next(x for x in info["streams"] if x["codec_type"] == "video")
    real_dur = float(info["format"]["duration"])
    fps = float(Fraction(v["r_frame_rate"]))
    expected = int(round(dur * s["fps"]))
    decoded = int(v.get("nb_read_frames") or v.get("nb_frames") or 0)
    report.append(f"- 分辨率: {v['width']}x{v['height']}（要求 1080x1440）")
    report.append(f"- 帧率: {fps:.2f}（要求 {s['fps']}）")
    report.append(f"- 时长: {real_dur:.2f}s（标称 {dur}s，偏差 {abs(real_dur-dur):.2f}s）")
    report.append(f"- 解码帧数: {decoded}（要求 {expected}）")
    if v["width"] != 1080 or v["height"] != 1440: fails.append("分辨率错误")
    if abs(fps - s["fps"]) > .01: fails.append("帧率错误")
    if abs(real_dur - dur) > .25: fails.append("时长偏差超 0.25s")
    if decoded != expected: fails.append(f"帧数 {decoded}≠{expected}")

    n = args.frames
    for i in range(n):
        t = dur * (i + .5) / n
        sh(["ffmpeg", "-y", "-v", "quiet", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1", str(qa / f"f{i:02d}_{t:04.1f}s.jpg")])
    report.append(f"- 全片均匀抽帧 {n} 张 → out/qa/")

    beats = s.get("beats", [])
    if beats:
        for i, beat in enumerate(beats):
            t = (beat["start"] + beat["end"]) / 2
            sh(["ffmpeg", "-y", "-v", "quiet", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1", str(qa / f"beat_{i:02d}.jpg")])
        rows = math.ceil(len(beats) / 6)
        contact = sh(["ffmpeg", "-y", "-v", "error", "-framerate", "1", "-pattern_type", "glob", "-i", str(qa / "beat_*.jpg"),
                      "-vf", f"scale=270:360,tile=6x{rows}:margin=12:padding=8:color=0xE7DCCB", "-frames:v", "1", str(qa / "beats_contact.jpg")])
        if contact.returncode: fails.append("节拍联览生成失败: " + contact.stderr[-300:])
        report.append(f"- 每拍成片抽帧 {len(beats)} 张 + 手机尺寸联览 beats_contact.jpg")

    if beats and not args.skip_layout:
        layout_problems = []
        errors = []
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--force-color-profile=srgb", "--disable-lcd-text"])
            page = browser.new_page(viewport={"width": 1080, "height": 1440})
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto((ep / "stage.html").as_uri())
            page.wait_for_function("document.title === 'ready' && !!window.__seek", timeout=30000)
            page.evaluate("document.fonts && document.fonts.ready")
            for i, beat in enumerate(beats):
                mid = (beat["start"] + beat["end"]) / 2
                for suffix, t in (("a", beat["start"] + .12), ("b", mid), ("c", max(mid, beat["end"] - .12))):
                    page.evaluate(f"window.__seek({t:.6f})")
                    page.wait_for_function("!window.__ASSETS_PENDING", timeout=30000)
                    page.evaluate(f"window.__seek({t:.6f})")
                    audit = page.evaluate("window.__audit()")
                    for problem in audit_text(audit["text"]):
                        layout_problems.append(f"{beat['id']}/{suffix} {t:.2f}s: {problem}")
                    page.screenshot(path=str(qa / f"layout_{i:02d}{suffix}.png"), type="png")
            browser.close()
        layout_problems.extend("JS: " + e for e in errors[:10])
        (qa / "layout_audit.json").write_text(json.dumps(layout_problems, ensure_ascii=False, indent=2), "utf-8")
        report.append(f"- 节拍布局审计: {len(beats)*3} 帧，{len(layout_problems)} 项异常")
        fails.extend(layout_problems)

    r = sh(["ffmpeg", "-v", "info", "-i", str(video), "-vf", "blackdetect=d=0.12:pix_th=0.08", "-an", "-f", "null", "-"])
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr)
    bt = sum(float(b) - float(a) for a, b in blacks)
    report.append(f"- 黑场: {bt:.2f}s {[f'{a}~{b}' for a,b in blacks]}")
    if bt > .4: fails.append(f"黑场 {bt:.1f}s")

    r = sh(["ffmpeg", "-v", "info", "-i", str(video), "-vf", "freezedetect=n=0.0018:d=1.6", "-an", "-f", "null", "-"])
    freezes = re.findall(r"freeze_start:([\d.]+) freeze_duration:([\d.]+)", r.stderr)
    body_freezes = [(a, b) for a, b in freezes if float(a) < dur - 8]
    ft = sum(float(d) for _, d in body_freezes)
    report.append(f"- 非结尾冻帧: {ft:.2f}s {[f'{a}s+{b}s' for a,b in freezes]}")
    if ft > 2: fails.append(f"疑似冻帧 {ft:.1f}s")

    r = sh(["ffmpeg", "-v", "info", "-i", str(video), "-af", "ebur128=peak=true", "-f", "null", "-"])
    m1 = re.search(r"Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+)\s*LUFS", r.stderr)
    m2 = re.search(r"True peak:\s*\n\s*Peak:\s*(-?[\d.]+)\s*dB(?:TP|FS)", r.stderr)
    if m1 and m2:
        loudness, peak = float(m1.group(1)), float(m2.group(1))
        report.append(f"- 响度: {loudness:.1f} LUFS（目标 -14±0.7），真峰 {peak:.1f} dBTP（上限 -1.5）")
        if not -14.7 <= loudness <= -13.3: fails.append(f"响度 {loudness:.1f} LUFS 超目标")
        if peak > -1.5: fails.append(f"真峰 {peak:.1f} dBTP 超上限")
    else:
        fails.append("响度解析失败")
    report.append("- 动作音效: " + ("，".join(f"{x.get('id', '?')}@{x['t']}s:{x['name']}" for x in s.get("sfx", [])) or "无"))

    root = Path(__file__).resolve().parent.parent
    manifest_path = root / "reference" / "anatomy" / "MANIFEST.json"
    manifest = json.loads(manifest_path.read_text("utf-8")) if manifest_path.exists() else {"plates": []}
    allowed = {}
    for item in manifest.get("plates", []):
        allowed[item.get("file", "")] = item
        allowed[(root / item.get("file", "")).resolve().as_posix()] = item
    used = set(re.findall(r"reference/anatomy/plates/[^'\"\s)]+", (ep / "story.js").read_text("utf-8")))
    for rel in sorted(used):
        item = allowed.get(rel)
        if not item:
            fails.append(f"解剖素材未登记 {rel}")
            continue
        if item.get("license") not in {"CC0", "CC-BY", "CC-BY-SA", "ORIGINAL", "LICENSED"}:
            fails.append(f"解剖素材许可不可用 {rel}")
        if item.get("license") in {"CC-BY", "CC-BY-SA"} and not item.get("attribution"):
            fails.append(f"解剖素材缺署名 {rel}")
    report.append("- 解剖素材: " + (", ".join(sorted(used)) if used else "未使用外部素材"))
    report += ["", "## 人工发布复核（自动检查不能替代）", "- 逐拍因果、首次标注、比喻真实含义与老年阅读速度", "- 连续转场、动作落点、音效同步与 BGM 情绪", "", "## 结论", "通过 ✓" if not fails else "未通过 ✗: " + "; ".join(fails)]
    (qa / "report.txt").write_text("\n".join(report), "utf-8")
    print("\n".join(report))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
