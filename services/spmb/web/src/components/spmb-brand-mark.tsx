"use client";

import { useState } from "react";
import { useFoundationBranding } from "./foundation-branding-provider";

export function SpmbBrandMark({
  surface,
}: {
  surface: "topbar" | "content";
}) {
  const { foundationName, logoUrl } = useFoundationBranding();
  const [imageFailed, setImageFailed] = useState(false);
  const isTopbar = surface === "topbar";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border p-1.5 ${
        isTopbar
          ? "h-9 w-9 border-border bg-white text-tertiary"
          : "h-16 w-16 border-border bg-surface text-tertiary"
      }`}
    >
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt={`Logo ${foundationName}`}
          className="h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className={`material-symbols-rounded ${isTopbar ? "text-tertiary text-[22px]" : "text-tertiary text-[38px]"}`}
          aria-hidden="true"
        >
          school
        </span>
      )}
    </span>
  );
}
