import { createClient } from "@/lib/supabase/server";
import { Note } from "@/lib/types";
import NotesView from "@/components/NotesView";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  return <NotesView initialNotes={(data as Note[]) ?? []} />;
}
