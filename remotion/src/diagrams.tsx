import React from "react";
import {C, FONT, SANS} from "./theme";
import {clamp, inOut, lerp, seg} from "./motion";

/* 通用图解零件。全部是 SVG 组，直接放进画面主体区。
 * 原则：线条粗、字大、颜色有语义（珊瑚红=要注意，青绿=正常/过程，琥珀=数字/中间态）。
 */

const ink = {stroke: C.ink, strokeWidth: 6, fill: "none", strokeLinejoin: "round" as const};

export const Label: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  mono?: boolean;
}> = ({x, y, text, size = 30, color = C.ink, anchor = "middle", weight = 700, mono}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={mono ? SANS : SANS}
    fontSize={size}
    fontWeight={weight}
    fill={color}
  >
    {text}
  </text>
);

/** 折线箭头。progress 0→1 表示「正在流过去」。 */
export const Arrow: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  p?: number;
  color?: string;
  width?: number;
  dash?: string;
  head?: number;
}> = ({x0, y0, x1, y1, p = 1, color = C.tealDark, width = 7, dash, head = 16}) => {
  const k = clamp(p);
  const xe = lerp(x0, x1, k);
  const ye = lerp(y0, y1, k);
  const a = Math.atan2(y1 - y0, x1 - x0);
  const h = head;
  return (
    <g opacity={k > 0.02 ? 1 : 0}>
      <line x1={x0} y1={y0} x2={xe} y2={ye} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      {k > 0.9 ? (
        <path
          d={`M ${x1 - Math.cos(a - 0.5) * h} ${y1 - Math.sin(a - 0.5) * h} L ${x1} ${y1} L ${x1 - Math.cos(a + 0.5) * h} ${y1 - Math.sin(a + 0.5) * h}`}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
};

/** 圆角小牌：给对象贴标签，字号大、边框粗，手机上也读得清。 */
export const Tag: React.FC<{
  x: number;
  y: number;
  text: string;
  tone?: "ink" | "coral" | "teal" | "amber";
  size?: number;
  solid?: boolean;
}> = ({x, y, text, tone = "ink", size = 28, solid}) => {
  const col = tone === "coral" ? C.coralDark : tone === "teal" ? C.tealDark : tone === "amber" ? "#9A6B12" : C.ink;
  const w = [...text].reduce((s, c) => s + (c.charCodeAt(0) > 255 ? 1 : 0.55), 0) * size + 40;
  const h = size + 26;
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect width={w} height={h} rx={999} fill={solid ? col : C.paperLight} stroke={col} strokeWidth={4} />
      <text x={w / 2} y={h / 2 + size * 0.36} textAnchor="middle" fontFamily={SANS} fontSize={size} fontWeight={800} fill={solid ? C.white : col}>
        {text}
      </text>
    </g>
  );
};

/** 报告单：几行指标，逐行点亮。 */
export const Sheet: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  rows: Array<{name: string; value: string; unit?: string; on?: boolean}>;
  rowH?: number;
  fs?: number;
}> = ({x, y, w, h, title, rows, rowH = 84, fs = 32}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} rx={22} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <path d={`M 0 64 L ${w} 64`} stroke={C.paperShadow} strokeWidth={4} />
    {title ? <Label x={28} y={44} text={title} size={30} weight={800} anchor="start" /> : null}
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={w - 30 - i * 26} cy={34} r={7} fill={i === 0 ? C.coral : C.paperShadow} />
    ))}
    {rows.map((r, i) => {
      const ry = 76 + i * rowH;
      return (
        <g key={r.name} opacity={r.on === false ? 0.34 : 1}>
          {r.on ? <rect x={10} y={ry} width={w - 20} height={rowH - 8} rx={14} fill="rgba(223,101,85,0.10)" /> : null}
          <Label x={30} y={ry + rowH / 2 + fs * 0.36} text={r.name} size={fs} anchor="start" weight={r.on ? 800 : 600} color={r.on ? C.ink : C.inkSoft} />
          <Label x={w - 30} y={ry + rowH / 2 + fs * 0.38} text={r.value} size={fs + 2} anchor="end" weight={800} color={r.on ? C.coralDark : C.inkSoft} />
          {r.unit ? <Label x={w - 30} y={ry + rowH / 2 + fs * 0.36 + 34} text={r.unit} size={20} anchor="end" color={C.inkSoft} weight={600} /> : null}
        </g>
      );
    })}
  </g>
);

/** 刻度尺：一条轴 + 若干标记点，可高亮一段区间。 */
export const Ruler: React.FC<{
  x: number;
  y: number;
  w: number;
  min: number;
  max: number;
  marks: Array<{v: number; label: string; tone?: string; above?: boolean}>;
  band?: {a: number; b: number; tone: string};
  p?: number;
}> = ({x, y, w, min, max, marks, band, p = 1}) => {
  const pos = (v: number) => x + ((v - min) / (max - min)) * w;
  const k = clamp(p);
  return (
    <g>
      <line x1={x} y1={y} x2={x + w * k} y2={y} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      {band ? (
        <rect
          x={pos(band.a)}
          y={y - 22}
          width={(pos(band.b) - pos(band.a)) * k}
          height={48}
          rx={12}
          fill={band.tone}
          opacity={0.5}
        />
      ) : null}
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={pos(m.v)} y1={y - 26} x2={pos(m.v)} y2={y + 26} stroke={m.tone ?? C.ink} strokeWidth={7} strokeLinecap="round" />
          <Label x={pos(m.v)} y={m.above ? y - 46 : y + 62} text={m.label} size={28} color={m.tone ?? C.ink} weight={800} />
        </g>
      ))}
    </g>
  );
};

/** 横条组：长度表示量的大小，用来对比「谁多谁少」。 */
export const Bars: React.FC<{
  x: number;
  y: number;
  w: number;
  rows: Array<{label: string; frac: number; tone?: string; note?: string}>;
  rowH?: number;
  p?: number;
}> = ({x, y, w, rows, rowH = 76, p = 1}) => (
  <g>
    {rows.map((r, i) => {
      const k = clamp(p * 1.6 - i * 0.14);
      const col = r.tone ?? C.tealDark;
      return (
        <g key={r.label} opacity={clamp(p * 2.2 - i * 0.2)}>
          <Label x={x} y={y + i * rowH + 32} text={r.label} size={30} anchor="start" weight={700} />
          <rect x={x + 168} y={y + i * rowH + 6} width={w - 168} height={34} rx={17} fill={C.paperShadow} opacity={0.5} />
          <rect x={x + 168} y={y + i * rowH + 6} width={(w - 168) * r.frac * k} height={34} rx={17} fill={col} />
          {r.note ? <Label x={x + 176 + (w - 168) * r.frac * k} y={y + i * rowH + 32} text={r.note} size={26} anchor="start" weight={700} color={col} /> : null}
        </g>
      );
    })}
  </g>
);

/** 红细胞：一团血红蛋白（小点），葡萄糖可以接上去。bind 表示已经结合的比例。 */
export const RBC: React.FC<{x: number; y: number; r?: number; bind: number; glucose?: number}> = ({x, y, r = 78, bind, glucose = 0}) => {
  const dots = [
    [-0.34, -0.3], [0.05, -0.42], [0.38, -0.22], [-0.46, 0.06], [-0.1, -0.02],
    [0.26, 0.12], [-0.3, 0.38], [0.12, 0.42], [0.46, 0.34],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#E4776A" stroke={C.coralDark} strokeWidth={6} />
      <circle r={r - 18} fill="#EDA093" />
      {dots.map(([dx, dy], i) => {
        const on = i / dots.length < bind;
        return (
          <g key={i}>
            <circle cx={dx * r} cy={dy * r} r={11} fill={on ? C.amber : "#B85A4E"} opacity={on ? 1 : 0.55} />
            {on ? <circle cx={dx * r + 10} cy={dy * r - 10} r={6} fill={C.ink} opacity={0.55 + glucose * 0.45} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** 脂蛋白颗粒：外壳 + 里面装的胆固醇小点。 */
export const Particle: React.FC<{
  x: number;
  y: number;
  r?: number;
  tone?: "ldl" | "hdl" | "tg";
  label?: string;
  glow?: number;
  dots?: number;
}> = ({x, y, r = 34, tone = "ldl", label, glow = 0, dots = 4}) => {
  const fill = tone === "ldl" ? "#E9A08D" : tone === "hdl" ? "#9FD0C4" : "#F3D08A";
  const line = tone === "ldl" ? C.coralDark : tone === "hdl" ? C.tealDark : "#A9771B";
  return (
    <g transform={`translate(${x} ${y})`}>
      {glow ? <circle r={r + 12 + glow * 6} fill={line} opacity={0.10 + glow * 0.12} /> : null}
      <circle r={r} fill={fill} stroke={line} strokeWidth={5} />
      {Array.from({length: dots}).map((_, i) => {
        const a = (i / dots) * Math.PI * 2 + 0.4;
        return <circle key={i} cx={Math.cos(a) * r * 0.46} cy={Math.sin(a) * r * 0.46} r={r * 0.17} fill={line} opacity={0.85} />;
      })}
      {label ? <Label x={0} y={r + 34} text={label} size={26} color={line} weight={800} /> : null}
    </g>
  );
};

/** 肝脏（右叶 + 左叶），可注入脂肪滴、炎症点。 */
export const Liver: React.FC<{x: number; y: number; s?: number; fat?: number; inflame?: number; scar?: number}> = ({
  x,
  y,
  s = 1,
  fat = 0,
  inflame = 0,
  scar = 0,
}) => {
  const drops = [
    [-0.34, -0.1], [-0.1, 0.16], [0.16, -0.04], [0.36, 0.18], [-0.44, 0.24], [0.02, -0.26], [0.3, -0.22], [-0.2, 0.34],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M -170 -30 C -150 -90 -40 -104 40 -86 C 128 -66 176 -14 166 40 C 158 88 92 108 20 100 C -62 92 -132 62 -170 -30 Z"
        fill="#B8664F"
        stroke={C.ink}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <path d="M 40 -86 C 62 -30 60 46 20 100" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.35} />
      {drops.map(([dx, dy], i) => {
        const on = i / drops.length < fat;
        return <ellipse key={i} cx={dx * 300} cy={dy * 240} rx={15} ry={11} fill={C.amber} stroke={on ? "#8A5C0E" : "none"} strokeWidth={3} opacity={on ? 1 : 0} />;
      })}
      {inflame ? <circle cx={-46} cy={16} r={30 + inflame * 22} fill={C.coral} opacity={0.18 + inflame * 0.2} /> : null}
      {scar ? (
        <g opacity={scar}>
          <path d="M -20 -30 L 40 30" stroke="#8E3B33" strokeWidth={6} strokeLinecap="round" />
          <path d="M 40 -24 L -10 40" stroke="#8E3B33" strokeWidth={6} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

export const FatDrop: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 16, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={C.amberLight} stroke="#A9771B" strokeWidth={4} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill={C.white} opacity={0.8} />
  </g>
);

export const Clock: React.FC<{x: number; y: number; r?: number; h: number; m?: number; label?: string}> = ({
  x,
  y,
  r = 46,
  h,
  m = 0,
  label,
}) => {
  const ha = ((h % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <line x1={0} y1={0} x2={Math.cos(ha) * r * 0.52} y2={Math.sin(ha) * r * 0.52} stroke={C.coralDark} strokeWidth={6} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.cos(ma) * r * 0.76} y2={Math.sin(ma) * r * 0.76} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <circle r={5} fill={C.ink} />
      {label ? <Label x={0} y={r + 30} text={label} size={24} color={C.inkSoft} weight={700} /> : null}
    </g>
  );
};

/** 一碗饭 / 一杯糖水：容器 + 里面的东西。 */
export const Cup: React.FC<{x: number; y: number; s?: number; fill: number; text?: string; tone?: string}> = ({x, y, s = 1, fill, text, tone = C.amber}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -62 -60 L -50 76 Q 0 92 50 76 L 62 -60 Z" fill="rgba(255,252,245,0.9)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M -58 ${10 - fill * 60} Q 0 ${-4 - fill * 60} 58 ${10 - fill * 60} L 50 76 Q 0 92 -50 76 Z`} fill={tone} opacity={0.45} />
    <ellipse cx={0} cy={-60} rx={62} ry={16} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    {text ? <Label x={0} y={40} text={text} size={26} weight={800} color={C.ink} /> : null}
  </g>
);

export const Plate: React.FC<{x: number; y: number; s?: number; a?: number}> = ({x, y, s = 1, a = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
    <circle r={112} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <path d="M 0 -96 A 96 96 0 0 1 92 30 L 0 0 Z" fill={C.amberLight} opacity={0.75} />
    <path d="M 92 30 A 96 96 0 0 1 -92 30 L 0 0 Z" fill={C.tealLight} opacity={0.8} />
    <path d="M -92 30 A 96 96 0 0 1 0 -96 L 0 0 Z" fill={C.coralLight} opacity={0.75} />
    <Label x={-46} y={-40} text="主食" size={24} weight={800} />
    <Label x={44} y={56} text="菜" size={24} weight={800} />
    <Label x={-40} y={56} text="蛋白" size={24} weight={800} />
  </g>
);

export const Scale: React.FC<{x: number; y: number; s?: number; w: number; label?: string}> = ({x, y, s = 1, w, label}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-96} y={-56} width={192} height={124} rx={26} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <rect x={-58} y={-30} width={116} height={56} rx={12} fill="#E9F2EE" stroke={C.tealDark} strokeWidth={4} />
    <Label x={0} y={8} text={`${w} kg`} size={30} weight={800} color={C.tealDark} />
    {label ? <Label x={0} y={92} text={label} size={26} weight={700} color={C.inkSoft} /> : null}
  </g>
);

export const Moon: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 18 -46 A 48 48 0 1 0 18 46 A 38 38 0 1 1 18 -46 Z" fill={C.amberLight} stroke={C.ink} strokeWidth={5} />
  </g>
);

export const Bowl: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -86 -18 Q 0 96 86 -18 Z" fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <ellipse cx={0} cy={-18} rx={86} ry={18} fill="#F6E3C4" stroke={C.ink} strokeWidth={6} />
    <path d="M -56 -22 Q -20 -44 18 -26 M -10 -30 Q 26 -48 56 -28" fill="none" stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const USProbe: React.FC<{x: number; y: number; s?: number; on?: number}> = ({x, y, s = 1, on = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 -96 L 34 -96 L 20 -20 L -20 -20 Z" fill={C.paperLight} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-22} y={-20} width={44} height={16} rx={6} fill={C.tealLight} stroke={C.tealDark} strokeWidth={4} />
    <path d={`M -20 -6 L -60 ${60} L 60 60 L 20 -6`} fill={C.tealLight} opacity={0.25 + on * 0.35} />
  </g>
);

export const Screen: React.FC<{x: number; y: number; w: number; h: number; img?: React.ReactNode}> = ({x, y, w, h, img}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="#123B4A" stroke={C.ink} strokeWidth={6} />
    {img}
  </g>
);

export const Check: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = C.tealDark}) => (
  <path d={`M ${x - 20 * s} ${y} L ${x - 4 * s} ${y + 18 * s} L ${x + 24 * s} ${y - 20 * s}`} fill="none" stroke={color} strokeWidth={9 * s} strokeLinecap="round" strokeLinejoin="round" />
);

export const Cross: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = C.coralDark}) => (
  <g stroke={color} strokeWidth={9 * s} strokeLinecap="round">
    <line x1={x - 22 * s} y1={y - 22 * s} x2={x + 22 * s} y2={y + 22 * s} />
    <line x1={x + 22 * s} y1={y - 22 * s} x2={x - 22 * s} y2={y + 22 * s} />
  </g>
);

/** 时间窗：一条时间轴上开几个窗口，用来说明「测的是哪段时间」。 */
export const TimeWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  rows: Array<{label: string; a: number; b: number; tone: string; on?: boolean}>;
  rowH?: number;
}> = ({x, y, w, rows, rowH = 66}) => (
  <g>
    {rows.map((r, i) => (
      <g key={r.label} opacity={r.on === false ? 0.3 : 1}>
        <line x1={x} y1={y + i * rowH} x2={x + w} y2={y + i * rowH} stroke={C.paperShadow} strokeWidth={4} />
        <rect
          x={x + r.a * w}
          y={y + i * rowH - 17}
          width={Math.max(8, (r.b - r.a) * w)}
          height={34}
          rx={17}
          fill={r.tone}
          opacity={0.9}
        />
        <Label x={x - 16} y={y + i * rowH + 10} text={r.label} size={26} anchor="end" weight={700} color={r.on === false ? C.inkSoft : C.ink} />
      </g>
    ))}
  </g>
);
