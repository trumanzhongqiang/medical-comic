#!/usr/bin/env python3
"""把动作音效钉回每一拍的起点。

import_cues.py 会按人声重算每拍的 start，但音效表是更早一版时间轴留下的，
改一遍节奏就整体飘掉（第 2–5 期最多飘了 26 秒，听感是「画面动完了声音才来」）。
这个脚本只做一件事：t = 该拍起点，同时按素材实测起音位置写 lead，
让素材真正出声的那一下正好落在拍点上。

用法：
  python3 pipeline/sync_sfx.py episodes/ep002-blood-sugar-report
  python3 pipeline/sync_sfx.py episodes/ep002-blood-sugar-report --dry
"""
import argparse
import json
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SFX_DIRS = [ROOT / "assets" / "audio" / "sfx", ROOT / "assets" / "audio" / "sfx_ext"]

# 没有历史音效表的期（第 6、7 期）用这套：短促、不抢人声，出场密度跟着拍走
DEFAULT = [
    "pop", "air-deep", "ping-1", "sweep-up", "impact-soft", "air-quick",
    "ping-3", "rise-rev", "impact-deep", "ping-4", "air-slow", "confirm",
    "ping-5", "latch", "sweep-up", "air-quick", "impact-soft",
]
FIRST_T = 0.30   # 第 0 拍从静帧开始，音效略有半个身位
MAX_LEAD = 1.2


def find(name):
    for d in SFX_DIRS:
        for ext in (".wav", ".mp3", ".m4a", ".aac", ".ogg"):
            p = d / (name + ext)
            if p.exists():
                return p
    return None


_ONSET = {}


def onset(path):
    """素材真正出声的时刻（秒）：前面那段静音要先跳过，否则听感永远慢半拍。"""
    key = str(path)
    if key in _ONSET:
        return _ONSET[key]
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", key, "-ac", "1", "-ar", "8000",
                        "-f", "s16le", "-"], capture_output=True)
    data = r.stdout
    n = len(data) // 2
    samples = struct.unpack("<%dh" % n, data) if n else ()
    thr = 300  # 约 -41 dBFS
    hit = 0.0
    for i, v in enumerate(samples):
        if abs(v) > thr:
            hit = i / 8000
            break
    _ONSET[key] = hit
    return hit


def apply(script):
    """就地重建 script['sfx']：一拍一个音效，t 钉在拍起点。"""
    beats = script["beats"]
    old = script.get("sfx") or []

    names = [fx["name"] for fx in old] if old else list(DEFAULT)
    if len(names) < len(beats):
        extra = [n for n in DEFAULT if n not in names] or DEFAULT
        i = 0
        while len(names) < len(beats):
            names.append(extra[i % len(extra)])
            i += 1

    sfx, missing = [], []
    for i, b in enumerate(beats):
        name = names[i]
        src = find(name)
        if src is None:
            missing.append(name)
            continue
        t = round(max(float(b["start"]), FIRST_T if i == 0 else 0.0), 3)
        lead = round(min(MAX_LEAD, onset(src)), 3)
        sfx.append({
            "id": f"{b.get('id') or f'b{i:02d}'}-cue",
            "t": t,
            "name": name,
            "gain": 0.12,
            "lead": lead,
        })

    if missing:
        raise ValueError(f"缺素材：{sorted(set(missing))}")

    script["sfx"] = sfx
    return sfx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    sp = ep / "script.json"
    script = json.loads(sp.read_text("utf-8"))
    sfx = apply(script)

    if args.dry:
        for i, fx in enumerate(sfx):
            print(f"{i:2d} {fx['t']:7.2f} lead={fx['lead']:.2f} {fx['name']}")
        return

    sp.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"{script['slug']}: {len(sfx)} 个音效已对齐到拍点（拍数 {len(script['beats'])}）")


if __name__ == "__main__":
    main()
