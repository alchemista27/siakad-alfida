"use client";

import { useEffect, useState, type FormEvent } from "react";
import { InlineNotice } from "@/components/inline-notice";
import { UnitAssetUploader } from "@/components/unit-asset-uploader";
import { siakadApiFetch } from "@/lib/api";

type UnitIdentity = {
  unitId: string;
  logoUrl: string | null;
  principalName: string | null;
  principalSignatureUrl: string | null;
};

type Feedback = {
  tone: "info" | "success" | "error";
  message: string;
};

export function UnitIdentityForm() {
  const [identity, setIdentity] = useState<UnitIdentity | null>(null);
  const [principalNameInput, setPrincipalNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      try {
        const loaded = await siakadApiFetch<UnitIdentity>("/unit-identity/me");
        if (!active) return;
        setIdentity(loaded);
        setPrincipalNameInput(loaded.principalName ?? "");
      } catch (error) {
        if (active) {
          setFeedback({
            tone: "error",
            message: error instanceof Error ? error.message : "Identitas unit tidak dapat dimuat.",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadIdentity();
    return () => {
      active = false;
    };
  }, []);

  const updateAsset = (field: "logoUrl" | "principalSignatureUrl", secureUrl: string) => {
    setIdentity((current) => current ? { ...current, [field]: secureUrl } : current);
    setFeedback({ tone: "info", message: "File siap disimpan bersama perubahan identitas unit." });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identity) return;

    const logoUrl = identity.logoUrl;
    const principalSignatureUrl = identity.principalSignatureUrl;
    const normalizedPrincipalName = principalNameInput.trim();
    const principalName = normalizedPrincipalName || null;

    setSaving(true);
    setFeedback(null);
    try {
      const updated = await siakadApiFetch<UnitIdentity>("/unit-identity/me", {
        method: "PATCH",
        body: JSON.stringify({ logoUrl, principalName, principalSignatureUrl }),
      });
      setIdentity(updated);
      setPrincipalNameInput(updated.principalName ?? "");
      setFeedback({ tone: "success", message: "Identitas unit berhasil disimpan." });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Identitas unit tidak dapat disimpan.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <InlineNotice tone="info">Memuat identitas unit dari hak akses Anda…</InlineNotice>;
  }

  if (!identity) {
    return <InlineNotice tone="error" title="Identitas unit tidak tersedia">{feedback?.message ?? "Akses unit pendidikan diperlukan untuk membuka halaman ini."}</InlineNotice>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InlineNotice tone="info" title="Unit dari akses Anda">
        Unit dipilih dari sesi akun Anda. Logo dan tanda tangan hanya dapat disimpan pada unit tersebut.
      </InlineNotice>

      {feedback ? <InlineNotice tone={feedback.tone}>{feedback.message}</InlineNotice> : null}

      <section className="rounded-lg border border-[#E3E8E7] bg-white p-5">
        <label htmlFor="principal-name" className="block text-sm font-semibold text-[#454545]">Nama pimpinan unit</label>
        <p className="mt-1 text-sm text-[#454545]/70">Nama ini dipakai pada dokumen akademik yang dihasilkan SIAKAD.</p>
        <input
          id="principal-name"
          type="text"
          value={principalNameInput}
          onChange={(event) => setPrincipalNameInput(event.target.value)}
          className="mt-3 w-full rounded border border-[#E3E8E7] bg-white px-3.5 py-2.5 text-sm text-[#454545] outline-none placeholder:text-[#454545]/40 focus:border-[#0f7f6d] focus:ring-2 focus:ring-[#0f7f6d]/15"
          placeholder="Contoh: Drs. Ahmad Rahman, M.Pd."
          disabled={saving}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <UnitAssetUploader
          kind="logo"
          unitId={identity.unitId}
          label="Logo unit"
          hint="PNG, JPEG, atau WebP. Maksimal 5 MB."
          value={identity.logoUrl}
          onUploaded={(secureUrl) => updateAsset("logoUrl", secureUrl)}
          disabled={saving}
        />
        <UnitAssetUploader
          kind="principalSignature"
          unitId={identity.unitId}
          label="Tanda tangan pimpinan"
          hint="PNG, JPEG, atau WebP. Maksimal 3 MB."
          value={identity.principalSignatureUrl}
          onUploaded={(secureUrl) => updateAsset("principalSignatureUrl", secureUrl)}
          disabled={saving}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded bg-[#0f7f6d] px-5 py-3 text-sm font-semibold text-[#F7F8F8] hover:bg-[#0b695a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-rounded text-[18px]" aria-hidden="true">save</span>
          {saving ? "Menyimpan…" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
