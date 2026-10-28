# 医学科普漫画 · 视频生产线

面向账号「医学科普漫画」的长期系列科普视频生产仓库：医学机制准确、因果完整、赏心悦目、老奶奶也能看懂。

## 快速开始（新一期）

```bash
python3 pipeline/new_episode.py ep003-hypertension "高血压：血管里的「水压」为什么会升高？"
# 1) 写 episodes/ep003-hypertension/story.js（分镜动画，API 见 pipeline/engine.js）
# 2) 填 script.json（时长/音效/拍点文案）
python3 pipeline/render.py episodes/ep003-hypertension --fps 60
python3 pipeline/compose.py episodes/ep003-hypertension
python3 pipeline/qacheck.py episodes/ep003-hypertension   # 看 out/qa/ 抽帧
```

改局部不用全渲：`render.py <ep> --from 12 --to 20` 只补 12–20 秒的帧，再 compose 即可。

## 目录

| 路径 | 内容 |
|---|---|
| `AGENTS.md` | **项目铁律与流程（开工前必读）** |
| `brand/` | 视觉规范与色板 tokens |
| `pipeline/` | 引擎与渲染/合成/质检工具；`factcheck.md` 是医学论断进分镜前的事实核查关卡 |
| `episodes/` | 每期一个目录（`_template` 为模板） |
| `queue/topics.json` | 选题队列（全系列唯一事实来源） |
| `assets/audio/sfx/` | 共用音效库（配乐不在这里，在每期目录的 `bgm.mp3`） |
| `reference/netter/` | 奈特解剖涂色书（只核对结构，禁止描图进成片） |
| `reference/anatomy/` | 可进成片的开放许可解剖静帧，须在 `MANIFEST.json` 登记 |

## 自动化程度说明

- 生产流水线已全自动化（渲染→合成→质检一条命令）。
- 选题推进是「半自动」：任意新会话在本仓库说「继续下一期」，即可按 AGENTS.md + queue 接续；创意与质检由 agent 完成，发布由你手动上传。
- 持续集成交付：每期成片在 `episodes/<slug>/out/` 下，通过质检后即可发布。

## 已完成

- 第 1 期《糖尿病，只是糖吃多了吗？》— `episodes/ep001-diabetes/`（2026-10-26 按连续叙事工作流整体重做；旧版在 `refs/legacy/`）
- 第 2 期《血糖报告怎么看？》— `episodes/ep002-blood-sugar-report/`，模型与用量见 `usage.json`
- 第 3 期《高血压》— `episodes/ep003-hypertension/`，模型与用量见 `usage.json`
- 第 4 期《血脂报告：胆固醇为什么分「好」和「坏」？》— `episodes/ep004-lipid-report/`
- 第 5 期《不喝酒，为什么也会得脂肪肝？》— `episodes/ep005-fatty-liver/`

第 2–5 期按第 1 期 v6 的声音标准统一交付：77 BPM 音乐网格逐拍对齐、逐句阅读窗口、对象跟随名牌、六层音效（whoosh / riser / downlifter / impact / chime / arpeggio），音效峰值按 `lead` 落在动作帧上。成片统一 1080×1440 / 60fps / 116s，`qacheck` 通过（-13.5 LUFS、真峰 ≤ -2.4 dBTP、0 黑场、0 冻帧、节拍布局 0 异常）。

每期模型和 token 记在该期目录的 `usage.json`。质检通过后跑 `python3 pipeline/usage.py episodes/<slug>` 生成。
