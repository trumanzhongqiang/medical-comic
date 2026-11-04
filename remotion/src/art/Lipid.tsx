import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Bars, Check, Cross, Label, Particle, Ruler, Sheet, Tag} from "../diagrams";
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

export const LipidArt: React.FC<{t: number; scene: string; u: number; bi: number}> = ({t, scene, u}) => {
  const flow = (t * 0.12) % 1;
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  const plaque = scene === "plaque" ? on(0.05, 0.7) : 0;

  if (scene === "report") {
    return (
      <Sheet
        x={230}
        y={288}
        w={620}
        h={534}
        title="血脂四项"
        fs={36}
        rowH={106}
        rows={[
          {name: "总胆固醇", value: "6.1", unit: "mmol/L", on: false},
          {name: "甘油三酯", value: "2.4", unit: "mmol/L", on: false},
          {name: "低密度脂蛋白", value: "4.2", unit: "mmol/L", on: true},
          {name: "高密度脂蛋白", value: "0.9", unit: "mmol/L", on: false},
        ]}
      />
    );
  }

  if (scene === "why") {
    return (
      <g>
        <Particle x={200} y={ROW[1]} r={64} tone="ldl" label="脂蛋白颗粒" />
        <Label x={200} y={ROW[0] - 6} text="胆固醇" size={28} color={C.inkSoft} weight={700} />
        <Arrow x0={300} y0={ROW[1]} x1={440} y1={ROW[1]} p={on(0.1, 0.35)} />
        <Label x={540} y={ROW[0] + 4} text="不溶于血，得靠颗粒运" size={30} weight={800} />
        <Label x={540} y={ROW[0] + 56} text="胆固醇本身是身体要用的原料" size={26} color={C.inkSoft} weight={600} />
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
          ["3.4", "风险低", 0.34, C.teal],
          ["2.6", "有高血压、糖尿病", 0.52, C.tealDark],
          ["1.8", "已有心血管病", 0.72, "#9A6B12"],
          ["1.4", "反复发作，更严", 0.92, C.coralDark],
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

  if (scene === "tg" || scene === "tg2") {
    return (
      <g>
        <Ticks x={90} y={560} w={900} min={0.5} max={5.5} step={0.5} label="mmol/L" />
        <Ruler
          x={90}
          y={560}
          w={900}
          min={0.5}
          max={5.5}
          p={on(0.04, 0.5)}
          band={{a: 1.7, b: 5.5, tone: C.amberLight}}
          marks={[{v: 1.7, label: "1.7", tone: "#9A6B12", above: true}]}
        />
        <Label x={90 + ((1.7 - 0.5) / 5) * 900 + 30} y={656} text="1.7" size={36} anchor="start" color="#9A6B12" weight={800} />
      </g>
    );
  }

  if (scene === "hdl") {
    return (
      <g>
        <Particle x={240} y={ROW[1] - 20} r={70} tone="hdl" label="高密度" glow={0.4} />
        <Panel x={520} y={360} w={460} h={330} title="高一些，通常是好事" tone={C.tealDark}>
          <Check x={640} y={520} s={1.8} />
          <Label x={720} y={530} text="和风险较低相关" size={26} anchor="start" />
          <Label x={750} y={620} text="但抵消不了低密度高" size={26} color={C.coralDark} weight={800} />
        </Panel>
      </g>
    );
  }

  if (scene === "tc") {
    return (
      <g>
        {[
          ["低密度", "4.2", C.coralDark],
          ["高密度", "0.9", C.tealDark],
          ["其他", "1.0", C.inkSoft],
        ].map(([a, b, c], i) => (
          <g key={a as string}>
            <Panel x={[56, 384, 712][i]} y={440} w={304} h={200} tone={c as string}>
              <Label x={[208, 536, 864][i]} y={530} text={a as string} size={26} weight={800} />
              <Label x={[208, 536, 864][i]} y={592} text={b as string} size={52} weight={800} color={c as string} />
            </Panel>
          </g>
        ))}
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
