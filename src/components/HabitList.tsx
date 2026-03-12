"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Habit } from "@/lib/types";

const ICONS = ["💪", "📚", "🏃", "🧘", "💧", "🎯", "✍️", "🎨", "🌿", "⭐"];
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
    await supabase.from("habits").insert({
      user_id: userId,
      name: name.trim(),
      icon,
      color,
    });
    setName("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setShowForm(false);
    setSaving(false);
    router.refresh();
  }

  async function deleteHabit(id: string) {
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {habits.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>还没有任何习惯，点击下方添加</p>
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: habit.color + "22" }}
              >
                {habit.icon}
              </span>
              <span className="font-medium text-gray-800">{habit.name}</span>
            </div>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">添加新习惯</h3>
          <input
            type="text"
            placeholder="习惯名称（如：每日运动）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 mb-4"
          />
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">选择图标</p>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${
                    icon === i ? "ring-2 ring-indigo-400 bg-indigo-50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2">选择颜色</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addHabit}
              disabled={saving || !name.trim()}
              className="flex-1 bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "添加习惯"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-indigo-500 text-white rounded-2xl py-3.5 font-medium hover:bg-indigo-600 transition-colors shadow-sm"
        >
          + 添加习惯
        </button>
      )}
    </div>
  );
}
