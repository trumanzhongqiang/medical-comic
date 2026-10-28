/* 第1期重做：一个持续的血管世界，不整场替换。 */
(function () {
  const M = window.MedComic, T = M.T, u = M.u, E = M.Ease;
  const DUR = 78, tl = new M.TL(DUR);
  const say = (g, s, y, size, color) => M.text(g, s, 540, y, { size: size || 62, weight: 800, color: color || T.ink });
  function base(g, t) {
    M.avatar(g, 128, 86, 34);
    M.text(g, '医学科普漫画', 180, 86, { size: 34, weight: 700, align: 'left' });
    const drift = t * 18;
    g.save();
    g.beginPath(); g.rect(0, 620, 1080, 430); g.clip();
    g.fillStyle = '#F6D5CC'; g.fillRect(-100, 620, 1400, 430);
    g.strokeStyle = T.ink; g.lineWidth = 8;
    g.beginPath();
    for (let x = -100; x <= 1200; x += 12) {
      const y = 630 + Math.sin((x + drift) / 90) * 18;
      x === -100 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    g.beginPath();
    for (let x = -100; x <= 1200; x += 12) {
      const y = 1030 + Math.sin((x + drift) / 110) * 16;
      x === -100 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    for (let i = 0; i < 7; i++) M.rbc(g, ((t * 42 + i * 180) % 1250) - 80, 820 + Math.sin(t + i) * 24, 25);
    g.restore();
  }
  tl.add(0, DUR, (g, p, t) => {
    base(g, t);
    const sugar = [];
    const count = t < 12 ? 1 : t < 24 ? 4 : 7;
    for (let i = 0; i < count; i++) {
      const x = 180 + i * 85 + Math.sin(t * 1.4 + i) * 8;
      const y = 820 + Math.cos(t * 1.6 + i) * 18;
      sugar.push([x, y]);
      M.glucose(g, x, y, 32, { rot: t * .25 + i });
    }
    const door = u.seg(t, 18, 5) * (t < 34 ? 1 : Math.max(.15, 1 - u.seg(t, 34, 6)));
    M.cell(g, 860, 820, 145, { phase: t, lockColor: t > 34 ? T.coral : T.membrane, wobble: .035 });
    const keys = t < 30 ? 1 : Math.min(5, 1 + Math.floor((t - 30) / 2));
    for (let i = 0; i < keys; i++) M.insulin(g, 620 + i * 38, 690 + Math.sin(t * 4 + i) * 6, { scale: 1.05, angle: -.35 + door * .4 });
    if (t > 48) M.pancreas(g, 390, 1115, 1.15, { tired: u.seg(t, 50, 8) });

    if (t < 11) { say(g, '饭后血糖会升高', 230); say(g, '但原因不只是吃糖', 310, 46, T.coral); }
    else if (t < 23) { say(g, '糖要进入细胞', 230); say(g, '才能变成能量', 310, 46, T.coral); }
    else if (t < 35) { say(g, '胰岛素负责开门', 230); say(g, '正常时，一扇门就够', 310, 46, T.coral); }
    else if (t < 49) { say(g, '钥匙变多，门却变慢', 220); say(g, '这是胰岛素抵抗', 300, 46, T.coral); }
    else if (t < 63) { say(g, '胰腺只好持续加班', 220); say(g, '久了，生产能力会下降', 300, 46, T.coral); }
    else { say(g, '早测，比出现症状更重要', 220, 54); M.text(g, '测血糖 · 饭定量 · 饭后走', 540, 1160, { size: 42, weight: 800 }); M.text(g, '仅供科普，不能替代医生诊疗', 540, 1340, { size: 34, color: T.gray }); }
    if (t > 12 && t < 62) M.label(g, t < 35 ? '葡萄糖：血液里的糖' : '血糖：还没进入细胞的糖', 540, 1240, { anchor: 'center', size: 44, border: t < 35 ? T.ink : T.coral, color: t < 35 ? T.ink : T.coral });
  });
  M.mount(tl);
})();
