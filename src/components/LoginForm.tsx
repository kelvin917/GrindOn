"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("注册成功！请查收邮件确认账号，然后登录。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("邮箱或密码错误");
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--input)",
    color: "var(--text)",
  };

  return (
    <div
      className="rounded-3xl p-8 glass glow-ring rise-in"
      style={{ boxShadow: "0 0 0 1px rgba(126,157,255,0.18), 0 0 40px rgba(126,157,255,0.12), 0 20px 60px rgba(0,0,0,0.5)" }}
    >
      <h2 className="serif text-2xl mb-7" style={{ color: "var(--text)" }}>
        {isSignUp ? "注册账号" : "欢迎回来"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 placeholder:opacity-40"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="至少 6 位"
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 placeholder:opacity-40"
            style={inputStyle}
          />
        </div>

        {error && (
          <p className="text-sm rounded-xl px-4 py-2.5" style={{ color: "var(--danger)", background: "rgba(241,122,138,0.12)" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm rounded-xl px-4 py-2.5" style={{ color: "#7fd9a8", background: "rgba(127,217,168,0.12)" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 font-semibold disabled:opacity-50 transition-all active:scale-98"
          style={{ background: "var(--primary)", color: "#0d1320", boxShadow: "0 4px 18px rgba(126,157,255,0.3)" }}
        >
          {loading ? "处理中..." : isSignUp ? "注册" : "登录"}
        </button>
      </form>

      <p className="text-center text-sm mt-4" style={{ color: "var(--muted)" }}>
        {isSignUp ? "已有账号？" : "没有账号？"}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setMessage("");
          }}
          className="font-medium hover:underline ml-1"
          style={{ color: "var(--primary)" }}
        >
          {isSignUp ? "去登录" : "注册"}
        </button>
      </p>
    </div>
  );
}
