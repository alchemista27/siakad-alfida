"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConfirmActionModal } from "./confirm-action-modal";

type RoleAssignment = {
  id: string;
  app: string;
  role: string;
  unitId?: string | null;
  departmentId?: string | null;
};

type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  roles: RoleAssignment[];
};

type UserRoleModalProps = {
  user: ManagedUser;
  onClose: () => void;
  onChanged: (message: string) => Promise<void> | void;
};

const ROLE_CATALOG = {
  auth: ["super_admin"],
  simpeg: ["admin_kepegawaian", "pegawai", "admin_unit", "admin_unit_nondik"],
  siakad: ["admin_unit", "guru"],
  spmb: ["admin_unit", "tim_ppdb"],
  simakin: ["admin_bidang", "admin_biro", "pic_program", "pic_task"],
} as const;

const UNIT_SCOPED_ROLES = new Set([
  "simpeg:admin_unit",
  "simpeg:admin_unit_nondik",
  "siakad:admin_unit",
  "spmb:admin_unit",
]);
const DEPARTMENT_SCOPED_ROLES = new Set(["simakin:admin_bidang", "simakin:admin_biro"]);

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(", ");
  }
  return fallback;
}

export function UserRoleModal({ user, onClose, onChanged }: UserRoleModalProps) {
  const [app, setApp] = useState<keyof typeof ROLE_CATALOG>("simpeg");
  const [role, setRole] = useState<string>(ROLE_CATALOG.simpeg[0]);
  const [departmentId, setDepartmentId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<{ title: string; description: string; run: () => Promise<void> } | null>(null);

  const roleKey = `${app}:${role}`;
  const scope = UNIT_SCOPED_ROLES.has(roleKey)
    ? "unit"
    : DEPARTMENT_SCOPED_ROLES.has(roleKey)
      ? "department"
      : "generic";
  const rolesForApp = useMemo(() => ROLE_CATALOG[app], [app]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting && !pending) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending, submitting]);

  const selectApp = (nextApp: keyof typeof ROLE_CATALOG) => {
    setApp(nextApp);
    setRole(ROLE_CATALOG[nextApp][0]);
    setDepartmentId("");
    setMessage(null);
  };

  const request = async (url: string, init: RequestInit, fallback: string) => {
    const response = await fetch(url, { ...init, credentials: "include" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(getErrorMessage(payload, fallback));
    return payload;
  };

  const addRole = async () => {
    if (scope === "unit") {
      setMessage("Peran admin unit hanya dapat ditetapkan dari Struktur Organisasi SIMPEG.");
      return;
    }
    if (scope === "department" && role !== "admin_bidang") {
      setMessage("Peran ini hanya dapat ditetapkan dari Struktur Organisasi SIMPEG.");
      return;
    }
    if (scope === "department" && !departmentId.trim()) {
      setMessage("Masukkan ID Bidang untuk peran Admin Bidang SIMAKIN.");
      return;
    }

    const run = async () => {
      setSubmitting(true);
      setMessage(null);
      try {
        if (scope === "department") {
          await request(
            `/api/admin/users/${user.id}/organization-roles`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: "department", departmentId: departmentId.trim() }) },
            "Gagal menetapkan peran organisasi.",
          );
        } else {
          await request(
            `/api/admin/users/${user.id}/roles`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app, role }) },
            "Gagal menambahkan peran.",
          );
        }
        await onChanged("Peran pengguna berhasil diperbarui.");
        setDepartmentId("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Gagal memperbarui peran.");
      } finally {
        setSubmitting(false);
      }
    };

    if (scope === "department") {
      setPending({
        title: "Tetapkan Admin Bidang SIMAKIN",
        description: `Pengguna akan memperoleh akses admin_bidang untuk Bidang ID ${departmentId.trim()}. SIMPEG akan memvalidasi bidang dan menyegarkan sesi pengguna.`,
        run,
      });
      return;
    }
    await run();
  };

  const removeRole = (assignment: RoleAssignment) => {
    const key = `${assignment.app}:${assignment.role}`;
    const assignmentScope = UNIT_SCOPED_ROLES.has(key)
      ? "unit"
      : DEPARTMENT_SCOPED_ROLES.has(key)
        ? "department"
        : "generic";
    if (assignmentScope === "unit" || (assignmentScope === "department" && assignment.role !== "admin_bidang")) {
      setMessage("Peran ini hanya dapat dicabut dari Struktur Organisasi SIMPEG.");
      return;
    }

    setPending({
      title: "Cabut Peran Pengguna",
      description: `Cabut peran ${assignment.app}:${assignment.role} dari ${user.fullName}?`,
      run: async () => {
        setSubmitting(true);
        setMessage(null);
        try {
          const url = assignmentScope === "department"
            ? `/api/admin/users/organization-roles/${assignment.id}`
            : `/api/admin/users/roles/${assignment.id}`;
          await request(url, { method: "DELETE" }, "Gagal mencabut peran.");
          await onChanged("Peran pengguna berhasil dicabut.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Gagal mencabut peran.");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/45 p-4" role="presentation">
        <div role="dialog" aria-modal="true" aria-labelledby="user-role-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 id="user-role-title" className="font-heading text-lg font-bold text-primary">Kelola Peran</h2>
              <p className="mt-1 text-xs text-gray-700">{user.fullName} ({user.email})</p>
            </div>
            <button type="button" onClick={onClose} disabled={submitting} aria-label="Tutup" className="text-gray-600 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary disabled:opacity-60">
              <span className="material-symbols-rounded" aria-hidden="true">close</span>
            </button>
          </div>

          <section className="mt-5">
            <h3 className="text-xs font-semibold text-primary">Peran saat ini</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.roles.length ? user.roles.map((assignment) => (
                <div key={assignment.id} className="flex items-center gap-1 rounded border border-border bg-neutral px-2 py-1 text-[11px] text-gray-700">
                  <span>{assignment.app}:{assignment.role}</span>
                  {assignment.unitId && <span className="text-gray-500">unitId: {assignment.unitId}</span>}
                  {assignment.departmentId && <span className="text-gray-500">departmentId: {assignment.departmentId}</span>}
                  <button type="button" onClick={() => removeRole(assignment)} disabled={submitting} className="ml-1 text-red-700 hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 disabled:opacity-60" aria-label={`Cabut ${assignment.app}:${assignment.role}`}>
                    <span className="material-symbols-rounded text-[16px]" aria-hidden="true">close</span>
                  </button>
                </div>
              )) : <p className="text-xs text-gray-600">Belum ada peran yang ditetapkan.</p>}
            </div>
          </section>

          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void addRole(); }} className="mt-6 border-t border-border pt-5">
            <h3 className="text-xs font-semibold text-primary">Tambahkan peran</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-primary">Aplikasi
                <select value={app} onChange={(event) => selectApp(event.target.value as keyof typeof ROLE_CATALOG)} className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary">
                  {Object.keys(ROLE_CATALOG).map((catalogApp) => <option key={catalogApp} value={catalogApp}>{catalogApp.toUpperCase()}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-primary">Peran
                <select value={role} onChange={(event) => { setRole(event.target.value); setDepartmentId(""); setMessage(null); }} className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary">
                  {rolesForApp.map((catalogRole) => <option key={catalogRole} value={catalogRole}>{catalogRole}</option>)}
                </select>
              </label>
            </div>

            {scope === "department" && role === "admin_bidang" && (
              <label className="mt-3 block text-xs font-semibold text-primary">ID Bidang SIMAKIN
                <input value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} placeholder="UUID bidang dari Struktur Organisasi SIMPEG" className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary" />
                <span className="mt-1 block font-normal text-gray-600">SIMPEG memverifikasi bidang, membuat penugasan, dan menyegarkan sesi pengguna.</span>
              </label>
            )}
            {(scope === "unit" || (scope === "department" && role !== "admin_bidang")) && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Peran berscope ini dikelola dari Struktur Organisasi SIMPEG agar scope tidak menjadi data yatim.</p>
            )}
            {message && <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">{message}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={submitting} className="rounded border border-border bg-surface px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary disabled:opacity-60">Tutup</button>
              <button type="submit" disabled={submitting || scope === "unit" || (scope === "department" && role !== "admin_bidang")} className="rounded bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:opacity-60">{submitting ? "Menyimpan..." : "Tambahkan Peran"}</button>
            </div>
          </form>
        </div>
      </div>
      {pending && <ConfirmActionModal title={pending.title} description={pending.description} confirmLabel="Lanjutkan" danger={pending.title.startsWith("Cabut")} onClose={() => setPending(null)} onConfirm={async () => { await pending.run(); setPending(null); }} />}
    </>
  );
}
