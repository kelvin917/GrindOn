# GrindOn 更新记录

## 2026-06-09 — 打卡/习惯合并 + 新增「个人作品」模块

### 方案

① 把习惯管理并入打卡首页（不再单独占导航位）；② 空出的位置放新的「个人作品」集，Dock 第 2 位从「习惯」换成「作品」。

### 变更内容

**① 打卡 + 习惯合并**
- `TodayCheckin.tsx`：习惯方块由 `button` 改 `div`——点击整块打卡、右上 ✕ 删除（hover 显/移动淡显）、末尾「＋ 加习惯」方块开**添加 Modal**（名称 + 图标网格 + 颜色，搬自原 HabitList）
- `page.tsx`：去掉「去习惯管理」空状态分支，0 习惯时也渲染 Bento（靠「＋」块引导添加）
- 原 `/habits` + `HabitList.tsx` 保留文件但移除导航入口

**② 个人作品模块**
- 数据库：新增 `works` 表（`title`/`description`/`link`/`tags text[]`，RLS 四策略 + 索引；远程已建，`supabase_schema.sql` 同步）
- `src/lib/types.ts` — 新增 `Work`
- `src/app/(protected)/portfolio/page.tsx` — SSR 拉取作品
- `src/components/WorksView.tsx` — Bento 作品卡墙（标题 + 简介 + 技术栈 chips + 链接 + 彩色图钉）+ 编辑 Modal（标签回车/逗号成 chip、点 chip 删除）
- `src/components/Navbar.tsx` — Dock 第 2 位「习惯 ◈」→「作品 ❖」

**文档**
- `rules/rules.md` — 文件结构 / 功能表 / 数据库规范同步

---

## 2026-06-09 — 新增「财务」模块（收支双记）

### 方案

在 GrindOn 里加财务记账：记录消费花在哪、财产还剩多少。**收支双记**模型——财产 = 总收入 − 总支出，自动算。沿用静夜澪 Bento + 玻璃辉光风格。

### 变更内容

**数据库（Supabase · 已远程建表）**
- 新增 `transactions` 表：`type`(income/expense) + `amount`(numeric>0) + `category` + `note` + `occurred_at` + `user_id`，开 RLS（四条策略），加 `(user_id, occurred_at desc)` 索引
- 同步 `supabase_schema.sql`

**前端**
- `src/lib/types.ts` — 新增 `Transaction` / `TransactionType`
- `src/app/(protected)/finance/page.tsx` — Server Component，SSR 拉取交易（按日期倒序）
- `src/components/FinanceView.tsx` — Bento 概览（财产余额大块 + 本月支出 / 收入小块）+ 交易流水列表 + 记账 Modal（支出/收入切换、金额、分类图标、备注、日期；可编辑删除）
- `src/components/Navbar.tsx` — Dock 新增「财务 ¤」入口（第 5 个），单格宽收到 `w-14` 防小屏溢出

**文档**
- `rules/rules.md` — 文件结构 / 数据库规范 / 已实现功能表均补财务

---

## 2026-06-09 — 财务模块加多币种 + 自动汇率

### 方案

用户在新币（SGD）和马币（MYR）之间用钱，需要多币种记账 + 自动汇率换算。每笔记原币种原金额，财产 / 月额按实时汇率折算到可切换的基准币。

### 变更内容

**数据库**
- `transactions` 加 `currency text not null default 'SGD'`（远程已 alter，`supabase_schema.sql` 同步）

**前端 `FinanceView.tsx`**
- `CURRENCIES`（SGD=S$ / MYR=RM，可增减）+ `symbolOf` + `FALLBACK_RATES` 兜底汇率
- 实时汇率：`useEffect` 拉 `api.frankfurter.dev/v1/latest?base=…&symbols=…`（无 key、含 SGD/MYR），失败用兜底
- `toBase()` 把每笔换算到基准币；财产 / 月支出 / 月收入均按基准币汇总
- 余额大块右上**基准币切换**（S$ / RM）+ 汇率提示行（`S$1 ≈ RM3.xxx`，实时/约）
- 记账 Modal 加**币种选择**，金额前缀随币种；流水列表显示各笔原币种符号
- `src/lib/types.ts` — `Transaction` 加 `currency`

> 注：原占位 `CURRENCY` 常量已被多币种系统取代

---

## 2026-06-08 — 打卡 / 习惯 / 统计三页紧凑化（尽量一屏）

### 方案

用户反馈打开后还要往下翻才能看到下面，原因是顶部大标题留白过重 + Bento 方块行高偏高。整体紧凑化，让首屏尽量看全。

### 变更内容

- **`layout.tsx`**：上下留白收紧 `pt-8→pt-6 / lg:pt-12→lg:pt-8`、`pb-32/36→pb-28`。
- **首页 `page.tsx`**：标题留白 `mb-12/16→mb-5/7`、字号 `text-5xl/7xl→text-4xl/5xl`，方块行高 `150px→124px`。
- **习惯页 `HabitList`**：标题留白收紧、行高 `150px→124px`、`gap-4→gap-3`。
- **统计页 `StatsView`**（信息最密）：标题留白收紧、卡片 `p-6→p-5`、趋势图 `height 200→150`、小标题 `mb-5→mb-3`、完成率列表 `space-y-4→space-y-3`、统计小块 `min-h-30→min-h-24`、`gap-4→gap-3`。

---

## 2026-06-08 — 笔记页改「便利贴墙」

### 方案

原笔记页是「左列表 + 右编辑器」两栏，与整体 Bento + 悬浮美学脱节。改成 **便利贴墙**：错落的玻璃卡片网格，点击在居中玻璃 Modal 里编辑。

### 变更内容

- **`NotesView.tsx`** 整体重写：
  - 笔记卡片 Bento 墙（`grid-cols-2 lg:grid-cols-4 auto-rows-[170px] grid-flow-row-dense`），`i%5` 出竖长卡，每卡右上角一枚彩色「图钉」发光点（`PINS` 调色板循环），显示标题 / 正文预览 / 时间
  - 点击卡片 → 居中玻璃 **Modal**（`z-40`，遮罩 `backdrop-blur` 暗化，点遮罩关闭），含 serif 标题输入 + textarea + 保存 / 删除 / 关闭
  - 新建卡为虚线「+ 写一篇」块
  - 废弃旧的左右分栏 + 移动全屏编辑 + 全高 `calc` 负边距逻辑，桌面 / 移动统一
- `rules/rules.md` — 更新笔记页与 Dock 层级说明

---

## 2026-06-08 — Navbar 改悬浮胶囊 Dock

### 方案

原「左侧固定侧栏 + 顶栏 + 底部 tab」三套导航觉得单调，统一换成一个**悬浮发光胶囊 Dock**（桌面 / 移动通用），退出按钮收到右上角。

### 变更内容

- **`Navbar.tsx`** 整体重写：底部居中 `fixed` 玻璃胶囊（`rounded-full`），4 图标横排，active 发光 + 顶部光点 + `primary-light` 底，hover 上浮放大；右上角悬浮玻璃圆退出按钮（`⏻`）。删除原侧栏 / 顶栏 / 底 tab 三套结构。
- **`layout.tsx`**：去掉 `lg:ml-56`（不再为侧栏让位），内容全宽居中 `lg:max-w-6xl`，底部 `pb-32/lg:pb-36` 给 Dock 留空间。
- **`NotesView.tsx`**：全高分栏高度改 `calc(100vh-11rem)`、负边距同步为 `-mx-10 -mt-12`，底部让给 Dock。

**文档**
- `rules/rules.md` — 新增「导航：悬浮胶囊 Dock」小节

---

## 2026-06-07 — Bento 便当格布局重构（换骨架）

### 方案

上一版只换了视觉皮肤（留白 + 辉光），骨架仍是「侧栏 + 单列列表」。本次彻底换排版骨架，三个核心页改为 **Bento 便当格**：大小不一的方块拼贴一屏，信息密度高、现代感强。配色仍是静夜澪。

### 变更内容

- **打卡首页（`page.tsx`）**：从「进度环 + 单列列表」改为 Bento 网格——进度环 `col-span-2 row-span-2` 大块 + 最长连续 / 今日剩余两个数字小块 + 习惯方块。新增 `maxStreak` 计算。
- **`TodayCheckin.tsx`**：从竖列表 `<div>` 改为返回 **fragment**，每个习惯是一个可点击的正方形格子（点击整块打卡），并入父 Bento 网格；完成态整格透习惯色辉光、右上角勾选指示。
- **`HabitList.tsx`**：习惯列表改为 Bento 方块网格（`grid-cols-2 lg:grid-cols-3 auto-rows-[150px]`），删除按钮 hover 浮现；末尾虚线「+」添加方块，表单改为展开式。
- **`StatsView.tsx`**：改为 Bento——顶部三个数字小块（avg rate / best streak / done·30d）+ 趋势折线 `col-span-3` 大块 + 完成率宽块 + 排行窄块。新增 `avgRate / maxStreak / totalDone` 汇总与 `statBlock` helper。
- **方块错落**：习惯方块按 index 取模分配不规则尺寸——首页 `i%5` 出竖长（`lg:row-span-2`，中间填大号 streak 数字）/ 横宽（`lg:col-span-2`）；习惯页 `i%4` 出横宽；容器开 `grid-flow-row-dense` 自动填补空洞。
- 修正 Tailwind v4 canonical 类警告：`hover:opacity-100!`、`min-h-30`。

**文档**
- `rules/rules.md` — 新增「布局骨架：Bento 便当格」小节

---

## 2026-06-07 — 艺术化版式重构（留白 + 辉光）

### 方案

在「静夜澪」夜色配色基础上，把规整正式的网格版式，改为「极简留白 + 发光氛围」的艺术化版式：大量负空间、衬线大标题、玻璃拟态卡片、月光辉光描边与呼吸光晕。

### 变更内容

**设计语言（`globals.css`）**
- 新增衬线变量 `--serif`、玻璃变量 `--glass / --glass-border`
- `body` 加大 `line-height: 1.7`、`letter-spacing`
- 新增工具类：`.serif`（衬线细体标题）、`.glass`（玻璃拟态）、`.glow-hover`、`.glow-ring`、`.rise-in`（错落入场）、`.drift`（游移装饰）
- `.moon-glow` 升级为带 `drop-shadow` 的呼吸辉光

**逐页重排**
- `(protected)/page.tsx` — 衬线超大问候、漂浮 emoji、进度环放大为细环 + 衬线大数字 + 双层辉光
- `TodayCheckin.tsx` — 玻璃卡片 + 完成态习惯色辉光 + 错落入场，间距拉松
- `Navbar.tsx` — 侧栏玻璃化、衬线 logo「静夜澪」、导航去盒子化改月光竖线标记 active、图标辉光
- `HabitList.tsx` / `StatsView.tsx` — 衬线大标题（习惯 / 轨迹）、玻璃卡片、宽字距小标题、空状态衬线化
- `NotesView.tsx` — 衬线标题、列表项玻璃辉光、衬线标题输入框、留白空状态
- `LoginForm.tsx` — 玻璃拟态 + 呼吸辉光描边
- `(protected)/layout.tsx` — 桌面留白加大至 `lg:px-16 lg:pt-16`（同步 NotesView 负边距）

**文档**
- `rules/rules.md` — 样式规范新增「版式 · 艺术化」工具类表与排版原则

---

## 2026-06-07 — 「静夜澪」深色主题换肤

### 方案

将整体界面从暖米色亮色风格，换成「静夜澪」深色主题：深夜靛蓝底色、月光澪水主色、星河微光渐变背景。全部颜色收敛到 `globals.css` 的 CSS 变量，组件内不再有写死的浅色值。

### 变更内容

**主题（`globals.css`）**
- 重写 `:root` 配色为深色调，新增 `--surface / --border / --input / --danger` 变量
- `body` 增加三层 `radial-gradient` 星河微光，`background-attachment: fixed`
- 新增 `moon-glow` 月光微亮动画

**组件换肤（清除所有浅色硬编码）**
- `Navbar.tsx` — 侧栏 / 顶栏 / 底栏边框与半透明背景改夜色
- `HabitList.tsx` — 卡片、输入框、图标格、按钮文字（主色按钮用深色字）
- `TodayCheckin.tsx` — 卡片边框、完成态辉光、未完成圆圈按钮
- `StatsView.tsx` — 卡片、Recharts 网格/坐标轴/Tooltip 深色化、进度条轨道
- `NotesView.tsx` — 分栏边框、全屏编辑器背景、占位符、删除按钮
- `LoginForm.tsx` + `login/page.tsx` — 整体重写为夜色，标题加月光辉光
- `(protected)/page.tsx` — 进度环轨道改深色，主色圆弧加月光 drop-shadow

**文档**
- `rules/rules.md` — 样式规范更新为「静夜澪」配色表与新约定

---

## 2026-06-06 — 笔记功能

### 方案

新增独立笔记模块，支持创建、编辑、删除笔记，数据存储在 Supabase，全程 RLS 保护。

### 变更内容

**数据库（Supabase）**
- 新增 `notes` 表：`id / user_id / title / content / created_at / updated_at`
- 开启 RLS，用户只能访问自己的笔记
- 添加 `update_notes_updated_at` trigger，自动更新 `updated_at` 字段

**前端**
- `src/lib/types.ts` — 新增 `Note` 接口
- `src/components/NotesView.tsx` — 笔记列表 + 全屏编辑器（新建 / 编辑 / 删除）
- `src/app/(protected)/notes/page.tsx` — Server Component，SSR 拉取笔记列表
- `src/components/Navbar.tsx` — 底部 Tab 新增「笔记 ✎」入口

**文档**
- `rules/rules.md` — 项目开发规范（首次创建）
- `supabase_schema.sql` — 同步 notes 表 DDL
