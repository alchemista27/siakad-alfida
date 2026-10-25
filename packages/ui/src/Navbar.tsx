import React from "react";
import { cn } from "./utils";
import { TopbarFoundationLogo } from "./TopbarFoundationLogo";

export interface NavbarProps {
  serviceName: string;
  userName?: string;
  userRole?: string;
  logoUrl?: string;
  foundationName?: string;
  onLogout?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  serviceName,
  userName,
  userRole,
  logoUrl,
  foundationName,
  onLogout,
  className,
  children,
}) => {
  return (
    <header className={cn("bg-white border-b border-gray-200 sticky top-0 z-30", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <a
              href="https://sim.alfida.or.id"
              className="flex items-center space-x-2 text-gray-900 font-bold hover:text-emerald-700 transition-colors"
            >
              <TopbarFoundationLogo logoUrl={logoUrl} foundationName={foundationName} />
              <span className="text-base tracking-tight">{foundationName || "SIM Alfida"}</span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {serviceName}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {children}

            {userName && (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900">{userName}</div>
                  {userRole && <div className="text-[11px] text-gray-500">{userRole}</div>}
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs font-medium text-gray-600 hover:text-red-700 px-2.5 py-1.5 rounded border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Keluar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
