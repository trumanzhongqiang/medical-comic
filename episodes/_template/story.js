/* 持续世界模板：同一对象原位变化，不用整屏 FADE。 */
(function () {
  const M = window.MedComic, T = M.T;
  const DUR = 15, tl = new M.TL(DUR);
  const B = n => .5805 + n * 60 / 77;
  M.loadPlate('../../brand/avatar.jpg');
  function brand(g) {
    M.avatar(g, 108, 88, 34);
    M.text(g, '医学科普漫画', 158, 88, { size: 36, weight: 700, align: 'left', role: 'brand', safe: false });
  }
  tl.add(0, DUR, (g, p, t) => {
    brand(g);
    const x = M.kf(t, [[0, 250], [3, 360], [7, 720], [11, 660], [15, 660]]);
    const cam = M.cameraAt(t, [[0, 540, 760, 1], [3, 500, 760, 1.08], [11, 540, 760, 1]]);
    M.withCamera(g, cam, gg => {
      M.softShadow(gg, x, 920, 90, 24, .14);
      gg.beginPath(); gg.arc(x, 760, 100, 0, Math.PI * 2);
      gg.fillStyle = t < 7 ? T.tealLight : T.coralLight; gg.fill();
      gg.lineWidth = 6; gg.strokeStyle = T.ink; gg.stroke();
    });
    const title = t < 3 ? '本期问题' : t < 7 ? '正常情况下' : t < 11 ? '关键变化' : '现在可以怎么做';
    M.text(g, title, 540, 250, { size: 76, weight: 800, display: true });
    if (t < 3) M.label(g, '主角：本期要追踪的对象', 540, 1100, { anchor: 'center' });
    if (t >= 11) {
      M.text(g, '关注「医学科普漫画」', 540, 1160, { size: 46, weight: 700 });
      M.text(g, '本内容仅供科普，不能替代医生诊疗', 540, 1330, { size: 36, role: 'disclaimer', color: T.gray });
    }
  });
  M.mount(tl);
})();
