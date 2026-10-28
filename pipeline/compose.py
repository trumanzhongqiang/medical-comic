#!/usr/bin/env python3
"""帧序列 + BGM 自动化 + 动作音效 → 60fps MP4；两阶段响度归一。"""
import argparse
import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "assets" / "audio" / "sfx"
SFX_EXT_DIR = ROOT / "assets" / "audio" / "sfx_ext"
SFX_EXT_MANIFEST = SFX_EXT_DIR / "manifest.json"


def _ext_trims():
    """外部素材的响度补偿：噪声类素材峰值高、感听响度低，需要按类别补/减。"""
    if not SFX_EXT_MANIFEST.exists():
        return {}
    try:
        data = json.loads(SFX_EXT_MANIFEST.read_text("utf-8"))
    except Exception:
        return {}
    return {k: float(v.get("trim_db", 0)) for k, v in data.items() if isinstance(v, dict)}


EXT_TRIMS = _ext_trims()


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-5000:], file=sys.stderr)
        sys.exit(f"命令失败: {' '.join(map(str, cmd[:8]))} ...")
    return r


def find_sfx(name):
    for base in (SFX_DIR, SFX_EXT_DIR):
        for ext in (".wav", ".mp3", ".m4a", ".aac", ".ogg"):
            p = base / (name + ext)
            if p.exists():
                return p
    sys.exit(f"缺音效 {name}：请放入 {SFX_DIR}/ 或 {SFX_EXT_DIR}/ 并登记许可")


_PEAK_CACHE = {}


def source_peak_db(path):
    """音效素材自身的峰值电平（dB），用于把不同素材拉到同一响度基准。"""
    key = str(path)
    if key in _PEAK_CACHE:
        return _PEAK_CACHE[key]
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", key, "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", r.stderr)
    peak = float(m.group(1)) if m else -12.0
    _PEAK_CACHE[key] = peak
    return peak


def envelope(points, fallback):
    points = sorted(points or [[0, fallback]], key=lambda x: x[0])
    if points[0][0] > 0:
        points.insert(0, [0, points[0][1]])
    expression = f"{float(points[-1][1]):.5f}"
    for (t0, v0), (t1, v1) in reversed(list(zip(points, points[1:]))):
        if t1 <= t0:
            sys.exit("bgm_envelope 时间必须递增")
        ramp = f"({float(v0):.5f}+({float(v1)-float(v0):.5f})*(t-{t0:.3f})/{t1-t0:.3f})"
        expression = f"if(lt(t,{t1:.3f}),{ramp},{expression})"
    return expression


def measure_true_peak(path):
    """用 ebur128 测整段真峰（dBFS）。"""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
                        "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    hits = re.findall(r"Peak:\s*(-?[\d.]+) dBFS", r.stderr)
    return float(hits[-1]) if hits else -99.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--crf", type=int, default=18)
    ap.add_argument("--preset", default="medium")
    args = ap.parse_args()
    ep = Path(args.episode).resolve()
    s = json.loads((ep / "script.json").read_text("utf-8"))
    fps, dur = s["fps"], s["duration"]
    frames = ep / "out" / "frames" / f"frame_%06d.{s.get('frame_format', 'jpg')}"
    if not (ep / "out" / "frames").exists():
        sys.exit("缺少 out/frames，先运行 render.py")
    if not (ep / "out").exists():
        (ep / "out").mkdir()

    inputs = ["-framerate", str(fps), "-start_number", "0", "-i", str(frames)]
    bgm = (ep / s.get("bgm", "bgm.mp3")).resolve()
    if not bgm.exists():
        sys.exit(f"未找到 BGM {bgm}；不使用静音替代")
    inputs += ["-ss", str(s.get("bgm_start", 0)), "-i", str(bgm)]
    af = []
    chain = f"[1:a]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS"
    if s.get("bgm_envelope"):
        chain += f",volume='{envelope(s['bgm_envelope'], s.get('bgm_volume', .9))}':eval=frame"
    else:
        chain += f",volume={s.get('bgm_volume', .9)}"
    chain += f",afade=t=in:st=0:d={s.get('fade_in', 2)}"
    chain += f",afade=t=out:st={max(dur-s.get('fade_out', 2.5), 0):.3f}:d={s.get('fade_out', 2.5)}"
    for dip in s.get("bgm_dips", []):
        chain += f",volume={dip.get('level', .6)}:enable='between(t,{dip['t']},{dip['t']+dip.get('d', 1.5)})'"
    chain += "[bgm]"
    af.append(chain)

    sfx_labels = []
    norm = (s.get("music") or {}).get("sfx_normalize")
    max_intensity = max([fx.get("gain", 1) for fx in s.get("sfx", [])] or [1])
    for k, fx in enumerate(s.get("sfx", [])):
        source = find_sfx(fx["name"])
        idx = 2 + k
        # lead：气声与蓄力类素材的峰值在起音之后，提前 lead 秒进入才能让峰值落在 cue 上。
        start = float(fx.get("start", 0)) + float(fx.get("lead", 0))
        place = fx["t"] - float(fx.get("lead", 0))
        if place < 0:
            start += -place
            place = 0.0
        if start > 0:
            inputs += ["-ss", f"{start:.3f}"]
        inputs += ["-i", str(source)]
        rate = fx.get("rate", 1)
        if not .5 <= rate <= 2:
            sys.exit(f"音效 {fx.get('id', k)} rate 需在 0.5–2.0")
        chain = f"[{idx}:a]atrim=0:{fx.get('duration', dur):.3f},asetpts=PTS-STARTPTS,atempo={rate}"
        ms = round(place * 1000)
        pan = max(-1, min(1, fx.get("pan", 0)))
        left, right = (1 - max(0, pan)) * .9, (1 + min(0, pan)) * .9
        # 保留素材自身的立体声宽度（外部 whoosh 的声像移动就在这里），只对左右做增益
        chain += f",pan=stereo|c0={left:.3f}*c0|c1={right:.3f}*c1"
        if norm:
            # gain 在这里表示「力度」而非绝对倍数：按素材实测峰值拉到统一基准，
            # 再用强度曲线保留动作之间的轻重差别，避免素材原始电平不同导致音效被 BGM 盖住。
            target = float(norm.get("target_peak_db", -9))
            curve = float(norm.get("intensity_curve", .7))
            intensity = min(1.0, max(.02, float(fx.get("gain", 1)) / max(max_intensity, 1e-6)))
            gain_db = target + 20 * math.log10(intensity ** curve) - source_peak_db(source)
            gain_db += float(fx.get("trim_db", EXT_TRIMS.get(fx["name"], 0)))
            vol = 10 ** (gain_db / 20)
        else:
            vol = fx.get("gain", 1)
        chain += f",apad,atrim=0:{dur:.3f},adelay={ms}|{ms},volume={vol:.4f}[sx{k}]"
        af.append(chain)
        sfx_labels.append(f"[sx{k}]")
    if sfx_labels:
        af.append("".join(sfx_labels) + f"amix=inputs={len(sfx_labels)}:duration=longest:normalize=0,atrim=0:{dur:.3f}[sfxbus]")
        af.append("[sfxbus]asplit=2[sfxmix][sfxkey]")
        duck = s.get("music", {}).get("sfx_ducking", {})
        threshold = duck.get("threshold", .02)
        ratio = duck.get("ratio", 2)
        attack = duck.get("attack", 3)
        release = duck.get("release", 120)
        af.append(f"[bgm][sfxkey]sidechaincompress=threshold={threshold}:ratio={ratio}:attack={attack}:release={release}[bgmduck]")
        af.append("[bgmduck][sfxmix]amix=inputs=2:duration=first:normalize=0[mix]")
    else:
        af.append("[bgm]anull[mix]")
    af.append("[mix]acompressor=threshold=-7dB:ratio=3:attack=4:release=90:makeup=1[premaster]")
    base = ["ffmpeg", "-y", *inputs]

    analysis = sh([*base, "-filter_complex", ";".join([*af, "[premaster]loudnorm=I=-13.5:TP=-1.8:LRA=11:print_format=json[analysis]"]), "-map", "[analysis]", "-f", "null", "-"])
    blocks = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", analysis.stderr, re.S)
    if not blocks:
        sys.exit("无法读取 loudnorm 分析结果")
    measured = json.loads(blocks[-1])
    loudnorm = (f"loudnorm=I=-13.5:TP=-1.8:LRA=11:measured_I={measured['input_i']}"
                f":measured_TP={measured['input_tp']}:measured_LRA={measured['input_lra']}"
                f":measured_thresh={measured['input_thresh']}:offset={measured['target_offset']}:linear=true")
    # 音频先单独出一条母线 wav：削峰要复测，放在视频封装前做，避免每次重编视频。
    out = ep / "out" / s.get("output", f"{ep.name}.mp4")
    mix = ep / "out" / "audio_mix.wav"
    print("混音中…", flush=True)
    bus = ep / "out" / "audio_bus0.wav"
    sh([*base, "-filter_complex", ";".join([*af, f"[premaster]aresample=48000,{loudnorm}[aout]"]),
        "-map", "[aout]", "-c:a", "pcm_s24le", "-ar", "48000", str(bus)])
    # AAC 编码会在采样点之间产生过冲，限幅要留够余量；只削短尖峰，不动整体响度。
    target = float(s.get("true_peak_max", -1.8))
    limit = float(s.get("limiter_limit", .68))
    # AAC 编码会在采样点之间产生过冲，而且 ffmpeg 自带 aac 编码器在这类打击类音效上
    # 过冲能到 3 dB 以上（实测），所以削峰要看「编码解码之后」的真峰，不是 wav 的真峰。
    # macOS 的 aac_at 过冲只有 0.8 dB 左右，先用它，再按实测迭代限幅电平。
    enc = s.get("audio_encoder", "aac_at")
    target = float(s.get("true_peak_max", -1.8))
    limit = float(s.get("limiter_limit", .68))
    for i in range(5):
        probe_audio = ep / "out" / f"audio_probe{i}.m4a"
        sh(["ffmpeg", "-y", "-v", "error", "-i", str(bus), "-c:a", enc, "-b:a", "192k",
            "-ar", "48000", str(probe_audio)])
        tp = measure_true_peak(probe_audio)
        print(f"  音频 {i}: 编码后真峰 {tp:.1f} dBTP（限幅电平 {limit:.2f}）", flush=True)
        if tp <= target - .2:
            break
        nxt = ep / "out" / f"audio_bus{i + 1}.wav"
        sh(["ffmpeg", "-y", "-v", "error", "-i", str(bus), "-af",
            f"aresample=192000,alimiter=limit={limit:.3f}:level=false:attack=1:release=60,aresample=48000",
            "-c:a", "pcm_s24le", "-ar", "48000", str(nxt)])
        bus = nxt
        limit *= .82
    print("合成中…", flush=True)
    sh(["ffmpeg", "-y", "-framerate", str(fps), "-start_number", "0", "-i", str(frames),
        "-i", str(bus), "-map", "0:v", "-map", "1:a",
        "-vf", "scale=1080:1440:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", args.preset,
        "-crf", str(args.crf), "-profile:v", "high", "-level", "4.2", "-r", str(fps), "-g", str(fps * 2),
        "-c:a", enc, "-b:a", "192k", "-ar", "48000",
        "-t", f"{dur:.3f}", "-movflags", "+faststart", "-metadata", f"title={s.get('title', ep.name)}", str(out)])
    print(f"成片真峰 {measure_true_peak(out):.1f} dBTP")
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(out), "-map", "0:a", "-c:a", "pcm_s24le", str(mix)])
    probe = sh(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(out)])
    info = json.loads(probe.stdout)
    v = next(x for x in info["streams"] if x["codec_type"] == "video")
    print(f"✓ 成片: {out}")
    print(f"  {v['width']}x{v['height']} {fps}fps  {info['format']['duration']}s  {int(info['format']['size'])/1e6:.1f}MB")
    print(f"✓ 混音留档: {ep/'out'/'audio_mix.wav'}")


if __name__ == "__main__":
    main()
