# GrindOn · 自律打卡

一个帮助你坚持日常习惯的打卡应用。

## 功能

- **每日打卡** — 点击完成当天的习惯任务
- **连续 Streak** — 追踪连续坚持天数，激励自己
- **数据统计** — 折线图 + 完成率 + 排行榜

## 技术栈

- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (数据库 + 用户认证)
- [Recharts](https://recharts.org/) (图表)

## 本地开发

### 1. 配置环境变量

```bash
cp .env.local.example .env.local
```

填入你的 Supabase 项目 URL 和 Anon Key（在 Supabase 控制台 → Settings → API 找到）。

### 2. 初始化数据库

在 Supabase SQL Editor 中运行 `supabase_schema.sql` 文件内容。

### 3. 启动开发服务器

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 部署

推荐使用 [Vercel](https://vercel.com/)，导入仓库后配置环境变量即可一键部署。
