"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SpmbNavbar } from "@/components/SpmbNavbar";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  apiRequest,
  getStageRouteForRegistration,
  loadParentRegistration,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentBiodataPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    nickname: "",
    gender: "male" as "male" | "female",
    birthPlace: "",
    birthDate: "",
    nisn: "",
    siblingsCount: "0",
    address: "",
  });
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");

  const refresh = async () => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const reg = await loadParentRegistration(params?.get("registrationId"));
    setRegistration(reg);
    if (reg?.studentData) {
      setStudentForm({
        fullName: reg.studentData.fullName || "",
        nickname: reg.studentData.nickname || "",
        gender: reg.studentData.gender || "male",
        birthPlace: reg.studentData.birthPlace || "",
        birthDate: reg.studentData.birthDate ? new Date(reg.studentData.birthDate).toISOString().slice(0, 10) : "",
        nisn: reg.studentData.nisn || "",
        siblingsCount: String(reg.studentData.siblingsCount ?? 0),
        address: reg.studentData.address || "",
      });
    }
    const father = reg?.parentData?.find((p) => p.type === "father");
    const mother = reg?.parentData?.find((p) => p.type === "mother");
    if (father) {
      setFatherName(father.fullName || "");
      setFatherPhone(father.phone || "");
    }
    if (mother) {
      setMotherName(mother.fullName || "");
      setMotherPhone(mother.phone || "");
    }
  };

  useEffect(() => {
    refresh()
      .catch((err) => setNotice({ type: "error", message: err instanceof Error ? err.message : "Gagal memuat biodata." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!registration) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiRequest(`/api/registrations/${encodeURIComponent(registration.id)}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studentForm,
          siblingsCount: Number(studentForm.siblingsCount || 0),
        }),
      });
      await apiRequest(`/api/registrations/${encodeURIComponent(registration.id)}/parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          father: { fullName: fatherName, phone: fatherPhone },
          mother: { fullName: motherName, phone: motherPhone },
        }),
      });
      await refresh();
      setNotice({ type: "success", message: "Biodata siswa dan orang tua tersimpan. Silakan lanjutkan unggah berkas." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menyimpan biodata." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">
        <SpmbNavbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/parent" className="text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
        </main>
      </div>
    );
  }

  const canEdit = registration.status === "payment_verified" || registration.status === "form_filling";

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">
      <SpmbNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        {notice && (
          <div className={`mt-6 border rounded-md p-4 text-sm ${notice.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"}`}>
            {notice.message}
          </div>
        )}

        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <h1 className="font-heading font-bold text-2xl">Tahap 2 — Biodata Siswa & Orang Tua</h1>
          {canEdit ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Nama Lengkap Siswa *</span>
                  <input required value={studentForm.fullName} onChange={(e) => setStudentForm((c) => ({ ...c, fullName: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Tempat Lahir *</span>
                  <input required value={studentForm.birthPlace} onChange={(e) => setStudentForm((c) => ({ ...c, birthPlace: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Tanggal Lahir *</span>
                  <input type="date" required value={studentForm.birthDate} onChange={(e) => setStudentForm((c) => ({ ...c, birthDate: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Alamat Lengkap *</span>
                  <input required value={studentForm.address} onChange={(e) => setStudentForm((c) => ({ ...c, address: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Nama Ayah *</span>
                  <input required value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold block mb-1">Nama Ibu *</span>
                  <input required value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm" />
                </label>
              </div>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold">
                {busy ? "Menyimpan..." : "Simpan Biodata"}
              </button>
            </form>
          ) : (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Tahap pengisian biodata tidak aktif untuk status pendaftaran saat ini.</p>
              <Link href={getStageRouteForRegistration(registration)} className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline">
                Buka Tahap Aktif Saat Ini
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
