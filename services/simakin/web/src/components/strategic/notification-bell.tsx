"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getNotifications, markNotificationRead, type StrategicNotification } from "@/actions/strategic";
import { eventSourceReconnectDelay } from "./event-source-reconnect.policy";

export function NotificationBell() {
  const [items, setItems] = useState<StrategicNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const notifications = await getNotifications(true);
      setItems(Array.isArray(notifications) ? notifications : []);
      setError(null);
    } catch {
      setError("Notifikasi sedang tidak dapat dimuat. Mencoba lagi secara berkala.");
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    const closeSource = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
    const connect = () => {
      if (disposed) return;
      closeSource();
      const source = new EventSource("/api/strategic/notifications/stream");
      eventSourceRef.current = source;
      source.onmessage = (event) => {
        reconnectAttemptsRef.current = 0;
        try {
          const payload = JSON.parse(event.data) as { type?: string; items?: StrategicNotification[]; item?: StrategicNotification };
          if (payload.type === "snapshot" && Array.isArray(payload.items)) setItems(payload.items);
          if (payload.type === "notification" && payload.item) setItems((current) => [payload.item as StrategicNotification, ...current.filter((item) => item.id !== payload.item?.id)]);
          setError(null);
        } catch {
          void refresh();
        }
      };
      source.onerror = () => {
        if (disposed || eventSourceRef.current !== source) return;
        source.close();
        eventSourceRef.current = null;
        void refresh();
        const delay = eventSourceReconnectDelay(++reconnectAttemptsRef.current);
        if (delay === null) {
          setError("Sambungan notifikasi terputus. Gunakan Muat ulang untuk mencoba lagi.");
          return;
        }
        setError("Sambungan notifikasi terputus. Menyambungkan kembali…");
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    connect();
    return () => {
      disposed = true;
      window.clearInterval(interval);
      if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current);
      closeSource();
    };
  }, [refresh]);

  const handleRead = async (notification: StrategicNotification) => {
    try {
      await markNotificationRead(notification.id);
      setItems((current) => current.filter((item) => item.id !== notification.id));
      if (notification.href) window.location.assign(notification.href);
    } catch {
      setError("Status notifikasi belum dapat diperbarui. Silakan coba lagi.");
    }
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-surface text-primary hover:bg-neutral" aria-expanded={open} aria-label={`Notifikasi${items.length ? `, ${items.length} belum dibaca` : ""}`}>
        <span className="material-symbols-rounded text-[19px]">notifications</span>
        {items.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-tertiary px-1 text-[10px] font-bold leading-4 text-on-tertiary">{items.length > 9 ? "9+" : items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center justify-between border-b border-border pb-2"><h2 className="font-heading text-sm font-bold text-primary">Notifikasi</h2><button type="button" onClick={() => void refresh()} className="text-xs font-semibold text-tertiary hover:underline">Muat ulang</button></div>
          {error && <p className="mt-2 text-xs text-amber-800" role="status">{error}</p>}
          {items.length === 0 ? <p className="py-5 text-center text-xs text-gray-500">Tidak ada notifikasi baru.</p> : <ul className="max-h-80 divide-y divide-border overflow-y-auto">{items.map((notification) => <li key={notification.id}><button type="button" onClick={() => void handleRead(notification)} className="w-full px-1 py-3 text-left hover:bg-neutral"><p className="text-xs font-semibold text-primary">{notification.title}</p><p className="mt-0.5 text-xs text-gray-600">{notification.body}</p><p className="mt-1 text-[10px] text-gray-400">{new Date(notification.createdAt).toLocaleString("id-ID")}</p></button></li>)}</ul>}
        </div>
      )}
    </div>
  );
}
