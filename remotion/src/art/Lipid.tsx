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

const VY = 600;

const Vessel: React.FC<{wall?: number; hot?: boolean; plaque?: number; x0?: number; x1?: number}> = ({
  wall = 0,
  hot,
  plaque = 0,
  x0 = 90,
  x1 = 990,
}) => (
  <g>
    <path
      d={`M ${x0} ${VY - 66} L ${x1} ${VY - 58} L ${x1} ${VY + 58} L ${x0} ${VY + 66} Z`}
      fill="#F6D3C7"
      stroke={hot ? "#8E3B33" : C.ink}
      strokeWidth={7 + wall}
    />
    {plaque > 0 ? (
      <path
        d={`M ${x0 + 300} ${VY - 60} Q ${x0 + 380} ${VY - 60 + 110 * plaque} ${x0 + 470} ${VY - 58}`}
        fill="#C0743F"
        opacity={0.85}
        stroke="#8A4A22"
        strokeWidth={5}
      />
    ) : null}
  </g>
);

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
    return <Sheet4 />;
  }

  /* 一滴油浮在水上：胆固醇是油，血是水，两者混不到一起 */
  if (scene === "oil") {
    const w = on(0.3, 0.32);
    const q = on(0.68, 0.3);
    return (
      <g>
        <rect x={90} y={600} width={900} height={176} rx={18} fill={C.tealLight} opacity={0.6 * w} />
        <line x1={90} y1={600} x2={990} y2={600} stroke={C.tealDark} strokeWidth={5} opacity={0.55 * w} />
        <Label x={540} y={470} text="胆固醇" size={36} weight={800} />
        <circle cx={540} cy={592} r={58} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
        <circle cx={522} cy={572} r={13} fill={C.white} opacity={0.7} />
        <g opacity={w}>
          <Label x={540} y={712} text="血，主要成分是水" size={28} color={C.tealDark} weight={800} />
        </g>
        <g opacity={q}>
          <Label x={540} y={816} text="油和水，混不到一起" size={30} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  /* 自己走不动，得装车 */
  if (scene === "car") {
    const p = on(0.25, 0.5);
    return (
      <g>
        <circle cx={250} cy={590} r={54} fill={C.amber} stroke="#A9771B" strokeWidth={5} />
        <Label x={250} y={700} text="胆固醇" size={26} color="#A9771B" weight={800} />
        <Arrow x0={348} y0={590} x1={600} y1={590} p={p} color={C.coralDark} width={8} />
        <Car x={740} y={580} s={1.35} tone={C.ink} />
        <Label x={740} y={756} text="车" size={30} weight={800} />
      </g>
    );
  }

  /* 这种车叫脂蛋白，按密度分两种 */
  if (scene === "car2") {
    const p = on(0.05, 0.3);
    return (
      <g>
        <Label x={540} y={382} text="这种车叫脂蛋白" size={34} weight={800} />
        <g opacity={p}>
          <Car x={320} y={600} s={1.5} tone={C.coralDark} />
          <Label x={320} y={790} text="低密度" size={28} color={C.coralDark} weight={800} />
          <Car x={772} y={600} s={0.95} tone={C.tealDark} />
          <Label x={772} y={790} text="高密度" size={28} color={C.tealDark} weight={800} />
        </g>
      </g>
    );
  }

  /* 肝是起点：低密度往外送，高密度往回收 */
  if (scene === "loop" || scene === "loop2") {
    const walk = scene === "loop";
    const p1 = walk ? on(0.02, 0.46) : 1;
    const p2 = walk ? on(0.5, 0.46) : 1;
    return (
      <g>
        <rect x={96} y={420} width={176} height={290} rx={34} fill={C.amberLight} stroke="#A9771B" strokeWidth={5} />
        <Label x={184} y={566} text="肝" size={48} weight={800} color="#A9771B" />
        <Label x={184} y={614} text="装车发出" size={20} color={C.inkSoft} weight={700} />
        <Arrow x0={386} y0={470} x1={790} y1={470} p={p1} color={C.coralDark} width={8} />
        {p1 > 0.02 ? <Car x={386 + 396 * p1} y={470} s={0.72} tone={C.coralDark} /> : null}
        <Label x={590} y={408} text="低密度：往外送" size={24} color={C.coralDark} weight={800} />
        <Label x={926} y={470} text="全身" size={22} color={C.inkSoft} weight={700} />
        {p2 > 0.02 ? (
          <g>
            <Arrow x0={790} y0={700} x1={386} y1={700} p={p2} color={C.tealDark} width={8} />
            <Car x={790 - 396 * p2} y={700} s={0.72} tone={C.tealDark} />
            <Label x={590} y={800} text="高密度：送回肝" size={24} color={C.tealDark} weight={800} />
          </g>
        ) : null}
        {walk ? null : (
          <g opacity={on(0.05, 0.26)}>
            <Label x={560} y={592} text="一个来回" size={30} weight={800} color={C.inkSoft} />
          </g>
        )}
      </g>
    );
  }

  /* 没有好胆固醇坏胆固醇，只有两批车 */
  if (scene === "verdict") {
    const p = on(0.5, 0.35);
    return (
      <g>
        <Label x={540} y={486} text="没有好胆固醇" size={46} weight={800} />
        <Label x={540} y={562} text="也没有坏胆固醇" size={46} weight={800} />
        <g opacity={p}>
          <rect x={120} y={660} width={380} height={92} rx={46} fill={C.coralLight} stroke={C.coralDark} strokeWidth={5} />
          <Label x={310} y={718} text="低密度：往外送" size={26} color={C.coralDark} weight={800} />
          <rect x={580} y={660} width={380} height={92} rx={46} fill={C.tealLight} stroke={C.tealDark} strokeWidth={5} />
          <Label x={770} y={718} text="高密度：往回收" size={26} color={C.tealDark} weight={800} />
          <Arrow x0={180} y0={812} x1={420} y1={812} p={p} color={C.coralDark} width={7} />
          <Arrow x0={900} y0={812} x1={660} y1={812} p={p} color={C.tealDark} width={7} />
        </g>
      </g>
    );
  }

  if (scene === "plaque") {
    return (
      <g>
        <Vessel x0={90} x1={990} plaque={plaque} hot={plaque > 0.6} />
        <Label x={540} y={VY - 130} text="颗粒进到血管壁里" size={28} color={C.coralDark} weight={800} />
        <Label x={540} y={VY + 130} text="引起炎症，慢慢长成斑块" size={28} weight={800} />
      </g>
    );
  }

  if (scene === "target") {
    return (
      <g>
        {[
          ["得过心梗、脑梗", "要更严", C.coralDark],
          ["糖尿病、高血压", "中等", "#9A6B12"],
          ["风险低的人", "可以宽一些", C.tealDark],
        ].map(([a, b, c], i) => (
          <Panel key={a as string} x={[56, 384, 712][i]} y={450} w={304} h={280} tone={c as string}>
            <Label x={[208, 536, 864][i]} y={580} text={a as string} size={26} weight={800} color={c as string} />
            <Label x={[208, 536, 864][i]} y={630} text={b as string} size={26} />
          </Panel>
        ))}
      </g>
    );
  }

  if (scene === "ladder") {
    return (
      <g>
        {[
          ["3.4", "风险低的人", 0.34, C.teal],
          ["2.6", "只有高血压、糖尿病", 0.52, C.tealDark],
          ["1.8", "得过心梗、脑梗", 0.72, C.coralDark],
        ].map(([v, t, f, c], i) => (
          <g key={v as string} opacity={on(0.05 + i * 0.12, 0.3)}>
            <rect x={90} y={430 + i * 88} width={900 * (f as number)} height={56} rx={28} fill={c as string} opacity={0.16} />
            <rect x={90} y={430 + i * 88} width={900 * (f as number)} height={56} rx={28} fill="none" stroke={c as string} strokeWidth={4} />
            <Label x={120} y={430 + i * 88 + 40} text={v as string} size={34} anchor="start" weight={800} color={c as string} />
            <Label x={210} y={430 + i * 88 + 38} text={t as string} size={26} anchor="start" color={C.inkSoft} weight={700} />
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
    const p = on(0.08, 0.3);
    const q = on(0.52, 0.4);
    return (
      <g>
        <Sheet4 onIdx={[3]} />
        <Tie y={ROW_Y(3)} p={p} />
        <Panel x={740} y={400} w={284} h={330} title="高密度" tone={C.tealDark} on={p}>
          <Check x={792} y={505} s={1.4} />
          <Label x={826} y={516} text="高一点是好事" size={26} anchor="start" weight={800} />
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
