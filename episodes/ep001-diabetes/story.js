/* 第 1 期整体重做：同一颗葡萄糖穿过持续的身体世界。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: B(0), sugarIn: B(4), meal: B(8), digest: B(12), toBlood: B(16), travel: B(18), rbc: B(24),
    pancreasIn: B(28), insulinMade: B(32), signalArrive: B(36), receptorBind: B(40), channelMove: B(43),
    channelOpen: B(44), glucoseEnter: B(46), energy: B(48), energyConfirm: B(52), weakSignal: B(56),
    blocked: B(60), buildUp: B(64), compensate: B(68), moreInsulin: B(72), insulinHigh: B(76),
    slowDown: B(80), decompensate: B(84), immuneIn: B(92), immuneHit: B(94), insulinLow: B(96),
    quiet: B(100), test: B(104), vesselRisk: B(108), nerveRisk: B(112), walk: B(120), contract: B(122),
    exerciseUptake: B(124), sensitivity: B(128), plate: B(132), balance: B(134), care: B(136),
    pullBack: B(140), follow: B(144)
  };
  M.loadPlate('../../brand/avatar.jpg');
  const beats = [
    { start: 0, end: BAR(2), lines: [[0, C.sugarIn, '糖尿病，只是糖吃多了吗？'], [C.sugarIn, BAR(2), '关键还在身体怎样利用糖']] },
    { start: BAR(2), end: BAR(4), lines: [[BAR(2), C.digest, '米饭、面条、甜饮料'], [C.digest, BAR(4), '都可能消化成葡萄糖']] },
    { start: BAR(4), end: BAR(7), lines: [[BAR(4), B(22), '葡萄糖是细胞的燃料'], [B(22), BAR(7), '血液负责把它送过去']] },
    { start: BAR(7), end: BAR(9), lines: [[BAR(7), C.insulinMade, '胰腺制造并释放胰岛素'], [C.insulinMade, BAR(9), '它是一种传递信号的激素']] },
    { start: BAR(9), end: BAR(12), lines: [[BAR(9), C.receptorBind, '胰岛素先发出信号'], [C.receptorBind, BAR(12), '细胞再把转运通道送到膜上']] },
    { start: BAR(12), end: BAR(14), lines: [[BAR(12), C.energyConfirm, '进入细胞的葡萄糖'], [C.energyConfirm, BAR(14), '才能被利用，产生能量']] },
    { start: BAR(14), end: BAR(17), lines: [[BAR(14), C.blocked, '胰岛素抵抗：信号变弱'], [C.blocked, BAR(17), '胰岛素仍在释放，细胞响应变弱']] },
    { start: BAR(17), end: BAR(20), lines: [[BAR(17), C.moreInsulin, '早期，胰腺会加大产量'], [C.moreInsulin, BAR(20), '血里的胰岛素可能反而更高']] },
    { start: BAR(20), end: BAR(23), lines: [[BAR(20), 66.2, '长期代偿后，产能可能跟不上'], [66.2, BAR(23), '血糖就更容易持续偏高']] },
    { start: BAR(23), end: BAR(25), lines: [[BAR(23), C.insulinLow, '1 型糖尿病：β细胞被误伤'], [C.insulinLow, BAR(25), '胰岛素释放显著减少']] },
    { start: BAR(25), end: BAR(27), lines: [[BAR(25), C.test, '早期可能没有明显感觉'], [C.test, BAR(27), '不能靠症状排除糖尿病']] },
    { start: BAR(27), end: BAR(30), lines: [[BAR(27), B(114), '长期高血糖可能损伤血管和神经'], [B(114), BAR(30), '血管和神经的变化逐渐累积']] },
    { start: BAR(30), end: BAR(33), lines: [[BAR(30), B(126), '肌肉收缩也能促进葡萄糖利用'], [B(126), BAR(33), '这条通路不完全依赖胰岛素']] },
    { start: BAR(33), end: BAR(35), lines: [[BAR(33), 107, '主食适量，搭配蔬菜和蛋白质'], [107, BAR(35), '规范检测，遵医嘱用药']] }
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
    const warning = beat.start === BAR(14) || beat.start === BAR(20) || beat.start === BAR(27);
    g.save(); g.globalAlpha = enter * leave; g.translate(0, (1 - enter) * 12);
    M.text(g, line[2], 540, 194, { size: 64, weight: 850, display: true, color: warning && line === beat.lines[1] ? T.coralDark : T.ink });
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
  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: C.sugarIn, end: BAR(2), text: '葡萄糖：细胞常用的燃料', target: t => heroPosition(t) },
      { start: C.meal, end: C.digest, text: '主食：消化后成为葡萄糖', target: P(390, 570), dy: 175 },
      { start: C.digest, end: BAR(4), text: '甜饮料：糖分会快速进入血液', target: P(720, 610), dy: 175 },
      { start: BAR(4), end: BAR(5), text: '血管：把葡萄糖送往全身', target: t => heroPosition(t), dy: 160 },
      { start: C.rbc, end: BAR(7), text: '红细胞：血液里负责运送氧气', target: t => rbcPosition(t, 0), dy: -145 },
      { start: BAR(7), end: C.insulinMade, text: '胰腺：制造并释放胰岛素', target: P(2500, 1030), dy: -180 },
      { start: C.insulinMade, end: BAR(9), text: '胰岛素：通知细胞开始用葡萄糖', target: t => insulinPosition(t), color: T.tealDark },
      { start: BAR(9), end: C.receptorBind, text: '肌肉细胞：用葡萄糖产生能量', target: P(1900, 1020), dy: 230 },
      { start: C.receptorBind, end: C.channelOpen, text: '受体：接收胰岛素信号', target: P(1805, 828), color: T.tealDark, dy: -145 },
      { start: C.channelOpen, end: BAR(12), text: '转运通道：让葡萄糖穿过细胞膜', target: P(1900, 848), color: T.tealDark, dy: -150 },
      { start: BAR(12), end: C.energyConfirm, text: '线粒体：参与产生细胞可用能量', target: P(1820, 1075), dy: 180 },
      { start: BAR(14), end: C.blocked, text: '胰岛素抵抗：细胞对信号反应变弱', target: P(1805, 828), color: T.coralDark, dy: -155 },
      { start: C.blocked, end: C.buildUp, text: '葡萄糖：进入细胞变慢，留在血液里', target: t => heroPosition(t), color: T.coralDark, dy: 150 },
      { start: BAR(17), end: C.moreInsulin, text: '胰腺：暂时制造更多胰岛素', target: P(2500, 1030), dy: -180 },
      { start: BAR(20), end: C.decompensate, text: '胰岛β细胞：制造胰岛素', target: P(2500, 1030), color: T.coralDark, dy: -180 },
      { start: BAR(23), end: C.insulinLow, text: '免疫细胞：在 1 型中错误攻击β细胞', target: P(2380, 1020), color: T.violet, dy: -170 },
      { start: BAR(25), end: C.test, text: '血糖检测：异常要靠测量发现', target: P(2870, 1030), dy: 190 },
      { start: BAR(27), end: C.nerveRisk, text: '血管内皮：长期高血糖可能受损伤', target: P(3000, 700), color: T.coralDark, dy: -150 },
      { start: C.nerveRisk, end: B(116), text: '神经：长期高血糖也可能影响它', target: P(3200, 1000), color: T.coralDark, dy: 160 },
      { start: BAR(30), end: C.exerciseUptake, text: '肌肉收缩：也能促进葡萄糖进入细胞', target: P(3500, 1020), color: T.tealDark, dy: 220 },
      { start: C.exerciseUptake, end: C.sensitivity, text: '运动通路：不完全依赖胰岛素', target: P(3500, 848), color: T.tealDark, dy: -150 },
      { start: BAR(33), end: C.care, text: '均衡餐盘：主食适量，搭配蔬菜和蛋白质', target: P(4200, 900), dy: 250 },
      { start: C.care, end: BAR(35), text: '用药：遵医嘱，不自行停药或改药', target: P(4530, 1010), dy: -180 }
    ];
    specs.forEach(spec => note(g, t, spec, cam));
  }

  function fillStroke(g, fill, width, stroke) {
    g.fillStyle = fill; g.fill(); g.lineWidth = width || 5; g.strokeStyle = stroke || T.ink; g.stroke();
  }
  function sugar(g, x, y, r, rot, hero) {
    M.glucose(g, x, y, r, { rot: rot || 0, color: T.amber });
    if (!hero) return;
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.fillStyle = T.ink; g.beginPath(); g.arc(-r * .22, 0, r * .07, 0, 7); g.arc(r * .22, 0, r * .07, 0, 7); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = T.ink; g.beginPath(); g.arc(0, r * .16, r * .18, .15, Math.PI - .15); g.stroke(); g.restore();
  }
  function insulin(g, x, y, s, rot, alpha) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.globalAlpha *= alpha == null ? 1 : alpha;
    M.softShadow(g, 0, 22, 26, 10, .1);
    g.beginPath(); g.moveTo(-18, -14); g.quadraticCurveTo(0, -32, 18, -14); g.lineTo(12, 18); g.quadraticCurveTo(0, 28, -12, 18); g.closePath();
    fillStroke(g, T.teal, 4);
    g.beginPath(); g.arc(0, -6, 6, 0, 7); g.fillStyle = T.paperLight; g.fill();
    g.restore();
  }
  function insulinPosition(t) {
    if (t < C.signalArrive) {
      const p = E.inOutCubic(u.seg(t, C.insulinMade, C.signalArrive - C.insulinMade));
      return { x: u.lerp(2500, 1830, p), y: u.lerp(900, 735, p) };
    }
    const p = E.outCubic(u.seg(t, C.signalArrive, C.receptorBind - C.signalArrive));
    return { x: u.lerp(1830, 1805, p), y: u.lerp(735, 800, p) };
  }
  function rbcPosition(t, i) {
    return {
      x: 1170 + ((i * 227 + t * (20 + i % 3 * 5)) % 2900),
      y: 485 + (i % 3) * 70 + Math.sin(t * .8 + i) * 13
    };
  }
  function vessel(g, t) {
    g.save();
    const grad = g.createLinearGradient(0, 390, 0, 720);
    grad.addColorStop(0, '#F0B8AC'); grad.addColorStop(.22, '#F8D9CD'); grad.addColorStop(.75, '#F6D3C7'); grad.addColorStop(1, '#DFA093');
    M.rr(g, 1100, 390, 3100, 340, 165); g.fillStyle = grad; g.fill();
    g.lineWidth = 18; g.strokeStyle = T.ink; g.stroke();
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,252,245,.65)'; M.rr(g, 1116, 406, 3068, 308, 150); g.stroke();
    for (let i = 0; i < 24; i++) {
      const p = rbcPosition(t, i);
      M.rbc(g, p.x, p.y, 27 + i % 2 * 5, { rot: Math.sin(t + i) * .3, squash: .85 });
    }
    g.restore();
  }
  function table(g) {
    g.save(); g.fillStyle = '#E8D7BE'; g.fillRect(-250, 610, 1160, 620);
    g.fillStyle = 'rgba(255,252,245,.28)'; g.fillRect(-250, 610, 1160, 34);
    for (let i = 0; i < 12; i++) M.line(g, -200 + i * 100, 640, -130 + i * 100, 1200, { w: 2, color: 'rgba(91,67,43,.07)' });
    g.restore();
  }
  function bowl(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 105, 170, 30, .16);
    g.beginPath(); g.moveTo(-155, 0); g.quadraticCurveTo(-125, 135, 0, 145); g.quadraticCurveTo(125, 135, 155, 0); g.closePath(); fillStroke(g, T.paperLight, 7);
    g.beginPath(); g.ellipse(0, 0, 158, 54, 0, 0, 7); fillStroke(g, '#F2D7A0', 7);
    const r = M.rng(31); g.strokeStyle = '#C79B63'; g.lineWidth = 3;
    for (let i = 0; i < 45; i++) { const px = (r() - .5) * 250, py = (r() - .5) * 58; g.beginPath(); g.ellipse(px, py, 10, 3, r() * 3, 0, 7); g.stroke(); }
    g.restore();
  }
  function drink(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 130, 90, 24, .13);
    g.beginPath(); g.moveTo(-70, -80); g.lineTo(70, -80); g.lineTo(52, 120); g.quadraticCurveTo(0, 140, -52, 120); g.closePath(); fillStroke(g, '#F0C7A4', 6);
    g.beginPath(); g.moveTo(-74, -82); g.quadraticCurveTo(0, -108, 74, -82); g.lineWidth = 12; g.strokeStyle = T.paperLight; g.stroke();
    M.line(g, 28, -90, 72, -205, { w: 14, color: T.coral }); M.line(g, 31, -90, 74, -205, { w: 4, color: T.paperLight });
    g.restore();
  }
  function mitochondrion(g, x, y, s, energy) {
    g.save(); g.translate(x, y); g.scale(s, s);
    if (energy > 0) { g.shadowColor = `rgba(231,173,69,${energy * .65})`; g.shadowBlur = 28; }
    g.beginPath(); g.ellipse(0, 0, 70, 38, -.25, 0, 7); fillStroke(g, T.coralLight, 4, T.coralDark);
    g.shadowColor = 'transparent'; g.strokeStyle = T.coralDark; g.lineWidth = 3; g.beginPath();
    for (let i = -45; i <= 45; i += 15) { g.moveTo(i, -20); g.quadraticCurveTo(i + 15, 0, i, 20); } g.stroke(); g.restore();
  }
  function channel(g, open) {
    g.save(); const gap = 7 + open * 19;
    M.rr(g, -34 - gap, -26, 30, 58, 8); fillStroke(g, T.tealLight, 4, T.tealDark);
    M.rr(g, 4 + gap, -26, 30, 58, 8); fillStroke(g, T.tealLight, 4, T.tealDark); g.restore();
  }
  function receptor(g, active) {
    g.save(); g.strokeStyle = active ? T.tealDark : T.ink; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 28); g.lineTo(0, -4); g.lineTo(-20, -28); g.moveTo(0, -4); g.lineTo(20, -28); g.stroke();
    if (active) { g.fillStyle = T.teal; g.beginPath(); g.arc(0, 10, 7, 0, 7); g.fill(); }
    g.restore();
  }
  function muscle(g, x, y, s, t, exercise) {
    g.save(); g.translate(x, y); g.scale(s, s); M.softShadow(g, 0, 182, 280, 35, .14);
    const contract = exercise ? u.pulse(t, C.walk, C.contract - C.walk) : u.pulse(t, C.energyConfirm, 1.4);
    g.scale(1 - contract * .05, 1 + contract * .06);
    g.beginPath(); g.moveTo(-270, 0); g.bezierCurveTo(-255, -145, -110, -190, 0, -184); g.bezierCurveTo(150, -190, 260, -120, 270, 0); g.bezierCurveTo(250, 145, 110, 185, 0, 180); g.bezierCurveTo(-150, 190, -260, 120, -270, 0); g.closePath();
    const grad = g.createLinearGradient(0, -180, 0, 180); grad.addColorStop(0, '#F5DFC8'); grad.addColorStop(1, '#DDB99E'); fillStroke(g, grad, 8);
    g.save(); g.globalAlpha = .35; g.lineWidth = 6; g.strokeStyle = T.coralDark;
    for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(-220, i * 25); g.bezierCurveTo(-80, i * 25 - 15, 80, i * 25 + 15, 220, i * 25); g.stroke(); }
    g.restore();
    g.fillStyle = T.nucleus; g.beginPath(); g.ellipse(-175, 95, 42, 18, -.2, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke();
    mitochondrion(g, -80, 55, .75, exercise ? 1 : u.seg(t, C.energy, 2));
    mitochondrion(g, 105, 75, .65, exercise ? 1 : u.seg(t, C.energy + .6, 2));
    const resist = exercise ? 0 : M.kf(t, [[BAR(14), 0], [C.blocked, 1], [BAR(33), 1]]);
    const open = exercise ? M.kf(t, [[BAR(30), .15], [C.exerciseUptake, 1], [BAR(33), 1]]) : M.kf(t, [[BAR(9), 0], [C.channelOpen, 1], [BAR(14), 1], [C.blocked, .12], [BAR(33), .12]]);
    const cy = exercise ? -172 : M.kf(t, [[BAR(9), -60], [C.channelMove, -60], [C.channelOpen, -172], [BAR(14), -172], [C.blocked, -70], [BAR(33), -70]]);
    g.save(); g.translate(0, cy); channel(g, open); g.restore();
    g.save(); g.translate(-95, -192); receptor(g, t >= C.receptorBind && resist < .8); g.restore();
    if (t >= C.receptorBind && t < BAR(17) && !exercise) {
      g.save(); g.globalAlpha = (1 - resist * .75) * .8; g.setLineDash([8, 12]); g.strokeStyle = T.tealDark; g.lineWidth = 5;
      g.beginPath(); g.moveTo(-95, -150); g.quadraticCurveTo(-50, -90, 0, cy); g.stroke(); g.restore();
    }
    if (resist > .3) {
      g.save(); g.globalAlpha = resist; g.strokeStyle = T.coralDark; g.lineWidth = 6; g.beginPath(); g.moveTo(-130, -240); g.lineTo(-65, -180); g.moveTo(-65, -240); g.lineTo(-130, -180); g.stroke(); g.restore();
    }
    g.restore();
  }
  function pancreas(g, x, y, t) {
    g.save(); g.translate(x, y); const tired = M.kf(t, [[BAR(20), 0], [B(88), 1], [BAR(25), 1]]);
    M.softShadow(g, 0, 125, 250, 40, .16);
    g.beginPath(); g.moveTo(-230, -35); g.bezierCurveTo(-175, -95, -65, -95, 35, -60); g.bezierCurveTo(130, -100, 235, -65, 230, 15); g.bezierCurveTo(230, 100, 145, 110, 70, 65); g.bezierCurveTo(-35, 105, -140, 70, -215, 35); g.quadraticCurveTo(-250, 5, -230, -35); g.closePath();
    fillStroke(g, tired > .6 ? '#D9A18F' : '#EDB6A1', 8);
    g.save(); g.globalAlpha = .38; g.strokeStyle = T.coralDark; g.lineWidth = 3;
    for (let i = -4; i <= 4; i++) { g.beginPath(); g.arc(i * 45, Math.sin(i) * 18, 32, .2, 2.7); g.stroke(); } g.restore();
    g.beginPath(); g.moveTo(-190, 8); g.bezierCurveTo(-70, 30, 80, -5, 190, 22); g.lineWidth = 5; g.strokeStyle = T.paperLight; g.stroke();
    const betaAlpha = 1 - M.kf(t, [[C.immuneHit, 0], [C.insulinLow, .8]]);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, px = Math.cos(a) * (22 + i % 3 * 9), py = Math.sin(a) * (18 + i % 2 * 8);
      g.globalAlpha = betaAlpha; g.beginPath(); g.arc(px, py, 10, 0, 7); fillStroke(g, T.tealLight, 3, T.tealDark);
    }
    g.globalAlpha = 1;
    if (t >= BAR(17) && t < BAR(20)) {
      const fast = 1 + Math.sin(t * 8) * .05; g.scale(fast, fast);
      for (let i = 0; i < 3; i++) M.arrow(g, -80 + i * 70, -105, -80 + i * 70, -150, { w: 4, head: 15, color: T.coralDark });
    }
    g.restore();
  }
  function immune(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); M.softShadow(g, 0, 65, 65, 18, .12);
    g.beginPath();
    for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 58 + Math.sin(a * 7) * 9; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); }
    g.closePath(); fillStroke(g, '#C7B9DB', 5, T.violet);
    g.beginPath(); g.ellipse(0, 4, 27, 20, .4, 0, 7); g.fillStyle = T.violet; g.fill(); g.restore();
  }
  function meter(g, x, y, t) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 135, 125, 30, .14);
    M.rr(g, -105, -120, 210, 250, 34); fillStroke(g, T.paperLight, 7);
    M.rr(g, -72, -82, 144, 92, 14); fillStroke(g, T.tealLight, 4, T.tealDark);
    const level = E.outCubic(u.seg(t, C.test, 1.4)); g.fillStyle = T.coral; g.fillRect(-48, -16, 96 * level, -38 * level);
    g.beginPath(); g.arc(0, 66, 24, 0, 7); fillStroke(g, T.paperShadow, 4);
    M.rr(g, 80, -155, 28, 120, 8); fillStroke(g, T.paperLight, 4); g.restore();
  }
  function risk(g, t) {
    const damage = M.kf(t, [[BAR(27), 0], [B(114), 1], [BAR(30), 1]]);
    g.save(); g.globalAlpha = damage;
    for (let i = 0; i < 8; i++) { const x = 3000 + i * 62; g.beginPath(); g.moveTo(x, 718); g.lineTo(x + 20, 685 - (i % 3) * 10); g.lineTo(x + 38, 718); g.closePath(); fillStroke(g, T.coralDark, 2, T.coralDark); }
    g.restore();
    g.save(); g.strokeStyle = T.amber; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(2940, 1030); g.bezierCurveTo(3080, 930, 3220, 1100, 3400, 980); g.stroke();
    g.lineWidth = 4; g.strokeStyle = T.ink; g.stroke();
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(3000 + i * 85, 1005 + Math.sin(i) * 30, 24, 0, 7); fillStroke(g, T.amberLight, 4, T.amber); }
    const signal = (t * 1.5) % 1; g.globalAlpha = 1 - damage * .7; g.fillStyle = T.paperLight; g.beginPath(); g.arc(2960 + signal * 390, 1015 - Math.sin(signal * Math.PI * 2) * 35, 9, 0, 7); g.fill(); g.restore();
  }
  function plate(g, x, y) {
    g.save(); g.translate(x, y); M.softShadow(g, 0, 190, 250, 42, .16);
    g.beginPath(); g.arc(0, 0, 220, 0, 7); fillStroke(g, T.paperLight, 9);
    g.save(); g.beginPath(); g.arc(0, 0, 185, 0, 7); g.clip();
    g.fillStyle = T.tealLight; g.fillRect(-190, -190, 380, 190); g.fillStyle = T.amberLight; g.fillRect(-190, 0, 190, 190); g.fillStyle = T.coralLight; g.fillRect(0, 0, 190, 190);
    for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(-130 + (i % 7) * 42, -90 + Math.floor(i / 7) * 55, 22, 0, 7); g.fillStyle = i % 2 ? T.teal : '#78A96F'; g.fill(); }
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-130 + (i % 3) * 55, 55 + Math.floor(i / 3) * 43, 24, 10, .3, 0, 7); g.fillStyle = T.paperLight; g.fill(); }
    for (let i = 0; i < 6; i++) { M.rr(g, 35 + (i % 2) * 65, 45 + Math.floor(i / 2) * 45, 50, 28, 9); g.fillStyle = '#D99B80'; g.fill(); }
    g.restore(); g.restore();
  }
  function prescription(g, x, y) {
    g.save(); g.translate(x, y); g.rotate(.08); M.paperPanel(g, -105, -135, 210, 270, { radius: 16 });
    M.text(g, '+', 0, -65, { size: 72, weight: 700, color: T.coral, audit: false });
    for (let i = 0; i < 3; i++) M.line(g, -60, 5 + i * 42, 60, 5 + i * 42, { w: 5, color: T.inkSoft }); g.restore();
  }

  function heroPosition(t) {
    if (t < BAR(2)) return { x: 540, y: 540 + Math.sin(t * 1.7) * 12, r: 48 };
    if (t < C.digest) { const p = E.inOutCubic(u.seg(t, BAR(2), C.digest - BAR(2))); return { x: u.lerp(540, 420, p), y: u.lerp(540, 610, p), r: 44 }; }
    if (t < BAR(4)) { const q = M.bezier([[420, 610], [650, 430], [860, 580], [1100, 560]], E.inOutCubic(u.seg(t, C.digest, BAR(4) - C.digest))); return { x: q.x, y: q.y, r: 38 }; }
    if (t < BAR(7)) return { x: 1100 + (t - BAR(4)) / (BAR(7) - BAR(4)) * 620, y: 555 + Math.sin(t * 2) * 18, r: 36 };
    if (t < C.channelOpen) return { x: 1720 + Math.sin(t) * 12, y: 565, r: 36 };
    if (t < C.glucoseEnter) { const q = M.bezier([[1720, 565], [1790, 600], [1850, 700], [1900, 825]], E.inOutCubic(u.seg(t, C.channelOpen, C.glucoseEnter - C.channelOpen))); return { x: q.x, y: q.y, r: 34 }; }
    if (t < BAR(12)) { const p = E.inOutCubic(u.seg(t, C.glucoseEnter, BAR(12) - C.glucoseEnter)); return { x: 1900, y: u.lerp(825, 1000, p), r: 32 }; }
    if (t < B(54)) return { x: 1900 + Math.sin(t * 2) * 35, y: 1000 + Math.cos(t * 1.5) * 25, r: 32 };
    if (t < BAR(14)) { const q = M.bezier([[1900, 1000], [1860, 900], [1750, 650], [1660, 560]], E.inOutCubic(u.seg(t, B(54), BAR(14) - B(54)))); return { x: q.x, y: q.y, r: 34 }; }
    if (t < BAR(17)) return { x: 1660 - (t - BAR(14)) / (BAR(17) - BAR(14)) * 90, y: 560 + Math.sin(t * 2) * 15, r: 36 };
    if (t < C.insulinHigh) return { x: 1570 + (t - BAR(17)) / (C.insulinHigh - BAR(17)) * 800, y: 560, r: 36 };
    if (t < BAR(23)) return { x: 2370 + Math.sin(t) * 18, y: 560, r: 36 };
    if (t < BAR(25)) return { x: 2370 + (t - BAR(23)) / (BAR(25) - BAR(23)) * 450, y: 560, r: 36 };
    if (t < BAR(30)) return { x: 2820 + (t - BAR(25)) / (BAR(30) - BAR(25)) * 400, y: 560, r: 36 };
    if (t < B(126)) { const q = M.bezier([[3220, 560], [3350, 620], [3460, 760], [3500, 950]], E.inOutCubic(u.seg(t, C.exerciseUptake, B(126) - C.exerciseUptake))); return { x: t < C.exerciseUptake ? 3220 : q.x, y: t < C.exerciseUptake ? 560 : q.y, r: 36 }; }
    if (t < C.sensitivity) return { x: 3500, y: 950, r: 36 };
    if (t < BAR(33)) { const q = M.bezier([[3500, 950], [3500, 830], [3500, 680], [3500, 560]], E.inOutCubic(u.seg(t, C.sensitivity, BAR(33) - C.sensitivity))); return { x: q.x, y: q.y, r: 36 }; }
    return { x: 3500 + (t - BAR(33)) / (BAR(35) - BAR(33)) * 580, y: 560, r: 36 };
  }
  function particles(g, t) {
    for (let i = 0; i < 12; i++) {
      const x = 1030 + ((i * 293 + t * 31) % 2980), y = 510 + (i % 3) * 52 + Math.sin(t + i) * 10;
      sugar(g, x, y, 17 + i % 2 * 3, t * .15 + i, false);
    }
    const extra = t >= BAR(14) && t < BAR(30) ? 6 : t >= BAR(12) ? 2 : 0;
    for (let i = 0; i < extra; i++) sugar(g, 1460 + i * 48, 610 + Math.sin(t * 2 + i) * 14, 25, i, false);
    if (t >= C.insulinMade && t < BAR(14)) {
      const p = insulinPosition(t); insulin(g, p.x, p.y, .8, -.3, 1);
    }
    if (t >= BAR(14) && t < BAR(23)) {
      const n = t < BAR(17) ? 2 : 6;
      for (let i = 0; i < n; i++) insulin(g, 1600 + i * 48, 660 + Math.sin(t * 3 + i) * 12, .7, -.2, 1);
    }
    if (t >= BAR(17) && t < BAR(20)) for (let i = 0; i < 5; i++) { const p = (t * .8 + i * .2) % 1; insulin(g, 2480 - p * 80, 950 - p * 340, .65, -.2, 1 - p * .4); }
    if (t >= BAR(20) && t < BAR(25)) for (let i = 0; i < 3; i++) insulin(g, 2390 + i * 45, 600, .6, .8, 1 - u.seg(t, BAR(20), BAR(25) - BAR(20)));
  }
  function world(g, t) {
    table(g); bowl(g, 390, 570); drink(g, 720, 610);
    vessel(g, t); particles(g, t);
    if (t >= BAR(9) - .2) muscle(g, 1900, 1020, 1, t, false);
    pancreas(g, 2500, 1030, t);
    if (t >= BAR(23) && t < BAR(25)) {
      const p = E.inOutCubic(u.seg(t, C.immuneIn, C.immuneHit - C.immuneIn));
      immune(g, u.lerp(2150, 2380, p), 1020, .85); immune(g, u.lerp(2830, 2600, p), 990, .8);
    }
    if (t >= BAR(25)) meter(g, 2870, 1030, t);
    if (t >= BAR(27)) risk(g, t);
    if (t >= BAR(30)) muscle(g, 3500, 1020, 1, t, true);
    if (t >= BAR(33)) { plate(g, 4200, 900); prescription(g, 4530, 1010); }
    const h = heroPosition(t); sugar(g, h.x, h.y, h.r, t * .2, true);
    if (t >= BAR(30) && t < BAR(33)) {
      g.save(); g.strokeStyle = T.tealDark; g.lineWidth = 8; g.lineCap = 'round';
      const step = Math.sin(t * 8) * 25; M.line(g, 3300, 1190, 3270 + step, 1310, { w: 18, color: T.inkSoft }); M.line(g, 3370, 1190, 3410 - step, 1310, { w: 18, color: T.inkSoft }); g.restore();
    }
  }
  function camera(t) {
    return M.cameraAt(t, [
      [0, 540, 720, 1], [BAR(2), 540, 720, 1], [C.digest, 560, 690, 1.08], [BAR(4), 1040, 700, 1.12],
      [B(22), 1370, 690, 1.04], [BAR(7), 1750, 720, 1.02], [B(30), 2460, 850, 1.08], [C.insulinMade, 2500, 880, 1.12],
      [BAR(9), 1900, 810, 1.15], [C.channelOpen, 1900, 850, 1.22], [BAR(12), 1900, 960, 1.28], [BAR(14), 1900, 850, 1.16],
      [BAR(17), 1900, 820, 1.12], [B(74), 2470, 870, 1.1], [C.insulinHigh, 2050, 780, 1.08], [BAR(20), 2490, 870, 1.1],
      [BAR(23), 2500, 880, 1.08], [BAR(25), 2500, 880, 1.02], [B(103), 2850, 850, 1.08], [BAR(27), 3000, 760, 1.08],
      [BAR(30), 3250, 800, 1.06], [C.exerciseUptake, 3500, 900, 1.16], [BAR(33), 3500, 850, 1.05], [C.care, 4200, 790, 1.06], [BAR(35), 4200, 790, 1.02]
    ]);
  }
  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1600]]);
    g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    const a = E.outCubic(u.seg(t, B(142), .8)); g.globalAlpha = a;
    M.avatar(g, 540, 490, 116);
    M.text(g, '糖尿病', 540, 720, { size: 88, weight: 900, display: true });
    M.text(g, '不只是“糖吃多了”', 540, 820, { size: 64, weight: 800, display: true });
    M.text(g, '看懂机制，才能长期管理', 540, 1000, { size: 64, weight: 750, color: T.tealDark });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4));
    M.text(g, '关注「医学科普漫画」', 540, 1150, { size: 48, weight: 750 });
    M.text(g, '下期：三个血糖指标，各看哪段时间？', 540, 1240, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1340, { size: 36, role: 'disclaimer', color: T.gray });
    g.restore(); g.restore();
  }

  tl.add(0, DUR, (g, p, t) => {
    const cam = camera(t);
    g.save(); g.beginPath(); g.rect(0, 340, 1080, 790); g.clip();
    M.withCamera(g, cam, gg => world(gg, t)); g.restore();
    if (t < C.pullBack) { brand(g); caption(g, t); notes(g, t, cam); }
    ending(g, t);
  });
  M.mount(tl);
})();
