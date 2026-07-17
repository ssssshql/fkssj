# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"水世界" 是一个基于 AutoJs6 (Android JavaScript 自动化框架) 的手游辅助工具，用于自动化操作"疯狂水世界"游戏。

- 入口文件: `main.js`（UI 布局 + 启动/停止逻辑）
- 测试脚本: `test/识图/` 和 `test/点击/` 用于调试识别参数
- 图片资源: `img/` 存放本地图，`gameHelper.loadImages()` 统一加载

## 运行方式

项目通过 AutoJs6 App 在 Android 设备上运行，不是 Node.js 项目。
- 设备上路径: `/sdcard/脚本/水世界/`
- 运行: 在 AutoJs6 中直接打开 `main.js` 执行
- 测试脚本可在 AutoJs6 中单独运行调试

## 架构

### 模块划分

| 模块 | 职责 |
|------|------|
| `main.js` | UI 布局、页面导航、任务调度、状态管理 |
| `modules/theme.js` | 颜色常量、作物配置、兑换码数据 |
| `modules/uiHelpers.js` | 日志、统计更新、导航切换、兑换码列表、圆形图标 |
| `modules/floatingPanel.js` | 悬浮球、控制面板、Tab/模式切换、运行状态 UI |
| `modules/gameHelper.js` | 图像识别（findFirst/findAll/findAndClick）、showOverlay、loadImages |
| `modules/plantFood.js` | 种植任务：收割→翻地→播种，库存满自动切换作物 |
| `modules/fleet.js` | 舰队通用操作：isIdle / selectUnchecked / dispatch |
| `modules/war.js` | 盟战任务：进攻/防守模式 |
| `modules/merchantShip.js` | 搁浅商船任务：整点一次/持续检测模式 |

### UI 层 (`main.js`)
- 采用 AutoJs6 的 XML-in-JS 写法（类似 JSX）
- Material Design 风格配色
- 底部浮窗导航：主页 / 兑换码 / 关于
- 悬浮球 (`floatingPanel.showBall`) 与控制面板 (`floatingPanel.expandPanel`) 互相切换
- 所有 UI 更新必须通过 `$ui.run()` 包裹（AutoJs6 跨线程 UI 要求）

### 控制面板（悬浮球展开后）
- 4 个 Tab：种植 / 锻造 / 商船 / 盟战
- 种植：选择作物下拉
- 商船：运行模式（整点一次 / 持续检测）
- 盟战：战斗模式（进攻 / 防守）

### 自动化层
- `findFirst` / `findAll`：基于 `images.findImage` / `images.matchTemplate`
- `showOverlay`：`floaty.rawWindow` + Canvas 绘制识别结果叠加层（1.5s 自动消失）
- 种植：自动检测空闲舰队 → 收割（轮询所有作物）→ 翻地播种 → 库存满自动切换
- 锻造：检测 `开始锻造.png` → 点击；检测 `锻造完成.png` → 点击空白区域
- 盟战：`fleet.isIdle` → 点击堡垒 → 前往/进攻 → `fleet.selectUnchecked` → `fleet.dispatch`
- 商船：`fleet.isIdle` → 商船图标 → 万吨商轮 → 货轮在列表 → 前往 → 舰队前往 → 勾选出征

### 关键注意事项
- `require()` 需使用相对路径（如 `./modules/gameHelper.js`）
- `captureScreen()` / `requestScreenCaptureAsync()` 是全局函数，无需 require
- 悬浮窗使用 `floaty.rawWindow()` 创建，支持 XML 布局
- 线程用 `threads.start(function(){...})` 启动
- `findAll` 返回的是 `{x, y}` 数组，不是原始 matchTemplate 对象
- 悬浮窗控件更新需要在 UI 线程执行，使用 `$ui.run(function(){...})`

# 参考文档

本地文档位于 `AutoJs6-Documentation/api/` 目录，开发前务必查阅：
- `ui.md` — UI 布局属性（`w`, `h`, `padding`, `margin`, `layout_weight` 等）
- `floaty.md` — 悬浮窗
- `images/` — 截图识别相关 API
- `http.md` — 网络请求
- `files.md` — 文件操作

## DTS 类型提示

```bash
npm run dts       # 安装 @sm003/autojs6-dts 类型定义
npm run dts-link  # 创建符号链接
```
