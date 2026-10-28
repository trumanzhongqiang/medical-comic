/* 第 4 期重做：一条运输线 —— 胆固醇怎么被运走、又怎么留在管壁。
 * 拍点全部落在 77BPM 网格；每个画面段落有固定窗口，镜头在窗口之间平移。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease, F = window.MedFrame;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: B(0), material: B(8), drop: B(16), ldl: B(26), hdl: B(36),
    balance: B(44), deposit: B(52), focus: B(60), mark: B(64),
    tier: B(68), tier1: B(76), tierLow: B(80),
    others: B(84), hdlLine: B(88), fasting: B(92), retest: B(100),
    swap: B(108), walk: B(112), pill: B(116), adhere: B(120),
    manage: B(124), care: B(128), checkup: B(132),
    pullBack: BAR(35), follow: B(144)
  };
  // 画面段落窗口：结束时间提前 0.75s，把剩下的时间留给镜头平移
  const W = {
    sheet: [0, B(8) - .02],
    membrane: [B(8), B(16) - .02],
    carry: [B(16), B(26) - .02],
    liver: [B(26), B(36) - .02],
    card: [B(60), B(68) - .02],
    tier: [B(68), B(84) - .02],
    others: [B(84), B(92) - .02],
    fasting: [B(92), B(104) - .02],
    life: [B(104), B(116) - .02],
    meds: [B(116), B(124) - .02],
    check: [B(124), C.pullBack - .02]
  };
  M.loadPlate('../../brand/avatar.jpg');

  function winAlpha(t, w) {
    if (t < w[0] || t >= w[1]) return 0;
    return E.outCubic(u.seg(t, w[0], .35));
  }

  const beats = [
    { start: 0, end: B(8), lines: [[0, B(4), '血脂报告上有四行字'], [B(4), B(8), '箭头有朝上，也有朝下']] },
    { start: B(8), end: B(16), lines: [[B(8), B(12), '胆固醇不是多余的废物'], [B(12), B(16), '细胞膜和激素都要用它']] },
    { start: B(16), end: B(26), lines: [[B(16), B(20), '油不溶于血'], [B(20), B(26), '要用蛋白包起来才运得动']] },
    { start: B(26), end: B(36), lines: [[B(26), B(31), '低密度脂蛋白从肝出发'], [B(31), B(36), '把胆固醇送到全身细胞']] },
    { start: B(36), end: B(44), lines: [[B(36), B(40), '高密度脂蛋白走反方向'], [B(40), B(44), '把多余的运回肝里']] },
    { start: B(44), end: B(52), lines: [[B(44), B(48), '关键是两边是否平衡'], [B(48), B(52), '送出去的多，留下的就多']] },
    { start: B(52), end: B(60), lines: [[B(52), B(56), '多出来的会留在管壁'], [B(56), B(60), '越堆越厚，管腔变窄']] },
    { start: B(60), end: B(68), lines: [[B(60), B(64), '报告单上最该盯的是 LDL-C'], [B(64), B(68), '它就是送货那一队的量']] },
    { start: B(68), end: B(76), lines: [[B(68), B(72), '它的目标不是一个数'], [B(72), B(76), '要按风险高低分层']] },
    { start: B(76), end: B(84), lines: [[B(76), B(80), '风险越高，目标越低'], [B(80), B(84), '风险低，控制在 3.4 以下；风险极高，要到 1.8 以下']] },
    { start: B(84), end: B(92), lines: [[B(84), B(88), '甘油三酯，1.7 以上要留意'], [B(88), B(92), 'HDL-C 低了也不好']] },
    { start: B(92), end: B(104), lines: [[B(92), B(97), '查血脂要空腹 10 到 12 小时'], [B(98), B(104), '开始吃药后，4 到 6 周复查']] },
    { start: B(104), end: B(116), lines: [[B(104), B(109), '少吃反式脂肪和油炸'], [B(109), B(116), '多纤维、多动、别抽烟']] },
    { start: B(116), end: B(124), lines: [[B(116), B(120), '吃和动还压不下去，就用药'], [B(120), B(124), '他汀按医嘱，别自己停']] },
    { start: B(124), end: BAR(35), lines: [[B(124), B(128), '看 LDL-C，不看总胆固醇'], [B(128), B(132), '目标按风险定'], [B(132), BAR(35), '用药和复查都要长期坚持']] },
    { start: BAR(35), end: DUR, lines: [[BAR(35), B(144), '血脂不是越低越好'], [B(144), DUR, '看的是哪一队在管']] }
  ];

  /* ---------- 报告单 ---------- */
  const ROWS = [
    { name: '总胆固醇', v: '5.9', up: true },
    { name: '甘油三酯', v: '2.1', up: true },
    { name: 'LDL-C', v: '3.8', up: true },
    { name: 'HDL-C', v: '0.9', up: false }
  ];
  function tri(g, x, y, up) {
    g.save(); g.translate(x, y); if (!up) g.scale(1, -1);
    g.beginPath(); g.moveTo(0, -15); g.lineTo(12, 7); g.lineTo(-12, 7); g.closePath();
    F.fillStroke(g, up ? T.coral : T.teal, 3);
    g.restore();
  }
  function sheetSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 300, y0 = 430, w = 432, h = 536;
    g.save(); g.globalAlpha *= wa;
    g.translate(0, (1 - E.outCubic(u.seg(t, W.sheet[0], .6))) * 26);
    M.softShadow(g, x0 + w / 2, y0 + h + 26, w * .82, 34, .16);
    M.rr(g, x0, y0, w, h, 26); F.fillStroke(g, T.paperLight, 5);
    M.text(g, '血脂 4 项', x0 + 34, y0 + 54, { size: 38, weight: 800, align: 'left', role: 'object' });
    M.line(g, x0 + 30, y0 + 96, x0 + w - 30, y0 + 96, { w: 3, color: T.paperShadow });
    ROWS.forEach((r, i) => {
      const y = y0 + 158 + i * 100;
      const hi = E.outCubic(u.seg(t, C.open + .4 + i * .16, .5));
      g.save(); g.globalAlpha *= .5 + .5 * hi;
      M.text(g, r.name, x0 + 34, y, { size: 38, weight: 700, align: 'left', role: 'object' });
      M.text(g, r.v, x0 + w - 60, y, { size: 40, weight: 800, align: 'right', role: 'object', color: r.up ? T.coralDark : T.tealDark });
      tri(g, x0 + w - 30, y, r.up);
      g.restore();
    });
    g.restore();
  }

  /* ---------- 细胞膜 ---------- */
  function membraneSet(g, t, wa) {
    if (wa <= .02) return;
    const cx = 1000, top = 660, bot = 806;
    g.save(); g.globalAlpha *= wa;
    g.save(); g.globalAlpha *= .55; g.fillStyle = T.cyto;
    M.rr(g, cx - 208, top - 66, 416, bot - top + 132, 28); g.fill();
    g.restore();
    for (let i = 0; i < 11; i++) {
      const x = cx - 180 + i * 36;
      [top, bot].forEach((yy, k) => {
        g.beginPath(); g.arc(x, yy, 15, 0, 7); F.fillStroke(g, '#EFD9BE', 3);
        g.save(); g.strokeStyle = '#C9A888'; g.lineWidth = 3;
        const dir = k === 0 ? 1 : -1;
        g.beginPath(); g.moveTo(x - 5, yy + dir * 12); g.lineTo(x - 5, yy + dir * 68); g.stroke();
        g.beginPath(); g.moveTo(x + 5, yy + dir * 12); g.lineTo(x + 5, yy + dir * 68); g.stroke();
        g.restore();
      });
    }
    const lit = u.seg(t, C.material + .5, .8);
    for (let i = 0; i < 4; i++) {
      const x = cx - 132 + i * 88, on = u.clamp(lit * 4 - i, 0, 1);
      g.save(); g.globalAlpha *= .3 + .7 * on;
      M.rr(g, x - 12, top + 34, 24, 78, 12); F.fillStroke(g, T.amber, 4, on > .4 ? T.coralDark : T.ink);
      g.restore();
    }
    // 激素：甾体环，从细胞质里浮出来
    const hp = E.outCubic(u.seg(t, C.material + 1.6, 1));
    if (hp > 0) {
      g.save(); g.globalAlpha *= hp; g.translate(cx + 96, 566 - hp * 24);
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 3;
        const px = Math.cos(ang) * 42, py = Math.sin(ang) * 42;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.closePath(); F.fillStroke(g, T.violet, 4);
      g.restore();
    }
    g.restore();
  }

  /* ---------- 油滴 → 脂蛋白 ---------- */
  function lipidBall(g, x, y, r, kind, t) {
    const rim = kind === 'ldl' ? T.coralDark : T.tealDark;
    const oil = kind === 'ldl' ? '#F2C88A' : '#BFDCCF';
    g.save();
    M.softShadow(g, x, y + r * .95, r * 1.05, r * .32, .13);
    g.beginPath(); g.arc(x, y, r, 0, 7); F.fillStroke(g, T.paperLight, 5, rim);
    g.save(); g.beginPath(); g.arc(x, y, r - 6, 0, 7); g.clip();
    const n = 5, rot = t * .35;
    for (let i = 0; i < n; i++) {
      const ang = rot + i / n * 6.283, d = r * .42;
      g.beginPath(); g.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, r * .26, 0, 7);
      g.fillStyle = oil; g.fill();
      g.lineWidth = 2.5; g.strokeStyle = 'rgba(23,50,77,.4)'; g.stroke();
    }
    g.restore();
    // 蛋白外壳：一圈串珠
    const beads = Math.max(8, Math.round(r / 9));
    for (let i = 0; i < beads; i++) {
      const ang = i / beads * 6.283 + t * .18;
      const bx = x + Math.cos(ang) * r, by = y + Math.sin(ang) * r;
      g.beginPath(); g.arc(bx, by, r * .2, 0, 7);
      g.fillStyle = kind === 'ldl' ? T.coralLight : T.tealLight; g.fill();
      g.lineWidth = 3; g.strokeStyle = rim; g.stroke();
    }
    g.restore();
  }
  function carrySet(g, t, wa) {
    if (wa <= .02) return;
    // 落下的油滴
    if (t < C.drop + .9) {
      const fall = E.inQuad(u.seg(t, C.drop, .55));
      g.save(); g.globalAlpha *= wa;
      g.beginPath(); g.arc(1250, 500 + fall * 190, 40, 0, 7); F.fillStroke(g, T.amberLight, 4, T.coralDark);
      g.restore();
    }
    // 散开的一层油
    g.save(); g.globalAlpha *= wa * .65 * (1 - u.seg(t, C.drop + 1.6, 1.2));
    g.beginPath(); g.ellipse(1250, 704, 100, 26, 0, 0, 7); g.fillStyle = T.amberLight; g.fill();
    g.restore();
    // 蛋白外壳合上 → 变成脂蛋白漂走
    const wrap = E.outCubic(u.seg(t, C.drop + .9, 1));
    if (wrap > 0) {
      const r = 30 + wrap * 74, x = 1250 + E.inOutCubic(u.seg(t, C.drop + 1.2, 4)) * 170;
      g.save(); g.globalAlpha *= wa;
      lipidBall(g, x, 700, r, 'ldl', t);
      g.restore();
    }
  }

  /* ---------- 肝、血管、细胞 ---------- */
  const TUBE_Y = 740, TUBE_X0 = 1850, TUBE_X1 = 3300;
  function liver(g, x, y, t, wa) {
    g.save();
    M.softShadow(g, x, y + 170, 210, 34, .14);
    g.beginPath();
    g.moveTo(x - 200, y - 20);
    g.bezierCurveTo(x - 150, y - 150, x + 60, y - 160, x + 150, y - 70);
    g.bezierCurveTo(x + 210, y - 10, x + 170, y + 150, x + 40, y + 160);
    g.bezierCurveTo(x - 110, y + 170, x - 230, y + 90, x - 200, y - 20);
    g.closePath(); F.fillStroke(g, '#C98A78', 7);
    g.save(); g.globalAlpha *= .45; g.strokeStyle = '#A66A5A'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 140, y + 40); g.bezierCurveTo(x - 40, y - 20, x + 40, y + 60, x + 150, y + 10); g.stroke();
    g.restore();
    if (wa > .02) {
      g.save(); g.globalAlpha *= wa;
      M.text(g, '肝', x, y - 10, { size: 52, weight: 900, display: true, color: T.paperLight, role: 'object' });
      g.restore();
    }
    g.restore();
  }
  function tube(g, t) {
    const slim = E.inOutCubic(u.seg(t, C.deposit, 4.2));
    const top = TUBE_Y - 104, h = 208;
    const grad = g.createLinearGradient(0, top, 0, top + h);
    grad.addColorStop(0, '#F3C2B6'); grad.addColorStop(.32, '#FBE2D7');
    grad.addColorStop(.8, '#F6D3C7'); grad.addColorStop(1, '#E2A797');
    M.rr(g, TUBE_X0, top, TUBE_X1 - TUBE_X0, h, 104); g.fillStyle = grad; g.fill();
    g.lineWidth = 10; g.strokeStyle = T.ink; g.stroke();
    g.save(); g.globalAlpha = .26; g.strokeStyle = T.coralDark; g.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const x = TUBE_X0 + 60 + ((i * 122 + t * 90) % (TUBE_X1 - TUBE_X0 - 160));
      g.beginPath(); g.moveTo(x, TUBE_Y - 62); g.lineTo(x + 44, TUBE_Y - 62); g.stroke();
      g.beginPath(); g.moveTo(x, TUBE_Y + 62); g.lineTo(x + 44, TUBE_Y + 62); g.stroke();
    }
    g.restore();
    // 沉积：斑块从下壁长起来，管腔变窄
    if (slim > 0) {
      g.save();
      g.beginPath(); M.rr(g, TUBE_X0 + 4, TUBE_Y + 104, TUBE_X1 - TUBE_X0 - 8, -slim * 46, 20);
      g.fillStyle = 'rgba(231,199,155,.55)'; g.fill();
      g.restore();
      for (let i = 0; i < 3; i++) {
        const p = u.clamp(slim * 3.2 - i, 0, 1);
        if (p <= 0) continue;
        const x = 2920 + i * 106, r = 18 + p * 66;
        g.save();
        g.beginPath(); g.arc(x, TUBE_Y + 104, r, Math.PI, Math.PI * 2);
        g.closePath();
        F.fillStroke(g, i === 1 ? '#E9B87A' : '#E7C79B', 5, T.coralDark);
        g.restore();
      }
    }
  }
  function tissue(g, t) {
    const lit = u.seg(t, C.hdl, 1.4);
    for (let i = 0; i < 4; i++) {
      const x = 2850 + i * 142, y = 978;
      g.save(); g.globalAlpha = .6 + .4 * lit;
      M.cell(g, x, y, 44, { wobble: .06, memColor: lit > .4 ? T.tealDark : T.membrane, seed: 3 + i });
      g.restore();
    }
  }
  function ship(g, x, y, r, kind, alpha, t) {
    if (alpha <= .02) return;
    const dir = kind === 'ldl' ? -1 : 1;
    const rim = kind === 'ldl' ? T.coralDark : T.tealDark;
    g.save(); g.globalAlpha *= alpha;
    g.save(); g.globalAlpha *= .3; g.strokeStyle = rim; g.lineWidth = 5; g.lineCap = 'round';
    for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.moveTo(x + dir * (r + i * 22), y - 6 + i * 4);
      g.lineTo(x + dir * (r + i * 22 + 24), y - 6 + i * 4); g.stroke();
    }
    g.restore();
    lipidBall(g, x, y, r, kind, t);
    g.restore();
  }

  /* ---------- 报告单里抽出来的那一行 ---------- */
  function ldlCard(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 3700, y0 = 500, w = 400, h = 400;
    g.save(); g.globalAlpha *= wa;
    g.translate(0, (1 - E.outCubic(u.seg(t, W.card[0], .6))) * 26);
    M.softShadow(g, x0 + w / 2, y0 + h + 22, w * .8, 30, .16);
    M.rr(g, x0, y0, w, h, 26); F.fillStroke(g, T.paperLight, 5);
    const frame = E.outCubic(u.seg(t, C.mark, .6));
    if (frame > 0) {
      g.save(); g.globalAlpha *= frame; g.lineWidth = 6; g.strokeStyle = T.coralDark; g.setLineDash([18, 12]);
      M.rr(g, x0 + 30, y0 + 122, w - 60, 190, 18); g.stroke(); g.restore();
    }
    M.text(g, '低密度脂蛋白胆固醇', x0 + w / 2, y0 + 96, { size: 38, weight: 800, role: 'object' });
    M.text(g, '3.8', x0 + w / 2, y0 + 208, { size: 92, weight: 900, display: true, color: T.coralDark });
    M.text(g, 'mmol/L', x0 + w / 2, y0 + 288, { size: 36, weight: 600, role: 'object', color: T.gray });
    M.text(g, '箭头朝上，送货队多了', x0 + w / 2, y0 + 356, { size: 34, weight: 600, role: 'object', color: T.coralDark });
    g.restore();
  }

  /* ---------- 风险分层台阶 ---------- */
  const STEPS = [
    { k: '低危', v: '3.4', top: 566 },
    { k: '中高危', v: '2.6', top: 648 },
    { k: '极高危', v: '1.8', top: 730 },
    { k: '超高危', v: '1.4', top: 812 }
  ];
  function tierSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 4200, sw = 112, base = 906;
    const lit = [u.seg(t, C.tier1, .5), u.seg(t, C.tier1 + .3, .5), u.seg(t, C.tierLow, .5), u.seg(t, C.tierLow + .3, .5)];
    const growAll = E.outCubic(u.seg(t, C.tier, .7));
    g.save(); g.globalAlpha *= wa;
    STEPS.forEach((s, i) => {
      const grow = E.outCubic(u.clamp(growAll * 4 - i, 0, 1));
      if (grow <= 0) return;
      const x = x0 + i * sw, top = s.top;
      g.save(); g.globalAlpha *= .38 + .62 * lit[i];
      M.rr(g, x + 4, top, sw - 8, (base - top) * grow, 12);
      F.fillStroke(g, lit[i] > .2 ? '#F3C7BC' : T.paperShadow, 4, lit[i] > .2 ? T.coralDark : T.ink);
      M.text(g, s.k, x + sw / 2, top - 38, { size: 34, weight: 800, role: 'object', color: lit[i] > .2 ? T.coralDark : T.ink });
      if (grow > .8) M.text(g, s.v, x + sw / 2, top + 54, { size: 40, weight: 900, role: 'object', color: lit[i] > .2 ? T.coralDark : T.gray });
      g.restore();
    });
    M.line(g, x0 - 16, base, x0 + sw * 4 - 8, base, { w: 5, color: T.ink });
    M.text(g, '风险越高，目标越低', x0 + sw * 2, base + 60, { size: 36, weight: 700, role: 'object' });
    g.restore();
  }

  /* ---------- 其余三项 ---------- */
  const OTHERS = [
    { name: '甘油三酯', v: '1.7', up: true },
    { name: '总胆固醇', v: '5.2', up: true },
    { name: 'HDL-C', v: '1.0', up: false }
  ];
  function otherSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 4790, w = 388, y0 = 616, h = 348;
    g.save(); g.globalAlpha *= wa;
    M.softShadow(g, x0 + w / 2, y0 + h + 16, w * .8, 26, .14);
    M.rr(g, x0, y0, w, h, 26); F.fillStroke(g, T.paperLight, 5);
    M.text(g, '另外三项', x0 + 30, y0 + 54, { size: 36, weight: 800, align: 'left', role: 'object' });
    M.line(g, x0 + 26, y0 + 92, x0 + w - 26, y0 + 92, { w: 3, color: T.paperShadow });
    const lit = [u.seg(t, C.others, .5), u.seg(t, C.others + .3, .5), u.seg(t, C.hdlLine, .5)];
    OTHERS.forEach((o, i) => {
      const y = y0 + 152 + i * 66, on = lit[i];
      g.save(); g.globalAlpha *= .45 + .55 * on;
      M.text(g, o.name, x0 + 30, y, { size: 36, weight: 700, align: 'left', role: 'object' });
      M.text(g, o.v, x0 + w - 62, y, { size: 38, weight: 800, align: 'right', role: 'object', color: on > .3 ? (o.up ? T.coralDark : T.tealDark) : T.gray });
      tri(g, x0 + w - 32, y, o.up);
      g.restore();
    });
    g.restore();
  }

  /* ---------- 空腹与复查 ---------- */
  function fastingSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 5320, x1 = 5800, y = 800;
    const grow = E.inOutCubic(u.seg(t, C.fasting, 1.2));
    g.save(); g.globalAlpha *= wa;
    M.rr(g, x0, y - 26, (x1 - x0) * grow, 52, 26); g.fillStyle = T.paperShadow; g.fill();
    const fast = E.inOutCubic(u.seg(t, C.fasting + .15, 1.1));
    if (fast > 0) { M.rr(g, x0 + 4, y - 20, 218 * fast, 40, 20); g.fillStyle = T.tealLight; g.fill(); }
    M.rr(g, x0, y - 26, (x1 - x0) * grow, 52, 26); g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    for (let i = 0; i <= 6; i++) {
      const x = x0 + i * (x1 - x0) / 6 * grow;
      M.line(g, x, y - 8, x, y + 8, { w: 3, color: T.ink });
    }
    if (grow > .75) M.text(g, '空腹 10–12 小时', 5430, y - 78, { size: 36, weight: 800, role: 'object', color: T.tealDark });
    const rv = E.outCubic(u.seg(t, C.retest, .8));
    if (rv > 0) {
      g.save(); g.globalAlpha *= rv;
      M.line(g, 5620, y + 26, 5620, y + 92, { w: 4, color: T.coralDark });
      g.beginPath(); g.arc(5620, y + 92, 11, 0, 7); F.fillStroke(g, T.coralDark, 4);
      M.text(g, '开始吃药后 4–6 周复查', 5700, y + 132, { size: 36, weight: 800, role: 'object', color: T.coralDark });
      g.restore();
    }
    g.restore();
  }

  /* ---------- 餐盘与步道 ---------- */
  function plate(g, t, wa) {
    if (wa <= .02) return;
    const x = 6000, y = 790, r = 126;
    const sw = E.inOutCubic(u.seg(t, C.swap, 1.2));
    g.save(); g.globalAlpha *= wa;
    M.softShadow(g, x, y + r * .92, r * 1.15, 26, .14);
    g.beginPath(); g.arc(x, y, r, 0, 7); F.fillStroke(g, T.paperLight, 6);
    g.beginPath(); g.arc(x, y, r - 26, 0, 7); g.lineWidth = 3; g.strokeStyle = T.paperShadow; g.stroke();
    g.save(); g.globalAlpha *= (1 - sw);
    for (let i = 0; i < 3; i++) { M.rr(g, x - 88 + i * 64, y - 52, 52, 48, 14); F.fillStroke(g, '#E7B96F', 4); }
    g.restore();
    g.save(); g.globalAlpha *= sw;
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.arc(x - 72 + i * 52, y - 42, 25, 0, 7); F.fillStroke(g, i % 2 ? '#B7D6A8' : '#9FC98F', 4);
      g.beginPath(); g.arc(x - 44 + i * 52, y + 44, 22, 0, 7); F.fillStroke(g, '#E3C98B', 4);
    }
    g.restore(); g.restore();
  }
  function path(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 6186, x1 = 6436, y = 862, arc = 66;
    const grow = E.inOutCubic(u.seg(t, C.walk, 1.4));
    g.save(); g.globalAlpha *= wa;
    g.strokeStyle = T.tealDark; g.lineWidth = 8; g.setLineDash([22, 16]); g.lineCap = 'round';
    g.beginPath();
    const N = 22;
    for (let i = 0; i <= N; i++) {
      const p = i / N * grow, px = u.lerp(x0, x1, p), py = y - arc * Math.sin(p * Math.PI);
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke(); g.setLineDash([]);
    for (let i = 0; i < 4; i++) {
      const p = (t * .32 + i * .25) % 1;
      if (p > grow) continue;
      const px = u.lerp(x0, x1, p), py = y - arc * Math.sin(p * Math.PI);
      g.beginPath(); g.arc(px, py, 9, 0, 7); F.fillStroke(g, T.teal, 3);
    }
    M.text(g, '每周 150 分钟', 6310, 726, { size: 36, weight: 800, role: 'object', color: T.tealDark });
    g.restore();
  }

  /* ---------- 药盒与日历 ---------- */
  function pillBox(g, t, wa) {
    if (wa <= .02) return;
    const x = 6800, y = 790;
    g.save(); g.globalAlpha *= wa;
    g.translate(0, (1 - E.outCubic(u.seg(t, C.pill, .5))) * -22);
    M.softShadow(g, x, y + 96, 156, 24, .14);
    M.rr(g, x - 150, y - 92, 300, 190, 22); F.fillStroke(g, T.paperLight, 6);
    M.rr(g, x - 150, y - 92, 300, 46, 22); g.fillStyle = T.tealLight; g.fill();
    g.lineWidth = 5; g.strokeStyle = T.tealDark; g.stroke();
    M.text(g, '他汀', x, y + 4, { size: 46, weight: 900, color: T.tealDark });
    M.text(g, '中等强度起始', x, y + 58, { size: 34, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }
  function calendar(g, t, wa) {
    if (wa <= .02) return;
    const x = 7090, y = 790, w = 240, h = 200;
    const mark = E.outCubic(u.seg(t, C.adhere, .8));
    g.save(); g.globalAlpha *= wa;
    M.softShadow(g, x, y + h / 2 + 18, w * .8, 22, .14);
    M.rr(g, x - w / 2, y - h / 2, w, h, 20); F.fillStroke(g, T.paperLight, 5);
    M.rr(g, x - w / 2, y - h / 2, w, 44, 20); g.fillStyle = T.coralLight; g.fill();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    M.text(g, '复查', x, y - h / 2 + 22, { size: 34, weight: 800, role: 'object', color: T.coralDark });
    for (let i = 0; i < 12; i++) {
      const cx = x - w / 2 + 32 + (i % 6) * 35, cy = y - 28 + Math.floor(i / 6) * 52;
      const on = i === 4 ? mark : 0;
      g.beginPath(); g.arc(cx, cy, on > 0 ? 6 + 7 * on : 7, 0, 7);
      g.fillStyle = on > .3 ? T.coral : T.paperShadow; g.fill();
    }
    g.restore();
  }

  /* ---------- 管理清单 ---------- */
  function checklist(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 7250, y0 = 600, w = 340, h = 360;
    const rows = ['盯 LDL-C', '目标按风险', '长期复查'];
    const done = [u.seg(t, C.manage, .5), u.seg(t, C.care, .5), u.seg(t, C.checkup, .5)];
    g.save(); g.globalAlpha *= wa;
    M.softShadow(g, x0 + w / 2, y0 + h + 20, w * .82, 26, .15);
    M.rr(g, x0, y0, w, h, 24); F.fillStroke(g, T.paperLight, 5);
    M.text(g, '要做的三件事', x0 + w / 2, y0 + 58, { size: 38, weight: 800, role: 'object' });
    M.line(g, x0 + 26, y0 + 96, x0 + w - 26, y0 + 96, { w: 3, color: T.paperShadow });
    rows.forEach((r, i) => {
      const y = y0 + 158 + i * 74;
      M.rr(g, x0 + 28, y - 22, 44, 44, 10);
      F.fillStroke(g, done[i] > .4 ? T.tealLight : T.paperLight, 4, done[i] > .4 ? T.tealDark : T.ink);
      if (done[i] > .4) {
        g.save(); g.strokeStyle = T.tealDark; g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x0 + 38, y); g.lineTo(x0 + 47, y + 10); g.lineTo(x0 + 63, y - 12); g.stroke();
        g.restore();
      }
      M.text(g, r, x0 + 90, y, { size: 36, weight: 700, align: 'left', role: 'object' });
    });
    g.restore();
  }

  /* ---------- 后半段的底纹线：镜头搬家时画面不空 ---------- */
  function bed(g, t) {
    const x0 = 3450, x1 = 7900, y = 1046;
    g.save();
    g.globalAlpha = .5;
    M.line(g, x0, y, x1, y, { w: 4, color: T.paperShadow });
    for (let x = x0; x <= x1; x += 236) {
      M.line(g, x, y - 12, x, y + 12, { w: 3, color: T.paperShadow });
    }
    g.globalAlpha = .7;
    const dot = x0 + ((t * 70) % (x1 - x0));
    g.beginPath(); g.arc(dot, y, 9, 0, 7); F.fillStroke(g, T.coralLight, 3, T.coralDark);
    g.restore();
  }

  /* ---------- 镜头：每段停住，段与段之间平移 ---------- */
  function camera(t) {
    return M.cameraAt(t, [
      [0, 516, 700, 1.06], [B(8) - .02, 516, 700, 1.06],
      [B(8), 1000, 720, 1.30], [B(16) - .02, 1000, 720, 1.30],
      [B(16), 1350, 720, 1.15], [B(26) - .02, 1350, 720, 1.15],
      [B(26), 1900, 720, 1.02], [B(36) - .02, 1900, 720, 1.02],
      [B(36), 2300, 730, 1.08], [B(44) - .02, 2300, 730, 1.08],
      [B(44), 2500, 735, 1.00], [B(52) - .02, 2500, 735, 1.00],
      [B(52), 3050, 745, 1.28], [B(60) - .02, 3050, 745, 1.28],
      [B(60), 3900, 720, 1.10], [B(68) - .02, 3900, 720, 1.10],
      [B(68), 4430, 730, 1.08], [B(84) - .02, 4430, 730, 1.08],
      [B(84), 4980, 735, 1.06], [B(92) - .02, 4980, 735, 1.06],
      [B(92), 5580, 770, 1.04], [B(104) - .02, 5580, 770, 1.04],
      [B(104), 6154, 790, 1.05], [B(116) - .02, 6154, 790, 1.05],
      [B(116), 6920, 790, 1.05], [B(124) - .02, 6920, 790, 1.05],
      [B(124), 7420, 780, 1.04], [C.pullBack, 7420, 780, 1.04]
    ]);
  }

  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: B(2), end: B(6), text: '四个指标，箭头方向不一样', target: P(500, 916), dy: 130 },
      { start: B(9), end: B(13), text: '细胞膜：胆固醇是膜的原料', target: P(1000, 770), dy: 215 },
      { start: B(18), end: B(22), text: '脂蛋白：蛋白外壳包着油', target: P(1360, 700), dy: 235 },
      { start: B(28), end: B(32), text: 'LDL：从肝往外送的船队', target: P(1760, 600), dy: -215, color: T.coralDark },
      { start: B(37), end: B(41), text: 'HDL：从外往回运的船队', target: P(2300, 640), dy: -215, color: T.tealDark },
      { start: B(45), end: B(49), text: '一条往外，一条往回', target: P(2500, 640), dy: -215 },
      { start: B(53), end: B(57), text: '斑块：越堆越厚，管腔变窄', target: P(2960, 830), dy: 205, color: T.coralDark },
      { start: B(61), end: B(65), text: 'LDL-C：送货队运的量', target: P(3900, 700), dy: 235, color: T.coralDark },
      { start: B(69), end: B(73), text: '同一张单，不同人不同线', target: P(4260, 600), dy: -250 },
      { start: B(77), end: B(81), text: '低危 3.4，超高危 1.4', target: P(4430, 880), dy: 200, color: T.coralDark },
      { start: B(85), end: B(89), text: '其余三项各有各的线', target: P(4980, 800), dy: 210 },
      { start: B(94), end: B(98), text: '先空腹，再按点复查', target: P(5580, 806), dy: 235 },
      { start: B(108), end: B(112), text: '换掉油炸，加纤维', target: P(6000, 800), dy: 205 },
      { start: B(117), end: B(121), text: '中等强度他汀起始', target: P(6800, 800), dy: 205, color: T.tealDark },
      { start: B(132), end: B(136), text: '用药与复查都要长期', target: P(7420, 960), dy: 250 }
    ];
    specs.forEach(spec => F.note(g, t, spec, cam));
  }

  function scene(g, t, cam) {
    const A = w => winAlpha(t, w);
    if (A(W.sheet) > .02) sheetSet(g, t, A(W.sheet));
    if (A(W.membrane) > .02) membraneSet(g, t, A(W.membrane));
    if (A(W.carry) > .02) carrySet(g, t, A(W.carry));

    if (t >= C.ldl - .3 && t < C.pullBack) { tube(g, t); tissue(g, t); }
    if (t >= C.deposit - .3 && t < C.pullBack) bed(g, t);
    if (t >= C.ldl - .3 && t < C.pullBack) liver(g, 1720, 620, t, A(W.liver));

    if (t >= C.ldl - .3 && t < C.deposit + 3) {
      for (let i = 0; i < 4; i++) {
        const x = TUBE_X0 + 40 + ((t * 96 + i * 340) % (TUBE_X1 - TUBE_X0 - 160));
        ship(g, x, TUBE_Y + Math.sin(t * 2 + i) * 10, 26, 'ldl', u.seg(t, C.ldl, .8), t);
      }
    }
    if (t >= C.hdl && t < C.deposit + 3) {
      for (let i = 0; i < 3; i++) {
        const x = TUBE_X1 - 90 - ((t * 88 + i * 430) % (TUBE_X1 - TUBE_X0 - 180));
        ship(g, x, TUBE_Y - 36 + Math.sin(t * 2.4 + i) * 10, 22, 'hdl', u.seg(t, C.hdl, .8), t);
      }
    }
    if (t >= C.balance && t < C.deposit + 2.4) {
      const p = E.outCubic(u.seg(t, B(48), 1));
      for (let i = 0; i < 3; i++) {
        const q = u.clamp(p * 3 - i, 0, 1);
        if (q <= 0) continue;
        g.save(); g.globalAlpha = .9 * q;
        g.beginPath(); g.arc(2680 + i * 72, TUBE_Y + 70 - q * 16, 16, 0, 7); F.fillStroke(g, T.amber, 3, T.coralDark);
        g.restore();
      }
    }

    if (A(W.card) > .02) ldlCard(g, t, A(W.card));
    if (A(W.tier) > .02) tierSet(g, t, A(W.tier));
    if (A(W.others) > .02) otherSet(g, t, A(W.others));
    if (A(W.fasting) > .02) fastingSet(g, t, A(W.fasting));
    if (A(W.life) > .02) { plate(g, t, A(W.life)); path(g, t, A(W.life)); }
    if (A(W.meds) > .02) { pillBox(g, t, A(W.meds)); calendar(g, t, A(W.meds)); }
    if (A(W.check) > .02) checklist(g, t, A(W.check));
  }

  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]);
    g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), .8));
    M.avatar(g, 540, 470, 112);
    M.text(g, '血脂', 540, 690, { size: 88, weight: 900, display: true });
    M.text(g, '不是越低越好', 540, 790, { size: 64, weight: 800, display: true });
    M.text(g, '看的是 LDL-C 这一队', 540, 930, { size: 56, weight: 750, color: T.coralDark });
    M.text(g, '目标按风险定，药别自己停', 540, 1016, { size: 50, weight: 750, color: T.tealDark });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4));
    M.text(g, '关注「医学科普漫画」', 540, 1150, { size: 48, weight: 750 });
    M.text(g, '下期：脂肪肝是怎么来的', 540, 1232, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1330, { size: 36, role: 'disclaimer', color: T.gray });
    g.restore(); g.restore();
  }

  tl.add(0, DUR, (g, p, t) => {
    if (t < C.pullBack) {
      const cam = camera(t);
      g.save(); g.beginPath(); g.rect(0, 330, 1080, 810); g.clip();
      M.withCamera(g, cam, gg => scene(gg, t, cam)); g.restore();
      F.brand(g); F.caption(g, t, beats); notes(g, t, cam);
    }
    ending(g, t);
  });
  M.mount(tl);
})();
