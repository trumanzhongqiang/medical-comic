import React from "react";
import {C, SANS} from "../theme";
import {clamp, inOut, seg} from "../motion";
import {Arrow, Bars, Bowl, Check, Cup, Label, Plate, RBC, Ruler, Sheet, TimeWindow} from "../diagrams";

/* 第 2 期：空腹正常、糖化超标，该信谁？
 *
 * 一个主角：一张化验单上的两个数。
 * 一条隐喻：空腹 = 一张照片，糖化 = 三个月的平均。只用这两个，不用「账本 / 记录」的比喻。
 * 每拍两句话：第一句给出能指认的东西，第二句才解释它在干什么。
 *
 * v4 减法（和第七期同一套）：
 *   1. 画面里不写字幕已经说过的那句结论。删掉了「一个说没事一个说危险」「问题多半出在饭后」
 *      「糖化失真时不能单独当证据」「对上才算数」等六处，它们和旁白一字不差。
 *   2. 每页文字块不超过四个：图 + 一两个标签 + 一个数字。
 *   3. 第二句才出现的元素走 later()，跟着旁白走，不提前堆在画面上。
 */

const C0 = 200;
const C1 = 540;
const C2 = 880;
const R0 = 372;
const R1 = 562;

const X0 = 56;
const X1 = 1024;

/** 平滑折线：pts 用 0–1 归一化，y=0 在顶上。 */
const Line: React.FC<{x: number; y: number; w: number; h: number; pts: Array<[number, number]>; p: number; tone?: string; width?: number}> = ({
  x,
  y,
  w,
  h,
  pts,
  p,
  tone = C.coralDark,
  width = 9,
}) => {
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
      strokeDasharray={len}
      strokeDashoffset={len * (1 - clamp(p))}
    />
  );
};

const Axis: React.FC<{x: number; y: number; w: number; labels: string[]}> = ({x, y, w, labels}) => (
  <g>
    <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.paperShadow} strokeWidth={4} />
    {labels.map((t, i) => (
      <g key={t}>
        <line x1={x + (w * i) / (labels.length - 1)} y1={y - 8} x2={x + (w * i) / (labels.length - 1)} y2={y + 8} stroke={C.paperShadow} strokeWidth={4} />
        <Label x={x + (w * i) / (labels.length - 1)} y={y + 34} text={t} size={24} color={C.inkSoft} weight={600} />
      </g>
    ))}
  </g>
);

/** 刻度底线：让一条横轴读起来像尺子。 */
const Ticks: React.FC<{x: number; y: number; w: number; min: number; max: number; step: number; label?: string}> = ({
  x,
  y,
  w,
  min,
  max,
  step,
  label,
}) => {
  const pos = (v: number) => x + ((v - min) / (max - min)) * w;
  const vs: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-6; v += step) vs.push(Number(v.toFixed(2)));
  return (
    <g>
      {vs.map((v) => (
        <line key={v} x1={pos(v)} y1={y + 18} x2={pos(v)} y2={y + 30} stroke={C.paperShadow} strokeWidth={4} strokeLinecap="round" />
      ))}
      {label ? <Label x={x} y={y + 66} text={label} size={22} anchor="start" color={C.inkSoft} weight={600} /> : null}
    </g>
  );
};

/** 判定章：贴在报告行上的「正常 / 超标」。 */
const Pill: React.FC<{x: number; y: number; text: string; tone: string; p?: number}> = ({x, y, text, tone, p = 1}) => (
  <g opacity={clamp(p)}>
    <rect x={x - 74} y={y - 26} width={148} height={52} rx={26} fill={tone} />
    <Label x={x} y={y + 11} text={text} size={26} color={C.white} weight={800} />
  </g>
);

export const BloodSugarArt: React.FC<{
  t: number;
  scene: string;
  u: number;
  bi: number;
  stage?: number;
  su?: number;
  sk?: number;
}> = ({t, scene, u, su = u, sk = 0}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  // 第二句才出现的东西：看「本拍第几条字幕」，不是「第几句」，否则一句话被拆成
  // 两三条字幕时就永远等不到。
  const later = (a: number, b: number) => (sk >= 1 ? inOut(seg(su, a, b - a)) : 0);

  switch (scene) {
    /* 一张报告，两个数：一个正常，一个超标 */
    case "report": {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.4);
      return (
        <g>
          <Sheet
            x={230}
            y={330}
            w={620}
            h={450}
            title="化验单 · 血糖"
            fs={40}
            rowH={170}
            rows={[
              {name: "空腹血糖", value: "5.6", unit: "mmol/L", on: true},
              {name: "糖化", value: "7.2", unit: "%  ↑", on: true},
            ]}
          />
          <Pill x={586} y={504} text="正常" tone={C.tealDark} p={on(0.12, 0.22)} />
          <g opacity={later(0.04, 0.3)}>
            <Pill x={586} y={674} text="超标" tone={C.coralDark} />
          </g>
        </g>
      );
    }

    /* 两个数不在同一段时间：一条极窄，一条通长 */
    case "timeline": {
      return (
        <g>
          <TimeWindow
            x={320}
            y={430}
            w={620}
            rowH={150}
            rows={[
              {label: "空腹", a: 0.945, b: 1, tone: C.tealDark, on: true},
              {label: "糖化", a: 0, b: 1, tone: C.coral, on: true},
            ]}
          />
          <Axis x={320} y={780} w={620} labels={["三个月前", "现在"]} />
        </g>
      );
    }

    /* 空腹 = 一张照片：只这一瞬间 */
    case "camera": {
      const snap = on(0.2, 0.12);
      const out = later(0.02, 0.2);
      return (
        <g>
          {/* 一串三步：夜里 → 按快门 → 得到一张照片。排成一行，中间两条箭头连起来 */}
          <g transform="translate(200 560) scale(1.7)">
            <path d="M 18 -46 A 48 48 0 1 0 18 46 A 38 38 0 1 1 18 -46 Z" fill={C.amberLight} stroke={C.ink} strokeWidth={5} />
          </g>
          <Label x={200} y={704} text="凌晨，没吃东西" size={26} weight={700} />
          <Label x={200} y={742} text="十来个小时" size={24} color={C.inkSoft} weight={600} />
          <Arrow x0={300} y0={560} x1={400} y1={560} p={on(0.16, 0.4)} color={C.inkSoft} width={5} />
          <g transform="translate(510 560)">
            <rect x={-95} y={-62} width={190} height={124} rx={22} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
            <rect x={-40} y={-88} width={80} height={30} rx={12} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
            <circle r={44} fill={C.ink} />
            <circle r={30} fill="#3D5875" />
            <circle r={30} fill="none" stroke={C.white} strokeWidth={4} strokeDasharray="6 8" opacity={0.6} />
            <circle cx={66} cy={-38} r={9} fill={C.coral} />
          </g>
          <circle cx={510} cy={560} r={30 + 40 * snap} fill={C.white} opacity={snap * (1 - on(0.32, 0.14)) * 0.95} />
          <Arrow x0={636} y0={560} x1={712} y1={560} p={on(0.26, 0.46)} color={C.inkSoft} width={5} />
          <g opacity={out}>
            <g transform="translate(838 510) rotate(-3)">
              <rect x={-160} y={-112} width={320} height={224} rx={14} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
              <rect x={-138} y={-90} width={276} height={140} rx={10} fill="#DCE8E4" />
              <Line x={-124} y={-66} w={248} h={98} p={on(0.5, 0.3)} tone={C.tealDark} width={7} pts={[[0, 0.6], [0.3, 0.58], [0.6, 0.57], [1, 0.56]]} />
            </g>
            <Label x={838} y={716} text="5.6" size={40} weight={800} color={C.tealDark} />
          </g>
        </g>
      );
    }

    /* 餐后 = 这顿饭的曲线，看到两小时压到多少；最高的那一段没人测 */
    case "replay": {
      const p = on(0.05, 0.55);
      return (
        <g>
          <Bowl x={C0} y={480} s={1.3} />
          <rect x={380} y={390} width={620} height={310} rx={20} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
          <rect x={404} y={414} width={572} height={212} rx={12} fill="#F1EADC" />
          <Line
            x={420}
            y={420}
            w={540}
            h={196}
            p={p}
            pts={[[0, 0.78], [0.1, 0.7], [0.22, 0.22], [0.34, 0.12], [0.5, 0.3], [0.72, 0.5], [1, 0.56]]}
          />
          <line x1={420} y1={670} x2={960} y2={670} stroke={C.paperShadow} strokeWidth={4} />
          <g opacity={on(0.55, 0.78)}>
            <circle cx={604} cy={444} r={30} fill="none" stroke={C.coralDark} strokeWidth={5} strokeDasharray="10 8" />
            <Label x={650} y={438} text="没测着" size={26} anchor="start" color={C.coralDark} weight={700} />
          </g>
          <Label x={420} y={734} text="第一口" size={24} anchor="start" color={C.inkSoft} weight={600} />
          <Label x={663} y={734} text="1 小时" size={24} color={C.inkSoft} weight={600} />
          <Label x={960} y={734} text="2 小时" size={26} anchor="end" color={C.coralDark} weight={800} />
        </g>
      );
    }

    /* （备用）糖化近三个月的分布条 */
    case "ledger": {
      return (
        <g>
          <rect x={340} y={392} width={660} height={348} rx={20} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
          <line x1={400} y1={414} x2={400} y2={718} stroke={C.paperShadow} strokeWidth={5} />
          <Bars
            x={430}
            y={436}
            w={470}
            rowH={90}
            p={on(0.06, 0.5)}
            rows={[
              {label: "前月", frac: 0.3, tone: C.paperShadow},
              {label: "上月", frac: 0.56, tone: C.amber},
              {label: "本月", frac: 0.70, tone: C.coralDark},
            ]}
          />
          <g opacity={on(0.5, 0.3)}>
            <Arrow x0={880} y0={700} x1={880} y1={450} p={on(0.55, 0.3)} color={C.coralDark} />
          </g>
        </g>
      );
    }

    /* 模式一：照片正常，糖化超标 —— 漏掉的是饭后 */
    case "missA": {
      return (
        <g>
          <Label x={C0} y={352} text="照片（空腹）" size={30} weight={800} />
          <line x1={96} y1={640} x2={506} y2={640} stroke={C.paperShadow} strokeWidth={4} />
          <Line x={96} y={400} w={410} h={240} p={on(0.04, 0.4)} tone={C.tealDark} pts={[[0, 0.72], [0.3, 0.7], [0.6, 0.68], [1, 0.66]]} />
          <Pill x={C0} y={706} text="正常" tone={C.tealDark} p={on(0.2, 0.25)} />
          <line x1={540} y1={370} x2={540} y2={760} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 10" />
          <Label x={C2} y={352} text="糖化（三个月）" size={30} weight={800} />
          <line x1={574} y1={640} x2={984} y2={640} stroke={C.paperShadow} strokeWidth={4} />
          <Line
            x={574}
            y={400}
            w={410}
            h={240}
            p={on(0.12, 0.42)}
            pts={[[0, 0.8], [0.16, 0.74], [0.3, 0.14], [0.44, 0.08], [0.6, 0.32], [0.8, 0.52], [1, 0.58]]}
          />
          {/* 高高低低，平均下来定在红线以上 —— 这就是「左边正常、右边超标」的来由 */}
          <g opacity={on(0.62, 0.86)}>
            <line x1={574} y1={470} x2={984} y2={470} stroke={C.coralDark} strokeWidth={4} strokeDasharray="12 10" opacity={0.8} />
            <Label x={984} y={450} text="平均" size={24} anchor="end" color={C.coralDark} weight={700} />
          </g>
          <g opacity={on(0.42, 0.26)}>
            <Pill x={C2} y={706} text="超标" tone={C.coralDark} />
          </g>
        </g>
      );
    }

    /* 三个月里一顿又一顿的饭后高峰，把平均抬到线以上 */
    case "avg3m": {
      const n = 11;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) {
        const x0 = i / n;
        pts.push([x0, 0.86], [x0 + 0.32 / n, 0.86], [x0 + 0.6 / n, 0.2 + (i % 3) * 0.05], [x0 + 0.86 / n, 0.86]);
      }
      pts.push([1, 0.86]);
      const avg = on(0.38, 0.66);
      return (
        <g>
          <line x1={120} y1={690} x2={960} y2={690} stroke={C.paperShadow} strokeWidth={4} />
          <Line x={120} y={400} w={840} h={290} p={on(0.04, 0.46)} tone={C.coralDark} width={6} pts={pts} />
          <Label x={120} y={738} text="三个月前" size={24} anchor="start" color={C.inkSoft} weight={600} />
          <Label x={960} y={738} text="现在" size={24} anchor="end" color={C.inkSoft} weight={600} />
          <g opacity={avg}>
            <line x1={120} y1={538} x2={960} y2={538} stroke={C.coralDark} strokeWidth={5} strokeDasharray="14 11" />
            {/* 线压在锯齿中间，字就放到轴下面当图例，别去碰峰尖 */}
            <line x1={120} y1={786} x2={186} y2={786} stroke={C.coralDark} strokeWidth={5} strokeDasharray="14 11" />
            <Label x={200} y={796} text="平均" size={26} anchor="start" color={C.coralDark} weight={800} />
          </g>
        </g>
      );
    }

    /* 模式二：照片偏高，糖化正常 —— 最近才冒头 */
    case "missB": {
      return (
        <g>
          <Label x={C0} y={352} text="照片（空腹）" size={30} weight={800} />
          <line x1={96} y1={640} x2={506} y2={640} stroke={C.paperShadow} strokeWidth={4} />
          <Line x={96} y={400} w={410} h={240} p={on(0.04, 0.4)} tone={C.coralDark} pts={[[0, 0.72], [0.5, 0.72], [0.64, 0.68], [0.76, 0.3], [0.84, 0.22], [1, 0.42]]} />
          {/* 高只出现在最后这一小段：三个月里只有最近这几天高，平均还抬不动 */}
          <g opacity={on(0.42, 0.62)}>
            <circle cx={440} cy={453} r={26} fill="none" stroke={C.coralDark} strokeWidth={4} strokeDasharray="9 7" />
            <Label x={440} y={392} text="最近" size={24} color={C.coralDark} weight={700} />
          </g>
          <Pill x={C0} y={706} text="偏高" tone={C.coralDark} p={on(0.2, 0.25)} />
          <line x1={540} y1={370} x2={540} y2={760} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 10" />
          <Label x={C2} y={352} text="糖化（三个月）" size={30} weight={800} />
          <line x1={574} y1={640} x2={984} y2={640} stroke={C.paperShadow} strokeWidth={4} />
          <Line x={574} y={400} w={410} h={240} p={on(0.12, 0.42)} tone={C.tealDark} pts={[[0, 0.72], [0.3, 0.7], [0.6, 0.68], [1, 0.66]]} />
          <g opacity={on(0.42, 0.26)}>
            <Pill x={C2} y={706} text="正常" tone={C.tealDark} />
          </g>
        </g>
      );
    }

    /* 对不上就补：加测饭后 / 糖耐量试验 / 两次对上 */
    case "fix": {
      return (
        <g>
          <Bowl x={C0 + 10} y={532} s={1.25} />
          <Label x={C0 + 10} y={686} text="加测饭后" size={32} weight={800} />
          <Arrow x0={C0 + 100} y0={572} x1={C1 - 130} y1={572} p={on(0.12, 0.3)} color={C.inkSoft} width={5} />
          <Cup x={C1 - 20} y={502} s={1.2} fill={0.7} text="糖水" tone={C.amberLight} />
          <Label x={C1 - 20} y={686} text="喝糖水再查" size={32} weight={800} />
          <Arrow x0={C1 + 110} y0={572} x1={C2 - 140} y1={572} p={on(0.2, 0.4)} color={C.inkSoft} width={5} />
          <g opacity={on(0.5, 0.62)}>
            <Check x={C2 - 30} y={522} s={2.1} />
            <Label x={C2 - 30} y={686} text="两次对上" size={32} weight={800} color={C.tealDark} />
          </g>
        </g>
      );
    }

    /* 红细胞活 120 天，糖挂上去取不下来 */
    case "rbc":
      return (
        <g>
          <RBC x={C1} y={546} r={152} bind={on(0.3, 0.9)} glucose={0.9} />
          <Label x={C1} y={746} text="红细胞" size={32} weight={800} />
          <g opacity={on(0.5, 0.3)}>
            <line x1={C1 + 160} y1={640} x2={946} y2={656} stroke={C.amber} strokeWidth={4} opacity={0.7} />
            <circle cx={946} cy={656} r={13} fill={C.amber} stroke="#8A5C0E" strokeWidth={3} />
            <Label x={946} y={708} text="糖" size={30} anchor="middle" color="#9A6B12" weight={800} />
          </g>
        </g>
      );

    /* 老细胞泡得久、糖多，新细胞刚出来还干净 */
    case "rbc2": {
      const slide = on(0.08, 0.5);
      return (
        <g>
          <line x1={X0 + 40} y1={648} x2={X1 - 40} y2={648} stroke={C.paperShadow} strokeWidth={5} />
          <g opacity={clamp(1 - slide * 0.22)}>
            <RBC x={300} y={520} r={86} bind={0.85} glucose={0.9} />
            <Label x={300} y={706} text="4 个月前" size={26} weight={700} />
          </g>
          <g opacity={on(0.14, 0.36)}>
            <RBC x={540} y={520} r={86} bind={0.4} glucose={0.6} />
            <Label x={540} y={706} text="上个月" size={26} weight={700} />
          </g>
          <g opacity={on(0.3, 0.38)}>
            <RBC x={780} y={520} r={86} bind={0.06} glucose={0.2} />
            <Label x={780} y={706} text="现在" size={26} weight={800} color={C.coralDark} />
          </g>
        </g>
      );
    }

    /* 尺子一：空腹 */
    case "ruler1":
      return (
        <g>
          <Label x={90} y={466} text="空着肚子测的" size={30} anchor="start" weight={700} color={C.ink} />
          <Ticks x={90} y={560} w={900} min={3.9} max={8.4} step={0.5} label="mmol/L" />
          <Ruler
            x={90}
            y={560}
            w={900}
            min={3.9}
            max={8.4}
            p={on(0.04, 0.5)}
            band={{a: 6.1, b: 7.0, tone: C.amberLight}}
            marks={[
              {v: 6.1, label: "6.1", tone: C.amber, above: true},
              {v: 7.0, label: "7.0", tone: C.coralDark, above: true},
            ]}
          />
          <line x1={90 + ((6.1 - 3.9) / 4.5) * 900} y1={600} x2={90 + ((6.1 - 3.9) / 4.5) * 900} y2={676} stroke={C.amber} strokeWidth={4} strokeDasharray="8 7" opacity={0.7} />
          <line x1={90 + ((7.0 - 3.9) / 4.5) * 900} y1={600} x2={90 + ((7.0 - 3.9) / 4.5) * 900} y2={720} stroke={C.coralDark} strokeWidth={4} strokeDasharray="8 7" opacity={0.7} />
          <Label x={90 + ((6.55 - 3.9) / 4.5) * 900} y={704} text="偏高" size={32} color="#9A6B12" weight={800} />
          <Label x={90 + ((7.0 - 3.9) / 4.5) * 900} y={760} text="糖尿病" size={32} color={C.coralDark} weight={800} />
        </g>
      );

    /* 尺子二：喝糖水后两小时 */
    case "ruler2":
      return (
        <g>
          <Label x={80} y={466} text="喝完糖水两个钟头" size={30} anchor="start" weight={700} color={C.ink} />
          <Ticks x={80} y={560} w={920} min={5} max={13} step={1} label="mmol/L" />
          <Ruler
            x={80}
            y={560}
            w={920}
            min={5}
            max={13}
            p={on(0.04, 0.5)}
            band={{a: 7.8, b: 11.1, tone: C.amberLight}}
            marks={[
              {v: 7.8, label: "7.8", tone: C.amber, above: true},
              {v: 11.1, label: "11.1", tone: C.coralDark, above: true},
            ]}
          />
          <line x1={80 + ((7.8 - 5) / 8) * 920} y1={600} x2={80 + ((7.8 - 5) / 8) * 920} y2={676} stroke={C.amber} strokeWidth={4} strokeDasharray="8 7" opacity={0.7} />
          <line x1={80 + ((11.1 - 5) / 8) * 920} y1={600} x2={80 + ((11.1 - 5) / 8) * 920} y2={720} stroke={C.coralDark} strokeWidth={4} strokeDasharray="8 7" opacity={0.7} />
          <Label x={80 + ((9.4 - 5) / 8) * 920} y={704} text="偏高" size={32} color="#9A6B12" weight={800} />
          <Label x={80 + ((11.1 - 5) / 8) * 920} y={760} text="糖尿病" size={32} color={C.coralDark} weight={800} />
        </g>
      );

    /* 尺子三：糖化 */
    case "ruler3":
      return (
        <g>
          <Label x={90} y={466} text="糖化：三个月的平均" size={30} anchor="start" weight={700} color={C.ink} />
          <Ticks x={90} y={560} w={900} min={4} max={9} step={0.5} label="%" />
          <Ruler
            x={90}
            y={560}
            w={900}
            min={4}
            max={9}
            p={on(0.04, 0.5)}
            band={{a: 6.5, b: 9, tone: C.coralLight}}
            marks={[{v: 6.5, label: "6.5%", tone: C.coralDark, above: true}]}
          />
          <line x1={90 + ((6.5 - 4) / 5) * 900} y1={600} x2={90 + ((6.5 - 4) / 5) * 900} y2={700} stroke={C.coralDark} strokeWidth={4} strokeDasharray="8 7" opacity={0.7} />
          <Label x={90 + ((6.5 - 4) / 5) * 900 + 30} y={660} text="糖尿病" size={32} anchor="start" color={C.coralDark} weight={800} />
        </g>
      );

    /* 三种情况，这个数会失真 */
    case "trap": {
      const items = ["贫血", "刚失过血", "怀着孩子"];
      return (
        <g>
          {items.map((txt, i) => (
            <g key={txt} opacity={on(0.06 + i * 0.14, 0.3 + i * 0.14)}>
              <rect x={238} y={420 + i * 156} width={604} height={104} rx={52} fill={C.paperLight} stroke={C.coralDark} strokeWidth={5} />
              <Label x={540} y={420 + i * 156 + 66} text={txt} size={34} weight={800} />
            </g>
          ))}
        </g>
      );
    }

    /* 一次不算数，要另一次对上 */
    case "once":
      return (
        <g>
          <g transform={`translate(${X0 + 30} 400)`}>
            <Sheet x={0} y={0} w={330} h={300} title="第一次" fs={30} rowH={92} rows={[{name: "空腹", value: "7.4", on: true}, {name: "糖化", value: "6.7", on: true}]} />
          </g>
          <g transform={`translate(${X1 - 360} 400)`}>
            <Sheet x={0} y={0} w={330} h={300} title="复查" fs={30} rowH={92} rows={[{name: "空腹", value: "7.1", on: true}, {name: "糖化", value: "6.8", on: true}]} />
          </g>
          <Arrow x0={C1 - 90} y0={550} x1={C1 + 90} y1={550} p={on(0.2, 0.4)} color={C.tealDark} />
          <Label x={C1} y={658} text="另一次结果" size={28} color={C.tealDark} weight={800} />
        </g>
      );

    /* 把日子过好：一顿饭 + 每周 150 分钟 */
    case "habit": {
      return (
        <g>
          <Plate x={C0} y={530} s={1.4} />
          <line x1={400} y1={400} x2={400} y2={740} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 10" />
          <g opacity={on(0.72, 0.28)}>
            <Label x={C1 + 70} y={520} text="两个半" size={96} weight={800} color={C.tealDark} />
            <Label x={C1 + 70} y={572} text="钟头 / 一周" size={30} color={C.inkSoft} weight={700} />
          </g>
        </g>
      );
    }

    /* 收束：一个是点，一个是段 —— 这就是对不上的原因 */
    case "quote": {
      return (
        <g>
          <Label x={120} y={462} text="空腹" size={32} anchor="start" weight={800} color={C.tealDark} />
          <rect x={120} y={488} width={104} height={48} rx={14} fill={C.tealLight} stroke={C.tealDark} strokeWidth={4} opacity={on(0.06, 0.26)} />
          <Label x={250} y={521} text="一下" size={26} anchor="start" color={C.inkSoft} weight={700} />
          <Label x={120} y={606} text="糖化" size={32} anchor="start" weight={800} color={C.coralDark} />
          <rect x={120} y={632} width={860} height={48} rx={14} fill={C.coralLight} stroke={C.coralDark} strokeWidth={4} opacity={on(0.16, 0.34)} />
          <Label x={980} y={710} text="三个月" size={26} anchor="end" color={C.coralDark} weight={700} />
        </g>
      );
    }

    default:
      return null;
  }
};

const MoonAt: React.FC = () => (
  <g>
    <g transform={`translate(${C0} ${R0 - 6}) scale(1.25)`}>
      <path d="M 18 -46 A 48 48 0 1 0 18 46 A 38 38 0 1 1 18 -46 Z" fill={C.amberLight} stroke={C.ink} strokeWidth={5} />
    </g>
    <Label x={C0} y={R0 + 116} text="凌晨，没吃东西" size={26} />
    <Label x={C0} y={R0 + 156} text="8–12 小时" size={24} color={C.inkSoft} weight={600} />
  </g>
);
