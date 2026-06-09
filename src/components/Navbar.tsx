"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/", label: "打卡", icon: "✦" },
  { href: "/portfolio", label: "作品", icon: "❖" },
  { href: "/stats", label: "统计", icon: "◉" },
  { href: "/finance", label: "财务", icon: "¤" },
  { href: "/notes", label: "笔记", icon: "✎" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── 右上角悬浮退出 ── */}
      <button
        onClick={handleLogout}
        className="fixed top-5 right-5 lg:top-6 lg:right-8 z-30 glass glow-hover rounded-full w-10 h-10 flex items-center justify-center text-base transition-all hover:scale-105"
        style={{ color: "var(--muted)" }}
        aria-label="退出登录"
        title="退出登录"
      >
        ⏻
      </button>

      {/* ── 底部悬浮胶囊 Dock ── */}
      <nav className="fixed bottom-5 lg:bottom-7 left-1/2 -translate-x-1/2 z-30">
        <div
          className="glass rounded-full px-2.5 py-2 flex items-center gap-1"
          style={{
            boxShadow:
              "0 0 0 1px rgba(126,157,255,0.15), 0 10px 44px rgba(0,0,0,0.55), 0 0 32px rgba(126,157,255,0.14)",
          }}
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="group relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-3xl transition-all duration-300 hover:scale-105"
                style={{ background: active ? "var(--primary-light)" : "transparent" }}
              >
                {/* active 顶部发光圆点 */}
                {active && (
                  <span
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }}
                  />
                )}
                <span
                  className="text-lg leading-none transition-all duration-300 group-hover:-translate-y-0.5"
                  style={{
                    color: active ? "var(--primary)" : "var(--muted)",
                    filter: active ? "drop-shadow(0 0 8px rgba(126,157,255,0.85))" : "none",
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  className="text-[10px] tracking-wide transition-colors"
                  style={{ color: active ? "var(--primary)" : "var(--muted)" }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
