"use client";

import { useEffect, useState } from "react";
import { TopbarFoundationLogo } from "@alfida/ui";
import { useFoundationBranding } from "@/components/foundation-branding-provider";
import { getCurrentSsoUser } from "@/lib/sso-client";
import type { SsoUser } from "@/lib/sso-server";

const serviceName = "SPMB";

function formatRole(role?: string): string {
  return role ? role.replaceAll("_", " ").toUpperCase() : "PENGGUNA";
}

export function SpmbTopbar() {
  const { foundationName } = useFoundationBranding();
  const [user, setUser] = useState<SsoUser | null>(null);
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";

  useEffect(() => {
    void getCurrentSsoUser().then(setUser).catch(() => setUser(null));
  }, []);

  const displayName = user?.fullName || user?.email || "Pengguna";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const spmbRole = user?.roles?.find((item) => item.app === "spmb")?.role || user?.roles?.[0]?.role;
  const roleLabel = formatRole(spmbRole);

  const handleLogout = async () => {
    try {
      await fetch(`${authUrl}/api/auth/logout`, {
        credentials: "include",
        method: "POST",
      });
    } finally {
      window.location.assign(`${authUrl}/login`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <a href={`${authUrl}/modules`} className="flex items-center gap-2" aria-label="Pilih Modul">
          <TopbarFoundationLogo foundationName={foundationName} />
        </a>
        <span className="text-gray-300" aria-hidden="true">|</span>
        <span className="truncate text-sm font-semibold text-primary">{serviceName}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-xs font-semibold text-primary">{user?.fullName || displayName}</span>
            <span className="block truncate text-[11px] text-gray-500">{roleLabel}</span>
          </span>
        </div>
        <a
          href={`${authUrl}/modules`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-tertiary hover:bg-neutral"
        >
          <span className="material-symbols-rounded text-[16px]" aria-hidden="true">apps</span>
          <span className="hidden sm:inline">Pilih Modul</span>
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-primary hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <span className="material-symbols-rounded text-[16px]" aria-hidden="true">logout</span>
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
