"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

export interface DomainRecord {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

async function parseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.error ?? "Something went wrong.";
}

export function AdminDomainManager({ initialDomains }: { initialDomains: DomainRecord[] }) {
  const router = useRouter();
  const [domains, setDomains] = useState(initialDomains);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addPending, setAddPending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editPending, setEditPending] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddPending(true);
    setAddError(null);

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      });

      if (!response.ok) {
        setAddError(await parseError(response));
        return;
      }

      const created: DomainRecord = await response.json();
      setDomains((prev) => [...prev, created]);
      setName("");
      setUrl("");
      router.refresh();
    } finally {
      setAddPending(false);
    }
  }

  function startEdit(domain: DomainRecord) {
    setEditingId(domain.id);
    setEditName(domain.name);
    setEditUrl(domain.url);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditPending(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, url: editUrl }),
      });

      if (!response.ok) {
        setEditError(await parseError(response));
        return;
      }

      const updated: DomainRecord = await response.json();
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      setEditingId(null);
      router.refresh();
    } finally {
      setEditPending(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from status monitoring? This deletes its check history too.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/domains/${id}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert(await parseError(response));
        return;
      }
      setDomains((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="new-name" className="text-xs font-medium text-ink-secondary">
            Name
          </label>
          <input
            id="new-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rentigo"
            className="rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-[2] flex-col gap-1.5">
          <label htmlFor="new-url" className="text-xs font-medium text-ink-secondary">
            Health check URL
          </label>
          <input
            id="new-url"
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api/health"
            className="rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={addPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-page transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={15} />
          Add domain
        </button>
      </form>
      {addError ? <p className="text-xs text-status-critical">{addError}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
        {domains.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No domains yet. Add your first one above.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {domains.map((domain) => (
              <li key={domain.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                {editingId === domain.id ? (
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-hairline bg-page px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent sm:flex-1"
                    />
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="rounded-lg border border-hairline bg-page px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent sm:flex-[2]"
                    />
                    {editError ? <p className="text-xs text-status-critical">{editError}</p> : null}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(domain.id)}
                        disabled={editPending}
                        aria-label="Save"
                        className="rounded-lg bg-status-good/15 p-1.5 text-status-good hover:bg-status-good/25 disabled:opacity-60"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        aria-label="Cancel"
                        className="rounded-lg bg-ink-muted/15 p-1.5 text-ink-secondary hover:bg-ink-muted/25"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{domain.name}</p>
                      <p className="truncate text-xs text-ink-muted">{domain.url}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(domain)}
                        aria-label={`Edit ${domain.name}`}
                        className="rounded-lg p-1.5 text-ink-secondary hover:bg-ink-muted/15 hover:text-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(domain.id, domain.name)}
                        disabled={deletingId === domain.id}
                        aria-label={`Remove ${domain.name}`}
                        className="rounded-lg p-1.5 text-status-critical hover:bg-status-critical/15 disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
