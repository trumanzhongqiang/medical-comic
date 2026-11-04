import React from "react";
import {Img, staticFile} from "remotion";
import {C, FONT, SANS} from "./theme";

export const Heart: React.FC<{kick: number; fast?: boolean; x: number; y: number}> = ({kick, x, y}) => {
  const k = 1 + kick * 0.1;
  return (
    <g transform={`translate(${x} ${y}) scale(${k} ${2 - k})`}>
      <ellipse cx="0" cy="130" rx="140" ry="17" fill="rgba(63,45,28,0.10)" />
      <path
        d="M0 118 C-150 10 -170 -110 -78 -140 C-30 -156 -6 -120 0 -96 C6 -120 30 -156 78 -140 C170 -110 150 10 0 118 Z"
        fill="#E08A78"
        stroke={C.ink}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <path d="M-96 -72 C-40 -30 -20 30 0 96" fill="none" stroke="#C6594A" strokeWidth={3.5} opacity={0.65} />
      <path d="M96 -72 C40 -30 20 30 0 96" fill="none" stroke="#C6594A" strokeWidth={3.5} opacity={0.65} />
    </g>
  );
};

/** 一根从左到右的血管。near/far 是两端半径，wall 是额外壁厚。 */
export const Vessel: React.FC<{
  near: number;
  far: number;
  wall: number;
  level: number;
  y: number;
  x0: number;
  x1: number;
  hot: boolean;
}> = ({near, far, wall, level, y, x0, x1}) => {
  const top = `M ${x0} ${y - near} C ${(x0 + x1) / 2} ${y - near - 6} ${x1 - 80} ${y - far - 2} ${x1} ${y - far}`;
  const d = `${top} L ${x1} ${y + far} C ${x1 - 80} ${y + far + 2} ${(x0 + x1) / 2} ${y + near + 6} ${x0} ${y + near} Z`;
  const id = "tube-clip";
  const innerH = near * 2 - 14;
  const surface = y + near - 8 - innerH * level;
  return (
    <g>
      <path d={d} fill="#F6D3C7" stroke={wall > 4 ? "#8E3B33" : C.ink} strokeWidth={7 + wall} />
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <rect x={x0} y={surface} width={x1 - x0 + 8} height={innerH + 30} fill="#E79E90" opacity={0.5} clipPath={`url(#${id})`} />
    </g>
  );
};

export const Drop: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx="0" cy="0" rx="16" ry="11" fill={C.coral} stroke={C.coralDark} strokeWidth={3} />
    <ellipse cx="-4" cy="-3" rx="5" ry="3" fill="#F8D2C8" opacity={0.8} />
  </g>
);

export const Gauge: React.FC<{x: number; y: number; hi: number; lo: number; sys: number; dia: number; r?: number; hideText?: boolean}> = ({x, y, hi, lo, sys, dia, r = 100, hideText = false}) => {
  const arc = (a0: number, a1: number, color: string) => {
    const p = (a: number, rad: number) => [Math.cos(a) * rad, Math.sin(a) * rad];
    const [sx, sy] = p(a0, r - 28);
    const [ex, ey] = p(a1, r - 28);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return <path d={`M ${sx} ${sy} A ${r - 28} ${r - 28} 0 ${large} 1 ${ex} ${ey}`} stroke={color} strokeWidth={16} fill="none" />;
  };
  const needle = (amount: number, color: string, w: number, len: number) => {
    const a = Math.PI + Math.min(1, Math.max(0, amount)) * Math.PI;
    return (
      <line x1={0} y1={0} x2={Math.cos(a) * (r - len)} y2={Math.sin(a) * (r - len)} stroke={color} strokeWidth={w} strokeLinecap="round" />
    );
  };
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    ticks.push(
      <line
        key={i}
        x1={Math.cos(a) * (r - 50)}
        y1={Math.sin(a) * (r - 50)}
        x2={Math.cos(a) * (r - 36)}
        y2={Math.sin(a) * (r - 36)}
        stroke={C.ink}
        strokeWidth={3}
      />,
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={r + 18} rx={r * 0.7} ry="16" fill="rgba(63,45,28,0.12)" />
      <circle r={r} fill={C.paperLight} stroke={C.ink} strokeWidth={8} />
      <circle r={r - 22} fill="#FBF6EA" />
      {arc(Math.PI, Math.PI + Math.PI * 0.5, "#BFE0D6")}
      {arc(Math.PI + Math.PI * 0.5, Math.PI + Math.PI * 0.72, C.amberLight)}
      {arc(Math.PI + Math.PI * 0.72, Math.PI * 2, C.coralLight)}
      {ticks}
      {needle(lo, C.tealDark, 7, 58)}
      {needle(hi, C.coralDark, 9, 28)}
      <circle r={12} fill={C.ink} />
      {hideText ? null : (
        <text y={r + 74} textAnchor="middle" fontFamily={SANS} fontSize={52} fontWeight={800} fill={C.ink}>
          {sys} / {dia}
        </text>
      )}
    </g>
  );
};

export const Ecg: React.FC<{x: number; y: number; w: number; t: number; fast: boolean}> = ({x, y, w, t, fast}) => {
  const period = fast ? 0.42 : 0.78;
  let d = "";
  for (let i = 16; i < w - 16; i += 6) {
    const ph = (((i / 150 - t / period) % 1) + 1) % 1;
    let dy = 0;
    if (ph > 0.06 && ph < 0.16) dy = -46 * Math.sin(((ph - 0.06) / 0.1) * Math.PI);
    else if (ph > 0.16 && ph < 0.22) dy = 16 * Math.sin(((ph - 0.16) / 0.06) * Math.PI);
    d += `${d ? "L" : "M"} ${x + i} ${y + dy} `;
  }
  return (
    <g>
      <rect x={x} y={y - 54} width={w} height={108} rx={26} fill="rgba(255,252,245,0.72)" stroke={C.inkSoft} strokeWidth={4} />
      <path d={d} fill="none" stroke={C.coralDark} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

export const SaltShaker: React.FC<{x: number; y: number; tilt: number; grains: number}> = ({x, y, tilt, grains}) => (
  <g transform={`translate(${x} ${y}) rotate(${-tilt * 28})`}>
    <ellipse cx="0" cy="78" rx="70" ry="16" fill="rgba(63,45,28,0.12)" />
    <rect x={-56} y={-34} width={112} height={116} rx={18} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <rect x={-50} y={-74} width={100} height={44} rx={14} fill="#DCE8E4" stroke={C.tealDark} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={-30 + i * 20} cy={-58} r={4} fill={C.ink} />
    ))}
    <text y={28} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={800} fill={C.coralDark}>盐</text>
    {Array.from({length: 5}).map((_, i) => {
      const p = (grains + i * 0.2) % 1;
      return <circle key={i} cx={-40 + i * 22} cy={-96 + p * 130} r={5} fill={C.white} opacity={1 - p} />;
    })}
  </g>
);

/** 血压袖带：绑带 + 小表盘，一眼认出是量血压的家伙。 */
export const Cuff: React.FC<{x: number; y: number; inflate: number}> = ({x, y, inflate}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cy={112} rx={132} ry={13} fill="rgba(63,45,28,0.12)" />
    <g transform={`rotate(-4) scale(${1 + inflate * 0.05})`}>
      <rect x={-150} y={-74} width={252} height={148} rx={34} fill="#DCE8E4" stroke={C.tealDark} strokeWidth={7} />
      <line x1={-110} y1={-74} x2={-110} y2={74} stroke={C.teal} strokeWidth={5} opacity={0.45} />
      <line x1={20} y1={-74} x2={20} y2={74} stroke={C.teal} strokeWidth={5} opacity={0.45} />
      <rect x={-60} y={-18} width={72} height={34} rx={8} fill={C.paperLight} stroke={C.paperShadow} strokeWidth={3} />
    </g>
    <path d={`M96 -30 C 140 -22 ${150 + inflate * 6} 10 ${150 + inflate * 6} 34`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    <circle cx={158} cy={62} r={32} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <line
      x1={158}
      y1={62}
      x2={158 + Math.cos(-1.1 + inflate * 1.6) * 20}
      y2={62 + Math.sin(-1.1 + inflate * 1.6) * 20}
      stroke={C.coralDark}
      strokeWidth={5}
      strokeLinecap="round"
    />
    <circle cx={158} cy={62} r={4} fill={C.ink} />
  </g>
);

export const Logbook: React.FC<{x: number; y: number; days: number; showLine: boolean}> = ({x, y, days, showLine}) => (
  <g transform={`translate(${x} ${y}) rotate(-2)`}>
    <rect x={-190} y={-170} width={380} height={380} rx={18} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <text y={-112} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={C.ink}>家庭血压记录</text>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} opacity={i < days ? 1 : 0.35}>
        <text x={-150} y={-40 + i * 44} fontFamily={SANS} fontSize={32} fill={C.inkSoft}>第{i + 1}天</text>
        <line x1={-40} y1={-28 + i * 44} x2={150} y2={-28 + i * 44} stroke={C.paperShadow} strokeWidth={3} />
        {i < days ? (
          <polyline points={`-20,${-40 + i * 44} 40,${-52 + i * 44} 110,${-36 + i * 44}`} fill="none" stroke={C.coralDark} strokeWidth={5} />
        ) : null}
      </g>
    ))}
    {showLine ? (
      <g>
        <line x1={-160} y1={128} x2={160} y2={128} stroke={C.tealDark} strokeWidth={4} strokeDasharray="12 8" />
        <text y={168} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={C.tealDark}>135 / 85</text>
      </g>
    ) : null}
  </g>
);

/** 家庭血压记录卡：三天数字 + 平均，最后浮现 135 / 85 的线。整体 400×210，能塞进主体区下部。 */
export const RecordCard: React.FC<{x: number; y: number; days: number; showLine: boolean}> = ({x, y, days, showLine}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={112} rx={196} ry={13} fill="rgba(63,45,28,0.10)" />
    <rect x={-200} y={-100} width={400} height={212} rx={20} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
    <text x={-172} y={-52} fontFamily={SANS} fontSize={34} fontWeight={700} fill={C.ink}>家庭记录</text>
    <text x={172} y={-52} textAnchor="end" fontFamily={SANS} fontSize={28} fill={C.inkSoft}>连测几天</text>
    {[0, 1, 2].map((i) => (
      <g key={i} opacity={i < days ? 1 : 0.22}>
        <rect x={-172 + i * 118} y={-30} width={106} height={78} rx={12} fill="#FBF6EA" stroke={C.paperShadow} strokeWidth={2} />
        <text x={-119 + i * 118} y={2} textAnchor="middle" fontFamily={SANS} fontSize={23} fill={C.inkSoft}>第{i + 1}天</text>
        <text x={-119 + i * 118} y={34} textAnchor="middle" fontFamily={SANS} fontSize={31} fontWeight={700} fill={C.ink}>
          {["138/86", "141/88", "136/84"][i]}
        </text>
      </g>
    ))}
    <line x1={-172} y1={70} x2={172} y2={70} stroke={showLine ? C.coralDark : C.paperShadow} strokeWidth={4} strokeDasharray="10 8" />
    <text x={-172} y={98} fontFamily={SANS} fontSize={27} fill={showLine ? C.coralDark : C.inkSoft}>
      {showLine ? "平均 138 / 86 · 高于 135 / 85" : "平均 138 / 86"}
    </text>
  </g>
);

export const Spoon: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y}) rotate(-20)`}>
    <rect x={-16} y={-110} width={32} height={150} rx={14} fill="#D9C7AE" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={66} rx={62} ry={34} fill="#EFE3CE" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={62} rx={46} ry={22} fill={C.white} />
    <text y={70} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={C.coralDark}>5 g</text>
  </g>
);

export const PillBox: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-78} y={-56} width={156} height={112} rx={16} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <rect x={-78} y={-56} width={156} height={42} rx={16} fill="#DCE8E4" stroke={C.tealDark} strokeWidth={5} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-36 + i * 36} cy={24} r={15} fill={i % 2 ? C.amberLight : C.tealLight} stroke={C.ink} strokeWidth={3} />
    ))}
  </g>
);

export const Calendar: React.FC<{x: number; y: number; marked: boolean}> = ({x, y, marked}) => (
  <g transform={`translate(${x} ${y}) rotate(4)`}>
    <rect x={-86} y={-80} width={172} height={160} rx={14} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
    <rect x={-86} y={-80} width={172} height={42} rx={12} fill={C.coral} />
    <text y={-50} textAnchor="middle" fontFamily={SANS} fontSize={30} fontWeight={700} fill={C.white}>复查</text>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-52} y1={-8 + i * 28} x2={52} y2={-8 + i * 28} stroke={C.paperShadow} strokeWidth={3} />
    ))}
    {marked ? <circle cx={12} cy={36} r={20} fill="none" stroke={C.coralDark} strokeWidth={6} /> : null}
  </g>
);

/** 快走：两只交替上前的鞋印，比胶囊点更能读成「走路」。 */
export const Steps: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const px = x + i * 74;
      const py = y - (i % 2) * 26;
      const lit = 0.35 + 0.6 * Math.max(0, Math.sin(t * 3 - i * 0.7));
      return (
        <g key={i} transform={`translate(${px} ${py}) rotate(${i % 2 ? 10 : -8})`} opacity={lit}>
          <ellipse cx={0} cy={-14} rx={17} ry={24} fill={C.tealDark} />
          <ellipse cx={0} cy={18} rx={12} ry={10} fill={C.tealDark} />
        </g>
      );
    })}
  </g>
);

export const Person: React.FC<{x: number; y: number; tense: number}> = ({x, y, tense}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="150" rx="70" ry="16" fill="rgba(63,45,28,0.12)" />
    <rect x={-46} y={20} width={92} height={130} rx={30} fill="#E7D3BE" stroke={C.ink} strokeWidth={6} />
    <circle cy={-40} r={48} fill="#F0C7A8" stroke={C.ink} strokeWidth={6} />
    <path d={`M -16 -28 Q 0 ${-18 + tense * 10} 16 -28`} fill="none" stroke={C.ink} strokeWidth={4} />
    {tense > 0.4 ? (
      <g stroke={C.amber} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.5 + tense * 0.5}>
        <path d="M56 -92 l13 21 l-15 5 l13 21" />
        <path d="M78 -106 l13 21 l-15 5 l13 21" />
      </g>
    ) : null}
  </g>
);

export const BrandMark: React.FC = () => (
  <div style={{position: "absolute", left: 72, top: 48, display: "flex", alignItems: "center", gap: 16}}>
    <Img src={staticFile("avatar.jpg")} style={{width: 72, height: 72, borderRadius: 36, border: `4px solid ${C.ink}`, objectFit: "cover"}} />
    <div style={{fontFamily: SANS, fontSize: 36, color: C.ink, fontWeight: 700}}>医学科普漫画</div>
  </div>
);

export const Caption: React.FC<{lines: string[]; accent?: boolean}> = ({lines, accent}) => (
  <div
    style={{
      position: "absolute",
      left: 72,
      right: 320,
      top: 150,
      fontFamily: FONT,
      fontSize: lines.join("").length > 16 ? 60 : 68,
      lineHeight: 1.28,
      fontWeight: 800,
      color: accent ? C.coralDark : C.ink,
    }}
  >
    {lines.map((row) => (
      <div key={row}>{row}</div>
    ))}
  </div>
);

export const Nameplate: React.FC<{name: string; role: string; x: number; y: number}> = ({name, role, x, y}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      background: C.paperLight,
      border: `3px solid ${C.ink}`,
      borderRadius: 16,
      padding: "12px 20px",
      maxWidth: 470,
      boxShadow: "6px 8px 0 rgba(63,45,28,0.08)",
    }}
  >
    <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 800, color: C.ink}}>{name}</div>
    <div style={{fontFamily: SANS, fontSize: 44, color: C.inkSoft, marginTop: 2}}>{role}</div>
  </div>
);

/** 卡片宽度按文本估算（中文 1em，西文 0.55em），供指示线找卡片边缘用。 */
export const cardWidth = (term: string, role: string, lines: string[], fs = 46) => {
  const textW = (s: string, unit: number) =>
    [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 255 ? 1 : 0.55), 0) * unit;
  const plain = lines.map((l) => l.replace(/\*\*/g, ""));
  return Math.ceil(Math.max(Math.max(...plain.map((l) => textW(l, fs))), textW(term, 38) + 32 + textW(role, 32) + 14)) + 52;
};

/** 用 **词** 标出的关键词染成强调色，其余保持墨色。 */
const emphasize = (row: string, color: string) =>
  row.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{color, fontWeight: 900}}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );


/** 跟随焦点元素的解说卡：词条章 + 解说两行。宽度按文本估算，保证贴着主角放。 */
export const FocusCard: React.FC<{
  term: string;
  role: string;
  lines: string[];
  accent?: boolean;
  x: number;
  y: number;
}> = ({term, role, lines, accent, x, y}) => {
  const fs = 46;
  const w = cardWidth(term, role, lines, fs);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        background: C.paperLight,
        border: `5px solid ${C.ink}`,
        borderRadius: 22,
        padding: "18px 24px",
        boxShadow: "8px 10px 0 rgba(63,45,28,0.10)",
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap"}}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 38,
            fontWeight: 900,
            color: "#FFFCF5",
            background: accent ? C.coralDark : C.tealDark,
            borderRadius: 12,
            padding: "2px 16px",
          }}
        >
          {term}
        </span>
        <span style={{fontFamily: SANS, fontSize: 32, fontWeight: 700, color: C.inkSoft}}>{role}</span>
      </div>
      <div style={{marginTop: 10}}>
        {lines.map((row) => (
          <div key={row} style={{fontFamily: FONT, fontSize: fs, lineHeight: 1.3, fontWeight: 800, color: C.ink, whiteSpace: "nowrap"}}>
            {emphasize(row, C.coralDark)}
          </div>
        ))}
      </div>
    </div>
  );
};
