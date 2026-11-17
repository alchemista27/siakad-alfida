"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { NotificationModal } from "@/components/notification-modal";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

type Target = "pembina" | "peserta";
type Gender = "ikhwan" | "akhwat";
type Level = "pra_tahsin" | "tahsin" | "tahfiz";

interface Employee {
  id: string;
  fullName: string;
  email: string;
  unitId?: string | null;
  unitName?: string | null;
  isActive: boolean;
}

interface ExaminerAssignment {
  id: string;
  academicYear: string;
  target: Target;
  gender: Gender;
  unitId: string | null;
  unitName: string | null;
  levels: Level[];
  assignedAt: string;
  examiner: Omit<Employee, "isActive">;
}

type Notice = { title: string; message: string; tone: "success" | "error" };
const allLevels: Array<{ value: Level; label: string }> = [
  { value: "pra_tahsin", label: "Pra Tahsin" },
  { value: "tahsin", label: "Tahsin" },
  { value: "tahfiz", label: "Tahfiz" },
];
const emptyForm = { examinerUserId: "", target: "peserta" as Target, gender: "ikhwan" as Gender, unitId: "", levels: [] as Level[] };

export function ExaminerAssignmentManager() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ExaminerAssignment[]>([]);
  const [academicYear, setAcademicYear] = useState("2026/2027");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const canManage = hasSiyaumRole(user, "admin_ymq");
  const units = useMemo(() => {
    const entries = new Map<string, string>();
    employees.forEach((employee) => { if (employee.unitId && employee.unitName) entries.set(employee.unitId, employee.unitName); });
    return [...entries.entries()].map(([id, name]) => ({ id, name })).sort((left, right) => left.name.localeCompare(right.name, "id"));
  }, [employees]);
  const candidates = useMemo(
    () => employees.filter((employee) => `${employee.fullName} ${employee.email} ${employee.unitName || ""}`.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  );

  const load = async (year = academicYear) => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      const [employeeList, assignmentList] = hasSiyaumRole(currentUser, "admin_ymq")
        ? await Promise.all([
          apiFetch<Employee[]>("/ymq/employees/assignable"),
          apiFetch<ExaminerAssignment[]>(`/examiner-assignments?academicYear=${encodeURIComponent(year)}`),
        ])
        : [[], []];
      setUser(currentUser);
      setEmployees(employeeList.filter((employee) => employee.isActive));
      setAssignments(assignmentList);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data penugasan penguji tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleLevel = (level: Level) => {
    setForm((current) => ({
      ...current,
      levels: current.levels.includes(level) ? current.levels.filter((item) => item !== level) : [...current.levels, level],
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/examiner-assignments", {
        method: "POST",
        body: JSON.stringify({
          academicYear,
          examinerUserId: form.examinerUserId,
          target: form.target,
          gender: form.gender,
          unitId: form.target === "peserta" ? form.unitId : null,
          levels: form.target === "peserta" ? form.levels : [],
        }),
      });
      setForm(emptyForm);
      setSearch("");
      setFormOpen(false);
      await load(academicYear);
      setNotice({ title: "Penguji ditetapkan", message: "Penugasan penguji aktif telah disimpan.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Penguji belum ditetapkan", message: reason instanceof Error ? reason.message : "Periksa kembali data penugasan.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (id: string) => {
    setSaving(true);
    try {
      await apiFetch(`/examiner-assignments/${id}`, { method: "DELETE" });
      await load(academicYear);
      setNotice({ title: "Penugasan dicabut", message: "Riwayat penguji tetap tersimpan untuk audit.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Penugasan belum dicabut", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const refreshYear = () => void load(academicYear);

  return (
    <SiyaumAppShell user={user} active="penguji">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Administrasi YMQ</p><h1 className="mt-1 font-heading text-3xl font-bold">Penugasan Penguji</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Atur penguji berdasarkan tahun akademik, sasaran, gender, unit, dan level pembelajaran.</p></div>
          {canManage ? <Button type="button" onClick={() => setFormOpen(true)}><span className="material-symbols-rounded text-[18px]" aria-hidden="true">add</span>Tambah Penguji</Button> : null}
        </header>
        {loading ? <LoadingState message="Memuat penugasan penguji…" /> : error ? <ErrorState message={error} onRetry={refreshYear} /> : !canManage ? (
          <EmptyState title="Akses administrasi tidak tersedia" description="Penugasan penguji hanya dapat dikelola oleh Admin YMQ." />
        ) : <>
          <Card className="shadow-none"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><label className="block text-sm font-semibold">Tahun akademik<input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm sm:w-40" placeholder="2026/2027" /></label><Button type="button" variant="outline" disabled={loading} onClick={refreshYear}>Muat Penugasan</Button></div></Card>
          <Card className="shadow-none"><h2 className="font-heading text-xl font-bold">Penguji aktif</h2><p className="mt-1 text-sm text-primary/70">{assignments.length} penugasan aktif pada {academicYear}.</p>{assignments.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-primary/60"><tr><th className="px-3 py-2">Target Penugasan</th><th className="px-3 py-2">Gender</th><th className="px-3 py-2">Unit / level</th><th className="px-3 py-2">Penguji</th><th className="px-3 py-2">Tindakan</th></tr></thead><tbody>{assignments.map((assignment) => <tr key={assignment.id} className="border-b border-border last:border-0"><td className="px-3 py-3 font-medium">{assignment.target === "pembina" ? "Pembina YMQ" : "Peserta per Unit"}</td><td className="px-3 py-3">{assignment.gender === "ikhwan" ? "Ikhwan" : "Akhwat"}</td><td className="px-3 py-3">{assignment.target === "pembina" ? "Semua pembina" : <><span className="block">{assignment.unitName}</span><span className="text-xs text-primary/60">{assignment.levels.map((level) => allLevels.find((item) => item.value === level)?.label).join(", ")}</span></>}</td><td className="px-3 py-3"><span className="block font-medium">{assignment.examiner.fullName}</span><span className="text-xs text-primary/60">{assignment.examiner.unitName || "Tanpa unit"}</span></td><td className="px-3 py-3"><Button type="button" size="sm" variant="danger" disabled={saving} onClick={() => void revoke(assignment.id)}>Cabut</Button></td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada penguji" description="Tambahkan penugasan berdasarkan cakupan yang diperlukan." />}</Card>
        </>}
      </div>
      {formOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="examiner-assignment-title"><form onSubmit={submit} className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 id="examiner-assignment-title" className="font-heading text-xl font-bold">Tambah Penugasan Penguji</h2><p className="mt-1 text-sm text-primary/65">Satu penguji aktif untuk satu cakupan penugasan.</p></div><button type="button" onClick={() => setFormOpen(false)} className="text-primary/65" aria-label="Tutup modal penugasan penguji"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Target Penugasan<select value={form.target} onChange={(event) => setForm((current) => ({ ...current, target: event.target.value as Target, unitId: "", levels: [] }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="pembina">Pembina YMQ</option><option value="peserta">Peserta per Unit</option></select></label><label className="block text-sm font-semibold">Gender<select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="ikhwan">Ikhwan</option><option value="akhwat">Akhwat</option></select></label>{form.target === "peserta" ? <><label className="block text-sm font-semibold">Unit<select required value={form.unitId} onChange={(event) => setForm((current) => ({ ...current, unitId: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><fieldset><legend className="text-sm font-semibold">Level pembelajaran</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{allLevels.map((level) => <label key={level.value} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm"><input type="checkbox" checked={form.levels.includes(level.value)} onChange={() => toggleLevel(level.value)} />{level.label}</label>)}</div></fieldset></> : null}<label className="block text-sm font-semibold">Cari penguji<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Cari nama, email, atau unit" /></label><label className="block text-sm font-semibold">Pegawai penguji<select required value={form.examinerUserId} onChange={(event) => setForm((current) => ({ ...current, examinerUserId: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih pegawai aktif</option>{candidates.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.unitName || "Tanpa unit"}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => setFormOpen(false)}>Batal</Button><Button type="submit" disabled={saving || !form.examinerUserId || (form.target === "peserta" && (!form.unitId || !form.levels.length))}>{saving ? "Menyimpan..." : "Simpan Penugasan"}</Button></div></form></div> : null}
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </SiyaumAppShell>
  );
}
