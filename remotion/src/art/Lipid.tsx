import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Bars, Check, Cross, Label, Particle, Sheet, Tag} from "../diagrams";
import {PillBox} from "../parts";
import {Chip, COL, Curve, Panel, ROW, Ticks, X0, X1} from "./kit";

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

  /* 第二句给出地图：哪两行是主角，另外两行各是什么 */
  if (scene === "map") {
    const p = on(0.5, 0.4);
    return (
      <g>
        <Sheet4 onIdx={[2, 3]} />
        <Tie y={ROW_Y(0)} p={p} />
        <Tie y={ROW_Y(1)} p={p} />
        <Label x={754} y={ROW_Y(0) + 10} text="加起来的总数" size={28} anchor="start" color={C.inkSoft} weight={800} />
        <Label x={754} y={ROW_Y(1) + 10} text="另一回事" size={28} anchor="start" color={C.inkSoft} weight={800} />
      </g>
    );
  }

  if (scene === "why") {
    return (
      <g>
        <Particle x={200} y={ROW[1]} r={64} tone="ldl" label="脂蛋白颗粒" />
        <Label x={200} y={ROW[0] - 6} text="胆固醇" size={28} color={C.inkSoft} weight={700} />
        <Arrow x0={300} y0={ROW[1]} x1={440} y1={ROW[1]} p={on(0.1, 0.35)} />
        <Label x={540} y={ROW[0] + 4} text="不溶于血，得靠颗粒运" size={30} weight={800} />
      </g>
    );
  }

  if (scene === "two" || scene === "two2") {
    const back = scene === "two";
    return (
      <g>
        <Vessel x0={90} x1={990} />
        <g transform={`translate(180 ${VY})`}>
          <Particle x={0} y={0} r={34} tone="ldl" glow={0.4} />
        </g>
        <g transform={`translate(430 ${VY})`}>
          <Particle x={0} y={0} r={30} tone="ldl" dots={3} />
        </g>
        <g transform={`translate(700 ${VY})`}>
          <Particle x={0} y={0} r={30} tone="ldl" dots={3} />
        </g>
        <Arrow x0={230} y0={VY + 66} x1={880} y1={VY + 66} p={on(0.05, 0.5)} color={C.coralDark} />
        <Label x={540} y={VY + 116} text="低密度：把胆固醇送出去" size={26} color={C.coralDark} weight={800} />
        {back ? (
          <g>
            <g transform={`translate(880 ${VY - 86})`}>
              <Particle x={0} y={0} r={30} tone="hdl" label="高密度" />
            </g>
            <Arrow x0={840} y0={VY - 128} x1={320} y1={VY - 128} p={on(0.45, 0.5)} color={C.tealDark} />
            <Label x={560} y={VY - 150} text="高密度：把多余的运回肝" size={26} color={C.tealDark} weight={800} />
          </g>
        ) : (
          <g>
            <Label x={540} y={356} text="“好”和“坏”说的是风险关系" size={32} weight={800} />
            <Chip x={400} y={432} text="不是两种胆固醇" tone="coral" size={26} />
            <Chip x={700} y={432} text="是两类运输颗粒" tone="teal" size={26} />
          </g>
        )}
      </g>
    );
  }

  /* 好和坏是两类颗粒的方向，不是两种胆固醇 */
  if (scene === "myth") {
    return (
      <g>
        <Label x={540} y={380} text="“好胆固醇”“坏胆固醇”" size={34} weight={800} />
        <Label x={540} y={430} text="说的不是两种胆固醇" size={28} color={C.inkSoft} weight={700} />
        <Chip x={380} y={560} text="低密度：往外送" tone="coral" size={28} />
        <Chip x={730} y={560} text="高密度：运回肝" tone="teal" size={28} />
        <Label x={540} y={680} text="是两批颗粒，方向相反" size={30} weight={800} />
      </g>
    );
  }

  if (scene === "ldl") {
    return (
      <g>
        <Particle x={260} y={ROW[1] - 20} r={80} tone="ldl" glow={0.5} dots={6} />
        <Label x={260} y={ROW[1] + 100} text="低密度脂蛋白" size={28} />
        <Panel x={520} y={360} w={460} h={330} title="化验单上的 LDL-C" tone={C.coralDark}>
          <Label x={750} y={540} text="4.2" size={96} weight={800} color={C.coralDark} />
          <Label x={750} y={594} text="mmol/L" size={24} color={C.inkSoft} weight={600} />
          <Label x={750} y={652} text="测的是颗粒上带的胆固醇" size={24} color={C.inkSoft} weight={600} />
        </Panel>
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
