"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@alfida/ui";
import { OrganizationEmployee, OrganizationUnit, UnitAdminAssignment, responseMessage } from "./types";

type UnitAdminModalProps = {
  unit: OrganizationUnit | null;
  employees: OrganizationEmployee[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
};

const apps = ["siakad", "spmb", "simpeg"] as const;
type UnitAdminApp = (typeof apps)[number];

export function UnitAdminModal({ unit, employees, onClose, onChanged }: UnitAdminModalProps) {
  const [assignments, setAssignments] = useState<UnitAdminAssignment[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedApps, setSelectedApps] = useState<UnitAdminApp[]>(["simpeg"]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEmployees = useMemo(() => employees.filter((employee) => employee.isActive !== false && `${employee.fullName} ${employee.email || ""}`.toLowerCase().includes(query.toLowerCase())), [employees, query]);

  const loadAssignments = async () => {
    if (!unit) return;
    const response = await fetch(`/api/units/${unit.id}/admins`);
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseMessage(payload, "Daftar Admin Unit gagal dimuat."));
    setAssignments(Array.isArray(payload) ? payload : []);
  };

  useEffect(() => {
    if (!unit) return;
    setError(null);
    setUserId("");
    setQuery("");
    setSelectedApps(unit.category === "nondik" ? ["simpeg"] : ["simpeg"]);
    void loadAssignments().catch((caught) => setError(caught instanceof Error ? caught.message : "Daftar Admin Unit gagal dimuat."));
  }, [unit?.id]);

  if (!unit) return null;
  const isNondik = unit.category === "nondik";

  const toggleApp = (app: UnitAdminApp) => {
    if (isNondik && app !== "simpeg") return;
    setSelectedApps((current) => current.includes(app) ? current.filter((item) => item !== app) : [...current, app]);
  };

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || selectedApps.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/units/${unit.id}/admins`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId, apps: selectedApps }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin Unit gagal ditetapkan."));
      await loadAssignments();
      await onChanged();
      setUserId("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin Unit gagal ditetapkan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const revoke = async (assignment: UnitAdminAssignment) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/units/${unit.id}/admins/${assignment.userId}/${assignment.app}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin Unit gagal dicabut."));
      await loadAssignments();
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin Unit gagal dicabut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="unit-admin-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 id="unit-admin-title" className="font-heading text-lg font-bold text-primary">Admin Unit: {unit.name}</h2><p className="mt-1 text-xs text-slate-500">Tetapkan akses aplikasi sesuai kategori unit.</p></div><button type="button" onClick={onClose} className="text-slate-500" aria-label="Tutup Admin Unit"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div>{error && <p className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}<form onSubmit={assign} className="mt-4 rounded-md border border-border bg-neutral p-4"><div className="grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold text-primary">Cari Pegawai aktif<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama atau email" className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-primary">Pegawai aktif<select required value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih pegawai</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}{employee.email ? ` — ${employee.email}` : ""}</option>)}</select></label></div><fieldset className="mt-4"><legend className="text-xs font-semibold text-primary">Aplikasi</legend><div className="mt-2 flex flex-wrap gap-4"><label className="flex items-center gap-2 text-sm text-primary"><input type="checkbox" checked={selectedApps.includes("siakad")} disabled={isNondik} onChange={() => toggleApp("siakad")} />SIAKAD</label><label className="flex items-center gap-2 text-sm text-primary"><input type="checkbox" checked={selectedApps.includes("spmb")} disabled={isNondik} onChange={() => toggleApp("spmb")} />SPMB</label><label className="flex items-center gap-2 text-sm text-primary"><input type="checkbox" checked={selectedApps.includes("simpeg")} onChange={() => toggleApp("simpeg")} />Kepegawaian (SIMPEG)</label></div>{isNondik && <p className="mt-2 text-xs text-slate-600">Unit non-pendidikan hanya dapat memiliki Admin SIMPEG.</p>}</fieldset><div className="mt-4 flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !userId || selectedApps.length === 0}>{isSubmitting ? "Menyimpan..." : "Tetapkan Admin"}</Button></div></form><div className="mt-5"><h3 className="font-heading text-sm font-bold text-primary">Penugasan aktif</h3>{assignments.length === 0 ? <p className="mt-2 text-sm text-slate-500">Belum ada Admin Unit aktif.</p> : <ul className="mt-3 divide-y divide-border rounded-md border border-border">{assignments.map((assignment) => { const employee = assignment.user || employees.find((item) => item.id === assignment.userId); return <li key={assignment.id} className="flex items-center justify-between gap-4 p-3"><div><p className="text-sm font-semibold text-primary">{employee?.fullName || assignment.userId}</p><p className="text-xs text-slate-500">{employee?.email || assignment.app}</p></div><div className="flex items-center gap-2"><Badge variant="neutral">{assignment.app.toUpperCase()}</Badge><Button type="button" size="sm" variant="danger" disabled={isSubmitting} onClick={() => revoke(assignment)}>Cabut</Button></div></li>; })}</ul>}</div></div></div>;
}
