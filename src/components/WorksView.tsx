"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Work } from "@/lib/types";

const PINS = ["#7e9dff", "#f2b06a", "#f17a8a", "#7fd9a8", "#b69dff", "#7ecbff"];

function hostOf(link: string) {
  try {
    return new URL(link.startsWith("http") ? link : `https://${link}`).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}
function hrefOf(link: string) {
  return link.startsWith("http") ? link : `https://${link}`;
}

export default function WorksView({ initialWorks }: { initialWorks: Work[] }) {
  const supabase = createClient();
  const [works, setWorks] = useState<Work[]>(initialWorks);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Work | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setLink("");
    setTags([]);
    setTagInput("");
    setOpen(true);
  }
  function openEdit(w: Work) {
    setEditing(w);
    setTitle(w.title);
    setDescription(w.description);
    setLink(w.link);
    setTags(w.tags ?? []);
    setTagInput("");
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }
  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function handleSave() {
    if (!title.trim() && !description.trim()) return;
    setSaving(true);
    const payload = { title: title.trim(), description: description.trim(), link: link.trim(), tags };

    if (editing) {
      const { data, error } = await supabase.from("works").update(payload).eq("id", editing.id).select().single();
      if (!error && data) {
        setWorks(works.map((w) => (w.id === data.id ? (data as Work) : w)));
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
      const { data, error } = await supabase.from("works").insert({ ...payload, user_id: user.id }).select().single();
      if (!error && data) {
        setWorks([data as Work, ...works]);
        close();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("works").delete().eq("id", id);
    setWorks(works.filter((w) => w.id !== id));
    close();
  }

  return (
    <div className="rise-in">
      {/* 标题 */}
      <div className="mb-5 lg:mb-7">
        <h1 className="serif text-4xl lg:text-5xl" style={{ color: "var(--text)" }}>作品</h1>
        <p className="text-xs mt-2 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
          things i&apos;ve made · {works.length}
        </p>
      </div>

      {/* ── 作品墙 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map((w, i) => {
          const pin = PINS[i % PINS.length];
          return (
            <div
              key={w.id}
              onClick={() => openEdit(w)}
              className="group relative glass glow-hover rounded-3xl p-5 flex flex-col cursor-pointer rise-in"
              style={{ animationDelay: `${i * 60}ms`, boxShadow: `0 0 18px ${pin}14` }}
            >
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: pin, boxShadow: `0 0 10px ${pin}` }} />

              <h2 className="serif text-xl leading-snug mb-1.5 pr-4" style={{ color: w.title ? "var(--text)" : "var(--muted)" }}>
                {w.title || "无题"}
              </h2>
              {w.description && (
                <p className="text-xs leading-relaxed line-clamp-3 mb-3" style={{ color: "var(--muted)" }}>
                  {w.description}
                </p>
              )}

              {w.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {w.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: pin + "1f", color: pin }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {w.link && (
                <a
                  href={hrefOf(w.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-auto text-xs tracking-wide truncate transition-opacity hover:opacity-80"
                  style={{ color: "var(--primary)" }}
                >
                  🔗 {hostOf(w.link)}
                </a>
              )}
            </div>
          );
        })}

        {/* 新作品卡 */}
        <button
          onClick={openNew}
          className="rounded-3xl flex flex-col items-center justify-center gap-2 min-h-40 transition-all glow-hover rise-in"
          style={{ border: "1.5px dashed var(--glass-border)", color: "var(--muted)", animationDelay: `${works.length * 60}ms` }}
        >
          <span className="text-3xl moon-glow" style={{ color: "var(--primary)" }}>+</span>
          <span className="text-xs tracking-wide">新作品</span>
        </button>
      </div>

      {/* ── 编辑 Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-10 lg:py-14"
          style={{ background: "rgba(8,12,22,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          onClick={close}
        >
          <div
            className="glass glow-ring rounded-3xl w-full max-w-lg flex flex-col rise-in"
            style={{ background: "rgba(22,29,49,0.94)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
                {editing ? "edit work" : "new work"}
              </span>
              <div className="flex items-center gap-5">
                {editing && (
                  <button onClick={() => handleDelete(editing.id)} className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--danger)" }}>
                    删除
                  </button>
                )}
                <button onClick={handleSave} disabled={saving || (!title.trim() && !description.trim())} className="text-sm font-semibold transition-opacity disabled:opacity-40" style={{ color: "var(--primary)" }}>
                  {saving ? "保存中…" : "保存"}
                </button>
                <button onClick={close} className="text-lg leading-none transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="关闭">✕</button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="作品名称"
                autoFocus
                className="serif w-full text-2xl outline-none bg-transparent placeholder:opacity-30"
                style={{ color: "var(--text)" }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简介 · 这是个什么作品"
                rows={3}
                className="w-full resize-none outline-none bg-transparent text-sm leading-relaxed placeholder:opacity-30"
                style={{ color: "var(--text)" }}
              />

              {/* 链接 */}
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="链接（github.com/… 或预览地址）"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border placeholder:opacity-40"
                style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)" }}
              />

              {/* 技术栈标签 */}
              <div>
                <p className="text-xs mb-2 tracking-wide" style={{ color: "var(--muted)" }}>技术栈 · 回车或逗号添加</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => removeTag(t)}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-opacity hover:opacity-70"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                      >
                        #{t} ✕
                      </button>
                    ))}
                  </div>
                )}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="如 Next.js / Swift…"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border placeholder:opacity-40"
                  style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
