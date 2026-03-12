import { createClient } from "@/lib/supabase/server";
import StatsView from "@/components/StatsView";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("habit_id, checked_date")
    .eq("user_id", user!.id)
    .order("checked_date", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据统计</h1>
      <StatsView habits={habits ?? []} checkIns={checkIns ?? []} />
    </div>
  );
}
