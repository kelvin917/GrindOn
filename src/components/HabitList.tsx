"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Habit } from "@/lib/types";

const ICONS = [
  "💪",
  "📚",
  "🏃",
  "🧘",
  "💧",
  "🎯",
  "✍️",
  "🎨",
  "🌿",
  "⭐",
  "🎬",
  "📷",
  "🎹",
];
const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

export default function HabitList({
  habits,
  userId,
}: {
  habits: Habit[];
  userId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function addHabit() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("habits")
      .insert({ user_id: userId, name: name.trim(), icon, color });
    setName("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setShowForm(false);
    setSaving(false);
    router.refresh();
  }

  async function deleteHabit(id: string) {
    if (!confirm("删除这个习惯？打卡记录也会一并删除。")) return;
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="lg:max-w-4xl rise-in">
      <div className="mb-5 lg:mb-7">
        <h1 className="serif text-4xl lg:text-5xl" style={{ color: "var(--text)" }}>
          习惯
        </h1>
        <p className="text-xs mt-2 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
          tap ✕ to remove
        </p>
      </div>

      {/* Bento 习惯方块网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[124px] grid-flow-row-dense mb-6">
        {habits.map((habit, i) => (
          <div
            key={habit.id}
            className={`group relative glass glow-hover rounded-3xl p-5 flex flex-col justify-between rise-in ${i % 4 === 0 ? "lg:col-span-2" : ""}`}
            style={{ animationDelay: `${i * 60}ms`, boxShadow: `0 0 18px ${habit.color}18` }}
          >
            <div className="flex items-start justify-between">
              <span
                className="w-12 h-12 text-2xl flex items-center justify-center rounded-2xl"
                style={{ background: habit.color + "1f", boxShadow: `0 0 16px ${habit.color}33` }}
              >
                {habit.icon}
              </span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-60 hover:opacity-100! transition-opacity"
                style={{ color: "var(--muted)" }}
                aria-label="删除"
              >
                ✕
              </button>
            </div>
            <span className="text-base truncate" style={{ color: "var(--text)", fontWeight: 500 }}>
              {habit.name}
            </span>
          </div>
        ))}

        {/* 添加方块 */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-3xl p-5 flex flex-col items-center justify-center gap-2 transition-all glow-hover rise-in"
            style={{
              border: "1.5px dashed var(--glass-border)",
              color: "var(--muted)",
              animationDelay: `${habits.length * 60}ms`,
            }}
          >
            <span className="text-3xl moon-glow" style={{ color: "var(--primary)" }}>+</span>
            <span className="text-xs tracking-wide">添加习惯</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-3xl p-6 glass glow-ring rise-in lg:max-w-2xl">
          <h3 className="serif text-xl mb-5" style={{ color: "var(--text)" }}>
            添加新习惯
          </h3>

          <input
            type="text"
            placeholder="习惯名称（如：每日拍一张照）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            maxLength={20}
            autoFocus
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mb-4 placeholder:opacity-50"
            style={{
              borderColor: "var(--border)",
              background: "var(--input)",
              color: "var(--text)",
            }}
          />

          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
            选择图标
          </p>
          <div className="flex gap-2 flex-wrap mb-4">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className="w-9 h-9 rounded-xl text-lg transition-all"
                style={{
                  background: icon === i ? color + "33" : "var(--surface)",
                  outline: icon === i ? `2px solid ${color}` : "none",
                  outlineOffset: "1px",
                }}
              >
                {i}
              </button>
            ))}
          </div>

          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
            选择颜色
          </p>
          <div className="flex gap-2.5 mb-5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  outline: color === c ? `3px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addHabit}
              disabled={saving || !name.trim()}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--primary)", color: "#0d1320" }}
            >
              {saving ? "保存中…" : "添加"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ background: "var(--surface)", color: "var(--muted)" }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
