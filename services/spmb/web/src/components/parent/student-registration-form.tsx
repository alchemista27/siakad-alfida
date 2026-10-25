"use client";

import { FormEvent, useState } from "react";
import { StudentRegistrationFormSchema } from "@alfida/contracts";
import { TRANSPORTATION_EXAMPLES } from "@/lib/parent-form-fields";
import { apiRequest, type ParentRegistration } from "@/lib/spmb-registration";

type StudentFormState = {
  fullName: string;
  nickname: string;
  gender: "male" | "female";
  religion: string;
  birthPlace: string;
  birthDate: string;
  nisn: string;
  siblingsCount: string;
  address: string;
  transportation: string;
};

function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function StudentRegistrationForm({ registration }: { registration: ParentRegistration }) {
  const [form, setForm] = useState<StudentFormState>({
    fullName: registration.studentData?.fullName || "",
    nickname: registration.studentData?.nickname || "",
    gender: registration.studentData?.gender || "male",
    religion: registration.studentData?.religion || "Islam",
    birthPlace: registration.studentData?.birthPlace || "",
    birthDate: toDateInput(registration.studentData?.birthDate),
    nisn: registration.studentData?.nisn || "",
    siblingsCount: String(registration.studentData?.siblingsCount ?? 0),
    address: registration.studentData?.address || "",
    transportation: registration.studentData?.transportation || "",
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const update = <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = StudentRegistrationFormSchema.safeParse({
      ...form,
      siblingsCount: Number(form.siblingsCount),
    });
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message || "Data siswa tidak valid.");
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      await apiRequest(`/api/registrations/${encodeURIComponent(registration.id)}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      window.location.assign(`/parent/form-parents?registrationId=${encodeURIComponent(registration.id)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan data siswa.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      {notice && <div className="spmb-notice-error">{notice}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-xs"><span className="font-semibold block mb-1">Nama Lengkap *</span><input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Nama Panggilan *</span><input required value={form.nickname} onChange={(e) => update("nickname", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Jenis Kelamin *</span><select value={form.gender} onChange={(e) => update("gender", e.target.value as StudentFormState["gender"])} className="w-full spmb-input"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Agama *</span><input required value={form.religion} onChange={(e) => update("religion", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Tempat Lahir *</span><input required value={form.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Tanggal Lahir *</span><input type="date" required value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">NISN (Jika ada)</span><input value={form.nisn} onChange={(e) => update("nisn", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Jumlah Saudara *</span><input type="number" min="0" required value={form.siblingsCount} onChange={(e) => update("siblingsCount", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs sm:col-span-2"><span className="font-semibold block mb-1">Alamat Lengkap *</span><textarea required rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full spmb-input" /></label>
        <label className="block text-xs sm:col-span-2"><span className="font-semibold block mb-1">Transportasi ke Sekolah *</span><input required value={form.transportation} onChange={(e) => update("transportation", e.target.value)} placeholder={TRANSPORTATION_EXAMPLES} className="w-full spmb-input" /></label>
      </div>
      <button type="submit" disabled={busy} className="spmb-button-primary">{busy ? "Menyimpan..." : "Simpan Data Siswa"}</button>
    </form>
  );
}
