"use client";

import React from "react";
import { cn } from "./utils";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps {
  groups: NavGroup[];
  className?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  className,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Backdrop untuk Mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-[60px] left-0 bottom-0 z-40 w-[250px] bg-white border-r border-[#E3E8E7] overflow-y-auto transition-transform duration-200 md:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="py-4">
          {groups.map((group, idx) => (
            <div key={idx} className="mb-4">
              {group.title && (
                <div className="px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                      item.active
                        ? "bg-[#e6f4f1] text-[#0f7f6d] font-semibold border-r-[3px] border-[#0f7f6d]"
                        : "text-[#454545] hover:bg-[#F7F8F8] font-normal"
                    )}
                  >
                    {item.icon && (
                      <span className="material-symbols-rounded text-[20px] select-none">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-[#0f7f6d]">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
