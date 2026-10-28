# 第 1 期节奏与声音优化 · 工作交接

更新日期：2026-10-27

## 当前状态

2026-10-28 00:31 音效改为「真实气声 + 自制音高」双层方案并重新出片：`out/医学科普漫画_糖尿病_3x4.mp4`（1080×1440、60fps、116.00s、26.6MB）。试听样带 `Downloads/医学科普音效方案试听.mp3`（37 秒）。

### 双层音效方案（00:31）

上一版全部自制，气声层是带通噪声扫频，听感偏“电子、塑料”，本版按用户指定的第二种方案换成真素材。

- 新增 `assets/audio/sfx_ext/`，从 Mixkit（Free License，可商用、无需署名、不可单独转售）取 17 条：`air-short/quick/fast/wide/deep/fall/slow`（真实 whoosh，0.86–5.5s）、`sweep-up/bright/tick`（上行扫频）、`drop`（短坠落）、`impact-soft/deep`、`thump`（心跳）、`pop`（Explainer 轻弹）。
- 素材全部登记在 `assets/audio/sfx_ext/manifest.json`：来源 ID、原始标题、下载地址、许可、时长、实测峰值与 `trim_db`。噪声素材峰值高、感听响度低，逐条补偿 -2.7 ~ +2.5 dB，并设峰值上限 -4 dBFS。
- **`pipeline/compose.py`**：`find_sfx` 同时搜索 `sfx/` 与 `sfx_ext/`；新增 `trim_db` 与 `lead` 两个字段；`pan` 由「塌成单声道」改为只做左右增益，保留外部 whoosh 自带的声像移动（原写法 `c1=…*c0` 会把素材拍扁）。
- **`pipeline/audit.py`**：新增 `lead` 校验（上限一小节），`t` 仍是动作时刻，不破坏拍点与硬卡点规则。
- 起音对齐：实测每条素材的峰值时刻（whoosh 0.24–0.66s，长气声 2.10s，impact-soft 0.48s），用 `lead` 提前进入，让峰值压在拍点上；`open` 的 lead 超过 cue，由 compose 自动裁头到 0。
- 蓄力改法：外部 sweep 素材峰值在中段、之后衰减，做不出「越来越紧再接落点」，因此把 `air-fall` 反向裁切做出三个真气声蓄力 `rise-rev(2.60s)`、`rise-rev-bar(3.117s＝一小节)`、`rise-rev-short(1.56s)`，包络从 -70 dB 单调递增到末尾：`build-up`(50.45 起一小节) → `compensate`(53.57) 落点，`walk`(94.09 起 1.56s) → `contract`(95.65) 落点。
- 编排 49 条：气声层走 whoosh，揭示走「whoosh 峰值踩拍 + 下一拍 air-N 铃」，出现用 `pop` 或 `ping`，卡点跑动仍用自制 `run/tri`，下行用 `air-fall`/`drop`，转折用 `impact-*`。
- 复核：响度 -14.3 LUFS、真峰 -2.0 dBTP、节拍布局 45 帧 0 异常、黑场/冻帧 0、脚本结构 0 问题。画面一帧未动。
- 踩过的坑：冲击层拉到 -15.5 dBFS 目标时真峰冲到 -0.3 dBTP（`impact-deep` 与 BGM 同相叠加），回落到 -17.0 后通过；外部素材若直接按峰值归一，感听响度会低 4–6 dB，必须走 `trim_db`。

### 六层音效体系（00:06，已被上节取代）

先按行业通用做法补齐四类缺失元素，再重排 40 个动作。Explainer / 科普类通行的音效词汇是 pop、whoosh、riser、downlifter、impact、chime，密度每 3–5 秒一个，单个不超过 2 秒，音效一响 BGM 让位 6–10dB；健康医疗类还要求克制、不用警报式尖锐声。

- `make_sfx.py` 新增气声与冲击层（全部自制，音高严格锁 F 大调五声）：
  - `move-a/b/c`：带通噪声扫频 + 调内音高，时长 0.55/0.78/0.40s，带左右声像移动，用于转场与主体移动。
  - `up-a/up-b`：riser，2 小节 / 1 小节，音高连续上行一个八度，曲线先慢后陡（`u**1.8`），配合同步上扫的带通噪声。
  - `down-a/down-b`：downlifter，音高 698→175Hz、1046→440Hz 快速下坠后拖长尾。
  - `hit-a/hit-b`：impact，低频 96→44Hz 下滑 + 3.4kHz 撞击噪 + 调内 F2/G2 长尾。
  - `reveal-a/b`：whoosh + 长尾铃叠加，用于标题、进入新空间、结论落定。
- 40 个动作重排成六层：出现用 `ping`，卡点跑动用 `run/tri`，转场与移动用 `move/reveal`，蓄力用 `up`，能量下落用 `down`，受阻与转折用 `hit`，关键揭示用 `air`。
- 手法上做了 riser 接 impact 的落点：`build-up`(50.45) 蓄力 → `compensate`(53.57) 落点；`walk`(94.09) 蓄力 → `contract`(95.65) 落点。
- 复核：响度 -14.3 LUFS、真峰 -2.3 dBTP、节拍布局 45 帧 0 异常、黑场/冻帧 0，质检通过。只重跑合成，画面未动。
- 关键点实测电平：hit 峰值 -3.5/-6.7 dBFS，riser -5.7/-5.9，downlifter -6.8/-7.4，reveal -6.6/-9.2。

### 空灵音阶音效改造（23:57）

用户反馈两条：现有音效难听；希望有科普视频常见的「空灵、带音符感、有升调降调、能跟着节拍连响几下」的音效。

- 先测 BGM 调性：对 `bgm.mp3` 做 400 帧频谱相关，F 与 C 是最强音级，Krumhansl 判为 **F 大调**（0.826），据此所有音效统一用 F 大调五声音阶（F G A C D）。
- 新增 `pipeline/make_sfx.py`，纯 Python 加性合成 + Schroeder 混响，26 个素材写入 `assets/audio/sfx/`：`air-1..8`（1.8s 空灵铃、长尾）、`ping-1..8`（0.55s 拨弦）、`run-up-a/b`、`run-down-a/b`（4 音十六分跑动＝一拍内 4 声）、`tri-up/down`（3 音八分）、`shimmer`、`swell`、`sink`、`sub`。全部自制，无第三方许可问题。
- 音阶与网格：77 BPM 的十六分音符 = 0.1948s，跑动的每个音正好落在十六分网格上；音名覆盖 F5–A6，铃声泛音落在 1.4–7 kHz，与 BGM 的主能量区分开，不会被埋。
- 40 个动作全部重编：进入/增强走高音上行（`run-up`），减弱/分解/失效走下行（`run-down`、`sink`、`tri-down`），受阻与打击用 `sub`，能量与点亮用 `shimmer`，关键揭示用长尾 `air`；旧噪声音效（whoosh/latch/click/factory/heartbeat/alarm/boing/camera）不再用于本期。
- 电平：`sfx_normalize` 调到 `target_peak_db: -6.5`、`intensity_curve: 0.4`，让单条音效峰值贴近 BGM 峰值（-6 dBFS）；`sfx_ducking` 收紧到 threshold 0.10 / ratio 2.5 / release 90，音效响起时 BGM 让位更明显。
- 复核：响度 -14.3 LUFS、真峰 -3.1 dBTP、节拍布局 45 帧 0 异常、黑场/冻帧 0，质检通过。只重跑合成，画面未动。

### 音效可听度修复（23:45）

用户反馈「只听到 BGM、没有卡点音效」。原因是 `sfx.gain` 被当成绝对倍数用，取值 0.05–0.20，等于把素材又压低 14–26 dB，命中峰值落在约 -33 dBFS，被 BGM（峰值约 -6 dBFS）完全盖住。

- `compose.py` 新增 `music.sfx_normalize`：`gain` 改按「力度」解释，先按素材实测峰值归一到统一基准，再用 `intensity_curve` 保留轻重差别。
- 第 1 期取 `target_peak_db: -9`、`intensity_curve: 0.6`。实测音效总线峰值 **-6.0 dBFS**，与 BGM 峰值 -5.9 dBFS 齐平，最轻的条目低约 7 dB。
- `sfx_ducking` 阈值 0.02→0.08、release 120→100，避免每条音效都压住旋律造成抽吸感。
- 复核：响度 -14.5 LUFS，真峰 -2.6 dBTP，节拍布局 45 帧 0 异常，黑场/冻帧 0。只重跑合成，未重渲画面。

### 画面优化（23:32）

- 红细胞名牌引线已改到对象上方（`dy: -145`），20.5s、19.5s、21.0s、22.2s 复查不再穿过葡萄糖主角。
- 6960 帧全量重渲完成（未做局部补帧），新旧帧未混用。
- 全时间轴布局扫描（新增 `pipeline/sweep.py`，0.25s 步长、464 个采样点）通过，0 项问题。
- `usage.json` 已更新；`queue/topics.json` 第 1 期说明已改。

仍未做：人工听感复核（sidechain 是否只在动作时轻让位、有无叮当、主旋律是否清楚）与逐拍「老奶奶测试」。自动检查不能替代这两项。

## 已确定的工作方向

- 保留持续世界、一条主因果、入胞五步顺序、无旁白、纸色剪纸、品牌和免责声明。
- BGM 按 77 BPM 排：拍长 `0.779220779s`，4/4 小节约 `3.116883117s`，网格 offset `0.5804988662s`。
- 动作与音效同帧；普通音效吸附拍点，标题、正常机制、胰岛素抵抗、运动和结尾吸附小节线。
- 每句使用独立阅读窗口，不再固定副句晚 1 秒；不能通过缩短老年观众阅读时间来凑段落。
- 新对象名牌展示 2–4 拍，放在对象旁，随对象与镜头移动；同一时刻只留一条。
- 名牌只解释“它是谁、正在做什么”，不否定画面尚未演出的说法。
- 一个动作一个主音，音效增益随力度，声像跟随主体；独立音效总线用短促 sidechain 给 BGM 让位，不持续压住主旋律。

## 已完成修改

### 工作流

- `pipeline/audit.py`
  - 支持逐句 `{text, start, end}` 阅读窗口，兼容旧期字符串 `lines`。
  - 检查 2–4 拍对象名牌、动作与引用音效同帧、音效拍点、硬卡点、小节线和同拍叠音。
- `pipeline/compose.py`
  - 音效先汇入独立总线，再以短启动、短释放的轻度 sidechain 给当前动作让位。
  - 保留逐条 `gain / pan / rate`。
- `pipeline/engine.js`
  - 名牌引线根据目标位于名牌上方或下方选择连接边。
- `pipeline/qacheck.py`
  - QA 报告加入音乐网格和硬卡点信息。
- `episodes/_template/script.json`、`episodes/_template/story.js`
  - 新期模板加入音乐网格、逐句窗口和名牌窗口示范。
- `pipeline/README.md`、`brand/STYLE_GUIDE.md`、`AGENTS.md`
  - 已写入新工作约定。

### 第 1 期

- `episodes/ep001-diabetes/story.js`
  - 使用 `B(n)` / `BAR(n)` 统一驱动关键动作和镜头。
  - 40 个动作对应 40 个拍点音效；保留原机制顺序。
  - 主句与解释句按各自阅读窗口依次出现。
  - 名牌改为屏幕空间的对象跟随标注。
  - 葡萄糖入胞、回血、运动路径保持连续。
- `episodes/ep001-diabetes/script.json`
  - 与动画同步更新段界、逐句窗口、名牌窗口、动作时间、音效时间与增益。
  - `music.hard_cues` 为 `open / signal-arrive / weak-signal / walk / pull-back`。
  - 清空旧的三段 `bgm_dips`，改用动作级 sidechain。
- 三句悬空否定已替换：
  - “不是胰岛素没了……” → “胰岛素仍在释放，细胞响应变弱”。
  - “风险逐渐累积，不是必然发生” → “血管和神经的变化逐渐累积”。
  - “管理不是完全不吃主食” → “主食适量，搭配蔬菜和蛋白质 / 规范检测，遵医嘱用药”。
- 保留“红细胞：血液里负责运送氧气”和“胰岛素：通知细胞开始用葡萄糖”。

## 已做验证

- `script.json` JSON 解析通过。
- 第 1 期逐句阅读、名牌时长、动作/音效同帧、拍点和硬卡点审计通过。
- 模板通过同一套新审计。
- `story.js`、`engine.js` Node 语法检查通过。
- `peek.py --beats --strict` 的 45 个时点通过。
- 追加 23 个稳定展示与接触时点通过；合计 68 个预览时点无 JS、文字重叠或安全区错误。
- 已人工查看红细胞、胰岛素、受体、通道、入胞、抵抗、风险、运动、管理和结尾的关键静帧。

这些检查不能替代完整成片质检、真实听感和老年观众理解测试。

## 下一步任务

**以下 1–4 项已于 2026-10-27 23:32 完成，保留作记录；不要重复执行。** 仅剩第 5 项中的人工复核。

### 1. 修正红细胞名牌引线

位置：`episodes/ep001-diabetes/story.js` 的 `notes()`，红细胞一条当前为 `dy: 150`。

在 `20.5s` 预览中，引线会穿过葡萄糖主角。将名牌改到红细胞上方，例如 `dy: -145`，然后检查：

```bash
python3 pipeline/peek.py episodes/ep001-diabetes 20.5 --strict
```

### 2. 补全时间轴布局扫描

现有逐拍预览不能覆盖所有名牌淡入淡出与跟拍瞬间。建议用 Playwright 每 `0.25s` 调一次 `window.__seek()` 和 `window.__audit()`，将结果交给 `audit_text()`，无需为每帧截图。

### 3. 验证新混音

完整合成后重点检查：

- sidechain 是否只在动作发声时轻让位，没有持续抽吸感。
- 相邻音效是否仍形成叮当。
- 接触、开启、通过、受阻和落定是否只在动作帧起响。
- 主旋律是否始终清楚。

### 4. 整片重渲与质检

不要只补 14–29 秒：本次全片段界、名牌和混音均已变化。先隔离旧帧，避免新旧帧混用，再完整渲染 6960 帧：

```bash
python3 pipeline/render.py episodes/ep001-diabetes --fps 60
python3 pipeline/compose.py episodes/ep001-diabetes
python3 pipeline/qacheck.py episodes/ep001-diabetes
```

发布检查目标：

- 1080×1440，60fps，116 秒，6960 帧。
- 无黑场、冻帧、文字重叠或出画。
- 整体响度约 -14 LUFS，真峰 ≤ -1.5 dBTP。
- 查看逐拍手机联览及标题、受体结合、开门、入胞、抵抗、运动、结尾关键帧。
- 逐拍人工做老奶奶测试，确认阅读与因果，不用自动审计代替真实理解判断。

### 5. 收尾

质检通过后：

```bash
python3 pipeline/usage.py episodes/ep001-diabetes
```

再更新 `queue/topics.json` 第 1 期重做说明。只有新 MP4 完成上述验证后，才把本期视为交付完成。
