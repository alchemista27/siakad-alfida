"use client";

import { useEffect, useState, type ReactNode } from "react";
import { canAccessSiakad } from "@/lib/siakad-access";

type SiakadAuthGateProps = {
  children: ReactNode;
};

function loginRedirect(authUrl: string) {
  window.location.assign(`${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`);
}

export function SiakadAuthGate({ children }: SiakadAuthGateProps) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";

    async function verify() {
      try {
        const response = await fetch(`${authUrl}/api/auth/me`, { credentials: "include" });
        if (!response.ok) {
          loginRedirect(authUrl);
          return;
        }
        const payload = await response.json() as { user?: { roles?: unknown } };
        if (!payload.user) {
          loginRedirect(authUrl);
          return;
        }
        if (!canAccessSiakad(payload.user.roles)) {
          window.location.assign(`${authUrl}/modules`);
          return;
        }
        if (active) setAuthorized(true);
      } catch {
        loginRedirect(authUrl);
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, []);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral p-6 text-center">
        <p className="text-sm text-primary">Memverifikasi akses SIAKAD…</p>
      </main>
    );
  }

  return <>{children}</>;
}
