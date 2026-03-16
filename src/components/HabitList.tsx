"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Habit } from "@/lib/types";

const ICONS = ["💪", "📚", "🏃", "🧘", "💧", "🎯", "✍️", "🎨", "🌿", "⭐", "🎬", "📷"];
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function HabitList({ habits, userId }: { habits: Habit[]; userId: string }) {
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
    await supabase.from("habits").insert({ user_id: userId, name: name.trim(), icon, color });
    setName(""); setIcon(ICONS[0]); setColor(COLORS[0]);
    setShowForm(false); setSaving(false);
    router.refresh();
  }

  async function deleteHabit(id: string) {
    if (!confirm("删除这个习惯？打卡记录也会一并删除。")) return;
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>习惯管理</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>长按或点击 ✕ 删除习惯</p>
      </div>

      <div className="space-y-2.5 mb-5">
        {habits.length === 0 && !showForm && (
          <div className="text-center py-14" style={{ color: "var(--muted)" }}>
            <div className="text-5xl mb-3">📋</div>
            <p>还没有习惯，点下方添加</p>
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between rounded-2xl px-4 py-3.5 border"
            style={{
              background: "var(--card)",
              borderColor: "#f0ece4",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 text-xl flex items-center justify-center rounded-xl"
                style={{ background: habit.color + "22" }}
              >
                {habit.icon}
              </span>
              <span className="font-medium" style={{ color: "var(--text)" }}>{habit.name}</span>
            </div>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all hover:bg-red-50"
              style={{ color: "#d1c9c0" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: "var(--card)", borderColor: "#e0d8f0", boxShadow: "0 2px 12px rgba(99,102,241,0.08)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>添加新习惯</h3>

          <input
            type="text"
            placeholder="习惯名称（如：每日拍一张照）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            maxLength={20}
            autoFocus
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
            style={{
              borderColor: "#e5e0d8",
              background: "#faf9f6",
              color: "var(--text)",
            }}
          />

          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>选择图标</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className="w-9 h-9 rounded-xl text-lg transition-all"
                style={{
                  background: icon === i ? color + "22" : "#f5f3ef",
                  outline: icon === i ? `2px solid ${color}` : "none",
                  outlineOffset: "1px",
                }}
              >
                {i}
              </button>
            ))}
          </div>

          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>选择颜色</p>
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
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              {saving ? "保存中…" : "添加"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ background: "#f0ece4", color: "var(--muted)" }}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all active:scale-98"
          style={{ background: "var(--primary)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
        >
          + 添加习惯
        </button>
      )}
    </div>
  );
}
