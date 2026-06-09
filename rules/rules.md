# GrindOn 开发规范

## 目录

- [技术栈约定](#技术栈约定)
- [文件结构规范](#文件结构规范)
- [数据库规范](#数据库规范)
- [组件规范](#组件规范)
- [样式规范](#样式规范)
- [已实现功能](#已实现功能)

---

## 技术栈约定

- **框架**：Next.js 15（App Router）
- **样式**：Tailwind CSS v4
- **数据库 + 认证**：Supabase（@supabase/ssr）
- **图表**：Recharts
- **语言**：TypeScript 5

---

## 文件结构规范

```
src/
  app/
    login/              ← 登录页（未认证用户入口）
    (protected)/        ← 路由组，所有页面要求登录
      page.tsx          ← 今日打卡首页（含习惯增删，已合并原习惯页）
      portfolio/        ← 个人作品集
      stats/            ← 数据统计
      finance/          ← 财务记账（收支双记 + 多币种汇率）
      notes/            ← 笔记功能
  components/           ← 可复用 UI 组件
  lib/
    types.ts            ← 所有接口类型定义
    supabase/
      client.ts         ← 浏览器端客户端
      server.ts         ← 服务端客户端
      middleware.ts     ← 路由保护中间件
```

---

## 数据库规范

- 所有表必须开启 **Row Level Security（RLS）**
- 每张表都要有 `user_id uuid references auth.users(id)` 字段
- 每张表都要有 `created_at timestamptz default now()` 字段
- 新增表后同步更新 `supabase_schema.sql`
- `transactions`（财务）：收支双记，含 `type`(`income`/`expense`) + `amount`(>0) + `category` + `note` + `currency` + `occurred_at`；财产 = Σincome − Σexpense
- **多币种 + 自动汇率**：每笔记原币种原金额，财产 / 月额按**实时汇率**（`api.frankfurter.dev`，无 key）折算到基准币；基准币顶部可切换。币种列表与兜底汇率在 `FinanceView.tsx` 的 `CURRENCIES` / `FALLBACK_RATES`（增减币种改这两处）
- `works`（个人作品）：`title` + `description` + `link` + `tags`(`text[]`)；作品墙 Bento 卡片 + Modal（标签回车/逗号成 chip）
- 习惯增删已并入打卡页（`TodayCheckin.tsx`：方块点击打卡、右上 ✕ 删除、末尾「＋」开添加 Modal）；原 `/habits` + `HabitList.tsx` 已无导航入口（文件保留）

---

## 组件规范

- 服务端数据获取在 `page.tsx`（Server Component），传 props 给 Client Component
- 需要交互的组件顶部加 `"use client"`
- 所有类型定义放 `src/lib/types.ts`，不要散落在组件里

---

## 样式规范

### 主题：静夜澪（Quiet Night · 深色）

深夜靛蓝为底，月光澪水为主色，星河微光渐变浮于天际。

CSS 变量（定义在 `globals.css`）：

| 变量               | 值        | 用途                   |
| ------------------ | --------- | ---------------------- |
| `--bg`             | `#0d1320` | 页面背景 · 夜空底色     |
| `--card`           | `#161d31` | 卡片背景               |
| `--surface`        | `#1e2742` | 图标 / 次级表面 / 轨道 |
| `--text`           | `#e8ebf7` | 主文字 · 月光白         |
| `--muted`          | `#7e88a8` | 次要文字 · 远山雾蓝     |
| `--primary`        | `#7e9dff` | 主色 · 澪（映月之水）   |
| `--primary-light`  | `#1d2950` | 选中态底光             |
| `--streak`         | `#f2b06a` | Streak · 灯火暖橙       |
| `--border`         | `#27314f` | 边线                   |
| `--input`          | `#10162a` | 输入框背景 · 深潭       |
| `--danger`         | `#f17a8a` | 删除 / 错误 · 落樱红    |

- **优先使用 CSS 变量，不要硬编码颜色值**（含 Tailwind 的 `bg-white`、`border-gray-*`、`text-gray-*` 等浅色类）
- 主色按钮文字用深色 `#0d1320` 以保证对比度

### 版式 · 艺术化（留白做骨架，辉光做呼吸）

工具类（定义在 `globals.css`）：

| 类           | 作用                                       |
| ------------ | ------------------------------------------ |
| `.serif`     | 衬线标题 · 细体宽间距（标题、数字、空状态） |
| `.glass`     | 玻璃拟态卡片 · 半透明 + `blur(16px)`        |
| `.glow-hover`| hover 浮起月光光晕                         |
| `.glow-ring` | 常亮呼吸辉光描边 · 用于主元素              |
| `.moon-glow` | 月光微亮呼吸动画 · 用于点睛 logo / 图标     |
| `.rise-in`   | 缓缓上浮入场（列表项配 `animationDelay` 错落）|
| `.drift`     | 装饰元素轻轻游移                           |

排版原则：
- **卡片统一用** `.glass`（替代实色卡片），圆角 `rounded-3xl`，padding 宽松（`px-6 py-5`）
- **大标题用** `.serif`，字号拉大（`text-4xl ~ text-7xl`），辅以宽字距 uppercase 小字副标题
- **留白优先**：页面级 `lg:px-16 lg:pt-16`，区块间距 `mb-10 ~ mb-16`
- 辉光用月光蓝 `rgba(126,157,255,...)`；列表入场用 `.rise-in` + `animationDelay` 制造错落
- ⚠️ 改 `(protected)/layout.tsx` 的 padding 时，需同步 `NotesView` 的负边距 `-mx/-my` 与 `h-[calc(100vh-…)]`

### 布局骨架：Bento 便当格

打卡 / 习惯 / 统计三页统一用 **Bento 网格**——大小不一的方块拼贴一屏：

- 容器：`grid grid-cols-2 lg:grid-cols-3(或 4) gap-4`，方块用 `col-span-*` / `row-span-*` / `auto-rows-[…]` 错落
- 打卡首页（`page.tsx`）：进度环 `col-span-2 row-span-2` 大块 + 最长连续/今日剩余小块 +「每个习惯一个可点击正方形格子」
- `TodayCheckin` 返回 **fragment（无外层 div）**，方块直接并入父 Bento 网格；点击整块即打卡，完成态整格透习惯色辉光
- 习惯页：习惯方块网格 + 末尾虚线「+」添加块，表单为展开式
- 统计页：顶部三个数字小块（avg rate / best streak / done）+ 趋势大块 `col-span-3` + 完成率宽块 + 排行窄块
- 笔记页（`NotesView`）：**便利贴墙**——错落玻璃卡片网格（带彩色「图钉」光点，`i%5` 出竖长），点击在居中玻璃 **Modal**（`z-40`，遮罩 `backdrop-blur`）里编辑；新建卡为虚线「+」块。桌面 / 移动共用一套
- Tailwind v4：important 写后缀 `hover:opacity-100!`，固定尺寸优先 canonical 类（`min-h-30` / `line-clamp-8` 而非 `[…]`）

### 导航：悬浮胶囊 Dock

- `Navbar.tsx`：底部居中 `fixed` 玻璃胶囊（`rounded-full`），4 个图标横排，active 发光 + 顶部光点，hover 上浮放大；**退出**收在右上角悬浮玻璃圆按钮（`⏻`）
- 已废弃左侧固定侧栏 / 顶栏 / 底 tab；`layout.tsx` 内容全宽居中 `lg:max-w-6xl`，底部 `pb-32/36` 给 Dock 留空间
- Dock 是 `fixed bottom`（`z-30`），普通页底部已由 `layout` 的 `pb-32/lg:pb-36` 让出空间；笔记 Modal `z-40` 盖过 Dock

---

## 已实现功能

| 功能     | 路由      | 状态 |
| -------- | --------- | ---- |
| 登录认证 | `/login`     | ✅   |
| 打卡+习惯 | `/`          | ✅（习惯增删已并入打卡页） |
| 个人作品 | `/portfolio` | ✅   |
| 数据统计 | `/stats`     | ✅   |
| 财务记账 | `/finance`   | ✅   |
| 笔记     | `/notes`     | ✅   |
