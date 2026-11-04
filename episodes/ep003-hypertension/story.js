/* 第 3 期重做：一套泵与管路的压力系统，全片一个场景。
   注意：本期已成片走 Remotion（remotion/src/Hypertension.tsx），本文件是画布版留档，
   文案与分镜以 script.json 和 Hypertension.tsx 为准，不要再从这里出片。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease, F = window.MedFrame;
  const DUR = 116, tl = new M.TL(DUR);
  const B = n => .5804988662 + n * 60 / 77, BAR = n => B(n * 4);
  const C = {
    open: B(0), systolic: BAR(2), pulse: B(9), diastolic: BAR(4), lowMin: B(24),
    elastic: B(26), buffer: B(30), twoThings: BAR(9), narrow: BAR(11), resist: B(48),
    salt: BAR(13), volume: B(56), nerve: BAR(15), thicken: BAR(17), silent: BAR(19),
    measure: BAR(21), cuff: B(88), home: BAR(23), clinic: BAR(26), line: B(108),
    manage: BAR(29), saltLess: B(116), walk: B(120), lifestyle: BAR(31), care: B(132),
    checkup: B(136), pullBack: BAR(35), follow: B(144)
  };
  M.loadPlate('../../brand/avatar.jpg');

  const beats = [
    { start: 0, end: BAR(2), lines: [[0, BAR(2), '你量到的两个数，是血管里的压力']] },
    { start: BAR(2), end: BAR(4), lines: [[BAR(2), BAR(4), '心脏一挤，血冲进右边这根血管']] },
    { start: BAR(4), end: B(26), lines: [[BAR(4), B(26), '心脏一松，血管里的压力落到最低']] },
    { start: B(26), end: BAR(9), lines: [[B(26), BAR(9), '血管壁会回弹，血才不会断']] },
    { start: BAR(9), end: BAR(11), lines: [[BAR(9), BAR(11), '血变多，或者血管难推，压力就高']] },
    { start: BAR(11), end: BAR(13), lines: [[BAR(11), BAR(13), '远处这段变细，同样的血更难推']] },
    { start: BAR(13), end: BAR(15), lines: [[BAR(13), BAR(15), '盐吃多，身体留住水，血量变多']] },
    { start: BAR(15), end: BAR(17), lines: [[BAR(15), BAR(17), '一紧张，心跳快，血管也收紧']] },
    { start: BAR(17), end: BAR(19), lines: [[BAR(17), BAR(19), '血管壁变厚变硬，压力更难降']] },
    { start: BAR(19), end: BAR(21), lines: [[BAR(19), BAR(21), '你往往没感觉，只能量出来']] },
    { start: BAR(21), end: BAR(23), lines: [[BAR(21), BAR(23), '量之前，先安静坐五分钟']] },
    { start: BAR(23), end: BAR(26), lines: [[BAR(23), BAR(26), '在家连测几天，135 和 85 算高']] },
    { start: BAR(26), end: BAR(29), lines: [[BAR(26), BAR(29), '在医院量，140 和 90 算高']] },
    { start: BAR(29), end: BAR(31), lines: [[BAR(29), BAR(31), '少吃盐，再让自己多动一点']] },
    { start: BAR(31), end: BAR(35), lines: [[BAR(31), BAR(35), '药按医嘱吃，复查别自己断']] },
    { start: BAR(35), end: DUR, lines: [[BAR(35), DUR, '两个数，就是这套压力高不高']] }
  ];

  /* ---------- 场景部件 ---------- */
  const TUBE_Y = 640;
  function heart(g, x, y, s, t, fast) {
    const period = fast ? .42 : .78;
    const ph = ((t % period) / period);
    const kick = Math.exp(-ph * 6) * (fast ? .1 : .07);
    const big = t >= C.pulse && t < C.pulse + 1.2 ? E.outCubic(u.seg(t, C.pulse, .5)) * (1 - u.seg(t, C.pulse + .7, .5)) : 0;
    const k = 1 + kick + big * .16;
    g.save(); g.translate(x, y); g.scale(s * (k), s * (2 - k));
    M.softShadow(g, 0, 150, 210, 40, .16);
    g.beginPath();
    g.moveTo(0, 118);
    g.bezierCurveTo(-150, 10, -170, -110, -78, -140);
    g.bezierCurveTo(-30, -156, -6, -120, 0, -96);
    g.bezierCurveTo(6, -120, 30, -156, 78, -140);
    g.bezierCurveTo(170, -110, 150, 10, 0, 118);
    g.closePath();
    F.fillStroke(g, '#E08A78', 8);
    g.save(); g.globalAlpha = .5; g.strokeStyle = '#C6594A'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-96, -72); g.bezierCurveTo(-40, -30, -20, 30, 0, 96); g.stroke();
    g.beginPath(); g.moveTo(96, -72); g.bezierCurveTo(40, -30, 20, 30, 0, 96); g.stroke();
    g.restore(); g.restore();
  }
  function tube(g, t) {
    const narrow = E.inOutCubic(u.seg(t, C.narrow, 2.2));
    const thick = u.seg(t, C.thicken, 3.2);
    const R = 36, rFar = 20 - narrow * 11;
    g.save();
    const grad = g.createLinearGradient(0, TUBE_Y - R, 0, TUBE_Y + R);
    grad.addColorStop(0, '#F3C2B6'); grad.addColorStop(.3, '#FADFD4'); grad.addColorStop(.78, '#F6D3C7'); grad.addColorStop(1, '#E2A797');
    M.rr(g, 500, TUBE_Y - R, 560, R * 2, R); g.fillStyle = grad; g.fill();
    g.lineWidth = 7 + thick * 9; g.strokeStyle = thick > .5 ? '#8E3B33' : T.ink; g.stroke();
    g.save(); g.globalAlpha = .32; g.strokeStyle = T.coralDark; g.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const x = 620 + i * 70, sq = Math.sin(t * 5 + i * .6) * 3;
      g.beginPath(); g.moveTo(x, TUBE_Y - R + 8); g.quadraticCurveTo(x + 10, TUBE_Y - R + 8 + sq, x + 20, TUBE_Y - R + 8); g.stroke();
      g.beginPath(); g.moveTo(x, TUBE_Y + R - 8); g.quadraticCurveTo(x + 10, TUBE_Y + R - 8 - sq, x + 20, TUBE_Y + R - 8); g.stroke();
    }
    g.restore();
    M.rr(g, 1060, TUBE_Y - rFar, 240, rFar * 2, rFar); g.fillStyle = '#F6D3C7'; g.fill();
    g.lineWidth = 6 + thick * 8; g.strokeStyle = thick > .5 ? '#8E3B33' : T.ink; g.stroke();
    const lv = .55 + u.seg(t, C.salt, 3) * .4;
    g.save(); g.beginPath(); M.rr(g, 508, TUBE_Y - R + 6, 784, (R - 6) * 2, R - 6); g.clip();
    g.globalAlpha = .45; g.fillStyle = '#E79E90';
    g.fillRect(508, TUBE_Y + R - (R * 2 - 12) * lv, 792, (R * 2) * lv);
    g.restore(); g.restore();
  }
  function gauge(g, x, y, r, t) {
    const hi = .34 + E.outCubic(u.seg(t, C.narrow, 2)) * .22 + u.seg(t, C.salt, 3) * .12 + u.seg(t, C.thicken, 4) * .1;
    const lo = .18 + E.outCubic(u.seg(t, C.narrow, 2)) * .14 + u.seg(t, C.salt, 3) * .08;
    g.save(); g.translate(x, y);
    M.softShadow(g, 0, r + 26, r * 1.25, r * .32, .16);
    g.beginPath(); g.arc(0, 0, r, 0, 7); F.fillStroke(g, T.paperLight, 8);
    g.beginPath(); g.arc(0, 0, r - 22, 0, 7); g.fillStyle = '#FBF6EA'; g.fill();
    // 色带
    [['#BFE0D6', .0, .5], ['#F7DFA0', .5, .72], ['#F3C7BC', .72, 1]].forEach(z => {
      g.beginPath(); g.arc(0, 0, r - 26, Math.PI + z[1] * Math.PI, Math.PI + z[2] * Math.PI);
      g.lineWidth = 16; g.strokeStyle = z[0]; g.stroke();
    });
    // 刻度
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + i / 10 * Math.PI;
      g.beginPath(); g.moveTo(Math.cos(a) * (r - 46), Math.sin(a) * (r - 46));
      g.lineTo(Math.cos(a) * (r - 34), Math.sin(a) * (r - 34));
      g.lineWidth = 3; g.strokeStyle = T.ink; g.stroke();
    }
    // 指针
    const ha = Math.PI + u.clamp(hi, 0, 1) * Math.PI;
    const la = Math.PI + u.clamp(lo, 0, 1) * Math.PI;
    g.beginPath(); g.moveTo(Math.cos(la) * (r - 60), Math.sin(la) * (r - 60));
    g.lineTo(Math.cos(la) * (r - 20), Math.sin(la) * (r - 20));
    g.lineWidth = 7; g.strokeStyle = T.tealDark; g.stroke();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ha) * (r - 24), Math.sin(ha) * (r - 24));
    g.lineWidth = 9; g.strokeStyle = T.coralDark; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.arc(0, 0, 12, 0, 7); F.fillStroke(g, T.ink, 3);
    g.restore();
  }
  function cuff(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.measure, .8));
    if (a <= 0) return;
    const infl = u.seg(t, C.cuff, 1.2) * (1 - u.seg(t, C.cuff + 1.4, 1.2));
    g.save(); g.globalAlpha = a;
    M.softShadow(g, x, y + 110, 190, 30, .14);
    M.rr(g, x - 168, y - 108 - infl * 10, 336, 216 + infl * 20, 34);
    F.fillStroke(g, '#DCE8E4', 7, T.tealDark);
    M.rr(g, x - 60, y - 40, 120, 60, 14); g.fillStyle = T.paperLight; g.fill();
    M.text(g, 'mmHg', x, y - 8, { size: 34, weight: 700, color: T.tealDark, role: 'object' });
    M.line(g, x + 168, y, x + 250, y - 60, { w: 8, color: T.inkSoft });
    g.restore();
  }
  function saltShaker(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.salt, .7));
    if (a <= 0) return;
    const tilt = E.outCubic(u.seg(t, C.salt + .2, 1)) * .5;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-tilt);
    M.softShadow(g, 0, 84, 80, 20, .14);
    M.rr(g, -56, -34, 112, 116, 18); F.fillStroke(g, T.paperLight, 6);
    M.rr(g, -50, -74, 100, 44, 14); F.fillStroke(g, '#DCE8E4', 5, T.tealDark);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-30 + i * 20, -70, 4, 0, 7); g.fillStyle = T.ink; g.fill(); }
    M.text(g, '盐', 0, 24, { size: 44, weight: 800, color: T.coralDark, role: 'object' });
    g.restore();
    for (let i = 0; i < 5; i++) {
      const p = ((t * .6 + i * .2) % 1);
      if (t < C.salt + .1) break;
      g.save(); g.globalAlpha = a * (1 - p);
      g.fillStyle = T.white; g.beginPath(); g.arc(x - 40 + i * 22, y - 96 + p * 130, 5, 0, 7); g.fill();
      g.restore();
    }
  }
  function nervous(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.nerve, .7));
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    M.person(g, x, y, 1.5, { exp: 'think', arm: 'think' });
    const k = Math.sin((t - C.nerve) * 9) * .5 + .5;
    g.strokeStyle = T.amber; g.lineWidth = 7; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ax = x + 110 + i * 26, ay = y - 210 - i * 18;
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 16, ay + 26); g.lineTo(ax - 4, ay + 30); g.lineTo(ax + 14, ay + 58);
      g.globalAlpha = a * (.4 + .6 * k); g.stroke();
    }
    g.restore();
  }
  function logbook(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.home, .7));
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-.03);
    M.softShadow(g, 0, 150, 220, 36, .14);
    M.paperPanel(g, -180, -160, 360, 320, { radius: 18 });
    M.text(g, '家庭血压记录', 0, -112, { size: 46, weight: 800, color: T.ink });
    for (let i = 0; i < 4; i++) {
      const yy = -50 + i * 42;
      M.text(g, '第' + (i + 1) + '天', -132, yy, { size: 34, weight: 700, color: T.inkSoft, role: 'object', align: 'left' });
      M.line(g, -40, yy + 14, 150, yy + 14, { w: 2, color: T.paperShadow });
      const p = E.outCubic(u.seg(t, C.home + .4 + i * .5, .5));
      if (p > 0) {
        g.save(); g.globalAlpha = a * p; g.strokeStyle = T.coralDark; g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-30, yy + 2); g.lineTo(30, yy - 10); g.lineTo(96, yy + 4); g.stroke(); g.restore();
      }
    }
    const avg = E.outCubic(u.seg(t, C.home + 2.2, .8));
    if (avg > 0) {
      g.save(); g.globalAlpha = a * avg;
      M.line(g, -170, 96, 170, 96, { w: 4, color: T.tealDark, dash: [12, 8] });
      M.text(g, '135 / 85', 0, 134, { size: 44, weight: 800, color: T.tealDark, role: 'object' });
      g.restore();
    }
    g.restore();
  }
  function spoon(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.saltLess, .6));
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-.35);
    M.softShadow(g, 0, 40, 90, 16, .12);
    M.rr(g, -16, -110, 32, 150, 14); F.fillStroke(g, '#D9C7AE', 5);
    g.beginPath(); g.ellipse(0, 66, 62, 34, 0, 0, 7); F.fillStroke(g, '#EFE3CE', 5);
    g.beginPath(); g.ellipse(0, 62, 46, 22, 0, 0, 7); g.fillStyle = T.white; g.fill();
    M.text(g, '5 g', 0, 62, { size: 34, weight: 800, color: T.coralDark, role: 'object' });
    g.restore();
  }
  function steps(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.walk, .8));
    if (a <= 0) return;
    for (let i = 0; i < 4; i++) {
      g.save(); g.globalAlpha = a * (.35 + .45 * Math.max(0, Math.sin(t * 3 - i * .7)));
      M.rr(g, x + i * 86, y - (i % 2) * 12, 64, 24, 12); g.fillStyle = T.tealDark; g.fill(); g.restore();
    }
  }
  function pillBox(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.care, .6));
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y);
    M.softShadow(g, 0, 56, 78, 18, .14);
    M.rr(g, -68, -50, 136, 100, 14); F.fillStroke(g, T.paperLight, 6);
    M.rr(g, -68, -50, 136, 40, 14); F.fillStroke(g, '#DCE8E4', 5, T.tealDark);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-32 + i * 32, 18, 14, 0, 7); F.fillStroke(g, i % 2 ? T.amberLight : T.tealLight, 3); }
    g.restore();
  }
  function calendar(g, x, y, t) {
    const a = E.outCubic(u.seg(t, C.checkup, .6)) * (1 - u.seg(t, C.pullBack - .8, .6));
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(.05);
    M.paperPanel(g, -78, -72, 156, 144, { radius: 14 });
    M.rr(g, -78, -72, 156, 38, 12); g.fillStyle = T.coral; g.fill();
    M.text(g, '复查', 0, -53, { size: 32, weight: 700, color: T.white, role: 'object' });
    for (let i = 0; i < 4; i++) M.line(g, -52, -8 + i * 22, 52, -8 + i * 22, { w: 3, color: T.paperShadow });
    g.save(); g.globalAlpha = a * u.seg(t, C.checkup + .3, .5);
    g.strokeStyle = T.coralDark; g.lineWidth = 6; g.beginPath(); g.arc(10, 30, 24, 0, 7); g.stroke(); g.restore();
    g.restore();
  }

  function ecg(g, x0, x1, y, t, fast) {
    const period = fast ? .42 : .78;
    g.save();
    M.rr(g, x0, y - 54, x1 - x0, 108, 26); F.fillStroke(g, 'rgba(255,252,245,.72)', 4, T.inkSoft);
    g.beginPath(); g.strokeStyle = T.coralDark; g.lineWidth = 5; g.lineJoin = 'round';
    let started = false;
    for (let x = x0 + 14; x < x1 - 14; x += 6) {
      const ph = ((((x - x0) / 150 - t / period) % 1) + 1) % 1;
      let dy = 0;
      if (ph > .06 && ph < .16) dy = -46 * Math.sin((ph - .06) / .10 * Math.PI);
      else if (ph > .16 && ph < .22) dy = 16 * Math.sin((ph - .16) / .06 * Math.PI);
      if (!started) { g.moveTo(x, y + dy); started = true; } else g.lineTo(x, y + dy);
    }
    g.stroke(); g.restore();
  }

  function heroX(t) {
    const K = [[0, 640], [BAR(2), 620], [BAR(4), 700], [B(26), 790], [BAR(11), 1180],
      [BAR(13), 1080], [BAR(17), 1360], [BAR(21), 900], [BAR(23), 1200], [BAR(29), 1180], [DUR, 1200]];
    for (let i = 0; i < K.length - 1; i++) {
      const a = K[i], b = K[i + 1];
      if (t < b[0]) return u.lerp(a[1], b[1], E.inOutCubic(u.seg(t, a[0], Math.max(b[0] - a[0], .01))));
    }
    return K[K.length - 1][1];
  }
  function camera(t) {
    // 顺着血管轻轻移近，放大不超过 1.28，心脏始终留在画面左侧。
    return M.cameraAt(t, [
      [0, 620, 700, 1.0], [BAR(2), 660, 690, 1.08],
      [BAR(4), 740, 670, 1.2], [B(26), 760, 660, 1.24], [BAR(9), 770, 660, 1.26],
      [BAR(11), 820, 670, 1.28], [BAR(13), 760, 800, 1.08], [BAR(15), 880, 800, 1.08],
      [BAR(17), 800, 670, 1.26], [BAR(19), 700, 700, 1.02],
      [BAR(21), 680, 740, 1.08], [BAR(23), 1000, 800, 1.05], [BAR(26), 740, 660, 1.12],
      [BAR(29), 900, 860, 1.0], [BAR(31), 980, 880, 1.0],
      [BAR(35), 760, 720, .98], [DUR, 760, 720, .98]
    ]);
  }

  function caption(g, t) {
    const beat = beats.find(x => t >= x.start && t < x.end);
    if (!beat) return;
    const line = beat.lines.find(x => t >= x[0] && t < x[1]);
    if (!line) return;
    const enter = E.outCubic(u.seg(t, line[0], .24));
    const leave = 1 - u.seg(t, line[1] - .18, .18);
    const s = line[2];
    const size = s.length > 16 ? 48 : s.length > 13 ? 56 : 64;
    g.save(); g.globalAlpha = enter * leave; g.translate(0, (1 - enter) * 12);
    M.text(g, s, 540, 194, { size, weight: 850, display: true, color: /高|细|紧|难|盐/.test(s) ? T.coralDark : T.ink });
    g.restore();
  }
  function notes(g, t, cam) {
    const P = (x, y) => () => ({ x, y });
    const specs = [
      { start: B(4), end: BAR(2), text: '血压计：量的是血管里的压力', target: P(810, 470), dy: 280 },
      { start: B(9), end: B(13), text: '心脏：左边这颗，把血挤出去', target: P(450, 730), color: T.coralDark, dy: -250 },
      { start: B(17), end: B(21), text: '血管：血从心脏挤进这里', target: P(900, TUBE_Y), color: T.tealDark, dy: -230 },
      { start: B(28), end: B(32), text: '血管壁：松开后还会回弹', target: P(860, TUBE_Y - 90), dy: -190 },
      { start: B(37), end: B(41), text: '压力表：血多或难推，针就高', target: P(810, 470), color: T.coralDark, dy: 250 },
      { start: B(45), end: B(49), text: '远处这段：变细以后更难推', target: P(1200, TUBE_Y), color: T.coralDark, dy: 220 },
      { start: B(53), end: B(57), text: '盐：让身体留住水', target: P(900, 1010), dy: 190 },
      { start: B(61), end: B(65), text: '紧张：心跳变快，血管收紧', target: P(1180, 980), color: T.amber, dy: -230 },
      { start: B(69), end: B(73), text: '血管壁：变厚以后更难松开', target: P(1200, TUBE_Y), color: T.coralDark, dy: 210 },
      { start: B(77), end: B(81), text: '没有感觉，也要量一次', target: P(860, TUBE_Y), dy: 230 },
      { start: B(85), end: B(89), text: '袖带：缠在上臂再量', target: P(640, 720), dy: 260 },
      { start: B(93), end: B(97), text: '家里：连着几天量，再取平均', target: P(1380, 860), dy: 200 },
      { start: B(105), end: B(109), text: '医院：非同日三次到 140/90', target: P(760, 430), color: T.coralDark, dy: 260 },
      { start: B(117), end: B(121), text: '盐：每天少于 5 克', target: P(940, 1010), dy: 190 },
      { start: B(133), end: B(137), text: '复查：三到六个月一次', target: P(1180, 1010), dy: 200 }
    ];
    specs.forEach(spec => F.note(g, t, spec, cam));
  }

  function scene(g, t, cam) {
    tube(g, t);
    ecg(g, 660, 1320, 980, t, t >= C.nerve && t < BAR(17));
    heart(g, 450, 730, .95, t, t >= C.nerve && t < BAR(17));
    gauge(g, 810, 470, 108, t);
    if (t >= C.salt - .2 && t < BAR(15)) saltShaker(g, 900, 940, t);
    if (t >= C.nerve - .2 && t < BAR(17)) nervous(g, 1180, 980, t);
    if (t >= C.measure - .2 && t < BAR(23) && F.inView(cam, 430, 860)) cuff(g, 640, 720, t);
    if (t >= C.home - .2 && t < BAR(26) && F.inView(cam, 1150, 1610)) logbook(g, 1380, 860, t);
    if (t >= C.manage - .2) {
      spoon(g, 900, 940, t); steps(g, 1010, 1030, t);
      if (t >= C.lifestyle - .2) { pillBox(g, 1130, 980, t); calendar(g, 1250, 960, t); }
    }
    // 主角：一滴血
    const hx = heroX(t), hy = TUBE_Y + Math.sin(t * 2.1) * 6;
    M.rbc(g, hx, hy, 14, { squash: .84, rot: Math.sin(t * 1.4) * .3 });
  }

  function ending(g, t) {
    if (t < C.pullBack) return;
    const r = M.kf(t, [[C.pullBack, 0], [B(142), 1650]]);
    g.save(); g.beginPath(); g.arc(540, 760, r, 0, 7); g.clip(); g.fillStyle = T.paper; g.fillRect(0, 0, 1080, 1440);
    g.globalAlpha = E.outCubic(u.seg(t, B(142), .8));
    M.avatar(g, 540, 480, 112);
    M.text(g, '你量到的两个数', 540, 700, { size: 72, weight: 900, display: true });
    M.text(g, '就是这根血管里的压力', 540, 800, { size: 56, weight: 800, display: true });
    M.text(g, '盐少一点，动能多一点', 540, 946, { size: 52, weight: 750, color: T.tealDark });
    M.text(g, '药别自己停，复查别断', 540, 1032, { size: 52, weight: 750, color: T.coralDark });
    g.save(); g.globalAlpha *= E.outCubic(u.seg(t, C.follow, .4));
    M.text(g, '关注「医学科普漫画」', 540, 1164, { size: 48, weight: 750 });
    M.text(g, '下期：胆固醇里的两支队', 540, 1246, { size: 44, weight: 600, color: T.coralDark });
    M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1340, { size: 36, role: 'disclaimer', color: T.gray });
    g.restore(); g.restore();
  }

  tl.add(0, DUR, (g, p, t) => {
    if (t < C.pullBack) {
      const cam = camera(t);
      g.save(); g.beginPath(); g.rect(0, 330, 1080, 810); g.clip();
      M.withCamera(g, cam, gg => scene(gg, t, cam)); g.restore();
      F.brand(g); caption(g, t); notes(g, t, cam);
    }
    ending(g, t);
  });
  M.mount(tl);
})();
