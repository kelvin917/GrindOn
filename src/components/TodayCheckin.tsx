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

const ICONS = ["💪", "📚", "🏃", "🧘", "💧", "🎯", "✍️", "🎨", "🌿", "⭐", "🎬", "📷", "🎹"];
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];

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
    new Set(habits.filter((h) => h.checkedToday).map((h) => h.id)),
  );
  const [popping, setPopping] = useState<string | null>(null);
  const router = useRouter();

  // 添加习惯 Modal
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function toggleCheckin(habitId: string) {
    if (loading) return;
    setLoading(habitId);
    setPopping(habitId);
    setTimeout(() => setPopping(null), 300);

    const supabase = createClient();
    if (checked.has(habitId)) {
      await supabase.from("check_ins").delete().eq("habit_id", habitId).eq("checked_date", today);
      setChecked((prev) => {
        const s = new Set(prev);
        s.delete(habitId);
        return s;
      });
    } else {
      await supabase.from("check_ins").insert({ habit_id: habitId, user_id: userId, checked_date: today });
      setChecked((prev) => new Set(prev).add(habitId));
    }
    setLoading(null);
    router.refresh();
  }

  async function deleteHabit(id: string) {
    if (!confirm("删除这个习惯？打卡记录也会一并删除。")) return;
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    router.refresh();
  }

  async function addHabit() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("habits").insert({ user_id: userId, name: name.trim(), icon, color });
    setName("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setShowAdd(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      {habits.map((habit, i) => {
        const isDone = checked.has(habit.id);
        const isPopping = popping === habit.id;
        const isLoading = loading === habit.id;
        const m = i % 5;
        const tall = m === 0;
        const wide = m === 2;
        const spanClass = tall ? "lg:row-span-2" : wide ? "lg:col-span-2" : "";

        return (
          <div
            key={habit.id}
            onClick={() => toggleCheckin(habit.id)}
            className={`group relative glass glow-hover rounded-3xl p-5 flex flex-col justify-between rise-in cursor-pointer active:scale-[0.97] transition-transform ${spanClass} ${isPopping ? "check-pop" : ""}`}
            style={{
              animationDelay: `${(i + 3) * 60}ms`,
              background: isDone ? habit.color + "1f" : undefined,
              borderColor: isDone ? habit.color + "55" : undefined,
              boxShadow: isDone ? `0 0 26px ${habit.color}33` : undefined,
            }}
          >
            {/* 删除（hover 显，移动端淡显） */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteHabit(habit.id);
              }}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-opacity opacity-40 lg:opacity-0 lg:group-hover:opacity-60 hover:opacity-100!"
              style={{ color: "var(--muted)" }}
              aria-label="删除习惯"
            >
              ✕
            </button>

            {/* 图标（打卡后 ✓ / loading 转圈） */}
            <span
              className={`flex items-center justify-center rounded-2xl transition-all duration-500 ${tall ? "w-14 h-14 text-3xl" : "w-11 h-11 text-2xl"}`}
              style={{
                background: habit.color + (isDone ? "33" : "14"),
                boxShadow: isDone ? `0 0 16px ${habit.color}55` : "none",
              }}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: "var(--muted)" }} />
              ) : isDone ? (
                "✓"
              ) : (
                habit.icon
              )}
            </span>

            {/* 竖长块中间：大号 streak */}
            {tall && habit.streak > 0 && (
              <div className="hidden lg:flex flex-1 items-end">
                <span className="serif leading-none" style={{ color: "var(--streak)", fontSize: "3.25rem", fontWeight: 300 }}>
                  {habit.streak}
                  <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>天 🔥</span>
                </span>
              </div>
            )}

            {/* 底部：名字 + streak */}
            <div className="min-w-0">
              <p className="text-base truncate transition-colors duration-300" style={{ color: isDone ? habit.color : "var(--text)", fontWeight: 500 }}>
                {habit.name}
              </p>
              {habit.streak > 0 ? (
                <p className="text-xs mt-0.5 tracking-wide" style={{ color: "var(--streak)" }}>🔥 {habit.streak} 天</p>
              ) : (
                <p className="text-[10px] mt-0.5 tracking-[0.15em] uppercase" style={{ color: "var(--muted)" }}>start tonight</p>
              )}
            </div>
          </div>
        );
      })}

      {/* ＋ 添加习惯方块 */}
      <button
        onClick={() => setShowAdd(true)}
        className="rounded-3xl flex flex-col items-center justify-center gap-2 transition-all glow-hover rise-in"
        style={{ border: "1.5px dashed var(--glass-border)", color: "var(--muted)", animationDelay: `${(habits.length + 3) * 60}ms` }}
      >
        <span className="text-3xl moon-glow" style={{ color: "var(--primary)" }}>+</span>
        <span className="text-xs tracking-wide">加习惯</span>
      </button>

      {/* ── 添加习惯 Modal ── */}
      {showAdd && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-10 lg:py-14"
          style={{ background: "rgba(8,12,22,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="glass glow-ring rounded-3xl w-full max-w-md flex flex-col rise-in"
            style={{ background: "rgba(22,29,49,0.94)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>new habit</span>
              <div className="flex items-center gap-5">
                <button onClick={addHabit} disabled={saving || !name.trim()} className="text-sm font-semibold transition-opacity disabled:opacity-40" style={{ color: "var(--primary)" }}>
                  {saving ? "保存中…" : "添加"}
                </button>
                <button onClick={() => setShowAdd(false)} className="text-lg leading-none transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="关闭">✕</button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                placeholder="习惯名称（如：每日拍一张照）"
                maxLength={20}
                autoFocus
                className="serif w-full text-2xl outline-none bg-transparent placeholder:opacity-30"
                style={{ color: "var(--text)" }}
              />

              <div>
                <p className="text-xs mb-2.5 tracking-wide" style={{ color: "var(--muted)" }}>图标</p>
                <div className="grid grid-cols-7 gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className="aspect-square rounded-xl text-lg flex items-center justify-center transition-all"
                      style={{
                        background: icon === ic ? color + "33" : "var(--surface)",
                        outline: icon === ic ? `2px solid ${color}` : "none",
                        outlineOffset: "1px",
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2.5 tracking-wide" style={{ color: "var(--muted)" }}>颜色</p>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{ background: c, outline: color === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
