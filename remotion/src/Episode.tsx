import React from "react";
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {C, SANS} from "./theme";
import {DATA} from "./data";
import {EpData, Shell, useBeat} from "./shell";
import {EpisodeTag, FootNote, PaperBackdrop, Rule} from "./layout";
import {clamp, inOut, seg} from "./motion";
import {BloodSugarArt} from "./art/BloodSugar";
import {HypertensionArt} from "./art/Hypertension";
import {LipidArt} from "./art/Lipid";
import {FattyLiverArt} from "./art/FattyLiver";
import {ThyroidArt} from "./art/Thyroid";
import {GoutArt} from "./art/Gout";

/** 画面组件都能拿到「本拍第几句」和「这句里走到哪儿」，一句一个动作。 */
export type ArtProps = {
  t: number;
  scene: string;
  u: number;
  bi: number;
  stage?: number;
  su?: number;
  /** 本拍里第几条字幕（一句话拆成几条时递增），画面想「跟着字幕条走」用它 */
  sk?: number;
  lines?: number;
};

const ART: Record<string, React.FC<ArtProps>> = {
  BloodSugar: BloodSugarArt,
  Hypertension: HypertensionArt,
  Lipid: LipidArt,
  FattyLiver: FattyLiverArt,
  Thyroid: ThyroidArt,
  Gout: GoutArt,
};

const Ending: React.FC<{data: EpData; t: number}> = ({data, t}) => {
  const e: any = (data as any).ending || {};
  const p = inOut(seg(t, data.dur - 6, 1.1));
  const follow = t > data.dur - 3.4;
  // 结尾大标题一行到底：13 字以内用 74 号，再长就缩到 62，别折行也别压到边。
  const bigSize = (e.big || "").length > 11 ? 62 : 74;
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <PaperBackdrop />
      <EpisodeTag episode={data.episode} />
      <Rule />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: "50%",
            border: `8px solid ${C.ink}`,
            background: C.paperLight,
            overflow: "hidden",
            boxShadow: `0 0 0 ${8 + (follow ? 8 : 3)}px rgba(223,101,85,${follow ? 0.3 : 0.14}), 7px 9px 0 rgba(63,45,28,0.12)`,
          }}
        >
          <Img src={staticFile("avatar.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </div>
        <div style={{fontFamily: SANS, fontSize: bigSize, fontWeight: 800, color: C.ink, marginTop: 38, letterSpacing: 2, textAlign: "center"}}>
          {e.big}
        </div>
        <div style={{fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.inkSoft, marginTop: 20, textAlign: "center", lineHeight: 1.4}}>
          {e.sub}
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 46}}>
          {(e.chips || []).map((c: string, i: number) => (
            <div
              key={c}
              style={{
                background: i ? C.coral : C.tealDark,
                color: C.white,
                borderRadius: 999,
                padding: "14px 40px",
                fontFamily: SANS,
                fontSize: 40,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div style={{opacity: follow ? 1 : 0, marginTop: 48, textAlign: "center"}}>
          <div style={{fontFamily: SANS, fontSize: 44, fontWeight: 700, color: C.ink}}>关注「医学科普漫画」</div>
          <div style={{fontFamily: SANS, fontSize: 36, color: C.coralDark, marginTop: 14}}>{e.next}</div>
        </div>
      </div>
      <FootNote text="本内容仅供科普，不能替代医生诊疗" />
    </AbsoluteFill>
  );
};

export const Episode: React.FC<{id: string}> = ({id}) => {
  const data = DATA[id];
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {beat, u, i} = useBeat(data, t);
  const Art = ART[id];
  // 一拍里常常有两句话：第一句给物体和名字，第二句给动作。画面跟着句子走，
  // 而不是跟着整拍走，否则第二句只能干等着，观众就只看到一句一闪。
  const subs = (beat.subs || []) as {t: number; end: number; c?: number; k?: number; ct?: number; ce?: number}[];
  let stage = 0;
  let sk = 0;
  let su = u;
  for (let k = 0; k < subs.length; k++) {
    if (t >= subs[k].t - 0.04) {
      stage = subs[k].c ?? k;
      sk = subs[k].k ?? k;
      const c0 = subs[k].ct ?? subs[k].t;
      const c1 = subs[k].ce ?? subs[k].end;
      su = clamp((t - c0) / Math.max(0.25, c1 - c0));
    }
  }
  return (
    <Shell data={data} t={t} ending={<Ending data={data} t={t} />}>
      {Art ? <Art t={t} scene={beat.scene} u={u} bi={i} stage={stage} su={su} sk={sk} lines={subs.length} /> : null}
    </Shell>
  );
};
