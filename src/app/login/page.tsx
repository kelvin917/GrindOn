import LoginForm from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">GrindOn</h1>
          <p className="text-gray-500 mt-2">自律打卡，坚持每一天</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
