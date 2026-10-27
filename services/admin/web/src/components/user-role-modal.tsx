"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConfirmActionModal } from "./confirm-action-modal";
import { firstCatalogRole, getRoleScope, rolesForApp, ROLE_CATALOG_APPS } from "@/lib/role-catalog";

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

type UnitOption = {
  id: string;
  name: string;
  slug?: string;
  category: "pendidikan" | "nondik";
};

type DepartmentOption = {
  id: string;
  name: string;
  parentId?: string | null;
};

const DEFAULT_UNITS: UnitOption[] = [
  { id: "0f3505db-ba0b-48e3-a500-2de9790bdd63", name: "TK Islam Terpadu Auladuna 1", category: "pendidikan" },
  { id: "9fe99902-40e0-48dd-9275-d73531584365", name: "TK Islam Terpadu Auladuna 2", category: "pendidikan" },
  { id: "dcaa14b2-b20c-416a-ba90-9367016ce295", name: "SD Islam Terpadu Iqra 1", category: "pendidikan" },
  { id: "c09fb430-b5d3-4ae2-a6cc-2220430da453", name: "SD Islam Terpadu Iqra 2", category: "pendidikan" },
  { id: "5edd8be0-86ac-406b-b23c-418b3e387528", name: "SD Islam Terpadu Iqra 3", category: "pendidikan" },
  { id: "a09edaf4-c656-4632-abf1-4c0a25150c98", name: "SMP Islam Terpadu Iqra", category: "pendidikan" },
  { id: "28225003-d1d3-4276-901c-f9a42a7cac69", name: "SMA Islam Terpadu Iqra", category: "pendidikan" },
  { id: "18d0d36c-aea5-4ba6-a89b-320f9a4f240d", name: "Pesantren Quran Alfida", category: "pendidikan" },
  { id: "fed6e093-3fe7-46f7-b5c4-7b33e95ea8bb", name: "Kantor Pusat Yayasan", category: "nondik" },
];

const DEFAULT_DEPARTMENTS: DepartmentOption[] = [
  { id: "3ac9abae-27ec-40e2-9032-e17724fc5b5e", name: "Bidang Kepegawaian" },
  { id: "0946afff-c8c2-4b6c-bccf-b6802b034938", name: "Bidang Pendidikan" },
  { id: "43984cd1-77be-422f-aac3-eebda167d65d", name: "Departemen Keuangan" },
];

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(", ");
  }
  return fallback;
}

export function UserRoleModal({ user, onClose, onChanged }: UserRoleModalProps) {
  const [app, setApp] = useState("simpeg");
  const [role, setRole] = useState<string>(firstCatalogRole("simpeg"));
  const [unitId, setUnitId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [units, setUnits] = useState<UnitOption[]>(DEFAULT_UNITS);
  const [departments, setDepartments] = useState<DepartmentOption[]>(DEFAULT_DEPARTMENTS);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<{ title: string; description: string; run: () => Promise<void> } | null>(null);

  const scope = getRoleScope(app, role);
  const selectedUnit = useMemo(() => units.find((unit) => unit.id === unitId), [unitId, units]);
  const isBlockedNondikApp = selectedUnit?.category === "nondik" && (app === "siakad" || app === "spmb");
  const allowedApps = selectedUnit?.category === "nondik" ? ["simpeg"] : ROLE_CATALOG_APPS;
  const rolesForSelectedApp = useMemo(() => rolesForApp(app), [app]);

  useEffect(() => {
    let active = true;
    const loadCatalogs = async () => {
      try {
        const [unitsRes, deptsRes] = await Promise.all([
          fetch("/api/admin/users/units", { credentials: "include" }),
          fetch("/api/admin/users/departments", { credentials: "include" }),
        ]);
        if (unitsRes.ok) {
          const body = await unitsRes.json();
          if (active && Array.isArray(body?.data) && body.data.length > 0) {
            setUnits(body.data.map((unit: { id: string; name: string; slug?: string; category?: unknown }) => ({
              id: unit.id,
              name: unit.name,
              slug: unit.slug,
              category: unit.category === "pendidikan" ? "pendidikan" : "nondik",
            })));
          }
        }
        if (deptsRes.ok) {
          const body = await deptsRes.json();
          if (active && Array.isArray(body?.data) && body.data.length > 0) {
            setDepartments(body.data);
          }
        }
      } catch {
        // Fallback default units & departments tetap aktif jika jaringan offline
      }
    };
    void loadCatalogs();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting && !pending) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending, submitting]);

  const selectApp = (nextApp: string) => {
    setApp(nextApp);
    setRole(firstCatalogRole(nextApp));
    setDepartmentId("");
    setUnitId("");
    setMessage(null);
  };

  const selectUnit = (nextUnitId: string) => {
    const nextUnit = units.find((unit) => unit.id === nextUnitId);
    setUnitId(nextUnitId);
    if (nextUnit?.category === "nondik" && (app === "siakad" || app === "spmb")) {
      setApp("simpeg");
      setRole(firstCatalogRole("simpeg"));
    }
    setMessage(null);
  };

  const request = async (url: string, init: RequestInit, fallback: string) => {
    const response = await fetch(url, { ...init, credentials: "include" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(getErrorMessage(payload, fallback));
    return payload;
  };

  const addRole = async () => {
    if (isBlockedNondikApp) {
      setMessage("Unit non-pendidikan hanya dapat memperoleh akses aplikasi SIMPEG.");
      return;
    }
    if (scope === "unit" && !unitId) {
      setMessage("Pilih unit kerja terlebih dahulu untuk peran berscope unit.");
      return;
    }
    if (scope === "department" && !departmentId) {
      setMessage("Pilih bidang terlebih dahulu untuk peran berscope bidang.");
      return;
    }

    const run = async () => {
      setSubmitting(true);
      setMessage(null);
      try {
        if (scope === "department") {
          await request(
            `/api/admin/users/${user.id}/organization-roles`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scope: "department", departmentId }),
            },
            "Gagal menetapkan peran organisasi bidang.",
          );
        } else if (scope === "unit") {
          await request(
            `/api/admin/users/${user.id}/organization-roles`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scope: "unit", unitId, app, role }),
            },
            "Gagal menetapkan peran organisasi unit.",
          );
        } else {
          await request(
            `/api/admin/users/${user.id}/roles`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ app, role }),
            },
            "Gagal menambahkan peran.",
          );
        }
        await onChanged("Peran pengguna berhasil diperbarui.");
        setDepartmentId("");
        setUnitId("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Gagal memperbarui peran.");
      } finally {
        setSubmitting(false);
      }
    };

    if (scope === "department") {
      const selectedDept = departments.find((d) => d.id === departmentId);
      setPending({
        title: "Tetapkan Admin Bidang SIMAKIN",
        description: `Pengguna akan memperoleh akses admin_bidang untuk ${selectedDept?.name || departmentId}. Struktur Organisasi SIMPEG akan memvalidasi bidang dan menyegarkan sesi pengguna.`,
        run,
      });
      return;
    }

    if (scope === "unit") {
      setPending({
        title: "Tetapkan Admin Unit",
        description: `Pengguna akan memperoleh akses ${role} untuk ${selectedUnit?.name || unitId} pada aplikasi ${app.toUpperCase()}. Struktur Organisasi SIMPEG akan memvalidasi dan menyinkronkan penugasan.`,
        run,
      });
      return;
    }

    await run();
  };

  const removeRole = (assignment: RoleAssignment) => {
    const assignmentScope = getRoleScope(assignment.app, assignment.role);

    setPending({
      title: "Cabut Peran Pengguna",
      description: `Cabut peran ${assignment.app}:${assignment.role} dari ${user.fullName}?`,
      run: async () => {
        setSubmitting(true);
        setMessage(null);
        try {
          const url = assignmentScope === "department" || assignmentScope === "unit"
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

  const isFormIncomplete =
    isBlockedNondikApp ||
    (scope === "unit" && !unitId) ||
    (scope === "department" && !departmentId);

  const isSubmitDisabled = submitting || isFormIncomplete;

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
              {user.roles.length ? user.roles.map((assignment) => {
                const assignedUnit = assignment.unitId ? units.find((u) => u.id === assignment.unitId) : null;
                const assignedDept = assignment.departmentId ? departments.find((d) => d.id === assignment.departmentId) : null;
                return (
                  <div key={assignment.id} className="flex items-center gap-1.5 rounded border border-border bg-neutral px-2.5 py-1 text-[11px] text-gray-700">
                    <span className="font-medium text-primary">{assignment.app}:{assignment.role}</span>
                    {assignment.unitId && (
                      <span className="text-[#0f7f6d] bg-white px-1.5 py-0.5 rounded border border-border text-[10px]">
                        {assignedUnit?.name || assignment.unitId}
                      </span>
                    )}
                    {assignment.departmentId && (
                      <span className="text-blue-700 bg-white px-1.5 py-0.5 rounded border border-border text-[10px]">
                        {assignedDept?.name || assignment.departmentId}
                      </span>
                    )}
                    <button type="button" onClick={() => removeRole(assignment)} disabled={submitting} className="ml-1 text-red-700 hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 disabled:opacity-60" aria-label={`Cabut ${assignment.app}:${assignment.role}`}>
                      <span className="material-symbols-rounded text-[16px]" aria-hidden="true">close</span>
                    </button>
                  </div>
                );
              }) : <p className="text-xs text-gray-600">Belum ada peran yang ditetapkan.</p>}
            </div>
          </section>

          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void addRole(); }} className="mt-6 border-t border-border pt-5">
            <h3 className="text-xs font-semibold text-primary">Tambahkan peran</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-primary">Aplikasi
                <select value={app} onChange={(event) => selectApp(event.target.value)} className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary">
                  {allowedApps.map((catalogApp) => <option key={catalogApp} value={catalogApp}>{catalogApp.toUpperCase()}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-primary">Peran
                <select
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    setDepartmentId("");
                    setUnitId("");
                    setMessage(null);
                  }}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary"
                >
                  {rolesForSelectedApp.map((catalogRole) => <option key={catalogRole} value={catalogRole}>{catalogRole}</option>)}
                </select>
              </label>
            </div>

            {scope === "department" && (
              <label className="mt-3 block text-xs font-semibold text-primary">
                Pilih Bidang SIMAKIN *
                <select
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary"
                >
                  <option value="">-- Pilih Bidang --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block font-normal text-gray-600">
                  Struktur Organisasi SIMPEG memverifikasi bidang, membuat penugasan, dan menyegarkan sesi pengguna.
                </span>
              </label>
            )}

            {scope === "unit" && (
              <label className="mt-3 block text-xs font-semibold text-primary">
                Pilih Unit Kerja Yayasan *
                <select
                  value={unitId}
                  onChange={(event) => selectUnit(event.target.value)}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-xs text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary"
                >
                  <option value="">-- Pilih Unit Kerja --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block font-normal text-gray-600">
                  Struktur Organisasi SIMPEG akan memvalidasi unit dan menyinkronkan hak akses pengguna.
                </span>
              </label>
            )}

            {message && <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">{message}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={submitting} className="rounded border border-border bg-surface px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary disabled:opacity-60">Tutup</button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="rounded bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Tambahkan Peran"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {pending && <ConfirmActionModal title={pending.title} description={pending.description} confirmLabel="Lanjutkan" danger={pending.title.startsWith("Cabut")} onClose={() => setPending(null)} onConfirm={async () => { await pending.run(); setPending(null); }} />}
    </>
  );
}
