#!/usr/bin/env python3
"""生成「空灵音阶」音效库：F 大调五声、可卡点的铃/拨弦与音阶跑动。

为什么自己合成：现成素材要么是噪声音效（whoosh/latch/click），要么音高不在 BGM 的调上。
本期 BGM 经频谱分析为 F 大调（F、C 为最强音级），因此音效统一用 F 大调五声音阶
（F G A C D），落在 77 BPM 的十六分音符网格上，才能和音乐咬合、不打架。

产物写入 assets/audio/sfx/，命名：
  air-N     1.8s 空灵铃，长混响尾，用于关键揭示
  ping-N    0.55s 拨弦，短促，用于密集卡点
  run-up-/run-down-  4 音十六分跑动（一拍内完成），升/降调
  tri-up-/tri-down-  3 音八分跑动
  shimmer   高频闪烁簇，用于"发光/能量"
  swell     气声上扬，用于转场进入
  sink      气声下落，用于减弱/失效
  sub       低频闷击 + 铃，用于受阻/打击
  impact    低频 + 铃的柔和重音，用于免疫攻击

用法：
  python3 pipeline/make_sfx.py            # 全量生成
  python3 pipeline/make_sfx.py --force    # 覆盖已有文件
"""
import argparse
import math
from pathlib import Path
import random
import struct
import wave

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "audio" / "sfx"
SR = 48000

# F 大调五声音阶，从 F5 起两个八度（1..8）
SCALE = {
    1: 698.456,   # F5
    2: 783.991,   # G5
    3: 880.000,   # A5
    4: 1046.502,  # C6
    5: 1174.659,  # D6
    6: 1396.913,  # F6
    7: 1567.982,  # G6
    8: 1760.000,  # A6
}
SIXTEENTH = 60.0 / 77 / 4      # 77 BPM 的十六分音符 = 0.1948s

# 铃：基音强、泛音快速衰减，非整数泛音负责"玻璃感"
BELL = [(1.00, 1.00, 1.00), (2.00, 0.34, 0.58), (2.99, 0.17, 0.42),
        (4.07, 0.095, 0.30), (5.44, 0.055, 0.20), (7.09, 0.028, 0.14)]
# 拨弦/kalimba：泛音少、衰减快
PLUCK = [(1.00, 1.00, 1.00), (3.93, 0.28, 0.40), (9.17, 0.08, 0.22)]


def _reverb(mono, wet=0.45, feedback=0.84, damp=0.22):
    """Schroeder 混响：4 并联梳状 + 2 串联全通，制造空间尾。"""
    n = len(mono)
    combs = [(int(d * SR), 0.0, 0.0) for d in (0.0253, 0.0269, 0.0290, 0.0307)]
    buf = [[0.0] * d for d, _, _ in combs]
    idx = [0] * len(combs)
    lp = [0.0] * len(combs)
    acc = [0.0] * n
    for i in range(n):
        x = mono[i]
        s = 0.0
        for c, (d, _, _) in enumerate(combs):
            y = buf[c][idx[c]]
            lp[c] = y * (1 - damp) + lp[c] * damp
            buf[c][idx[c]] = x + lp[c] * feedback
            idx[c] = (idx[c] + 1) % d
            s += y
        acc[i] = s * 0.25
    for d in (0.0126, 0.0100):
        d = int(d * SR)
        b = [0.0] * d
        j = 0
        for i in range(n):
            delayed = b[j]
            y = -acc[i] + delayed
            b[j] = acc[i] + delayed * 0.5
            acc[i] = y
            j = (j + 1) % d
    return acc, wet


def _tone(freq, dur, partials, tau, attack, drift, phase_seed=0.0):
    """一个音：加性合成 + 指数衰减 + 起音音高微漂，返回 (L, R)。"""
    n = int(SR * dur)
    left = [0.0] * n
    right = [0.0] * n
    sin = math.sin
    exp = math.exp
    two_pi = 2 * math.pi
    for ratio, amp, dscale in partials:
        f = freq * ratio
        if f > SR * 0.45:
            continue
        t_part = tau * dscale
        # 右声道轻微失谐，制造宽度
        f_r = f * 1.0016
        for i in range(n):
            t = i / SR
            # 起音瞬间偏高 drift，随后落到基频：铃的"叮"
            bend = 1.0 + drift * exp(-t / 0.075)
            env = exp(-t / t_part)
            if t < attack:
                env *= 0.5 - 0.5 * math.cos(math.pi * t / attack)
            left[i] += amp * env * sin(two_pi * f * bend * t + phase_seed)
            right[i] += amp * env * sin(two_pi * f_r * bend * t + phase_seed + 1.1)
    return left, right


def _add(dst, src, offset=0, gain=1.0):
    for i, v in enumerate(src):
        j = offset + i
        if j >= len(dst):
            break
        dst[j] += v * gain


def _finish(left, right, wet=0.45, peak_db=-3.0):
    """加混响、尾部淡出、峰值归一，返回可直接写盘的两声道。"""
    n = len(left)
    mono = [(left[i] + right[i]) * 0.5 for i in range(n)]
    rev, w = _reverb(mono, wet=wet)
    for i in range(n):
        left[i] += rev[i] * w
        right[i] += rev[i] * w
    fade = int(0.12 * SR)
    for i in range(max(0, n - fade), n):
        k = (n - i) / fade
        left[i] *= k
        right[i] *= k
    peak = max(max(abs(v) for v in left), max(abs(v) for v in right)) or 1.0
    g = (10 ** (peak_db / 20)) / peak
    return [v * g for v in left], [v * g for v in right]


def _render(parts, dur, wet=0.45, peak_db=-3.0):
    """parts: [(offset_sec, freq, partials, tau, attack, drift, gain)] → 立体声 wav 数据"""
    n = int(SR * dur)
    left = [0.0] * n
    right = [0.0] * n
    for off, freq, partials, tau, attack, drift, g in parts:
        l, r = _tone(freq, min(dur - off, 3.0), partials, tau, attack, drift)
        _add(left, l, int(off * SR), g)
        _add(right, r, int(off * SR), g)
    return _finish(left, right, wet=wet, peak_db=peak_db)


def _noise(n, seed=1):
    rnd = random.Random(seed)
    return [rnd.uniform(-1.0, 1.0) for _ in range(n)]


def _bandpass(x, fc_at, q=1.2, block=64):
    """TPT 状态变量带通，中心频率按 0..1 归一位置时变，系数每 block 更新一次。"""
    n = len(x)
    out = [0.0] * n
    ic1 = ic2 = 0.0
    a1 = a2 = a3 = 0.0
    k = 1.0 / q
    for i in range(n):
        if i % block == 0:
            fc = min(max(fc_at(i / n), 60.0), 0.44 * SR)
            g = math.tan(math.pi * fc / SR)
            a1 = 1.0 / (1.0 + g * (g + k))
            a2 = g * a1
            a3 = g * a2
        v3 = x[i] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[i] = v1
    return out


def _sweep_tone(f_at, dur, harmonics=((1, 1.0),), amp_at=None):
    """连续音高扫频：f_at(t) 给出瞬时频率，比逐个音级更像 riser。"""
    n = int(SR * dur)
    ph = [0.0] * len(harmonics)
    out = [0.0] * n
    two_pi = 2 * math.pi
    for i in range(n):
        t = i / SR
        f = f_at(t)
        s = 0.0
        for j, (ratio, amp) in enumerate(harmonics):
            ph[j] += two_pi * f * ratio / SR
            s += amp * math.sin(ph[j])
        if amp_at is not None:
            s *= amp_at(t, i / n)
        out[i] = s
    return out


def _pan_gains(p):
    """p: -1 左 .. +1 右 → (left, right)，带等功率补偿。"""
    lt = math.cos((p + 1) * math.pi / 4)
    rt = math.sin((p + 1) * math.pi / 4)
    return lt * 1.41, rt * 1.41


def _whoosh(dur, f0, f1, tone0, tone1, pan0, pan1, seed=1,
            q=1.0, lp=None, noise_mix=0.66, tone_mix=0.36):
    """气声扫频 whoosh：带通噪声 + 调内音高，声像从 pan0 移到 pan1。

    q 越窄越像口哨、越宽越像气流。lp 是一阶低通截止：车、门、纸张这类
    「物体移动」的气声原本会把能量堆在 3–6 kHz —— 那是人耳最敏感的一段，
    听起来就是「嘶」。移动类素材把扫频上限压到 3 kHz 以内，再挂一道
    3 kHz 左右的低通，才是空气被推动，而不是哨子被吹响。
    """
    n = int(SR * dur)
    nb = _bandpass(_noise(n, seed), lambda u: f0 * (f1 / f0) ** (u ** 1.25), q=q)
    if lp:
        a = 1.0 - math.exp(-2.0 * math.pi * lp / SR)
        y = 0.0
        for i in range(n):
            y += a * (nb[i] - y)
            nb[i] = y
    tone = _sweep_tone(lambda t: tone0 * (tone1 / tone0) ** (t / dur), dur,
                       ((1, 1.0), (2, 0.18)))
    left = [0.0] * n
    right = [0.0] * n
    for i in range(n):
        u = i / n
        env = math.sin(math.pi * min(1.0, u ** 0.85)) ** 1.3
        s = nb[i] * noise_mix * env + tone[i] * tone_mix * env
        lg, rg = _pan_gains(pan0 + (pan1 - pan0) * u)
        left[i] = s * lg
        right[i] = s * rg
    return left, right


def _riser(dur, f_lo, f_hi, seed=5):
    """蓄力 riser：先慢后陡（指数曲线），滤波开、音高上行一个八度。"""
    n = int(SR * dur)
    nb_l = _bandpass(_noise(n, seed), lambda u: 380 * (8000 / 380) ** (u ** 1.8), q=1.5)
    nb_r = _bandpass(_noise(n, seed + 77), lambda u: 420 * (8400 / 420) ** (u ** 1.8), q=1.5)
    tl = _sweep_tone(lambda t: f_lo * (f_hi / f_lo) ** ((t / dur) ** 1.8), dur,
                     ((1, 1.0), (2, 0.38), (3, 0.18)))
    tr = _sweep_tone(lambda t: f_lo * 1.002 * (f_hi / f_lo) ** ((t / dur) ** 1.8), dur,
                     ((1, 1.0), (2, 0.38), (3, 0.18)))
    left = [0.0] * n
    right = [0.0] * n
    for i in range(n):
        u = i / n
        amp = u ** 1.45
        if u > 0.93:
            amp *= max(0.0, (1 - u) / 0.07)
        left[i] = nb_l[i] * 0.5 * amp + tl[i] * 0.30 * amp
        right[i] = nb_r[i] * 0.5 * amp + tr[i] * 0.30 * amp
    return left, right


def _downlifter(dur, f_hi, f_lo, seed=9):
    """下落 downlifter：快速下坠后拖长尾，滤波往下关。"""
    n = int(SR * dur)
    nb = _bandpass(_noise(n, seed), lambda u: 6200 * (280 / 6200) ** (u ** 0.55), q=1.1)
    tone = _sweep_tone(lambda t: f_hi * (f_lo / f_hi) ** ((t / dur) ** 0.55), dur,
                       ((1, 1.0), (2, 0.26)))
    left = [0.0] * n
    right = [0.0] * n
    for i in range(n):
        u = i / n
        env = math.exp(-u / 0.34) * (1 - math.exp(-u / 0.012))
        s = nb[i] * 0.55 * env + tone[i] * 0.30 * env
        lg, rg = _pan_gains(0.35 - 0.5 * u)
        left[i] = s * lg
        right[i] = s * rg
    return left, right


def _impact(freq=87.31, seed=3):
    """冲击层：低频下滑 + 高频撞击 + 调内长尾。"""
    dur = 1.2
    n = int(SR * dur)
    left = [0.0] * n
    right = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 96 * math.exp(-t / 0.09) + freq * 0.5
        ph += 2 * math.pi * f / SR
        v = math.sin(ph) * math.exp(-t / 0.40) * (1 - math.exp(-t / 0.003)) * 0.95
        left[i] += v
        right[i] += v
    burst = _bandpass(_noise(int(0.06 * SR), seed), lambda u: 3400.0, q=2.2)
    for i, v in enumerate(burst):
        g = math.exp(-i / SR / 0.010)
        left[i] += v * g * 0.55
        right[i] += v * g * 0.5
    tl, tr = _tone(freq, 1.0, BELL, 0.46, 0.004, 0.006)
    _add(left, tl, 0, 0.5)
    _add(right, tr, 0, 0.5)
    return left, right


def _layer(*layers):
    """按 (offset, left, right, gain) 叠加多层，返回整体。"""
    dur = max(off + len(l) / SR for off, l, _, _ in layers)
    n = int(SR * dur)
    left = [0.0] * n
    right = [0.0] * n
    for off, l, r, g in layers:
        _add(left, l, int(off * SR), g)
        _add(right, r, int(off * SR), g)
    return left, right



def _noise_sweep(dur, f0, f1, gain_env):
    """滤波噪声扫频：用一阶带通近似「气声」，用于 swell / sink。"""
    import random
    random.seed(7)
    n = int(SR * dur)
    out = [0.0] * n
    lp = 0.0
    hp = 0.0
    for i in range(n):
        t = i / SR
        k = t / dur
        fc = f0 * (f1 / f0) ** k
        a = math.exp(-2 * math.pi * fc / SR)
        x = random.uniform(-1, 1)
        lp = (1 - a) * x + a * lp
        hp = lp - (1 - a) * x  # 粗带通
        env = gain_env(k)
        out[i] = hp * env
    return out


def _write(path, left, right):
    data = bytearray()
    for l, r in zip(left, right):
        data += struct.pack("<hh", max(-32767, min(32767, int(l * 32767))),
                           max(-32767, min(32767, int(r * 32767))))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(data))


def build(force=False, only=None):
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = {}

    for i, f in SCALE.items():
        jobs[f"air-{i}"] = _render([(0.0, f, BELL, 0.62, 0.006, 0.010, 1.0)],
                                   dur=1.8, wet=0.5, peak_db=-4.0)
    for i, f in SCALE.items():
        jobs[f"ping-{i}"] = _render([(0.0, f, PLUCK, 0.10, 0.0015, 0.018, 1.0)],
                                    dur=0.55, wet=0.32, peak_db=-3.0)

    def run(notes, step, tau_kind, dur, wet):
        parts = []
        for k, note in enumerate(notes):
            parts.append((k * step, SCALE[note], tau_kind[0], tau_kind[1],
                          tau_kind[2], tau_kind[3], 1.0 - 0.06 * k))
        return _render(parts, dur=dur, wet=wet, peak_db=-3.5)

    jobs["run-up-a"] = run([1, 2, 3, 4], SIXTEENTH, (PLUCK, 0.13, 0.002, 0.016), 0.95, 0.34)
    jobs["run-down-a"] = run([4, 3, 2, 1], SIXTEENTH, (PLUCK, 0.13, 0.002, 0.016), 0.95, 0.34)
    jobs["run-up-b"] = run([4, 5, 6, 8], SIXTEENTH, (BELL, 0.4, 0.004, 0.012), 1.5, 0.45)
    jobs["run-down-b"] = run([8, 6, 5, 4], SIXTEENTH, (BELL, 0.4, 0.004, 0.012), 1.5, 0.45)
    jobs["tri-up"] = run([3, 4, 5], SIXTEENTH * 2, (BELL, 0.5, 0.005, 0.012), 1.6, 0.46)
    jobs["tri-down"] = run([5, 4, 3], SIXTEENTH * 2, (BELL, 0.5, 0.005, 0.012), 1.6, 0.46)

    # shimmer：高频簇 + 长混响
    parts = [(0.0, SCALE[8] * 2, BELL, 0.7, 0.008, 0.006, 0.7),
             (0.04, SCALE[7] * 2, BELL, 0.6, 0.008, 0.006, 0.5),
             (0.10, SCALE[6] * 2, BELL, 0.5, 0.008, 0.006, 0.35)]
    jobs["shimmer"] = _render(parts, dur=1.9, wet=0.6, peak_db=-6.0)

    # swell / sink：气声 + 一个音阶音，营造转场空间感
    for name, f, rev_dir, note in (("swell", 420, 1, 4), ("sink", 1500, -1, 2)):
        dur = 1.05
        left, right = _render([(0.0, SCALE[note], BELL, 0.55, 0.02, 0.008, 0.8)],
                              dur=dur, wet=0.55, peak_db=-6.0)
        noise = _noise_sweep(dur, f if rev_dir > 0 else f, f * (4.2 if rev_dir > 0 else 0.18),
                             lambda k: (k ** 2) * (1 - k) * 4 if rev_dir > 0 else (1 - k) ** 2)
        for i in range(len(left)):
            left[i] += noise[i] * 0.35
            right[i] += noise[i] * 0.35 * 0.8
        jobs[name] = (left, right)

    # sub：低频下滑 + 铃，用于受阻
    dur = 0.95
    n = int(SR * dur)
    left = [0.0] * n
    right = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 92 * math.exp(-t / 0.16) + 34
        ph += 2 * math.pi * f / SR
        env = math.exp(-t / 0.30) * (1 - math.exp(-t / 0.004))
        v = math.sin(ph) * env * 0.9
        left[i] += v
        right[i] += v
    l2, r2 = _tone(SCALE[1], 0.9, BELL, 0.5, 0.006, 0.008)
    _add(left, l2, 0, 0.35)
    _add(right, r2, 0, 0.35)
    mono = [(left[i] + right[i]) * 0.5 for i in range(n)]
    rev, _ = _reverb(mono, wet=0.4)
    for i in range(n):
        left[i] += rev[i] * 0.4
        right[i] += rev[i] * 0.4
    peak = max(max(abs(v) for v in left), max(abs(v) for v in right)) or 1.0
    g = (10 ** (-3.0 / 20)) / peak
    jobs["sub"] = ([v * g for v in left], [v * g for v in right])

    # ── 气声层：移动 / 转场（whoosh）──
    # 移动类（车、门、管子）压低扫频上限 + 低通，避免 3–6 kHz 的「嘶」；
    # 揭示类（reveal）允许更亮，那是转场，本来就该亮一下。
    jobs["move-a"] = _finish(*_whoosh(0.55, 380, 2400, SCALE[3], SCALE[4], -0.55, 0.45, seed=11,
                                      q=1.15, lp=3100, noise_mix=0.5, tone_mix=0.46),
                             wet=0.5, peak_db=-5.0)
    jobs["move-b"] = _finish(*_whoosh(0.78, 300, 1900, SCALE[3], SCALE[5], 0.5, -0.4, seed=13,
                                      q=1.15, lp=2600, noise_mix=0.5, tone_mix=0.46),
                             wet=0.55, peak_db=-5.5)
    jobs["move-c"] = _finish(*_whoosh(0.40, 520, 2800, SCALE[4], SCALE[5], -0.3, 0.4, seed=17,
                                      q=1.15, lp=3000, noise_mix=0.48, tone_mix=0.46),
                             wet=0.42, peak_db=-5.0)

    # ── 蓄力层：riser（音高连续上行一个八度，先慢后陡）──
    jobs["up-a"] = _finish(*_riser(1.558, 174.61, 349.23, seed=5), wet=0.52, peak_db=-6.5)
    jobs["up-b"] = _finish(*_riser(0.779, 349.23, 698.46, seed=6), wet=0.46, peak_db=-6.5)

    # ── 下落层：downlifter ──
    jobs["down-a"] = _finish(*_downlifter(1.30, 698.46, 174.61, seed=9), wet=0.55, peak_db=-6.0)
    jobs["down-b"] = _finish(*_downlifter(0.90, 1046.50, 440.00, seed=10), wet=0.5, peak_db=-6.0)

    # ── 冲击层：impact（低频下滑 + 撞击 + 调内长尾）──
    jobs["hit-a"] = _finish(*_impact(87.31, seed=3), wet=0.42, peak_db=-4.0)   # F2
    jobs["hit-b"] = _finish(*_impact(98.00, seed=4), wet=0.42, peak_db=-4.0)   # G2

    # ── 揭示：whoosh + 铃（标题、进入新空间、结论落定）──
    wl, wr = _whoosh(0.50, 500, 6200, SCALE[3], SCALE[6], -0.5, 0.35, seed=21)
    cl, cr = _tone(SCALE[6], 1.55, BELL, 0.65, 0.006, 0.010)
    jobs["reveal-a"] = _finish(*_layer((0.0, wl, wr, 0.78), (0.13, cl, cr, 0.62)),
                               wet=0.5, peak_db=-5.0)
    wl2, wr2 = _whoosh(0.66, 320, 5000, SCALE[5], SCALE[8], 0.45, -0.3, seed=23)
    cl2, cr2 = _tone(SCALE[8], 1.7, BELL, 0.68, 0.006, 0.010)
    jobs["reveal-b"] = _finish(*_layer((0.0, wl2, wr2, 0.72), (0.16, cl2, cr2, 0.68)),
                               wet=0.54, peak_db=-5.0)

    # 快门：两声短促宽频脉冲（帘幕开合），配「拍一张照片」这个动作
    _s1 = _noise_sweep(0.055, 2400, 5600, lambda k: (1 - k) ** 3)
    _s2 = _noise_sweep(0.085, 900, 2600, lambda k: (1 - k) ** 2.4)
    jobs["shutter"] = _finish(*_layer((0.0, _s1, _s1, 0.95), (0.052, _s2, _s2, 0.66)),
                              wet=0.14, peak_db=-4.5)

    written, skipped = [], []
    for name, (left, right) in jobs.items():
        if only and name not in only:
            continue
        p = OUT / f"{name}.wav"
        if p.exists() and not force:
            skipped.append(name)
            continue
        _write(p, left, right)
        written.append(name)
    print(f"生成 {len(written)} 个，跳过 {len(skipped)} 个 -> {OUT}")
    if written:
        print("  " + " ".join(sorted(written)))
    return written


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="覆盖已有文件")
    ap.add_argument("--only", default="", help="只重建这几个音效，逗号分隔")
    a = ap.parse_args()
    only = {s.strip() for s in a.only.split(",") if s.strip()} or None
    build(force=a.force, only=only)
