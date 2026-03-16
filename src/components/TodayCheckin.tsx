"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HabitItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  checkedToday: boolean;
  streak: number;
}

export default function TodayCheckin({
  habits,
  today,
  userId,
}: {
  habits: HabitItem[];
  today: string;
  userId: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(
    new Set(habits.filter((h) => h.checkedToday).map((h) => h.id))
  );
  const [popping, setPopping] = useState<string | null>(null);
  const router = useRouter();

  async function toggleCheckin(habitId: string) {
    if (loading) return;
    setLoading(habitId);
    setPopping(habitId);
    setTimeout(() => setPopping(null), 300);

    const supabase = createClient();

    if (checked.has(habitId)) {
      await supabase
        .from("check_ins").delete()
        .eq("habit_id", habitId).eq("checked_date", today);
      setChecked((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
    } else {
      await supabase.from("check_ins").insert({ habit_id: habitId, user_id: userId, checked_date: today });
      setChecked((prev) => new Set(prev).add(habitId));
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const isDone = checked.has(habit.id);
        const isPopping = popping === habit.id;

        return (
          <div
            key={habit.id}
            className={`flex items-center gap-4 rounded-2xl px-4 py-4 border transition-all duration-300 ${isPopping ? "check-pop" : ""}`}
            style={{
              background: isDone ? habit.color + "0f" : "var(--card)",
              borderColor: isDone ? habit.color + "44" : "#f0ece4",
              boxShadow: isDone ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0 transition-all duration-300"
              style={{ background: habit.color + (isDone ? "33" : "18") }}
            >
              {isDone ? "✓" : habit.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-base truncate transition-colors duration-200"
                style={{ color: isDone ? habit.color : "var(--text)" }}
              >
                {habit.name}
              </p>
              {habit.streak > 0 ? (
                <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--streak)" }}>
                  🔥 连续 {habit.streak} 天
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  今天开始吧
                </p>
              )}
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggleCheckin(habit.id)}
              disabled={loading === habit.id}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-200 active:scale-90"
              style={{
                background: isDone ? habit.color : "#f0ece4",
                color: isDone ? "white" : "#c0b8b0",
                boxShadow: isDone ? `0 2px 8px ${habit.color}55` : "none",
              }}
            >
              {loading === habit.id ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isDone ? (
                "✓"
              ) : (
                "○"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
