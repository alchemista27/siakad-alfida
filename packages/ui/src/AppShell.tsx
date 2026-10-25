"use client";

import React, { useState } from "react";
import { Sidebar, NavGroup } from "./Sidebar";
import { TopbarFoundationLogo } from "./TopbarFoundationLogo";
import { cn } from "./utils";

export interface AppShellProps {
  serviceName: string;
  userName?: string;
  userRole?: string;
  logoUrl?: string;
  foundationName?: string;
  onLogout?: () => void;
  sidebarGroups?: NavGroup[];
  children: React.ReactNode;
  className?: string;
  topbarActions?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  serviceName,
  userName = "Pengguna",
  userRole,
  logoUrl = "https://s3.alfida.or.id/sim-alfida/sim-alfida/foundation/logo-1790054535826",
  foundationName = "SIM-Alfida",
  onLogout,
  sidebarGroups = [],
  children,
  className,
  topbarActions,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ambil inisial huruf dari nama pengguna
  const initials = userName
    ? userName
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  const hasSidebar = sidebarGroups.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#454545] flex flex-col font-body">
      {/* Topbar Tetap (Tinggi 56px / h-14 sesuai standar Monolith) */}
      <header className="h-14 bg-white border-b border-[#E3E8E7] sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {hasSidebar && (
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-rounded text-[22px]">menu</span>
            </button>
          )}
          <a
            href="https://auth.alfida.or.id/modules"
            className="flex items-center gap-2 text-[#0f7f6d] font-bold text-lg font-heading"
          >
            <TopbarFoundationLogo logoUrl={logoUrl} foundationName={foundationName} />
            <span className="font-heading tracking-tight">{foundationName}</span>
          </a>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e6f4f1] text-[#0f7f6d] hidden sm:inline">
            {serviceName}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {topbarActions}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0f7f6d] text-[#F7F8F8] flex items-center justify-center font-semibold text-xs shadow-xs select-none">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#454545] leading-tight">
                {userName}
              </div>
              {userRole && (
                <div className="text-[11px] text-gray-500 leading-tight">
                  {userRole}
                </div>
              )}
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-gray-600 hover:text-red-700 px-2.5 py-1.5 rounded border border-[#E3E8E7] hover:border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1"
              title="Keluar dari sistem"
            >
              <span className="material-symbols-rounded text-[16px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </header>

      {/* Layout Tengah (Sidebar + Main Content) */}
      <div className="flex-1 flex">
        {hasSidebar && (
          <Sidebar
            groups={sidebarGroups}
            isOpenMobile={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        )}

        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto",
            hasSidebar && "md:ml-60",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
