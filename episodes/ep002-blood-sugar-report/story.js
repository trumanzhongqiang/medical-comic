/* 第 2 期重做：封面提问，沿同一颗葡萄糖读懂报告上的三个指标。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;
  const DUR = 143.81, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const OLD_EDGES = [0, 3.6974, 9.9311, 16.1649, 22.3987, 28.6324, 34.8662, 41.1, 47.3337, 53.5675, 59.8013, 66.035, 72.2688, 78.5026, 84.7363, 90.9701, 97.2039, 103.4376, 109.6714, 116];
  const NEW_EDGES = [0, 4.41, 17.06, 24.59, 30.17, 34.98, 39.07, 47.4, 51.89, 59.47, 64.68, 75.45, 84.98, 94.35, 101, 105.41, 120.46, 128.63, 136.24, 143.81];
  function toNew(t) {
    for (let i = 0; i < OLD_EDGES.length - 1; i++) {
      const a = OLD_EDGES[i], b = OLD_EDGES[i + 1];
      if (t < b || i === OLD_EDGES.length - 2) {
        const p = Math.min(1, Math.max(0, (t - a) / (b - a)));
        return NEW_EDGES[i] + p * (NEW_EDGES[i + 1] - NEW_EDGES[i]);
      }
    }
    return NEW_EDGES[NEW_EDGES.length - 1];
  }
  function toOld(t) {
    for (let i = 0; i < NEW_EDGES.length - 1; i++) {
      const a = NEW_EDGES[i], b = NEW_EDGES[i + 1];
      if (t < b || i === NEW_EDGES.length - 2) {
        const p = Math.min(1, Math.max(0, (t - a) / (b - a)));
        return OLD_EDGES[i] + p * (OLD_EDGES[i + 1] - OLD_EDGES[i]);
      }
    }
    return 116;
  }
  const C = {
    open: BAR(1), glucose: BAR(1), cells: BAR(3), fasting: BAR(5), fastingShot: B(24),
    meal: BAR(7), mealTone: B(32), rise: BAR(9), flood: B(36), peak: B(40),
    rbc: BAR(11), hba1c: BAR(13), stick: BAR(13), ratio: B(56),
    months: BAR(15), time120: BAR(15), monthsCard: B(64), duties: BAR(17),
    line61: BAR(19), fastingHigh: B(80), line78: BAR(21), postHigh: B(88),
    line65: BAR(23), retest: B(96), interference: BAR(25), mismatch: BAR(27),
    early: B(112), twice: BAR(29), plan: BAR(31), walk: BAR(32), engage: BAR(32),
    care: BAR(33), checkup: B(136), pullBack: BAR(35), follow: B(144)
  };
  M.loadPlate('../../brand/avatar.jpg');

  const beats = [
    { start: 0, end: 4.41, lines: [[0, 4.41, '三个数，看的不是同一段时间']] },
    { start: 4.41, end: 17.06, lines: [[4.41, 17.06, '空腹看没吃饭，餐后看这顿饭，糖化看近两三个月']] },
    { start: 17.06, end: 24.59, lines: [[17.06, 24.59, '血里的糖，是送给细胞用的']] },
    { start: 24.59, end: 30.17, lines: [[24.59, 30.17, '空腹：至少 8 小时没吃东西']] },
    { start: 30.17, end: 34.98, lines: [[30.17, 34.98, '餐后两小时：从第一口饭算起']] },
    { start: 34.98, end: 39.07, lines: [[34.98, 39.07, '这顿饭：先升高，再落下来']] },
    { start: 39.07, end: 47.4, lines: [[39.07, 47.4, '糖会结合在运氧气的蛋白上']] },
    { start: 47.4, end: 51.89, lines: [[47.4, 51.89, '结合多少，就是糖化血红蛋白']] },
    { start: 51.89, end: 59.47, lines: [[51.89, 59.47, '看近两三个月，不看某一顿']] },
    { start: 59.47, end: 64.68, lines: [[59.47, 64.68, '三个数，各看一段时间']] },
    { start: 64.68, end: 75.45, lines: [[64.68, 75.45, '空腹 6.1 到不足 7.0，是前期']] },
    { start: 75.45, end: 84.98, lines: [[75.45, 84.98, '餐后 7.8 到不足 11.1，也是前期']] },
    { start: 84.98, end: 94.35, lines: [[84.98, 94.35, '糖化 6.5%，要复查确认']] },
    { start: 94.35, end: 101, lines: [[94.35, 101, '贫血或失血，糖化可能不准']] },
    { start: 101, end: 105.41, lines: [[101, 105.41, '早上正常，不代表这顿饭正常']] },
    { start: 105.41, end: 120.46, lines: [[105.41, 120.46, '喝糖水和普通吃饭，不是同一种检查']] },
    { start: 120.46, end: 128.63, lines: [[120.46, 128.63, '主食怎么选，菜和蛋白怎么搭']] },
    { start: 128.63, end: 136.24, lines: [[128.63, 136.24, '药别因为一次正常就自己停']] },
    { start: 136.24, end: DUR, lines: [[136.24, DUR, '先问：这是哪一段时间']] }
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
    const size = s.length > 22 ? 46 : s.length > 16 ? 52 : s.length > 13 ? 58 : 64;
    const shown = s.length > 18 ? s.replace('，', '，\n') : s;
    M.text(g, shown, 540, shown.includes('\n') ? 176 : 194, { size, weight: 850, display: true, color: warn ? T.coralDark : T.ink });
    g.restore();
  }
  function worldToScreen(p, cam) {
    return { x: 540 + (p.x - cam.x) * cam.zoom, y: 720 + (p.y - cam.y) * cam.zoom };
  }
  function note(g, t, spec, cam) {
    if (t < spec.start || t >= spec.end) return;
    const target = worldToScreen(spec.target(t), cam);
    if (target.x < -80 || target.x > 1160 || target.y < 300 || target.y > 1220) return;
    const a = E.outCubic(u.seg(t, spec.start, .22)) * (1 - u.seg(t, spec.end - .18, .18));
    g.save(); g.font = `600 44px ${T.font}`;
    const w = g.measureText(spec.text).width + 48;
    const x = u.clamp(target.x + (spec.dx || 0), 72 + w / 2, 1008 - w / 2);
    const desiredY = target.y + (spec.dy || (target.y > 790 ? -155 : 155));
    const y = u.clamp(desiredY, 390, 1160);
    // 目标点脉冲圈：先垫一圈纸色，保证落在深色物体上也看得见
    const rr0 = 17 + 4 * Math.sin(t * 4.2);
    g.globalAlpha = a * .7;
    g.beginPath(); g.arc(target.x, target.y, rr0, 0, 7);
    g.lineWidth = 9; g.strokeStyle = 'rgba(255,252,245,.8)'; g.stroke();
    g.globalAlpha = a * .85;
    g.lineWidth = 4.5; g.strokeStyle = spec.color || T.tealDark; g.stroke();
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
    if (t < C.flood) M.text(g, t < C.mealTone ? '从第一口计时' : '两小时到点', 0, 96, { size: 38, weight: 750, role: 'object' }); g.restore();
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
    M.text(g, '10 个里有 3 个粘着糖', x + 210, y + 285, { size: 40, weight: 800, color: T.coralDark, role: 'object' }); g.restore();
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
    if (t >= C.early) { M.text(g, '早上这一次', x0 + 34, y0 + 16, { size: 44, weight: 700, color: T.tealDark, role: 'object', align: 'left' });
      M.text(g, '这顿饭之后', x0 + 34, y0 - 240, { size: 44, weight: 700, color: T.coralDark, role: 'object', align: 'left' }); }
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
    rows.forEach((r, i) => { const yy = -160 + i * 168; const on = i === 0 ? t >= C.fastingShot : i === 1 ? t >= C.postHigh : t >= C.line65;
      g.save(); g.globalAlpha = big ? (on ? 1 : .72) : .9;
      M.text(g, r[0], 0, yy, { size: 44, weight: 700, color: T.ink, role: 'object' });
      M.text(g, r[1] + ' ' + r[2], 0, yy + 62, { size: 52, weight: 850, color: r[3], role: 'object' });
      g.restore();
      M.line(g, -200, yy + 100, 200, yy + 100, { w: 2, color: T.paperShadow }); }); g.restore();
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
  const P = (x, y) => () => ({ x, y });
  const NOTE_SPECS = [
      { start: B(8), end: B(12), text: '葡萄糖', target: P(840, TUBE_Y), dy: -180 },
      { start: B(24), end: B(28), text: '单位 mmol/L', target: P(600, TUBE_Y - 60), dy: -190 },
      { start: B(32), end: B(36), text: '单位 mmol/L', target: P(780, 430), dy: -170 },
      { start: B(48), end: B(52), text: '血红蛋白：运氧气的蛋白', target: P(1800, 470), color: T.coralDark, dy: -170 },
      { start: B(80), end: B(84), text: '6.1–不足 7.0：前期', target: P(3560, 560), dy: -300 },
      { start: B(88), end: B(92), text: '7.8–不足 11.1：前期', target: P(3720, 560), dy: -300 },
      { start: B(96), end: B(100), text: '6.5%：诊断标准之一', target: P(3800, 560), dy: -300 },
      { start: B(120), end: B(124), text: '糖耐量：喝定量糖水后按点测', target: P(5470, 800), dy: 190 }
  ];

  // 名牌窗口对齐到所属那一拍：整拍都在讲同一个东西，字幕与图形始终有指向关系
  NOTE_SPECS.forEach(sp => {
    const b = beats.find(x => sp.start >= x.start - .02 && sp.start < x.end);
    if (b) { sp.start = b.start; sp.end = b.end; }
  });

  function notes(g, t, cam) {
    const ot = toOld(t);
    NOTE_SPECS.forEach(spec => note(g, ot, spec, cam));
  }
  function compareCard(g, x0, y0, t) {
    const a = E.outCubic(u.seg(t, C.duties, .5));
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = a;
    M.rr(g, x0, y0, 500, 572, 26); g.fillStyle = T.paperLight; g.fill(); g.lineWidth = 7; g.strokeStyle = T.ink; g.stroke();
    M.text(g, '三个数各管一段', x0 + 250, y0 + 66, { size: 54, weight: 900, align: 'center' });
    const rows = [
      ['空腹血糖', '一次', '空腹 8 小时后', T.tealDark],
      ['餐后血糖', '一次', '从这顿饭算起', T.amber],
      ['糖化血红蛋白', '平均', '近 2–3 个月', T.coralDark]
    ];
    rows.forEach((r, i) => {
      const ra = E.outCubic(u.seg(t, C.duties + .7 + i * .8, .45));
      if (ra <= 0) return;
      g.save(); g.globalAlpha = a * ra;
      const y = y0 + 126 + i * 146;
      M.rr(g, x0 + 18, y, 464, 138, 16); g.fillStyle = T.paperLight; g.fill(); g.lineWidth = 3; g.strokeStyle = T.paperShadow; g.stroke();
      M.text(g, r[0], x0 + 40, y + 50, { size: 46, weight: 850, align: 'left' });
      M.text(g, r[2], x0 + 40, y + 118, { size: 44, weight: 600, align: 'left', color: T.inkSoft });
      M.rr(g, x0 + 330, y + 34, 118, 56, 28); g.fillStyle = r[3]; g.fill();
      M.text(g, r[1], x0 + 389, y + 74, { size: 44, weight: 800, align: 'center', color: r[3] === T.amber ? T.ink : '#FFFCF5' });
      g.restore();
    });
    g.restore();
  }
  function captionLink(g, t, cam) {
    const beat = beats.find(x => t >= x.start && t < x.end);
    if (!beat) return;
    const line = beat.lines.find(x => t >= x[0] && t < x[1]);
    if (!line) return;
    const ot = toOld(t);
    const spec = NOTE_SPECS.find(s2 => ot >= s2.start && ot < s2.end);
    if (!spec) return;
    const target = worldToScreen(spec.target(t), cam);
    if (target.y < 340 || target.y > 1130) return;
    const a = E.outCubic(u.seg(t, line[0], .24)) * (1 - u.seg(t, line[1] - .18, .18));
    if (a <= .02) return;
    g.save(); g.font = `600 44px ${T.font}`;
    const w = g.measureText(spec.text).width + 48;
    const x = u.clamp(target.x + (spec.dx || 0), 72 + w / 2, 1008 - w / 2);
    const y = u.clamp(target.y + (spec.dy || (target.y > 790 ? -155 : 155)), 390, 1160);
    const sy = 234, sx = 540;
    const cardTop = y - 34;
    const toTarget = target.y < cardTop - 8 && Math.abs(target.x - sx) < 300;
    const ex = toTarget ? target.x : u.clamp(sx, x - w / 2 - 6, x + w / 2 + 6);
    const ey = toTarget ? target.y - 30 : cardTop;
    if (ey > sy + 24) {
      g.globalAlpha = a * .85;
      g.setLineDash([12, 10]); g.lineCap = 'round';
      g.lineWidth = 3.5; g.strokeStyle = T.inkSoft;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
    }
    g.restore();
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
    M.text(g, '它们问的不是同一件事', 540, 1260, { size: 44, weight: 650, color: T.inkSoft });
  }
  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]); g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), C.follow - B(142))); M.avatar(g, 540, 486, 112);
    M.text(g, '下次拿到报告', 540, 712, { size: 80, weight: 900, display: true }); M.text(g, '先问这是哪一段时间', 540, 812, { size: 58, weight: 800, display: true });
    M.text(g, '空腹、这顿饭、近两三个月', 540, 960, { size: 52, weight: 750, color: T.tealDark }); M.text(g, '拿不准，三个数交给医生', 540, 1046, { size: 52, weight: 750, color: T.amber });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4)); M.text(g, '关注「医学科普漫画」', 540, 1170, { size: 48, weight: 750 });
    M.text(g, '下期：血压里的两个数字在说什么', 540, 1250, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1340, { size: 36, role: 'disclaimer', color: T.gray }); g.restore(); g.restore();
  }
  tl.add(0, DUR, (g, p, t) => {
    const ot = toOld(t);
    if (t < toNew(C.open)) { cover(g); return; }
    if (t < toNew(C.pullBack)) { const cam = camera(ot); g.save(); g.beginPath(); g.rect(0, 330, 1080, 810); g.clip(); M.withCamera(g, cam, gg => world(gg, ot, cam)); g.restore(); brand(g); caption(g, t); captionLink(g, t, cam); notes(g, t, cam); if (ot >= C.duties && ot < BAR(19)) compareCard(g, 60, 424, ot); }
    ending(g, ot);
  });
  M.mount(tl);
})();
