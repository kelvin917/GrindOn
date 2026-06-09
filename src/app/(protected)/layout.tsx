import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      {/* 内容居中限宽，底部留出悬浮 Dock 空间 */}
      <main className="min-h-screen">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-28 lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-28">
          {children}
        </div>
      </main>
    </>
  );
}
