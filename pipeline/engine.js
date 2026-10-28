/* 医学科普漫画 · 动画引擎
 * 确定性时间线引擎：任意 t 渲染任意帧，供逐帧截图、卡点与质检。
 * 所有随机数使用固定种子 PRNG，保证每次渲染逐比特一致。
 */
(function () {
  'use strict';

  const T = {
    W: 1080, H: 1440,
    paper: '#F6F0E5', paperLight: '#FFFCF5', paperShadow: '#E7DCCB',
    ink: '#17324D', inkSoft: '#526477', coral: '#DF6555', teal: '#278C84',
    coralDark: '#B94B43', coralLight: '#F3C7BC', tealDark: '#1E6865', tealLight: '#B9DDD3',
    amber: '#E7AD45', amberLight: '#F7DFA0', violet: '#8170A9',
    gray: '#65717B', white: '#FFFCF5',
    cyto: '#F6E6CF', membrane: '#DDA18F', nucleus: '#AFC5D5',
    skin: '#EFC5A5', shirt: '#7FA8D9', coat: '#FFFCF5', pants: '#4A5D78',
    font: "'PingFang SC','Hiragino Sans GB',sans-serif",
    displayFont: "'Songti SC','STSong','Noto Serif CJK SC',serif"
  };

  let frameText = [];
  // 与 pipeline/audit.py 的 CLOSERS 同一套闭标点；只标记行首，不改排版。
  const LINE_CLOSERS = new Set('，。？！、；：）】》〉」』…％%,.!?;:)]}');
  function recordText(g, str, x, y, o, measuredWidth) {
    if (o.audit === false) return;
    const size = o.size || 44;
    const w = measuredWidth == null ? g.measureText(str).width : measuredWidth;
    const align = o.align || 'center';
    const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    const m = g.getTransform();
    const points = [[left,y-size*.62],[left+w,y-size*.62],[left,y+size*.62],[left+w,y+size*.62]].map(p => ({
      x:m.a*p[0]+m.c*p[1]+m.e, y:m.b*p[0]+m.d*p[1]+m.f
    }));
    const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
    const scaled=size*Math.max(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));
    const lines = String(str).split('\n');
    frameText.push({
      text:str,x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),
      size:scaled,role:o.role||(size>=60?'display':'body'),safe:o.safe!==false,
      lineStarts: lines.map(line => line.trimStart().charAt(0)).filter(Boolean),
      closerAtLineStart: lines.some(line => LINE_CLOSERS.has(line.trimStart().charAt(0)))
    });
  }

  /* ---------- 工具 ---------- */
  const u = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, p) => a + (b - a) * p,
    // t0 起的 dur 内的原始进度 0..1
    seg: (t, t0, dur) => u.clamp((t - t0) / dur, 0, 1),
    // 周期脉冲：0→1→0
    pulse: (t, t0, dur) => { const p = u.seg(t, t0, dur); return Math.sin(p * Math.PI); }
  };

  const Ease = {
    linear: p => p,
    outQuad: p => 1 - (1 - p) * (1 - p),
    inQuad: p => p * p,
    inOutCubic: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
    outCubic: p => 1 - Math.pow(1 - p, 3),
    outBack: p => { if (p <= 0) return 0; if (p >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    outElastic: p => p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1
  };

  // mulberry32 固定种子 PRNG
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 纸张底纹（预渲染缓存） ---------- */
  let paperCache = null;
  function makePaper(w, h) {
    if (paperCache) return paperCache;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = T.paper; g.fillRect(0, 0, w, h);
    const r = rng(20261026);
    // 细颗粒
    for (let i = 0; i < w * h / 900; i++) {
      const x = r() * w, y = r() * h, a = 0.03 + r() * 0.05;
      g.fillStyle = r() < 0.5 ? `rgba(90,70,40,${a})` : `rgba(255,255,255,${a})`;
      g.fillRect(x, y, 1.6, 1.6);
    }
    // 纸纤维
    g.strokeStyle = 'rgba(120,95,60,0.045)'; g.lineWidth = 1;
    for (let i = 0; i < 90; i++) {
      const x = r() * w, y = r() * h, len = 30 + r() * 90, ang = r() * Math.PI;
      g.beginPath(); g.moveTo(x, y);
      g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
    }
    // 四周极轻暗角
    const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,45,20,0.06)');
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
    paperCache = c; return c;
  }

  /* ---------- 时间线 ---------- */
  class TL {
    constructor(duration) { this.duration = duration; this.clips = []; }
    // fn(g, p, t)：p=缓动后进度，t=全局绝对时间(秒)
    // opts: { fadeIn, fadeOut } 秒；整段画面在头尾做透明度过渡（防场景切换文字闪烁/硬切）
    add(t0, dur, fn, ease, opts) {
      if (typeof ease === 'object') { opts = ease; ease = null; }
      opts = opts || {};
      this.clips.push({ t0, dur, fn, ease: ease || Ease.outQuad, fi: opts.fadeIn || 0, fo: opts.fadeOut || 0 });
      return this;
    }
    run(g, t) {
      for (const c of this.clips) {
        if (t < c.t0 || t >= c.t0 + c.dur) continue;
        const p = c.ease(u.seg(t, c.t0, c.dur));
        if (!c.fi && !c.fo) { c.fn(g, p, t); continue; }
        g.save();
        const aIn = c.fi ? u.seg(t, c.t0, c.fi) : 1;
        const aOut = c.fo ? 1 - u.seg(t, c.t0 + c.dur - c.fo, c.fo) : 1;
        g.globalAlpha *= Math.min(aIn, aOut);
        c.fn(g, p, t);
        g.restore();
      }
    }
  }

  /* ---------- 基础图形 ---------- */
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function line(g, x1, y1, x2, y2, o) {
    o = o || {};
    g.save();
    g.strokeStyle = o.color || T.ink; g.lineWidth = o.w || 3;
    g.lineCap = 'round';
    if (o.dash) g.setLineDash(o.dash);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.restore();
  }
  function text(g, str, x, y, o) {
    o = o || {};
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    g.fillStyle = o.color || T.ink;
    g.font = `${o.weight || 500} ${o.size || 44}px ${o.display ? T.displayFont : T.font}`;
    g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
    const w = g.measureText(str).width;
    g.fillText(str, x, y, o.maxWidth);
    recordText(g, str, x, y, o, o.maxWidth ? Math.min(w, o.maxWidth) : w);
    g.restore();
  }
  function label(g, str, x, y, o) {
    o = o || {};
    const size = o.size || 44, padX = 24, h = size + 24;
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    g.font = `600 ${size}px ${T.font}`;
    const tw = g.measureText(str).width;
    const w = tw + padX * 2;
    let bx = x, by = y;
    if (o.anchor === 'center') bx = x - w / 2;
    if (o.anchor === 'right') bx = x - w;
    by = y - h / 2;
    if (o.leader) {
      const sx = u.clamp(o.leader.x, bx + 14, bx + w - 14), sy = o.leader.y < by ? by : by + h;
      line(g, sx, sy, o.leader.x, o.leader.y, { w: 2.5, color: o.border || T.ink });
      g.fillStyle = o.border || T.ink;
      g.beginPath(); g.arc(o.leader.x, o.leader.y, 5, 0, 7); g.fill();
    }
    g.shadowColor = 'rgba(63,45,28,0.16)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
    rr(g, bx, by, w, h, o.radius == null ? 18 : o.radius);
    g.fillStyle = o.bg || T.white; g.fill();
    g.shadowColor = 'transparent';
    g.lineWidth = 3; g.strokeStyle = o.border || T.ink; g.stroke();
    g.fillStyle = o.color || T.ink;
    g.font = `600 ${size}px ${T.font}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(str, bx + w / 2, by + h / 2 + 2);
    recordText(g, str, bx + w / 2, by + h / 2 + 2, { size, role: 'label', safe: o.safe !== false, audit: o.audit }, tw);
    g.restore();
    return { x: bx, y: by, w, h };
  }
  function softShadow(g, x, y, rx, ry, a) {
    g.save();
    const rg = g.createRadialGradient(x, y, 0, x, y, rx);
    rg.addColorStop(0, `rgba(50,38,18,${a == null ? 0.16 : a})`);
    rg.addColorStop(1, 'rgba(50,38,18,0)');
    g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y);
    g.fillStyle = rg;
    g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill();
    g.restore();
  }

  /* ---------- 角色与道具 ---------- */
  // 葡萄糖：六边糖果 + 高光
  function glucose(g, x, y, r, o) {
    o = o || {};
    g.save(); g.translate(x, y);
    g.rotate(o.rot || 0);
    softShadow(g, 0, r * 0.9, r * 1.1, r * 0.4, 0.12);
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0);
    }
    g.closePath();
    g.fillStyle = o.color || '#F6C34A'; g.fill();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    // 内部小六边
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + Math.PI / 6;
      i ? g.lineTo(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45) : g.moveTo(Math.cos(0) * r * 0.45, Math.sin(0) * r * 0.45);
    }
    g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
    // 高光
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.beginPath(); g.ellipse(-r * 0.32, -r * 0.38, r * 0.2, r * 0.12, -0.6, 0, 7); g.fill();
    g.restore();
  }
  // 胰岛素：钥匙（圆头+杆+齿）
  function insulin(g, x, y, o) {
    o = o || {};
    const s = o.scale || 1, ang = o.angle || 0;
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
    softShadow(g, 4, 26, 30, 10, 0.12);
    // 杆
    rr(g, -8, -6, 16, 58, 8); g.fillStyle = o.color || T.teal; g.fill();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    // 齿
    rr(g, 8, 34, 14, 10, 4); g.fillStyle = o.color || T.teal; g.fill(); g.stroke();
    rr(g, 8, 48, 10, 10, 4); g.fill(); g.fillStyle = o.color || T.teal; g.fill(); g.stroke();
    // 圆头
    g.beginPath(); g.arc(0, -24, 20, 0, 7);
    g.fillStyle = o.color || T.teal; g.fill(); g.stroke();
    g.beginPath(); g.arc(0, -24, 8, 0, 7);
    g.fillStyle = T.white; g.fill(); g.stroke();
    g.restore();
  }
  // 细胞：膜(波浪圆) + 质 + 核 + 受体锁
  function cell(g, x, y, r, o) {
    o = o || {};
    g.save(); g.translate(x, y);
    softShadow(g, 0, r * 1.02, r * 1.05, r * 0.34, 0.14);
    // 膜：波浪圆
    g.beginPath();
    const wob = o.wobble == null ? 0.05 : o.wobble;
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * Math.PI * 2;
      const rr2 = r * (1 + wob * Math.sin(a * 5 + (o.phase || 0)));
      i ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : g.moveTo(rr2, 0);
    }
    g.closePath();
    g.fillStyle = T.cyto; g.fill();
    g.lineWidth = 6; g.strokeStyle = o.memColor || T.membrane; g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = T.ink; g.stroke();
    // 细胞质颗粒
    const r2 = rng(o.seed || 7);
    g.fillStyle = 'rgba(232,180,160,0.35)';
    for (let i = 0; i < 7; i++) {
      const a = r2() * 6.28, d = r2() * r * 0.55;
      g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 4 + r2() * 7, 0, 7); g.fill();
    }
    // 核
    g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7);
    g.fillStyle = o.nucColor || T.nucleus; g.fill();
    g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke();
    g.beginPath(); g.arc(-r * 0.06, -r * 0.05, r * 0.11, 0, 7);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill();
    // 受体锁（顶部）
    const n = o.receptors == null ? 1 : o.receptors;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.62;
      const lx = Math.cos(a) * r, ly = Math.sin(a) * r;
      g.save(); g.translate(lx, ly); g.rotate(a + Math.PI / 2);
      rr(g, -9, -4, 18, 22, 6);
      g.fillStyle = o.lockColor || T.membrane; g.fill();
      g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke();
      g.beginPath(); g.arc(0, -6, 7, 0, 7);
      g.fillStyle = T.white; g.fill(); g.stroke();
      g.restore();
    }
    g.restore();
  }
  // 固定角色「小漫」：短发、圆框双色墨镜、浅色衬衫、听诊器。
  // 每期都是同一个人，不随调用方换肤。表情和手臂姿态仍由 o.exp / o.arm 控制。
  function person(g, x, y, s, o) {
    o = o || {};
    g.save(); g.translate(x, y); g.scale(s, s);
    const skin = '#F3D2B0';
    const shirt = '#F4EFE4';
    const hair = '#1A1A1A';
    const exp = o.exp || 'smile';
    softShadow(g, 0, 100, 66, 16, 0.15);

    if (!o.bust) {
      g.strokeStyle = '#3E4C63'; g.lineWidth = 16; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-14, 42); g.lineTo(-16, 90); g.stroke();
      g.beginPath(); g.moveTo(14, 42); g.lineTo(16, 90); g.stroke();
      g.strokeStyle = T.ink; g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(-28, 94); g.lineTo(-6, 94); g.stroke();
      g.beginPath(); g.moveTo(6, 94); g.lineTo(28, 94); g.stroke();
    }

    // 衬衫：圆角躯干 + 领口
    rr(g, -36, -30, 72, 82, 24);
    g.fillStyle = shirt; g.fill();
    g.lineWidth = 4.5; g.strokeStyle = T.ink; g.stroke();
    g.beginPath();
    g.moveTo(-16, -30); g.lineTo(0, -8); g.lineTo(16, -30);
    g.lineWidth = 3.5; g.stroke();
    g.fillStyle = skin;
    g.beginPath(); g.moveTo(-14, -30); g.lineTo(0, -12); g.lineTo(14, -30); g.closePath(); g.fill();

    // 手臂。pose: down | point | hold | wave | think
    // 上臂从肩膀画出，前臂另起一段，手掌带手指，避免一根管子戳出身体。
    const arm = o.arm || 'down';
    const limbs = {
      point: { r: [[30, -16], [52, -8], [74, -30]], l: [[-30, -16], [-40, 6], [-36, 30]] },
      hold: { r: [[30, -16], [46, 2], [54, 20]], l: [[-30, -16], [-46, 2], [-54, 20]] },
      wave: { r: [[30, -16], [50, -34], [62, -58]], l: [[-30, -16], [-40, 6], [-36, 30]] },
      think: { r: [[30, -16], [42, 0], [48, 14]], l: [[-30, -16], [-20, -6], [-8, 2]] },
      down: { r: [[30, -16], [40, 6], [42, 32]], l: [[-30, -16], [-40, 6], [-42, 32]] }
    }[arm] || { r: [[30, -16], [40, 6], [42, 32]], l: [[-30, -16], [-40, 6], [-42, 32]] };
    function limb(pts) {
      g.strokeStyle = shirt; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.stroke();
      g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.stroke();
      const hx = pts[2][0], hy = pts[2][1];
      const dx = hx - pts[1][0], dy = hy - pts[1][1];
      const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      g.fillStyle = skin; g.strokeStyle = T.ink; g.lineWidth = 3;
      g.beginPath(); g.ellipse(hx, hy, 9, 8, Math.atan2(uy, ux), 0, 7); g.fill(); g.stroke();
      g.lineWidth = 2.6; g.lineCap = 'round';
      for (const k of [-0.7, 0, 0.7]) {
        const px = -uy * k * 6, py = ux * k * 6;
        g.beginPath();
        g.moveTo(hx + px * 0.4, hy + py * 0.4);
        g.lineTo(hx + ux * 9 + px, hy + uy * 9 + py);
        g.stroke();
      }
    }
    limb(limbs.l); limb(limbs.r);

    // 头
    g.beginPath(); g.arc(0, -68, 38, 0, 7);
    g.fillStyle = skin; g.fill(); g.lineWidth = 4.5; g.strokeStyle = T.ink; g.stroke();
    // 耳朵
    g.fillStyle = skin;
    g.beginPath(); g.ellipse(-36, -66, 7, 10, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(36, -66, 7, 10, 0, 0, 7); g.fill(); g.stroke();

    // 短发：整片盖过头顶到鬓角，下缘是刘海，不留头皮
    g.fillStyle = hair;
    g.beginPath();
    g.moveTo(-34, -78);
    g.bezierCurveTo(-46, -78, -48, -112, -8, -112);
    g.bezierCurveTo(20, -114, 50, -104, 42, -70);
    g.quadraticCurveTo(36, -60, 30, -66);
    g.quadraticCurveTo(22, -78, 8, -74);
    g.quadraticCurveTo(-4, -86, -16, -74);
    g.quadraticCurveTo(-26, -64, -34, -78);
    g.closePath(); g.fill();
    // 两侧鬓角，垂到耳下
    g.beginPath();
    g.moveTo(-36, -86); g.quadraticCurveTo(-50, -70, -40, -46);
    g.quadraticCurveTo(-30, -52, -30, -70); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(36, -86); g.quadraticCurveTo(50, -70, 40, -46);
    g.quadraticCurveTo(30, -52, 30, -70); g.closePath(); g.fill();

    // 嘴：露在镜框下面，表情靠它
    g.strokeStyle = T.ink; g.lineWidth = 3.5; g.lineCap = 'round';
    if (exp === 'happy') { g.beginPath(); g.arc(0, -46, 9, 0.2, Math.PI - 0.2); g.stroke(); }
    else if (exp === 'worried' || exp === 'sad') { g.beginPath(); g.arc(0, -40, 8, Math.PI + 0.35, -0.35); g.stroke(); }
    else if (exp === 'surprised') { g.beginPath(); g.arc(0, -46, 4.5, 0, 7); g.stroke(); }
    else { g.beginPath(); g.arc(0, -48, 7, 0.35, Math.PI - 0.35); g.stroke(); }

    // 圆框墨镜：左镜珊瑚红、右镜青绿，这是角色的识别点
    g.lineWidth = 4;
    g.fillStyle = 'rgba(232,96,76,0.82)';
    g.beginPath(); g.arc(-15, -66, 13, 0, 7); g.fill();
    g.strokeStyle = T.ink; g.stroke();
    g.fillStyle = 'rgba(47,168,160,0.82)';
    g.beginPath(); g.arc(15, -66, 13, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-2, -66); g.lineTo(2, -66); g.stroke();
    g.beginPath(); g.moveTo(-28, -66); g.lineTo(-34, -70); g.stroke();
    g.beginPath(); g.moveTo(28, -66); g.lineTo(34, -70); g.stroke();
    // 镜片高光，让眼镜像玻璃而不是色块
    g.strokeStyle = 'rgba(255,253,248,0.85)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(-19, -70, 5, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
    g.beginPath(); g.arc(11, -70, 5, Math.PI * 1.1, Math.PI * 1.7); g.stroke();

    // 听诊器：从领口两侧垂下，在胸口汇成胸件
    g.strokeStyle = '#2A2A2A'; g.lineWidth = 3.2; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-4, 2); g.quadraticCurveTo(-12, 14, 0, 20); g.stroke();
    g.beginPath();
    g.moveTo(4, 2); g.quadraticCurveTo(12, 14, 0, 20); g.stroke();
    g.fillStyle = T.ink;
    g.beginPath(); g.arc(0, 30, 8, 0, 7); g.fill();
    g.strokeStyle = T.ink; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#D5DEE8';
    g.beginPath(); g.arc(0, 30, 3.6, 0, 7); g.fill();

    if (exp === 'sad' || exp === 'worried') {
      g.fillStyle = '#9ED0EE';
      g.beginPath(); g.moveTo(44, -96); g.quadraticCurveTo(52, -82, 44, -78); g.quadraticCurveTo(36, -82, 44, -96); g.fill();
      g.strokeStyle = T.ink; g.lineWidth = 2.5; g.stroke();
    }
    g.restore();
  }
  // 胰腺：弯曲长条分叶 + 胰岛小点 + 可选疲惫表情
  function pancreas(g, x, y, s, o) {
    o = o || {};
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot || 0);
    softShadow(g, 0, 46, 120, 22, 0.13);
    const tired = o.tired || 0; // 0..1
    const base = tired > 0.5 ? '#E2A28E' : '#F2B9A2';
    // 主形：沿曲线一串重叠圆构成分叶
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const p = i / 10;
      pts.push({ x: -110 + p * 220, y: Math.sin(p * Math.PI * 0.9) * 34 - p * 10, r: 26 - Math.abs(p - 0.5) * 8 });
    }
    for (const q of pts) {
      g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7);
      g.fillStyle = base; g.fill();
    }
    g.beginPath();
    for (const q of pts) { g.moveTo(q.x + q.r, q.y); g.arc(q.x, q.y, q.r, 0, 7); }
    g.fillStyle = base; g.fill();
    g.lineWidth = 5; g.strokeStyle = T.ink; g.stroke();
    // 分叶线
    g.lineWidth = 2.5;
    for (let i = 1; i < 10; i++) {
      const q = pts[i];
      g.beginPath(); g.arc(q.x, q.y, q.r * 0.62, 0.5, 2.4); g.stroke();
    }
    // 胰岛
    const ir = rng(99);
    g.fillStyle = T.teal;
    for (let i = 0; i < 8; i++) {
      const q = pts[1 + Math.floor(ir() * 9)];
      g.beginPath(); g.arc(q.x + (ir() - 0.5) * 22, q.y + (ir() - 0.5) * 20, 4.5, 0, 7); g.fill();
    }
    if (tired > 0) { // 疲惫脸 + 汗
      g.strokeStyle = T.ink; g.lineWidth = 3.5; g.lineCap = 'round';
      line(g, -32, -20, -18, -15, { w: 3.5 }); line(g, -2, -15, -16, -20, {}); // 耷拉眉（右）
      g.beginPath(); g.arc(-10, -6, 3.4, 0, 7); g.fillStyle = T.ink; g.fill();
      g.beginPath(); g.arc(12, -6, 3.4, 0, 7); g.fill();
      g.beginPath(); g.arc(1, 8, 6, Math.PI + 0.5, -0.5); g.stroke(); // 向下嘴
      g.fillStyle = '#9ED0EE';
      g.beginPath(); g.moveTo(34, -26); g.quadraticCurveTo(42, -14, 34, -10); g.quadraticCurveTo(26, -14, 34, -26); g.fill();
      g.strokeStyle = T.ink; g.lineWidth = 2.5; g.stroke();
    }
    g.restore();
  }
  // 报告单：带表格线的纸
  function reportSheet(g, x, y, w, h, o) {
    o = o || {};
    g.save(); g.translate(x, y);
    softShadow(g, w / 2, h + 14, w * 0.55, 20, 0.15);
    rr(g, 0, 0, w, h, 14);
    g.fillStyle = T.white; g.fill();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    // 抬头横线
    line(g, 24, 66, w - 24, 66, { w: 3 });
    text(g, o.title || '体检报告', w / 2, 38, { size: 34, weight: 700 });
    // 表格
    const rows = o.rows || 3;
    const top = 96, rh = (h - top - 30) / rows;
    for (let i = 0; i <= rows; i++) line(g, 24, top + i * rh, w - 24, top + i * rh, { w: 2, color: '#C9BFAC' });
    line(g, w * 0.42, top, w * 0.42, top + rows * rh, { w: 2, color: '#C9BFAC' });
    g.restore();
  }
  // 红细胞：双凹圆饼（侧面浅凹）
  function rbc(g, x, y, r, o) {
    o = o || {};
    g.save(); g.translate(x, y);
    if (o.rot) g.rotate(o.rot);
    if (o.squash) g.scale(1, o.squash);
    softShadow(g, 0, r * 0.75, r * 1.05, r * 0.36, 0.12);
    g.beginPath(); g.arc(0, 0, r, 0, 7);
    const grad = g.createRadialGradient(0, -r * 0.15, r * 0.2, 0, 0, r);
    grad.addColorStop(0, '#F49A8A'); grad.addColorStop(0.55, '#E8604C'); grad.addColorStop(1, '#C94A3C');
    g.fillStyle = grad; g.fill();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    // 中央浅凹
    g.beginPath(); g.ellipse(0, 0, r * 0.52, r * 0.42, 0, 0, 7);
    g.fillStyle = 'rgba(255,235,225,0.5)'; g.fill();
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(31,58,95,0.55)'; g.stroke();
    g.restore();
  }
  // 盖章：旋转圆角章（ coral 双框 + 文字）
  function stamp(g, str, x, y, o) {
    o = o || {};
    const size = o.size || 44, w = size * str.length + 46, h = size + 44;
    g.save(); g.translate(x, y); g.rotate(o.rot || -0.12);
    g.globalAlpha = o.alpha == null ? 0.92 : o.alpha;
    rr(g, -w / 2, -h / 2, w, h, 16);
    g.strokeStyle = T.coral; g.lineWidth = 6; g.stroke();
    rr(g, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 11);
    g.lineWidth = 2.5; g.stroke();
    text(g, str, 0, 2, { size, weight: 800, color: T.coral });
    g.restore();
  }
  // 闪光星芒（点缀）
  function sparkle(g, x, y, r, o) {
    o = o || {};
    g.save(); g.translate(x, y); g.rotate(o.rot || 0);
    g.fillStyle = o.color || T.amber;
    g.beginPath();
    g.moveTo(0, -r);
    g.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
    g.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
    g.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
    g.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
    g.fill();
    g.restore();
  }

  function kf(t, keys, ease) {
    if (!keys || !keys.length) return 0;
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1], b = keys[i];
        const p = (ease || Ease.inOutCubic)(u.seg(t, a[0], b[0] - a[0]));
        return u.lerp(a[1], b[1], p);
      }
    }
    return keys[keys.length - 1][1];
  }
  function cameraAt(t, keys) {
    return {
      x: kf(t, keys.map(k => [k[0], k[1]])),
      y: kf(t, keys.map(k => [k[0], k[2]])),
      zoom: kf(t, keys.map(k => [k[0], k[3]]))
    };
  }
  function bezier(points, p) {
    const q = 1 - u.clamp(p, 0, 1), a = points[0], b = points[1], c = points[2], d = points[3];
    return {
      x: q*q*q*a[0] + 3*q*q*p*b[0] + 3*q*p*p*c[0] + p*p*p*d[0],
      y: q*q*q*a[1] + 3*q*q*p*b[1] + 3*q*p*p*c[1] + p*p*p*d[1],
      angle: Math.atan2(3*q*q*(b[1]-a[1]) + 6*q*p*(c[1]-b[1]) + 3*p*p*(d[1]-c[1]),
        3*q*q*(b[0]-a[0]) + 6*q*p*(c[0]-b[0]) + 3*p*p*(d[0]-c[0]))
    };
  }
  function arrow(g, x1, y1, x2, y2, o) {
    o = o || {};
    const a = Math.atan2(y2-y1, x2-x1), head = o.head || 18;
    line(g, x1, y1, x2-Math.cos(a)*head*.7, y2-Math.sin(a)*head*.7, o);
    g.save(); g.translate(x2,y2); g.rotate(a); g.fillStyle=o.color||T.ink;
    g.beginPath(); g.moveTo(0,0); g.lineTo(-head,-head*.58); g.lineTo(-head,head*.58); g.closePath(); g.fill(); g.restore();
  }
  function paperPanel(g, x, y, w, h, o) {
    o=o||{}; g.save();
    g.shadowColor='rgba(63,45,28,0.16)'; g.shadowBlur=o.blur||18; g.shadowOffsetY=o.shadowY||8;
    rr(g,x,y,w,h,o.radius==null?24:o.radius); g.fillStyle=o.fill||T.paperLight; g.fill();
    g.shadowColor='transparent'; if(o.stroke!==false){g.lineWidth=o.lineWidth||3;g.strokeStyle=o.stroke||T.ink;g.stroke();}
    g.restore();
  }
  function withCamera(g, cam, fn) {
    g.save();
    g.translate(T.W / 2, T.H / 2);
    g.scale(cam.zoom || 1, cam.zoom || 1);
    if (cam.rot) g.rotate(cam.rot);
    g.translate(-(cam.x == null ? T.W / 2 : cam.x), -(cam.y == null ? T.H / 2 : cam.y));
    fn(g);
    g.restore();
  }
  function avatar(g, x, y, r) {
    const im = loadPlate('../../brand/avatar.jpg');
    g.save();
    g.shadowColor='rgba(63,45,28,.14)';g.shadowBlur=10;g.shadowOffsetY=4;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle=T.paperLight;g.fill();g.shadowColor='transparent';
    g.save();g.beginPath(); g.arc(x, y, r-2, 0, 7); g.clip();
    if (im && im._ready) g.drawImage(im, x - r, y - r, r * 2, r * 2);
    g.restore();
    g.beginPath(); g.arc(x, y, r, 0, 7);
    g.lineWidth = Math.max(4, r * 0.07); g.strokeStyle = T.ink; g.stroke();g.restore();
  }
  const plateCache = new Map();
  window.__ASSETS_PENDING = 0;
  function loadPlate(src) {
    if (!src) return null;
    if (plateCache.has(src)) return plateCache.get(src);
    const im = new Image();
    im._ready = false;window.__ASSETS_PENDING++;
    im.onload = () => { im._ready = true; window.__ASSETS_PENDING--; };
    im.onerror = () => { im._error = true; window.__ASSETS_PENDING--; };
    im.src = src;plateCache.set(src, im);return im;
  }
  function plate(g, src, x, y, w, h, o) {
    o = o || {};
    const im = loadPlate(src);
    if (!im || !im._ready) return false;
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    g.translate(x + w / 2, y + h / 2);g.rotate(o.rot || 0);g.translate(-w / 2, -h / 2);
    rr(g, 0, 0, w, h, o.radius == null ? 28 : o.radius);g.save(); g.clip();
    g.fillStyle = o.paper || T.paper;g.fillRect(0, 0, w, h);g.globalCompositeOperation = 'multiply';
    g.drawImage(im, o.sx || 0, o.sy || 0, o.sw || im.naturalWidth, o.sh || im.naturalHeight, 0, 0, w, h);
    g.restore();g.lineWidth = o.strokeWidth == null ? 5 : o.strokeWidth;g.strokeStyle = o.stroke || T.ink;g.stroke();g.restore();return true;
  }
  function mount(tl, opts) {
    opts = opts || {};
    const cv = document.getElementById('stage'), g = cv.getContext('2d'), paper = makePaper(T.W, T.H);
    window.__seek = function (t) {
      t = u.clamp(t, 0, tl.duration - 1e-6);frameText = [];
      g.setTransform(1, 0, 0, 1, 0, 0);g.globalAlpha = 1;g.globalCompositeOperation = 'source-over';
      g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0;g.setLineDash([]);
      g.clearRect(0, 0, T.W, T.H);g.drawImage(paper, 0, 0);tl.run(g, t);if (opts.foreground) opts.foreground(g, t);return true;
    };
    window.__audit = () => ({ text: frameText.map(x => Object.assign({}, x)), duration: tl.duration });
    window.__DURATION = tl.duration;
    const asked = new URLSearchParams(location.search).get('t');if (asked != null) window.__seek(Number(asked) || 0);
    document.title = 'ready';
  }
  window.MedComic = { T, u, Ease, rng, TL, makePaper, rr, line, text, label, softShadow, glucose, insulin, cell, person, pancreas, reportSheet, sparkle, rbc, stamp, kf, cameraAt, bezier, arrow, paperPanel, withCamera, loadPlate, plate, avatar, mount };
})();
