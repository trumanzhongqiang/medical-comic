/** 缓动：医学动作用缓入缓出，不用回弹。 */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const seg = (t: number, start: number, len: number) =>
  clamp((t - start) / Math.max(len, 0.001));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const inOut = (p: number) => {
  const x = clamp(p);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

export const out = (p: number) => 1 - Math.pow(1 - clamp(p), 3);

/** 预备、主动作、落定。anticipation 为负向预备的比例。 */
export const punch = (t: number, at: number, wind = 0.16, hit = 0.34, settle = 0.28) => {
  if (t < at - wind || t > at + hit + settle) return 0;
  if (t < at) return -0.35 * inOut(seg(t, at - wind, wind));
  if (t < at + hit) return out(seg(t, at, hit));
  return 1 - inOut(seg(t, at + hit, settle));
};

export const ramp = (t: number, start: number, len: number) => inOut(seg(t, start, len));

export const keys = (t: number, pts: Array<[number, number]>) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a0, a1] = pts[i];
    const [b0, b1] = pts[i + 1];
    if (t < b0) return lerp(a1, b1, inOut(seg(t, a0, b0 - a0)));
  }
  return pts[pts.length - 1][1];
};
