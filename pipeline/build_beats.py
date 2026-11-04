#!/usr/bin/env python3
"""v2 文案构建：把 beats.src.json（人写的）编成 script.json（机器用的）+ Remotion 数据。

和 v1 的区别：
- 一拍（beat）不再等于一句话。一拍是「一个画面节点」，里面可以有多句口播。
- 旁白与画面文字彻底分开：
    voice   —— 口播原文，可以有连接词、可以有因果，按句切开当字幕
    note    —— 画面上唯一的说明文字，只放名词 / 数值 / 适用条件，不复述旁白
- 拍长按内容难度定（4/6/8/10 拍），不再一律一小节。

用法：
  python3 pipeline/build_beats.py episodes/ep002-blood-sugar-report          # 写 script.json + voice/text.txt
  python3 pipeline/build_beats.py episodes/ep002-blood-sugar-report --emit   # 只重发 Remotion 数据
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BPM = 77
BEAT = 60 / BPM
OFFSET = 0.5804988662
LEAD = 0.2
GAP = 0.11

DIG = "零一二三四五六七八九"

# 文案里写的提示音名字 → 素材库里真实存在的文件
CUE_ALIAS = {
    "open": "pop",
    "run-up-a": "sweep-up",
    "run-up-b": "rise-rev",
    "impact": "impact-deep",
    "tri-down": "drop",
}


def B(n: float) -> float:
    return OFFSET + n * BEAT


def cn_int(n: int) -> str:
    if n < 10:
        return DIG[n]
    if n < 20:
        return "十" + (DIG[n % 10] if n % 10 else "")
    if n < 100:
        return DIG[n // 10] + "十" + (DIG[n % 10] if n % 10 else "")
    h, r = DIG[n // 100] + "百", n % 100
    if r == 0:
        return h
    return h + ("零" + DIG[r] if r < 10 else cn_int(r))


def spoken(text: str) -> str:
    """把字幕里的阿拉伯数字换成口播时该念的中文。"""
    out = text
    out = re.sub(r"(\d+)\s*/\s*(\d+)", lambda m: f"{cn_int(int(m.group(1)))}比{cn_int(int(m.group(2)))}", out)
    out = re.sub(r"(\d+(?:\.\d+)?)\s*%", lambda m: "百分之" + spoken_num(m.group(1)), out)
    out = re.sub(r"(\d+(?:\.\d+)?)", lambda m: spoken_num(m.group(1)), out)
    return out


def spoken_num(s: str) -> str:
    if "." in s:
        a, b = s.split(".", 1)
        return cn_int(int(a)) + "点" + "".join(DIG[int(c)] for c in b)
    return cn_int(int(s))


def split_clauses(voice: str, limit: int = 30):
    """按句切字幕；一句太长就在最接近中点的逗号处切，保证两行能读完、不断气。"""
    raw = [s for s in re.split(r"(?<=[。！？])", voice.strip()) if s.strip()]
    out = []
    for s in raw:
        s = s.strip()
        while len(s) > limit:
            cuts = [i for i, ch in enumerate(s) if ch in "，；：" and 8 <= i <= len(s) - 8]
            if not cuts:
                break
            cut = min(cuts, key=lambda i: abs(i - len(s) / 2))
            out.append(s[: cut + 1])
            s = s[cut + 1 :]
        out.append(s)
    # 太短的碎片并到邻居，避免字幕闪一下
    merged = []
    for c in out:
        if merged and len(c) < 7:
            merged[-1] += c
        else:
            merged.append(c)
    return [c for c in merged if c]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--emit", action="store_true")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    sp = ep / "script.json"
    src_p = ep / "beats.src.json"
    src = json.loads(src_p.read_text("utf-8"))

    script = json.loads(sp.read_text("utf-8")) if sp.exists() else {}

    beats, cursor = [], 0.0
    for i, b in enumerate(src["beats"]):
        # 拍长按内容定：一句约 4.6 字/秒，凑到 2 拍（半小节）的整数倍。
        # 复杂指标、诊断界值天然会拿到更长的镜头，不再机械地一律一小节。
        if str(b.get("beats", "auto")) == "auto":
            ncl = max(1, len(split_clauses(b["voice"])))
            need = len(b["voice"]) / b.get("rate", src.get("rate", 5.0)) + 0.11 * (ncl - 1) + 0.26
            n = max(int(b.get("min_beats", 4)), int(-(-need / BEAT // 1)))
        else:
            n = int(b["beats"])
        start, end = B(cursor), B(cursor + n)
        clauses = split_clauses(b["voice"])
        beats.append(
            {
                "id": b.get("id") or f"b{i:02d}",
                "start": round(start, 3),
                "end": round(end, 3),
                "scene": b.get("scene", ""),
                "voice": b["voice"],
                "clauses": [{"text": c, "say": spoken(c)} for c in clauses],
                "note": b.get("note") or None,
                "cue": b.get("cue"),
                "subs": [],
            }
        )
        cursor += n

    outro = int(src.get("outro_beats", 8))
    dur = round(B(cursor + outro), 2)

    if not args.emit:
        sections = []
        for s in src["sections"]:
            sections.append({"start": beats[int(s["beat"])]["start"], "label": s["label"]})

        sfx = []
        for i, b in enumerate(beats):
            if b["cue"]:
                sfx.append({"id": f"{b['id']}-cue", "t": round(b["start"], 3), "name": CUE_ALIAS.get(b["cue"], b["cue"]), "gain": 0.12})
        script.update(
            {
                "slug": src["slug"],
                "renderer": "remotion",
                "remotion": {"composition": src["composition"]},
                "title": src["title"],
                "episode": src.get("episode"),
                "fps": 60,
                "duration": dur,
                "frame_format": "jpg",
                "music": {
                    "bpm": BPM,
                    "offset": OFFSET,
                    "beats_per_bar": 4,
                    "sync_tolerance": 0.022,
                    "hard_cues": [s["label"] for s in src["sections"]],
                    "sfx_ducking": {"threshold": 0.06, "ratio": 2.0, "attack": 30, "release": 700},
                    "sfx_normalize": {"target_peak_db": -6.5, "intensity_curve": 0.4},
                },
                "sfx": sfx,
                # 底噪全程一条平线：不让 BGM 自己涨落，只靠侧链轻微让位
                "bgm_envelope": src.get("bgm_envelope") or [[0, 0.52], [dur, 0.52]],
                "fade_in": 2.2,
                "fade_out": 3.2,
                "output": f"{src['slug']}.mp4",
                "sections": sections,
                "beats": beats,
                "ending": src.get("ending") or {},
            }
        )
        script.setdefault("bgm", "bgm.mp3")
        script.setdefault("bgm_start", 0)
        # 0.20：实测 BGM 有效电平约 -31 dBFS，比人声低 11 dB，说话时再让 5 dB
        script.setdefault("bgm_volume", 0.20)
        script.setdefault("bgm_dips", [])
        script.setdefault("voice", [])
        # 人声几乎铺满全片：侧链要轻，压太多会「说话时掉、说完又涨」
        script.setdefault("voice_ducking", {"threshold": 0.06, "ratio": 2.0, "attack": 30, "release": 700})
        sp.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", "utf-8")

        vdir = ep / "voice"
        if not vdir.exists():
            vdir.mkdir()
        rows, k = [], 0
        for b in beats:
            for c in b["clauses"]:
                rows.append(f"{k:03d}\t{c['say']}")
                k += 1
        (vdir / "text.txt").write_text("\n".join(rows) + "\n", "utf-8")
        print(f"{src['slug']}: {len(beats)} 拍 / {k} 句 / {dur:.2f}s → script.json + voice/text.txt")
        return

    # 只重发数据
    script = json.loads(sp.read_text("utf-8"))
    emit_ts(script, src["composition"])
    print("已重发 Remotion 数据")


def emit_ts(script, composition):
    env = ROOT / "remotion" / "src" / "data.ts"
    entry = {
        "id": script["remotion"]["composition"],
        "episode": script.get("episode"),
        "title": script["title"],
        "dur": script["duration"],
        "sections": script.get("sections", []),
        "ending": script.get("ending") or {},
        "beats": [
            {
                "start": b["start"],
                "end": b["end"],
                "scene": b["scene"],
                "subs": b.get("subs") or [],
                "note": b.get("note"),
            }
            for b in script["beats"]
        ],
    }
    # data.ts 是多期的注册表：保留其它期的条目，只替换本期
    text = env.read_text("utf-8") if env.exists() else "// AUTO-GENERATED by pipeline/build_beats.py\nexport const DATA: Record<string, any> = {};\n"
    marker = "export const DATA: Record<string, any> = "
    body = text.split(marker, 1)[1]
    body = body.rstrip().rstrip(";").strip()
    table = json.loads(body) if body.startswith("{") else {}
    table[entry["id"]] = entry
    out = "// AUTO-GENERATED by pipeline/build_beats.py — 不要手改\nexport const DATA: Record<string, any> = " + json.dumps(table, ensure_ascii=False, indent=1) + ";\n"
    env.write_text(out, "utf-8")


if __name__ == "__main__":
    main()
