"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Note } from "@/lib/types";

interface Props {
  initialNotes: Note[];
}

/* 便利贴图钉色 · 按顺序循环 */
const PINS = ["#7e9dff", "#f2b06a", "#f17a8a", "#7fd9a8", "#b69dff", "#7ecbff"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesView({ initialNotes }: Props) {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selected, setSelected] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  function openNew() {
    setSelected(null);
    setIsNew(true);
    setTitle("");
    setContent("");
    setOpen(true);
  }

  function openNote(note: Note) {
    setSelected(note);
    setIsNew(false);
    setTitle(note.title);
    setContent(note.content);
    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setSelected(null);
    setIsNew(false);
  }

  async function handleSave() {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);

    if (isNew) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        return;
      }
      const { data, error } = await supabase
        .from("notes")
        .insert({ title: title.trim(), content: content.trim(), user_id: user.id })
        .select()
        .single();
      if (!error && data) {
        setNotes([data, ...notes]);
        closeEditor();
      }
    } else if (selected) {
      const { data, error } = await supabase
        .from("notes")
        .update({ title: title.trim(), content: content.trim() })
        .eq("id", selected.id)
        .select()
        .single();
      if (!error && data) {
        setNotes(notes.map((n) => (n.id === data.id ? data : n)));
        closeEditor();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes.filter((n) => n.id !== id));
    closeEditor();
  }

  return (
    <div className="rise-in">
      {/* 标题 */}
      <div className="mb-10 lg:mb-14">
        <h1 className="serif text-4xl lg:text-5xl" style={{ color: "var(--text)" }}>笔记</h1>
        <p className="text-xs mt-3 tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
          {notes.length} pieces of night
        </p>
      </div>

      {/* ── 便利贴墙 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[170px]">
        {/* 笔记卡 */}
        {notes.map((note, i) => {
          const pin = PINS[i % PINS.length];
          const tall = i % 5 === 2;
          return (
            <button
              key={note.id}
              onClick={() => openNote(note)}
              className={`group relative glass glow-hover rounded-3xl p-5 flex flex-col text-left overflow-hidden rise-in ${tall ? "lg:row-span-2" : ""}`}
              style={{ animationDelay: `${(i + 1) * 60}ms`, boxShadow: `0 0 18px ${pin}14` }}
            >
              {/* 图钉光点 */}
              <span
                className="absolute top-4 right-4 w-2 h-2 rounded-full"
                style={{ background: pin, boxShadow: `0 0 10px ${pin}` }}
              />

              <p
                className="serif text-lg leading-snug mb-2 pr-4 line-clamp-2"
                style={{ color: note.title ? "var(--text)" : "var(--muted)" }}
              >
                {note.title || "无标题"}
              </p>
              {note.content && (
                <p
                  className={`text-xs leading-relaxed flex-1 ${tall ? "line-clamp-8" : "line-clamp-3"}`}
                  style={{ color: "var(--muted)" }}
                >
                  {note.content}
                </p>
              )}
              <p className="text-[10px] mt-3 tracking-wide" style={{ color: "var(--muted)", opacity: 0.7 }}>
                {formatDate(note.updated_at)}
              </p>
            </button>
          );
        })}

        {/* 新建卡 · 末尾 */}
        <button
          onClick={openNew}
          className="rounded-3xl flex flex-col items-center justify-center gap-2 transition-all glow-hover rise-in"
          style={{ border: "1.5px dashed var(--glass-border)", color: "var(--muted)", animationDelay: `${(notes.length + 1) * 60}ms` }}
        >
          <span className="text-3xl moon-glow" style={{ color: "var(--primary)" }}>+</span>
          <span className="text-xs tracking-wide">写一篇</span>
        </button>
      </div>

      {/* ── 编辑 Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 lg:p-8"
          style={{ background: "rgba(8,12,22,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          onClick={closeEditor}
        >
          <div
            className="glass glow-ring rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col rise-in"
            style={{ background: "rgba(22,29,49,0.92)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
                {isNew ? "new note" : "edit note"}
              </span>
              <div className="flex items-center gap-5">
                {!isNew && selected && (
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-sm transition-opacity hover:opacity-80"
                    style={{ color: "var(--danger)" }}
                  >
                    删除
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || (!title.trim() && !content.trim())}
                  className="text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ color: "var(--primary)" }}
                >
                  {saving ? "保存中…" : "保存"}
                </button>
                <button onClick={closeEditor} className="text-lg leading-none transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="关闭">
                  ✕
                </button>
              </div>
            </div>

            {/* body */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 py-5 gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题"
                autoFocus
                className="serif w-full text-2xl outline-none bg-transparent placeholder:opacity-30"
                style={{ color: "var(--text)" }}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="夜深了，写点什么…"
                className="flex-1 w-full resize-none outline-none bg-transparent text-base leading-relaxed placeholder:opacity-30 min-h-50"
                style={{ color: "var(--text)" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
