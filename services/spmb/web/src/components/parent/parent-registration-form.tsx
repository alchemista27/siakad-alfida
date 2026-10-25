"use client";

import { FormEvent, useState } from "react";
import { ParentRegistrationFormSchema, type ParentIdentityForm } from "@alfida/contracts";
import { EDUCATION_OPTIONS, INCOME_RANGE_OPTIONS } from "@/lib/parent-form-fields";
import { apiRequest, type ParentRecord, type ParentRegistration } from "@/lib/spmb-registration";

function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function emptyParent(): ParentIdentityForm {
  return {
    fullName: "",
    nik: "",
    birthPlace: "",
    birthDate: "",
    education: "",
    occupation: "",
    incomeRange: "",
    phone: "",
    address: "",
  };
}

function formFromRecord(record?: ParentRecord): ParentIdentityForm {
  return {
    fullName: record?.fullName || "",
    nik: record?.nik || "",
    birthPlace: record?.birthPlace || "",
    birthDate: toDateInput(record?.birthDate),
    education: record?.education || "",
    occupation: record?.occupation || "",
    incomeRange: record?.incomeRange || "",
    phone: record?.phone || "",
    address: record?.address || "",
  };
}

function ParentFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ParentIdentityForm;
  onChange: (next: ParentIdentityForm) => void;
}) {
  const update = <K extends keyof ParentIdentityForm>(key: K, nextValue: ParentIdentityForm[K]) => {
    onChange({ ...value, [key]: nextValue });
  };
  const inputClass = "w-full px-3 py-2 border border-border rounded-sm bg-white text-sm";

  return (
    <fieldset className="border border-border rounded-md p-4">
      <legend className="px-1 font-heading font-bold text-lg">Data {title}</legend>
      <div className="mt-3 grid sm:grid-cols-2 gap-4">
        <label className="block text-xs"><span className="font-semibold block mb-1">Nama Lengkap *</span><input required value={value.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">NIK (16 Digit) *</span><input inputMode="numeric" pattern="[0-9]{16}" required value={value.nik} onChange={(e) => update("nik", e.target.value.replace(/\D/g, "").slice(0, 16))} className={inputClass} /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Tempat Lahir *</span><input required value={value.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} className={inputClass} /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Tanggal Lahir *</span><input type="date" required value={value.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={inputClass} /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Pendidikan Terakhir *</span><select required value={value.education} onChange={(e) => update("education", e.target.value)} className={inputClass}><option value="">Pilih pendidikan</option>{EDUCATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Pekerjaan *</span><input required value={value.occupation} onChange={(e) => update("occupation", e.target.value)} className={inputClass} /></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Rentang Penghasilan *</span><select required value={value.incomeRange} onChange={(e) => update("incomeRange", e.target.value)} className={inputClass}><option value="">Pilih rentang penghasilan</option>{INCOME_RANGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="block text-xs"><span className="font-semibold block mb-1">Nomor WA/HP *</span><input inputMode="tel" required value={value.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></label>
        <label className="block text-xs sm:col-span-2"><span className="font-semibold block mb-1">Alamat Lengkap *</span><textarea required rows={3} value={value.address} onChange={(e) => update("address", e.target.value)} className={inputClass} /></label>
      </div>
    </fieldset>
  );
}

export function ParentRegistrationForm({ registration }: { registration: ParentRegistration }) {
  const fatherRecord = registration.parentData.find((record) => record.type === "father");
  const motherRecord = registration.parentData.find((record) => record.type === "mother");
  const [father, setFather] = useState<ParentIdentityForm>(fatherRecord ? formFromRecord(fatherRecord) : emptyParent());
  const [mother, setMother] = useState<ParentIdentityForm>(motherRecord ? formFromRecord(motherRecord) : emptyParent());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = ParentRegistrationFormSchema.safeParse({ father, mother });
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message || "Data orang tua tidak valid.");
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      await apiRequest(`/api/registrations/${encodeURIComponent(registration.id)}/parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      window.location.assign(`/parent/documents?registrationId=${encodeURIComponent(registration.id)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan data orang tua.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      {notice && <div className="border border-red-200 bg-red-50 text-red-800 rounded-md p-3 text-sm">{notice}</div>}
      <ParentFields title="Ayah" value={father} onChange={setFather} />
      <ParentFields title="Ibu" value={mother} onChange={setMother} />
      <button type="submit" disabled={busy} className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-sm font-semibold">{busy ? "Menyimpan..." : "Simpan Data Orang Tua"}</button>
    </form>
  );
}
