import { createClient } from "@/lib/supabase/server";
import TodayCheckin from "@/components/TodayCheckin";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: "夜深了", emoji: "🌙" };
  if (h < 12) return { text: "早上好", emoji: "🌤" };
  if (h < 18) return { text: "下午好", emoji: "☀️" };
  return { text: "晚上好", emoji: "🌆" };
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" className="rotate-[-90deg]">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#ede9fe" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="var(--primary)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: "var(--text)" }}>{done}</span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>/ {total}</span>
        </div>
      </div>
      <p className="text-sm mt-2 font-medium" style={{ color: "var(--muted)" }}>
        {done === total && total > 0 ? "🎉 今日全部完成！" : `还剩 ${total - done} 项`}
      </p>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];
  const greeting = getGreeting();

  const { data: habits } = await supabase
    .from("habits").select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const { data: todayCheckins } = await supabase
    .from("check_ins").select("habit_id")
    .eq("user_id", user!.id).eq("checked_date", today);

  const { data: allCheckins } = await supabase
    .from("check_ins").select("habit_id, checked_date")
    .eq("user_id", user!.id)
    .order("checked_date", { ascending: false });

  const checkedIds = new Set((todayCheckins ?? []).map((c) => c.habit_id));

  function calcStreak(habitId: string): number {
    const dates = (allCheckins ?? [])
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

  const habitsWithStats = (habits ?? []).map((h) => ({
    ...h,
    checkedToday: checkedIds.has(h.id),
    streak: calcStreak(h.id),
  }));

  const completedCount = habitsWithStats.filter((h) => h.checkedToday).length;
  const totalCount = habitsWithStats.length;

  return (
    <div>
      {/* Greeting */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {greeting.emoji} {greeting.text}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          {new Date().toLocaleDateString("zh-CN", {
            month: "long", day: "numeric", weekday: "long",
          })}
        </p>
      </div>

      {/* Progress ring */}
      {totalCount > 0 && <ProgressRing done={completedCount} total={totalCount} />}

      {/* Checkin list */}
      {totalCount === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">🌱</div>
          <p className="font-medium text-base">还没有习惯</p>
          <p className="text-sm mt-1">
            去{" "}
            <a href="/habits" style={{ color: "var(--primary)" }} className="underline underline-offset-2">
              习惯管理
            </a>{" "}
            添加第一个吧
          </p>
        </div>
      ) : (
        <TodayCheckin habits={habitsWithStats} today={today} userId={user!.id} />
      )}
    </div>
  );
}
