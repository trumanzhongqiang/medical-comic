#!/usr/bin/env python3
"""量一下成片里每个音效到底响在哪：把 script 里的音效按参数摆成一条独立轨，
再测每一处上升沿相对于拍点的偏差。

用法：
  python3 pipeline/check_sfx_sync.py episodes/ep002-blood-sugar-report
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SFX_DIRS = [ROOT / "assets" / "audio" / "sfx", ROOT / "assets" / "audio" / "sfx_ext"]


def find(name):
    for d in SFX_DIRS:
        for ext in (".wav", ".mp3", ".m4a", ".aac", ".ogg"):
            p = d / (name + ext)
            if p.exists():
                return p
    sys.exit(f"缺素材 {name}")


def main():
    ep = Path(sys.argv[1]).resolve()
    s = json.loads((ep / "script.json").read_text("utf-8"))
    dur = float(s["duration"])
    sfx = s["sfx"]

    inputs, chains, labels = [], [], []
    for k, fx in enumerate(sfx):
        p = find(fx["name"])
        inputs += ["-i", str(p)]
        lead = float(fx.get("lead", 0))
        place = fx["t"] - lead
        skip = lead
        if place < 0:
            skip += -place
            place = 0.0
        ms = round(place * 1000)
        chains.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,"
                      f"atrim=start={skip:.3f},asetpts=PTS-STARTPTS,"
                      f"apad,atrim=0:{dur:.3f},adelay={ms}|{ms}[s{k}]")
        labels.append(f"[s{k}]")
    chains.append("".join(labels) + f"amix=inputs={len(labels)}:duration=longest:normalize=0[aout]")
    out = Path("/tmp") / f"sfxbus_{ep.name}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(chains),
                    "-map", "[aout]", "-ac", "1", "-ar", "8000", "-c:a", "pcm_s16le", str(out)], check=True)

    w = wave.open(str(out))
    import numpy as np
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    sr = w.getframerate()
    win = int(0.01 * sr)
    k = len(x) // win
    e = np.sqrt((x[:k * win].reshape(k, win) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(e)

    print(f"{'拍点':>7} {'实测起音':>9} {'偏差':>7}  音效")
    worst = 0.0
    for fx in sfx:
        t = fx["t"]
        i = int(t / 0.01)
        lo, hi = max(0, i - 10), min(len(db), i + 60)
        seg = db[lo:hi]
        thr = seg.max() - 20  # 这一处比本段峰值低 20 dB 算起音
        hit = lo + int(np.argmax(seg > thr))
        got = hit * 0.01
        d = got - t
        worst = max(worst, abs(d))
        print(f"{t:7.2f} {got:9.2f} {d:+7.2f}  {fx['name']}")
    print(f"\n最大偏差 {worst:.2f}s（目标 ≤ 0.10s）")


if __name__ == "__main__":
    main()
