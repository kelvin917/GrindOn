import { createClient } from "@/lib/supabase/server";
import { Work } from "@/lib/types";
import WorksView from "@/components/WorksView";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .order("created_at", { ascending: false });

  return <WorksView initialWorks={(data as Work[]) ?? []} />;
}
