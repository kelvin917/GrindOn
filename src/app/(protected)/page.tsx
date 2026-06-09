import { createClient } from "@/lib/supabase/server";
import TodayCheckin from "@/components/TodayCheckin";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: "夜未央", mark: "✧", glow: "#7e9dff", sub: "星河正浓" };
  if (h < 11) return { text: "早安", mark: "✦", glow: "#f2b06a", sub: "晨光熹微" };
  if (h < 14) return { text: "晌午好", mark: "✸", glow: "#7ecbff", sub: "日正当中" };
  if (h < 18) return { text: "午后好", mark: "✶", glow: "#7fd9a8", sub: "偷得浮闲" };
  if (h < 22) return { text: "晚上好", mark: "☽", glow: "#b69dff", sub: "华灯初上" };
  return { text: "夜深了", mark: "☾", glow: "#7e9dff", sub: "万籁俱寂" };
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-36 h-36 lg:w-44 lg:h-44">
        <svg viewBox="0 0 128 128" className="w-full h-full rotate-[-90deg]">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1e2742" strokeWidth="3" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="var(--primary)" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0 0 8px rgba(126,157,255,0.7))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="serif text-5xl lg:text-6xl moon-glow" style={{ color: "var(--text)", fontWeight: 300 }}>{done}</span>
          <span className="text-[10px] tracking-[0.3em] mt-1" style={{ color: "var(--muted)" }}>OF {total}</span>
        </div>
      </div>
      <p className="text-[10px] mt-4 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
        {done === total && total > 0 ? "all done tonight" : `${total - done} left`}
      </p>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];
  const greeting = getGreeting();

  if (!user) return null;

  const { data: habits } = await supabase
    .from("habits").select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: todayCheckins } = await supabase
    .from("check_ins").select("habit_id")
    .eq("user_id", user.id).eq("checked_date", today);

  const { data: allCheckins } = await supabase
    .from("check_ins").select("habit_id, checked_date")
    .eq("user_id", user.id)
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
  const maxStreak = habitsWithStats.reduce((m, h) => Math.max(m, h.streak), 0);

  return (
    <div className="rise-in">
      {/* Logo + 时段问候 */}
      <header className="mb-6 lg:mb-8">
        {/* GrindOn logo */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-base moon-glow leading-none" style={{ color: "var(--primary)" }}>✦</span>
          <span className="serif text-lg tracking-[0.12em]" style={{ color: "var(--primary)" }}>GrindOn</span>
          <span className="flex-1 h-px ml-1" style={{ background: "linear-gradient(90deg, var(--glass-border), transparent)" }} />
        </div>

        {/* 问候 */}
        <div className="flex items-end gap-3">
          <h1
            className="serif text-5xl lg:text-6xl leading-none"
            style={{ color: "var(--text)", textShadow: `0 0 30px ${greeting.glow}66` }}
          >
            {greeting.text}
          </h1>
          <span
            className="text-3xl lg:text-4xl drift mb-1.5 select-none leading-none"
            aria-hidden
            style={{ color: greeting.glow, textShadow: `0 0 18px ${greeting.glow}` }}
          >
            {greeting.mark}
          </span>
        </div>
        <p className="text-xs mt-3 tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", weekday: "long" })}
          <span className="serif normal-case tracking-normal ml-2" style={{ color: greeting.glow }}>· {greeting.sub}</span>
        </p>
      </header>

      {/* ── Bento grid：方块拼贴一屏（含「＋ 加习惯」入口） ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[122px] lg:auto-rows-[124px] grid-flow-row-dense">
          {/* 进度环 · 大块 2×2 */}
          <div className="col-span-2 row-span-2 glass glow-ring rounded-3xl p-4 rise-in">
            <ProgressRing done={completedCount} total={totalCount} />
          </div>

          {/* 最长连续 · 小块 */}
          <div className="glass glow-hover rounded-3xl p-5 flex flex-col justify-between rise-in" style={{ animationDelay: "60ms" }}>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>best streak</span>
            <div>
              <span className="serif text-4xl" style={{ color: "var(--streak)" }}>{maxStreak}</span>
              <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>天 🔥</span>
            </div>
          </div>

          {/* 今日剩余 · 小块 */}
          <div className="glass glow-hover rounded-3xl p-5 flex flex-col justify-between rise-in" style={{ animationDelay: "120ms" }}>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>remaining</span>
            <div>
              <span className="serif text-4xl" style={{ color: "var(--primary)" }}>{totalCount - completedCount}</span>
              <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>项待打卡</span>
            </div>
          </div>

          {/* 习惯方块们 · 点击打卡 / 右上删除 / 末尾「＋」加习惯 */}
          <TodayCheckin habits={habitsWithStats} today={today} userId={user.id} />
        </div>
    </div>
  );
}
