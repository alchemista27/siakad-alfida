import type { ReactNode } from "react";
import type { FoundationBranding } from "@/lib/foundation-settings";
import { FoundationBrand } from "./foundation-brand";

type PublicAuthLayoutProps = {
  branding: FoundationBranding;
  subtitle?: string;
  fallbackIcon?: string;
  children: ReactNode;
};

export function PublicAuthLayout({
  branding,
  subtitle,
  fallbackIcon,
  children,
}: PublicAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-body">
      <aside className="w-full md:w-[40%] bg-gradient-to-br from-[#0f7f6d] to-[#06bfa2] text-white flex flex-col justify-center items-center p-8 md:p-14 text-center shadow-inner">
        <FoundationBrand
          branding={branding}
          subtitle={subtitle}
          fallbackIcon={fallbackIcon}
        />
      </aside>
      <section className="w-full md:w-[60%] bg-white flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        {children}
      </section>
    </div>
  );
}
