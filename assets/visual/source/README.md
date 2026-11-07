# 视觉动画素材来源与许可

复用规矩与 `assets/audio/sfx/source/README.md` 一致：引入素材必须在本文件登记；
替换同名文件即可换素材，许可证明随文件保留。

## lottie/

| 文件 | 许可 | 来源 | 用在哪 |
|---|---|---|---|
| `pulse-line.json` | ORIGINAL（本仓库手作，可随意商用） | 按品牌色 `tealDark #1E6865` 手写的心电图脉冲线（Lottie v5.7.4，30fps，72 帧循环），经 `@remotion/lottie` 逐帧驱动 | 第 4 期 checkup 拍（年年体检）装饰线 |

## 引入路径（已验证 2026-11-06）

- 运行库：`@remotion/lottie@4.0.409` + `lottie-web@5.13.0`（均 MIT，已入 `remotion/package.json`）。
- Lottie 按 Remotion 当前帧推进（帧确定性，可并行渲染）——**不要**用自带时钟的粒子库
  （tsParticles 等）直接嵌 Remotion：它们靠 wall-clock/rAF 推进，逐帧渲染时每帧会重置。
- 新素材放进 `lottie/`，在 `Episode.tsx` 以 `<Lottie animationData={...} loop />` 挂载，
  并在上表登记：文件、许可、来源、用途。外部素材（LottieFiles 等）须逐文件确认可商用。
