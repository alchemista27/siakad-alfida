"use client";

import { useEffect, useState } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ApprovalInbox } from "@/components/strategic/approval-inbox";

export default function InboxPage() {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://auth.alfida.or.id/api/auth/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setRoles(Array.isArray(data?.user?.roles) ? data.user.roles.map((role: { role?: string }) => role.role).filter(Boolean) : []))
      .catch(() => setRoles([]));
  }, []);

  return (
    <SimakinShell activePath="/inbox">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-border pb-6"><h1 className="font-heading text-2xl font-bold text-primary">Kotak Masuk Workflow</h1><p className="mt-1 text-xs text-gray-500">Antrean disesuaikan dengan tanggung jawab PIC, Biro, Bidang, dan pengawasan eksekutif.</p></div>
        <div className="mt-6"><ApprovalInbox roles={roles} /></div>
      </div>
    </SimakinShell>
  );
}
