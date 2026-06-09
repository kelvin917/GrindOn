### 数据库（Supabase）

表结构在 `supabase_schema.sql`，两张表：`habits`、`check_ins`，均开启了 Row Level Security（用户只能访问自己的数据）。

认证通过 `@supabase/ssr` 实现，middleware 拦截 `/habits` 和 `/stats` 路径做保护。
