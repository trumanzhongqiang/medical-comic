# 医学科普漫画 · 视频生产线

面向账号「医学科普漫画」的系列科普视频仓库：一期只讲三件事，3:4 竖版、一百秒上下，画面全部由代码绘制。

开工前读三份：`pipeline/WRITING.md`（怎么写）、`pipeline/RETRO.md`（为什么这么写）、`AGENTS.md`（硬要求）。

## 一期怎么走

```bash
# 0) 从 queue/topics.json 取选题；医学论断先过 pipeline/factcheck.md
python3 pipeline/new_episode.py ep008-xxx "标题"

# 1) 写 episodes/<slug>/voice/text.txt，一句一行，先过文案体检
python3 pipeline/lint_narration.py ep008-xxx

# 2) 逐句配音（仓库外的 TTS 脚本，产出 voice/NNN.wav），按真实音频长度排轴
python3 pipeline/build_cues.py episodes/ep008-xxx --lead 1.2 --gap 0.60
python3 pipeline/import_cues.py episodes/ep008-xxx

# 3) 字幕断行体检，不渲染也能查
node remotion/scripts/check_wrap.mjs episodes/ep008-xxx

# 4) 出帧 → 合成 → 质检
python3 pipeline/render_remotion.py episodes/ep008-xxx --concurrency 6
python3 pipeline/compose.py episodes/ep008-xxx
/usr/bin/python3 pipeline/qacheck.py episodes/ep008-xxx
```

改一两拍不用全渲：`render_remotion.py <ep> --from 12 --to 20` 只补这一段，再 compose。

## 目录

| 路径 | 内容 |
|---|---|
| `AGENTS.md` | 项目铁律与流程 |
| `pipeline/WRITING.md` | 文案手册：六个手法、结构模板、体长基线 |
| `pipeline/RETRO.md` | 第 2 期复盘：六轮返工的根因与交付自检 |
| `pipeline/` | 排轴、音效、渲染、合成、质检、文案体检 |
| `remotion/` | 画面组件（按病种一个文件）与版式 |
| `episodes/` | 每期一个目录；`voice/text.txt` 是文案唯一来源 |
| `brand/` | 视觉规范与色板 tokens |
| `assets/audio/sfx/` | 共用音效库；配乐在每期的 `bgm.mp3` |
| `成片/` | 交付归档，不入库（`.gitignore` 里） |

## 交付口径

- 1080×1440 / 60fps，一期 9–12 拍、16–19 句、95–105 秒。
- 响度归一到 −14 LUFS 附近，真峰压到 −3 dBTP 以内；黑场与冻帧为 0。
- 文案体检 0 条硬伤才算写完。第 2、3、4 期都是 0 条。

## 已出片

| 期 | 选题 | 时长 |
|---|---|---|
| 第 1 期 | 糖尿病，只是糖吃多了吗 | 1:56 |
| 第 2 期 | 化验单上两个数，该信哪个 | 1:40 |
| 第 3 期 | 血压为什么分高压和低压 | 1:47 |
| 第 4 期 | 血脂报告，先看低密度 | 1:45 |
| 第 5 期 | 肝里的油是从哪来的 | 2:47 |
| 第 6 期 | 尿酸为什么会变成扎人的针 | 2:11 |
| 第 7 期 | 甲亢和甲减 | 3:56 |

第 2、3、4 期是按 `pipeline/WRITING.md` 重做过的版本，其余四期是早期版本，排队重写。

## 不做什么

- 不用 AI 生图，也不进素材库：对象、动作、颜色都由组件画出来。
- 不用要先建模型的比喻（比如把糖化说成「一本账」），观众不该为一句话先学一套概念。
- 不描解剖参考图：`reference/netter/` 只用来核对结构，不进成片。

## 免责声明

内容用于科普，不构成诊疗建议。每期底部有固定声明；个体情况请就医。
