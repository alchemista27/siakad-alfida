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
      <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-white p-2">
        {logoUrl && !imageFailed ? (
          <img
            src={logoUrl}
            alt={`Logo ${foundationName}`}
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="material-symbols-rounded text-[38px] text-tertiary select-none" aria-hidden="true">
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
