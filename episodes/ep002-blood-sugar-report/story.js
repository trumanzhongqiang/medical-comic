/* 第 2 期重做：一张报告单上的三个数字，对应同一条曲线上的三段时间。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: B(0), fasting: BAR(2), fastingWin: B(9), fastingShot: B(12),
    meal: BAR(4), mealTone: B(18), flood: B(27), peak: B(30),
    hba1c: BAR(9), stick: B(36), time120: B(40), months: BAR(11), monthsCard: B(45),
    duties: BAR(13), line61: BAR(15), fastingHigh: B(64), line78: BAR(17), postHigh: B(73),
    line65: BAR(19), interference: B(80), twice: BAR(21), retest: B(88),
    mismatch: BAR(23), early: B(100), firstPhase: BAR(26), slow: B(112),
    plan: BAR(29), walk: B(120), engage: BAR(31), care: B(128), checkup: B(132),
    pullBack: BAR(35), follow: B(144)
  };
  M.loadPlate('../../brand/avatar.jpg');

  const beats = [
    { start: 0, end: BAR(2), lines: [[0, B(4), '血糖报告上的三个数字'], [B(4), BAR(2), '看的不是同一个时刻']] },
    { start: BAR(2), end: BAR(4), lines: [[BAR(2), B(12), '空腹：一夜没吃东西'], [B(12), BAR(4), '血里的糖是基础量']] },
    { start: BAR(4), end: B(26), lines: [[BAR(4), B(22), '一碗饭下肚'], [B(22), B(26), '糖开始进入血液']] },
    { start: B(26), end: BAR(9), lines: [[B(26), B(32), '血糖升上去'], [B(32), BAR(9), '胰岛素同时出动']] },
    { start: BAR(9), end: BAR(11), lines: [[BAR(9), B(40), '多出来的糖会粘上去'], [B(40), BAR(11), '粘在红细胞的血红蛋白上']] },
    { start: BAR(11), end: BAR(13), lines: [[BAR(11), B(48), '红细胞大约活 120 天'], [B(48), BAR(13), '糖化是两三个月的平均分']] },
    { start: BAR(13), end: BAR(15), lines: [[BAR(13), B(56), '三个数，各管一段'], [B(56), BAR(15), '空腹看基础，餐后看应变']] },
    { start: BAR(15), end: BAR(17), lines: [[BAR(15), B(64), '空腹低于 6.1 是正常'], [B(64), BAR(17), '6.1 到 7.0 之间是前期']] },
    { start: BAR(17), end: BAR(19), lines: [[BAR(17), B(72), '餐后两小时，从第一口饭算'], [B(72), BAR(19), '7.8 以上就要留意']] },
    { start: BAR(19), end: BAR(21), lines: [[BAR(19), B(80), '糖化 6.5 以上要查'], [B(80), BAR(21), '贫血、失血会让它不准']] },
    { start: BAR(21), end: BAR(23), lines: [[BAR(21), B(88), '没有明显症状时'], [B(88), BAR(23), '一次超标不能直接定论']] },
    { start: BAR(23), end: BAR(26), lines: [[BAR(23), B(96), '三个数经常不一致'], [B(96), BAR(26), '空腹正常，餐后已经偏高']] },
    { start: BAR(26), end: BAR(29), lines: [[BAR(26), B(110), '进餐后第一波胰岛素'], [B(110), BAR(29), '来得慢，峰值就更高']] },
    { start: BAR(29), end: BAR(31), lines: [[BAR(29), B(120), '拿不准时做糖耐量试验'], [B(120), BAR(31), '同一段时间，多个点都测']] },
    { start: BAR(31), end: BAR(35), lines: [[BAR(31), B(128), '主食换粗，搭配蔬菜蛋白'], [B(128), B(132), '每周动起来，体重往下降'], [B(132), BAR(35), '用药按医嘱，复查别中断']] },
    { start: BAR(35), end: DUR, lines: [[BAR(35), B(144), '一个数说明不了全部'], [B(144), DUR, '三个一起看，才对得上时间']] }
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
    const warn = s.indexOf('偏高') >= 0 || s.indexOf('要查') >= 0 || s.indexOf('留意') >= 0 || s.indexOf('不准') >= 0 || s.indexOf('不能') >= 0;
    g.save(); g.globalAlpha = enter * leave; g.translate(0, (1 - enter) * 12);
    M.text(g, s, 540, 194, { size: 64, weight: 850, display: true, color: warn ? T.coralDark : T.ink });
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

  /* ---------- 世界：同一条血管贯穿全片 ---------- */
  const TUBE_Y = 736, TUBE_H = 150;
  function fillStroke(g, fill, width, stroke) {
    g.fillStyle = fill; g.fill(); g.lineWidth = width || 5; g.strokeStyle = stroke || T.ink; g.stroke();
  }
  function vesselBand(g, x0, x1) {
    g.save();
    const grad = g.createLinearGradient(0, TUBE_Y - TUBE_H / 2, 0, TUBE_Y + TUBE_H / 2);
    grad.addColorStop(0, '#F0B8AC'); grad.addColorStop(.24, '#F9DCCF'); grad.addColorStop(.76, '#F6D3C7'); grad.addColorStop(1, '#DFA093');
    M.rr(g, x0, TUBE_Y - TUBE_H / 2, x1 - x0, TUBE_H, TUBE_H / 2);
    g.fillStyle = grad; g.fill();
    g.lineWidth = 16; g.strokeStyle = T.ink; g.stroke();
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,252,245,.6)';
    M.rr(g, x0 + 14, TUBE_Y - TUBE_H / 2 + 14, x1 - x0 - 28, TUBE_H - 28, TUBE_H / 2 - 14); g.stroke();
    g.restore();
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
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.fillStyle = T.ink; g.beginPath(); g.arc(-r * .22, 0, r * .07, 0, 7); g.arc(r * .22, 0, r * .07, 0, 7); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = T.ink; g.beginPath(); g.arc(0, r * .16, r * .18, .15, Math.PI - .15); g.stroke(); g.restore();
  }

  /* 一天里的曲线 */
  const DAY = [[200, 546], [700, 542], [900, 500], [1060, 412], [1240, 388], [1420, 452], [1700, 512], [2100, 522]];
  function curvePoints(pts, p) {
    if (p >= 1) return pts;
    const total = pts.length - 1, f = p * total, k = Math.min(Math.floor(f), total - 1), r = f - k;
    const a = pts[k], b = pts[k + 1];
    return pts.slice(0, k + 1).concat([[u.lerp(a[0], b[0], r), u.lerp(a[1], b[1], r)]]);
  }
  function polyline(g, pts, o) {
    if (pts.length < 2) return;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = o.color || T.tealDark; g.lineWidth = o.w || 8;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
    g.fillStyle = o.color || T.tealDark;
    const e = pts[pts.length - 1];
    g.beginPath(); g.arc(e[0], e[1], 11, 0, 7); g.fill();
    g.lineWidth = 3; g.strokeStyle = T.white; g.stroke();
    g.restore();
  }
  function curveReveal(t) {
    if (t < C.mealTone) return 0;
    return E.inOutCubic(u.seg(t, C.mealTone, BAR(9) - C.mealTone));
  }
  function dayWorld(g, t) {
    const p = curveReveal(t);
    if (p > 0) polyline(g, curvePoints(DAY, p), { color: T.tealDark, w: 8 });
    if (t >= C.mealTone && t < BAR(9)) {
      M.line(g, 700, 330, 700, TUBE_Y - 70, { w: 4, color: T.inkSoft, dash: [10, 12] });

    }
    if (t >= C.peak) {
      g.save(); g.globalAlpha = E.outCubic(u.seg(t, C.peak, .4));
      g.fillStyle = T.coral; g.beginPath(); g.arc(1240, 388, 15, 0, 7); g.fill();
      g.lineWidth = 3; g.strokeStyle = T.white; g.stroke(); g.restore();
    }
  }
  function plate(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 118, 180, 34, .16);
    g.beginPath(); g.arc(0, 0, 150, 0, 7); fillStroke(g, T.paperLight, 8);
    g.save(); g.beginPath(); g.arc(0, 0, 122, 0, 7); g.clip();
    g.fillStyle = T.amberLight; g.fillRect(-130, -130, 260, 130);
    g.fillStyle = T.tealLight; g.fillRect(-130, 0, 130, 130);
    g.fillStyle = T.coralLight; g.fillRect(0, 0, 130, 130);
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-92 + (i % 3) * 46, -46 + Math.floor(i / 3) * 34, 20, 9, .3, 0, 7); g.fillStyle = T.paperLight; g.fill(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-86 + (i % 3) * 44, 46 + Math.floor(i / 3) * 36, 17, 0, 7); g.fillStyle = i % 2 ? T.teal : '#78A96F'; g.fill(); }
    for (let i = 0; i < 4; i++) { M.rr(g, 22 + (i % 2) * 48, 28 + Math.floor(i / 2) * 40, 40, 24, 8); g.fillStyle = '#D99B80'; g.fill(); }
    g.restore(); g.restore();
  }
  function bowl(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 86, 130, 26, .14);
    g.beginPath(); g.moveTo(-118, 0); g.quadraticCurveTo(-96, 104, 0, 112); g.quadraticCurveTo(96, 104, 118, 0); g.closePath(); fillStroke(g, T.paperLight, 6);
    g.beginPath(); g.ellipse(0, 0, 120, 40, 0, 0, 7); fillStroke(g, '#F2D7A0', 6);
    const r = M.rng(17); g.strokeStyle = '#C79B63'; g.lineWidth = 3;
    for (let i = 0; i < 34; i++) { const px = (r() - .5) * 190, py = (r() - .5) * 44; g.beginPath(); g.ellipse(px, py, 8, 2.5, r() * 3, 0, 7); g.stroke(); }
    g.restore();
  }

  /* 红细胞区：糖粘到血红蛋白上 */
  function hemoglobin(g, x, y, s, a) {
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a == null ? 1 : a;
    for (let i = 0; i < 4; i++) {
      const px = (i % 2 ? 1 : -1) * 16, py = (i < 2 ? -1 : 1) * 15;
      g.beginPath(); g.arc(px, py, 13, 0, 7); fillStroke(g, T.coral, 3, T.coralDark);
    }
    g.restore();
  }
  function glycated(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    M.rbc(g, 0, 0, 62, { squash: .84 });
    hemoglobin(g, -6, 4, .72, 1);
    glucose(g, 34, -30, 15, .4, false);
    g.restore();
  }
  function monthsBar(g, x0, x1, y, t) {
    const grow = E.inOutCubic(u.seg(t, C.time120, 1.6));
    if (grow <= 0) return;
    g.save();
    M.rr(g, x0, y - 64, (x1 - x0) * grow, 128, 26); fillStroke(g, T.paperLight, 5);
    for (let i = 0; i < 6; i++) {
      const cx = x0 + 90 + i * ((x1 - x0 - 180) / 5);
      if (cx > x0 + (x1 - x0) * grow - 60) continue;
      g.save(); g.globalAlpha = i % 2 ? .55 : .9;
      M.rbc(g, cx, y - 4, 26, { squash: .85 });
      if (i % 2 === 0) glucose(g, cx + 24, y - 26, 11, 0, false);
      g.restore();
    }
    g.restore();
  }

  function rail(g, x0, x1, y, o) {
    const span = x1 - x0, xat = v => x0 + span * u.clamp(v / o.vmax, 0, 1);
    g.save();
    M.rr(g, x0, y - 22, span, 44, 22); g.fillStyle = T.paperShadow; g.fill();
    let cursor = x0;
    o.zones.forEach(z => {
      const xe = xat(z.v);
      M.rr(g, cursor + 3, y - 18, Math.max(xe - cursor - 6, 6), 36, 18);
      g.fillStyle = z.color; g.fill();
      cursor = xe;
    });
    M.rr(g, x0, y - 22, span, 44, 22); g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    o.ticks.forEach((tk, i) => {
      const x = xat(tk.v), up = i % 2 === 1;
      M.line(g, x, up ? y - 26 : y + 26, x, up ? y - 46 : y + 46, { w: 4, color: T.ink });
      M.text(g, tk.text, x, up ? y - 86 : y + 86, { size: 44, weight: 700, color: T.ink, role: 'object' });
    });
    if (o.reveal > 0) {
      const mx = u.lerp(x0 - 40, xat(o.marker), o.reveal);
      g.save(); g.globalAlpha = Math.min(1, o.reveal * 2.2);
      g.fillStyle = o.markerColor || T.ink;
      g.beginPath(); g.moveTo(mx, y - 30); g.lineTo(mx - 17, y - 64); g.lineTo(mx + 17, y - 64); g.closePath(); g.fill();
      g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke(); g.restore();
    }
    g.restore();
  }

  const FLAT = [[0, 470], [80, 466], [150, 452], [230, 470], [340, 478], [420, 480]];
  const SPIKE = [[0, 470], [70, 462], [140, 344], [200, 316], [280, 400], [360, 462], [420, 478]];
  function compareCurves(g, x0, y0, t) {
    const mp = pts => pts.map(q => [x0 + q[0] * 2.1, y0 + (q[1] - 470) * 2.1]);
    const p1 = E.outCubic(u.seg(t, C.mismatch + .2, 1.4));
    polyline(g, curvePoints(mp(FLAT), p1), { color: T.tealDark, w: 9 });
    const p2 = E.outCubic(u.seg(t, C.mismatch + .8, 1.6));
    polyline(g, curvePoints(mp(SPIKE), p2), { color: T.coralDark, w: 9 });
    if (p2 > .9) {
      g.save(); g.globalAlpha = E.outCubic(u.seg(t, C.early, .5));
      M.text(g, '空腹正常', x0 + 34, y0 + 16, { size: 44, weight: 700, color: T.tealDark, role: 'object', align: 'left' });
      M.text(g, '餐后更高', x0 + 34, y0 - 240, { size: 44, weight: 700, color: T.coralDark, role: 'object', align: 'left' });
      g.restore();
    }
  }

  function pancreasMini(g, x, y) {
    g.save(); g.translate(x, y);
    M.softShadow(g, 0, 96, 190, 30, .14);
    g.beginPath(); g.moveTo(-170, -26); g.bezierCurveTo(-130, -74, -48, -74, 26, -46);
    g.bezierCurveTo(96, -78, 174, -50, 170, 12); g.bezierCurveTo(170, 76, 108, 84, 52, 50);
    g.bezierCurveTo(-26, 82, -104, 54, -159, 26); g.quadraticCurveTo(-185, 4, -170, -26); g.closePath();
    fillStroke(g, '#EDB6A1', 7);
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-10 + i * 7, 6 + (i % 2) * 10, 9, 0, 7); fillStroke(g, T.tealLight, 3, T.tealDark); }
    g.restore();
  }
  function insulinDrops(g, x, y, t) {
    for (let i = 0; i < 4; i++) {
      const p = ((t * .42 + i * .25) % 1);
      const a = p < .15 ? p / .15 : p > .85 ? (1 - p) / .15 : 1;
      g.save(); g.globalAlpha = a * .95;
      M.insulin(g, x + 26 + i * 34, y - 30 - p * 130, { scale: .52, angle: -.2 });
      g.restore();
    }
  }
  function glucoseCup(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 92, 96, 24, .14);
    g.beginPath(); g.moveTo(-62, -78); g.lineTo(62, -78); g.lineTo(48, 96); g.quadraticCurveTo(0, 112, -48, 96); g.closePath(); fillStroke(g, '#F6E3C8', 6);
    g.beginPath(); g.moveTo(-58, -60); g.lineTo(58, -60); g.lineTo(46, 66); g.quadraticCurveTo(0, 80, -46, 66); g.closePath(); g.fillStyle = '#EFC061'; g.fill();
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-26 + i * 26, -36 + i * 22, 12, 0, 7); g.fillStyle = T.amber; g.fill(); }
    M.line(g, 34, -80, 66, -150, { w: 10, color: T.coral }); g.restore();
  }
  function stepPath(g, x, y, t) {
    for (let i = 0; i < 4; i++) {
      g.save(); g.globalAlpha = .35 + .4 * Math.max(0, Math.sin(t * 3 - i * .6));
      M.rr(g, x + i * 78, y - (i % 2) * 10, 58, 22, 11); g.fillStyle = T.inkSoft; g.fill();
      g.restore();
    }
  }
  function pillBox(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 58, 80, 20, .14);
    M.rr(g, -70, -52, 140, 104, 14); fillStroke(g, T.paperLight, 6);
    M.rr(g, -70, -52, 140, 42, 14); fillStroke(g, '#DCE8E4', 5, T.tealDark);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-34 + i * 34, 20, 15, 0, 7); fillStroke(g, i % 2 ? T.amberLight : T.tealLight, 3); }
    g.restore();
  }
  function calendar(g, x, y, t) {
    g.save(); g.translate(x, y); g.rotate(.04);
    M.paperPanel(g, -84, -78, 168, 156, { radius: 14 });
    M.rr(g, -84, -78, 168, 40, 12); g.fillStyle = T.coral; g.fill();
    M.text(g, '复查', 0, -58, { size: 34, weight: 700, color: T.white, role: 'object' });
    for (let i = 0; i < 4; i++) M.line(g, -56, -8 + i * 22, 56, -8 + i * 22, { w: 3, color: T.paperShadow });
    if (t >= C.checkup) {
      g.save(); g.globalAlpha = u.seg(t, C.checkup, .5); g.strokeStyle = T.coralDark; g.lineWidth = 6;
      g.beginPath(); g.arc(12, 30, 26, 0, 7); g.stroke(); g.restore();
    }
    g.restore();
  }
  function reportCard(g, x, y, t, big) {
    const rows = [['空腹血糖', '5.6', T.tealDark], ['餐后 2 小时', '7.4', T.amber], ['糖化', '5.8', T.tealDark]];
    g.save(); g.translate(x, y); g.rotate(-.02);
    M.softShadow(g, 0, 200, 280, 48, .16);
    M.paperPanel(g, -240, -290, 480, 580, { radius: 22 });
    M.text(g, '体检报告 · 血糖', 0, -250, { size: 44, weight: 800, color: T.ink });
    M.text(g, '单位 mmol/L', 0, -190, { size: 34, weight: 600, color: T.inkSoft, role: 'object' });
    M.line(g, -190, -168, 190, -168, { w: 3, color: T.inkSoft });
    rows.forEach((r, i) => {
      const yy = -92 + i * 120;
      const on = i === 0 ? t >= C.fastingShot : i === 1 ? t >= C.postHigh : t >= C.line65;
      g.save(); g.globalAlpha = big ? (on ? 1 : .35) : .85;
      M.text(g, r[0], -196, yy, { size: 44, weight: 700, align: 'left', color: T.ink });
      M.text(g, r[1], 186, yy, { size: 56, weight: 850, align: 'right', color: r[2], role: 'object' });
      g.restore();
      M.line(g, -196, yy + 56, 196, yy + 56, { w: 2, color: T.paperShadow });
    });
    g.restore();
  }

  /* ---------- 三个窗口：把曲线分成三段时间 ---------- */
  const DUTY = [[0, 486], [120, 482], [190, 440], [250, 396], [320, 430], [400, 470], [470, 476]];
  function dutyCurve(g, x0, y0, t) {
    const mp = pts => pts.map(q => [x0 + q[0] * 1.1, y0 + (q[1] - 470) * 1.35]);
    const p = E.outCubic(u.seg(t, C.duties, 1.2));
    polyline(g, curvePoints(mp(DUTY), p), { color: T.tealDark, w: 8 });
    const wins = [
      { x: 8, w: 74, color: T.tealDark, t0: C.duties + .1 },
      { x: 214, w: 66, color: T.amber, t0: C.duties + .5 },
      { x: 10, w: 424, color: T.violet, t0: C.duties + .9 }
    ];
    wins.forEach((w, i) => {
      const a = E.outCubic(u.seg(t, w.t0, .5));
      if (a <= 0) return;
      g.save(); g.globalAlpha = a * (i === 2 ? .8 : .95);
      g.lineWidth = 6; g.strokeStyle = w.color; g.setLineDash(i === 2 ? [12, 10] : []);
      M.rr(g, x0 + w.x * 1.1, y0 - 118, w.w * 1.1, 150, 16); g.stroke();
      g.restore();
    });
  }

  /* 复查：两张单子叠在一起 */
  function retestSheet(g, x, y, t) {
    g.save(); g.translate(x, y);
    M.softShadow(g, 0, 170, 230, 40, .14);
    g.rotate(.05); M.paperPanel(g, -190, -220, 380, 440, { radius: 18 });
    g.rotate(-.1);
    const a = E.outCubic(u.seg(t, C.twice + .1, .6));
    g.globalAlpha = .4 + .6 * a;
    M.paperPanel(g, -190, -220, 380, 440, { radius: 18 });
    g.globalAlpha = 1;
    M.text(g, '复查', -110, -176, { size: 44, weight: 800, align: 'left', color: T.ink });
    M.line(g, -150, -140, 150, -140, { w: 3, color: T.inkSoft });
    for (let i = 0; i < 3; i++) {
      M.text(g, ['空腹', '餐后 2 小时', '糖化'][i], -150, -86 + i * 96, { size: 40, weight: 700, align: 'left', color: T.ink, role: 'object' });
      M.line(g, 20, -62 + i * 96, 150, -62 + i * 96, { w: 3, color: T.paperShadow });
    }
    const k = E.outCubic(u.seg(t, C.retest, .6));
    if (k > 0) {
      g.save(); g.globalAlpha = k; g.fillStyle = T.amber;
      M.text(g, '再测一次', 0, 176, { size: 44, weight: 800, color: T.coralDark });
      g.restore();
    }
    g.restore();
  }

  /* 空间布局：hook 420 → 结束 6400 */
  const SEC = {
    hook: 430, fasting: 640, meal: 720, rise: 1080, hba1c: 1800, months: 2280,
    duties: 2900, rails: 3620, twice: 4240, compare: 4680, pancreas: 5120,
    cup: 5470, manage: 5940, report: 6360
  };

  function heroX(t) {
    const K = [
      [0, 840], [BAR(2), 860], [BAR(4), 830], [B(27), 830], [BAR(9), 1140],
      [BAR(9) + .8, 1770], [BAR(11), 1880], [C.time120, 2120], [BAR(13), 2180],
      [BAR(13) + 1.2, 2760], [BAR(15), 3000], [BAR(17), 3540], [BAR(19), 3760],
      [BAR(21), 3980], [BAR(23), 4200], [C.mismatch + 2, 4620], [BAR(26), 5050],
      [BAR(29), 5400], [BAR(31), 5860], [BAR(35), 6200], [DUR, 6220]
    ];
    for (let i = 0; i < K.length - 1; i++) {
      const a = K[i], b = K[i + 1];
      if (t < b[0]) return u.lerp(a[1], b[1], E.inOutCubic(u.seg(t, a[0], Math.max(b[0] - a[0], .01))));
    }
    return K[K.length - 1][1];
  }
  function heroY(t) {
    if (t >= C.hba1c && t < BAR(13)) return 470 + Math.sin(t * 1.6) * 12;
    return TUBE_Y + Math.sin(t * 1.9) * 14;
  }
  function heroScale(t) {
    if (t >= C.hba1c && t < BAR(11)) return 26;
    return 32;
  }

  function camera(t) {
    return M.cameraAt(t, [
      [0, 620, 650, 1], [BAR(2), 640, 660, 1.02], [BAR(4), 800, 700, 1.05],
      [B(27), 1050, 700, 1.1], [BAR(9), 1250, 640, 1.1], [C.stick, 1800, 620, 1.16],
      [BAR(11), 1900, 640, 1.12], [C.time120, 2280, 660, 1.06], [BAR(13) - .5, 2300, 640, 1.06],
      [BAR(13), 2900, 600, 1.04], [BAR(15) - .4, 2920, 600, 1.04], [BAR(15), 3600, 690, 1.12],
      [BAR(21) - .5, 3600, 690, 1.1], [BAR(21), 4160, 640, 1.06], [BAR(23), 4400, 640, 1.05],
      [C.mismatch + 2, 4700, 620, 1.06], [BAR(26), 5140, 660, 1.08], [BAR(29), 5460, 700, 1.06],
      [BAR(31), 5920, 720, 1.04], [BAR(35), 6300, 700, 1.02], [DUR, 6320, 700, 1]
    ]);
  }

  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: B(4), end: BAR(2), text: '血糖报告：三个指标看三段时间', target: P(430, 980), dy: 160 },
      { start: B(9), end: B(13), text: '空腹血糖：禁食 8 小时以上', target: P(560, TUBE_Y - 60), dy: -190 },
      { start: B(17), end: B(21), text: '餐盘：主食消化成葡萄糖', target: P(760, 900), dy: 190 },
      { start: B(28), end: B(32), text: '血糖曲线：一天里的起伏', target: P(1240, 388), dy: -150 },
      { start: B(37), end: B(41), text: '血红蛋白：糖粘上就跟着走', target: P(1800, 470), color: T.coralDark, dy: -170 },
      { start: B(45), end: B(49), text: '糖化血红蛋白：两三个月的平均', target: P(2280, 400), dy: -180 },
      { start: B(53), end: B(57), text: '三个窗口：起点、峰值、整条曲线', target: P(2880, 470), dy: -250 },
      { start: B(61), end: B(65), text: '空腹：6.1 正常上限，7.0 要查', target: P(3560, 560), dy: -300 },
      { start: B(69), end: B(73), text: '餐后两小时：从第一口饭算起', target: P(3720, 560), dy: -300 },
      { start: B(77), end: B(81), text: '糖化：6.5 要查，也会被带偏', target: P(3800, 560), dy: -300 },
      { start: B(85), end: B(89), text: '复查：两次达标或做糖耐量', target: P(4240, 660), dy: -240 },
      { start: B(93), end: B(97), text: '餐后曲线：空腹平，餐后尖', target: P(4700, 330), dy: -160 },
      { start: B(105), end: B(109), text: '第一时相：餐后最早的胰岛素', target: P(5120, 690), dy: -220 },
      { start: B(117), end: B(121), text: '糖耐量试验：喝糖水后分点测', target: P(5470, 880), dy: 190 },
      { start: B(133), end: B(137), text: '餐盘：主食适量，菜和蛋白占一半', target: P(5900, 900), dy: 200 }
    ];
    specs.forEach(spec => note(g, t, spec, cam));
  }

  function inView(cam, x0, x1) {
    const half = 540 / cam.zoom;
    return x0 > cam.x - half + 40 && x1 < cam.x + half - 40;
  }

  function world(g, t, cam) {
    vesselBand(g, -40, 6600);
    redCells(g, 120, 2900, t);
    dayWorld(g, t);
    if (t >= C.meal - .2 && t < BAR(9)) { plate(g, 760, 930); bowl(g, 570, 900); }
    if (t >= C.hba1c - .3 && inView(cam, 1700, 1900)) {
      g.save(); g.globalAlpha = E.outCubic(u.seg(t, C.hba1c, .5));
      glycated(g, 1800, 470, 1.15); g.restore();
    }
    if (t >= C.time120 && inView(cam, 1980, 2620)) monthsBar(g, 2020, 2600, 470, t);
    if (t >= BAR(13) - .2 && inView(cam, 2720, 3320)) dutyCurve(g, 2760, 470, t);
    if (t >= BAR(15) - .2 && inView(cam, 3300, 3940)) {
      const act = t < C.line78 ? 0 : t < C.line65 ? 1 : 2;
      const spec = [
        { vmax: 12, zones: [{ v: 6.1, color: T.tealLight }, { v: 7.0, color: T.amberLight }, { v: 12, color: T.coralLight }],
          ticks: [{ v: 6.1, text: '6.1' }, { v: 7.0, text: '7.0' }], marker: 6.5, markerColor: T.amber, cue: C.line61 },
        { vmax: 14, zones: [{ v: 7.8, color: T.tealLight }, { v: 11.1, color: T.amberLight }, { v: 14, color: T.coralLight }],
          ticks: [{ v: 7.8, text: '7.8' }, { v: 11.1, text: '11.1' }], marker: 9.4, markerColor: T.coral, cue: C.line78 },
        { vmax: 10, zones: [{ v: 6.5, color: T.tealLight }, { v: 10, color: T.coralLight }],
          ticks: [{ v: 6.5, text: '6.5' }], marker: 7.0, markerColor: T.coral, cue: C.line65 }
      ][act];
      spec.reveal = t >= spec.cue ? E.outCubic(u.seg(t, spec.cue, .6)) : 0;
      rail(g, 3340, 3900, 560, spec);
      if (act === 2 && t >= C.interference) {
        const w = Math.sin(u.seg(t, C.interference, 1.2) * Math.PI) * 26;
        g.save(); g.globalAlpha = .55; M.rbc(g, 3700 + w, 560, 22, {}); g.restore();
      }
    }
    if (t >= C.twice - .2 && inView(cam, 4060, 4420)) retestSheet(g, 4240, 660, t);
    if (t >= C.mismatch - .2 && inView(cam, 4530, 4870)) compareCurves(g, 4580, 470, t);
    if (t >= C.firstPhase - .2 && inView(cam, 4960, 5280)) {
      pancreasMini(g, 5120, 640);
      if (t >= C.slow) insulinDrops(g, 5120, 560, t);
    }
    if (t >= C.plan - .2 && inView(cam, 5360, 5580)) glucoseCup(g, 5470, 800);
    if (t >= C.engage - .2 && inView(cam, 5740, 6200)) {
      plate(g, 5820, 900); stepPath(g, 5920, 1040, t); pillBox(g, 6060, 900); calendar(g, 6130, 660, t);
    }
    if (t >= BAR(34) && inView(cam, 6060, 6620)) reportCard(g, 6360, 660, t, false);
    glucose(g, heroX(t), heroY(t), heroScale(t), t * .2, true);
    if (t < BAR(2) && inView(cam, 190, 670)) reportCard(g, 430, 700, t, true);
  }

  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]);
    g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), .8));
    M.avatar(g, 540, 486, 112);
    M.text(g, '三个数字', 540, 712, { size: 86, weight: 900, display: true });
    M.text(g, '看的是三段时间', 540, 812, { size: 64, weight: 800, display: true });
    M.text(g, '空腹看基础，餐后看应变', 540, 960, { size: 58, weight: 750, color: T.tealDark });
    M.text(g, '糖化看两三个月的平均', 540, 1046, { size: 58, weight: 750, color: T.amber });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4));
    M.text(g, '关注「医学科普漫画」', 540, 1170, { size: 48, weight: 750 });
    M.text(g, '下期：血压里的两个数字在说什么', 540, 1250, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1340, { size: 36, role: 'disclaimer', color: T.gray });
    g.restore(); g.restore();
  }

  tl.add(0, DUR, (g, p, t) => {
    if (t < C.pullBack) {
      const cam = camera(t);
      g.save(); g.beginPath(); g.rect(0, 330, 1080, 810); g.clip();
      M.withCamera(g, cam, gg => world(gg, t, cam)); g.restore();
      brand(g); caption(g, t); notes(g, t, cam);
    }
    ending(g, t);
  });
  M.mount(tl);
})();
