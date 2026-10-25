"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FoundationBranding } from "@/lib/foundation-settings";

const fallbackBranding: FoundationBranding = {
  foundationName: "Yayasan Alfida",
  logoUrl: null,
  faviconUrl: null,
};

const FoundationBrandingContext = createContext<FoundationBranding>(fallbackBranding);

export function FoundationBrandingProvider({
  branding,
  children,
}: {
  branding: FoundationBranding;
  children: ReactNode;
}) {
  return <FoundationBrandingContext.Provider value={branding}>{children}</FoundationBrandingContext.Provider>;
}

export function useFoundationBranding() {
  return useContext(FoundationBrandingContext);
}
