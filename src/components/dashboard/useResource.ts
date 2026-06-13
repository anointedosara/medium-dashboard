"use client";

import { useCallback, useEffect, useState } from "react";

export type Item = Record<string, unknown> & { _id: string };

export function useResource(type: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resource/${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } catch {
      // Network blip (e.g. server restarting) — keep current items, don't throw.
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/resource/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await load();
        return res.ok;
      } catch {
        return false;
      }
    },
    [type, load]
  );

  const update = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/resource/${type}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await load();
        return res.ok;
      } catch {
        return false;
      }
    },
    [type, load]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/resource/${type}/${id}`, { method: "DELETE" });
        await load();
        return res.ok;
      } catch {
        return false;
      }
    },
    [type, load]
  );

  return { items, loading, reload: load, create, update, remove };
}
