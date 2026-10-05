"use client";

import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const markAsRead = async (idStr: string) => {
    await fetch(`/api/notifications/${idStr}/read`, { method: 'PATCH' });
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => n.id === idStr ? { ...n, isRead: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral transition-colors text-gray-600 mr-2"
      >
        <Icon name="notifications" className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface shadow-xl rounded-md border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
            <div>
              <h3 className="font-semibold font-heading text-sm text-foreground">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">{unreadCount} belum dibaca</span>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <Icon name="close" className="text-lg" />
            </button>
          </div>
          <div className="max-h-[350px] overflow-y-auto bg-white">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                <Icon name="notifications_off" className="text-3xl text-gray-300 mb-2" />
                Belum ada notifikasi
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => {
                  const isRead: boolean = notif.isRead;
                  const innerContent = (
                    <>
                      {!isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary rounded-r" />
                      )}
                      <div className={cn("mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0", isRead ? "bg-gray-100 text-gray-500" : "bg-tertiary/20 text-tertiary")}>
                        <Icon name="mail" className="text-sm" />
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <p className={cn("text-sm font-medium leading-tight text-foreground", !isRead && "font-bold")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                        </span>
                      </div>
                    </>
                  );

                  const commonProps = {
                    onClick: () => {
                      if (!isRead) markAsRead(notif.id);
                      if (notif.linkUrl) setIsOpen(false);
                    },
                    className: cn(
                      "group relative flex gap-3 p-4 hover:bg-neutral/50 transition-colors border-b border-border/50 last:border-0 cursor-pointer",
                      isRead ? "opacity-70" : "bg-primary/5"
                    )
                  };

                  if (notif.linkUrl) {
                    return (
                      <Link key={notif.id} href={notif.linkUrl} {...commonProps}>
                        {innerContent}
                      </Link>
                    );
                  }

                  return (
                    <div key={notif.id} {...commonProps}>
                      {innerContent}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
