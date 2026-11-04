#!/usr/bin/env python3
"""从已生成的台词音频算出这一期的时间轴（cues.json）。

有的期没有现成录音，而是用克隆音色逐句生成（`~/dev/tts/gen_voice.py`）。
生成出来的是一句一个文件，没有时间轴；这个脚本把它接起来：

  voice/text.txt        每行「编号 \t 台词」—— 也是字幕原文
  voice_src/vNNN.wav    克隆音色原始输出（可能带首尾静音）
  → voice/vNNN.wav      去掉首尾静音，24kHz 单声道，compose 直接用
  → cues.json           每句的 t / end / text
  → beats.src.json      只更新 duration（拍长由 import_cues 按 cue 边界算）

句间留白 `GAP` 是给观众喘气的：这片子是讲给上了年纪的人听的，句子之间要留
够时间让他把上一句咽下去，再接下一句。改小会明显变「赶」。

用法：
  python3 pipeline/build_cues.py episodes/ep007-thyroid --lead 1.0 --gap 0.42
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

TAIL = 6.6  # 片尾卡停留（秒）


def dur(p: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        capture_output=True,
        text=True,
    )
    return float(r.stdout.strip() or 0)


def trim(src: Path, out: Path):
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af",
            "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse",
            "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", str(out),
        ],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--lead", type=float, default=1.0, help="第一句入点（留白）")
    ap.add_argument("--gap", type=float, default=0.42, help="句间留白")
    ap.add_argument("--tail", type=float, default=TAIL)
    ap.add_argument("--dry", action="store_true", help="只打印时长，不写文件")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    rows = []
    for line in (ep / "voice" / "text.txt").read_text("utf-8").splitlines():
        if not line.strip():
            continue
        idx, text = line.split("\t", 1)
        rows.append((int(idx), text.strip()))

    src_dir = ep / "voice_src"
    out_dir = ep / "voice"
    if not out_dir.exists():
        out_dir.mkdir()

    cues, cur, missing = [], args.lead, []
    for idx, text in rows:
        src = src_dir / f"v{idx:03d}.wav"
        if not src.exists():
            missing.append(src.name)
            continue
        fin = out_dir / f"v{idx:03d}.wav"
        if not args.dry:
            trim(src, fin)
        d = dur(fin) if fin.exists() else 0.0
        cues.append({"t": round(cur, 3), "end": round(cur + d, 3), "text": text})
        cur += d + args.gap

    if missing:
        sys.exit(f"缺 {len(missing)} 句：{', '.join(missing[:6])} … 先跑 gen_voice.py")

    total = round(cues[-1]["end"] + args.tail, 2)
    print(f"{len(cues)} 句 / 语音 {cues[-1]['end']:.2f}s / 成片 {total:.2f}s")
    lengths = [c["end"] - c["t"] for c in cues]
    print(f"单句 {min(lengths):.2f}–{max(lengths):.2f}s，平均 {sum(lengths)/len(lengths):.2f}s")
    if not args.dry:
        (ep / "cues.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2) + "\n", "utf-8")
        track = [
            {"file": f"voice/v{i:03d}.wav", "t": c["t"], "gain": 1.0}
            for i, c in enumerate(cues)
        ]
        (ep / "voice_track.json").write_text(json.dumps(track, ensure_ascii=False, indent=2) + "\n", "utf-8")
        bp = ep / "beats.src.json"
        if bp.exists():
            src = json.loads(bp.read_text("utf-8"))
            src["duration"] = total
            bp.write_text(json.dumps(src, ensure_ascii=False, indent=2) + "\n", "utf-8")
        print(f"已写 {ep / 'cues.json'}，并把 duration 改成 {total}")


if __name__ == "__main__":
    main()
