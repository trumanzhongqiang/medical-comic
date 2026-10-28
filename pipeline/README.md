# 流水线说明

## 组成

| 文件 | 作用 |
|---|---|
| `engine.js` | 确定性动画引擎：关键帧、路径、相机、剪纸层次、文字审计、品牌头像和既有图形 |
| `factcheck.md` | 医学论断进 `beats` 前的核查关卡：知识卡、缺口命名、单源冲突、`sources` schema、AI 留证 + 人工签字两段式 |
| `factcheck_report.py` | 打印签字单：逐条 claim / verdict / 原文摘录 / 签字人；`--pending` 只看待签与待核查 |
| `factcheck_page.py` | 生成单文件签字页（可离线开、勾选有进度、导出 json），一条卡片=一条 sources |
| `apply_signoff.py` | 把签字页导出的 json 回填进 `script.json`（写 reviewer / reviewed_at，改 verdict），并在 `out/qa` 留复核记录 |
| `audit.py` | 节拍结构、阅读时间、音效引用、字号、安全区、文字碰撞、禁则折行、`sources` 结构与 verdict 枚举、文案精度（`lint_copy`：绝对承诺 / 术语压成单字 / 定量说成必然 / 一档并一句）检查 |
| `render.py` | Playwright 逐帧截图：1080×1440 @2x，校验时长、字体和图片资源 |
| `make_sfx.py` | 生成「空灵音阶」音高层素材（F 大调五声：铃/拨弦/跑动/闪烁/低频），自制无版权风险 |
| `compose.py` | 帧序列 + BGM 包络 + 动作音效（含 `sfx/` 自制池与 `sfx_ext/` 外部素材池）；两阶段 loudnorm 出音频母线，按编码后真峰迭代限幅，再封视频 |
| `peek.py` | 多时点或逐拍布局预览，输出 `out/qa/peek_*.png` |
| `qacheck.py` | 技术指标、逐拍布局、手机尺寸联览、黑场、冻帧、响度和素材许可 |
| `usage.py` | 从当前会话日志汇总模型与 token，写入 `usage.json` |
| `new_episode.py` | 新一期脚手架（模板 + 选题登记） |

## 标准循环

```bash
python3 pipeline/new_episode.py ep012-xxx "标题"      # 建目录（只需一次）
# 1) 写 script.json：beats、学习目标、医学来源、动作音效
# 2) 写 story.js：同一持续世界，不用整屏淡出掩盖换场
python3 pipeline/peek.py episodes/ep012-xxx --beats --strict
python3 pipeline/render.py episodes/ep012-xxx --fps 30   # 连续运动预览
python3 pipeline/render.py episodes/ep012-xxx --fps 60   # 发布帧
python3 pipeline/compose.py episodes/ep012-xxx
python3 pipeline/qacheck.py episodes/ep012-xxx
python3 pipeline/usage.py episodes/ep012-xxx
```

局部修补：`render.py <ep> --from 12 --to 20`。帧号全局连续，修补前必须确认目录没有旧版多余帧；`compose.py` 会读取完整编号序列。

## 关键约定

- `script.json.duration` 必须等于 `story.js` 的时长，否则渲染直接失败。
- 新期使用 `beats`：每拍包含目的、屏幕文案、首次对象、动作、转场和音效引用。动作要么指定 `sfx`，要么明确 `silent`。
- 先实测 BGM，再填写 `music.bpm / offset / beats_per_bar / sync_tolerance / hard_cues`。普通音效落在拍点，标题、机制转折和结尾等 `hard_cues` 落在小节线；动作的 `t` 必须与引用音效完全一致，同一拍不叠两个音效。
- `lines` 用 `{text, start, end}` 给每句独立的阅读窗口，不再固定副句晚 1 秒；`visuals` 的 `start/end` 控制首次名牌展示，通常留 2–4 拍。旧期纯字符串 `lines` 仍可审计。
- 名牌跟随所指对象与镜头，放在对象旁并加引线；同一时刻只留一条。文案只解释画面正在证明的动作，不用字幕提前否认尚未演出的说法。
- 音效支持 `gain`、`pan`、`rate`、`start`、`duration`、`trim_db`、`lead`。所有音效必须保留可商用许可。
- **`lead`（提前量）**：`t` 永远是动作/拍点时刻，`lead` 表示这条音效从 `t - lead` 开始播放。真实 whoosh 的能量峰值在起音后 0.2–0.7 秒（长气声可达 2 秒），不提前就会「声音晚于画面」。`lead` 上限一小节，起点被截到 0 时由 `compose.py` 自动裁头。
- **两层素材库**：
  - `assets/audio/sfx/` 自制音高层，`make_sfx.py` 生成。BGM 定调后取该调的五声音阶（第 1 期为 F 大调），音高类素材全部锁在调内。
  - `assets/audio/sfx_ext/` 外部真实素材，只用于「无音高」的气声与冲击层。每条必须在 `manifest.json` 记录来源、原始标题、下载地址、许可与 `trim_db`；删除清单里的记录等于丢失许可证据，投稿前要能对上。
- **六层分工**（按动作性质选层，不要都用同一种）：
  - 出现 `pop`、确认 `air-N`、点亮 `shimmer` —— 音高层，负责「音符感」。
  - `run-up/down-*`、`tri-up/down` —— 卡点跑动，一条素材内含 3–4 个音，间隔取 BGM 十六分音符，用于一拍内连响。
  - `air-*` —— 真实 whoosh（短/中/宽/深/长渐弱），负责转场、主体移动与「空灵感」。至少准备 3–4 个变体，同一个 whoosh 不要反复用；实测峰值偏高、感听响度偏低，靠 `manifest.json` 的 `trim_db` 压回统一响度。
  - `sweep-up` / `sweep-tick` / `sweep-bright` —— 外部上行扫频素材。注意它们的峰值在中段、之后衰减，**不能**用来做「蓄力到落点」；那种位置用反向气声（见下条）。
  - `rise-rev` / `rise-rev-bar` / `rise-rev-short` —— 由 `air-fall` 反向裁切得到的真气声蓄力：包络从 -70 dB 单调递增到末尾，长度取 2.60s / 3.117s（一小节）/ 1.56s。`t` 直接放在重音前一拍（或一小节），`duration` 等于素材长度，它的末尾就正好压在 impact 上。
  - `drop` / `air-fall` —— 下行：`drop` 是短促坠落，`air-fall` 是长气声渐弱，用于失效、风险、镜头拉远。
  - `impact-soft` / `impact-deep` / `thump` —— 冲击：受阻与转折用 `impact-soft`，机制崩塌用 `impact-deep`，心跳式落点用 `thump`。
  - 常用组合：whoosh 接下一拍的 `air-N` 铃（`whoosh → 叮`）是解释类视频最典型的揭示手势，铃要放整拍而不是十六分，避免和 whoosh 的尾巴糊在一起；反向蓄力接 impact（蓄力→落点）最强。
  - 音高层保持调内、气声层不带音高，两者不要互换：给 whoosh 加音高会破调，用铃替代 whoosh 会失去空间感。
- **节奏与密度**：单个音效不超过 2 秒；关键音效每 3–5 秒一个，10 秒内不超过 3 个。健康医疗类内容保持克制，不用警报式尖锐音；负面信息用下行与低频表达，不用刺耳高频。
- 不要用 `rate` 拉伸跑动或 riser 素材，会连带改变音高与卡点，需要别的长度就直接在 `make_sfx.py` 里生成。`compose.py` 用独立音效总线短促 sidechain 给动作让位，增益仍按动作力度逐条设置。
- **音效响度**：配置 `music.sfx_normalize: {target_peak_db, intensity_curve}` 后，`gain` 表示「力度」而不是绝对倍数——会先按素材实测峰值把每条拉齐到 `target_peak_db`（第 1 期用 -6.5），再用 `intensity_curve`（0.4）压缩轻重差别。不配这个键则沿用旧的绝对倍数行为。素材原始峰值相差可达 10 dB，直接填小倍数（0.05–0.2）会让音效被 BGM 完全盖住。
- `bgm_envelope` 用 `[秒, 音量]` 控制音乐情绪；BGM 缺失时合成失败，不用静音冒充完成。
- **真峰与编码器**：`loudnorm` 的 `TP` 只管滤镜链内部，成片真峰取决于编码器。ffmpeg 自带的 `aac` 在打击类音效上实测过冲可达 3 dB 以上（母线 -3.3 dBTP → 解码 0.1 dBTP），所以默认用 macOS 的 `aac_at`（过冲约 0.8 dB）。`compose.py` 会先出音频母线 wav，再逐轮「编码一次 → 测解码后真峰」，直到 ≤ `true_peak_max`（默认 -1.8）再封视频，避免为了一个尖峰反复重编视频。可用 `script.json` 的 `audio_encoder` / `true_peak_max` / `limiter_limit` 覆盖。
- 文字通过 `window.__audit()` 返回屏幕坐标，并带 `lineStarts`（每个换行片段的行首字符）。主句至少 64px，解释至少 44px，免责声明至少 36px。闭标点（`，。？！、；：）】》` 等）出现在行首时审计报警，不改排版。
- 转场优先对象原位变化、镜头和路径连续。`fadeIn/fadeOut` 只保留给旧期兼容，不作为新期换场方式。
- 自动质检不能代替逐拍人工复核：仍需确认因果、比喻含义、阅读速度、动作落点和声音同步。

## 性能与磁盘

jpg q95 + 2x：约 8–15 fps。116 秒 60fps 成片约 7000 帧，渲染约 10 分钟，合成约 2–4 分钟。发布后可删除 `out/frames/`，保留 `story.js`、`script.json`、成片和 `qa/`。
