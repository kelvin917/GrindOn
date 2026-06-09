"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Transaction, TransactionType } from "@/lib/types";

/* ── 支持的货币 · 在此增减即可 ── */
const CURRENCIES = [
  { code: "SGD", symbol: "S$", label: "新币" },
  { code: "MYR", symbol: "RM", label: "马币" },
];
const symbolOf = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
/* fetch 失败时的兜底汇率（1 base = X other） */
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  SGD: { MYR: 3.16 },
  MYR: { SGD: 0.316 },
};

const EXPENSE_CATS = [
  { label: "餐饮", icon: "🍜" },
  { label: "购物", icon: "🛍️" },
  { label: "交通", icon: "🚇" },
  { label: "娱乐", icon: "🎮" },
  { label: "居住", icon: "🏠" },
  { label: "医疗", icon: "💊" },
  { label: "教育", icon: "📚" },
  { label: "其他", icon: "✨" },
];
const INCOME_CATS = [
  { label: "工资", icon: "💼" },
  { label: "兼职", icon: "💪" },
  { label: "投资", icon: "📈" },
  { label: "红包", icon: "🧧" },
  { label: "其他", icon: "✨" },
];
const ALL_CATS = [...EXPENSE_CATS, ...INCOME_CATS];
const catIcon = (label: string) => ALL_CATS.find((c) => c.label === label)?.icon ?? "✨";

const EXPENSE_COLOR = "#f2b06a";
const INCOME_COLOR = "#7fd9a8";

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export default function FinanceView({ initialTx }: { initialTx: Transaction[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction[]>(initialTx);

  // 基准币种 + 汇率（ECB 每日参考汇率）
  const [base, setBase] = useState(CURRENCIES[0].code);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesDate, setRatesDate] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [txCurrency, setTxCurrency] = useState(CURRENCIES[0].code);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0].label);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  // 拉实时汇率（基准币变化时刷新）
  useEffect(() => {
    const others = CURRENCIES.filter((c) => c.code !== base).map((c) => c.code).join(",");
    if (!others) return;
    let alive = true;
    fetch(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${others}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.rates) {
          setRates(d.rates as Record<string, number>);
          if (d.date) setRatesDate(d.date as string);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [base]);

  // 把某笔金额换算到基准币
  function toBase(amt: number, currency: string) {
    if (currency === base) return amt;
    const r = rates?.[currency] ?? FALLBACK_RATES[base]?.[currency];
    return r ? amt / r : amt;
  }

  // ── 统计（均以基准币计） ──
  const balance = tx.reduce((s, t) => s + (t.type === "income" ? 1 : -1) * toBase(Number(t.amount), t.currency), 0);
  const ym = new Date().toISOString().slice(0, 7);
  const monthTx = tx.filter((t) => t.occurred_at.startsWith(ym));
  const monthExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + toBase(Number(t.amount), t.currency), 0);
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + toBase(Number(t.amount), t.currency), 0);

  // 汇率提示
  const other = CURRENCIES.find((c) => c.code !== base);
  const rateLive = other ? rates?.[other.code] : undefined;
  const rateVal = other ? (rateLive ?? FALLBACK_RATES[base]?.[other.code]) : undefined;

  const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

  // 流水：按日期 + 创建时间倒序（最新 → 最旧）
  const sortedTx = [...tx].sort(
    (a, b) => b.occurred_at.localeCompare(a.occurred_at) || b.created_at.localeCompare(a.created_at),
  );

  function openNew() {
    setEditing(null);
    setType("expense");
    setTxCurrency(base);
    setAmount("");
    setCategory(EXPENSE_CATS[0].label);
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setType(t.type);
    setTxCurrency(t.currency);
    setAmount(String(t.amount));
    setCategory(t.category);
    setNote(t.note);
    setDate(t.occurred_at);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditing(null);
  }

  function switchType(next: TransactionType) {
    setType(next);
    const list = next === "expense" ? EXPENSE_CATS : INCOME_CATS;
    if (!list.some((c) => c.label === category)) setCategory(list[0].label);
  }

  async function handleSave() {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    setSaving(true);
    const payload = { type, amount: value, category, note: note.trim(), currency: txCurrency, occurred_at: date };

    if (editing) {
      const { data, error } = await supabase.from("transactions").update(payload).eq("id", editing.id).select().single();
      if (!error && data) {
        setTx(tx.map((t) => (t.id === data.id ? (data as Transaction) : t)));
        close();
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        return;
      }
      const { data, error } = await supabase.from("transactions").insert({ ...payload, user_id: user.id }).select().single();
      if (!error && data) {
        setTx([data as Transaction, ...tx]);
        close();
      }
    }
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    setTx(tx.filter((t) => t.id !== id));
    close();
    router.refresh();
  }

  return (
    <div className="rise-in">
      {/* 标题 */}
      <div className="mb-5 lg:mb-7">
        <h1 className="serif text-4xl lg:text-5xl" style={{ color: "var(--text)" }}>财务</h1>
        <p className="text-xs mt-2 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
          where it goes · what remains
        </p>
      </div>

      {/* ── Bento 概览 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* 财产余额 · 大块 */}
        <div className="col-span-2 row-span-2 glass glow-ring rounded-3xl p-6 flex flex-col justify-between min-h-44 rise-in">
          <div className="flex items-start justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>my balance · 当前财产</span>
            {/* 基准币切换 */}
            <div className="flex rounded-full p-0.5" style={{ background: "var(--input)" }}>
              {CURRENCIES.map((c) => {
                const active = base === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setBase(c.code)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={{ background: active ? "var(--primary-light)" : "transparent", color: active ? "var(--primary)" : "var(--muted)" }}
                  >
                    {c.symbol}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm" style={{ color: "var(--muted)" }}>{symbolOf(base)}</span>
              <span className="serif text-5xl lg:text-6xl moon-glow" style={{ color: balance >= 0 ? "var(--primary)" : "var(--danger)", fontWeight: 300 }}>
                {fmt(balance)}
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              共 {tx.length} 笔
              {other && rateVal ? (
                <span className="ml-2">
                  · {symbolOf(base)}1 ≈ {other.symbol}
                  {rateVal.toFixed(3)}
                  {rateLive ? ` · ${ratesDate ?? ""} 参考` : " 约"}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* 本月支出 */}
        <div className="glass glow-hover rounded-3xl p-5 flex flex-col justify-between min-h-24 rise-in" style={{ animationDelay: "60ms" }}>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>月支出 · {symbolOf(base)}</span>
          <span className="serif text-3xl lg:text-4xl" style={{ color: EXPENSE_COLOR }}>{fmt(monthExpense)}</span>
        </div>

        {/* 本月收入 */}
        <div className="glass glow-hover rounded-3xl p-5 flex flex-col justify-between min-h-24 rise-in" style={{ animationDelay: "120ms" }}>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>月收入 · {symbolOf(base)}</span>
          <span className="serif text-3xl lg:text-4xl" style={{ color: INCOME_COLOR }}>{fmt(monthIncome)}</span>
        </div>
      </div>

      {/* ── 交易流水 ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>近期流水</p>
        <button
          onClick={openNew}
          className="glass glow-hover rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105"
          style={{ color: "var(--primary)" }}
        >
          ＋ 记一笔
        </button>
      </div>

      {tx.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4 drift">🌙</div>
          <p className="serif text-lg" style={{ color: "var(--text)" }}>还没有记录</p>
          <p className="text-xs mt-1.5 tracking-wide">点「记一笔」开始</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTx.map((t, i) => {
            const isExpense = t.type === "expense";
            const color = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
            return (
              <button
                key={t.id}
                onClick={() => openEdit(t)}
                className="w-full glass glow-hover rounded-2xl px-5 py-3.5 flex items-center gap-4 text-left rise-in"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <span className="w-10 h-10 flex items-center justify-center rounded-xl text-lg shrink-0" style={{ background: color + "1f", boxShadow: `0 0 14px ${color}22` }}>
                  {catIcon(t.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--text)", fontWeight: 500 }}>
                    {t.category}
                    {t.note && <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>· {t.note}</span>}
                  </p>
                  <p className="text-[11px] mt-0.5 tracking-wide" style={{ color: "var(--muted)" }}>{fmtDate(t.occurred_at)}</p>
                </div>
                <span className="serif text-lg shrink-0" style={{ color }}>
                  {isExpense ? "−" : "+"}{symbolOf(t.currency)} {fmt(Number(t.amount))}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 记账 Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-10 lg:py-14"
          style={{ background: "rgba(8,12,22,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          onClick={close}
        >
          <div
            className="glass glow-ring rounded-3xl w-full max-w-md flex flex-col rise-in"
            style={{ background: "rgba(22,29,49,0.94)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
                {editing ? "edit" : "new record"}
              </span>
              <div className="flex items-center gap-5">
                {editing && (
                  <button onClick={() => handleDelete(editing.id)} className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--danger)" }}>
                    删除
                  </button>
                )}
                <button onClick={handleSave} disabled={saving || !parseFloat(amount)} className="text-sm font-semibold transition-opacity disabled:opacity-40" style={{ color: "var(--primary)" }}>
                  {saving ? "保存中…" : "保存"}
                </button>
                <button onClick={close} className="text-lg leading-none transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="关闭">✕</button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">
              {/* 类型 + 币种 */}
              <div className="flex gap-3">
                <div className="flex flex-1 rounded-2xl p-1" style={{ background: "var(--input)" }}>
                  {(["expense", "income"] as TransactionType[]).map((tp) => {
                    const active = type === tp;
                    const c = tp === "expense" ? EXPENSE_COLOR : INCOME_COLOR;
                    return (
                      <button
                        key={tp}
                        onClick={() => switchType(tp)}
                        className="flex-1 rounded-xl py-2 text-sm font-medium transition-all"
                        style={{ background: active ? c + "22" : "transparent", color: active ? c : "var(--muted)" }}
                      >
                        {tp === "expense" ? "支出" : "收入"}
                      </button>
                    );
                  })}
                </div>
                <div className="flex rounded-2xl p-1" style={{ background: "var(--input)" }}>
                  {CURRENCIES.map((c) => {
                    const active = txCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setTxCurrency(c.code)}
                        className="px-3 rounded-xl py-2 text-sm font-medium transition-all"
                        style={{ background: active ? "var(--primary-light)" : "transparent", color: active ? "var(--primary)" : "var(--muted)" }}
                      >
                        {c.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 金额 */}
              <div className="flex items-baseline gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
                <span className="text-base" style={{ color: "var(--muted)" }}>{symbolOf(txCurrency)}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  autoFocus
                  className="serif flex-1 text-4xl outline-none bg-transparent placeholder:opacity-30 min-w-0"
                  style={{ color: "var(--text)" }}
                />
              </div>

              {/* 类别 */}
              <div>
                <p className="text-xs mb-2.5 tracking-wide" style={{ color: "var(--muted)" }}>分类 · 花在哪</p>
                <div className="grid grid-cols-4 gap-2">
                  {cats.map((c) => {
                    const active = category === c.label;
                    return (
                      <button
                        key={c.label}
                        onClick={() => setCategory(c.label)}
                        className="flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-all"
                        style={{
                          background: active ? "var(--primary-light)" : "var(--surface)",
                          outline: active ? "1.5px solid var(--primary)" : "none",
                          outlineOffset: "-1.5px",
                        }}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-[11px]" style={{ color: active ? "var(--primary)" : "var(--muted)" }}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 备注 + 日期 */}
              <div className="flex gap-3">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="备注（可空）"
                  maxLength={40}
                  className="flex-1 min-w-0 rounded-xl px-4 py-2.5 text-sm outline-none border placeholder:opacity-40"
                  style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)" }}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-sm outline-none border"
                  style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)", colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
