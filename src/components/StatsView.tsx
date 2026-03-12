"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
    .map((c) => c.checked_date)
    .sort()
    .reverse();

  if (dates.length === 0) return 0;
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toISOString().split("T")[0]) streak++;
    else break;
  }
  return streak;
}

export default function StatsView({
  habits,
  checkIns,
}: {
  habits: Habit[];
  checkIns: CheckInRecord[];
}) {
  const last30 = getLast30Days();

  // 每天完成的习惯数量（折线图数据）
  const chartData = last30.map((date) => {
    const count = checkIns.filter((c) => c.checked_date === date).length;
    return {
      date: date.slice(5), // MM-DD
      完成数: count,
    };
  });

  // 每个习惯的完成率（近30天）
  const habitStats = habits.map((h) => {
    const total = last30.filter((d) =>
      checkIns.some((c) => c.habit_id === h.id && c.checked_date === d)
    ).length;
    return {
      ...h,
      streak: calcStreak(h.id, checkIns),
      rate: Math.round((total / 30) * 100),
      total30: total,
    };
  });

  if (habits.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">📊</div>
        <p>还没有数据，先去打卡吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 折线图 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">
          近 30 天每日完成数
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              interval={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="完成数"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 各习惯完成率 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">
          各习惯近 30 天完成率
        </h2>
        <div className="space-y-4">
          {habitStats.map((h) => (
            <div key={h.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{h.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {h.name}
                  </span>
                  {h.streak > 0 && (
                    <span className="text-xs text-orange-500 font-medium">
                      🔥 {h.streak}天
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {h.rate}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${h.rate}%`,
                    backgroundColor: h.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak 排行 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">
          连续打卡排行
        </h2>
        <div className="space-y-3">
          {[...habitStats]
            .sort((a, b) => b.streak - a.streak)
            .map((h, i) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">
                  {i + 1}
                </span>
                <span>{h.icon}</span>
                <span className="flex-1 text-sm text-gray-700">{h.name}</span>
                <span className="text-sm font-semibold text-orange-500">
                  {h.streak > 0 ? `🔥 ${h.streak} 天` : "未开始"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
