"use client";

import { useState } from "react";
import type { FoundationBranding } from "../lib/foundation-settings";

type FoundationBrandProps = {
  branding: FoundationBranding;
  subtitle?: string;
  fallbackIcon?: string;
};

export function FoundationBrand({
  branding,
  subtitle = "Sistem Informasi Manajemen Terpadu Yayasan Alfida",
  fallbackIcon = "hub",
}: FoundationBrandProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { foundationName, logoUrl } = branding;

  return (
    <>
      <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 shadow-md border border-white/20 overflow-hidden">
        {logoUrl && !imageFailed ? (
          <img
            src={logoUrl}
            alt={`Logo ${foundationName}`}
            className="h-full w-full object-contain p-2"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="material-symbols-rounded text-white text-[38px] select-none" aria-hidden="true">
            {fallbackIcon}
          </span>
        )}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-3">
        {foundationName}
      </h1>
      <p className="text-sm md:text-base text-white/90 max-w-xs font-normal leading-relaxed">
        {subtitle}
      </p>
    </>
  );
}
