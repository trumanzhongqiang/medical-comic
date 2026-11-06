import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Bars, Check, Cross, Label, Sheet} from "../diagrams";
import {PillBox} from "../parts";
import {COL, Panel, ROW, X0, X1} from "./kit";

/* 第 4 期：血脂为什么分好坏
 * 一个主角：运输颗粒。一条血管当舞台。
 * 每拍只保留一个对比、一个数值、一句结论。
 */

const Vessel: React.FC<{p?: number; hot?: boolean; t?: number}> = ({p = 0, hot, t = 0}) => {
  const bulge = 108 * p;
  const y = 554 + bulge;
  // 管腔里的颗粒：一直被血流推着往右走，斑块鼓起来以后只能从下面挤过去。
  const flow = (t * 0.13) % 1;
  const core = 700 - y;
  return (
    <g>
      <rect x={90} y={554} width={900} height={146} fill="#FBEFE9" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const fx = ((flow + i / 7) % 1) * 860 + 110;
        const fy = y + core * 0.55;
        return <circle key={i} cx={fx} cy={fy} r={9} fill={C.amber} stroke="#A9771B" strokeWidth={2.5} opacity={0.75} />;
      })}
      <rect x={90} y={520} width={900} height={34} rx={12} fill="#F6D3C7" stroke={hot ? "#8E3B33" : C.ink} strokeWidth={5} />
      <rect x={90} y={700} width={900} height={34} rx={12} fill="#F6D3C7" stroke={hot ? "#8E3B33" : C.ink} strokeWidth={5} />
      <path
        d={`M 356 554 Q 430 ${y} 540 ${y} Q 650 ${y} 724 554 Z`}
        fill="#C0743F"
        stroke="#8A4A22"
        strokeWidth={4}
        opacity={p > 0.02 ? 1 : 0}
      />
      {/* 两道内层弧线：同样的轮廓往里缩，读起来是「一层一层堆上去」，不是一坨。 */}
      <g opacity={p > 0.25 ? Math.min(1, (p - 0.25) / 0.25) : 0}>
        {[0.34, 0.64].map((k) => {
          const yk = 554 + (y - 554) * k;
          return (
            <path
              key={k}
              d={`M ${356 + 70 * k} 554 Q ${430 + 42 * k} ${yk} 540 ${yk} Q ${650 - 42 * k} ${yk} ${724 - 70 * k} 554`}
              fill="none"
              stroke="#8A4A22"
              strokeWidth={3}
              opacity={0.4}
            />
          );
        })}
      </g>
      <g opacity={p > 0.5 ? 1 : 0}>
        <line x1={760} y1={y - 24} x2={806} y2={y - 54} stroke="#8A4A22" strokeWidth={3} strokeDasharray="7 6" />
        <Label x={812} y={y - 60} text="斑块" size={26} anchor="start" color="#8A4A22" weight={800} />
      </g>
    </g>
  );
};

/* 化验单是全片的地图：每一次回到它，只亮一行或两行，观众永远知道在说哪一项。
 * 单子统一放在左边（90–690），右边 712–1024 放这一行的注解，行与注解之间用虚线连。
 */
/** 一辆车：车厢 + 两个轮子 + 里面装的胆固醇。观众看到它就知道「装车」是什么意思。 */
const Car: React.FC<{x: number; y: number; s?: number; tone?: string}> = ({x, y, s = 1, tone = C.ink}) => (
  <g>
    <rect
      x={x - 92 * s}
      y={y - 54 * s}
      width={184 * s}
      height={108 * s}
      rx={26 * s}
      fill={C.paperLight}
      stroke={tone}
      strokeWidth={5}
    />
    <circle cx={x - 48 * s} cy={y + 60 * s} r={17 * s} fill={tone} opacity={0.9} />
    <circle cx={x + 48 * s} cy={y + 60 * s} r={17 * s} fill={tone} opacity={0.9} />
    <circle cx={x} cy={y} r={24 * s} fill={C.amber} stroke="#A9771B" strokeWidth={4} />
  </g>
);

const SY = 288;
const RH = 100;
const ROW_Y = (i: number) => SY + 76 + RH * i + RH / 2; // 行中线 414 / 514 / 614 / 714

const Sheet4: React.FC<{onIdx?: number[]}> = ({onIdx = []}) => (
  <Sheet
    x={90}
    y={SY}
    w={620}
    h={506}
    title="血脂四项"
    fs={32}
    rowH={RH}
    rows={[
      {name: "总胆固醇", value: "6.1", unit: "mmol/L", on: onIdx.includes(0) ? true : undefined},
      {name: "甘油三酯", value: "2.4", unit: "mmol/L", on: onIdx.includes(1) ? true : undefined},
      {name: "低密度脂蛋白", value: "4.2", unit: "mmol/L", on: onIdx.includes(2) ? true : undefined},
      {name: "高密度脂蛋白", value: "0.9", unit: "mmol/L", on: onIdx.includes(3) ? true : undefined},
    ]}
  />
);

/** 行到右侧注解的一条短虚线，跟着出现节奏淡入。 */
const Tie: React.FC<{y: number; p: number}> = ({y, p}) => (
  <line x1={714} y1={y} x2={748} y2={y} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="7 6" opacity={0.55 * p} />
);

export const LipidArt: React.FC<{t: number; scene: string; u: number; bi: number}> = ({t, scene, u}) => {
  const flow = (t * 0.12) % 1;
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  const plaque = scene === "plaque" ? on(0.05, 0.7) : 0;

  if (scene === "report") {
    // 开场这一拍就把第三行点亮：观众听到「低密度」时，眼睛已经落在那一行上，
    // 下一拍再画箭头，是递进，不是重复。
    return <Sheet4 onIdx={[2]} />;
  }

  /* 报告单上那个箭头：全片只讲这一行 */
  if (scene === "arrow") {
    const p = on(0.1, 0.5);
    const q = on(0.55, 0.45);
    return (
      <g>
        <Sheet4 onIdx={[2]} />
        <Tie y={ROW_Y(2)} p={p} />
        <Arrow x0={788} y0={812} x1={846} y1={600} p={p} color={C.coralDark} width={9} head={24} />
        <g opacity={q}>
          <Label x={944} y={652} text="4.2" size={52} weight={800} color={C.coralDark} />
          <Label x={944} y={704} text="偏高" size={26} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  /* 它是身体要用的原料：造膜、造激素 —— 先立「不是垃圾」这个前提 */
  if (scene === "raw") {
    const p = on(0.05, 0.16);
    const q = on(0.46, 0.16);
    const r = on(0.72, 0.14);
    return (
      <g>
        <g opacity={p}>
          <circle cx={540} cy={392} r={44} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
          <Label x={540} y={314} text="胆固醇" size={30} weight={800} color="#A9771B" />
        </g>
        <line x1={510} y1={424} x2={330} y2={524} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="8 7" opacity={0.55 * q} />
        <line x1={570} y1={424} x2={750} y2={524} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="8 7" opacity={0.55 * q} />
        <Panel x={110} y={528} w={380} h={176} title="细胞膜" tone={C.tealDark} on={q}>
          <Label x={300} y={648} text="包住每一个细胞" size={24} weight={700} />
        </Panel>
        <Panel x={590} y={528} w={380} h={176} title="激素" tone="#9A6B12" on={q}>
          <Label x={780} y={648} text="性激素、皮质醇" size={24} weight={700} />
        </Panel>
        <g opacity={r}>
          <Label x={540} y={792} text="不是垃圾，也不是越少越好" size={30} weight={800} />
        </g>
      </g>
    );
  }

  /* 一滴油浮在水上：胆固醇是油，血是水，两者混不到一起 */
  if (scene === "oil") {
    const w = on(0.32, 0.3);
    const q = on(0.56, 0.34);
    return (
      <g>
        <Label x={540} y={470} text="胆固醇" size={36} weight={800} />
        <circle cx={540} cy={592} r={58} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
        <circle cx={522} cy={572} r={13} fill={C.white} opacity={0.7} />
        <g opacity={w}>
          <rect x={90} y={600} width={900} height={176} rx={18} fill={C.tealLight} opacity={0.6} />
          <line x1={90} y1={600} x2={990} y2={600} stroke={C.tealDark} strokeWidth={5} opacity={0.55} />
          <Label x={540} y={712} text="血，主要成分是水" size={28} color={C.tealDark} weight={800} />
        </g>
        <g opacity={q}>
          <Label x={540} y={816} text="油和水，混不到一起" size={30} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  /* 自己走不动，得装车；这种车叫脂蛋白 */
  if (scene === "car") {
    const p = on(0.2, 0.5);
    const q = on(0.62, 0.35);
    return (
      <g>
        <circle cx={250} cy={590} r={54} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
        <Label x={250} y={700} text="胆固醇" size={26} color="#A9771B" weight={800} />
        <Arrow x0={348} y0={590} x1={600} y1={590} p={p} color={C.coralDark} width={8} />
        <Car x={760} y={580} s={1.3} tone={C.ink} />
        <g opacity={1 - q}>
          <Label x={760} y={756} text="车" size={30} weight={800} />
        </g>
        <g opacity={q}>
          <Label x={760} y={756} text="脂蛋白" size={30} weight={800} />
        </g>
      </g>
    );
  }

  /* 只有肝发货：全身的细胞要用，都等它送 */
  if (scene === "liver") {
    const p = on(0.04, 0.32);
    const q = on(0.46, 0.46);
    return (
      <g>
        <g opacity={p}>
          <rect x={110} y={430} width={200} height={300} rx={34} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
          <Label x={210} y={576} text="肝" size={54} weight={800} color="#A9771B" />
          <Label x={210} y={632} text="唯一发货的地方" size={20} weight={700} color={C.inkSoft} />
        </g>
        <g opacity={q}>
          <Arrow x0={348} y0={580} x1={640} y1={580} color={C.inkSoft} width={6} head={18} />
          <Panel x={660} y={420} w={330} h={320} title="全身的细胞">
            {[
              [710, 510],
              [770, 495],
              [830, 520],
              [890, 498],
              [945, 515],
              [720, 585],
              [790, 600],
              [860, 585],
              [925, 600],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={15} fill={C.tealDark} opacity={0.5} />
            ))}
            <Label x={825} y={690} text="要用，只能等肝送" size={22} weight={800} color={C.inkSoft} />
          </Panel>
        </g>
      </g>
    );
  }

  /* 肝装车往外送 */
  if (scene === "send") {
    const p = on(0.1, 0.62);
    const q = on(0.62, 0.35);
    return (
      <g>
        <rect x={96} y={470} width={176} height={220} rx={30} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
        <Label x={184} y={604} text="肝" size={46} weight={800} color="#A9771B" />
        <Arrow x0={300} y0={580} x1={940} y1={580} p={p} color={C.coralDark} width={8} />
        <Car x={320 + 580 * p} y={580} s={0.8} tone={C.coralDark} />
        <g opacity={q}>
          <Label x={620} y={486} text="低密度：往外送" size={26} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  /* 密度是把尺子：比血轻的叫低密度 */
  if (scene === "light" || scene === "back") {
    const heavy = scene === "back";
    const p = on(0.05, 0.42);
    const q = on(0.5, 0.42);
    return (
      <g>
        <line x1={180} y1={380} x2={180} y2={846} stroke={C.inkSoft} strokeWidth={4} opacity={0.45} />
        <Arrow x0={180} y0={470} x1={180} y1={402} color={C.inkSoft} width={4} head={12} />
        <Arrow x0={180} y0={786} x1={180} y1={838} color={C.inkSoft} width={4} head={12} />
        <Label x={200} y={424} text="轻" size={24} anchor="start" color={C.inkSoft} weight={700} />
        <Label x={200} y={834} text="沉" size={24} anchor="start" color={C.inkSoft} weight={700} />
        <line x1={260} y1={640} x2={1000} y2={640} stroke={C.tealDark} strokeWidth={4} strokeDasharray="12 9" opacity={0.65} />
        <Label x={1000} y={612} text="血的密度" size={22} anchor="end" color={C.tealDark} weight={700} />
        <g opacity={heavy ? 0.16 : p}>
          <Car x={560} y={545} s={1.1} tone={C.coralDark} />
          <Label x={560} y={456} text="低密度" size={28} weight={800} color={C.coralDark} />
        </g>
        {heavy ? (
          <g opacity={q}>
            <Car x={560} y={772} s={1.05} tone={C.tealDark} />
            <Label x={250} y={784} text="高密度" size={28} anchor="start" weight={800} color={C.tealDark} />
            <Label x={860} y={716} text="蛋白多、油少" size={26} weight={800} color={C.tealDark} />
            <Label x={860} y={760} text="所以比血沉" size={26} weight={800} color={C.tealDark} />
          </g>
        ) : (
          <g opacity={q}>
            <Label x={560} y={718} text="油多、蛋白少" size={26} weight={800} color={C.coralDark} />
            <Label x={560} y={762} text="所以比血轻" size={26} weight={800} color={C.coralDark} />
          </g>
        )}
      </g>
    );
  }

  /* 送到地方，细胞卸下来用 */
  if (scene === "use") {
    const p = on(0.1, 0.55);
    return (
      <g>
        <rect x={680} y={430} width={320} height={320} rx={64} fill={C.tealLight} stroke={C.tealDark} strokeWidth={5} />
        <Label x={840} y={556} text="细胞" size={34} weight={800} color={C.tealDark} />
        <Car x={350} y={586} s={0.9} tone={C.coralDark} />
        <Arrow x0={462} y0={548} x1={664} y1={512} p={p} color={C.coralDark} width={7} head={18} />
        <g opacity={p}>
          <circle cx={600} cy={524} r={22} fill={C.amber} stroke="#A9771B" strokeWidth={4} />
        </g>
      </g>
    );
  }

  /* 用剩的不能扔，只能回肝，从胆汁排掉 */
  if (scene === "waste") {
    const p1 = on(0.05, 0.28);
    const p2 = on(0.4, 0.28);
    const p3 = on(0.72, 0.28);
    return (
      <g>
        <rect x={110} y={400} width={210} height={210} rx={30} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
        <Label x={215} y={524} text="肝" size={46} weight={800} color="#A9771B" />
        <g opacity={p1}>
          <circle cx={856} cy={432} r={38} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
          <Label x={856} y={370} text="用剩的" size={24} weight={800} color="#A9771B" />
          <Label x={856} y={534} text="就地扔掉" size={24} weight={700} color={C.inkSoft} />
          <Cross x={856} y={584} s={1} />
        </g>
        <g opacity={p2}>
          <Arrow x0={800} y0={666} x1={360} y1={666} p={p2} color={C.tealDark} width={7} />
          <Car x={790 - 420 * p2} y={666} s={0.58} tone={C.tealDark} />
          <Label x={578} y={630} text="只能运回肝" size={24} weight={800} color={C.tealDark} />
        </g>
        <g opacity={p3}>
          <Arrow x0={215} y0={628} x1={215} y1={702} p={p3} color="#9A6B12" width={6} head={16} />
          <Label x={215} y={752} text="变成胆汁酸" size={24} weight={800} color="#9A6B12" />
          <Label x={215} y={798} text="随大便排掉" size={24} weight={700} color={C.inkSoft} />
        </g>
      </g>
    );
  }

  /* 一辆往外送，一辆往回收，两头都是肝 */
  if (scene === "both") {
    const p = on(0.05, 0.4);
    const q = on(0.5, 0.4);
    return (
      <g>
        <rect x={96} y={470} width={190} height={260} rx={30} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
        <Label x={191} y={622} text="肝" size={48} weight={800} color="#A9771B" />
        <Arrow x0={320} y0={532} x1={890} y1={532} p={p} color={C.coralDark} width={8} />
        <Car x={340 + 540 * p} y={532} s={0.68} tone={C.coralDark} />
        <Label x={610} y={468} text="低密度：往外送" size={24} weight={800} color={C.coralDark} />
        <g opacity={q}>
          <Arrow x0={890} y0={722} x1={320} y1={722} color={C.tealDark} width={8} />
          <Car x={600} y={722} s={0.68} tone={C.tealDark} />
          <Label x={610} y={800} text="高密度：往回收" size={24} weight={800} color={C.tealDark} />
          <rect x={84} y={458} width={214} height={284} rx={34} fill="none" stroke={C.coralDark} strokeWidth={5} strokeDasharray="10 8" />
          <Label x={400} y={430} text="发货、收货，都是它" size={22} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  /* 送得太多：所以要盯 */
  if (scene === "toomuch") {
    const p = on(0.05, 0.45);
    const q = on(0.52, 0.4);
    return (
      <g>
        <rect x={96} y={500} width={170} height={180} rx={28} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
        <Label x={181} y={612} text="肝" size={42} weight={800} color="#A9771B" />
        <Arrow x0={292} y0={592} x1={948} y1={592} p={p} color={C.coralDark} width={7} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Car key={i} x={346 + i * 132} y={592} s={0.4} tone={C.coralDark} />
        ))}
        <Label x={620} y={500} text="低密度：送得太多" size={26} weight={800} color={C.coralDark} />
        <g opacity={q}>
          <Label x={540} y={746} text="细胞用不完" size={38} weight={800} />
          <Label x={540} y={800} text="多出来的没处去" size={28} weight={700} color={C.inkSoft} />
        </g>
      </g>
    );
  }

  if (scene === "plaque") {
    return (
      <g>
        <Vessel p={plaque} hot={plaque > 0.6} t={t} />
        <Label x={540} y={452} text="颗粒一层层堆进血管壁" size={28} color={C.coralDark} weight={800} />
        <Label x={540} y={796} text="血管变窄，心梗、脑梗就来了" size={28} weight={800} />
      </g>
    );
  }

  if (scene === "ladder") {
    const top = on(0.04, 0.14);
    return (
      <g>
        <g opacity={top}>
          <Label x={540} y={330} text="所以低密度要盯" size={38} weight={800} />
          <Label x={540} y={380} text="盯到多少，看你的风险有多高" size={28} weight={700} color={C.inkSoft} />
        </g>
        {[
          ["3.4", "风险低的人", 0.34, C.teal],
          ["2.6", "只有高血压、糖尿病", 0.52, C.tealDark],
          ["1.8", "得过心梗、脑梗", 0.72, C.coralDark],
        ].map(([v, t, f, c], i) => (
          <g key={v as string} opacity={on(0.32 + i * 0.26, 0.1)}>
            <rect x={90} y={520 + i * 104} width={900 * (f as number)} height={56} rx={28} fill={c as string} opacity={0.16} />
            <rect x={90} y={520 + i * 104} width={900 * (f as number)} height={56} rx={28} fill="none" stroke={c as string} strokeWidth={4} />
            <Label x={120} y={520 + i * 104 + 40} text={v as string} size={34} anchor="start" weight={800} color={c as string} />
            <Label x={210} y={520 + i * 104 + 38} text={t as string} size={26} anchor="start" color={C.inkSoft} weight={700} />
          </g>
        ))}
      </g>
    );
  }

  /* 回到单子：第一行是三项加出来的，好坏混在一起 */
  if (scene === "sumback") {
    const p = on(0.38, 0.35);
    return (
      <g>
        <Sheet4 onIdx={[0]} />
        <Tie y={ROW_Y(0)} p={p} />
        <Panel x={740} y={360} w={284} h={400} title="加起来" tone={C.coralDark} on={p}>
          {[
            ["4.2", "低密度", C.coralDark],
            ["0.9", "高密度", C.tealDark],
            ["1.0", "其他", C.inkSoft],
          ].map(([v, n, c], i) => (
            <g key={n as string}>
              <Label x={806} y={470 + i * 62} text={v as string} size={38} anchor="end" weight={800} color={c as string} />
              <Label x={826} y={466 + i * 62} text={n as string} size={26} anchor="start" color={C.inkSoft} weight={700} />
            </g>
          ))}
          <line x1={766} y1={640} x2={1002} y2={640} stroke={C.paperShadow} strokeWidth={4} />
          <Label x={806} y={716} text="6.1" size={46} anchor="end" weight={800} color={C.coralDark} />
          <Label x={826} y={710} text="总胆固醇" size={26} anchor="start" weight={800} />
        </Panel>
      </g>
    );
  }

  /* 第二行：甘油三酯跟什么走 */
  if (scene === "tgcell") {
    const p = on(0.1, 0.35);
    return (
      <g>
        <Sheet4 onIdx={[1]} />
        <Tie y={ROW_Y(1)} p={p} />
        <Panel x={740} y={330} w={284} h={440} title="跟这几样走" tone="#9A6B12" on={p}>
          {[
            ["喝酒", "常喝就高"],
            ["血糖高", "糖多了转成油"],
            ["体重超标", "腰围先涨"],
          ].map(([a, b], i) => (
            <g key={a}>
              <Label x={766} y={470 + i * 88} text={a} size={30} anchor="start" weight={800} color="#9A6B12" />
              <Label x={766} y={508 + i * 88} text={b} size={22} anchor="start" color={C.inkSoft} weight={600} />
            </g>
          ))}
        </Panel>
      </g>
    );
  }

  /* 第二行：一点七这条线 */
  if (scene === "tgmark") {
    const p = on(0.08, 0.5);
    return (
      <g>
        <Sheet4 onIdx={[1]} />
        <Tie y={ROW_Y(1)} p={p} />
        <Label x={882} y={520} text="1.7" size={96} weight={800} color="#9A6B12" />
        <Label x={882} y={562} text="mmol/L" size={22} color={C.inkSoft} weight={600} />
        <line x1={760} y1={612} x2={1004} y2={612} stroke="#9A6B12" strokeWidth={6} opacity={p} />
        <Label x={882} y={676} text="超过要留意" size={26} weight={800} />
        <Label x={882} y={722} text="再高当心胰腺炎" size={26} color={C.coralDark} weight={800} />
      </g>
    );
  }

  /* 第四行：高密度好一点，但管不住低密度 */
  if (scene === "hdlcell") {
    const p = on(0.05, 0.26);
    const q = on(0.44, 0.36);
    return (
      <g>
        <Sheet4 onIdx={[3]} />
        <Tie y={ROW_Y(3)} p={p} />
        <Panel x={740} y={400} w={284} h={330} title="高密度" tone={C.tealDark} on={p}>
          <Check x={784} y={505} s={1.2} />
          <Label x={832} y={516} text="高一点是好事" size={26} anchor="start" weight={800} />
          <g opacity={q}>
            <Label x={882} y={650} text="但抵消不了低密度" size={26} color={C.coralDark} weight={800} />
          </g>
        </Panel>
      </g>
    );
  }

  if (scene === "food" || scene === "food2") {
    const bad = scene === "food";
    return (
      <g>
        {(bad
          ? [
              ["肥肉", "动物油"],
              ["奶油糕点", "饼干"],
              ["油炸", "反式脂肪"],
            ]
          : [
              ["蔬菜", "全谷物"],
              ["豆类", "深海鱼"],
              ["少坐多动", "体重降一点"],
            ]
        ).map(([a, b], i) => (
          <Panel key={a} x={[56, 384, 712][i]} y={450} w={304} h={280} tone={(bad ? C.coralDark : C.tealDark) as string}>
            <Label x={[208, 536, 864][i]} y={560} text={a} size={30} weight={800} />
            <Label x={[208, 536, 864][i]} y={614} text={b} size={24} color={C.inkSoft} weight={600} />
            {bad ? <Cross x={[208, 536, 864][i]} y={668} s={0.9} /> : <Check x={[208, 536, 864][i]} y={672} s={1} />}
          </Panel>
        ))}
      </g>
    );
  }

  if (scene === "statin") {
    return (
      <g>
        <g transform={`translate(${COL[0]} ${ROW[1] - 10}) scale(1.25)`}>
          <PillBox x={0} y={0} />
        </g>
        <Label x={COL[0]} y={ROW[2] + 20} text="他汀" size={28} />
        <Cross x={COL[1]} y={ROW[1] - 30} s={2.2} />
        <Label x={COL[1]} y={ROW[1] + 80} text="自己停" size={30} color={C.coralDark} weight={800} />
        <Label x={COL[2] - 10} y={ROW[1] - 10} text="调量以后" size={32} weight={800} />
        <Label x={COL[2] - 10} y={ROW[1] + 56} text="查血脂和肝功" size={32} weight={800} />
      </g>
    );
  }

  if (scene === "close") {
    return (
      <g>
        <line x1={X0 + 40} y1={ROW[1]} x2={X1 - 40} y2={ROW[1]} stroke={C.inkSoft} strokeWidth={4} opacity={0.3} />
        {[
          ["低密度", "该降的降到位", C.coralDark, 300],
          ["甘油三酯", "高了也要管", "#9A6B12", 780],
        ].map(([a, b, c, x]) => (
          <g key={a as string}>
            <circle cx={x as number} cy={ROW[1]} r={46} fill={c as string} />
            <Label x={x as number} y={ROW[1] + 12} text="↓" size={40} color={C.white} weight={800} />
            <Label x={x as number} y={ROW[1] - 80} text={a as string} size={30} weight={800} color={c as string} />
            <Label x={x as number} y={ROW[1] + 96} text={b as string} size={26} color={C.inkSoft} weight={600} />
          </g>
        ))}
        <Label x={540} y={ROW[1] + 12} text="≠" size={40} color={C.inkSoft} weight={800} />
      </g>
    );
  }

  return <Vessel />;
};
