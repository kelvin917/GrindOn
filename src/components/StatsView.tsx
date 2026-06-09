"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Habit } from "@/lib/types";

interface CheckInRecord {
  habit_id: string;
  checked_date: string;
}

function getLast30Days() {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function calcStreak(habitId: string, checkIns: CheckInRecord[]): number {
  const today = new Date().toISOString().split("T")[0];
  const dates = checkIns
    .filter((c) => c.habit_id === habitId)
    .map((c) => c.checked_date).sort().reverse();
  if (dates.length === 0) return 0;
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const exp = new Date(today);
    exp.setDate(exp.getDate() - i);
    if (dates[i] === exp.toISOString().split("T")[0]) streak++;
    else break;
  }
  return streak;
}

export default function StatsView({ habits, checkIns }: { habits: Habit[]; checkIns: CheckInRecord[] }) {
  const last30 = getLast30Days();

  const chartData = last30.map((date) => ({
    date: date.slice(5),
    完成数: checkIns.filter((c) => c.checked_date === date).length,
  }));

  const habitStats = habits.map((h) => {
    const total = last30.filter((d) =>
      checkIns.some((c) => c.habit_id === h.id && c.checked_date === d)
    ).length;
    return { ...h, streak: calcStreak(h.id, checkIns), rate: Math.round((total / 30) * 100), total30: total };
  });

  if (habits.length === 0) {
    return (
      <div className="text-center py-28" style={{ color: "var(--muted)" }}>
        <div className="text-5xl mb-5 drift">📊</div>
        <p className="serif text-xl" style={{ color: "var(--text)" }}>还没有轨迹</p>
        <p className="text-xs mt-2 tracking-[0.15em] uppercase">go check in first</p>
      </div>
    );
  }

  const card = "rounded-3xl p-5 glass glow-hover";
  const avgRate = Math.round(habitStats.reduce((s, h) => s + h.rate, 0) / habitStats.length);
  const maxStreak = habitStats.reduce((m, h) => Math.max(m, h.streak), 0);
  const totalDone = habitStats.reduce((s, h) => s + h.total30, 0);

  const statBlock = (label: string, value: number, unit: string, color: string, extra = "") => (
    <div className={`${card} ${extra} flex flex-col justify-between min-h-24 rise-in`}>
      <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>{label}</span>
      <div>
        <span className="serif text-4xl lg:text-5xl" style={{ color }}>{value}</span>
        <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="rise-in">
      <div className="mb-5 lg:mb-7">
        <h1 className="serif text-4xl lg:text-5xl" style={{ color: "var(--text)" }}>轨迹</h1>
        <p className="text-xs mt-2 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>last 30 nights</p>
      </div>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statBlock("avg rate", avgRate, "%", "var(--primary)")}
        {statBlock("best streak", maxStreak, "天 🔥", "var(--streak)")}
        {statBlock("done · 30d", totalDone, "次", "var(--text)", "col-span-2 lg:col-span-1")}

        {/* 趋势 · 大块 */}
        <div className={`${card} col-span-2 lg:col-span-3 rise-in`}>
          <p className="text-[11px] mb-3 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
            每日完成数
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27314f" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7e88a8" }} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#7e88a8" }} allowDecimals={false} width={20} />
              <Tooltip
                contentStyle={{ background: "#161d31", borderRadius: "12px", border: "1px solid #27314f", fontSize: "12px", color: "#e8ebf7", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                labelStyle={{ color: "#e8ebf7" }}
                itemStyle={{ color: "#7e9dff" }}
              />
              <Line type="monotone" dataKey="完成数" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "var(--primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 完成率 · 宽块 */}
        <div className={`${card} col-span-2 rise-in`}>
          <p className="text-[11px] mb-3 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
            各习惯近 30 天完成率
          </p>
          <div className="space-y-3">
            {habitStats.map((h) => (
              <div key={h.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{h.icon}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{h.name}</span>
                    {h.streak > 0 && (
                      <span className="text-xs font-medium" style={{ color: "var(--streak)" }}>🔥 {h.streak}天</span>
                    )}
                  </div>
                  <span className="text-sm font-bold" style={{ color: h.color }}>{h.rate}%</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: "var(--surface)" }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${h.rate}%`, background: h.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 排行 · 窄块 */}
        <div className={`${card} col-span-2 lg:col-span-1 rise-in`}>
          <p className="text-[11px] mb-3 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
            连续打卡排行
          </p>
          <div className="space-y-3">
            {[...habitStats].sort((a, b) => b.streak - a.streak).map((h, i) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-sm font-bold w-5 text-center" style={{ color: i === 0 ? "var(--streak)" : "var(--muted)" }}>
                  {i === 0 ? "🥇" : i + 1}
                </span>
                <span
                  className="w-8 h-8 text-lg flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: h.color + "22" }}
                >
                  {h.icon}
                </span>
                <span className="flex-1 text-sm" style={{ color: "var(--text)" }}>{h.name}</span>
                <span className="text-sm font-semibold" style={{ color: h.streak > 0 ? "var(--streak)" : "var(--muted)" }}>
                  {h.streak > 0 ? `🔥 ${h.streak} 天` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
