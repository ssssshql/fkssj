# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"水世界" 是一个基于 AutoJs6 (Android JavaScript 自动化框架) 的手游辅助工具，用于自动化操作"疯狂水世界"游戏。

- 入口文件: `main.js`（UI + 悬浮球/面板逻辑）
- 核心模块: `modules/gameHelper.js`（图像识别 + 点击/滑动自动化）
- 测试脚本: `test/识图/` 和 `test/点击/` 用于调试识别参数
- 图片资源: `img/` 存放本地图，`gameHelper.loadImages()` 从远程 URL 加载

## 运行方式

项目通过 AutoJs6 App 在 Android 设备上运行，不是 Node.js 项目。
- 设备上路径: `/sdcard/脚本/水世界/`
- 运行: 在 AutoJs6 中直接打开 `main.js` 执行
- 测试脚本可在 AutoJs6 中单独运行调试

## 架构要点

### UI 层 (`main.js`)
- 使用 `@ts-nocheck`，采用 AutoJs6 的 XML-in-JS 写法（类似 JSX）
- Material Design 3 配色（`C` 对象定义颜色常量）
- 三个 Tab: 种食物 / 打武器 / 盟战
- 悬浮球 (`showBall`) 与控制面板 (`expandPanel`) 互相切换
- 所有 UI 更新必须通过 `$ui.run()` 包裹（AutoJs6 跨线程 UI 要求）

### 自动化层 (`modules/gameHelper.js`)
- `findAndClick` / `findFirst` / `findAll`: 基于 `images.findImage` / `images.matchTemplate` 的图像识别
- `autoPlantFood`: 识别镰刀位置 → 识别所有水稻位置 → `gesture` 批量滑动收割
- `showOverlay`: 使用 `floaty.rawWindow` + Canvas 绘制识别结果可视化叠加层
- `autoWeapon` / `autoWar`: 待实现占位

### 关键注意事项
- `require()` 需使用绝对路径（如 `/sdcard/脚本/水世界/modules/gameHelper.js`），AutoJs6 的模块解析与 Node.js 不同
- `captureScreen()` / `requestScreenCaptureAsync()` 是全局函数，无需 require
- 悬浮窗使用 `floaty.rawWindow()` 创建，支持 XML 布局
- 线程用 `threads.start(function(){...})` 启动
- `findAll` 返回的是 `{x, y}` 数组，不是原始 matchTemplate 对象

## DTS 类型提示

```bash
npm run dts       # 安装 @sm003/autojs6-dts 类型定义
npm run dts-link  # 创建符号链接
```
