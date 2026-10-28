/* 第 5 期：一块肝、一个肝细胞、三条管道。后半段换成卡片站。
 * 拍点全部落在 77BPM 网格；段落之间在拍点切换镜头。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease, F = window.MedFrame;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: B(0), second: B(4), organ: B(8), flow: B(12), normal: B(18), line5: B(22),
    source: B(27), sugar: B(32), insulin: B(38), ffa: B(42), overflow: B(45),
    pressure: B(49), fatdrop: B(53), bigger: B(57), inflame: B(61), signal: B(65),
    fibrosis: B(69), scar: B(73), silent: B(77), ultrasound: B(81),
    lean: B(85), waist: B(89), sit: B(94), hours: B(98), steps: B(102),
    weight: B(106), five: B(109), ten: B(113), move: B(117), drink: B(121),
    check: B(125), recheck: B(129), recheck2: B(133),
    pullBack: BAR(35), follow: B(144)
  };
  const W = {
    sheet: [0, B(8) - .02],
    normal: [B(16), B(26) - .02],
    echo: [B(76), B(84) - .02],
    waist: [B(84), B(92) - .02],
    sit: [B(92), B(104) - .02],
    weight: [B(104), B(116) - .02],
    move: [B(116), B(124) - .02],
    check: [B(124), C.pullBack - .02]
  };
  M.loadPlate('../../brand/avatar.jpg');

  function winAlpha(t, w) {
    if (t < w[0] || t >= w[1]) return 0;
    return E.outCubic(u.seg(t, w[0], .35));
  }

  const beats = [
    { start: 0, end: B(8), lines: [[0, B(4), '体检单上写着脂肪肝'], [B(4), B(8), '不疼不痒，不等于没事']] },
    { start: B(8), end: B(16), lines: [[B(8), B(12), '肝是身体的化工厂'], [B(12), B(16), '糖和脂肪都在这里转换']] },
    { start: B(16), end: B(26), lines: [[B(16), B(20), '肝里本来就有脂肪'], [B(20), B(26), '超过 5% 才叫脂肪肝']] },
    { start: B(26), end: B(36), lines: [[B(26), B(31), '一部分是脂肪组织送来的'], [B(31), B(36), '一部分是肝自己用糖做的']] },
    { start: B(36), end: B(44), lines: [[B(36), B(40), '胰岛素抵抗时'], [B(40), B(44), '放出来的脂肪酸更多']] },
    { start: B(44), end: B(52), lines: [[B(44), B(48), '进来得多，合成也多'], [B(48), B(52), '运出去的却变少了']] },
    { start: B(52), end: B(60), lines: [[B(52), B(56), '多余的脂肪存成油滴'], [B(56), B(60), '肝细胞被一点点撑大']] },
    { start: B(60), end: B(68), lines: [[B(60), B(64), '一部分人会继续走'], [B(64), B(68), '走到脂肪性肝炎这一步']] },
    { start: B(68), end: B(76), lines: [[B(68), B(72), '炎症反复，就会留疤'], [B(72), B(76), '疤越来越多，就是纤维化']] },
    { start: B(76), end: B(84), lines: [[B(76), B(80), '这条路几乎没有感觉'], [B(80), B(84), '多数是体检查出来的']] },
    { start: B(84), end: B(92), lines: [[B(84), B(88), '不胖也可能有脂肪肝'], [B(88), B(92), '腰围比体重更说明问题']] },
    { start: B(92), end: B(104), lines: [[B(92), B(97), '每天多坐一小时'], [B(98), B(104), '肝里的脂肪就会多一点']] },
    { start: B(104), end: B(116), lines: [[B(104), B(109), '减 5%，脂肪变就能改善'], [B(109), B(116), '减 10%，炎症和纤维化也能退']] },
    { start: B(116), end: B(124), lines: [[B(116), B(120), '每周 150 分钟中等强度'], [B(120), B(124), '少含糖饮料，酒别喝']] },
    { start: B(124), end: BAR(35), lines: [[B(124), B(128), '复查看肝功能和超声'], [B(128), B(132), '必要时看弹性成像'], [B(132), BAR(35), '稳定后 6 到 12 个月一次']] },
    { start: BAR(35), end: DUR, lines: [[BAR(35), B(144), '肝不会喊疼'], [B(144), DUR, '但指标会替你说话']] }
  ];

  /* ---------- 通用卡片 ---------- */
  function card(g, x0, y0, w, h, title) {
    M.softShadow(g, x0 + w / 2, y0 + h + 18, w * .8, 24, .14);
    M.rr(g, x0, y0, w, h, 24); F.fillStroke(g, T.paperLight, 5);
    if (title) {
      M.text(g, title, x0 + 28, y0 + 52, { size: 36, weight: 800, align: 'left', role: 'object' });
      M.line(g, x0 + 24, y0 + 88, x0 + w - 24, y0 + 88, { w: 3, color: T.paperShadow });
    }
  }

  /* ---------- 体检单 ---------- */
  function sheetSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 300, y0 = 450, w = 450, h = 470;
    g.save(); g.globalAlpha *= wa;
    g.translate(0, (1 - E.outCubic(u.seg(t, W.sheet[0], .6))) * 26);
    M.softShadow(g, x0 + w / 2, y0 + h + 24, w * .82, 30, .16);
    M.rr(g, x0, y0, w, h, 26); F.fillStroke(g, T.paperLight, 5);
    M.text(g, '腹部超声', x0 + 30, y0 + 56, { size: 38, weight: 800, align: 'left', role: 'object' });
    M.line(g, x0 + 26, y0 + 96, x0 + w - 26, y0 + 96, { w: 3, color: T.paperShadow });
    M.text(g, '结论', x0 + 30, y0 + 156, { size: 36, weight: 700, align: 'left', role: 'object', color: T.gray });
    M.text(g, '脂肪肝（轻度）', x0 + 30, y0 + 222, { size: 40, weight: 900, align: 'left', role: 'object', color: T.coralDark });
    const ring = E.outCubic(u.seg(t, C.second, .7));
    if (ring > 0) {
      g.save(); g.globalAlpha *= ring; g.lineWidth = 5; g.strokeStyle = T.coralDark;
      g.beginPath(); g.ellipse(x0 + 168, y0 + 222, 160 * ring, 44 * ring, -.03, 0, 7); g.stroke();
      g.restore();
    }
    M.text(g, 'ALT', x0 + 30, y0 + 306, { size: 36, weight: 700, align: 'left', role: 'object' });
    M.text(g, '52', x0 + w - 96, y0 + 306, { size: 38, weight: 800, align: 'right', role: 'object', color: T.coralDark });
    M.text(g, '↑', x0 + w - 62, y0 + 306, { size: 38, weight: 800, role: 'object', color: T.coral });
    M.text(g, '甘油三酯', x0 + 30, y0 + 372, { size: 36, weight: 700, align: 'left', role: 'object' });
    M.text(g, '2.4', x0 + w - 96, y0 + 372, { size: 38, weight: 800, align: 'right', role: 'object', color: T.coralDark });
    M.text(g, '↑', x0 + w - 62, y0 + 372, { size: 38, weight: 800, role: 'object', color: T.coral });
    M.text(g, '本人没有不舒服', x0 + w / 2, y0 + 432, { size: 34, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }

  /* ---------- 肝与三条管道 ---------- */
  const LIVER = { x: 1280, y: 700 };
  const CELL = { x: 2230, y: 700, r: 286 };
  function liverBody(g, t, wa) {
    if (wa <= .02) return;
    const x = LIVER.x, y = LIVER.y;
    g.save(); g.globalAlpha *= wa;
    M.softShadow(g, x, y + 190, 230, 36, .15);
    g.beginPath();
    g.moveTo(x - 210, y - 10);
    g.bezierCurveTo(x - 180, y - 170, x + 70, y - 190, x + 160, y - 80);
    g.bezierCurveTo(x + 220, y - 10, x + 190, y + 170, x + 40, y + 180);
    g.bezierCurveTo(x - 120, y + 190, x - 240, y + 100, x - 210, y - 10);
    g.closePath(); F.fillStroke(g, '#C98A78', 7);
    g.save(); g.globalAlpha *= .4; g.strokeStyle = '#A66A5A'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 150, y + 50); g.bezierCurveTo(x - 40, y - 20, x + 40, y + 70, x + 160, y + 20); g.stroke();
    g.restore();
    M.text(g, '肝', x, y - 6, { size: 58, weight: 900, display: true, color: T.paperLight, role: 'object' });
    g.restore();
  }
  function pipes(g, t, inflow, outflow) {
    const IN_Y1 = 566, IN_Y2 = 848, OUT_Y = 706;
    const draw = (y, thick, color, a, n) => {
      if (a <= 0) return;
      g.save(); g.globalAlpha *= a;
      M.rr(g, 1120, y - thick / 2, CELL.x - 300 - 1120, thick, thick / 2);
      g.fillStyle = 'rgba(255,252,245,.92)'; g.fill();
      g.lineWidth = 5; g.strokeStyle = color; g.stroke();
      g.restore();
      for (let i = 0; i < n; i++) {
        const p = ((t * .42 + i / n) % 1);
        const px = 1160 + p * (CELL.x - 300 - 1180);
        g.save(); g.globalAlpha *= a * (.4 + .6 * Math.min(1, p * 4));
        g.beginPath(); g.arc(px, y, 9 + thick * .06, 0, 7); F.fillStroke(g, color, 3);
        g.restore();
      }
    };
    draw(IN_Y1, 26 + inflow * 26, T.coral, inflow > 0 ? 1 : 0, 5);
    draw(IN_Y2, 26 + inflow * 26, T.amber, inflow > 0 ? 1 : 0, 5);
    const ow = 26 - outflow * 16;
    g.save(); g.globalAlpha *= .92;
    M.rr(g, CELL.x + 290, OUT_Y - ow / 2, 300, Math.max(ow, 8), Math.max(ow / 2, 4));
    g.fillStyle = 'rgba(255,252,245,.92)'; g.fill();
    g.lineWidth = 5; g.strokeStyle = T.tealDark; g.stroke();
    g.restore();
    for (let i = 0; i < 3; i++) {
      const p = ((t * .3 + i / 3) % 1);
      g.save(); g.globalAlpha *= .9 * (1 - p * .5);
      g.beginPath(); g.arc(CELL.x + 310 + p * 270, OUT_Y, Math.max(6, ow * .3), 0, 7);
      F.fillStroke(g, T.tealLight, 3, T.tealDark);
      g.restore();
    }
  }

  /* ---------- 肝细胞 ---------- */
  function cellBody(g, t, fill, inflame, fiber) {
    const x = CELL.x, y = CELL.y, r = CELL.r;
    g.save();
    M.softShadow(g, x, y + r * .96, r * 1.05, 30, .14);
    g.beginPath();
    const wob = .03 * Math.sin(t * .8);
    for (let i = 0; i <= 60; i++) {
      const a = i / 60 * Math.PI * 2;
      const rr2 = r * (1 + wob * Math.sin(a * 4) + fill * .06 * Math.sin(a * 6 + 1));
      i ? g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : g.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
    }
    g.closePath();
    F.fillStroke(g, T.cyto, 8, T.membrane);
    g.beginPath(); g.arc(x - 110, y - 120, 74, 0, 7); F.fillStroke(g, T.nucleus, 4);
    const drops = [[60, 20], [130, 60], [10, 120], [120, -20], [-30, 40], [80, -90], [-80, 110]];
    drops.forEach((d, i) => {
      const p = u.clamp(fill * 7 - i, 0, 1);
      if (p <= 0) return;
      const dr = (22 + i * 3) * p * (1 + fill * .3);
      g.save(); g.globalAlpha *= .55 + .45 * p;
      g.beginPath(); g.arc(x + d[0], y + d[1], dr, 0, 7);
      F.fillStroke(g, '#F2C88A', 4, '#C99A46');
      g.restore();
    });
    if (inflame > 0) {
      for (let i = 0; i < 5; i++) {
        const p = u.clamp(inflame * 5 - i, 0, 1);
        if (p <= 0) continue;
        const ang = i * 1.9, d = r * .55;
        g.save(); g.globalAlpha *= .5 + .5 * p;
        g.beginPath(); g.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 22 * p, 0, 7);
        F.fillStroke(g, '#E8836F', 3, T.coralDark);
        g.restore();
      }
    }
    if (fiber > 0) {
      g.save(); g.globalAlpha *= .9;
      for (let i = 0; i < 18; i++) {
        const p = u.clamp(fiber * 18 - i, 0, 1);
        if (p <= 0) continue;
        const ang = i / 18 * 6.283;
        const r0 = r * 1.02, r1 = r * (1.02 + .3 * p);
        g.beginPath();
        g.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0);
        g.quadraticCurveTo(x + Math.cos(ang + .16) * r * (1 + .22 * p), y + Math.sin(ang + .16) * r * (1 + .22 * p),
          x + Math.cos(ang + .02) * r1, y + Math.sin(ang + .02) * r1);
        g.lineWidth = 7; g.strokeStyle = '#A57F5B'; g.lineCap = 'round'; g.stroke();
      }
      g.restore();
    }
    g.restore();
  }
  function ratioStrip(g, t, wa) {
    if (wa <= .02) return;
    const y = 1046, x0 = 1900;
    const lit = E.outCubic(u.seg(t, C.line5 - .3, .6));
    g.save(); g.globalAlpha *= wa;
    for (let i = 0; i < 20; i++) {
      g.beginPath(); g.arc(x0 + i * 30, y, 10, 0, 7);
      const on = i === 6 ? lit : 0;
      g.fillStyle = on > .4 ? '#F2C88A' : T.paperShadow; g.fill();
      g.lineWidth = 3; g.strokeStyle = on > .4 ? '#C99A46' : T.ink; g.stroke();
    }
    M.text(g, '5%', x0 + 660, y, { size: 40, weight: 900, role: 'object', color: T.coralDark });
    M.text(g, '20 个肝细胞里的 1 个', x0 + 660, y + 58, { size: 34, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }

  /* ---------- 超声 ---------- */
  function echoSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 2950, y0 = 540, w = 400, h = 420;
    const scan = E.inOutCubic(u.seg(t, C.ultrasound, 1.4));
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '超声');
    M.rr(g, x0 + 28, y0 + 112, w - 56, 200, 16); g.fillStyle = '#20303C'; g.fill();
    g.save(); g.globalAlpha *= .85;
    for (let i = 0; i < 26; i++) {
      const yy = y0 + 124 + i * 7, on = i / 26 < scan;
      g.fillStyle = on ? 'rgba(' + (206 - i * 3) + ',' + (220 - i * 3) + ',' + (176 + i) + ',' + (.35 + .5 * i / 26) + ')' : 'rgba(255,255,255,.08)';
      g.fillRect(x0 + 36, yy, w - 72, 5);
    }
    g.restore();
    M.text(g, '回声增强', x0 + w / 2, y0 + 348, { size: 34, weight: 700, role: 'object', color: T.coralDark });
    M.text(g, '轻度容易漏', x0 + w / 2, y0 + 392, { size: 32, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }

  /* ---------- 腰围与含糖饮料 ---------- */
  function waistSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 3650, y0 = 540, w = 420, h = 420;
    const grow = E.inOutCubic(u.seg(t, C.lean, 1.2));
    const cup = E.outCubic(u.seg(t, C.waist, .8));
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '腰围与饮料');
    M.rr(g, x0 + 34, y0 + 130, 200, 26, 13); g.fillStyle = T.paperShadow; g.fill();
    M.rr(g, x0 + 34, y0 + 130, Math.max(200 * grow, 6), 26, 13); g.fillStyle = T.amberLight; g.fill();
    M.rr(g, x0 + 34, y0 + 130, 200, 26, 13); g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke();
    for (let i = 0; i <= 8; i++) M.line(g, x0 + 40 + i * 24, y0 + 130, x0 + 40 + i * 24, y0 + 142, { w: 2, color: T.inkSoft });
    M.text(g, '男性 <90 cm', x0 + 34, y0 + 196, { size: 34, weight: 700, align: 'left', role: 'object' });
    M.text(g, '女性 <85 cm', x0 + 34, y0 + 240, { size: 34, weight: 700, align: 'left', role: 'object' });
    if (cup > 0) {
      g.save(); g.globalAlpha *= cup; g.translate(x0 + 320, y0 + 210);
      M.rr(g, -44, -70, 88, 140, 14); F.fillStroke(g, '#FBE2D7', 4, T.coralDark);
      M.rr(g, -36, -46, 72, 100, 10); g.fillStyle = T.coralLight; g.fill();
      M.line(g, 6, -70, 22, -110, { w: 6, color: T.coralDark });
      g.restore();
    }
    M.text(g, '含糖饮料是独立风险', x0 + w / 2, y0 + 392, { size: 32, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }

  /* ---------- 久坐与步数 ---------- */
  function sitSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 4350, y0 = 540, w = 440, h = 430;
    const grow = E.inOutCubic(u.seg(t, C.sit, 1.2));
    const rise = E.outCubic(u.seg(t, C.hours, 1));
    const steps = E.outCubic(u.seg(t, C.steps, 1.2));
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '久坐与步数');
    M.rr(g, x0 + 30, y0 + 120, w - 60, 30, 15); g.fillStyle = T.paperShadow; g.fill();
    M.rr(g, x0 + 30, y0 + 120, Math.max((w - 60) * grow, 6), 30, 15); g.fillStyle = T.coralLight; g.fill();
    M.text(g, '每天多坐 1 小时', x0 + 30, y0 + 190, { size: 34, weight: 700, align: 'left', role: 'object' });
    M.text(g, '肝内脂肪 +1.15%', x0 + 30, y0 + 238, { size: 34, weight: 800, align: 'left', role: 'object', color: T.coralDark });
    g.save(); g.globalAlpha *= rise;
    M.line(g, x0 + 30, y0 + 276, x0 + 30 + 220 * rise, y0 + 276, { w: 6, color: T.coralDark });
    g.restore();
    M.text(g, '每天多 2500 步', x0 + 30, y0 + 330, { size: 34, weight: 700, align: 'left', role: 'object' });
    M.text(g, '风险约降 17%', x0 + 30, y0 + 378, { size: 34, weight: 800, align: 'left', role: 'object', color: T.tealDark });
    g.save(); g.globalAlpha *= steps; g.translate(x0 + 340, y0 + 340);
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.ellipse(-26 + i * 18, -i * 8, 9, 6, 0, 0, 7);
      g.fillStyle = T.teal; g.fill();
    }
    g.restore();
    g.restore();
  }

  /* ---------- 减重三档 ---------- */
  const TIERS = [
    { k: '减 5%', v: '脂肪变改善', y: 660, color: '#F3C7BC' },
    { k: '减 7%–10%', v: '炎症改善', y: 746, color: '#EFB9A9' },
    { k: '减 10% 以上', v: '纤维化可退', y: 832, color: '#E7A392' }
  ];
  function weightSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 5050, y0 = 560, w = 500, h = 420;
    const grep = E.outCubic(u.seg(t, C.weight - .1, .6));
    const lit = [u.seg(t, C.weight, .5), u.seg(t, C.five, .5), u.seg(t, C.ten, .5)];
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '体重下降对应什么');
    TIERS.forEach((s, i) => {
      const grow = E.outCubic(u.clamp(grep * 3 - i, 0, 1));
      if (grow <= 0) return;
      const bw = 420 * grow;
      g.save(); g.globalAlpha *= .4 + .6 * lit[i];
      M.rr(g, x0 + 34, s.y, Math.max(bw, 8), 54, 16);
      F.fillStroke(g, lit[i] > .2 ? s.color : T.paperShadow, 4, lit[i] > .2 ? T.coralDark : T.ink);
      g.restore();
      if (grow > .6) {
        M.text(g, s.k, x0 + 46, s.y + 27, { size: 32, weight: 800, align: 'left', role: 'object', color: T.ink });
        M.text(g, s.v, x0 + w - 34, s.y + 27, { size: 32, weight: 700, align: 'right', role: 'object', color: lit[i] > .2 ? T.coralDark : T.gray });
      }
    });
    g.restore();
  }

  /* ---------- 运动与酒 ---------- */
  function moveSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 5800, y0 = 560, w = 400, h = 420;
    const grow = E.inOutCubic(u.seg(t, C.move + .2, 1.4));
    const cup = E.outCubic(u.seg(t, C.drink, .8));
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '每周怎么动');
    M.text(g, '150 分钟中等强度', x0 + 30, y0 + 132, { size: 36, weight: 800, align: 'left', role: 'object' });
    M.text(g, '+ 每周 2–3 次抗阻', x0 + 30, y0 + 182, { size: 34, weight: 600, align: 'left', role: 'object', color: T.tealDark });
    g.save(); g.globalAlpha *= .9;
    g.strokeStyle = T.tealDark; g.lineWidth = 7; g.setLineDash([20, 14]); g.lineCap = 'round';
    g.beginPath();
    const n = 20;
    for (let i = 0; i <= n; i++) {
      const p = i / n * grow, px = x0 + 40 + p * 320, py = y0 + 330 - 46 * Math.sin(p * Math.PI);
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke(); g.setLineDash([]); g.restore();
    if (cup > 0) {
      g.save(); g.globalAlpha *= cup; g.translate(x0 + 330, y0 + 250);
      M.rr(g, -26, -44, 52, 88, 10); F.fillStroke(g, T.paperLight, 4, T.inkSoft);
      M.line(g, -26, 0, 26, 0, { w: 4, color: T.coralDark });
      g.restore();
    }
    M.text(g, '酒能不喝就不喝', x0 + w / 2, y0 + 392, { size: 32, weight: 600, role: 'object', color: T.gray });
    g.restore();
  }

  /* ---------- 复查 ---------- */
  function checkSet(g, t, wa) {
    if (wa <= .02) return;
    const x0 = 6400, y0 = 560, w = 380, h = 420;
    const rows = ['肝功能', '腹部超声', '弹性成像'];
    const done = [u.seg(t, C.check, .5), u.seg(t, C.recheck, .5), u.seg(t, C.recheck2, .5)];
    g.save(); g.globalAlpha *= wa;
    card(g, x0, y0, w, h, '复查');
    rows.forEach((r, i) => {
      const y = y0 + 156 + i * 66;
      M.rr(g, x0 + 26, y - 20, 40, 40, 9);
      F.fillStroke(g, done[i] > .4 ? T.tealLight : T.paperLight, 4, done[i] > .4 ? T.tealDark : T.ink);
      if (done[i] > .4) {
        g.save(); g.strokeStyle = T.tealDark; g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x0 + 35, y); g.lineTo(x0 + 44, y + 9); g.lineTo(x0 + 58, y - 11); g.stroke();
        g.restore();
      }
      M.text(g, r, x0 + 84, y, { size: 34, weight: 700, align: 'left', role: 'object' });
    });
    M.text(g, '6 到 12 个月一次', x0 + w / 2, y0 + 386, { size: 32, weight: 700, role: 'object', color: T.coralDark });
    g.restore();
  }

  /* ---------- 底纹线 ---------- */
  function bed(g, t) {
    const x0 = 2950, x1 = 6880, y = 1010;
    g.save(); g.globalAlpha = .5;
    M.line(g, x0, y, x1, y, { w: 4, color: T.paperShadow });
    for (let x = x0; x <= x1; x += 240) M.line(g, x, y - 11, x, y + 11, { w: 3, color: T.paperShadow });
    g.globalAlpha = .7;
    g.beginPath(); g.arc(x0 + ((t * 70) % (x1 - x0)), y, 9, 0, 7); F.fillStroke(g, T.coralLight, 3, T.coralDark);
    g.restore();
  }

  function camera(t) {
    return M.cameraAt(t, [
      [0, 520, 690, 1.06], [B(8) - .02, 520, 690, 1.06],
      [B(8), 1320, 700, 1.02], [B(16) - .02, 1320, 700, 1.02],
      [B(16), 2250, 800, 0.92], [B(26) - .02, 2250, 800, 0.92],
      [B(26), 2030, 760, 0.86], [B(36) - .02, 2030, 760, 0.86],
      [B(36), 2150, 720, 1.00], [B(44) - .02, 2150, 720, 1.00],
      [B(44), 2120, 760, 0.84], [B(52) - .02, 2120, 760, 0.84],
      [B(52), 2250, 700, 1.14], [B(60) - .02, 2250, 700, 1.14],
      [B(60), 2230, 720, 1.04], [B(68) - .02, 2230, 720, 1.04],
      [B(68), 2200, 740, 0.94], [B(76) - .02, 2200, 740, 0.94],
      [B(76), 3150, 760, 1.00], [B(84) - .02, 3150, 760, 1.00],
      [B(84), 3860, 780, 1.00], [B(92) - .02, 3860, 780, 1.00],
      [B(92), 4570, 780, 1.00], [B(104) - .02, 4570, 780, 1.00],
      [B(104), 5300, 780, 1.00], [B(116) - .02, 5300, 780, 1.00],
      [B(116), 6000, 790, 1.00], [B(124) - .02, 6000, 790, 1.00],
      [B(124), 6600, 780, 1.00], [C.pullBack, 6600, 780, 1.00]
    ]);
  }

  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: B(2), end: B(6), text: '超声报告：提示脂肪肝', target: P(500, 900), dy: 150 },
      { start: B(9), end: B(13), text: '肝：糖和脂肪的转换站', target: P(1280, 560), dy: -225 },
      { start: B(18), end: B(22), text: '20 个肝细胞里 1 个', target: P(2080, 1046), dy: 120, color: T.coralDark },
      { start: B(28), end: B(32), text: '脂肪酸：脂肪组织送来的', target: P(1700, 566), dy: -230, color: T.coralDark },
      { start: B(37), end: B(41), text: '抵抗：放出来的脂肪酸更多', target: P(1750, 848), dy: 225, color: T.coralDark },
      { start: B(45), end: B(49), text: '三条路：进、造、运', target: P(2560, 706), dy: -230, color: T.tealDark },
      { start: B(53), end: B(57), text: '脂肪滴把肝细胞撑大', target: P(2290, 720), dy: 225 },
      { start: B(61), end: B(65), text: '肝炎：炎症开始出现', target: P(2230, 540), dy: -230, color: T.coralDark },
      { start: B(69), end: B(73), text: '纤维化：疤一步步变多', target: P(2230, 980), dy: 210 },
      { start: B(77), end: B(81), text: '多数靠体检发现', target: P(3150, 620), dy: -205 },
      { start: B(85), end: B(89), text: '腰围比体重更说明问题', target: P(3760, 620), dy: -175 },
      { start: B(94), end: B(98), text: '每多坐 1 小时，肝脂多一点', target: P(4470, 620), dy: -210, color: T.coralDark },
      { start: B(108), end: B(112), text: '减得越多，退得越多', target: P(5300, 640), dy: -235 },
      { start: B(117), end: B(121), text: '每周 150 分钟', target: P(5950, 630), dy: -225, color: T.tealDark },
      { start: B(132), end: B(136), text: '复查按医嘱', target: P(6590, 620), dy: -215 }
    ];
    specs.forEach(spec => F.note(g, t, spec, cam));
  }

  function scene(g, t, cam) {
    const A = w => winAlpha(t, w);
    if (A(W.sheet) > .02) sheetSet(g, t, A(W.sheet));

    if (t >= C.organ - .3 && t < B(16) - .02) {
      liverBody(g, t, E.outCubic(u.seg(t, C.organ, .6)));
    }

    if (t >= C.normal - .4 && t < W.echo[0] + 2) {
      const fill = E.inOutCubic(u.seg(t, C.normal, 3)) * .45 + E.inOutCubic(u.seg(t, C.pressure, 4)) * .55;
      const inf = E.inOutCubic(u.seg(t, C.inflame, 2.2));
      const fib = E.inOutCubic(u.seg(t, B(68), 4));
      pipes(g, t, E.outCubic(u.seg(t, C.source, 3)) * .5 + E.outCubic(u.seg(t, C.overflow, 2)) * .5,
        E.outCubic(u.seg(t, C.overflow, 2)));
      cellBody(g, t, fill, inf, fib);
      if (t < B(36)) ratioStrip(g, t, A(W.normal));
    }

    if (t >= W.echo[0] - .3 && t < C.pullBack) bed(g, t);
    if (A(W.echo) > .02) echoSet(g, t, A(W.echo));
    if (A(W.waist) > .02) waistSet(g, t, A(W.waist));
    if (A(W.sit) > .02) sitSet(g, t, A(W.sit));
    if (A(W.weight) > .02) weightSet(g, t, A(W.weight));
    if (A(W.move) > .02) moveSet(g, t, A(W.move));
    if (A(W.check) > .02) checkSet(g, t, A(W.check));
  }

  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]);
    g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), .8));
    M.avatar(g, 540, 470, 112);
    M.text(g, '脂肪肝', 540, 690, { size: 80, weight: 900, display: true });
    M.text(g, '不是亚健康', 540, 790, { size: 64, weight: 800, display: true });
    M.text(g, '减重和动起来，都能把它退回去', 540, 930, { size: 46, weight: 750, color: T.coralDark });
    M.text(g, '复查别断，酒少喝', 540, 1016, { size: 46, weight: 750, color: T.tealDark });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4));
    M.text(g, '关注「医学科普漫画」', 540, 1150, { size: 48, weight: 750 });
    M.text(g, '下期：血糖与体重的关系', 540, 1232, { size: 44, weight: 600, color: T.coralDark });
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
