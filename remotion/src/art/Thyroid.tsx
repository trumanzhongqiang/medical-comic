import React from "react";
import {C} from "../theme";
import {clamp, inOut, lerp, seg} from "../motion";
import {Arrow, Label, Ruler, Sheet, Tag} from "../diagrams";
import {Person, PillBox} from "../parts";
import {Chip, X0, X1} from "./kit";

/* 第 7 期：甲亢和甲减
 * 一个主角：甲状腺（两片腺叶 + 前面横着的峡部，包着气管）。
 * 一条隐喻：激素是油门，甲状腺是踩油门的脚。
 * 每拍只做一件事：先给出能指认的物体和名字，再给它在做什么。
 */

const HOT = C.coralDark;
const COLD = C.tealDark;

/* ---------- 主角：甲状腺 ---------- */

const Gland: React.FC<{
  x: number;
  y: number;
  s?: number;
  heat?: number; // 0 冷（甲减）→ 1 热（甲亢）
  beat?: number;
  label?: string;
  labelTone?: string;
}> = ({x, y, s = 1, heat = 0.45, beat = 0, label, labelTone}) => {
  const pulse = 1 + 0.025 * Math.sin(beat * Math.PI * 2);
  const tone = heat > 0.5 ? HOT : COLD;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pulse})`}>
      {/* 气管：从腺体中间穿过去 */}
      <rect x={-24} y={-150} width={48} height={300} rx={22} fill="#F1E3D0" stroke={C.ink} strokeWidth={6} />
      {[-116, -78, -40, 46, 84, 122].map((ry) => (
        <line key={ry} x1={-21} y1={ry} x2={21} y2={ry} stroke="#D9C6AE" strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* 两片腺叶 */}
      <ellipse cx={-66} cy={-4} rx={56} ry={100} fill="#E5B98F" stroke={C.ink} strokeWidth={7} transform="rotate(-12 -66 -4)" />
      <ellipse cx={66} cy={-4} rx={56} ry={100} fill="#E5B98F" stroke={C.ink} strokeWidth={7} transform="rotate(12 66 -4)" />
      <ellipse cx={-66} cy={-4} rx={56} ry={100} fill={tone} opacity={heat * 0.5} transform="rotate(-12 -66 -4)" />
      <ellipse cx={66} cy={-4} rx={56} ry={100} fill={tone} opacity={heat * 0.5} transform="rotate(12 66 -4)" />
      {/* 峡部：气管前面那一条 */}
      <rect x={-40} y={30} width={80} height={42} rx={20} fill="#E5B98F" stroke={C.ink} strokeWidth={6} />
      <rect x={-40} y={30} width={80} height={42} rx={20} fill={tone} opacity={heat * 0.5} />
      {heat > 0.62 ? (
        <g stroke={HOT} strokeWidth={5} strokeLinecap="round" opacity={(heat - 0.62) * 2.4}>
          <path d="M -132 -104 l -24 -20 M -138 -26 l -26 -8 M 132 -104 l 24 -20 M 138 -26 l 26 -8" />
        </g>
      ) : null}
      {label ? <Label x={0} y={186} text={label} size={28} weight={800} color={labelTone ?? C.ink} /> : null}
    </g>
  );
};

/* ---------- 激素水平柱 ---------- */

const LevelBar: React.FC<{x: number; y: number; frac: number; h?: number; w?: number; label?: string; tone?: string}> = ({
  x,
  y,
  frac,
  h = 300,
  w = 96,
  label,
  tone = HOT,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={24} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
    <rect x={-w / 2 + 8} y={-h + 8 + (h - 16) * (1 - clamp(frac))} width={w - 16} height={(h - 16) * clamp(frac)} rx={18} fill={tone} />
    <line x1={-w / 2 - 26} y1={-h * 0.55} x2={w / 2 + 26} y2={-h * 0.55} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="10 8" />
    <Label x={w / 2 + 32} y={-h * 0.55 + 8} text="正常" size={22} anchor="start" color={C.inkSoft} weight={700} />
    <Label x={0} y={34} text={label ?? "激素"} size={28} weight={800} color={C.inkSoft} />
  </g>
);

/* ---------- 油门踏板 ---------- */

const Pedal: React.FC<{x: number; y: number; press: number; stuck?: boolean; tone?: string; label?: string}> = ({
  x,
  y,
  press,
  stuck,
  tone = COLD,
  label,
}) => {
  // 铰链在下、踏板面在上：踩下去就是踏板面往后倒。
  // 角度从竖直算起，10° 是松开、50° 是踩到底，一眼能看出深浅。
  const base = y + 96;
  const th = ((10 + clamp(press) * 40) * Math.PI) / 180;
  const L = 196;
  const px = x + Math.sin(th) * L;
  const py = base - Math.cos(th) * L;
  const deg = (th * 180) / Math.PI;
  return (
    <g>
      <path d={`M ${x - 150} ${base} L ${x + 300} ${base}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <circle cx={x} cy={base} r={13} fill={C.ink} />
      <line x1={x} y1={base} x2={px} y2={py} stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
      <g transform={`translate(${px} ${py}) rotate(${deg})`}>
        <rect x={-84} y={-18} width={168} height={36} rx={10} fill={tone} stroke={C.ink} strokeWidth={6} />
        <line x1={-52} y1={0} x2={52} y2={0} stroke={C.paperLight} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      </g>
      {/* 往下压的力：一支粗箭头，踩得越深越粗越长，不用画脚也看得懂。
          原来箭头旁边还写一个「踩」字，箭头本身已经说完了，删。 */}
      <Arrow x0={px} y0={py - 122} x1={px} y1={py - 30} p={1} color={tone} width={7 + 12 * clamp(press)} head={20} />
      {stuck ? (
        <g>
          <path
            d={`M ${px - 40} ${base} L ${px + 40} ${base} L ${px + 26} ${py + 32} L ${px - 26} ${py + 32} Z`}
            fill={HOT}
            stroke={C.ink}
            strokeWidth={5}
          />
          <Label x={px + 104} y={base - 30} text="卡住了" size={28} weight={800} color={HOT} />
        </g>
      ) : null}
      {label ? <Label x={x + 76} y={base + 58} text={label} size={26} weight={700} color={C.inkSoft} /> : null}
    </g>
  );
};

/* ---------- 心率表 ---------- */

const HeartGauge: React.FC<{x: number; y: number; r?: number; bpm: number; tone?: string}> = ({x, y, r = 150, bpm, tone = C.ink}) => {
  const a = Math.PI + ((clamp(bpm, 30, 160) - 30) / 130) * Math.PI;
  const pt = (ang: number, rad: number) => [Math.cos(ang) * rad, Math.sin(ang) * rad];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={r + 20} rx={r * 0.72} ry={18} fill="rgba(63,45,28,0.12)" />
      <circle r={r} fill={C.paperLight} stroke={C.ink} strokeWidth={8} />
      <path
        d={`M ${pt(Math.PI, r - 30)[0]} ${pt(Math.PI, r - 30)[1]} A ${r - 30} ${r - 30} 0 0 1 ${pt(Math.PI * 2, r - 30)[0]} ${pt(Math.PI * 2, r - 30)[1]}`}
        stroke={C.paperShadow}
        strokeWidth={18}
        fill="none"
      />
      <path
        d={`M ${pt(Math.PI, r - 30)[0]} ${pt(Math.PI, r - 30)[1]} A ${r - 30} ${r - 30} 0 0 1 ${pt(a, r - 30)[0]} ${pt(a, r - 30)[1]}`}
        stroke={tone}
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
      />
      <line x1={0} y1={0} x2={Math.cos(a) * (r - 54)} y2={Math.sin(a) * (r - 54)} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <circle r={14} fill={C.ink} />
      <Label x={0} y={r * 0.6} text={`${Math.round(bpm)}`} size={66} weight={800} color={tone} />
      <Label x={0} y={r * 0.6 + 42} text="次 / 分" size={26} weight={700} color={C.inkSoft} />
    </g>
  );
};

/* ---------- 读数卡 ---------- */

const StatCard: React.FC<{x: number; y: number; w?: number; h?: number; label: string; value: string; unit?: string; tone?: string; on?: number}> = ({
  x,
  y,
  w = 296,
  h = 300,
  label,
  value,
  unit,
  tone = C.ink,
  on = 1,
}) => (
  <g opacity={on}>
    <rect x={x} y={y} width={w} height={h} rx={26} fill={C.paperLight} stroke={tone} strokeWidth={5} />
    <Label x={x + w / 2} y={y + 66} text={label} size={30} weight={800} color={C.inkSoft} />
    <Label x={x + w / 2} y={y + h * 0.6} text={value} size={68} weight={800} color={tone} />
    {unit ? <Label x={x + w / 2} y={y + h * 0.6 + 48} text={unit} size={26} weight={700} color={C.inkSoft} /> : null}
  </g>
);

/* ---------- 手（抖） ---------- */

const Hand: React.FC<{x: number; y: number; jitter: number}> = ({x, y, jitter}) => (
  <g transform={`translate(${x} ${y}) rotate(${jitter * 8})`}>
    <rect x={-80} y={-34} width={160} height={168} rx={44} fill="#F0C7A8" stroke={C.ink} strokeWidth={6} />
    {[-1, 0, 1, 2].map((i) => (
      <rect key={i} x={-72 + i * 38} y={-34 - 54} width={34} height={72} rx={17} fill="#F0C7A8" stroke={C.ink} strokeWidth={5} />
    ))}
    <rect x={-90} y={108} width={68} height={62} rx={30} fill="#F0C7A8" stroke={C.ink} strokeWidth={6} transform="rotate(24 -56 108)" />
    <g stroke={C.amber} strokeWidth={7} strokeLinecap="round" opacity={jitter}>
      <path d="M 108 -34 l 26 -14 M 112 6 l 30 2 M 102 -70 l 22 -24" />
    </g>
  </g>
);

/* ---------- 场景 ---------- */

export const ThyroidArt: React.FC<{
  t: number;
  scene: string;
  u: number;
  bi: number;
  stage?: number;
  su?: number;
}> = ({t, scene, u, stage = 0, su = u}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, Math.max(0.12, b - a)));
  // later：本拍第二句才开始的动作。整拍比例 u 管第一句，句内比例 su 管第二句，
  // 这样「先出现物体，再说明它在干什么」不会挤在同一秒里。
  const later = (a: number, b: number) => (stage >= 1 ? inOut(seg(su, a, Math.max(0.12, b - a))) : 0);
  const beat = (t * 0.9) % 1;

  /* 开场：一个具体的人，不是抽象的病 */
  if (scene === "tired") {
    // 一页只留一个主角：人放大占左侧两列，右侧三条等宽胶囊对齐三行网格。
    // 去掉原来那句「一样一样地找上门」和人物下的标签——它们和字幕、注解条说的是同三件事。
    const items = ["没劲", "怕冷", "长肉"];
    return (
      <g>
        <g transform="translate(318 566) scale(1.78)">
          <Person x={0} y={0} tense={0.5} />
        </g>
        {items.map((s2, i) => (
          <g key={s2} opacity={on(0.04 + i * 0.14, 0.28 + i * 0.14)}>
            <Chip x={766} y={[400, 562, 724][i]} w={332} text={s2} tone="ink" size={34} />
          </g>
        ))}
      </g>
    );
  }

  /* 体检单：一页只有一张单子和一条侧批，别把三块标签叠在右边 */
  if (scene === "report") {
    return (
      <g>
        <Sheet
          x={96}
          y={292}
          w={620}
          h={470}
          title="体检报告"
          fs={30}
          rowH={115}
          rows={[
            {name: "甲状腺彩超", value: "结节？"},
            {name: "甲状腺功能", value: "TSH ↑"},
            {name: "医生意见", value: "复查", on: true},
          ]}
        />
        {/* 右侧只留一条实心标签，对着「医生意见：复查」那一行。原来这里还有一条箭头，
            箭头尾巴悬在空白上，反而要多花一眼去猜它指什么。 */}
        <g opacity={on(0.4, 0.72)}>
          <Tag x={880} y={648} text="要查了才知道" tone="coral" solid size={28} />
        </g>
      </g>
    );
  }

  /* 大小：跟鸡蛋比一比 */
  if (scene === "size") {
    // 两样东西并排，各带一个克数，就完了。底上那句「比一个鸡蛋还轻」是字幕原话，删。
    return (
      <g>
        <Gland x={330} y={496} s={0.58} heat={0.4} beat={beat} />
        <Label x={330} y={676} text="约 20 克" size={32} weight={800} color={C.ink} />
        <g opacity={on(0.16, 0.52)}>
          <ellipse cx={772} cy={506} rx={88} ry={112} fill="#F8E9D2" stroke={C.ink} strokeWidth={7} />
          <ellipse cx={772} cy={510} rx={42} ry={54} fill="#F2C86A" opacity={0.6} />
          <Label x={772} y={676} text="约 50 克" size={32} weight={800} color={C.inkSoft} />
        </g>
      </g>
    );
  }

  /* 大脑发命令：TSH 是什么。左边大脑、右边甲状腺，中间就是那条命令 */
  if (scene === "tsh") {
    return (
      <g>
        <g transform="translate(276 520) scale(1.12)">
          <path
            d="M -132 0 Q -150 -76 -74 -96 Q -34 -132 30 -104 Q 104 -122 132 -62 Q 168 -8 116 34 Q 54 78 -22 62 Q -104 78 -132 0 Z"
            fill="#F3D9C6"
            stroke={C.ink}
            strokeWidth={7}
          />
          <path
            d="M -62 -70 q 34 26 8 60 M 14 -86 q -26 34 8 66 M 66 -66 q -34 34 8 60"
            fill="none"
            stroke={C.inkSoft}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        <Label x={276} y={352} text="大脑" size={30} weight={800} color={C.inkSoft} />
        <Arrow x0={446} y0={540} x1={666} y1={572} p={on(0.08, 0.46)} color={HOT} width={9} />
        {/* 命令只写一个词：TSH。旁边再挂一句「下一道命令」是同一件事说两遍。 */}
        <Label x={556} y={502} text="TSH" size={38} weight={800} color={HOT} />
        <Gland x={812} y={566} s={0.76} heat={0.75} beat={beat} label="甲状腺" />
        <g opacity={later(0.04, 0.36)}>
          <path
            d="M 760 726 Q 580 830 410 650"
            fill="none"
            stroke={COLD}
            strokeWidth={6}
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
          <Label x={592} y={806} text="激素够了就少催" size={28} weight={800} color={COLD} />
        </g>
      </g>
    );
  }

  if (scene === "split") {
    // 左右两个人 + 中间一个腺体，就是全部。原来底部那句「同一个腺体，两套完全相反的表现」
    // 和注解条一字不差，等于同一句话说两遍，拿掉了。
    return (
      <g>
        <Person x={196} y={440} tense={0.85} />
        <Person x={884} y={440} tense={0.1} />
        <Label x={196} y={320} text="甲亢" size={32} weight={800} color={C.coralDark} />
        <Label x={884} y={320} text="甲减" size={32} weight={800} color={C.tealDark} />
        <Gland x={540} y={540} s={0.78} heat={0.5} beat={beat} label="甲状腺" />
        <g opacity={on(0.3, 0.58)}>
          <Chip x={196} y={716} w={282} text="吃得多还瘦" tone="coral" size={28} />
        </g>
        <g opacity={on(0.46, 0.74)}>
          <Chip x={884} y={716} w={282} text="昏昏欲睡" tone="teal" size={28} />
        </g>
      </g>
    );
  }

  if (scene === "signs-hyper" || scene === "signs-hypo") {
    const hyper = scene === "signs-hyper";
    const items = hyper ? ["吃得多", "掉秤", "心慌、手抖", "怕热"] : ["怕冷", "犯困", "发胖", "皮肤干"];
    const tone = hyper ? "coral" : "teal";
    // 四个症状排成 2×2 等宽网格。原来四个几乎同时淡入（间隔 0.06），像一下子撒出来；
    // 现在每 0.14 一个，跟着旁白一个一个报，报到一个亮一个。腺体那头也去掉了箭头。
    return (
      <g>
        <Gland x={206} y={556} s={0.9} heat={hyper ? 1 : 0.05} beat={beat} label={hyper ? "激素太多" : "激素太少"} labelTone={hyper ? HOT : COLD} />
        {items.map((s2, i) => (
          <g key={s2} opacity={on(0.06 + i * 0.14, 0.26 + i * 0.14)}>
            <Chip x={[674, 916][i % 2]} y={[416, 416, 604, 604][i]} w={228} text={s2} tone={tone} size={28} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "opposite") {
    // 两条线 + 两个词。纵轴「正常水平 / 时间」这两条刻度说明对老人没意义，删。
    return (
      <g>
        <line x1={X0 + 30} y1={620} x2={X1 - 20} y2={620} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path
          d={`M ${X0 + 40} 560 C ${X0 + 220} 560 ${X0 + 300} 470 ${X0 + 460} 452 C ${X0 + 620} 436 ${X0 + 720} 430 ${X1 - 40} 424`}
          fill="none"
          stroke={HOT}
          strokeWidth={12}
          strokeLinecap="round"
          opacity={on(0.08, 0.55)}
        />
        <path
          d={`M ${X0 + 40} 560 C ${X0 + 220} 560 ${X0 + 300} 660 ${X0 + 460} 690 C ${X0 + 620} 716 ${X0 + 720} 726 ${X1 - 40} 734`}
          fill="none"
          stroke={COLD}
          strokeWidth={12}
          strokeLinecap="round"
          opacity={on(0.2, 0.68)}
        />
        <Tag x={X1 - 132} y={382} text="甲亢：激素多" tone="coral" solid size={28} />
        <Tag x={X1 - 132} y={782} text="甲减：激素少" tone="teal" solid size={28} />
      </g>
    );
  }

  if (scene === "neck") {
    // 一屏只留三处字：甲状腺（带引线）、喉结（贴脖子左侧，不画箭头）、摸不出来（虚线）。
    // 「气管两旁」那条和它的小箭头删了 —— 旁白正在说这句话，画面再写一遍只是重复。
    return (
      <g transform="translate(0 46)">
        <circle cx={430} cy={344} r={94} fill="#F0C7A8" stroke={C.ink} strokeWidth={7} />
        <path d="M 362 428 Q 430 466 498 428 L 512 640 Q 430 684 348 640 Z" fill="#F0C7A8" stroke={C.ink} strokeWidth={7} />
        <rect x={414} y={450} width={54} height={220} rx={26} fill="#F1E3D0" stroke={C.ink} strokeWidth={6} />
        {[484, 524, 564, 604, 644].map((ry) => (
          <line key={ry} x1={418} y1={ry} x2={464} y2={ry} stroke="#D9C6AE" strokeWidth={4} strokeLinecap="round" />
        ))}
        <path d="M 396 442 Q 430 462 464 442" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {/* 两片都画出来：只画右边一片，看着像脖子上长了个东西，不是腺体 */}
        <ellipse cx={398} cy={566} rx={30} ry={66} fill="#E5B98F" stroke={C.ink} strokeWidth={6} transform="rotate(-8 398 566)" />
        <ellipse cx={398} cy={566} rx={30} ry={66} fill={HOT} opacity={0.22} transform="rotate(-8 398 566)" />
        <ellipse cx={512} cy={566} rx={30} ry={66} fill="#E5B98F" stroke={C.ink} strokeWidth={6} transform="rotate(8 512 566)" />
        <ellipse cx={512} cy={566} rx={30} ry={66} fill={HOT} opacity={0.22} transform="rotate(8 512 566)" />
        <Label x={302} y={450} text="喉结" size={26} anchor="end" weight={700} color={C.inkSoft} />
        <Tag x={790} y={540} text="甲状腺" tone="ink" solid size={32} />
        <Arrow x0={714} y0={548} x1={548} y1={566} p={on(0.15, 0.6)} color={C.ink} width={6} />
        {/* 第二句：摸不出来 */}
        <g opacity={later(0.06, 0.4)}>
          <ellipse cx={455} cy={566} rx={112} ry={84} fill="none" stroke={C.inkSoft} strokeWidth={4} strokeDasharray="10 9" />
          <Label x={455} y={702} text="摸不出来" size={28} weight={800} color={C.inkSoft} />
        </g>
      </g>
    );
  }

  if (scene === "where") {
    // 三个词：左叶、右叶、峡部。原来左右各一条箭头，下面还并排两条胶囊写克数和位置，
    // 这一拍只是在认零件，不需要再说一遍重量（下一拍专门讲重量）。
    return (
      <g>
        <Gland x={540} y={540} s={1.05} heat={0.4} beat={beat} />
        <Label x={396} y={420} text="左叶" size={32} anchor="end" weight={800} color={C.inkSoft} />
        <Label x={684} y={420} text="右叶" size={32} anchor="start" weight={800} color={C.inkSoft} />
        <line x1={540} y1={672} x2={540} y2={608} stroke={C.tealDark} strokeWidth={5} strokeLinecap="round" strokeDasharray="8 8" opacity={on(0.3, 0.6)} />
        <Label x={540} y={710} text="峡部" size={30} weight={800} color={C.tealDark} />
      </g>
    );
  }

  if (scene === "systemic") {
    // 原来是「一个腺体 + 三条箭头 + 三行卡片 + 两组右侧标签」，一屏九个块。
    // 现在只有三行字：心跳 / 体温 / 精神，右边接一句大白话。箭头和腺体都去掉，
    // 因为这一拍要讲的是「它管着全身」，不是「它长什么样」。
    const rows = [
      {label: "心跳", detail: "快，还是慢", tone: HOT},
      {label: "体温", detail: "怕热，还是怕冷", tone: C.amber},
      {label: "精神", detail: "有劲，还是犯困", tone: COLD},
    ];
    const cardP = on(0.02, 0.32);
    // 右侧那半句从第二句起就出现：卡片空着半边，看着像没做完。
    const detailP = stage >= 1 ? inOut(seg(su, 0.04, 0.42)) : 0;
    return (
      <g>
        {rows.map((r, i) => {
          const y = 330 + i * 160;
          return (
            <g key={r.label} opacity={cardP}>
              <rect x={96} y={y} width={888} height={124} rx={26} fill={C.paperLight} stroke={r.tone} strokeWidth={5} />
              <Label x={180} y={y + 80} text={r.label} size={46} anchor="start" weight={800} color={r.tone} />
              <g opacity={detailP}>
                <Label x={948} y={y + 78} text={r.detail} size={34} anchor="end" weight={700} color={C.ink} />
              </g>
            </g>
          );
        })}
      </g>
    );
  }

  if (scene === "pedal" || scene === "pedal-gentle" || scene === "pedal-stuck" || scene === "pedal-off") {
    const press =
      scene === "pedal"
        ? 0.45
        : scene === "pedal-gentle"
          ? lerp(0.12, 0.88, on(0.12, 0.72))
          : scene === "pedal-stuck"
            ? 1
            : 0.04;
    const tone = scene === "pedal-stuck" ? HOT : scene === "pedal-off" ? COLD : C.amber;
    // 四个 pedal 场景共用这一套：腺体 + 一条箭头 + 踏板 + 一句状态词。
    // 原来踏板底下还写着「踏板 = 全身的快慢」，这一整句字幕正在说，删。
    return (
      <g>
        <Gland x={196} y={540} s={0.66} heat={scene === "pedal-stuck" ? 1 : scene === "pedal-off" ? 0.05 : 0.5} beat={beat} label="甲状腺" />
        <Arrow x0={336} y0={548} x1={664} y1={588} p={on(0.05, 0.45)} color={tone} width={7} />
        <Label x={470} y={506} text="激素 = 油门" size={28} weight={800} color={tone} />
        <Pedal
          x={700}
          y={500}
          press={press}
          stuck={scene === "pedal-stuck"}
          tone={tone}
          label={scene === "pedal-stuck" ? "一直往下踩" : scene === "pedal-off" ? "几乎不踩" : undefined}
        />
      </g>
    );
  }

  if (scene === "fast" || scene === "slow") {
    // 一块表就够了。原来表和激素柱并排，两个都在动，眼睛不知道看哪个。
    // 这一拍要说的是「心跳被推快了」，数字 70→118 比柱子更直接。
    const fast = scene === "fast";
    const bpm = lerp(70, fast ? 118 : 48, on(0.1, 0.8));
    return (
      <g>
        <HeartGauge x={540} y={520} r={192} bpm={bpm} tone={fast ? HOT : COLD} />
        <Tag x={540} y={786} text={fast ? "全身被迫加速" : "全身都慢下来"} tone={fast ? "coral" : "teal"} solid size={30} />
      </g>
    );
  }

  if (scene === "hyper-body") {
    const cards = [
      {label: "心率", value: "110", unit: "次 / 分", tone: HOT},
      {label: "出汗", value: "多", unit: "怕热、爱出汗", tone: C.amber},
      {label: "体重", value: "↓", unit: "吃得多还掉秤", tone: HOT},
    ];
    return (
      <g>
        {cards.map((c, i) => (
          <StatCard key={c.label} x={56 + i * 328} y={366} w={296} h={300} label={c.label} value={c.value} unit={c.unit} tone={c.tone} on={on(0.04 + i * 0.2, 0.36 + i * 0.2)} />
        ))}
        <g opacity={on(0.66, 0.94)}>
          <Tag x={540} y={796} text="激素多：全程开快车" tone="coral" size={30} />
        </g>
      </g>
    );
  }

  if (scene === "hypo-body") {
    const cards = [
      {label: "心率", value: "50", unit: "次 / 分", tone: COLD},
      {label: "体温", value: "35.6", unit: "℃ · 怕冷", tone: COLD},
      {label: "肠道", value: "慢", unit: "容易便秘", tone: C.amber},
    ];
    return (
      <g>
        {cards.map((c, i) => (
          <StatCard key={c.label} x={56 + i * 328} y={366} w={296} h={300} label={c.label} value={c.value} unit={c.unit} tone={c.tone} on={on(0.04 + i * 0.2, 0.36 + i * 0.2)} />
        ))}
        <g opacity={on(0.66, 0.94)}>
          <Tag x={540} y={796} text="激素少：全身降档" tone="teal" size={30} />
        </g>
      </g>
    );
  }

  if (scene === "mood") {
    // 一只抖的手 + 三个词。原来底下还有一句「交感神经被推着走」，
    // 那是给内科医生看的说法，讲给老人听没有用，删。
    return (
      <g>
        <Hand x={320} y={520} jitter={on(0.1, 0.5)} />
        {["容易急", "容易慌", "手会抖"].map((s, i) => (
          <g key={s} opacity={on(0.1 + i * 0.14, 0.34 + i * 0.14)}>
            <Chip x={790} y={[420, 552, 684][i]} w={248} text={s} tone={i === 2 ? "amber" : "coral"} size={34} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "mirror") {
    // 照镜子：左边先一列，右边后一列。原来两列同时亮，还压着两条实心胶囊，
    // 眼睛得同时读六行。现在先看完"快"，再看"慢"，头顶那两条也降成一行字。
    const left = ["心慌、手抖", "吃得多还掉秤", "怕热"];
    const right = ["乏力、犯困", "体重往上走", "怕冷"];
    return (
      <g>
        <line x1={540} y1={336} x2={540} y2={764} stroke={C.inkSoft} strokeWidth={4} strokeDasharray="14 12" opacity={on(0.02, 0.24)} />
        <Label x={290} y={372} text="甲亢 · 太快" size={32} weight={800} color={HOT} />
        <Label x={790} y={372} text="甲减 · 太慢" size={32} weight={800} color={COLD} />
        {left.map((s, i) => (
          <g key={s} opacity={on(0.06 + i * 0.1, 0.3 + i * 0.1)}>
            <Chip x={290} y={494 + i * 122} w={300} text={s} tone="coral" size={30} />
          </g>
        ))}
        {right.map((s, i) => (
          <g key={s} opacity={on(0.34 + i * 0.1, 0.58 + i * 0.1)}>
            <Chip x={790} y={494 + i * 122} w={300} text={s} tone="teal" size={30} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "unsure") {
    // 一个人、一个问号、三个词。底下那句「症状重叠，分不出是谁」和字幕同义，删了。
    return (
      <g>
        <g transform="translate(300 500) scale(1.06)">
          <Person x={0} y={0} tense={0.6} />
        </g>
        <Label x={560} y={540} text="?" size={150} weight={800} color={HOT} />
        {["瘦", "累", "心慌"].map((s, i) => (
          <g key={s} opacity={on(0.08 + i * 0.14, 0.32 + i * 0.14)}>
            <Chip x={822} y={[420, 552, 684][i]} w={196} text={s} tone="ink" size={34} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "causes") {
    // 原来是 3 + 4 个胶囊外加 4 条箭头，十一条线互相打架。
    // 现在压成上下两行、每行三个，中间一句话把它们隔开：上面是表现，下面是别的原因。
    const sym = ["瘦", "累", "心慌"];
    const why = ["贫血", "心情不好", "血糖高"];
    return (
      <g>
        {sym.map((s, i) => (
          <g key={s} opacity={on(0.02 + i * 0.08, 0.22 + i * 0.08)}>
            <Chip x={[240, 540, 840][i]} y={396} w={212} text={s} tone="ink" size={36} />
          </g>
        ))}
        <g opacity={on(0.22, 0.42)}>
          <Label x={540} y={500} text="不一定是甲状腺" size={32} weight={700} color={C.inkSoft} />
        </g>
        {why.map((s, i) => (
          <g key={s} opacity={on(0.32 + i * 0.1, 0.54 + i * 0.1)}>
            <Chip x={[240, 540, 840][i]} y={610} w={244} text={s} tone="teal" size={36} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "lab") {
    return (
      <g>
        <Sheet
          x={190}
          y={292}
          w={700}
          h={486}
          title="甲状腺功能"
          fs={32}
          rowH={114}
          rows={[
            {name: "促甲状腺激素 TSH", value: "0.02", unit: "mIU/L ↓", on: true},
            {name: "游离 T4", value: "32", unit: "pmol/L ↑"},
            {name: "游离 T3", value: "9.6", unit: "pmol/L ↑"},
          ]}
        />
        <Tag x={540} y={820} text="抽血查，看数值不看感觉" tone="teal" size={26} />
      </g>
    );
  }

  if (scene === "ok") {
    // 两个药盒 + 两个病名 + 一行结论。原来每个盒子底下还各有一句「把激素压下去」
    // 「把缺的补上来」，加上一个大勾和一句话，五个字块同时亮。
    return (
      <g>
        <PillBox x={300} y={480} />
        <PillBox x={780} y={480} />
        <Label x={300} y={372} text="甲亢" size={38} weight={800} color={HOT} />
        <Label x={780} y={372} text="甲减" size={38} weight={800} color={COLD} />
        <Label x={300} y={600} text="压下去" size={28} weight={700} color={C.inkSoft} />
        <Label x={780} y={600} text="补上来" size={28} weight={700} color={C.inkSoft} />
      </g>
    );
  }

  if (scene === "drug-hyper") {
    return (
      <g>
        <PillBox x={540} y={384} />
        <Label x={540} y={318} text="抗甲状腺药" size={30} weight={800} color={HOT} />
        <Arrow x0={540} y0={444} x1={540} y1={542} p={on(0.1, 0.55)} color={HOT} width={8} />
        <Pedal x={540} y={586} press={lerp(1, 0.35, on(0.25, 0.85))} tone={C.amber} />
      </g>
    );
  }

  if (scene === "drug-hypo") {
    return (
      <g>
        <PillBox x={250} y={420} />
        <Label x={250} y={350} text="左甲状腺素" size={30} weight={800} color={COLD} />
        <Arrow x0={360} y0={470} x1={700} y1={520} p={on(0.1, 0.6)} color={COLD} width={7} />
        <LevelBar x={790} y={760} frac={lerp(0.12, 0.62, on(0.2, 0.85))} tone={COLD} h={400} label="激素" />
      </g>
    );
  }

  if (scene === "dose") {
    return (
      <g>
        <Label x={540} y={392} text="剂量" size={40} weight={800} color={C.ink} />
        <Ruler
          x={X0 + 20}
          y={560}
          w={X1 - X0 - 40}
          min={0}
          max={200}
          marks={[
            {v: 50, label: "50 μg"},
            {v: 100, label: "100 μg", tone: C.amber},
            {v: 150, label: "150 μg"},
          ]}
          band={{a: 50, b: 100, tone: C.amberLight}}
          p={on(0.05, 0.5)}
        />
        <Tag x={540} y={730} text="按化验结果调，别自己加、自己停" tone="coral" size={28} />
      </g>
    );
  }

  if (scene === "follow") {
    return (
      <g>
        <Label x={540} y={400} text="复查节奏" size={34} weight={800} color={C.inkSoft} />
        <line x1={X0 + 40} y1={620} x2={X1 - 40} y2={620} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        {[
          {x: 0.08, label: "开始吃药"},
          {x: 0.42, label: "6–8 周复查"},
          {x: 0.74, label: "数值变了再调量"},
        ].map((m, i) => {
          const px = X0 + 40 + (X1 - X0 - 80) * m.x;
          return (
            <g key={m.label} opacity={on(0.04 + i * 0.2, 0.3 + i * 0.2)}>
              <circle cx={px} cy={620} r={16} fill={i === 2 ? C.amber : C.tealDark} stroke={C.ink} strokeWidth={4} />
              <Label x={px} y={690} text={m.label} size={28} weight={800} color={C.ink} />
            </g>
          );
        })}
        <Tag x={540} y={762} text="不复查就调量，容易调过头" tone="teal" size={28} />
      </g>
    );
  }

  if (scene === "pregnant") {
    // 一个人、肚子里那个、右边三条。底下「妈妈和胎儿都要用激素」那句删掉 —— 字幕正在说。
    return (
      <g>
        <g transform="translate(330 500) scale(1.06)">
          <Person x={0} y={0} tense={0} />
        </g>
        <ellipse cx={330} cy={560} rx={64} ry={70} fill="#FBEDE2" stroke={C.ink} strokeWidth={6} />
        <circle cx={342} cy={566} r={30} fill="#F0C7A8" stroke={C.ink} strokeWidth={5} />
        {["备孕就查", "怀孕早期更要查", "关系孩子发育"].map((s, i) => (
          <g key={s} opacity={on(0.1 + i * 0.14, 0.34 + i * 0.14)}>
            <Chip x={806} y={[420, 556, 692][i]} w={280} text={s} tone={i === 2 ? "coral" : "teal"} size={30} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "warning") {
    const items = [
      {label: "脖子粗了", note: "照镜子能看出来"},
      {label: "声音哑了", note: "压到声带附近"},
      {label: "摸到肿块", note: "吞咽时上下动"},
    ];
    return (
      <g>
        {items.map((it, i) => {
          const x = 56 + i * 328;
          return (
            <g key={it.label} opacity={on(0.03 + i * 0.17, 0.3 + i * 0.17)}>
              <rect x={x} y={380} width={296} height={300} rx={26} fill={C.paperLight} stroke={HOT} strokeWidth={5} />
              <Label x={x + 148} y={452} text={`0${i + 1}`} size={34} weight={800} color={HOT} />
              <Label x={x + 148} y={540} text={it.label} size={34} weight={800} color={C.ink} />
              <Label x={x + 148} y={600} text={it.note} size={24} weight={700} color={C.inkSoft} />
            </g>
          );
        })}
        <g opacity={on(0.62, 0.9)}>
          <Tag x={540} y={790} text="尽快查甲状腺功能和超声" tone="coral" solid size={30} />
        </g>
      </g>
    );
  }

  if (scene === "summary") {
    const rows = [
      {a: "甲状腺", b: "油门本体", tone: C.ink},
      {a: "甲亢", b: "油门卡住", tone: HOT},
      {a: "甲减", b: "油门松垮", tone: COLD},
    ];
    return (
      <g>
        {rows.map((r, i) => (
          <g key={r.a} opacity={on(0.04 + i * 0.17, 0.3 + i * 0.17)}>
            <rect x={100} y={336 + i * 160} width={880} height={128} rx={26} fill={C.paperLight} stroke={r.tone} strokeWidth={5} />
            <Label x={200} y={336 + i * 160 + 84} text={r.a} size={44} anchor="start" weight={800} color={r.tone} />
            <Label x={960} y={336 + i * 160 + 84} text={r.b} size={40} anchor="end" weight={800} color={C.ink} />
          </g>
        ))}
      </g>
    );
  }

  return null;
};
