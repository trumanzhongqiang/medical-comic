import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {C, SANS} from "./theme";
import {EpisodeTag, FootNote, Narrator, PaperBackdrop, Rule} from "./layout";
import {FONT} from "./theme";
import {clamp, inOut, seg} from "./motion";
import {widthOf, wrapRows} from "./wrap";

/* 版式（v4）：字越少越好，一屏只留一个主角
 *
 *   y  70   栏目章（只有这一行字常驻）
 *   y 174   细线
 *   y 190   主题（全片固定，十秒后退成背景）
 *   y 292   图解区 968 × 540 —— 所有图形都在这里，一屏最多三块
 *   y 836   注脚（名词 + 半句话，一行细字，不是卡片）
 *   y1137   口播字幕中线 = 品牌头像圆心（旁白原文，一句一条，断在标点或虚词前）
 *          头像圆 1020–1170，圆心 1137；字幕整块以这条线上下居中，一行两行都不动
 *   y1348   免责
 *
 * v3 → v4 砍掉的东西：段落章、注解方框。原因很直接 —— 观众忙着看画面里的动作，
 * 顶上还有三行字、中间还有一张卡，眼睛没有落点。剩下这些已经够交代清楚。
 *
 * 另外两条硬规矩：
 *   1. 图形只在图解区里动，左右都顶到 56 / 1024，不留半边空。
 *   2. 一页里的东西按旁白顺序一件一件出，间隔不小于 0.16（整拍比例），别一起冒出来。
 */

export const BODY = {x: 56, y: 292, w: 968, h: 540};
export const CAP = {x: 56, y: 872, w: 968, h: 100};

/** 品牌头像的落位。Narrator 的圆在 84px 的呼吸留白里居中，圆心 = top + (size+84)/2。 */
export const NARR = {left: 18, top: 1020, size: 150};
export const NARR_CY = NARR.top + (NARR.size + 84) / 2; // 1137

/** 字幕：整块以头像圆心为中线上下居中，一行两行都对齐同一条线。 */
export const SUB = {x: 292, cy: NARR_CY, w: 732, fs: 46, lh: 1.5};

/** 网格：三列中心 + 三行中心，全片共用。 */
export const COL = [200, 540, 880];
export const ROW = [372, 562, 752];
export const BOX = {x0: 56, x1: 1024, y0: 292, y1: 832, w: 968, h: 540};

export type NoteT = {
  kind: "term" | "number" | "none";
  title?: string;
  body?: string;
  unit?: string;
  accent?: boolean;
};

/* ---------- 字幕：断行（实现放在 wrap.ts，可离线体检） ---------- */

const NUM_RE = /(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?\s*%?(?:[–-]\d+(?:\.\d+)?\s*%?)?)/;

/** 数字染珊瑚红，句子本身不变色 —— 只是方便扫读。 */
const tint = (text: string) =>
  text.split(NUM_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{color: C.coralDark, fontWeight: 800}}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const Subtitle: React.FC<{text: string; opacity?: number}> = ({text, opacity = 1}) => {
  // 最多两行：放不下就整句缩一号字，宁可小一点，也不让它掉到第三行
  let fs = SUB.fs;
  let rows = wrapRows(text, SUB.w / fs - 0.5);
  while (rows.length > 2 && fs > 36) {
    fs -= 2;
    rows = wrapRows(text, SUB.w / fs - 0.5);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: SUB.x,
        top: SUB.cy,
        width: SUB.w,
        transform: "translateY(-50%)",
        opacity,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            fontFamily: SANS,
            fontSize: fs,
            fontWeight: 700,
            lineHeight: SUB.lh,
            color: C.ink,
            whiteSpace: "nowrap",
            letterSpacing: 0.6,
          }}
        >
          {tint(r)}
        </div>
      ))}
    </div>
  );
};

/* ---------- 注脚 ---------- */

/** 一格注脚，不是一张卡片。
 *
 *  原来这里是 968×100 的方框，占掉整条横带，等于在图解之外又插了第三块「主体」。
 *  现在压成图解区下方一行细字：一个名词 + 半句话，59% 白底、没有边框，
 *  眼睛扫得到就扫，扫不到也不挡路。出场也推后到这一拍的句尾，先说画面，再落关键词。
 */
export const NoteBar: React.FC<{note: NoteT; p: number}> = ({note, p}) => {
  if (!note || note.kind === "none" || !note.title) return null;
  const accent = !!note.accent;
  const key = accent ? C.coralDark : C.tealDark;
  const body = note.body ?? "";
  const isNum = note.kind === "number";
  const ts = isNum ? 54 : 34;
  // 名词（和它的单位）先把宽度占掉，剩下的才给后面那半句，永远一行放得下
  const room = CAP.w - (widthOf(note.title) * ts + (isNum && note.unit ? widthOf(note.unit) * 24 + 10 : 0) + 40);
  const bf = Math.max(19, Math.min(26, Math.floor(room / Math.max(1, widthOf(body)))));
  return (
    <div
      style={{
        position: "absolute",
        left: CAP.x,
        top: 832,
        width: CAP.w,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        gap: 14,
        opacity: p * 0.86,
      }}
    >
      <span style={{fontFamily: SANS, fontSize: ts, fontWeight: 800, color: key, letterSpacing: 1, whiteSpace: "nowrap", lineHeight: 1}}>
        {note.title}
      </span>
      {isNum && note.unit ? (
        <span style={{fontFamily: SANS, fontSize: 24, fontWeight: 700, color: key, opacity: 0.9, whiteSpace: "nowrap", lineHeight: 1}}>
          {note.unit}
        </span>
      ) : null}
      {body ? (
        <span style={{fontFamily: SANS, fontSize: bf, fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap", lineHeight: 1}}>
          {body}
        </span>
      ) : null}
    </div>
  );
};

/* ---------- 主题 ---------- */

export const TopicTitle: React.FC<{text: string; p?: number}> = ({text, p = 1}) => (
  <div
    style={{
      position: "absolute",
      left: 64,
      top: 190,
      width: 952,
      opacity: p,
      fontFamily: FONT,
      // 标题必须一行放得下：按真实字宽反算字号，长的自动缩，不裁字
      fontSize: Math.min(text.length > 12 ? 62 : 70, Math.floor((944 / Math.max(1, widthOf(text))) * 10) / 10),
      fontWeight: 900,
      color: C.ink,
      lineHeight: 1.16,
      letterSpacing: 1,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

export type Sub = {t: number; end: number; text: string};
export type Beat = {start: number; end: number; scene: string; subs: Sub[]; note: NoteT | null};
export type EpData = {
  id: string;
  episode: number;
  title: string;
  dur: number;
  sections: Array<{start: number; label: string}>;
  beats: Beat[];
};

export const useBeat = (data: EpData, t: number) => {
  let i = 0;
  for (let k = 0; k < data.beats.length; k++) if (t >= data.beats[k].start - 1e-6) i = k;
  const b = data.beats[i];
  return {i, beat: b, u: clamp((t - b.start) / Math.max(0.2, b.end - b.start))};
};

export const Shell: React.FC<{
  data: EpData;
  t: number;
  children: React.ReactNode;
  ending?: React.ReactNode;
}> = ({data, t, children, ending}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tt = frame / fps;
  const {beat, u} = useBeat(data, tt);

  const active = beat.subs.find((s) => tt >= s.t && tt < s.end + 0.06) ?? beat.subs[0];
  // 注脚推到这一拍的后半段才出：先看清画面在动什么，再落那一个关键词。
  const span = Math.max(0.8, beat.end - beat.start);
  const noteP = inOut(seg(tt, beat.start + span * 0.55, 0.5));
  const endP = data.dur - 6;
  const fadeOut = 1 - inOut(seg(tt, endP, 2.2));
  const energy = 0.35 + 0.65 * Math.sin(Math.PI * u);
  // 大标题只在开头交代主题，之后轻微退后：一屏不要两行同样重的黑字。
  // 退到 0.4 会像褪色印错，只退到 0.75，够让位又不脏。
  const titleP = 1 - 0.25 * inOut(seg(tt, 9, 3));

  if (ending && tt >= endP) return <AbsoluteFill>{ending}</AbsoluteFill>;

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <PaperBackdrop />
      <div style={{position: "absolute", inset: 0, opacity: fadeOut}}>
        <EpisodeTag episode={data.episode} />
        <Rule />
        <TopicTitle text={data.title} p={titleP} />
        <svg width={1080} height={1440} viewBox="0 0 1080 1440" style={{position: "absolute"}}>
          <defs>
            <clipPath id="bodyclip">
              <rect x={0} y={BODY.y - 26} width={1080} height={BODY.h + 52} />
            </clipPath>
          </defs>
          <g clipPath="url(#bodyclip)">{children}</g>
        </svg>
        <NoteBar note={beat.note ?? {kind: "none"}} p={noteP} />
        {active ? <Subtitle text={active.text} opacity={inOut(seg(tt, 0, 0.35))} /> : null}
        <div style={{position: "absolute", left: NARR.left, top: NARR.top}}>
          <Narrator t={tt} energy={energy} size={NARR.size} />
        </div>
        <FootNote text="本内容仅供科普，不能替代医生诊疗" />
      </div>
    </AbsoluteFill>
  );
};
