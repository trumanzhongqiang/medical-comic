/* 医学科普漫画 · 通用画面框架：品牌条、逐句字幕、对象名牌、曲线、量尺。
 * 第 2 期起各期共用；只用时间线传入的 t 计算，保持确定性。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;

  function brand(g) {
    M.avatar(g, 106, 78, 34);
    M.text(g, '医学科普漫画', 156, 78, { size: 36, weight: 700, align: 'left', role: 'brand', safe: false });
  }

  // beats: [{start,end,lines:[[t0,t1,text],...]}]；warn 关键字命中时用强调色
  function caption(g, t, beats, warnFn) {
    const beat = beats.find(x => t >= x.start && t < x.end);
    if (!beat) return;
    const line = beat.lines.find(x => t >= x[0] && t < x[1]);
    if (!line) return;
    const enter = E.outCubic(u.seg(t, line[0], .24));
    const leave = 1 - u.seg(t, line[1] - .18, .18);
    const warn = warnFn ? warnFn(line[2]) : /偏高|要查|留意|不准|不能|风险|升|窄/.test(line[2]);
    g.save(); g.globalAlpha = enter * leave; g.translate(0, (1 - enter) * 12);
    M.text(g, line[2], 540, 194, { size: 64, weight: 850, display: true, color: warn ? T.coralDark : T.ink });
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

  function inView(cam, x0, x1) {
    const half = 540 / cam.zoom;
    return x0 > cam.x - half + 40 && x1 < cam.x + half - 40;
  }

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
    if (o.dash) g.setLineDash(o.dash);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
    if (o.dot !== false) {
      g.fillStyle = o.color || T.tealDark;
      const e = pts[pts.length - 1];
      g.beginPath(); g.arc(e[0], e[1], o.dotR || 11, 0, 7); g.fill();
      g.lineWidth = 3; g.strokeStyle = T.white; g.stroke();
    }
    g.restore();
  }

  // 量尺：色带 + 刻度（上下错开）+ 指针
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

  // 葡萄糖：六边糖果 + 表情（主角才画脸）
  function glucoseFace(g, x, y, r, rot) {
    M.glucose(g, x, y, r, { rot: rot || 0, color: T.amber });
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.fillStyle = T.ink; g.beginPath(); g.arc(-r * .22, 0, r * .07, 0, 7); g.arc(r * .22, 0, r * .07, 0, 7); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = T.ink; g.beginPath(); g.arc(0, r * .16, r * .18, .15, Math.PI - .15); g.stroke(); g.restore();
  }

  function fillStroke(g, fill, width, stroke) {
    g.fillStyle = fill; g.fill(); g.lineWidth = width || 5; g.strokeStyle = stroke || T.ink; g.stroke();
  }

  window.MedFrame = { brand, caption, worldToScreen, note, inView, curvePoints, polyline, rail, glucoseFace, fillStroke };
})();
