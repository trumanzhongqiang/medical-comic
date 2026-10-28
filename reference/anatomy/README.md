# 解剖参考与可进成片素材

两套东西必须分开：

| 位置 | 能否进成片 | 用途 |
|---|---|---|
| `reference/netter/` | 否 | 《奈特解剖涂色书》。只核对位置、比例、毗邻，禁止扫描、描图、抠图 |
| `reference/anatomy/plates/` | 可以，但必须逐件登记许可 | 自绘 2D 图纸，或已确认可商用的 3D 离线渲染静帧 |

## 奈特书

Elsevier / Frank H. Netter 的图不能因为“我有这本书”就进入视频。购买纸书只获得阅读权，不获得复制、改编或公开传播权。内部参考照按 `reference/netter/README.md` 存放，不参与渲染。

## 可进成片的来源

只接受下面几类，并在 `MANIFEST.json` 写明来源、许可证、链接和获取日期：

- 本项目原创绘制。
- CC0。
- CC BY / CC BY-SA，成片和 `episodes/<slug>/script.json` 都保留署名；CC BY-SA 的衍生画面也要以相同方式共享。
- 明确书面授予本项目商用、修改、公开传播权利的素材。

不要使用来源不明的“免费 3D 模型”、只允许个人学习的模型，或把他人渲染图去水印后使用。GLB/GLTF 原文件可以存档，但当前 Canvas 流水线吃的是离线渲染出的 PNG/WebP 静帧，由 `M.plate()` 做暖纸化处理。

## 已核验、可优先使用的开放项目

这些项目本身符合开放许可；具体下载的每个文件仍要写入清单，不能只凭项目名放行。

- [Z-Anatomy](https://github.com/Z-Anatomy/Z-Anatomy)：基于 BodyParts3D，网格为 CC BY-SA 4.0，原数据须按 CC BY-SA 2.1 JP 署名。
- [BodyParts3D](https://lifesciencedb.jp/bp3d/)：日本数据库，模型为 CC BY-SA 2.1 JP。
- [Open Anatomy Project](https://www.openanatomy.org/)：学术开放解剖图谱与模型，逐个数据集确认许可证。
- [NIH 3D](https://3d.nih.gov/)：公开科学模型聚合站，单件许可不统一，必须看每个模型页面。

Sketchfab、TurboSquid、CGTrader 上的“free”通常不是可商用许可，默认不采用。

## 制作流程

1. 用奈特书确认结构，不导出书中图像。
2. 选择已登记的开放模型，在 Blender 中按本期机位离线渲染透明 PNG。
3. 静帧放入 `reference/anatomy/plates/<system>/`，更新清单。
4. 在 `story.js` 里用 `M.plate(g, src, x, y, w, h, opts)` 嵌入，并加名称与作用名牌。
5. 漫画层、箭头和表演仍用引擎绘制，保证文字、数字和时间线确定可复现。
