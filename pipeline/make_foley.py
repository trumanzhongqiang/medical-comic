#!/usr/bin/env python3
"""拟物音效：声音要像那个东西，而不是像一段音乐。

原来的「空灵音阶」池（pop / ping / sweep / sparkle）是给 BGM 卡点用的，
它的重心在 1.3–8.6 kHz（pop 有 68% 的能量在 4 kHz 以上），配到画面上既对不上动作，
手机外放又尖。这里补一批重心在 200–1500 Hz 的实物声：

  paper   翻纸 / 报告单落桌
  stamp   盖章（正常、超标这类判定章）
  tap     轻叩（碗、杯子、卡片落下）
  tick    极短提示（标签逐一出现）
  wood-roll  三音木琴上行（柱子依次长出来）
  ding    柔和铃（对上、确认）
  sweep-soft 低通气声（尺子、时间窗展开）
  shutter 相机快门（柔和版，替换高频版）

用法：
  python3 pipeline/make_foley.py            # 只补缺的
  python3 pipeline/make_foley.py --force    # 全部重做
"""
import argparse
import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "audio" / "sfx"
SR = 48000


def _noise(n, seed):
    rnd = random.Random(seed)
    return [rnd.uniform(-1, 1) for _ in range(n)]


def _band(x, lo, hi, order=3):
    """一阶高通 + 三阶低通级联。

    一阶低通在 8 kHz 只掉 12 dB，白噪声的上半段照样听得见，成品就是「嘶」的一声。
    级联三节后斜率达到 18 dB/oct，重心才能真正压到 1–2 kHz。
    """
    a_lo = math.exp(-2 * math.pi * hi / SR)
    a_hi = math.exp(-2 * math.pi * lo / SR)
    out, lp, prev_in, prev_hp = [], [0.0] * order, 0.0, 0.0
    for v in x:
        y = v
        for j in range(order):
            lp[j] = (1 - a_lo) * y + a_lo * lp[j]
            y = lp[j]
        hp = a_hi * (prev_hp + y - prev_in)
        prev_in, prev_hp = y, hp
        out.append(hp)
    return out


def _tone(freq, dur, decay, amp=1.0, partials=((1.0, 1.0),)):
    n = int(SR * dur)
    out = [0.0] * n
    for k in range(n):
        t = k / SR
        e = math.exp(-t / decay)
        v = 0.0
        for mult, g in partials:
            v += g * math.sin(2 * math.pi * freq * mult * t)
        out[k] = v * e * amp
    return out


def _fade(x, ms=6):
    n = min(len(x), int(SR * ms / 1000))
    for i in range(n):
        k = i / n
        x[i] *= k
        x[-1 - i] *= k
    return x


def _mix(*layers):
    dur = max(off + len(x) / SR for off, x, _ in layers)
    out = [0.0] * int(SR * dur)
    for off, x, g in layers:
        s = int(off * SR)
        for i, v in enumerate(x):
            if s + i < len(out):
                out[s + i] += v * g
    return out


def _norm(x, peak_db=-6.0):
    pk = max(abs(v) for v in x) or 1e-9
    g = (10 ** (peak_db / 20)) / pk
    return [v * g for v in x]


def _write(name, mono):
    data = bytearray()
    for v in mono:
        s = max(-32767, min(32767, int(v * 32767)))
        data += struct.pack("<hh", s, s)
    p = OUT / f"{name}.wav"
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(data))
    return p


def build(force=False):
    jobs = {}

    # 翻纸：两下短摩擦，第二下更轻
    a = _band(_noise(int(SR * 0.07), 11), 700, 2200)
    a = [(v * (1 - i / len(a)) ** 2.2) for i, v in enumerate(a)]
    b = _band(_noise(int(SR * 0.05), 12), 650, 1900)
    b = [(v * (1 - i / len(b)) ** 2.2) for i, v in enumerate(b)]
    jobs["paper"] = _norm(_fade(_mix((0.0, a, 1.0), (0.075, b, 0.55))), -8.0)

    # 盖章：低频闷击 + 一点点纸面撞击
    thud = _tone(120, 0.26, 0.055, 1.0, ((1.0, 1.0), (1.7, 0.28)))
    click = _band(_noise(int(SR * 0.02), 21), 400, 1400)
    click = [(v * (1 - i / len(click)) ** 3) for i, v in enumerate(click)]
    jobs["stamp"] = _norm(_fade(_mix((0.0, thud, 1.0), (0.0, click, 0.55))), -6.0)

    # 轻叩：木头/陶瓷放下的那一下
    jobs["tap"] = _norm(
        _fade(_mix((0.0, _tone(260, 0.12, 0.028, 1.0, ((1.0, 1.0), (2.1, 0.35))), 1.0),
                  (0.0, _band(_noise(int(SR * 0.008), 31), 300, 1200), 0.3))),
        -9.0,
    )

    # 提示：极短、低重心，标签一个个出来时用
    jobs["tick"] = _norm(
        _fade(_mix((0.0, _tone(700, 0.05, 0.010, 1.0, ((1.0, 1.0), (1.9, 0.3))), 1.0)), 5),
        -12.0,
    )

    # 木琴三音上行：柱子依次长出来
    notes = (392.0, 523.25, 659.25)
    layers = []
    for i, f in enumerate(notes):
        layers.append((i * 0.16, _tone(f, 0.5, 0.085, 1.0, ((1.0, 1.0), (3.0, 0.22))), 1.0 - i * 0.18))
    jobs["wood-roll"] = _norm(_fade(_mix(*layers)), -8.0)

    # 柔和铃：确认、对上
    jobs["ding"] = _norm(
        _fade(_mix((0.0, _tone(660, 0.9, 0.24, 1.0, ((1.0, 1.0), (2.0, 0.3), (3.0, 0.08))), 1.0)), 20),
        -8.0,
    )

    # 低通气声：尺子、时间窗铺开
    n = int(SR * 0.75)
    src = _noise(n, 41)
    sweep = []
    lp = [0.0, 0.0, 0.0]
    for i, v in enumerate(src):
        k = i / n
        fc = 240 * (900 / 240) ** k
        a_lo = math.exp(-2 * math.pi * fc / SR)
        y = v
        for j in range(3):
            lp[j] = (1 - a_lo) * y + a_lo * lp[j]
            y = lp[j]
        env = math.sin(math.pi * k) ** 1.6
        sweep.append(y * env)
    jobs["sweep-soft"] = _norm(_fade(_mix((0.0, sweep, 1.0))), -10.0)

    # 快门（柔和版）：两声机械帘幕，重心压到 1–3 kHz
    s1 = _band(_noise(int(SR * 0.06), 51), 900, 2400)
    s1 = [(v * (1 - i / len(s1)) ** 2.6) for i, v in enumerate(s1)]
    s2 = _band(_noise(int(SR * 0.08), 52), 550, 1400)
    s2 = [(v * (1 - i / len(s2)) ** 2.2) for i, v in enumerate(s2)]
    jobs["shutter"] = _norm(_fade(_mix((0.0, s1, 1.0), (0.05, s2, 0.7))), -6.0)

    written, skipped = [], []
    for name, mono in jobs.items():
        p = OUT / f"{name}.wav"
        if p.exists() and not force:
            skipped.append(name)
            continue
        _write(name, mono)
        written.append(name)
    print(f"生成 {len(written)} 个，跳过 {len(skipped)} 个 -> {OUT}")
    if written:
        print("  " + " ".join(sorted(written)))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    build(force=ap.parse_args().force)
