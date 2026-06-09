import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/lib/types";
import FinanceView from "@/components/FinanceView";

export default async function FinancePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  return <FinanceView initialTx={(data as Transaction[]) ?? []} />;
}
