"use client";

import { useState } from "react";

export const DEFAULT_FOUNDATION_LOGO_URL =
  "https://s3.alfida.or.id/sim-alfida/sim-alfida/foundation/logo-1790054535826";

export function TopbarFoundationLogo({
  logoUrl = DEFAULT_FOUNDATION_LOGO_URL,
  foundationName = "SIM-Alfida",
}: {
  logoUrl?: string;
  foundationName?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-tertiary bg-tertiary p-1.5 text-on-tertiary">
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt={`Logo ${foundationName}`}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="material-symbols-rounded text-[22px] text-on-tertiary" aria-hidden="true">hub</span>
      )}
    </span>
  );
}
