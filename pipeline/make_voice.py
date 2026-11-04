#!/usr/bin/env python3
"""v2 旁白：一句一音频，按拍预算落位。

流程：
  1) pipeline/build_beats.py       → voice/text.txt（每句一行，带编号）
  2) ~/dev/tts/gen_voice.py <ep>   → voice_src/v000.wav …（克隆音色原始输出）
  3) python3 pipeline/make_voice.py <ep> --write
       去首尾静音 → 必要时 atempo 收进本拍预算 → voice/v000.wav
       同时把每句的入点写回 script.json 的 beats[].subs，并重发 Remotion 数据

字幕 = 旁白原文逐句；画面只放名词牌 / 数值卡。两者不再共用同一句话。
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_beats import emit_ts  # noqa: E402

LEAD = 0.18
GAP = 0.11
MAX_TEMPO = 1.24
BASE_TEMPO = 1.08   # 克隆音色偏慢，全片统一提一点速，听起来才不拖
SLACK = 0.3


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


def tempo(src: Path, out: Path, k: float):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", f"atempo={k:.4f}",
         "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", str(out)],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--plan", action="store_true")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    sp = ep / "script.json"
    script = json.loads(sp.read_text("utf-8"))
    src_dir = ep / "voice_src"
    out_dir = ep / "voice"
    if not out_dir.exists():
        out_dir.mkdir()

    idx, problems, voice = 0, [], []
    print(f"{'拍':>3} {'入点':>7} {'可用':>5} {'句':>3} {'时长':>5} {'tempo':>6}")
    for bi, b in enumerate(script["beats"]):
        avail = b["end"] - b["start"] - SLACK
        first = idx
        items = []
        for _ in b["clauses"]:
            raw = src_dir / f"v{idx:03d}.wav"
            if not raw.exists():
                problems.append(f"缺 {raw.name}（第 {idx} 句）")
                idx += 1
                items.append(None)
                continue
            items.append(raw)
            idx += 1
        if any(i is None for i in items):
            continue

        tmp = [out_dir / f"_t{i:03d}.wav" for i in range(len(items))]
        for raw, t in zip(items, tmp):
            trim(raw, t)
        ds = [dur(t) for t in tmp]
        total = sum(ds) + GAP * (len(ds) - 1)
        k = BASE_TEMPO if total / BASE_TEMPO > avail * 0.94 else 1.0
        if total / k > avail:
            k = min(MAX_TEMPO, total / avail)
        if total / avail > 1.12:
            problems.append(f"第 {bi} 拍超预算 {total / avail:.2f}×（{total:.2f}s / {avail:.2f}s）")

        subs = []
        cur = b["start"] + LEAD
        for i, (t, d) in enumerate(zip(tmp, ds)):
            fin = out_dir / f"v{first + i:03d}.wav"
            if k > 1.001:
                tempo(t, fin, k)
            else:
                t.replace(fin)
            d2 = d / k
            subs.append({"t": round(cur, 3), "end": round(cur + d2, 3), "text": b["clauses"][i]["text"]})
            # compose.py 需要逐句轨道：文件 + 入点 + 增益
            voice.append({
                "beat": bi,
                "file": f"voice/v{first + i:03d}.wav",
                "t": round(cur, 3),
                "gain": 1.0,
            })
            cur += d2 + GAP
        for t in tmp:
            t.unlink(missing_ok=True)
        print(f"{bi:3d} {b['start'] + LEAD:7.2f} {avail:5.2f} {len(items):3d} {sum(ds):5.2f} {k:6.3f}")
        b["subs"] = subs

    if args.plan:
        return
    for p in problems:
        print("  !", p)
    if args.write:
        script["voice"] = voice
        sp.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", "utf-8")
        emit_ts(script, script["remotion"]["composition"])
        print(f"已写入 {sp}（{len(voice)} 拍 / {idx} 句），并重发 Remotion 数据")


if __name__ == "__main__":
    main()
