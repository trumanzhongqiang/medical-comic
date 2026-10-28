import json
import re
from pathlib import Path


# 中文禁则折行：闭标点不得出现在行首。排版仍由画面代码负责，这里只报警。
CLOSERS = set("，。？！、；：）】》〉」』…％%,.!?;:)]}")


def line_start_problems(item):
    if "lineStarts" in item:
        starts = item.get("lineStarts") or []
    else:
        starts = [line.lstrip()[:1] for line in str(item.get("text", "")).split("\n")]
        starts = [ch for ch in starts if ch]
    flagged = item.get("closerAtLineStart")
    if flagged is None:
        flagged = any(ch in CLOSERS for ch in starts)
    if not flagged:
        return []
    shown = "".join(ch for ch in starts if ch in CLOSERS) or "".join(starts)
    return [f"禁则折行（闭标点在行首 {shown}）: {item.get('text')}"]


def audit_text(items, width=1080, height=1440, margin=72):
    problems = []
    minimums = {"display": 64, "body": 44, "label": 44, "disclaimer": 36, "brand": 30, "object": 30}
    clean = []
    for item in items:
        role = item.get("role", "body")
        if item.get("size", 0) + .01 < minimums.get(role, 44):
            problems.append(f"字号过小 {item.get('size')}px/{role}: {item.get('text')}")
        problems.extend(line_start_problems(item))
        rect = (item.get("x", 0), item.get("y", 0), item.get("w", 0), item.get("h", 0))
        clean.append((item, rect))
        if item.get("safe", True):
            x, y, w, h = rect
            if x < margin or y < margin or x + w > width - margin or y + h > height - margin:
                problems.append(f"文字超出安全区: {item.get('text')} [{x:.0f},{y:.0f},{w:.0f},{h:.0f}]")
    for i, (a, ra) in enumerate(clean):
        ax, ay, aw, ah = ra
        for b, rb in clean[i + 1:]:
            bx, by, bw, bh = rb
            ow = min(ax + aw, bx + bw) - max(ax, bx)
            oh = min(ay + ah, by + bh) - max(ay, by)
            if ow > 4 and oh > 4:
                problems.append(f"文字重叠: {a.get('text')} ↔ {b.get('text')}")
    return problems


def reading_seconds(text):
    chars = len(re.sub(r"[\s，。！？：；、「」『』（）()·→+0-9A-Za-z-]", "", text))
    return max(2.4, chars / 5 + .8) if chars else 0


def validate_script(script):
    problems = []
    beats = script.get("beats") or []
    if not beats:
        return problems
    music = script.get("music") or {}
    beat_seconds = 60 / music["bpm"] if music.get("bpm", 0) > 0 else None
    tolerance = music.get("sync_tolerance", 1 / script.get("fps", 60) + .005)
    cue_ids = set()
    cues = {}
    for cue in script.get("sfx", []):
        cid = cue.get("id")
        if not cid or cid in cue_ids:
            problems.append(f"音效 id 缺失或重复: {cid}")
        cue_ids.add(cid)
        cues[cid] = cue
        if not 0 <= cue.get("t", -1) < script["duration"]:
            problems.append(f"音效时间越界: {cid}")
        if beat_seconds:
            nearest = round((cue.get("t", -1) - music.get("offset", 0)) / beat_seconds)
            grid_t = music.get("offset", 0) + nearest * beat_seconds
            if nearest < 0 or abs(cue.get("t", -1) - grid_t) > tolerance:
                problems.append(f"音效未落在拍点: {cid}@{cue.get('t')}s，最近拍点 {grid_t:.4f}s")
        # lead：气声类音效允许提前进入，让扫频的峰值落在 cue 上；上限为一小节，
        # 超过一小节就不再是「提前量」而是换了位置。起点可被 compose 截到 0。
        lead = cue.get("lead", 0)
        if lead:
            bar = (beat_seconds or .8) * music.get("beats_per_bar", 4)
            if lead < 0 or lead > bar:
                problems.append(f"音效 lead 越界: {cid} {lead}s（上限一小节 {bar:.3f}s）")

    previous_end = 0
    ids = set()
    action_beats = []
    for beat in beats:
        bid = beat.get("id")
        if not bid or bid in ids:
            problems.append(f"节拍 id 缺失或重复: {bid}")
        ids.add(bid)
        start, end = beat.get("start"), beat.get("end")
        if start is None or end is None or not start < end <= script["duration"]:
            problems.append(f"节拍时间错误: {bid}")
            continue
        if start + .01 < previous_end:
            problems.append(f"节拍时间重叠: {bid}")
        previous_end = end
        for key in ("purpose", "lines", "visuals", "actions", "transition"):
            if key not in beat:
                problems.append(f"节拍 {bid} 缺字段 {key}")
        lines = beat.get("lines", [])
        if any(isinstance(line, dict) for line in lines):
            for line in lines:
                if not isinstance(line, dict) or not line.get("text"):
                    problems.append(f"节拍 {bid} 逐句文案缺 text")
                    continue
                line_start, line_end = line.get("start"), line.get("end")
                if line_start is None or line_end is None or not start - .01 <= line_start < line_end <= end + .01:
                    problems.append(f"节拍 {bid} 句子时间越界: {line.get('text')}")
                    continue
                needed = reading_seconds(line["text"])
                if line_end - line_start + .01 < needed:
                    problems.append(f"节拍 {bid} 单句阅读时间不足: {line['text']} {line_end-line_start:.1f}s < {needed:.1f}s")
        else:
            needed = reading_seconds(" ".join(lines))
            if end - start + .01 < needed:
                problems.append(f"节拍 {bid} 阅读时间不足: {end-start:.1f}s < {needed:.1f}s")
        for visual in beat.get("visuals", []):
            if not visual.get("name") or not visual.get("role") or not visual.get("label"):
                problems.append(f"节拍 {bid} 首次对象缺少名称/作用/名牌")
            if beat_seconds:
                visual_start, visual_end = visual.get("start"), visual.get("end")
                if visual_start is None or visual_end is None or not start - .01 <= visual_start < visual_end <= end + .01:
                    problems.append(f"节拍 {bid} 对象名牌缺少合法 start/end: {visual.get('name')}")
                elif not 2 * beat_seconds - tolerance <= visual_end - visual_start <= 4 * beat_seconds + tolerance:
                    problems.append(f"节拍 {bid} 对象名牌应为 2–4 拍: {visual.get('name')} {visual_end-visual_start:.2f}s")
        for action in beat.get("actions", []):
            if not action.get("description"):
                problems.append(f"节拍 {bid} 有动作缺描述")
            sfx = action.get("sfx")
            if sfx is None and not action.get("silent"):
                problems.append(f"节拍 {bid} 动作未指定音效或静音原因: {action.get('description')}")
            if sfx is not None and sfx not in cue_ids:
                problems.append(f"动作引用不存在的音效: {sfx}")
            elif sfx is not None:
                if action.get("t") is None or not start - .01 <= action["t"] <= end + .01:
                    problems.append(f"节拍 {bid} 动作时间越界: {sfx}")
                elif abs(action["t"] - cues[sfx]["t"]) > .001:
                    problems.append(f"动作与音效不同帧: {sfx} {action['t']}s ≠ {cues[sfx]['t']}s")
                if beat_seconds:
                    action_beats.append((sfx, round((cues[sfx]["t"] - music.get("offset", 0)) / beat_seconds)))
    if abs(previous_end - script["duration"]) > .02:
        problems.append(f"节拍未覆盖完整时长: 结束 {previous_end} / 总时长 {script['duration']}")
    if beat_seconds:
        seen = {}
        for cid, index in sorted(action_beats, key=lambda item: item[1]):
            if index in seen:
                problems.append(f"相邻音效挤在同一拍: {seen[index]} ↔ {cid}")
            seen[index] = cid
        for cid in music.get("hard_cues", []):
            if cid not in cues:
                problems.append(f"硬卡点引用不存在的音效: {cid}")
                continue
            index = round((cues[cid]["t"] - music.get("offset", 0)) / beat_seconds)
            if index % music.get("beats_per_bar", 4):
                problems.append(f"硬卡点未落在小节线: {cid} 第 {index} 拍")
    return problems


def load_script(episode):
    ep = Path(episode).resolve()
    return json.loads((ep / "script.json").read_text("utf-8"))
