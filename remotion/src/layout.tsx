import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";
import {C, FONT, SANS} from "./theme";
import {clamp} from "./motion";

/* 版式（对齐「知识分享」类竖版：顶部栏目章 + 大标题 + 中段主体 + 底部口播字幕 + 品牌形象）
 *
 *   y 72   栏目章（橙胶囊：账号名 · 第几期）
 *   y 176  分隔线
 *   y 196  大标题（一行，黑体加粗）
 *   y 300  画面主体区（场景全部动作都在这里发生）
 *   y1004  口播字幕（两行：正在说的黑字+关键词高亮，已说过的转灰）
 *   y1030  品牌形象（左下，站在字幕旁边）
 *   y1370  免责声明
 */

export const SAFE = 72;
export const STAGE = {x0: 56, x1: 1024, y0: 300, y1: 972};
export const SUB = {x: 286, y: 1000, w: 730};

/** 纸底：米白纸 + 极淡点阵 + 边缘的彩色纸片，做出「页面感」，不抢主体。 */
const BITS: Array<[number, number, number, string]> = [
  [24, 300, 26, C.tealLight], [58, 344, 16, C.amberLight], [22, 392, 20, C.coralLight],
  [1030, 292, 24, C.amberLight], [1000, 336, 16, C.tealLight], [1042, 372, 20, C.coralLight],
  [30, 604, 18, C.coralLight], [26, 646, 24, C.tealLight], [1040, 612, 22, C.amberLight],
  [1006, 654, 16, C.coralLight], [46, 900, 20, C.amberLight], [26, 940, 16, C.tealLight],
  [1036, 904, 26, C.coralLight], [1004, 946, 16, C.amberLight], [60, 1180, 18, C.tealLight],
  [1016, 1196, 20, C.amberLight], [560, 1236, 16, C.coralLight], [900, 1240, 18, C.tealLight],
];

export const PaperBackdrop: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <svg width={1080} height={1440} style={{position: "absolute"}}>
      <defs>
        <pattern id="dotgrid" width="46" height="46" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2.3" fill={C.ink} opacity={0.085} />
        </pattern>
      </defs>
      <rect width={1080} height={1440} fill="url(#dotgrid)" />
      {BITS.map(([x, y, s, c], i) => (
        <g key={i} opacity={0.75}>
          <rect x={x} y={y} width={s} height={s} rx={3} fill={c} />
          <rect x={x} y={y} width={s} height={s} rx={3} fill="none" stroke={C.ink} strokeOpacity={0.16} strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

/** 顶部栏目章：橙胶囊 + 期数点。 */
export const EpisodeTag: React.FC<{episode: number; label?: string}> = ({episode, label = "医学科普漫画"}) => (
  <div style={{position: "absolute", left: 64, top: 70, display: "flex", alignItems: "center", gap: 18}}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: C.coral,
        borderRadius: 999,
        padding: "13px 30px 15px",
        boxShadow: "5px 6px 0 rgba(63,45,28,0.12)",
      }}
    >
      <span style={{fontFamily: SANS, fontSize: 32, fontWeight: 700, color: "#FFF9F2", letterSpacing: 0.5}}>{label}</span>
      <span style={{width: 6, height: 6, borderRadius: 3, background: "rgba(255,249,242,0.7)"}} />
      <span style={{fontFamily: SANS, fontSize: 32, fontWeight: 700, color: "#FFF9F2"}}>第 {episode} 期</span>
    </div>
    <span style={{width: 9, height: 9, borderRadius: 5, background: C.coral}} />
    <span style={{width: 6, height: 6, borderRadius: 3, background: C.coral, opacity: 0.55}} />
  </div>
);

/** 段落章：右上角只留一行小字，不放胶囊。
 *  开头几页同时有期号章、段落章、大标题三行字，眼睛找不到落点；
 *  段落章降成一行细字，并且只在换段后 3 秒露一下，其余时间让位给画面。 */
export const SectionTag: React.FC<{index: number; label: string; p?: number}> = ({index, label, p = 1}) => {
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 64,
        top: 96,
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        opacity: p * 0.62,
      }}
    >
      <span style={{fontFamily: SANS, fontSize: 24, fontWeight: 800, color: C.coralDark, letterSpacing: 1}}>
        {String(index).padStart(2, "0")}
      </span>
      <span style={{fontFamily: SANS, fontSize: 23, fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap"}}>{label}</span>
    </div>
  );
};

export const Rule: React.FC = () => (
  <div style={{position: "absolute", left: 64, top: 174, width: 952, height: 2, background: C.ink, opacity: 0.22}} />
);

export const BigTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: "absolute",
      left: 64,
      top: 196,
      width: 952,
      fontFamily: SANS,
      fontSize: 74,
      fontWeight: 800,
      color: C.ink,
      lineHeight: 1.14,
      letterSpacing: 1,
    }}
  >
    {children}
  </div>
);

/** 用 **词** 标出的关键词染成强调色。 */
export const emphasize = (row: string, color: string) =>
  row.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{color, fontWeight: 800}}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export type SubRow = {text: string; active: boolean};

/** 口播字幕：紧贴品牌形象右侧，正在说的那行墨色 + 关键词珊瑚红，说过的转灰。 */
export const SubtitleBand: React.FC<{rows: SubRow[]; opacity?: number}> = ({rows, opacity = 1}) => (
  <div style={{position: "absolute", left: SUB.x, top: SUB.y, width: SUB.w, opacity}}>
    {rows.map((r, i) => (
      <div
        key={`${i}-${r.text}`}
        style={{
          fontFamily: SANS,
          fontSize: 54,
          fontWeight: r.active ? 700 : 600,
          lineHeight: 1.42,
          color: r.active ? C.ink : "#9C9484",
          whiteSpace: "nowrap",
        }}
      >
        {emphasize(r.text, r.active ? C.coral : "#B4A998")}
      </div>
    ))}
  </div>
);

/** 贴在主体旁的名词章：说清「这是谁 · 在做什么」，带一条短引线指回对象。 */
export const chipWidth = (text: string) => {
  const plain = text.replace(/\*\*/g, "");
  const n = [...plain].reduce((s, ch) => s + (ch.charCodeAt(0) > 255 ? 1 : 0.56), 0);
  return Math.ceil(n * 33 + 64);
};

export const Chip: React.FC<{text: string; x: number; y: number; accent?: boolean}> = ({text, x, y, accent}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      display: "flex",
      alignItems: "center",
      background: C.paperLight,
      border: `4px solid ${accent ? C.coralDark : C.ink}`,
      borderRadius: 999,
      padding: "9px 22px 11px",
      boxShadow: "5px 6px 0 rgba(63,45,28,0.10)",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{fontFamily: FONT, fontSize: 34, fontWeight: 900, color: accent ? C.coralDark : C.ink}}>{text}</span>
  </div>
);

/** 品牌形象：品牌头像读旁白。
 * 完整原图放进圆形墨蓝边框（不裁切构图），站在口播字幕左侧；
 * 说话时外圈脉冲 + 右侧三道声波弧，不讲机制，只承担「有个人在跟你说话」。
 */
export const Narrator: React.FC<{t: number; energy?: number; size?: number}> = ({
  t,
  energy = 0,
  size = 172,
}) => {
  const box = size + 84;
  const c = box / 2;
  const r = size / 2;
  const breathe = Math.sin(t * 1.6) * 2.2;
  const live = 0.10 + energy * 0.90;
  const waves: Array<[number, string]> = [
    [r + 14, C.coral],
    [r + 26, C.amber],
    [r + 38, C.teal],
  ];
  return (
    <div style={{position: "relative", width: box, height: box}}>
      <svg width={box} height={box} style={{position: "absolute", left: 0, top: 0}}>
        {waves.map(([rad, col], i) => {
          const k = energy * (0.42 + 0.58 * Math.abs(Math.sin(t * 5.4 - i * 0.65)));
          const a0 = (-32 * Math.PI) / 180;
          const a1 = (32 * Math.PI) / 180;
          return (
            <path
              key={col}
              d={`M ${c + rad * Math.cos(a0)} ${c + rad * Math.sin(a0)} A ${rad} ${rad} 0 0 1 ${c + rad * Math.cos(a1)} ${c + rad * Math.sin(a1)}`}
              fill="none"
              stroke={col}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={k * (1 - i * 0.22)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: (box - size) / 2,
          top: (box - size) / 2 + breathe,
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: `8px solid ${C.ink}`,
          background: C.paperLight,
          boxShadow: `0 0 0 ${5 + live * 8}px rgba(223,101,85,${0.07 + live * 0.12}), 7px 9px 0 rgba(63,45,28,0.12)`,
        }}
      >
        <Img src={staticFile("avatar.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: -6,
          width: box,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 700,
          color: C.inkSoft,
          letterSpacing: 1,
        }}
      >
        医学科普漫画
      </div>
    </div>
  );
};

export const FootNote: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: "absolute",
      right: 64,
      bottom: 26,
      fontFamily: SANS,
      fontSize: 28,
      color: "#8C8579",
    }}
  >
    {text}
  </div>
);

/** 名片章自动落位：默认贴在焦点正上方，越界就翻到下方，永远留在主体区内。 */
export const chipPlace = (ax: number, ay: number, w: number) => {
  const h = 62;
  let x = clamp(ax - w / 2, STAGE.x0, STAGE.x1 - w);
  const above = ay - 96 - h;
  let y = above;
  if (above < STAGE.y0 + 8) y = Math.min(ay + 84, STAGE.y1 - h - 8);
  return {x, y, w, h};
};
