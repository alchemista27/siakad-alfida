"use client";

import { FormEvent, useState } from "react";
import { StudentRegistrationFormSchema } from "@alfida/contracts";
import { TRANSPORTATION_EXAMPLES } from "@/lib/parent-form-fields";
import { apiRequest, type ParentRegistration, type SubmitStudentDataResponse } from "@/lib/spmb-registration";

type ResidenceStatus = "with_parents" | "with_guardian" | "boarding" | "rented" | "other";

type StudentFormState = {
  fullName: string;
  nickname: string;
  gender: "male" | "female";
  religion: string;
  birthPlace: string;
  birthDate: string;
  nisn: string;
  siblingsCount: string;
  transportation: string;
  nik: string;
  birthCertificateNumber: string;
  familyCardNumber: string;
  streetAddress: string;
  rt: string;
  rw: string;
  hamlet: string;
  village: string;
  subdistrict: string;
  city: string;
  province: string;
  postalCode: string;
  residenceStatus: ResidenceStatus;
  specialNeeds: string;
  pipEligible: boolean;
  kipNumber: string;
  previousSchoolName: string;
  previousSchoolNpsn: string;
  graduationDocumentNumber: string;
  graduationYear: string;
  tkGroup: "" | "a" | "b";
};

function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function isPriorSchoolLevel(level: ParentRegistration["period"]["educationLevel"]) {
  return level === "smp" || level === "sma";
}

export function StudentRegistrationForm({ registration }: { registration: ParentRegistration }) {
  const existing = registration.studentData;
  const [form, setForm] = useState<StudentFormState>({
    fullName: existing?.fullName || "",
    nickname: existing?.nickname || "",
    gender: existing?.gender || "male",
    religion: existing?.religion || "Islam",
    birthPlace: existing?.birthPlace || "",
    birthDate: toDateInput(existing?.birthDate),
    nisn: existing?.nisn || "",
    siblingsCount: String(existing?.siblingsCount ?? 0),
    transportation: existing?.transportation || "",
    nik: existing?.nik || "",
    birthCertificateNumber: existing?.birthCertificateNumber || "",
    familyCardNumber: existing?.familyCardNumber || "",
    streetAddress: existing?.streetAddress || "",
    rt: existing?.rt || "",
    rw: existing?.rw || "",
    hamlet: existing?.hamlet || "",
    village: existing?.village || "",
    subdistrict: existing?.subdistrict || "",
    city: existing?.city || "",
    province: existing?.province || "",
    postalCode: existing?.postalCode || "",
    residenceStatus: existing?.residenceStatus || "with_parents",
    specialNeeds: existing?.specialNeeds || "",
    pipEligible: existing?.pipEligible || false,
    kipNumber: existing?.kipNumber || "",
    previousSchoolName: existing?.previousSchoolName || "",
    previousSchoolNpsn: existing?.previousSchoolNpsn || "",
    graduationDocumentNumber: existing?.graduationDocumentNumber || "",
    graduationYear: existing?.graduationYear ? String(existing.graduationYear) : "",
    tkGroup: existing?.tkGroup || "",
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const level = registration.period.educationLevel;
  const isTk = level === "tk";
  const needsPriorSchool = isPriorSchoolLevel(level);

  const update = <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!level) {
      setNotice("Jenjang periode belum dikonfigurasi. Hubungi panitia SPMB.");
      return;
    }
    const parsed = StudentRegistrationFormSchema.safeParse({
      ...form,
      siblingsCount: Number(form.siblingsCount),
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
    });
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message || "Data murid tidak valid.");
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const result = await apiRequest<SubmitStudentDataResponse>(
        `/api/registrations/${encodeURIComponent(registration.id)}/student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (result.nextStep !== "parent_form" || !result.studentDataComplete) {
        throw new Error("Data murid belum tersimpan lengkap. Silakan coba lagi.");
      }
      window.location.assign(`/parent/form-parents?registrationId=${encodeURIComponent(registration.id)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan data murid.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-6">
      {notice && <div role="alert" className="spmb-notice-error">{notice}</div>}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-primary">Identitas Calon Murid</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-xs"><span className="font-semibold block mb-1">Nama Lengkap *</span><input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Nama Panggilan *</span><input required value={form.nickname} onChange={(e) => update("nickname", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Jenis Kelamin *</span><select value={form.gender} onChange={(e) => update("gender", e.target.value as StudentFormState["gender"])} className="w-full spmb-input"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Agama *</span><input required value={form.religion} onChange={(e) => update("religion", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Tempat Lahir *</span><input required value={form.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Tanggal Lahir *</span><input type="date" required value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} className="w-full spmb-input" /></label>
          {isTk && <label className="block text-xs"><span className="font-semibold block mb-1">Kelompok TK *</span><select required value={form.tkGroup} onChange={(e) => update("tkGroup", e.target.value as StudentFormState["tkGroup"])} className="w-full spmb-input"><option value="">Pilih kelompok</option><option value="a">Kelompok A</option><option value="b">Kelompok B</option></select><span className="mt-1 block text-[11px] text-gray-500">Pilih kelompok yang diajukan untuk calon murid.</span></label>}
          <label className="block text-xs"><span className="font-semibold block mb-1">NISN (Jika ada)</span><input inputMode="numeric" value={form.nisn} onChange={(e) => update("nisn", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Jumlah Saudara *</span><input type="number" min="0" required value={form.siblingsCount} onChange={(e) => update("siblingsCount", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">NIK Murid *</span><input required inputMode="numeric" maxLength={16} value={form.nik} onChange={(e) => update("nik", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Nomor Akta Kelahiran *</span><input required value={form.birthCertificateNumber} onChange={(e) => update("birthCertificateNumber", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Nomor Kartu Keluarga *</span><input required inputMode="numeric" maxLength={16} value={form.familyCardNumber} onChange={(e) => update("familyCardNumber", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Transportasi ke Sekolah *</span><input required value={form.transportation} onChange={(e) => update("transportation", e.target.value)} placeholder={TRANSPORTATION_EXAMPLES} className="w-full spmb-input" /></label>
        </div>
      </section>

      <section className="border-t border-border pt-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-primary">Data Kependudukan & Domisili</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-xs sm:col-span-2"><span className="font-semibold block mb-1">Alamat Jalan *</span><textarea required rows={2} value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">RT *</span><input required inputMode="numeric" maxLength={3} value={form.rt} onChange={(e) => update("rt", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">RW *</span><input required inputMode="numeric" maxLength={3} value={form.rw} onChange={(e) => update("rw", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Dusun (opsional)</span><input value={form.hamlet} onChange={(e) => update("hamlet", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Kelurahan/Desa *</span><input required value={form.village} onChange={(e) => update("village", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Kecamatan *</span><input required value={form.subdistrict} onChange={(e) => update("subdistrict", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Kabupaten/Kota *</span><input required value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Provinsi *</span><input required value={form.province} onChange={(e) => update("province", e.target.value)} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Kode Pos *</span><input required inputMode="numeric" maxLength={5} value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
          <label className="block text-xs"><span className="font-semibold block mb-1">Status Tempat Tinggal *</span><select value={form.residenceStatus} onChange={(e) => update("residenceStatus", e.target.value as ResidenceStatus)} className="w-full spmb-input"><option value="with_parents">Bersama orang tua</option><option value="with_guardian">Bersama wali</option><option value="boarding">Asrama</option><option value="rented">Kontrak/kos</option><option value="other">Lainnya</option></select></label>
        </div>
      </section>

      <section className="border-t border-border pt-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-primary">Kebutuhan Dukungan</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-xs sm:col-span-2"><span className="font-semibold block mb-1">Kebutuhan Khusus (jika ada)</span><input value={form.specialNeeds} onChange={(e) => update("specialNeeds", e.target.value)} className="w-full spmb-input" /></label>
          <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={form.pipEligible} onChange={(e) => update("pipEligible", e.target.checked)} /> Layak PIP</label>
          {form.pipEligible && <label className="block text-xs"><span className="font-semibold block mb-1">Nomor KIP *</span><input required value={form.kipNumber} onChange={(e) => update("kipNumber", e.target.value)} className="w-full spmb-input" /></label>}
        </div>
      </section>

      {needsPriorSchool && (
        <section className="border-t border-border pt-5 space-y-4">
          <h2 className="font-heading text-lg font-bold text-primary">Data Sekolah Asal & Kelulusan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-xs"><span className="font-semibold block mb-1">Nama Sekolah Asal *</span><input required value={form.previousSchoolName} onChange={(e) => update("previousSchoolName", e.target.value)} className="w-full spmb-input" /></label>
            <label className="block text-xs"><span className="font-semibold block mb-1">NPSN Sekolah Asal *</span><input required inputMode="numeric" maxLength={8} value={form.previousSchoolNpsn} onChange={(e) => update("previousSchoolNpsn", e.target.value.replace(/\D/g, ""))} className="w-full spmb-input" /></label>
            <label className="block text-xs"><span className="font-semibold block mb-1">Nomor SKL/Ijazah *</span><input required value={form.graduationDocumentNumber} onChange={(e) => update("graduationDocumentNumber", e.target.value)} className="w-full spmb-input" /></label>
            <label className="block text-xs"><span className="font-semibold block mb-1">Tahun Lulus *</span><input required type="number" min="1900" max="2100" value={form.graduationYear} onChange={(e) => update("graduationYear", e.target.value)} className="w-full spmb-input" /></label>
          </div>
        </section>
      )}

      <button type="submit" disabled={busy} className="spmb-button-primary">{busy ? "Menyimpan..." : "Simpan Data Murid"}</button>
    </form>
  );
}
