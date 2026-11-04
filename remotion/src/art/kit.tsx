import React from "react";
import {C, SANS} from "../theme";
import {clamp, inOut, seg} from "../motion";
import {Label} from "../diagrams";

/* 各期共用的小零件：折线、刻度、胶囊、面板。
 * 坐标一律用 shell 的网格：列 200/540/880，行 372/562/752，图解区 56–1024 × 292–832。
 */

export const COL = [200, 540, 880];
export const ROW = [372, 562, 752];
export const X0 = 56;
export const X1 = 1024;

/** 平滑折线：pts 用 0–1 归一化，y=0 在顶上。 */
export const Curve: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  pts: Array<[number, number]>;
  p: number;
  tone?: string;
  width?: number;
  dash?: string;
}> = ({x, y, w, h, pts, p, tone = C.coralDark, width = 9, dash}) => {
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"} ${x + px * w} ${y + py * h}`).join(" ");
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot((pts[i][0] - pts[i - 1][0]) * w, (pts[i][1] - pts[i - 1][1]) * h);
  }
  len += 12;
  return (
    <path
      d={d}
      fill="none"
      stroke={tone}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ?? `${len}`}
      strokeDashoffset={dash ? 0 : len * (1 - clamp(p))}
      opacity={dash ? clamp(p) : 1}
    />
  );
};

/** 横轴刻度：让一条线读起来像尺子。 */
export const Ticks: React.FC<{
  x: number;
  y: number;
  w: number;
  min: number;
  max: number;
  step: number;
  label?: string;
}> = ({x, y, w, min, max, step, label}) => {
  const pos = (v: number) => x + ((v - min) / (max - min)) * w;
  const vs: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-6; v += step) vs.push(Number(v.toFixed(2)));
  return (
    <g>
      {vs.map((v) => (
        <line key={v} x1={pos(v)} y1={y + 18} x2={pos(v)} y2={y + 30} stroke={C.paperShadow} strokeWidth={4} strokeLinecap="round" />
      ))}
      {label ? <Label x={x} y={y + 68} text={label} size={22} anchor="start" color={C.inkSoft} weight={600} /> : null}
    </g>
  );
};

/** 胶囊：一行一个判断或一个动作。 */
export const Chip: React.FC<{
  x: number;
  y: number;
  text: string;
  tone?: "ink" | "coral" | "teal" | "amber";
  solid?: boolean;
  size?: number;
  /** 固定宽度：一排几个胶囊等宽等距，才不会一个宽一个窄看着乱 */
  w?: number;
}> = ({x, y, text, tone = "ink", solid = false, size = 28, w: fixed}) => {
  const col = tone === "coral" ? C.coralDark : tone === "teal" ? C.tealDark : tone === "amber" ? "#9A6B12" : C.ink;
  const units = [...text].reduce((a, c) => a + (/[\u3400-\u9fff，。、；：]/.test(c) ? 1 : 0.56), 0);
  const w = Math.max(units * size + 56, fixed ?? 0);
  const h = size + 32;
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect width={w} height={h} rx={h / 2} fill={solid ? col : C.paperLight} stroke={col} strokeWidth={4} />
      <text
        x={w / 2}
        y={h / 2 + size * 0.36}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={size}
        fontWeight={800}
        fill={solid ? C.white : col}
      >
        {text}
      </text>
    </g>
  );
};

/** 面板：一块浅底圆角卡，用来装一组同类信息。 */
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  tone?: string;
  children?: React.ReactNode;
  on?: number;
}> = ({x, y, w, h, title, tone = C.ink, children, on = 1}) => (
  <g opacity={on}>
    <rect x={x} y={y} width={w} height={h} rx={26} fill={C.paperLight} stroke={tone} strokeWidth={5} />
    {title ? <path d={`M ${x} ${y + 66} L ${x + w} ${y + 66}`} stroke={C.paperShadow} strokeWidth={4} /> : null}
    {title ? <Label x={x + w / 2} y={y + 46} text={title} size={28} weight={800} color={tone} /> : null}
    {children}
  </g>
);

/** 分段进度：把一段话拆成几步，逐句亮。 */
export const Pop: React.FC<{u: number; at: number; children: React.ReactNode}> = ({u, at, children}) => (
  <g opacity={inOut(seg(u, at, 0.3))} transform={`translate(0 ${(1 - inOut(seg(u, at, 0.3))) * 14})`}>
    {children}
  </g>
);
