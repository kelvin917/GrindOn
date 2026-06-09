import { createClient } from "@/lib/supabase/server";
import HabitList from "@/components/HabitList";

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <HabitList habits={habits ?? []} userId={user.id} />;
}
