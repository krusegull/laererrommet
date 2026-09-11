"use client";

import { useEffect, useState } from "react";
import { detectPriority, sortNotes } from "./noteUtils";
import { NoteRow, type NoteRowItem } from "./NoteRow";
import { NoteAddForm } from "./NoteAddForm";

export function ViktigeNotaterTab() {
  const [items, setItems] = useState<NoteRowItem[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notater/viktig")
      .then((res) => res.json())
      .then((data) => {
        const notes: NoteRowItem[] = (data.notes ?? []).map(
          (n: { id: string; content: string; priority: number | null; completed: boolean }) => ({
            id: n.id,
            content: n.content,
            priority: n.priority,
            completed: n.completed,
            dismissed: n.priority === null && detectPriority(n.content) !== null,
          })
        );
        setItems(notes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function addItem() {
    const content = draft.trim();
    if (!content) return;
    const priority = detectPriority(content);
    setDraft("");
    try {
      const res = await fetch("/api/notater/viktig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, priority }),
      });
      if (!res.ok) return;
      const { note } = await res.json();
      setItems((prev) => [
        ...prev,
        { id: note.id, content: note.content, priority: note.priority, completed: false, dismissed: false },
      ]);
    } catch {
      // Nettverksfeil - teksten forblir tapt fra utkastfeltet, men brukeren kan skrive den pa nytt
    }
  }

  async function patchItem(id: string, patch: { priority?: number | null; completed?: boolean }) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    try {
      await fetch(`/api/notater/viktig/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Nettverksfeil - lokal tilstand kan avvike fra serveren til neste reload
    }
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await fetch(`/api/notater/viktig/${id}`, { method: "DELETE" });
    } catch {
      // Nettverksfeil - elementet kan dukke opp igjen ved neste henting
    }
  }

  function dismissPriority(item: NoteRowItem) {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, dismissed: true } : it)));
    patchItem(item.id, { priority: null });
  }

  function restorePriority(item: NoteRowItem) {
    const detected = detectPriority(item.content);
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, dismissed: false, priority: detected } : it)));
    patchItem(item.id, { priority: detected });
  }

  const sorted = sortNotes(items);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <p className="font-semibold text-foreground">Viktige notater</p>
          <p className="text-xs text-foreground/50">
            Ikke bundet til noen uke – for det som gjelder over lengre tid, haster, eller er ekstra viktig.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-foreground/50">Laster...</p>
        ) : (
          <div className="flex flex-col gap-2 rounded-card border border-line bg-background p-3 shadow-card">
            <div className="flex flex-col gap-1.5">
              {sorted.map((item) => (
                <NoteRow
                  key={item.id}
                  item={item}
                  onToggleCompleted={() => patchItem(item.id, { completed: !item.completed })}
                  onDismissPriority={() => dismissPriority(item)}
                  onRestorePriority={() => restorePriority(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
            <NoteAddForm value={draft} onChange={setDraft} onSubmit={addItem} />
          </div>
        )}
      </div>

      <aside className="flex w-full flex-col gap-2 rounded-card border border-line bg-background-subtle/50 p-3 text-xs text-foreground/70 lg:w-56">
        <p className="font-semibold text-foreground">Prioritet</p>
        <p>
          Skriv <strong>1.</strong>, <strong>2.</strong> eller <strong>3.</strong> først i teksten. Notatet
          sorteres da automatisk: 1 øverst, 2 i midten, 3 nederst.
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-error" /> 1 = haster mest
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pink-500" /> 2 = viktig, ikke akutt
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> 3 = minst viktig
        </p>
        <p>Disse notatene forblir liggende til du sletter eller huker dem av – de tilhører ingen bestemt uke.</p>
      </aside>
    </div>
  );
}
