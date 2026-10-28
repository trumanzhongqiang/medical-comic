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


VERDICTS = ("通过", "常识表述", "降级为类比", "删去", "待核查")
# 需要人工签字的判定：通过=有原文支撑；常识表述=原文取不到、但属于通行常识，
# 由人认可后才允许留在画面上（凭 conflict 里的缺口说明 + reviewer）。
NEEDS_SIGNOFF = ("通过", "常识表述")
SIGNOFF = "待人工签字"


def validate_sources(script):
    """事实核查留档（pipeline/factcheck.md 第 5 节）。结构问题算硬伤。"""
    problems = []
    legacy = script.get("factcheck_legacy")
    if legacy:
        # 已对外发布、画面不再改动的期次：旧格式归档，不回填 verdict。
        # 这是显式豁免，必须带 reason，避免变成绕过核查的暗门。
        if not (isinstance(legacy, dict) and legacy.get("reason")):
            problems.append("factcheck_legacy 需带 reason，说明为何豁免")
        return problems
    sources = script.get("sources") or []
    if not sources:
        if script.get("beats"):
            problems.append("缺少事实核查留档：sources 为空（先过 pipeline/factcheck.md）")
        return problems
    for i, item in enumerate(sources):
        if not isinstance(item, dict):
            problems.append(f"sources[{i}] 不是对象")
            continue
        if "claim" not in item and "claims" in item:
            problems.append(f"sources[{i}] 仍是旧格式 title/url/claims，需迁移到 claim/source/conclusion/verdict")
            continue
        for key in ("claim", "source", "conclusion", "verdict"):
            if not item.get(key):
                problems.append(f"sources[{i}] 缺字段 {key}")
        verdict = item.get("verdict")
        if verdict and verdict not in VERDICTS:
            problems.append(f"sources[{i}] verdict 非法: {verdict}（可选 {'/'.join(VERDICTS)}）")
        if verdict == "通过":
            if not item.get("quote"):
                problems.append(f"sources[{i}] 判通过但缺原文摘录 quote")
            if not item.get("url"):
                problems.append(f"sources[{i}] 判通过但缺可核验链接 url")
            if not item.get("checked_at"):
                problems.append(f"sources[{i}] 判通过但缺检索日期 checked_at")
        if verdict == "常识表述" and not item.get("conflict"):
            problems.append(f"sources[{i}] 判常识表述但缺 conflict：要写清缺的是哪条原文")
        checked = item.get("checked_at")
        if checked and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(checked)):
            problems.append(f"sources[{i}] checked_at 需 YYYY-MM-DD")
        reviewed = item.get("reviewed_at")
        if reviewed and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(reviewed)):
            problems.append(f"sources[{i}] reviewed_at 需 YYYY-MM-DD")
    return problems


def pending_signoff(script):
    """等人工签字的条目。不算硬伤，交给发布前那一关。"""
    pending = []
    for item in script.get("sources") or []:
        if not isinstance(item, dict) or item.get("verdict") not in NEEDS_SIGNOFF:
            continue
        if not item.get("reviewer"):
            pending.append(item.get("claim", ""))
    return pending


# ---- 铁律 14：口语化不得牺牲精度（pipeline/factcheck.md 第 7 节）----
# 这一组是启发式报警，不是判据。命中不等于写错，但每次命中都要人把这句话
# 反推成完整陈述，看它还能不能对回 sources.conclusion。
ABSOLUTE = re.compile(
    r"(?<![不非])一定(?:能|会|是|有效|可以)|肯定会|必然是|保证(?:能|会|有效|治好)|"
    r"根治|永久(?:性)?(?:治愈|有效)|再也不(?:会|用|犯)|百分之百|绝无|绝对(?:安全|有效|不会)"
)
# 把术语压成单字动词：纤维化「也能退」读着顺，但看不出"什么东西在变"。
SHRUNK = re.compile(r"(?:能|会|就|也|都|才)+(退|没了|消了|好了|轻了|硬了|堵了|断了)$")
UNIT = re.compile(r"\d+(?:\.\d+)?\s*(?:%|％|mmol/L|mmol|mmHg|mg|克|公斤|分钟|小时|天|个月|年|步|公里)")
HEDGE = re.compile(r"以上|以下|约|左右|至少|最多|超过|不超过|一部分|部分|多数|大多数|有些|可能|可以|可|往往|通常")
EFFECT = re.compile(r"改善|逆转|缓解|降低|减少|下降|恢复|消失|变好|胖|瘦|安全")
SUFFICIENT = re.compile(r"[就也都]")
RANGE = re.compile(r"\d+(?:\.\d+)?\s*[%％]?\s*(?:到|~|～|-|－|至)\s*\d+(?:\.\d+)?\s*[%％]")


def _percents(text):
    """区间（3% 到 5%）算一个阈值，不按两个算。"""
    return set(re.findall(r"\d+(?:\.\d+)?\s*[%％]", RANGE.sub("区间", text)))


def lint_copy(script):
    """文案精度检查。返回 (硬伤, 提示)。

    硬伤：保证性、绝对化的医学承诺——这类句子不该出现在科普画面里。
    提示：把两档阈值并成一句、把术语压成单字、把定量结果说成必然。
          这些都能读得更顺，但读顺的代价是观众对不回去，需要人看一眼。
    """
    hard, soft = [], []
    for beat in script.get("beats") or []:
        bid = beat.get("id", "?")
        for line in beat.get("lines") or []:
            if not isinstance(line, dict):
                continue
            text = line.get("text", "")
            if not text or line.get("copy_ok"):
                continue
            hit = ABSOLUTE.search(text)
            if hit:
                hard.append(f"节拍 {bid} 文案给了绝对承诺（{hit.group()}）: {text}")
            hit = SHRUNK.search(text)
            if hit:
                soft.append(f"节拍 {bid} 术语被压成单字（{hit.group()}）: {text} → 换成完整动词，如「逆转」")
            if UNIT.search(text) and EFFECT.search(text) and SUFFICIENT.search(text) and not HEDGE.search(text):
                soft.append(f"节拍 {bid} 定量结果说成了必然（缺 以上/约/部分）: {text}")
            percents = _percents(text)
            if len(percents) >= 2:
                soft.append(f"节拍 {bid} 一句里有两个阈值（{'/'.join(sorted(percents))}）: {text}")
    return hard, soft


def validate_script(script):
    problems = []
    beats = script.get("beats") or []
    if not beats:
        return problems + validate_sources(script) + lint_copy(script)[0]
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
    return problems + validate_sources(script) + lint_copy(script)[0]


def load_script(episode):
    ep = Path(episode).resolve()
    return json.loads((ep / "script.json").read_text("utf-8"))
