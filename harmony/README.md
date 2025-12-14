# HarmonyOS 6.0+（纯血版）移植版

本目录提供基于 HarmonyOS 6.0 及以上（纯血鸿蒙）的 Stage 模型 PPT 讲稿自动写入应用，复用原项目利用 PPTX 作为压缩包的思路，将每页讲稿写入备注区。

## 主要特性
- ArkTS 页面（`pages/Index.ets`）输入 PPTX 路径、输出路径及多段讲稿（双换行分隔）。
- 使用 `JSZip` 直接解压 PPTX，按顺序生成 `notesSlide*.xml`，并自动补全 Notes Master 以及关系文件。
- 支持语言标签（默认中文，可填 `en`/`es` 等）。

## 使用步骤
1. 将待处理的 PPTX 拷贝至设备存储（例如 `/data/storage/el2/base/ppt/input.pptx`）。
2. 在页面中输入：
   - 输入文件路径
   - 输出文件路径（应用会写入新文件）
   - 讲稿内容：使用空行分隔每一页。
3. 点击“写入备注”后，应用会生成含备注的新 PPTX。

## 目录结构
- `oh-package.json5` / `build-profile.json5` / `hvigorfile.ts`：HarmonyOS 构建配置（API Level 12）。
- `entry/src/main/ets/common/pptNotes.ts`：PPT 备注写入核心逻辑，基于 JSZip 解析与生成。
- `entry/src/main/ets/pages/Index.ets`：界面与交互。
- `entry/src/main/ets/entryability/EntryAbility.ets`：入口 Ability。

> 如需在模拟器/真机调试，请使用 DevEco Studio 打开 `harmony` 目录并选择 `entry` 模块打包 HAP。
