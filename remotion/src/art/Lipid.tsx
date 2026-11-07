import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Check, Cross, Label, Sheet} from "../diagrams";
import {PillBox} from "../parts";
import {COL, Panel, ROW} from "./kit";

/* 第 4 期：血脂报告怎么看
 * 一张世界画布：左边是身体（肝在里面、细胞等料），中间一条血路，右端是血管壁。
 * 机制段（ship→plaque 九个场景）全部在这张图上做「推近局部 → 拉回总览」的缩放，
 * 只在总览上换话题，不切屏；观众永远知道每个东西在全身里的位置。
 */

/** 一辆车：车厢 + 两个轮子 + 里面装的两种货。spin 给轮子转动角（弧度），跑车时带速度线和落地影。 */
const Car: React.FC<{x: number; y: number; s?: number; tone?: string; spin?: number}> = ({x, y, s = 1, tone = C.ink, spin = 0}) => (
  <g>
    <ellipse cx={x} cy={y + 84 * s} rx={95 * s} ry={12 * s} fill={C.paperShadow} opacity={0.4} />
    {spin > 0 ? (
      <g stroke={tone} strokeWidth={4.5 * s} opacity={0.3} strokeLinecap="round">
        <line x1={x - 126 * s} y1={y - 20 * s} x2={x - 104 * s} y2={y - 20 * s} />
        <line x1={x - 138 * s} y1={y + 2 * s} x2={x - 110 * s} y2={y + 2 * s} />
      </g>
    ) : null}
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
    <circle cx={x - 30 * s} cy={y - 12 * s} r={7 * s} fill={C.amber} stroke="#A9771B" strokeWidth={2 * s} />
    <circle cx={x + 14 * s} cy={y - 16 * s} r={6 * s} fill={C.teal} stroke={C.tealDark} strokeWidth={2 * s} />
    <circle cx={x - 48 * s} cy={y + 60 * s} r={17 * s} fill={tone} opacity={0.9} />
    <circle cx={x + 48 * s} cy={y + 60 * s} r={17 * s} fill={tone} opacity={0.9} />
    <circle cx={x - 48 * s + Math.cos(spin) * 8 * s} cy={y + 60 * s + Math.sin(spin) * 8 * s} r={4.5 * s} fill={C.white} opacity={0.9} />
    <circle cx={x + 48 * s + Math.cos(spin + 2) * 8 * s} cy={y + 60 * s + Math.sin(spin + 2) * 8 * s} r={4.5 * s} fill={C.white} opacity={0.9} />
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

/* ---------- 世界画布与镜头 ---------- */

/** 镜头节奏：u 在 [a,b] 推到最高、[c,d] 拉回全览，边界永远落在全览上。 */
const bump = (u: number, a: number, b: number, c: number, d: number) => {
  const up = Math.min(1, Math.max(0, (u - a) / Math.max(0.001, b - a)));
  const down = Math.min(1, Math.max(0, (d - u) / Math.max(0.001, d - c)));
  return inOut(Math.min(up, down));
};

/** 缩放镜头：把 (fx,fy) 推到画面中心附近，比例 z。 */
const Cam: React.FC<{z: number; fx: number; fy: number; children: React.ReactNode}> = ({z = 1, fx = 540, fy = 610, children}) => (
  <g transform={`translate(${540 - fx * z} ${610 - fy * z}) scale(${z})`}>{children}</g>
);

const MECH = new Set(["ship", "cargo", "light", "send", "back", "waste", "both", "toomuch", "plaque"]);

const World: React.FC<{t: number; u: number; scene: string}> = ({t, u, scene}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  const flow = (t * 0.1) % 1;

  /* 各拍的镜头调度与演员位置 */
  let z = 1;
  let fx = 540;
  let fy = 610;
  let ldl: number | null = null;
  let hdl: number | null = null;
  let plaqueP = 0;
  let mag = false;
  let ldlSpin = 0;
  let hdlSpin = 0;
  const showCallout = scene === "ship" || scene === "waste";

  if (scene === "ship") {
    z = 1 + 0.6 * bump(u, 0.3, 0.5, 0.62, 0.85);
    fx = 430;
    fy = 600;
  } else if (scene === "cargo") {
    z = 1 + 0.55 * bump(u, 0.12, 0.3, 0.7, 0.92);
    fx = 700;
    ldl = 700;
  } else if (scene === "light") {
    z = 1 + 0.5 * on(0.02, 0.16);
    fx = 660;
    ldl = 700;
    mag = true;
  } else if (scene === "send") {
    z = 1 + 0.5 * (1 - on(0.02, 0.28));
    fx = 700;
    ldl = 370 + 570 * on(0.08, 0.78);
    ldlSpin = t * 7;
  } else if (scene === "back") {
    z = 1 + 0.5 * (1 - on(0.02, 0.28));
    fx = 700;
    /* 与去程车同向顺流：高密度不是“开回去”，而是一路把散落的胆固醇捡进车厢 */
    hdl = 430 + 480 * on(0.08, 0.78);
    hdlSpin = t * 7;
  } else if (scene === "waste") {
    z = 1 + 0.5 * bump(u, 0.08, 0.28, 0.72, 0.95);
    fx = 330;
    fy = 580;
    hdl = 430;
  } else if (scene === "both") {
    /* 同一条血流只有一个方向：两辆车都顺流，一辆边走边卸、一辆边走边收 */
    ldl = 370 + 540 * on(0.04, 0.45);
    hdl = 360 + 520 * on(0.5, 0.9);
    ldlSpin = t * 7;
    hdlSpin = t * 7;
  } else if (scene === "toomuch") {
    plaqueP = 0.3 * on(0.6, 0.95);
  } else if (scene === "plaque") {
    z = 1 + 0.75 * bump(u, 0.05, 0.25, 0.75, 0.98);
    fx = 870;
    fy = 680;
    plaqueP = on(0.06, 0.78);
  }

  /* ship 的相位 */
  const pFan = scene === "ship" ? on(0.14, 0.26) : scene === "both" || scene === "toomuch" ? 1 : 0.85;
  const pBlood = scene === "ship" ? on(0.28, 0.38) : 1;
  const pProb = scene === "ship" ? on(0.44, 0.56) : 0;
  const pPack = scene === "ship" ? on(0.6, 0.74) : 0;
  const pName = scene === "ship" ? on(0.8, 0.92) : 0;

  /* 斑块长在血管内壁（内膜），向管腔内生长、挤窄通道：bulge 是向内鼓出的高度，
   * mound 是斑块下缘——血流颗粒要从斑块下缘和管壁下缘之间的窄缝里挤过去。 */
  const bulge = 46 * plaqueP;
  const mound = 588 + bulge;

  return (
    <g transform={`translate(${Math.sin(t * 0.45) * 3.5} ${Math.cos(t * 0.6) * 3})`}>
      <Cam z={z} fx={fx} fy={fy}>
      {/* 身体：头 + 躯干 + 双腿 + 落地影（剪纸小人，比例按正常人形） */}
      <ellipse cx={250} cy={858} rx={84} ry={12} fill={C.paperShadow} opacity={0.4} />
      <circle cx={250} cy={368} r={44} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <rect x={172} y={426} width={156} height={376} rx={70} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <rect x={206} y={788} width={34} height={62} rx={17} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <rect x={262} y={788} width={34} height={62} rx={17} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <g transform={`translate(250 500) scale(${1 + 0.03 * Math.sin(t * 2.2)}) translate(-250 -500)`}>
        <path d="M 212 486 Q 250 462 288 484 Q 302 510 272 526 Q 230 534 210 514 Z" fill={C.amber} stroke="#A9771B" strokeWidth={4} />
        <path d="M 222 492 Q 250 480 278 490" fill="none" stroke="#A9771B" strokeWidth={2.5} opacity={0.5} />
        <ellipse cx={236} cy={487} rx={15} ry={6} fill={C.white} opacity={0.25} />
        <Label x={250} y={560} text="肝" size={22} weight={800} color="#A9771B" />
      </g>
      {showCallout ? (
        <g>
          <line x1={290} y1={498} x2={376} y2={452} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="6 6" opacity={0.6} />
          <Label x={382} y={458} text="主要的工厂" size={20} weight={800} color="#A9771B" anchor="start" />
        </g>
      ) : null}
      <g opacity={pFan}>
        {[
          [222, 658],
          [264, 690],
          [304, 650],
          [234, 740],
          [288, 760],
          [326, 714],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={13} fill={C.tealLight} stroke={C.tealDark} strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={5} fill={C.tealDark} opacity={0.85} />
            <circle cx={cx - 6} cy={cy + 5} r={1.8} fill={C.tealDark} opacity={0.5} />
            <circle cx={cx + 6} cy={cy - 5} r={1.8} fill={C.tealDark} opacity={0.5} />
          </g>
        ))}
        <line x1={272} y1={524} x2={226} y2={646} stroke={C.tealDark} strokeWidth={3} strokeDasharray="6 6" opacity={0.6} />
        <line x1={272} y1={524} x2={300} y2={638} stroke={C.tealDark} strokeWidth={3} strokeDasharray="6 6" opacity={0.6} />
        <line x1={272} y1={524} x2={240} y2={732} stroke={C.tealDark} strokeWidth={3} strokeDasharray="6 6" opacity={0.5} />
        {scene === "ship" ? <Label x={250} y={878} text="用料在全身上下" size={20} weight={700} color={C.inkSoft} /> : null}
      </g>

      {/* 血路：流着的颗粒 + 周期性流过的一条亮带（脉搏）+ 下缘内壁线 */}
      <g opacity={pBlood}>
        <rect x={336} y={586} width={664} height={66} rx={33} fill={C.tealLight} stroke={C.tealDark} strokeWidth={4} opacity={0.92} />
        <rect x={336 + ((t * 80) % 504)} y={594} width={160} height={50} rx={25} fill={C.white} opacity={0.15} />
        <line x1={352} y1={636} x2={984} y2={636} stroke={C.tealDark} strokeWidth={3} opacity={0.22} strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={((flow + i / 6) % 1) * 640 + 352} cy={618 + 20 * plaqueP} r={8} fill={C.amber} opacity={0.7} />
        ))}
        {scene !== "plaque" && scene !== "light" ? <Label x={668} y={692} text="血：唯一的长途路" size={22} weight={800} color={C.tealDark} /> : null}
      </g>

      {/* 右端血管壁上的斑块 */}
      {/* 右端血管壁：斑块从内壁上缘向下鼓进管腔 */}
      <g opacity={plaqueP > 0.02 ? 1 : 0}>
        <path d={`M 770 588 Q 825 ${mound} 885 ${mound} Q 945 ${mound} 1000 588 Z`} fill="#C0743F" stroke="#8A4A22" strokeWidth={4} />
        <path
          d={`M 810 588 Q 850 ${588 + bulge * 0.55} 885 ${588 + bulge * 0.55} Q 920 ${588 + bulge * 0.55} 960 588`}
          fill="none"
          stroke="#8A4A22"
          strokeWidth={3}
          opacity={0.4}
        />
        <ellipse cx={846} cy={588 + bulge * 0.4} rx={30} ry={8} fill={C.white} opacity={0.14} />
        {[810, 862, 912].map((px) => (
          <circle key={px} cx={px} cy={588 + bulge * 0.55} r={5} fill={C.amber} stroke="#8A4A22" strokeWidth={2} />
        ))}
        {plaqueP > 0.45 ? <Label x={885} y={mound + 30} text="斑块" size={24} weight={800} color="#8A4A22" /> : null}
      </g>

      {/* 演员车：回程车走血路内侧的低位车道，避免在画面上与去程车重叠 */}
      {ldl !== null ? <Car x={ldl} y={619} s={0.72} tone={C.coralDark} spin={ldlSpin} /> : null}
      {hdl !== null ? <Car x={hdl} y={scene === "back" || scene === "both" ? 640 : 619} s={0.72} tone={C.tealDark} spin={hdlSpin} /> : null}
      {scene === "toomuch"
        ? [430, 545, 660, 775, 890].map((x) => <Car key={x} x={x} y={619} s={0.55} tone={C.coralDark} spin={t * 2} />)
        : null}

      {/* 密度放大镜 */}
      {mag ? (
        <g>
          <circle cx={880} cy={396} r={95} fill={C.white} stroke={C.ink} strokeWidth={5} />
          {[780, 830, 880, 930, 980].map((x, i) => (
            <circle key={x} cx={x - 50} cy={380 + (i % 2) * 34} r={15} fill={C.amber} stroke="#A9771B" strokeWidth={3} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return <circle key={i} cx={880 + Math.cos(a) * 72} cy={396 + Math.sin(a) * 72} r={6} fill={C.tealDark} />;
          })}
          <Label x={880} y={522} text="油多的车，漂在上面" size={22} weight={800} color={C.coralDark} />
        </g>
      ) : null}

      {/* —— 分拍注解 —— */}
      {scene === "ship" ? (
        <g>
          <g opacity={pProb * (1 - pPack)}>
            <circle cx={470 + Math.sin(t * 5) * 7} cy={619} r={24} fill={C.amber} stroke="#A9771B" strokeWidth={4} />
            <Label x={470} y={566} text="胆固醇" size={20} weight={800} color="#A9771B" />
            <Cross x={528} y={600} s={0.8} />
            <Label x={532} y={648} text="化不开，上不去" size={18} weight={700} color={C.inkSoft} />
          </g>
          <g opacity={pPack}>
            <Car x={470} y={619} s={0.72} tone={C.ink} />
          </g>
          <g opacity={pPack * (1 - pName)}>
            <Label x={700} y={540} text="外面裹上蛋白" size={22} weight={800} color={C.coralDark} />
          </g>
          <g opacity={pName}>
            <Label x={700} y={540} text="脂蛋白：血里的货车" size={22} weight={800} color={C.coralDark} />
          </g>
        </g>
      ) : null}

      {scene === "cargo" ? (
        <g>
          <g opacity={on(0.05, 0.18)}>
            <circle cx={668} cy={556} r={14} fill={C.amber} stroke="#A9771B" strokeWidth={3} />
            <Label x={668} y={530} text="胆固醇" size={18} weight={800} color="#A9771B" />
            <circle cx={736} cy={556} r={14} fill={C.teal} stroke={C.tealDark} strokeWidth={3} />
            <Label x={736} y={530} text="甘油三酯" size={18} weight={800} color={C.tealDark} />
          </g>
          <g opacity={on(0.3, 0.44)}>
            <Label x={700} y={470} text="两种货，搭同一批车" size={24} weight={800} />
          </g>
          <g opacity={on(0.55, 0.72)}>
            <Panel x={560} y={726} w={280} h={120} title="备用燃料" tone="#9A6B12" on={1}>
              <Label x={700} y={812} text="饿了、运动时，烧掉供能" size={18} weight={700} />
            </Panel>
          </g>
        </g>
      ) : null}

      {scene === "light" ? (
        <g opacity={on(0.1, 0.3)}>
          <Label x={560} y={540} text="低密度：送货的车" size={24} weight={800} color={C.coralDark} />
        </g>
      ) : null}

      {scene === "send" ? (
        <g opacity={on(0.15, 0.45)}>
          <Label x={620} y={540} text="低密度：往外送" size={26} weight={800} color={C.coralDark} />
        </g>
      ) : null}

      {scene === "back" ? (
        <g>
          <g opacity={on(0.15, 0.45)}>
            <Label x={620} y={540} text="高密度：一路收货" size={26} weight={800} color={C.tealDark} />
          </g>
          <g opacity={on(0.5, 0.75)}>
            <Label x={620} y={584} text="蛋白多、油少，所以沉" size={20} weight={700} color={C.inkSoft} />
          </g>
          {[0, 1, 2].map((k) => (
            <circle
              key={k}
              cx={hdl - 22 + k * 22}
              cy={626 - (k % 2) * 8}
              r={6}
              fill={C.amber}
              stroke="#A9771B"
              strokeWidth={2}
              opacity={on(0.2 + k * 0.18, 0.12)}
            />
          ))}
        </g>
      ) : null}

      {scene === "waste" ? (
        <g>
          {/* 这一拍镜头推近到肝门口（焦点 330,580、最大 1.5 倍），注解全部收进
              [30,650] 的安全窗里，peak zoom 下也不会出画 */}
          <g opacity={on(0.05, 0.22)}>
            <circle cx={520} cy={520} r={20} fill={C.amber} stroke="#A9771B" strokeWidth={4} />
            <circle cx={578} cy={552} r={15} fill={C.amber} stroke="#A9771B" strokeWidth={3} />
            <Label x={428} y={470} text="细胞用剩的、血管壁上的" size={18} weight={800} color="#A9771B" anchor="start" />
            <Cross x={636} y={512} s={0.8} />
            <Label x={630} y={560} text="不能就地扔" size={18} weight={700} color={C.inkSoft} anchor="end" />
          </g>
          <g opacity={on(0.26, 0.46)}>
            <Arrow x0={640} y0={600} x1={360} y1={600} p={1} color={C.tealDark} width={7} />
            <Label x={500} y={566} text="收满一车回肝" size={20} weight={800} color={C.tealDark} />
          </g>
          <g opacity={on(0.5, 0.68)}>
            <Arrow x0={312} y0={822} x1={312} y1={868} p={1} color="#9A6B12" width={6} head={16} />
            <Label x={332} y={862} text="变成胆汁酸，随大便排掉" size={20} weight={800} color="#9A6B12" anchor="start" />
          </g>
        </g>
      ) : null}

      {scene === "both" ? (
        <g>
          <g opacity={on(0.05, 0.25)}>
            <Label x={640} y={540} text="低密度：送货" size={24} weight={800} color={C.coralDark} />
          </g>
          <g opacity={on(0.5, 0.72)}>
            <Label x={640} y={540} text="高密度：收货" size={24} weight={800} color={C.tealDark} />
          </g>
          {[0, 1, 2].map((k) => (
            <circle
              key={k}
              cx={hdl - 22 + k * 22}
              cy={640 - 14 - (k % 2) * 8}
              r={6}
              fill={C.amber}
              stroke="#A9771B"
              strokeWidth={2}
              opacity={on(0.55 + k * 0.12, 0.12)}
            />
          ))}
          <g opacity={on(0.55, 0.75)}>
            <rect x={196} y={456} width={110} height={92} rx={22} fill="none" stroke={C.coralDark} strokeWidth={4} strokeDasharray="9 7" />
            <Label x={400} y={478} text="发货、收货，都是它" size={22} weight={800} color={C.coralDark} anchor="start" />
          </g>
        </g>
      ) : null}

      {scene === "toomuch" ? (
        <g>
          <g opacity={on(0.05, 0.25)}>
            <Label x={620} y={540} text="低密度：送得太多" size={26} weight={800} color={C.coralDark} />
          </g>
          <g opacity={on(0.35, 0.55)}>
            <Label x={620} y={470} text="细胞用不完" size={24} weight={800} />
          </g>
          <g opacity={on(0.5, 0.72)}>
            <Arrow x0={890} y0={505} x1={890} y1={590} p={1} color={C.coralDark} width={6} head={16} />
            <Label x={890} y={486} text="漏进血管壁，卡在里面" size={20} weight={800} color={C.coralDark} />
          </g>
        </g>
      ) : null}

      {scene === "plaque" ? (
        <g>
          <g opacity={on(0.08, 0.3)}>
            <Label x={830} y={520} text="颗粒一层层堆进血管壁" size={24} weight={800} color={C.coralDark} />
          </g>
          <g opacity={on(0.15, 0.35)}>
            <Label x={742} y={566} text="血管内壁" size={18} weight={700} color={C.inkSoft} anchor="start" />
          </g>
          <g opacity={on(0.45, 0.7)}>
            <Label x={830} y={864} text="血管变窄、堵住，心梗脑梗就来了" size={20} weight={800} />
          </g>
        </g>
      ) : null}

      {/* 前景微粒：跟着镜头走的空气层，让静止画面也有生气 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <circle
          key={i}
          cx={120 + ((i * 173 + t * (6 + (i % 3) * 2)) % 900)}
          cy={380 + ((i * 97) % 380) + Math.sin(t * 0.7 + i) * 14}
          r={2.5 + (i % 3)}
          fill={C.inkSoft}
          opacity={0.12 + (i % 3) * 0.04}
        />
      ))}
      </Cam>
    </g>
  );
};

export const LipidArt: React.FC<{t: number; scene: string; u: number; bi: number}> = ({t, scene, u}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  if (MECH.has(scene)) {
    return <World t={t} u={u} scene={scene} />;
  }

  if (scene === "report") {
    return <Sheet4 onIdx={[]} />;
  }

  /* 回到单子看第一行：总胆固醇 */
  if (scene === "report0") {
    return <Sheet4 onIdx={[0]} />;
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

  /* 它是身体要用的原料：造膜、造激素，每个细胞都等着用 */
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
          <Label x={540} y={792} text="所以每个细胞都等着用" size={30} weight={800} />
        </g>
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
            ["1.0", "极低密度等", C.inkSoft],
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

  /* 第一行：总数当警报，一高就要往下细看 */
  if (scene === "alarm") {
    const p = on(0.08, 0.5);
    return (
      <g>
        <Sheet4 onIdx={[0]} />
        <Tie y={ROW_Y(0)} p={p} />
        <Label x={882} y={520} text="警报" size={64} weight={800} color="#9A6B12" />
        <line x1={760} y1={600} x2={1004} y2={600} stroke="#9A6B12" strokeWidth={6} opacity={p} />
        <Label x={882} y={664} text="一高，说明油总量超了" size={26} weight={800} />
        <Label x={882} y={710} text="该往下细看" size={26} color={C.coralDark} weight={800} />
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
            <Label x={882} y={596} text="血管壁上的也收" size={24} weight={700} color={C.tealDark} />
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
        <Label x={COL[0]} y={ROW[2] + 20} text="降脂药" size={28} />
        <Cross x={COL[1]} y={ROW[1] - 30} s={2.2} />
        <Label x={COL[1]} y={ROW[1] + 80} text="自己停" size={30} color={C.coralDark} weight={800} />
        <Label x={COL[2] - 10} y={ROW[1] - 10} text="调量以后" size={32} weight={800} />
        <Label x={COL[2] - 10} y={ROW[1] + 56} text="查血脂和肝功" size={32} weight={800} />
      </g>
    );
  }

  /* 年年体检：这张单子定期查 */
  if (scene === "checkup") {
    const p = on(0.1, 0.4);
    return (
      <g>
        <Sheet4 onIdx={[]} />
        <Tie y={ROW_Y(2)} p={p} />
        <g opacity={p}>
          <rect x={740} y={430} width={284} height={220} rx={24} fill={C.tealLight} stroke={C.tealDark} strokeWidth={5} />
          <Label x={882} y={528} text="年年体检" size={34} weight={800} color={C.tealDark} />
          <Label x={882} y={586} text="把它查上" size={34} weight={800} color={C.tealDark} />
        </g>
      </g>
    );
  }

  return <Sheet4 onIdx={[]} />;
};
