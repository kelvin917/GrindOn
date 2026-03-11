import { createClient } from "@/lib/supabase/server";
import HabitList from "@/components/HabitList";

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">习惯管理</h1>
      <HabitList habits={habits ?? []} userId={user!.id} />
    </div>
  );
}
