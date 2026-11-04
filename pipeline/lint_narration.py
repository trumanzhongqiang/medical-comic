#!/usr/bin/env python3
"""旁白文案体检：按「认知负荷」查，不只按语法查。

输入是 episodes/<slug>/voice/text.txt（一句一行，行首可带编号和制表符）。
输出两类：
  硬伤  —— 必须改：被否掉的比喻、绝对承诺、一句话塞两件事以上导致听不明白。
  提示  —— 需要人看一眼：句长节奏扁平、抽象名词当主语、悬空指代、术语首现没解释、
           同一期内量词口径打架、多音字有读错风险。

用法：
    python3 pipeline/lint_narration.py                 # 全期
    python3 pipeline/lint_narration.py ep002-blood-sugar-report
    python3 pipeline/lint_narration.py --quiet         # 只列硬伤

为什么按「认知负荷」查：观众听不懂不是字不认识，是一句话里要同时装的新东西太多，
或者上一句留下的概念还没落地就被拿去用了。字数少不等于密度低——把连接词和解释删掉，
字少了，密度反而更高，这就是「太精炼听不懂」的成因。
"""

from __future__ import annotations

import argparse
import pathlib
import re
import statistics
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------- 词表

# 被否掉的比喻：需要读者先建一个模型（一本账、一场架）再往里填数
BANNED_METAPHOR = re.compile(r"账本|记账|记一笔|攒|欠着|打架|打一架|考试|积分")

# 绝对承诺，科普里不该给；带否定的（「不保证一定逆转」）是合规说法，要放过
ABSOLUTE = re.compile(r"(?<![不别没未])(?:一定能|肯定能|保证|彻底治愈|永久|百分之百|绝对不会)")

# 抽象名词当主语，配「被/就/会」时最伤——观众找不到「谁做了什么」
ABSTRACT_SUBJ = re.compile(
    r"(?:平均|情况|结果|过程|程度|状态|趋势|条件|问题|指标|数值|水平)(?:被|就|会|已|让|使)"
)

# 悬空指代开头：单独一句可以，连着两句就要人回头找
PRONOUN_HEAD = re.compile(r"^(?:这|那|它|他|该|其)(?!样|时|么)")

# 换气词：长句里必须至少有一个，否则是「压缩饼干」
BREATH = re.compile(r"因为|所以|可是|但是|不过|其实|也就是|结果|于是|后来|要是一|如果|原来|所以是")

# 术语引入：只盯四个字以上的专业词（两字的「低压」「尿酸」观众能自己猜）
TERM_INTRO = re.compile(r"叫((?:(?!的)[\u4e00-\u9fa5]){4,8})")
TERM_EXPLAIN = re.compile(r"就是|意思是|说的是|指的是|其实就是|也就是")

# 多音字：只在「当动词用」时才会读错，名词用法（两个数、含量）不用管
POLYPHONE = re.compile(r"量(?:的|一|出|下|起来|过|了)|差(?:不多|一点|距)|转(?:过头|身)")

# 同一期内口径应统一
UNIT_PAIRS = [
    ("两小时", ("两个小时", "两个钟头", "2小时", "两钟头")),
    ("三个月", ("两三个月", "两到三个月", "3个月")),
    ("毫米汞柱", ("mmHg",)),
]

PUNCT = re.compile(r"[，。？！、；：""''（）《》…—·,.?!;:]")


def load(path: pathlib.Path) -> list[str]:
    out = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = re.sub(r"^\s*\d+\t?", "", raw).strip()
        if line:
            out.append(line)
    return out


def body_len(s: str) -> int:
    """去掉标点后的字数——标点不算信息，但逗号数算分句。"""
    return len(PUNCT.sub("", s))


def clauses(s: str) -> int:
    """只数真正的分句：顿号是列举、冒号是引出，都不该算成「又推进了一步」。"""
    return len([c for c in re.split(r"[，。？！；]", s) if c.strip()])


def check(lines: list[str]) -> tuple[list[str], list[str]]:
    hard: list[str] = []
    soft: list[str] = []
    lens = [body_len(s) for s in lines]

    for i, s in enumerate(lines, 1):
        tag = f"第 {i:02d} 句"
        n = lens[i - 1]
        c = clauses(s)

        if BANNED_METAPHOR.search(s):
            hard.append(f"{tag} 用了要先建模型的比喻（{BANNED_METAPHOR.search(s).group()}）：{s}")
        if ABSOLUTE.search(s):
            hard.append(f"{tag} 绝对承诺（{ABSOLUTE.search(s).group()}）：{s}")

        # 一句塞两件事以上：分句多、字数也多
        if n >= 30 or (c >= 5 and n >= 28):
            hard.append(f"{tag} 一句 {c} 个分句、{n} 字，一口气装不下，拆成两句：{s}")
        elif c >= 4 and n >= 26:
            soft.append(f"{tag} 一句 {c} 个分句、{n} 字，接近上限，能拆就拆：{s}")

        if n > 34:
            soft.append(f"{tag} {n} 字过长，一口气念不完：{s}")
        if ABSTRACT_SUBJ.search(s):
            soft.append(
                f"{tag} 抽象名词当主语（{ABSTRACT_SUBJ.search(s).group()}），"
                f"改成「谁做了什么」：{s}"
            )
        m = TERM_INTRO.search(s)
        if m:
            term = m.group(1)
            window = lines[i - 1 : i + 2]
            tail = s[m.end(): m.end() + 14]
            explained = bool(TERM_EXPLAIN.search("".join(window))) or any(
                re.search(re.escape(term) + r"[^。]{0,8}(?:是|指|等于)", ln) for ln in window
            ) or bool(re.search(r"(?:它|这|那|也)?就?是|指的是|意思是", tail))
            if not explained:
                soft.append(f"{tag} 引入术语「{term}」但随后两句都没解释，就地垫半句大白话：{s}")
        if POLYPHONE.search(s):
            soft.append(f"{tag} 多音字当动词用（{POLYPHONE.search(s).group()}），TTS 容易读错，换写法：{s}")

    # 节奏：长短交错才好听，太平等于催眠
    if len(lens) >= 6:
        sd = statistics.stdev(lens)
        if sd < 4.5:
            soft.append(f"全片句长标准差 {sd:.1f}，长短几乎一样，读起来是一条平线（目标 ≥5）")
        longest = max(lens)
        shortest = min(lens)
        if shortest > 12:
            soft.append(f"最短一句 {shortest} 字，全片没有短句落点；插一两句 6–10 字的短句")

    # 连续三句都以指代词开头，等于连续三次让观众回头
    run = 0
    for i, s in enumerate(lines, 1):
        run = run + 1 if PRONOUN_HEAD.match(s) else 0
        if run == 3:
            soft.append(f"第 {i-2:02d}–{i:02d} 句连着用指代词开头，换成名词")

    # 口径统一
    for canon, variants in UNIT_PAIRS:
        text = "".join(lines)
        used = [v for v in variants if v in text]
        if used:
            soft.append(f"同一期内「{canon}」和「{'、'.join(used)}」混用，统一成一个说法")

    return hard, soft


def main() -> int:
    ap = argparse.ArgumentParser(description="旁白文案体检")
    ap.add_argument("episode", nargs="?", help="期目录名，省略则检查全部")
    ap.add_argument("--quiet", action="store_true", help="只列硬伤")
    args = ap.parse_args()

    eps = sorted(ROOT.glob("episodes/*/voice/text.txt"))
    if args.episode:
        eps = [p for p in eps if p.parts[-3] == args.episode]
        if not eps:
            print(f"找不到 episodes/{args.episode}/voice/text.txt", file=sys.stderr)
            return 2

    total_hard = 0
    for path in eps:
        lines = load(path)
        hard, soft = check(lines)
        total_hard += len(hard)
        lens = [body_len(s) for s in lines]
        print(f"\n=== {path.parts[-3]}  {len(lines)} 句 / 体长均 {statistics.mean(lens):.1f} 字 / "
              f"标准差 {statistics.stdev(lens) if len(lens) > 1 else 0:.1f} 字 ===")
        for h in hard:
            print(f"  [硬伤] {h}")
        if not args.quiet:
            for s in soft:
                print(f"  [提示] {s}")
        if not hard and not soft:
            print("  干净")

    print(f"\n合计硬伤 {total_hard} 条")
    return 1 if total_hard else 0


if __name__ == "__main__":
    raise SystemExit(main())
