"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const tabs = [
  { href: "/", label: "打卡", icon: "✦" },
  { href: "/habits", label: "习惯", icon: "◈" },
  { href: "/stats", label: "统计", icon: "◉" },
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
      {/* Top bar — logo + logout */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--primary)" }}>
            GrindOn
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            退出
          </button>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all"
                style={{ color: active ? "var(--primary)" : "var(--muted)" }}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
                {active && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
