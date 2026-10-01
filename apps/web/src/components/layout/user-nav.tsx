"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { authClient } from "@/lib/auth-client";
import { forceClearCookies } from "@/actions/user";
import { Icon } from "@/components/ui/icon";

export function UserNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = (user?.name as string) || "Pengguna";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-neutral transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-xs">
          {userInitials}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-primary">{userName}</span>
          <span className="text-[10px] text-gray-500">{user?.email}</span>
        </div>
        <Icon name="arrow_drop_down" className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-border md:hidden">
            <p className="text-xs font-semibold text-primary">{userName}</p>
            <p className="text-[10px] text-gray-500">{user?.email}</p>
          </div>
          <a
            href="/profile"
            className="w-full text-left px-4 py-2 text-xs text-primary hover:bg-neutral flex items-center gap-2 cursor-pointer border-b border-border"
          >
            <Icon name="person" className="text-sm" />
            <span>Profil Saya</span>
          </a>
          <button
            disabled={loggingOut}
            onClick={async () => {
              if (loggingOut) return;
              setLoggingOut(true);
              try {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/login";
                    },
                    onError: () => {
                      // Fallback just in case
                      window.location.href = "/login";
                    }
                  }
                });
              } catch (e) {
                console.error("Signout error:", e);
                window.location.href = "/login";
              }
            }}
            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Icon name={loggingOut ? "progress_activity" : "logout"} className={loggingOut ? "animate-spin text-sm" : "text-sm"} />
            <span>{loggingOut ? "Sedang Keluar..." : "Keluar (Logout)"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
