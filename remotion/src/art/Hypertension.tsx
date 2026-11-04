import React from "react";
import {C} from "../theme";
import {inOut, seg} from "../motion";
import {Cuff, Gauge, Heart, Person, PillBox, RecordCard, SaltShaker, Vessel} from "../parts";
import {Arrow, Check, Cross, Label} from "../diagrams";
import {Chip, COL, Panel, ROW, X0, X1} from "./kit";

/* 第 3 期：血压为什么分高压和低压
 *
 * 全片同一套舞台：上面一个表，下面一个心脏 + 一根血管。
 * 每一拍只改一处（谁在动、哪段被强调），标签一律贴在对象下方 14px。
 */

const HY = 620; // 心脏 / 血管中心线
const GY = 396; // 表盘中心

export const HypertensionArt: React.FC<{t: number; scene: string; u: number; bi: number}> = ({t, scene, u}) => {
  const fast = scene === "salt" || scene === "stiff";
  const period = fast ? 0.46 : 0.84;
  const phase = (t % period) / period;
  const kick = Math.exp(-phase * 6);

  const narrow = scene === "stiff" || scene === "silent" ? inOut(seg(u, 0.1, 0.7)) : 0;
  const stiff = scene === "stiff" ? inOut(seg(u, 0.2, 0.7)) : 0;
  const saltOn = scene === "salt" ? inOut(seg(u, 0.1, 0.7)) : 0;
  const press = scene === "systolic" ? 1 : scene === "diastolic" ? 0.25 : 0.55;

  const hi = 0.3 + press * 0.22 + narrow * 0.26 + saltOn * 0.12;
  const lo = 0.16 + press * 0.1 + narrow * 0.16 + saltOn * 0.08;
  const near = 42 + kick * 9 + saltOn * 8;
  const far = 30 - narrow * 10;
  const sys = Math.round(96 + hi * 62);
  const dia = Math.round(62 + lo * 48);

  const on = (a: number, b: number) => inOut(seg(u, a, b - a));

  /* ---- 只出现一次的独立场景：用整块图解区讲清一件事 ---- */

  if (scene === "compare") {
    return (
      <g>
        <Panel x={60} y={330} w={440} h={430} title="高压" tone={C.coralDark}>
          <Label x={280} y={520} text="120" size={124} weight={800} color={C.coralDark} />
          <Label x={280} y={576} text="mmHg" size={26} color={C.inkSoft} weight={600} />
          <Label x={280} y={660} text="心脏使劲挤的那一下" size={26} color={C.ink} weight={700} />
        </Panel>
        <Panel x={580} y={330} w={440} h={430} title="低压" tone={C.tealDark}>
          <Label x={800} y={520} text="80" size={124} weight={800} color={C.tealDark} />
          <Label x={800} y={576} text="mmHg" size={26} color={C.inkSoft} weight={600} />
          <Label x={800} y={660} text="松手以后还剩多少" size={26} color={C.ink} weight={700} />
        </Panel>
      </g>
    );
  }

  if (scene === "types") {
    return (
      <g>
        <Panel x={60} y={330} w={440} h={420} title="高压高" tone={C.coralDark}>
          <rect x={110} y={470} width={340} height={64} rx={30} fill="#F6D3C7" stroke={C.ink} strokeWidth={6} />
          <rect x={110} y={470} width={340} height={64} rx={30} fill="none" stroke="#8E3B33" strokeWidth={10} opacity={0.5} />
          <Label x={280} y={612} text="大血管变硬" size={32} weight={800} />
        </Panel>
        <Panel x={580} y={330} w={440} h={420} title="低压高" tone={C.tealDark}>
          <rect x={630} y={470} width={340} height={64} rx={30} fill="#F6D3C7" stroke={C.ink} strokeWidth={6} />
          <rect x={750} y={462} width={100} height={80} rx={26} fill={C.coralLight} stroke={C.coralDark} strokeWidth={6} />
          <Label x={800} y={612} text="小血管收得紧" size={32} weight={800} />
        </Panel>
      </g>
    );
  }

  if (scene === "why") {
    return (
      <g>
        {[
          ["血容量", "血多，压力就大", C.tealDark],
          ["血管阻力", "管子紧，压力就大", C.coralDark],
          ["神经调节", "紧张、熬夜都会参与", "#9A6B12"],
        ].map(([a, b, c], i) => (
          <Panel key={a as string} x={[56, 384, 712][i]} y={450} w={304} h={280} title={a as string} tone={c as string}>
            <Label x={[208, 536, 864][i]} y={610} text={b as string} size={24} color={C.inkSoft} weight={600} />
          </Panel>
        ))}
      </g>
    );
  }

  if (scene === "salt") {
    return (
      <g>
        <g transform={`translate(200 470) scale(1.05)`}>
          <SaltShaker x={0} y={0} tilt={on(0.05, 0.35)} grains={(t * 0.5) % 1} />
        </g>
        <Label x={200} y={640} text="盐吃多了" size={28} />
        <Arrow x0={320} y0={470} x1={450} y1={470} p={on(0.15, 0.25)} />
        <g>
          <rect x={500} y={400} width={150} height={140} rx={18} fill={C.tealLight} stroke={C.tealDark} strokeWidth={5} />
          <rect x={510} y={400 + 140 * (1 - 0.35 - saltOn * 0.45)} width={130} height={140 * (0.35 + saltOn * 0.45)} rx={12} fill={C.teal} opacity={0.55} />
          <Label x={575} y={640} text="身体留住水分" size={26} />
        </g>
        <Arrow x0={680} y0={470} x1={800} y1={470} p={on(0.4, 0.25)} />
        <g>
          <rect x={830} y={420} width={170} height={100} rx={50} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
          <rect x={838} y={428} width={154} height={84} rx={42} fill={C.coral} opacity={0.35 + saltOn * 0.45} />
          <Label x={915} y={640} text="血容量增加" size={26} />
        </g>
      </g>
    );
  }

  if (scene === "stiff") {
    return (
      <g>
        <Panel x={60} y={340} w={440} h={330} title="本来是有弹性的管子" tone={C.tealDark}>
          <rect x={120} y={470} width={320} height={60} rx={30} fill="#F6D3C7" stroke={C.ink} strokeWidth={6} />
          <Label x={280} y={600} text="能撑开，也能缩回" size={24} color={C.inkSoft} weight={600} />
        </Panel>
        <Panel x={580} y={340} w={440} h={330} title="时间久了会变厚变硬" tone={C.coralDark}>
          <rect x={640} y={470} width={320} height={60} rx={30} fill="#F6D3C7" stroke={C.ink} strokeWidth={6} />
          <rect x={640} y={470} width={320} height={60} rx={30} fill="none" stroke="#8E3B33" strokeWidth={12} opacity={stiff * 0.6} />
          <Label x={800} y={600} text="弹性差，压力更难降下来" size={24} color={C.inkSoft} weight={600} />
        </Panel>
      </g>
    );
  }

  if (scene === "silent") {
    return (
      <g>
        <g transform={`translate(${COL[0]} ${ROW[1] + 20}) scale(1.32)`}>
          <Person x={0} y={0} tense={0} />
        </g>
        <Label x={COL[0]} y={ROW[2] + 34} text="没有不舒服" size={30} weight={800} />
        <Label x={COL[1] - 60} y={ROW[1] + 40} text="≠" size={104} color={C.coralDark} weight={800} />
        <Label x={COL[2] - 130} y={ROW[1] + 20} text="血压不高" size={46} weight={800} color={C.ink} />
      </g>
    );
  }

  if (scene === "cuff") {
    return (
      <g>
        <g transform={`translate(560 ${ROW[1]}) scale(0.9)`}>
          <Cuff x={0} y={0} inflate={0.4} />
        </g>
        {[
          ["安静坐 5 分钟", 0],
          ["背靠椅背", 1],
          ["脚放平", 2],
          ["别说话", 3],
        ].map(([txt, i]) => (
          <g key={txt as string} opacity={inOut(seg(u, 0.04 + (i as number) * 0.16, 0.22))}>
            <Chip x={[168, 408, 664, 904][i as number]} y={ROW[2] + 30} text={txt as string} tone={i === 0 ? "coral" : "ink"} size={24} />
          </g>
        ))}
      </g>
    );
  }

  if (scene === "cuff2") {
    return (
      <g>
        <g transform={`translate(300 ${ROW[1] + 10}) scale(1)}`}>
          <Cuff x={0} y={0} inflate={on(0.05, 0.5)} />
        </g>
        <Label x={300} y={ROW[2] + 20} text="袖带绑上臂，和心脏同高" size={28} />
        <Panel x={620} y={360} w={380} h={380} title="测两遍" tone={C.tealDark}>
          <Label x={810} y={520} text="1" size={64} weight={800} color={C.tealDark} />
          <Label x={810} y={580} text="相隔 1 分钟" size={26} />
          <Label x={810} y={660} text="取平均值" size={26} color={C.inkSoft} weight={600} />
        </Panel>
      </g>
    );
  }

  if (scene === "record") {
    return (
      <g>
        <g transform={`translate(390 ${ROW[1] - 80})`}>
          <RecordCard x={0} y={0} days={Math.min(3, 1 + Math.floor(seg(u, 0, 0.8) * 3))} showLine={false} />
        </g>
        <Chip x={540} y={ROW[2] + 40} text="第一天先不算" tone="amber" size={24} />
      </g>
    );
  }

  if (scene === "record2") {
    return (
      <g>
        <Panel x={60} y={360} w={440} h={330} title="在家测" tone={C.tealDark}>
          <Label x={280} y={552} text="135/85" size={92} weight={800} color={C.tealDark} />
          <Label x={280} y={610} text="平均值到这个数" size={26} />
        </Panel>
        <Panel x={580} y={360} w={440} h={330} title="在医院测" tone={C.coralDark}>
          <Label x={800} y={552} text="140/90" size={92} weight={800} color={C.coralDark} />
          <Label x={800} y={610} text="诊室血压到这个数" size={26} />
        </Panel>
      </g>
    );
  }

  if (scene === "doctor") {
    return (
      <g>
        <Panel x={56} y={360} w={440} h={340} title="规范测量">
          <Label x={276} y={540} text="至少两次" size={30} weight={800} />
          <Label x={276} y={596} text="不同日子" size={28} color={C.inkSoft} weight={600} />
        </Panel>
        <Panel x={584} y={360} w={440} h={340} title="整体情况">
          <Label x={804} y={540} text="年龄 · 血糖 · 肾" size={30} weight={800} />
          <Label x={804} y={596} text="有没有别的病" size={28} color={C.inkSoft} weight={600} />
        </Panel>
        <Check x={540} y={530} s={2} />
      </g>
    );
  }

  if (scene === "salt2") {
    return (
      <g>
        {[
          ["盐 < 5 克 / 天", C.coralDark],
          ["运动 150 分钟 / 周", C.tealDark],
          ["体重降一点", C.tealDark],
          ["少喝酒，戒烟", "#9A6B12"],
        ].map(([txt, c], i) => (
          <Panel key={txt as string} x={[60, 580, 60, 580][i]} y={i < 2 ? 360 : 590} w={440} h={180} tone={c as string}>
            <Label x={[280, 800, 280, 800][i]} y={(i < 2 ? 360 : 590) + 108} text={txt as string} size={32} weight={800} color={c as string} />
          </Panel>
        ))}
      </g>
    );
  }

  if (scene === "pill") {
    return (
      <g>
        <g transform={`translate(${COL[0]} 600) scale(1.35)`}>
          <PillBox x={0} y={0} />
        </g>
        <Label x={COL[0]} y={740} text="降压药" size={30} weight={800} />
        <Cross x={COL[1]} y={600} s={2.2} />
        <Label x={COL[1]} y={716} text="自己停" size={34} color={C.coralDark} weight={800} />
        <Label x={COL[2] - 10} y={582} text="降下来" size={42} anchor="middle" weight={800} />
        <Label x={COL[2] - 10} y={654} text="≠ 病好了" size={42} anchor="middle" weight={800} color={C.coralDark} />
      </g>
    );
  }

  if (scene === "close") {
    return (
      <g>
        <line x1={X0 + 40} y1={ROW[1]} x2={X1 - 40} y2={ROW[1]} stroke={C.inkSoft} strokeWidth={4} opacity={0.3} />
        {[
          ["挤", "压力升到最高", C.coralDark, 320],
          ["松", "压力不归零", C.tealDark, 760],
        ].map(([a, b, c, x]) => (
          <g key={a as string}>
            <circle cx={x as number} cy={ROW[1]} r={52} fill={c as string} />
            <Label x={x as number} y={ROW[1] + 14} text={a as string} size={40} color={C.white} weight={800} />
            <Label x={x as number} y={ROW[1] + 110} text={b as string} size={28} color={c as string} weight={800} />
          </g>
        ))}
        <Label x={540} y={ROW[1] + 14} text="→" size={44} color={C.inkSoft} weight={800} />
      </g>
    );
  }

  /* ---- 表盘这一拍：把两个数上下摆开 ---- */
  if (scene === "gauge") {
    return (
      <g>
        <Gauge x={290} y={560} r={146} hi={0.55} lo={0.3} sys={120} dia={80} hideText />
        <line x1={560} y1={398} x2={560} y2={760} stroke={C.paperShadow} strokeWidth={4} strokeDasharray="10 10" />
        <Label x={780} y={500} text="120" size={104} weight={800} color={C.coralDark} />
        <Label x={780} y={556} text="高压" size={28} color={C.coralDark} weight={800} />
        <line x1={640} y1={614} x2={920} y2={614} stroke={C.paperShadow} strokeWidth={4} />
        <Label x={780} y={716} text="80" size={104} weight={800} color={C.tealDark} />
        <Label x={780} y={766} text="低压" size={28} color={C.tealDark} weight={800} />
      </g>
    );
  }

  /* ---- 默认舞台：一颗心脏 + 一根血管，一挤一松 ---- */
  return (
    <g>
      <Heart x={210} y={598} kick={scene === "elastic" || scene === "systolic" ? kick : kick * 0.55} fast={fast} />
      <Label x={210} y={776} text="心脏" size={28} weight={800} />
      <Vessel x0={370} x1={1000} y={598} near={near} far={far} wall={stiff * 9} level={0.55 + saltOn * 0.3} hot={narrow > 0.5} />
      <Label x={370} y={706} text="血管" size={26} anchor="start" />

      {scene === "systolic" ? (
        <Label x={370} y={452} text="血被推上来，压力到最高" size={28} anchor="start" color={C.coralDark} weight={800} />
      ) : null}

      {scene === "diastolic" ? (
        <Label x={370} y={452} text="不挤了，压力也不会掉到零" size={26} anchor="start" color={C.tealDark} weight={800} />
      ) : null}

      {scene === "elastic" ? (
        <g>
          <Arrow x0={640} y0={520} x1={640} y1={420} p={on(0.05, 0.3)} color={C.tealDark} />
          <Label x={640} y={392} text="挤的时候撑开" size={24} color={C.tealDark} weight={700} />
          <Arrow x0={880} y0={420} x1={880} y1={520} p={on(0.35, 0.3)} color={C.coralDark} />
          <Label x={880} y={392} text="松手缩回来" size={24} color={C.coralDark} weight={700} />
        </g>
      ) : null}

      {scene === "elastic2" ? (
        <Label x={370} y={452} text="弹性回缩，把血继续往前推" size={26} anchor="start" color={C.tealDark} weight={800} />
      ) : null}
    </g>
  );
};
