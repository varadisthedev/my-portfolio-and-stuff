"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Trash2, Pencil, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import { PLATFORMS, PLATFORM_KEYS, getPlatform } from "@/lib/platforms";

export interface LinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  order: number;
}

interface Props {
  initialLinks: LinkItem[];
}

export function AdminLinksManager({ initialLinks }: Props) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState(PLATFORM_KEYS[0]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: newPlatform, label: newLabel.trim() || undefined, url: newUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add link");
        return;
      }
      setLinks((prev) => [...prev, data]);
      setNewLabel("");
      setNewUrl("");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: string, patch: Partial<Pick<LinkItem, "platform" | "label" | "url">>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update link");
        return;
      }
      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this link?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete link");
        return;
      }
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setBusy(false);
    }
  }

  async function persistOrder(ordered: LinkItem[]) {
    setLinks(ordered);
    await fetch("/api/links/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ordered.map((l) => l.id) }),
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const reordered = [...links];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    persistOrder(reordered);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-sm tracking-widest text-text-dim">manage links</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-dim transition-colors hover:border-border-bright hover:text-text"
        >
          <LogOut size={12} />
          sign out
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-danger/40 bg-surface px-3 py-2 text-xs text-danger">{error}</p>
      ) : null}

      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <LinkRowEditable
            key={link.id}
            link={link}
            index={i}
            total={links.length}
            editing={editingId === link.id}
            busy={busy}
            onEdit={() => setEditingId(link.id)}
            onCancelEdit={() => setEditingId(null)}
            onSave={(patch) => handleUpdate(link.id, patch)}
            onDelete={() => handleDelete(link.id)}
            onMove={(dir) => move(i, dir)}
          />
        ))}
        {links.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-faint">
            No links yet — add one below.
          </p>
        ) : null}
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-border bg-bg-panel p-4">
        <div className="flex items-center gap-2 text-xs text-text-dim">
          <Plus size={13} />
          add link
        </div>

        <select
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-border-bright"
        >
          {PLATFORM_KEYS.map((key) => (
            <option key={key} value={key}>
              {PLATFORMS[key].label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={`Label (defaults to "${getPlatform(newPlatform).label}")`}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-border-bright"
        />

        <input
          type="text"
          placeholder={getPlatform(newPlatform).placeholder}
          required
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-border-bright"
        />

        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-border-bright bg-surface-raised py-2 text-sm text-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          add
        </button>
      </form>
    </div>
  );
}

function LinkRowEditable({
  link,
  index,
  total,
  editing,
  busy,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onMove,
}: {
  link: LinkItem;
  index: number;
  total: number;
  editing: boolean;
  busy: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: Partial<Pick<LinkItem, "platform" | "label" | "url">>) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [platform, setPlatform] = useState(link.platform);
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);
  const { icon: Icon, color } = getPlatform(link.platform);

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-border-bright bg-surface p-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-md border border-border bg-bg-panel px-2 py-1.5 text-sm text-text outline-none"
        >
          {PLATFORM_KEYS.map((key) => (
            <option key={key} value={key}>
              {PLATFORMS[key].label}
            </option>
          ))}
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-md border border-border bg-bg-panel px-2 py-1.5 text-sm text-text outline-none"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-md border border-border bg-bg-panel px-2 py-1.5 text-sm text-text outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelEdit}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-dim"
          >
            <X size={12} /> cancel
          </button>
          <button
            disabled={busy}
            onClick={() => onSave({ platform, label, url })}
            className="flex items-center gap-1 rounded-md border border-border-bright bg-surface-raised px-2 py-1 text-xs text-accent"
          >
            <Check size={12} /> save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised"
        style={{ color }}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{link.label}</p>
        <p className="truncate text-xs text-text-faint">{link.url}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="rounded p-1 text-text-faint hover:text-text disabled:opacity-30"
          aria-label="Move up"
        >
          <ArrowUp size={13} />
        </button>
        <button
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="rounded p-1 text-text-faint hover:text-text disabled:opacity-30"
          aria-label="Move down"
        >
          <ArrowDown size={13} />
        </button>
        <button onClick={onEdit} className="rounded p-1 text-text-faint hover:text-text" aria-label="Edit">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="rounded p-1 text-text-faint hover:text-danger" aria-label="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
