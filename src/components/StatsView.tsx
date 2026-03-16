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
      <div className="text-center py-20" style={{ color: "var(--muted)" }}>
        <div className="text-5xl mb-4">📊</div>
        <p>还没有数据，先去打卡吧！</p>
      </div>
    );
  }

  const card = "rounded-2xl p-5 border mb-4";
  const cardStyle = { background: "var(--card)", borderColor: "#f0ece4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>数据统计</h1>

      {/* Line chart */}
      <div className={card} style={cardStyle}>
        <p className="text-xs font-semibold mb-4 tracking-wide uppercase" style={{ color: "var(--muted)" }}>
          近 30 天每日完成数
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#c0b8b0" }} interval={6} />
            <YAxis tick={{ fontSize: 10, fill: "#c0b8b0" }} allowDecimals={false} width={20} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #f0ece4", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Line type="monotone" dataKey="完成数" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "var(--primary)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion rate per habit */}
      <div className={card} style={cardStyle}>
        <p className="text-xs font-semibold mb-4 tracking-wide uppercase" style={{ color: "var(--muted)" }}>
          各习惯近 30 天完成率
        </p>
        <div className="space-y-4">
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
              <div className="w-full rounded-full h-1.5" style={{ background: "#f0ece4" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${h.rate}%`, background: h.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak ranking */}
      <div className={card} style={cardStyle}>
        <p className="text-xs font-semibold mb-4 tracking-wide uppercase" style={{ color: "var(--muted)" }}>
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
  );
}
