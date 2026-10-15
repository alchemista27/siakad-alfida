"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@alfida/ui";

interface AdminShellProps {
  children: React.ReactNode;
  activePath?: string;
  topbarActions?: React.ReactNode;
}

export function AdminShell({
  children,
  activePath = "/settings",
  topbarActions,
}: AdminShellProps) {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await fetch("https://auth.alfida.or.id/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const isSuperAdmin = data.user.roles?.some(
              (r: any) => r.role === "super_admin"
            );

            if (!isSuperAdmin) {
              alert("Akses ditolak: Portal ini hanya diperuntukkan bagi Super Admin Yayasan.");
              window.location.href = "https://auth.alfida.or.id/modules";
              return;
            }

            setUser({
              fullName: data.user.fullName,
              role: "SUPER ADMIN",
            });
            setAuthLoading(false);
          } else {
            window.location.href = `https://auth.alfida.or.id/login?return_to=${encodeURIComponent(window.location.href)}`;
            return;
          }
        } else {
          window.location.href = `https://auth.alfida.or.id/login?return_to=${encodeURIComponent(window.location.href)}`;
          return;
        }
      } catch (e) {
        window.location.href = `https://auth.alfida.or.id/login?return_to=${encodeURIComponent(window.location.href)}`;
        return;
      }

      try {
        const res = await fetch("/api/admin/users/pending");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPendingCount(data.length);
          }
        }
      } catch (e) {}
    }
    loadInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://auth.alfida.or.id/api/auth/logout", {
        credentials: "include",
        method: "POST",
      });
    } catch (e) {}
    window.location.href = "https://auth.alfida.or.id/login";
  };

  const sidebarGroups = [
    {
      title: "Tata Kelola Yayasan",
      items: [
        {
          label: "Identitas & Rekening",
          href: "/settings",
          icon: "account_balance",
          active: activePath === "/settings",
        },
      ],
    },
    {
      title: "Manajemen Pengguna",
      items: [
        {
          label: "Seluruh Pengguna",
          href: "/users",
          icon: "group",
          active: activePath === "/users",
        },
        {
          label: `Persetujuan Staf ${pendingCount > 0 ? `(${pendingCount})` : ""}`,
          href: "/approvals",
          icon: "pending_actions",
          active: activePath === "/approvals",
        },
      ],
    },
    {
      title: "Sistem & Integrasi",
      items: [
        {
          label: "Portal Modul Yayasan",
          href: "https://auth.alfida.or.id/modules",
          icon: "apps",
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="Admin Yayasan"
      userName={user?.fullName || "Memuat..."}
      userRole={user?.role || ""}
      sidebarGroups={sidebarGroups}
      topbarActions={topbarActions}
      onLogout={handleLogout}
    >
      {authLoading && !user ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
          <span className="material-symbols-rounded animate-spin text-[36px] text-tertiary mb-3">
            progress_activity
          </span>
          <p className="text-xs text-gray-500 font-medium">Memverifikasi wewenang Super Admin...</p>
        </div>
      ) : (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      )}
    </AppShell>
  );
}
