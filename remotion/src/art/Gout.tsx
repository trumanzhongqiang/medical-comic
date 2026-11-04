import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Check, Clock, Cross, Label} from "../diagrams";
import {Chip, Curve, Panel, ROW} from "./kit";

/* 第 6 期：尿酸为什么会变成扎人的针
 *
 * 一条因果，五个画面：血里的尿酸 → 溶不下 → 析出成针 → 白细胞来包 → 又红又肿。
 * 主角只有两样：关节（两块骨头中间那道缝）和针。
 *
 * v4 规矩（和第 7 期同一套）：
 *   1. 画面不复述旁白，只给「名字」和「形状」；
 *   2. 一页不超过四个块，第二句才出现的东西走 later()；
 *   3. 报到一个亮一个，不提前把五个都堆出来。
 */

const R1 = ROW[1];

/** 大脚趾：一个圆润的趾头，连着脚背，根部一圈红肿。swell 控制肿的范围。 */
const Toe: React.FC<{x: number; y: number; s?: number; swell?: number}> = ({x, y, s = 1, swell = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={158} rx={150 + 40 * swell} ry={96 + 28 * swell} fill={C.coral} opacity={0.08 + 0.22 * swell} />
    <path
      d="M -150 200 C -150 244 -80 256 0 256 C 80 256 150 244 150 200 L 150 156 C 150 118 86 100 62 92 C 70 30 64 -56 36 -94 C 12 -124 -34 -120 -50 -88 C -64 -58 -62 -4 -56 92 C -82 100 -150 118 -150 156 Z"
      fill="#EBC8AC"
      stroke={C.ink}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <ellipse cx={0} cy={144} rx={74} ry={42} fill={C.coral} opacity={0.3 + 0.45 * swell} />
    <ellipse cx={4} cy={-72} rx={26} ry={22} fill="#F7E4D3" stroke="#B98A67" strokeWidth={4} />
  </g>
);

/** 关节：上下两块骨头，中间一道缝。针就长在这道缝里。 */
const Joint: React.FC<{x: number; y: number; s?: number; op?: number}> = ({x, y, s = 1, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <rect x={-150} y={-206} width={300} height={176} rx={40} fill="#F3E6D6" stroke={C.ink} strokeWidth={6} />
    <rect x={-150} y={70} width={300} height={176} rx={40} fill="#F3E6D6" stroke={C.ink} strokeWidth={6} />
    <path d="M -148 -18 H 148" stroke={C.teal} strokeWidth={11} opacity={0.5} strokeLinecap="round" />
    <path d="M -148 58 H 148" stroke={C.teal} strokeWidth={11} opacity={0.5} strokeLinecap="round" />
  </g>
);

/** 一根针：细长的菱形，就是尿酸析出来以后的样子。 */
const Needle: React.FC<{x: number; y: number; l?: number; rot?: number; p?: number}> = ({x, y, l = 70, rot = 0, p = 1}) => {
  const k = Math.max(0.001, p);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} opacity={p}>
      <path d={`M 0 ${-l / 2} L ${l * 0.13} 0 L 0 ${l / 2} L ${-l * 0.13} 0 Z`} fill="#FFFFFF" stroke="#63809E" strokeWidth={4.5} strokeLinejoin="round" />
    </g>
  );
};

/** 白细胞：一个圆，里面一团分叶的核。 */
const Cell: React.FC<{x: number; y: number; r?: number; p?: number}> = ({x, y, r = 46, p = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.001, p)})`} opacity={p}>
    <circle r={r} fill="#F6EDF7" stroke="#8E6B95" strokeWidth={5} />
    <path
      d={`M ${-r * 0.42} ${-r * 0.16} C ${-r * 0.1} ${-r * 0.72} ${r * 0.5} ${-r * 0.54} ${r * 0.34} ${r * 0.02} C ${r * 0.62} ${r * 0.44} ${r * 0.06} ${r * 0.62} ${-r * 0.22} ${r * 0.4} Z`}
      fill="#8E6B95"
      opacity={0.7}
    />
  </g>
);

export const GoutArt: React.FC<{
  t: number;
  scene: string;
  u: number;
  bi: number;
  stage?: number;
  su?: number;
  sk?: number;
}> = ({t, scene, u, su = u, sk = 0}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  const later = (a: number, b: number) => (sk >= 1 ? inOut(seg(su, a, b - a)) : 0);

  if (scene === "toe") {
    // 一只脚，大脚趾根发红。第二句才浮出「扭到了」这个念头。
    return (
      <g>
        <Toe x={540} y={396} s={0.92} swell={0.15 + 0.75 * on(0.12, 0.6)} />
        <Label x={540} y={668} text="大脚趾" size={30} color={C.inkSoft} />
        <g opacity={later(0.06, 0.3)}>
          <Chip x={540} y={736} text="以为是扭到了" size={28} w={300} />
        </g>
      </g>
    );
  }

  if (scene === "nospr") {
    // 不一定。划掉「扭到」，换成「痛风」。
    return (
      <g>
        <Cross x={196} y={R1} s={1.5} />
        <Chip x={392} y={R1} text="以为是扭到" size={30} w={280} />
        <Arrow x0={556} y0={R1} x1={666} y1={R1} p={later(0.04, 0.3)} color={C.coralDark} />
        <g opacity={later(0.16, 0.32)}>
          <Chip x={818} y={R1} text="痛风" tone="coral" solid size={36} w={230} />
        </g>
      </g>
    );
  }

  if (scene === "bone") {
    // 疼的不是骨头裂了；是关节缝里长出了针。
    return (
      <g>
        <Joint x={540} y={452} s={0.78} />
        <g opacity={on(0.06, 0.3)}>
          <Check x={292} y={700} s={1.1} />
          <Label x={336} y={710} text="骨头没裂" size={28} anchor="start" weight={800} color={C.tealDark} />
        </g>
        <g>
          <Needle x={462} y={486} l={84} rot={-24} p={later(0.04, 0.34)} />
          <Needle x={540} y={470} l={96} rot={4} p={later(0.12, 0.34)} />
          <Needle x={616} y={492} l={80} rot={22} p={later(0.2, 0.34)} />
        </g>
      </g>
    );
  }

  if (scene === "uric") {
    // 一条血流，里面溶着尿酸。第二句让它流起来。
    const drift = 0.5 + 0.5 * on(0.1, 0.9);
    return (
      <g>
        <rect x={68} y={398} width={944} height={204} rx={102} fill="rgba(223,101,85,0.10)" stroke={C.coralDark} strokeWidth={5} strokeDasharray="16 14" />
        {[210, 430, 650, 870].map((cx, i) => (
          <g key={cx} opacity={0.5 + 0.3 * on(0.04 + i * 0.08, 0.3)}>
            <circle cx={cx} cy={500} r={42} fill="#D9736A" opacity={0.55} />
            <circle cx={cx} cy={500} r={20} fill="#F4C9C3" opacity={0.9} />
          </g>
        ))}
        {Array.from({length: 16}).map((_, i) => (
          <circle
            key={i}
            cx={110 + i * 57 + drift * 26 * Math.sin(i * 1.3)}
            cy={456 + 36 * Math.sin(i * 2.1 + t * 1.4)}
            r={7}
            fill={C.amber}
            stroke="#8A5C0E"
            strokeWidth={2}
            opacity={on(0.02 + i * 0.03, 0.3)}
          />
        ))}
        <Arrow x0={790} y0={706} x1={712} y1={478} p={on(0.3, 0.4)} color={C.ink} />
        <Label x={812} y={712} text="尿酸" size={34} anchor="start" weight={800} color="#8A5C0E" />
      </g>
    );
  }

  if (scene === "crystal") {
    // 左边挤到溶不下，右边析出来就是针。
    return (
      <g>
        <circle cx={286} cy={462} r={132} fill="rgba(223,101,85,0.10)" stroke={C.coralDark} strokeWidth={5} />
        {Array.from({length: 26}).map((_, i) => {
          const a = i * 2.399;
          const rr = 118 * Math.sqrt(i / 26);
          return <circle key={i} cx={286 + rr * Math.cos(a)} cy={462 + rr * Math.sin(a)} r={6.5} fill={C.amber} stroke="#8A5C0E" strokeWidth={2} opacity={on(0.02 + i * 0.012, 0.2)} />;
        })}
        <Arrow x0={448} y0={462} x1={604} y1={462} p={later(0.05, 0.3)} color={C.coralDark} />
        <g>
          <Needle x={722} y={430} l={128} rot={-18} p={later(0.14, 0.4)} />
          <Needle x={806} y={452} l={140} rot={8} p={later(0.22, 0.4)} />
          <Needle x={886} y={428} l={120} rot={26} p={later(0.3, 0.4)} />
        </g>
      </g>
    );
  }

  if (scene === "wbc") {
    // 针扎在关节表面；身体发现有东西扎进来，白细胞从旁边赶过来。
    return (
      <g>
        <Joint x={430} y={462} s={0.64} />
        <Needle x={392} y={492} l={76} rot={-20} p={on(0.04, 0.3)} />
        <Needle x={444} y={480} l={88} rot={6} p={on(0.1, 0.3)} />
        <Needle x={492} y={498} l={70} rot={24} p={on(0.16, 0.3)} />
        <g opacity={later(0.02, 0.3)}>
          <Cell x={876} y={386} r={50} p={later(0.04, 0.3)} />
          <Cell x={912} y={520} r={42} p={later(0.12, 0.3)} />
          <Cell x={826} y={606} r={36} p={later(0.2, 0.3)} />
          <Arrow x0={764} y0={452} x1={604} y1={482} p={later(0.24, 0.3)} color="#8E6B95" width={6} />
        </g>
      </g>
    );
  }

  if (scene === "wrap") {
    // 白细胞把针包住，这一块就又红、又肿、又热。
    const cells = [
      [-158, -96], [10, -150], [156, -86], [172, 74], [4, 140], [-172, 78],
    ];
    return (
      <g>
        <circle cx={540} cy={456} r={92 + 62 * later(0.06, 0.5)} fill={C.coral} opacity={0.12 + 0.26 * later(0.06, 0.5)} />
        <Needle x={518} y={430} l={96} rot={-14} p={1} />
        <Needle x={560} y={470} l={110} rot={12} p={1} />
        <Needle x={506} y={500} l={72} rot={34} p={1} />
        {cells.map(([dx, dy], i) => (
          <Cell key={i} x={540 + dx} y={456 + dy} r={i % 2 ? 40 : 48} p={on(0.04 + i * 0.09, 0.28)} />
        ))}
        <g opacity={later(0.06, 0.34)}>
          <Chip x={368} y={724} text="红" tone="coral" solid size={28} w={110} />
          <Chip x={540} y={724} text="肿" tone="coral" solid size={28} w={110} />
          <Chip x={712} y={724} text="热" tone="coral" solid size={28} w={110} />
        </g>
      </g>
    );
  }

  if (scene === "flare") {
    // 痛来得又急又狠；常常半夜把人疼醒。
    return (
      <g>
        <Curve
          x={70}
          y={386}
          w={600}
          h={250}
          p={on(0.05, 0.5)}
          tone={C.coralDark}
          width={9}
          pts={[[0, 0.88], [0.22, 0.82], [0.3, 0.04], [0.38, 0.92], [0.7, 0.5], [1, 0.58]]}
        />
        <g opacity={later(0.04, 0.36)}>
          <Clock x={818} y={470} r={88} h={3} m={12} label="半夜" />
        </g>
      </g>
    );
  }

  if (scene === "where") {
    // 最常见是大脚趾根；别的关节也会。
    return (
      <g>
        <Toe x={372} y={440} s={0.86} swell={0.7} />
        <ellipse cx={372} cy={568} rx={92} ry={58} fill="none" stroke={C.coralDark} strokeWidth={6} strokeDasharray="14 11" />
        <Label x={372} y={706} text="大脚趾根" size={32} weight={800} color={C.coralDark} />
        <g opacity={later(0.04, 0.36)}>
          <Chip x={818} y={402} text="踝关节" tone="ink" size={28} w={230} />
          <Chip x={818} y={492} text="膝关节" tone="ink" size={28} w={230} />
          <Chip x={818} y={582} text="手腕" tone="ink" size={28} w={230} />
        </g>
      </g>
    );
  }

  if (scene === "highnot") {
    // 尿酸高 ≠ 痛风。高了很久，关节里也可以还是干净的。
    return (
      <g>
        <Label x={286} y={448} text="尿酸高" size={62} weight={800} color="#9A6B12" />
        <Label x={540} y={456} text="≠" size={92} weight={800} color={C.inkSoft} />
        <Label x={800} y={448} text="痛风" size={62} weight={800} color={C.coralDark} />
        <g opacity={later(0.04, 0.4)}>
          <ellipse cx={812} cy={678} rx={116} ry={118} fill="none" stroke={C.paperShadow} strokeWidth={6} strokeDasharray="14 11" />
          <Joint x={812} y={676} s={0.42} />
          <Check x={664} y={676} s={1.15} />
        </g>
      </g>
    );
  }

  if (scene === "quiet") {
    // 痛会自己缓几天；缓了不等于针没了。
    return (
      <g>
        <Clock x={252} y={452} r={78} h={9} m={0} label="几天" />
        <Joint x={842} y={440} s={0.46} />
        <Needle x={812} y={462} l={64} rot={-20} p={on(0.06, 0.3)} />
        <Needle x={848} y={452} l={74} rot={6} p={on(0.12, 0.3)} />
        <Needle x={880} y={470} l={58} rot={26} p={on(0.18, 0.3)} />
        <g opacity={later(0.04, 0.36)}>
          <ellipse cx={842} cy={456} rx={116} ry={128} fill="none" stroke={C.coralDark} strokeWidth={6} strokeDasharray="14 11" />
          <Label x={842} y={692} text="针还在" size={34} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  if (scene === "acute") {
    // 这一次：先止痛消肿。止痛药别自己乱吃。
    return (
      <g>
        <Panel x={56} y={396} w={440} h={336} title="这一次" tone={C.coralDark} on={on(0.04, 0.32)}>
          <Label x={276} y={552} text="先止痛" size={38} weight={800} />
          <Label x={276} y={624} text="再消肿" size={38} weight={800} />
        </Panel>
        <Panel x={584} y={396} w={440} h={336} title="止痛药" tone={C.ink} on={later(0.04, 0.32)}>
          <Label x={804} y={572} text="别自己乱吃" size={36} weight={800} color={C.coralDark} />
        </Panel>
      </g>
    );
  }

  if (scene === "long") {
    // 尿酸要长期往下压；吃一次清淡管不了已经长出来的针。
    return (
      <g>
        <Label x={110} y={456} text="长期" size={30} anchor="start" weight={800} color={C.tealDark} />
        <line x1={224} y1={421} x2={964} y2={421} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 12" />
        <Curve x={224} y={400} w={740} h={150} p={on(0.04, 0.4)} tone={C.tealDark} width={9} pts={[[0, 0.14], [0.3, 0.34], [0.62, 0.58], [1, 0.8]]} />
        <g opacity={later(0.06, 0.36)}>
          <Label x={110} y={700} text="一次" size={30} anchor="start" weight={800} color={C.inkSoft} />
          <line x1={224} y1={700} x2={964} y2={700} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 12" />
          <Curve x={224} y={640} w={740} h={120} p={later(0.08, 0.4)} tone={C.inkSoft} width={8} pts={[[0, 0.5], [0.1, 0.92], [0.22, 0.5], [1, 0.5]]} />
        </g>
      </g>
    );
  }

  if (scene === "food") {
    // 三样最容易把尿酸顶上去；在吃药的，别因为不疼了就自己停。
    return (
      <g>
        <Panel x={56} y={372} w={520} h={392} title="少碰" tone={C.coralDark} on={on(0.04, 0.3)}>
          {["啤酒", "动物内脏", "含糖饮料"].map((txt, i) => (
            <g key={txt} opacity={on(0.1 + i * 0.14, 0.28)}>
              <Chip x={316} y={486 + i * 96} text={txt} tone="coral" size={30} w={330} />
            </g>
          ))}
        </Panel>
        <Panel x={640} y={372} w={384} h={392} title="在吃药" tone={C.tealDark} on={later(0.04, 0.3)}>
          <Label x={832} y={530} text="不疼了" size={34} weight={800} />
          <Label x={832} y={604} text="也别停" size={34} weight={800} color={C.coralDark} />
        </Panel>
      </g>
    );
  }

  if (scene === "doctor") {
    // 是不是痛风，医生看关节，必要时看化验。
    return (
      <g>
        <Joint x={300} y={452} s={0.58} />
        <Needle x={276} y={476} l={68} rot={-20} p={on(0.06, 0.3)} />
        <Needle x={312} y={468} l={78} rot={8} p={on(0.12, 0.3)} />
        <g opacity={on(0.1, 0.3)}>
          <Check x={508} y={436} s={1.15} />
          <Label x={552} y={446} text="看关节" size={34} anchor="start" weight={800} />
        </g>
        <g opacity={later(0.04, 0.34)}>
          <Check x={508} y={566} s={1.15} />
          <Label x={552} y={576} text="必要时看化验" size={34} anchor="start" weight={800} />
        </g>
      </g>
    );
  }

  if (scene === "silent") {
    // 不疼了，针还在；而且伤的不只是关节。
    return (
      <g>
        <Joint x={400} y={440} s={0.58} />
        <Needle x={372} y={466} l={70} rot={-20} p={on(0.04, 0.3)} />
        <Needle x={410} y={456} l={82} rot={6} p={on(0.1, 0.3)} />
        <Needle x={446} y={476} l={62} rot={26} p={on(0.16, 0.3)} />
        <g opacity={on(0.2, 0.3)}>
          <Label x={400} y={704} text="针还在" size={34} weight={800} color={C.coralDark} />
        </g>
        <g opacity={later(0.05, 0.36)}>
          <Arrow x0={606} y0={470} x1={690} y1={470} p={later(0.1, 0.3)} color={C.coralDark} dash="12 10" />
          <Chip x={814} y={470} text="不止关节" tone="coral" solid size={30} w={230} />
        </g>
      </g>
    );
  }

  if (scene === "close") {
    // 收尾只留针，话交给片尾卡。
    return (
      <g>
        <circle cx={540} cy={470} r={182} fill="rgba(223,101,85,0.10)" stroke={C.coralDark} strokeWidth={5} strokeDasharray="16 14" />
        <Needle x={462} y={452} l={176} rot={-16} p={on(0.04, 0.4)} />
        <Needle x={546} y={492} l={196} rot={10} p={on(0.12, 0.4)} />
        <Needle x={628} y={444} l={160} rot={30} p={on(0.2, 0.4)} />
      </g>
    );
  }

  return (
    <g>
      <Joint x={540} y={452} s={0.7} />
      <Needle x={540} y={480} l={80} rot={6} p={1} />
    </g>
  );
};
