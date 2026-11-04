#!/usr/bin/env python3
"""把「已经配好音」的一期接进 Remotion 版式：时间轴不动，只补画面。

有的期是先有音频（cues.json 里每句都有 t/end），再决定画面怎么画。这种期不能
再用 build_beats.py 重排拍长，否则对不上已录的人声。做法是：

  cues.json   每句的时间与字幕原文（音频的真实时间轴，只读）
  beats.src.json   人写的画面表：哪几句合成一拍、这一拍拍什么画面、注解条写什么
  → script.json   拍点取 cue 边界，subs 取 cue 原文，voice 沿用已有人声轨
  → remotion/src/data.ts

用法：
  python3 pipeline/import_cues.py episodes/ep007-thyroid
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_beats import emit_ts  # noqa: E402
from sync_sfx import apply as apply_sfx  # noqa: E402
from build_sfx import apply as apply_plan  # noqa: E402

LEAD = 0.2  # 画面比人声早一点进场

PUNC = "，。；：！？、——"
SUB_MAX = 15  # 一条字幕最多几个字：46 号字一行正好放得下十几个字


def split_sub(text, t0, t1, ci):
    """一句话拆成一到两条字幕，按标点断开，时间按字数分。

    整句三十来个字压成两行，字得缩到 36 号才塞得下，老人看着吃力；
    按分句拆开，每条十几个字，字号能保持 46，读到哪儿跟到哪儿。
    """
    segs, cur = [], ""
    for ch in text:
        cur += ch
        if ch in PUNC:
            segs.append(cur)
            cur = ""
    if cur:
        segs.append(cur)

    groups, g = [], ""
    for seg in segs:
        if g and len(g) + len(seg) > SUB_MAX:
            groups.append(g)
            g = seg
        else:
            g += seg
    if g:
        groups.append(g)

    pieces = []
    for g in groups:
        while len(g) > SUB_MAX:
            pieces.append(g[:SUB_MAX])
            g = g[SUB_MAX:]
        pieces.append(g)
    # 只剩两三个字的尾巴并不比短一截的上一段难读，能并就并回去
    for i in range(len(pieces) - 1, 0, -1):
        if len(pieces[i]) <= 4 and len(pieces[i - 1]) + len(pieces[i]) <= SUB_MAX:
            pieces[i - 1] += pieces[i]
            pieces.pop(i)
    # 硬切之后可能剩一个纯标点（通常就是句号）。它自己占一条字幕，
    # 屏幕上就是空了一瞬，看着像卡住 —— 句尾的句号丢掉，其余的并回上一条。
    for i in range(len(pieces) - 1, 0, -1):
        if all(ch in PUNC for ch in pieces[i]):
            if i == len(pieces) - 1 and pieces[i] == "。":
                pieces.pop(i)
            else:
                pieces[i - 1] += pieces[i]
                pieces.pop(i)

    total = sum(len(p) for p in pieces) or 1
    span = max(0.4, t1 - t0)
    subs, acc = [], t0
    for p in pieces:
        d = span * len(p) / total
        subs.append(
            {"t": round(acc, 3), "end": round(acc + d, 3), "text": p, "c": ci, "ct": round(t0, 3), "ce": round(t1, 3)}
        )
        acc += d
    return subs





def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    src = json.loads((ep / "beats.src.json").read_text("utf-8"))
    cues = json.loads((ep / "cues.json").read_text("utf-8"))
    sp = ep / "script.json"
    script = json.loads(sp.read_text("utf-8"))

    beats = []
    for i, b in enumerate(src["beats"]):
        idxs = b["cues"]
        first = cues[idxs[0]]
        start = 0.0 if i == 0 else max(0.0, first["t"] - LEAD)
        # c = 这句属于本拍第几句（cue 序号）；k = 它在本拍里是第几条字幕。
        # 一句话被拆成两三条字幕时，c 不变、k 递增 —— 画面想「跟着字幕走」就用 k。
        subs = []
        if not b.get("silent"):
            for ci, k in enumerate(idxs):
                for x in split_sub(cues[k]["text"], cues[k]["t"], cues[k]["end"], ci):
                    x["k"] = len(subs)
                    subs.append(x)
        beats.append(
            {
                "id": b.get("id") or f"b{i:02d}",
                "start": round(start, 3),
                "end": 0.0,  # 下面按下一拍的起点补
                "scene": b["scene"],
                "note": b.get("note"),
                "cue": None,
                "subs": subs,
            }
        )
    for i in range(len(beats) - 1):
        beats[i]["end"] = round(beats[i + 1]["start"], 3)
    beats[-1]["end"] = round(float(src["duration"]), 3)

    sections = [{"start": beats[int(s["beat"])]["start"], "label": s["label"]} for s in src["sections"]]

    track = ep / "voice_track.json"
    if track.exists():
        script["voice"] = json.loads(track.read_text("utf-8"))

    script.update(
        {
            "slug": src["slug"],
            "renderer": "remotion",
            "remotion": {"composition": src["composition"]},
            "title": src["title"],
            "episode": src.get("episode"),
            "fps": 60,
            "duration": round(float(src["duration"]), 2),
            "frame_format": "jpg",
            "sections": sections,
            "beats": beats,
            "ending": src.get("ending") or {},
            # 人声几乎铺满全片，侧链要轻：压太多就会「说话时掉、说完又涨」
            "voice_ducking": {"threshold": 0.06, "ratio": 2.0, "attack": 30, "release": 700},
            # 底噪全程恒定一条线，不跟着人声涨落
            "bgm_envelope": [[0, 0.52], [round(float(src["duration"]), 2), 0.52]],
            "bgm_volume": 0.15,
        }
    )
    # 拍起点是按人声重算的，音效表必须跟着重钉，否则整张表还停在上一版时间轴上。
    # 有 sfx.plan.json 的期按画面动作铺（一页几个动作几个声音），没有的退回「一拍一个」。
    # 音效基准：−13 dB 比人声低一档，动作音只是「点一下」，不能盖住旁白
    music = script.setdefault("music", {})
    music["sfx_normalize"] = {"target_peak_db": -13.0, "intensity_curve": 0.55}
    sfx = apply_plan(script, ep)
    if sfx is None:
        sfx = apply_sfx(script)
    n_sfx = len(sfx)
    sp.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", "utf-8")
    emit_ts(script, src["composition"])
    print(f"{src['slug']}: {len(beats)} 拍 / {sum(len(b['subs']) for b in beats)} 句字幕 / {n_sfx} 个音效 / {script['duration']:.2f}s")


if __name__ == "__main__":
    main()
