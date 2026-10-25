"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@alfida/ui";
import { DepartmentAdminAssignment, OrganizationDepartment, responseMessage } from "./types";
import { EmployeeSuggestion, EmployeeSuggestionPicker } from "./employee-suggestion-picker";

type DepartmentAdminModalProps = {
  department: OrganizationDepartment | null;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
};

export function DepartmentAdminModal({ department, onClose, onChanged }: DepartmentAdminModalProps) {
  const [assignments, setAssignments] = useState<DepartmentAdminAssignment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSuggestion | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssignments = async () => {
    if (!department) return;
    const response = await fetch(`/api/departments/${department.id}/admins`);
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseMessage(payload, "Daftar Admin Bidang gagal dimuat."));
    setAssignments(Array.isArray(payload) ? payload : []);
  };

  useEffect(() => {
    if (!department) return;
    setError(null);
    setSelectedEmployee(null);
    void loadAssignments().catch((caught) => setError(caught instanceof Error ? caught.message : "Daftar Admin Bidang gagal dimuat."));
  }, [department?.id]);

  if (!department) return null;

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/departments/${department.id}/admins`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: selectedEmployee.id }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin Bidang gagal ditetapkan."));
      await loadAssignments();
      await onChanged();
      setSelectedEmployee(null);
      setPickerKey((current) => current + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin Bidang gagal ditetapkan.");
    } finally { setIsSubmitting(false); }
  };

  const revoke = async (assignment: DepartmentAdminAssignment) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/departments/${department.id}/admins/${assignment.userId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin Bidang gagal dicabut."));
      await loadAssignments();
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin Bidang gagal dicabut.");
    } finally { setIsSubmitting(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="department-admin-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 id="department-admin-title" className="font-heading text-lg font-bold text-primary">Admin Bidang SIMAKIN: {department.name}</h2><p className="mt-1 text-xs text-slate-500">Hanya pegawai aktif yang dapat mendapat akses bidang.</p></div><button type="button" onClick={onClose} className="text-slate-500" aria-label="Tutup Admin Bidang"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div>{error && <p className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}<form onSubmit={assign} className="mt-4 rounded-md border border-border bg-neutral p-4"><EmployeeSuggestionPicker key={`${department.id}-${pickerKey}`} selected={selectedEmployee} onSelect={setSelectedEmployee} /><div className="mt-4 flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !selectedEmployee}>{isSubmitting ? "Menyimpan..." : "Tetapkan Admin"}</Button></div></form><div className="mt-5"><h3 className="font-heading text-sm font-bold text-primary">Penugasan aktif</h3>{assignments.length === 0 ? <p className="mt-2 text-sm text-slate-500">Belum ada Admin Bidang aktif.</p> : <ul className="mt-3 divide-y divide-border rounded-md border border-border">{assignments.map((assignment) => { const employee = assignment.user; return <li key={assignment.id} className="flex items-center justify-between gap-4 p-3"><div><p className="text-sm font-semibold text-primary">{employee?.fullName || assignment.userId}</p><p className="text-xs text-slate-500">{employee?.email || "Admin Bidang SIMAKIN"}</p></div><Button type="button" size="sm" variant="danger" disabled={isSubmitting} onClick={() => revoke(assignment)}>Cabut</Button></li>; })}</ul>}</div></div></div>;
}
