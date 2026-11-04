import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Arrow, Bars, Check, Cross, Label, Liver, USProbe} from "../diagrams";
import {Chip, Panel, ROW} from "./kit";

/* 第 5 期：肝里的油是从哪来的
 *
 * 主角永远是那颗肝：进两条路、出两条路，画在同一张图上。
 *
 * v4 减法（与第 7 期同一套）：
 *   1. 画面不复述旁白。删掉了「这些都会让进来的多、出去的少」「方向很清楚」
 *      「判断要看检查，不是看肚子」「快走骑车都算中等强度」等十余处，
 *      它们和字幕一字不差，只增加眼睛的负担。
 *   2. 每页文字块不超过四个：一个主体 + 两三个名字，不叠标题和总结。
 *   3. 第二句才出现的东西走 later()，跟着字幕条走，不提前堆在画面上。
 */

const R1 = ROW[1];

export const FattyLiverArt: React.FC<{
  t: number;
  scene: string;
  u: number;
  bi: number;
  stage?: number;
  su?: number;
  sk?: number;
}> = ({scene, u, su = u, sk = 0}) => {
  const on = (a: number, b: number) => inOut(seg(u, a, b - a));
  // 第二句才出场：看「本拍第几条字幕」，一句话被拆成几条时也不会卡住。
  const later = (a: number, b: number) => (sk >= 1 ? inOut(seg(su, a, b - a)) : 0);
  const solo = (i: number) => on(0.04 + i * 0.14, 0.26);

  if (scene === "open") {
    // 第一句：一个不喝酒的人，肝里却长出了油。第二句不写字，让油一点点浮出来。
    return (
      <g>
        <Liver x={540} y={462} s={1.1} fat={0.16 + 0.42 * on(0.18, 0.7)} />
        <Label x={540} y={640} text="肝脏" size={30} color={C.inkSoft} />
        <Chip x={396} y={716} text="不喝酒" tone="ink" size={28} w={210} />
        <g opacity={later(0.06, 0.3)}>
          <Chip x={664} y={716} text="也查出脂肪肝" tone="coral" size={28} solid w={240} />
        </g>
      </g>
    );
  }

  if (scene === "balance") {
    // 进两条、出两条。第一句只有肝，第二句四条路一起长出来。
    return (
      <g>
        <Liver x={540} y={470} s={0.86} fat={0.4} />
        <Label x={540} y={622} text="肝" size={28} color={C.inkSoft} />
        <Arrow x0={196} y0={402} x1={392} y1={462} p={later(0.04, 0.34)} color={C.coralDark} />
        <Label x={238} y={352} text="进两条" size={30} color={C.coralDark} weight={800} anchor="start" />
        <Arrow x0={688} y0={462} x1={884} y1={402} p={later(0.14, 0.34)} color={C.tealDark} />
        <Label x={812} y={352} text="出两条" size={30} color={C.tealDark} weight={800} />
      </g>
    );
  }

  if (scene === "in1") {
    // 第一条来路：吃进来的油；第二句再加一条——脂肪分解后运来的脂肪酸。
    return (
      <g>
        <Chip x={330} y={430} text="① 吃进来的油" tone="coral" size={28} w={440} />
        <g opacity={later(0.04, 0.3)}>
          <Chip x={330} y={548} text="② 脂肪分解运来的脂肪酸" tone="coral" size={28} w={440} />
        </g>
        <Arrow x0={580} y0={470} x1={700} y1={470} p={on(0.1, 0.3)} color={C.coralDark} />
        <Liver x={866} y={480} s={0.56} fat={0.4} />
        <Label x={866} y={586} text="肝" size={26} color={C.inkSoft} />
      </g>
    );
  }

  if (scene === "in2") {
    // 第二条来路：糖在肝里变成脂肪。两个大字夹一颗肝，一眼就懂。
    return (
      <g>
        <Label x={196} y={R1 - 6} text="糖" size={78} weight={800} color={C.amber} />
        <Arrow x0={272} y0={R1 - 32} x1={396} y1={R1 - 32} p={on(0.08, 0.26)} color={C.amber} />
        <Liver x={540} y={R1 - 32} s={0.8} fat={0.45} />
        <Arrow x0={684} y0={R1 - 32} x1={806} y1={R1 - 32} p={later(0.04, 0.26)} color={C.coralDark} />
        <Label x={884} y={R1 - 6} text="脂肪" size={78} weight={800} color={C.coralDark} />
        <g opacity={later(0.12, 0.3)}>
          <Chip x={430} y={716} text="精制主食" tone="amber" size={28} />
          <Chip x={650} y={716} text="甜饮料" tone="amber" size={28} />
        </g>
      </g>
    );
  }

  if (scene === "out") {
    // 出去的两条路：烧掉，或者打包运走。
    return (
      <g>
        <Liver x={330} y={470} s={0.72} fat={0.4} />
        <Label x={330} y={590} text="肝" size={26} color={C.inkSoft} />
        <Arrow x0={470} y0={430} x1={640} y1={404} p={on(0.08, 0.3)} color={C.tealDark} />
        <Arrow x0={470} y0={510} x1={640} y1={536} p={on(0.16, 0.3)} color={C.tealDark} />
        <g opacity={later(0.04, 0.3)}>
          <Label x={790} y={402} text="烧掉当能量" size={30} weight={800} color={C.tealDark} />
          <Label x={790} y={556} text="打包运走" size={30} weight={800} color={C.tealDark} />
        </g>
      </g>
    );
  }

  if (scene === "why") {
    // 五个因素，报到一个亮一个。
    return (
      <g>
        {["体重超标", "腰围大", "久坐", "喝酒", "血糖高"].map((txt, i) => (
          <g key={txt} opacity={solo(i)}>
            <Chip x={[230, 415, 570, 710, 865][i]} y={R1} text={txt} tone="coral" size={30} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "insulin") {
    // 不敏感时，脂肪放得多，肝也造得多。一个箭头，两个「更多」。
    return (
      <g>
        <Chip x={210} y={R1 - 30} text="脂肪组织" tone="ink" size={30} w={230} />
        <Arrow x0={332} y0={R1 - 30} x1={664} y1={R1 - 30} p={on(0.08, 0.34)} color={C.coralDark} />
        <Label x={498} y={R1 - 62} text="更多脂肪酸" size={26} weight={800} color={C.coralDark} />
        <Liver x={808} y={R1 - 30} s={0.62} fat={0.5} />
        <g opacity={later(0.06, 0.3)}>
          <Label x={808} y={R1 + 62} text="自己造，也更多" size={28} weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  if (scene === "define") {
    // 一页一个主角：一颗被油泡着的肝。文字交给脚注。
    return (
      <g>
        <Liver x={540} y={452} s={1.32} fat={0.9} />
        <Label x={540} y={672} text="肝细胞里的脂肪" size={30} color={C.inkSoft} />
        <Label x={540} y={730} text="超过一定量" size={40} weight={800} color={C.coralDark} />
      </g>
    );
  }

  if (scene === "ultra") {
    // 能提示，但看不出程度。
    return (
      <g>
        <USProbe x={300} y={470} s={1} on={on(0.05, 0.5)} />
        <Label x={300} y={594} text="超声" size={28} color={C.inkSoft} />
        <g opacity={on(0.2, 0.3)}>
          <Check x={510} y={424} s={1.1} />
          <Label x={556} y={434} text="提示有没有脂肪肝" size={27} anchor="start" weight={700} />
        </g>
        <g opacity={later(0.06, 0.32)}>
          <Cross x={510} y={556} s={1.1} />
          <Label x={556} y={566} text="看不出程度 · 发炎 · 留疤" size={27} anchor="start" weight={800} color={C.coralDark} />
        </g>
      </g>
    );
  }

  if (scene === "progress" || scene === "progress2") {
    const two = scene === "progress2";
    return (
      <g>
        <Panel x={56} y={440} w={440} h={332} title={two ? "反复发炎" : "多数人"} tone={C.tealDark} on={on(0.04, 0.3)}>
          <Label x={276} y={two ? 602 : 632} text={two ? "留下疤" : "长期稳定"} size={two ? 38 : 40} weight={800} color={C.tealDark} />
          {two ? <Label x={276} y={670} text="纤维化" size={28} color={C.inkSoft} weight={700} /> : null}
        </Panel>
        <Panel x={584} y={440} w={440} h={332} title={two ? "少数人" : "一部分人"} tone={C.coralDark} on={later(0.04, 0.3)}>
          {two ? (
            <Label x={804} y={632} text="肝硬化" size={40} weight={800} color={C.coralDark} />
          ) : (
            <g>
              <Label x={804} y={596} text="肝细胞受损" size={36} weight={800} color={C.coralDark} />
              <Label x={804} y={662} text="发炎" size={36} weight={800} color={C.coralDark} />
            </g>
          )}
        </Panel>
      </g>
    );
  }

  if (scene === "check") {
    // 四项检查，报到一项出一项；弹性成像是「必要时」。
    return (
      <g>
        {["肝功能", "血小板", "血糖血脂"].map((txt, i) => (
          <g key={txt} opacity={solo(i)}>
            <Chip x={[252, 424, 611][i]} y={R1 - 20} text={txt} tone="teal" size={30} />
          </g>
        ))}
        <g opacity={later(0.04, 0.3)}>
          <Label x={813} y={R1 - 86} text="必要时" size={24} weight={700} color={C.coralDark} />
          <Chip x={813} y={R1 - 20} text="弹性成像" tone="coral" size={30} solid />
        </g>
      </g>
    );
  }

  if (scene === "lose") {
    // 减重，减掉体重的 5%。
    return (
      <g>
        <Label x={290} y={R1 + 18} text="减重" size={84} weight={800} color={C.tealDark} />
        <Arrow x0={438} y0={R1 - 16} x1={618} y1={R1 - 16} p={later(0.04, 0.3)} color={C.coralDark} />
        <g opacity={later(0.12, 0.3)}>
          <Label x={762} y={R1 + 10} text="5%" size={108} weight={800} color={C.coralDark} />
          <Label x={762} y={R1 + 76} text="体重" size={32} color={C.inkSoft} weight={700} />
        </g>
      </g>
    );
  }

  if (scene === "vary") {
    // 减得越多，改善的方面越多；但个体差异大。
    return (
      <g>
        <Bars
          x={90}
          y={404}
          w={880}
          rowH={128}
          p={on(0.05, 0.55)}
          rows={[
            {label: "减 5%", frac: 0.38, tone: C.teal},
            {label: "减 10%", frac: 0.72, tone: C.tealDark},
            {label: "更多", frac: 0.98, tone: "#9A6B12"},
          ]}
        />
        <g opacity={later(0.06, 0.3)}>
          <Label x={540} y={ROW[2] + 42} text="因人而异" size={30} weight={700} color={C.inkSoft} />
        </g>
      </g>
    );
  }

  if (scene === "eat") {
    // 三样少碰。先摆三个空卡，第二句再把话填进去。
    return (
      <g>
        {[
          ["含糖饮料", "少喝", 0],
          ["酒", "尽量不喝", 1],
          ["主食", "粗细搭配", 2],
        ].map(([a, b, i]) => (
          <Panel
            key={a as string}
            x={[56, 384, 712][i as number]}
            y={420}
            w={304}
            h={300}
            tone={(i as number) < 2 ? C.coralDark : C.tealDark}
            on={on(0.04 + (i as number) * 0.12, 0.26)}
          >
            <Label x={[208, 536, 864][i as number]} y={534} text={a as string} size={32} weight={800} />
            <g opacity={later(0.04 + (i as number) * 0.12, 0.26)}>
              <Label x={[208, 536, 864][i as number]} y={596} text={b as string} size={28} color={C.inkSoft} weight={700} />
              {(i as number) < 2 ? (
                <Cross x={[208, 536][i as number]} y={664} s={0.95} />
              ) : (
                <Check x={860} y={664} s={1.05} />
              )}
            </g>
          </Panel>
        ))}
      </g>
    );
  }

  if (scene === "move") {
    // 一周 150 分钟，再加两次力量训练。
    return (
      <g>
        <Label x={300} y={R1 - 18} text="150" size={116} weight={800} color={C.tealDark} />
        <Label x={300} y={R1 + 34} text="分钟 / 周" size={30} color={C.inkSoft} weight={700} />
        <Label x={300} y={R1 + 108} text="中等强度" size={30} weight={800} />
        <line x1={432} y1={392} x2={432} y2={748} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 10" />
        <g opacity={later(0.04, 0.3)}>
          <Panel x={520} y={448} w={440} h={190} title="再加" tone={C.tealDark}>
            <Label x={740} y={592} text="每周两次力量训练" size={30} weight={800} />
          </Panel>
        </g>
      </g>
    );
  }

  if (scene === "follow") {
    // 复查的间隔，画成一段距离，不写成一句话。
    return (
      <g>
        <Panel x={140} y={430} w={800} h={280} title="复查" tone={C.tealDark} on={on(0.04, 0.3)}>
          <line x1={260} y1={600} x2={860} y2={600} stroke={C.paperShadow} strokeWidth={6} strokeLinecap="round" />
          <line x1={330} y1={600} x2={790} y2={600} stroke={C.tealDark} strokeWidth={12} strokeLinecap="round" />
          <circle cx={330} cy={600} r={14} fill={C.tealDark} />
          <circle cx={790} cy={600} r={14} fill={C.tealDark} />
          <Label x={330} y={566} text="半年" size={32} weight={800} color={C.tealDark} />
          <Label x={790} y={566} text="一年" size={32} weight={800} color={C.tealDark} />
          <Label x={560} y={666} text="一次" size={30} weight={700} color={C.inkSoft} />
        </Panel>
      </g>
    );
  }

  if (scene === "close") {
    // 收尾只留两个动作，别把片尾那两句大字再说一遍。
    return (
      <g>
        <Liver x={540} y={444} s={0.92} fat={0.35} />
        <Chip x={410} y={690} text="减重" tone="teal" size={30} w={200} />
        <Chip x={680} y={690} text="按时复查" tone="teal" size={30} w={230} />
      </g>
    );
  }

  return (
    <g>
      <Liver x={540} y={470} s={1} fat={0.4} />
      <Label x={540} y={620} text="肝" size={28} color={C.inkSoft} />
    </g>
  );
};
