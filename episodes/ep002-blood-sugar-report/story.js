/* 第 2 期重做：封面提问，沿同一颗葡萄糖读懂报告上的三个指标。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: BAR(1), glucose: BAR(1), cells: BAR(3), fasting: BAR(5), fastingShot: B(24),
    meal: BAR(7), mealTone: B(32), rise: BAR(9), flood: B(36), peak: B(40),
    rbc: BAR(11), hba1c: BAR(13), stick: BAR(13), ratio: B(56),
    months: BAR(15), time120: BAR(15), monthsCard: B(64), duties: BAR(17),
    line61: BAR(19), fastingHigh: B(80), line78: BAR(21), postHigh: B(88),
    line65: BAR(23), retest: B(96), interference: BAR(25), mismatch: BAR(27),
    early: B(112), twice: BAR(29), plan: BAR(31), walk: B(128), engage: BAR(32),
    care: BAR(33), checkup: B(136), pullBack: BAR(35), follow: B(144)
  };
  M.loadPlate('../../brand/avatar.jpg');

  const beats = [
    { start: 0, end: BAR(1), lines: [[0, BAR(1), '空腹、餐后、糖化，到底该看哪个数？']] },
    { start: BAR(1), end: BAR(3), lines: [[BAR(1), B(8), '报告上的三个数，都和葡萄糖有关'], [B(8), BAR(3), '先认识血液里的葡萄糖']] },
    { start: BAR(3), end: BAR(5), lines: [[BAR(3), B(16), '葡萄糖随着血液流动'], [B(16), BAR(5), '为全身细胞提供能量']] },
    { start: BAR(5), end: BAR(7), lines: [[BAR(5), B(24), '空腹血糖，是抽血那一刻的血糖'], [B(24), BAR(7), '抽血前至少 8 小时不吃东西']] },
    { start: BAR(7), end: BAR(9), lines: [[BAR(7), B(32), '吃下第一口饭，餐后计时开始'], [B(32), BAR(9), '两小时后再测，就是餐后两小时血糖']] },
    { start: BAR(9), end: BAR(11), lines: [[BAR(9), B(40), '食物消化后，葡萄糖进入血液'], [B(40), BAR(11), '餐后血糖先升高，再逐渐回落']] },
    { start: BAR(11), end: BAR(13), lines: [[BAR(11), B(48), '血液里还有红细胞'], [B(48), BAR(13), '红细胞里的血红蛋白负责运送氧气']] },
    { start: BAR(13), end: BAR(15), lines: [[BAR(13), B(56), '葡萄糖会附着在血红蛋白上'], [B(56), BAR(15), '附着葡萄糖的血红蛋白比例，就是糖化血红蛋白']] },
    { start: BAR(15), end: BAR(17), lines: [[BAR(15), B(64), '红细胞大约活 120 天'], [B(64), BAR(17), '所以糖化反映近 3 个月的平均血糖水平']] },
    { start: BAR(17), end: BAR(19), lines: [[BAR(17), B(72), '空腹和餐后，各看一个时刻'], [B(72), BAR(19), '糖化看近 3 个月的整体情况']] },
    { start: BAR(19), end: BAR(21), lines: [[BAR(19), B(80), '空腹低于 6.1，在正常范围'], [B(80), BAR(21), '6.1 到不足 7.0，提示糖尿病前期']] },
    { start: BAR(21), end: BAR(23), lines: [[BAR(21), B(88), '餐后两小时达到 7.8，需要留意'], [B(88), BAR(23), '7.8 到不足 11.1，提示糖尿病前期']] },
    { start: BAR(23), end: BAR(25), lines: [[BAR(23), B(96), '糖化达到 6.5%，是诊断标准之一'], [B(96), BAR(25), '没有典型症状，需要复查确认']] },
    { start: BAR(25), end: BAR(27), lines: [[BAR(25), B(104), '贫血、失血会改变红细胞寿命'], [B(104), BAR(27), '这时糖化结果可能被带偏']] },
    { start: BAR(27), end: BAR(29), lines: [[BAR(27), B(112), '空腹正常，餐后也可能已经偏高'], [B(112), BAR(29), '三个指标互相补充，才有完整图景']] },
    { start: BAR(29), end: BAR(31), lines: [[BAR(29), B(120), '结果拿不准，交给医生结合情况判断'], [B(120), BAR(31), '必要时复查，或做糖耐量试验']] },
    { start: BAR(31), end: BAR(33), lines: [[BAR(31), B(128), '主食适量，搭配蔬菜和蛋白质'], [B(128), BAR(33), '每周规律活动，管理体重']] },
    { start: BAR(33), end: BAR(35), lines: [[BAR(33), B(136), '用药按医嘱'], [B(136), BAR(35), '按医生安排复查，别自行停药']] },
    { start: BAR(35), end: DUR, lines: [[BAR(35), B(144), '空腹看当下，餐后看应对'], [B(144), DUR, '糖化看近 3 个月，三个一起交给医生看']] }
  ];

  function brand(g) {
    M.avatar(g, 106, 78, 34);
    M.text(g, '医学科普漫画', 156, 78, { size: 36, weight: 700, align: 'left', role: 'brand', safe: false });
  }
  function caption(g, t) {
    const beat = beats.find(x => t >= x.start && t < x.end);
    if (!beat) return;
    const line = beat.lines.find(x => t >= x[0] && t < x[1]);
    if (!line) return;
    const enter = E.outCubic(u.seg(t, line[0], .24));
    const leave = 1 - u.seg(t, line[1] - .18, .18);
    const s = line[2];
    const warn = /偏高|留意|前期|带偏|达到/.test(s);
    g.save(); g.globalAlpha = enter * leave; g.translate(0, (1 - enter) * 12);
    const size = s.length > 24 ? 54 : 62;
    M.text(g, s, 540, 194, { size, weight: 850, display: true, color: warn ? T.coralDark : T.ink });
    g.restore();
  }
  function worldToScreen(p, cam) {
    return { x: 540 + (p.x - cam.x) * cam.zoom, y: 720 + (p.y - cam.y) * cam.zoom };
  }
  function note(g, t, spec, cam) {
    if (t < spec.start || t >= spec.end) return;
    const target = worldToScreen(spec.target(t), cam);
    const a = E.outCubic(u.seg(t, spec.start, .22)) * (1 - u.seg(t, spec.end - .18, .18));
    g.save(); g.font = `600 44px ${T.font}`;
    const w = g.measureText(spec.text).width + 48;
    const x = u.clamp(target.x + (spec.dx || 0), 72 + w / 2, 1008 - w / 2);
    const desiredY = target.y + (spec.dy || (target.y > 790 ? -155 : 155));
    const y = u.clamp(desiredY, 390, 1160);
    g.globalAlpha = a;
    M.label(g, spec.text, x, y, { anchor: 'center', size: 44, border: spec.color || T.ink, color: spec.color || T.ink, leader: target });
    g.restore();
  }

  const TUBE_Y = 736, TUBE_H = 150;
  function fillStroke(g, fill, width, stroke) {
    g.fillStyle = fill; g.fill(); g.lineWidth = width || 5; g.strokeStyle = stroke || T.ink; g.stroke();
  }
  function vesselBand(g, x0, x1) {
    g.save();
    const grad = g.createLinearGradient(0, TUBE_Y - TUBE_H / 2, 0, TUBE_Y + TUBE_H / 2);
    grad.addColorStop(0, '#F0B8AC'); grad.addColorStop(.24, '#F9DCCF'); grad.addColorStop(.76, '#F6D3C7'); grad.addColorStop(1, '#DFA093');
    M.rr(g, x0, TUBE_Y - TUBE_H / 2, x1 - x0, TUBE_H, TUBE_H / 2);
    g.fillStyle = grad; g.fill(); g.lineWidth = 16; g.strokeStyle = T.ink; g.stroke();
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,252,245,.6)';
    M.rr(g, x0 + 14, TUBE_Y - TUBE_H / 2 + 14, x1 - x0 - 28, TUBE_H - 28, TUBE_H / 2 - 14); g.stroke(); g.restore();
  }
  function redCells(g, x0, x1, t) {
    const n = Math.round((x1 - x0) / 150);
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i * 173 + t * (26 + i % 3 * 7)) % (x1 - x0));
      const y = TUBE_Y - 26 + (i % 3) * 26 + Math.sin(t * .9 + i) * 8;
      M.rbc(g, x, y, 24 + i % 2 * 4, { rot: Math.sin(t + i) * .3, squash: .86 });
    }
  }
  function glucose(g, x, y, r, rot, hero) {
    M.glucose(g, x, y, r, { rot: rot || 0, color: T.amber });
    if (!hero) return;
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = T.ink;
    g.beginPath(); g.arc(-r * .22, 0, r * .07, 0, 7); g.arc(r * .22, 0, r * .07, 0, 7); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = T.ink; g.beginPath(); g.arc(0, r * .16, r * .18, .15, Math.PI - .15); g.stroke(); g.restore();
  }

  const DAY = [[200, 546], [700, 542], [900, 500], [1060, 412], [1240, 388], [1420, 452], [1700, 512], [2100, 522]];
  function curvePoints(pts, p) {
    if (p >= 1) return pts;
    const total = pts.length - 1, f = p * total, k = Math.min(Math.floor(f), total - 1), r = f - k;
    const a = pts[k], b = pts[k + 1];
    return pts.slice(0, k + 1).concat([[u.lerp(a[0], b[0], r), u.lerp(a[1], b[1], r)]]);
  }
  function polyline(g, pts, o) {
    if (pts.length < 2) return;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = o.color || T.tealDark; g.lineWidth = o.w || 8;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke();
    g.fillStyle = o.color || T.tealDark; const e = pts[pts.length - 1]; g.beginPath(); g.arc(e[0], e[1], 11, 0, 7); g.fill();
    g.lineWidth = 3; g.strokeStyle = T.white; g.stroke(); g.restore();
  }
  function curveReveal(t) {
    if (t < C.flood) return 0;
    if (t < C.peak) return E.inOutCubic(u.seg(t, C.flood, C.peak - C.flood)) * 4 / 7;
    return 4 / 7 + E.inOutCubic(u.seg(t, C.peak, BAR(11) - C.peak)) * 3 / 7;
  }
  function dayWorld(g, t) {
    const p = curveReveal(t); if (p > 0) polyline(g, curvePoints(DAY, p), { color: T.tealDark, w: 8 });
    if (t >= C.peak) {
      g.save(); g.globalAlpha = E.outCubic(u.seg(t, C.peak, .4)); g.fillStyle = T.coral;
      g.beginPath(); g.arc(1240, 388, 15, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = T.white; g.stroke(); g.restore();
    }
  }
  function plate(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 118, 180, 34, .16); g.beginPath(); g.arc(0, 0, 150, 0, 7); fillStroke(g, T.paperLight, 8);
    g.save(); g.beginPath(); g.arc(0, 0, 122, 0, 7); g.clip(); g.fillStyle = T.amberLight; g.fillRect(-130, -130, 260, 130);
    g.fillStyle = T.tealLight; g.fillRect(-130, 0, 130, 130); g.fillStyle = T.coralLight; g.fillRect(0, 0, 130, 130);
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-92 + (i % 3) * 46, -46 + Math.floor(i / 3) * 34, 20, 9, .3, 0, 7); g.fillStyle = T.paperLight; g.fill(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-86 + (i % 3) * 44, 46 + Math.floor(i / 3) * 36, 17, 0, 7); g.fillStyle = i % 2 ? T.teal : '#78A96F'; g.fill(); }
    for (let i = 0; i < 4; i++) { M.rr(g, 22 + (i % 2) * 48, 28 + Math.floor(i / 2) * 40, 40, 24, 8); g.fillStyle = '#D99B80'; g.fill(); }
    g.restore(); g.restore();
  }
  function timer(g, x, y, t) {
    g.save(); g.translate(x, y); M.paperPanel(g, -155, -125, 310, 250, { radius: 28 });
    g.beginPath(); g.arc(0, -15, 78, 0, 7); fillStroke(g, T.paperLight, 7);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; M.line(g, Math.sin(a) * 61, -15 - Math.cos(a) * 61, Math.sin(a) * 69, -15 - Math.cos(a) * 69, { w: 3, color: T.inkSoft }); }
    const p = E.inOutCubic(u.seg(t, C.meal, C.mealTone - C.meal));
    const a = p * Math.PI * 4; M.line(g, 0, -15, Math.sin(a) * 52, -15 - Math.cos(a) * 52, { w: 7, color: T.coralDark });
    g.beginPath(); g.arc(0, -15, 8, 0, 7); g.fillStyle = T.ink; g.fill();
    M.text(g, t < C.mealTone ? '从第一口计时' : '两小时到点', 0, 96, { size: 38, weight: 750, role: 'object' }); g.restore();
  }

  function hemoglobin(g, x, y, s, a) {
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a == null ? 1 : a;
    for (let i = 0; i < 4; i++) { const px = (i % 2 ? 1 : -1) * 16, py = (i < 2 ? -1 : 1) * 15; g.beginPath(); g.arc(px, py, 13, 0, 7); fillStroke(g, T.coral, 3, T.coralDark); }
    g.restore();
  }
  function glycated(g, x, y, s, attached) {
    g.save(); g.translate(x, y); g.scale(s, s); M.rbc(g, 0, 0, 62, { squash: .84 }); hemoglobin(g, -6, 4, .72, 1);
    if (attached) glucose(g, 34, -30, 15, .4, false); g.restore();
  }
  function ratioDots(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.ratio, C.months - C.ratio)); if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    for (let i = 0; i < 10; i++) { glycated(g, x + (i % 5) * 105, y + Math.floor(i / 5) * 125, .52, i < 3); }
    M.text(g, '10 份中约 6 份附着 → 6%', x + 210, y + 285, { size: 40, weight: 800, color: T.coralDark, role: 'object' }); g.restore();
  }
  function monthsBar(g, x0, x1, y, t) {
    const grow = E.inOutCubic(u.seg(t, C.months, C.monthsCard - C.months)); if (grow <= 0) return;
    g.save(); M.rr(g, x0, y - 64, (x1 - x0) * grow, 128, 26); fillStroke(g, T.paperLight, 5);
    for (let i = 0; i < 6; i++) { const cx = x0 + 90 + i * ((x1 - x0 - 180) / 5); if (cx > x0 + (x1 - x0) * grow - 60) continue;
      g.save(); g.globalAlpha = i % 2 ? .55 : .9; M.rbc(g, cx, y - 4, 26, { squash: .85 }); if (i % 2 === 0) glucose(g, cx + 24, y - 26, 11, 0, false); g.restore(); }
    g.restore();
  }
  function rail(g, x0, x1, y, o) {
    const span = x1 - x0, xat = v => x0 + span * u.clamp(v / o.vmax, 0, 1); g.save();
    M.rr(g, x0, y - 22, span, 44, 22); g.fillStyle = T.paperShadow; g.fill(); let cursor = x0;
    o.zones.forEach(z => { const xe = xat(z.v); M.rr(g, cursor + 3, y - 18, Math.max(xe - cursor - 6, 6), 36, 18); g.fillStyle = z.color; g.fill(); cursor = xe; });
    M.rr(g, x0, y - 22, span, 44, 22); g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    o.ticks.forEach((tk, i) => { const x = xat(tk.v), up = i % 2 === 1; M.line(g, x, up ? y - 26 : y + 26, x, up ? y - 46 : y + 46, { w: 4, color: T.ink });
      M.text(g, tk.text, x, up ? y - 86 : y + 86, { size: 44, weight: 700, color: T.ink, role: 'object' }); });
    if (o.reveal > 0) { const mx = u.lerp(x0 - 40, xat(o.marker), o.reveal); g.save(); g.globalAlpha = Math.min(1, o.reveal * 2.2); g.fillStyle = o.markerColor || T.ink;
      g.beginPath(); g.moveTo(mx, y - 30); g.lineTo(mx - 17, y - 64); g.lineTo(mx + 17, y - 64); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke(); g.restore(); }
    g.restore();
  }
  const FLAT = [[0, 470], [80, 466], [150, 452], [230, 470], [340, 478], [420, 480]];
  const SPIKE = [[0, 470], [70, 462], [140, 344], [200, 316], [280, 400], [360, 462], [420, 478]];
  function compareCurves(g, x0, y0, t) {
    const mp = pts => pts.map(q => [x0 + q[0] * 2.1, y0 + (q[1] - 470) * 2.1]);
    const p1 = E.outCubic(u.seg(t, C.mismatch, C.early - C.mismatch)); polyline(g, curvePoints(mp(FLAT), p1), { color: T.tealDark, w: 9 });
    const p2 = E.outCubic(u.seg(t, C.early, BAR(29) - C.early)); polyline(g, curvePoints(mp(SPIKE), p2), { color: T.coralDark, w: 9 });
    if (t >= C.early) { M.text(g, '空腹正常', x0 + 34, y0 + 16, { size: 44, weight: 700, color: T.tealDark, role: 'object', align: 'left' });
      M.text(g, '餐后更高', x0 + 34, y0 - 240, { size: 44, weight: 700, color: T.coralDark, role: 'object', align: 'left' }); }
  }
  function glucoseCup(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 92, 96, 24, .14); g.beginPath(); g.moveTo(-62, -78); g.lineTo(62, -78); g.lineTo(48, 96); g.quadraticCurveTo(0, 112, -48, 96); g.closePath(); fillStroke(g, '#F6E3C8', 6);
    g.beginPath(); g.moveTo(-58, -60); g.lineTo(58, -60); g.lineTo(46, 66); g.quadraticCurveTo(0, 80, -46, 66); g.closePath(); g.fillStyle = '#EFC061'; g.fill();
    M.line(g, 34, -80, 66, -150, { w: 10, color: T.coral }); g.restore();
  }
  function stepPath(g, x, y, t) {
    const p = u.seg(t, C.walk, C.engage - C.walk);
    for (let i = 0; i < 4; i++) { g.save(); g.globalAlpha = .3 + .7 * u.clamp(p * 4 - i, 0, 1); M.rr(g, x + i * 78, y - (i % 2) * 10, 58, 22, 11); g.fillStyle = T.inkSoft; g.fill(); g.restore(); }
  }
  function pillBox(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 58, 80, 20, .14); M.rr(g, -70, -52, 140, 104, 14); fillStroke(g, T.paperLight, 6);
    M.rr(g, -70, -52, 140, 42, 14); fillStroke(g, '#DCE8E4', 5, T.tealDark);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-34 + i * 34, 20, 15, 0, 7); fillStroke(g, i % 2 ? T.amberLight : T.tealLight, 3); } g.restore();
  }
  function calendar(g, x, y, t) {
    g.save(); g.translate(x, y); g.rotate(.04); M.paperPanel(g, -84, -78, 168, 156, { radius: 14 }); M.rr(g, -84, -78, 168, 40, 12); g.fillStyle = T.coral; g.fill();
    M.text(g, '复查', 0, -58, { size: 34, weight: 700, color: T.white, role: 'object' });
    for (let i = 0; i < 4; i++) M.line(g, -56, -8 + i * 22, 56, -8 + i * 22, { w: 3, color: T.paperShadow });
    if (t >= C.checkup) { g.save(); g.globalAlpha = u.seg(t, C.checkup, C.pullBack - C.checkup); g.strokeStyle = T.coralDark; g.lineWidth = 6; g.beginPath(); g.arc(12, 30, 26, 0, 7); g.stroke(); g.restore(); } g.restore();
  }
  function reportCard(g, x, y, t, big) {
    const rows = [['空腹血糖', '5.6', 'mmol/L', T.tealDark], ['餐后 2 小时', '7.4', 'mmol/L', T.amber], ['糖化血红蛋白', '5.8', '%', T.tealDark]];
    g.save(); g.translate(x, y); g.rotate(-.02); M.softShadow(g, 0, 220, 280, 48, .16); M.paperPanel(g, -260, -310, 520, 620, { radius: 22 });
    M.text(g, '体检报告 · 血糖', 0, -264, { size: 44, weight: 800, color: T.ink }); M.line(g, -210, -226, 210, -226, { w: 3, color: T.inkSoft });
    rows.forEach((r, i) => { const yy = -150 + i * 156; const on = i === 0 ? t >= C.fastingShot : i === 1 ? t >= C.postHigh : t >= C.line65;
      g.save(); g.globalAlpha = big ? (on ? 1 : .72) : .9; M.text(g, r[0], -216, yy, { size: 42, weight: 700, align: 'left', color: T.ink });
      M.text(g, r[1], 128, yy + 4, { size: 56, weight: 850, align: 'right', color: r[3], role: 'object' });
      M.text(g, r[2], 214, yy + 4, { size: r[2] === '%' ? 42 : 30, weight: 650, align: 'right', color: T.inkSoft, role: 'object' }); g.restore();
      M.line(g, -216, yy + 68, 216, yy + 68, { w: 2, color: T.paperShadow }); }); g.restore();
  }
  const DUTY = [[0, 486], [120, 482], [190, 440], [250, 396], [320, 430], [400, 470], [470, 476]];
  function dutyCurve(g, x0, y0, t) {
    const mp = pts => pts.map(q => [x0 + q[0] * 1.1, y0 + (q[1] - 470) * 1.35]);
    const p = E.outCubic(u.seg(t, C.duties, B(72) - C.duties)); polyline(g, curvePoints(mp(DUTY), p), { color: T.tealDark, w: 8 });
    const wins = [{ x: 8, w: 74, color: T.tealDark, t0: C.duties }, { x: 214, w: 66, color: T.amber, t0: B(72) }, { x: 10, w: 424, color: T.violet, t0: BAR(19) }];
    wins.forEach((w, i) => { const a = E.outCubic(u.seg(t, w.t0, Math.min(.5, BAR(19) - w.t0))); if (a <= 0) return; g.save(); g.globalAlpha = a * (i === 2 ? .8 : .95);
      g.lineWidth = 6; g.strokeStyle = w.color; g.setLineDash(i === 2 ? [12, 10] : []); M.rr(g, x0 + w.x * 1.1, y0 - 118, w.w * 1.1, 150, 16); g.stroke(); g.restore(); });
  }
  function retestSheet(g, x, y, t) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 170, 230, 40, .14); g.rotate(.05); M.paperPanel(g, -190, -220, 380, 440, { radius: 18 }); g.rotate(-.1);
    M.paperPanel(g, -190, -220, 380, 440, { radius: 18 }); M.text(g, '医生判断', -150, -176, { size: 44, weight: 800, align: 'left', color: T.ink }); M.line(g, -150, -140, 150, -140, { w: 3, color: T.inkSoft });
    M.text(g, '结合症状与检测方式', 0, -70, { size: 38, weight: 700, color: T.ink, role: 'object' }); M.text(g, '必要时复查', 0, 20, { size: 44, weight: 800, color: T.coralDark });
    if (t >= B(120)) { M.text(g, '或做糖耐量试验', 0, 112, { size: 40, weight: 750, color: T.tealDark, role: 'object' }); glucoseCup(g, 105, 90); } g.restore();
  }

  function heroX(t) {
    const K = [[0, 840], [BAR(1), 840], [BAR(3), 860], [BAR(5), 700], [BAR(7), 830], [BAR(9), 900], [BAR(11), 1300], [BAR(13), 1800], [BAR(15), 1900], [BAR(17), 2180], [BAR(19), 3000], [BAR(21), 3540], [BAR(23), 3760], [BAR(25), 3980], [BAR(27), 4400], [BAR(29), 4700], [BAR(31), 5300], [BAR(33), 5860], [BAR(35), 6200], [DUR, 6220]];
    for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (t < b[0]) return u.lerp(a[1], b[1], E.inOutCubic(u.seg(t, a[0], Math.max(b[0] - a[0], .01)))); }
    return K[K.length - 1][1];
  }
  function heroY(t) { return t >= C.rbc && t < BAR(17) ? 470 : TUBE_Y; }
  function camera(t) {
    return M.cameraAt(t, [[0, 620, 650, 1], [BAR(1), 620, 650, 1], [BAR(3), 700, 660, 1.05], [BAR(5), 700, 680, 1.05], [BAR(7), 800, 700, 1.05], [BAR(9), 1050, 700, 1.1], [BAR(11), 1350, 640, 1.1], [BAR(13), 1800, 620, 1.16], [BAR(15), 1900, 640, 1.12], [BAR(17), 2280, 660, 1.06], [BAR(19), 2900, 600, 1.04], [BAR(21), 3600, 690, 1.12], [BAR(25), 3700, 690, 1.1], [BAR(27), 4400, 640, 1.05], [BAR(29), 4800, 620, 1.06], [BAR(31), 5460, 700, 1.06], [BAR(33), 5920, 720, 1.04], [BAR(35), 6300, 700, 1.02], [DUR, 6320, 700, 1]]);
  }
  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: B(8), end: B(12), text: '葡萄糖：血液里供细胞使用的能量', target: P(840, TUBE_Y), dy: -180 },
      { start: B(16), end: B(20), text: '血液：把葡萄糖送到全身', target: P(700, TUBE_Y - 60), dy: -190 },
      { start: B(24), end: B(28), text: '空腹血糖：禁食至少 8 小时后测量', target: P(600, TUBE_Y - 60), dy: -190 },
      { start: B(32), end: B(36), text: '餐后两小时：从第一口饭开始计时', target: P(780, 430), dy: -170 },
      { start: B(40), end: B(44), text: '血糖曲线：餐后升高再回落', target: P(1240, 388), dy: -150 },
      { start: B(48), end: B(52), text: '血红蛋白：红细胞里运送氧气的蛋白', target: P(1800, 470), color: T.coralDark, dy: -170 },
      { start: B(56), end: B(60), text: '糖化血红蛋白：附着葡萄糖的比例', target: P(2050, 420), color: T.coralDark, dy: -170 },
      { start: B(64), end: B(68), text: '近 3 个月：红细胞新老更替的时间', target: P(2280, 470), dy: -180 },
      { start: B(72), end: B(76), text: '三个指标：两个时刻和近 3 个月', target: P(2880, 470), dy: -250 },
      { start: B(80), end: B(84), text: '空腹血糖：单位 mmol/L', target: P(3560, 560), dy: -300 },
      { start: B(88), end: B(92), text: '餐后两小时：单位 mmol/L', target: P(3720, 560), dy: -300 },
      { start: B(96), end: B(100), text: '糖化血红蛋白：单位是百分比', target: P(3800, 560), dy: -300 },
      { start: B(104), end: B(108), text: '红细胞寿命改变，会影响糖化结果', target: P(3700, 560), dy: -300 },
      { start: B(112), end: B(116), text: '同一天：空腹和餐后可以不一致', target: P(4700, 330), dy: -160 },
      { start: B(120), end: B(124), text: '糖耐量试验：喝糖水后分点测量', target: P(5470, 800), dy: 190 },
      { start: B(128), end: B(132), text: '餐盘：主食适量，菜和蛋白占一半', target: P(5820, 900), dy: 200 }
    ];
    specs.forEach(spec => note(g, t, spec, cam));
  }
  function inView(cam, x0, x1) { const half = 540 / cam.zoom; return x0 > cam.x - half + 40 && x1 < cam.x + half - 40; }
  function world(g, t, cam) {
    vesselBand(g, -40, 6600); redCells(g, 120, 2900, t); dayWorld(g, t);
    if (t >= C.meal && t < BAR(11)) plate(g, 760, 930);
    if (t >= C.meal && t < BAR(11)) timer(g, 810, 450, t);
    if (t >= C.rbc && t < BAR(15) && inView(cam, 1680, 1920)) glycated(g, 1800, 470, 1.35, t >= C.stick);
    if (t >= C.ratio && t < BAR(17) && inView(cam, 1940, 2520)) ratioDots(g, 1980, 330, t);
    if (t >= C.months && t < BAR(19) && inView(cam, 1980, 2620)) monthsBar(g, 2020, 2600, 470, t);
    if (t >= C.duties && t < BAR(21) && inView(cam, 2720, 3320)) dutyCurve(g, 2760, 470, t);
    if (t >= BAR(19) && t < BAR(27) && inView(cam, 3300, 3940)) {
      const act = t < C.line78 ? 0 : t < C.line65 ? 1 : 2;
      const spec = [
        { vmax: 12, zones: [{ v: 6.1, color: T.tealLight }, { v: 7.0, color: T.amberLight }, { v: 12, color: T.coralLight }], ticks: [{ v: 6.1, text: '6.1' }, { v: 7.0, text: '7.0' }], marker: 6.5, markerColor: T.amber, cue: C.line61 },
        { vmax: 14, zones: [{ v: 7.8, color: T.tealLight }, { v: 11.1, color: T.amberLight }, { v: 14, color: T.coralLight }], ticks: [{ v: 7.8, text: '7.8' }, { v: 11.1, text: '11.1' }], marker: 9.4, markerColor: T.coral, cue: C.line78 },
        { vmax: 10, zones: [{ v: 6.5, color: T.tealLight }, { v: 10, color: T.coralLight }], ticks: [{ v: 6.5, text: '6.5%' }], marker: 7.0, markerColor: T.coral, cue: C.line65 }
      ][act];
      spec.reveal = t >= spec.cue ? E.outCubic(u.seg(t, spec.cue, B(4) - B(0))) : 0; rail(g, 3340, 3900, 560, spec);
      if (act === 2 && t >= C.interference) { const w = E.inOutCubic(u.seg(t, C.interference, BAR(27) - C.interference)) * 80; g.save(); g.globalAlpha = .55; M.rbc(g, 3600 + w, 560, 28, {}); g.restore(); }
    }
    if (t >= C.mismatch && t < BAR(31) && inView(cam, 4530, 4870)) compareCurves(g, 4580, 470, t);
    if (t >= C.twice && t < BAR(33) && inView(cam, 4060, 4420)) retestSheet(g, 4240, 660, t);
    if (t >= C.engage && inView(cam, 5740, 6200)) { plate(g, 5820, 900); stepPath(g, 5920, 1040, t); pillBox(g, 6060, 900); calendar(g, 6130, 660, t); }
    if (t >= BAR(34) && inView(cam, 6060, 6620)) reportCard(g, 6360, 660, t, false);
    glucose(g, heroX(t), heroY(t), 32, t * .2, true);
  }
  function cover(g) {
    brand(g); reportCard(g, 540, 735, 0, true);
    M.text(g, '空腹、餐后、糖化', 540, 270, { size: 82, weight: 900, display: true });
    M.text(g, '到底该看哪个数？', 540, 1150, { size: 78, weight: 900, display: true, color: T.coralDark });
    M.text(g, '带着这个问题，一起读懂报告', 540, 1260, { size: 44, weight: 650, color: T.inkSoft });
  }
  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]); g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), C.follow - B(142))); M.avatar(g, 540, 486, 112);
    M.text(g, '三个数字', 540, 712, { size: 86, weight: 900, display: true }); M.text(g, '回答三个问题', 540, 812, { size: 64, weight: 800, display: true });
    M.text(g, '空腹看当下，餐后看应对', 540, 960, { size: 58, weight: 750, color: T.tealDark }); M.text(g, '糖化看近 3 个月', 540, 1046, { size: 58, weight: 750, color: T.amber });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4)); M.text(g, '关注「医学科普漫画」', 540, 1170, { size: 48, weight: 750 });
    M.text(g, '下期：血压里的两个数字在说什么', 540, 1250, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1340, { size: 36, role: 'disclaimer', color: T.gray }); g.restore(); g.restore();
  }
  tl.add(0, DUR, (g, p, t) => {
    if (t < C.open) { cover(g); return; }
    if (t < C.pullBack) { const cam = camera(t); g.save(); g.beginPath(); g.rect(0, 330, 1080, 810); g.clip(); M.withCamera(g, cam, gg => world(gg, t, cam)); g.restore(); brand(g); caption(g, t); notes(g, t, cam); }
    ending(g, t);
  });
  M.mount(tl);
})();
