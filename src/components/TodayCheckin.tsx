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
  const router = useRouter();

  async function toggleCheckin(habitId: string) {
    if (loading) return;
    setLoading(habitId);
    const supabase = createClient();

    if (checked.has(habitId)) {
      await supabase
        .from("check_ins")
        .delete()
        .eq("habit_id", habitId)
        .eq("checked_date", today);
      setChecked((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    } else {
      await supabase.from("check_ins").insert({
        habit_id: habitId,
        user_id: userId,
        checked_date: today,
      });
      setChecked((prev) => new Set(prev).add(habitId));
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const isDone = checked.has(habit.id);
        return (
          <div
            key={habit.id}
            className={`flex items-center justify-between bg-white rounded-2xl px-5 py-4 border shadow-sm transition-all ${
              isDone ? "border-indigo-200 bg-indigo-50/50" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: habit.color + "22" }}
              >
                {habit.icon}
              </span>
              <div>
                <p
                  className={`font-medium ${isDone ? "text-indigo-700" : "text-gray-800"}`}
                >
                  {habit.name}
                </p>
                {habit.streak > 0 && (
                  <p className="text-xs text-orange-500 font-medium mt-0.5">
                    🔥 连续 {habit.streak} 天
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleCheckin(habit.id)}
              disabled={loading === habit.id}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
                isDone
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {loading === habit.id ? "⏳" : isDone ? "✓" : "○"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
