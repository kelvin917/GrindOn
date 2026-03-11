import { createClient } from "@/lib/supabase/server";
import TodayCheckin from "@/components/TodayCheckin";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const { data: todayCheckins } = await supabase
    .from("check_ins")
    .select("habit_id")
    .eq("user_id", user!.id)
    .eq("checked_date", today);

  const checkedIds = new Set((todayCheckins ?? []).map((c) => c.habit_id));

  // 计算每个习惯的 streak
  const { data: allCheckins } = await supabase
    .from("check_ins")
    .select("habit_id, checked_date")
    .eq("user_id", user!.id)
    .order("checked_date", { ascending: false });

  function calcStreak(habitId: string): number {
    const dates = (allCheckins ?? [])
      .filter((c) => c.habit_id === habitId)
      .map((c) => c.checked_date)
      .sort()
      .reverse();

    if (dates.length === 0) return 0;

    let streak = 0;
    const current = new Date(today);

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(current);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">今日打卡</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {totalCount > 0 && (
        <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">今日进度</span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg font-medium">还没有习惯</p>
          <p className="text-sm mt-1">
            去{" "}
            <a href="/habits" className="text-indigo-500 underline">
              习惯管理
            </a>{" "}
            添加第一个习惯吧！
          </p>
        </div>
      ) : (
        <TodayCheckin habits={habitsWithStats} today={today} userId={user!.id} />
      )}
    </div>
  );
}
