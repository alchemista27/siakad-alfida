"use client";

import { getSpmbEntries, type SpmbEntry } from "@alfida/contracts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentSsoUser, SsoClientError } from "@/lib/sso-client";
import { SpmbBrandMark } from "@/components/spmb-brand-mark";
import { useFoundationBranding } from "@/components/foundation-branding-provider";

type LoadState =
  | { kind: "loading" }
  | { kind: "entries"; entries: SpmbEntry[] }
  | { kind: "unauthorized" }
  | { kind: "no-spmb-role" }
  | { kind: "error"; message: string };

export function SpmbEntrySelector() {
  const router = useRouter();
  const { foundationName } = useFoundationBranding();
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function resolveEntry() {
      setState({ kind: "loading" });

      try {
        const user = await getCurrentSsoUser();
        const entries = getSpmbEntries(user.roles || []);
        if (!active) return;

        if (entries.length === 0) {
          setState({ kind: "no-spmb-role" });
          return;
        }
        if (entries.length === 1) {
          router.replace(entries[0].path);
          return;
        }
        setState({ kind: "entries", entries });
      } catch (error) {
        if (!active) return;

        if (error instanceof SsoClientError && error.kind === "unauthorized") {
          setState({ kind: "unauthorized" });
          window.location.replace(`${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`);
          return;
        }

        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Layanan identitas belum dapat memuat akses SPMB.",
        });
      }
    }

    void resolveEntry();
    return () => {
      active = false;
    };
  }, [authUrl, retryKey, router]);

  if (state.kind === "loading" || state.kind === "unauthorized") {
    return (
      <main className="min-h-screen grid place-items-center bg-neutral text-primary font-body">
        <div className="inline-flex items-center gap-3 bg-surface border border-border rounded-lg px-5 py-3 text-sm">
          <span className="material-symbols-rounded animate-spin text-tertiary" aria-hidden="true">progress_activity</span>
          <span>{state.kind === "unauthorized" ? "Mengalihkan ke halaman masuk..." : "Memuat akses SPMB..."}</span>
        </div>
      </main>
    );
  }

  if (state.kind === "no-spmb-role") {
    return (
      <main className="min-h-screen grid place-items-center bg-neutral text-primary font-body p-6">
        <section className="w-full max-w-lg bg-surface border border-border rounded-lg p-6 text-center">
          <span className="material-symbols-rounded text-tertiary text-4xl" aria-hidden="true">info</span>
          <h1 className="font-heading font-bold text-2xl mt-3">Akses SPMB Belum Tersedia</h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Akun ini belum memiliki peran untuk portal SPMB. Kembali ke Portal Modul untuk memilih layanan yang tersedia.
          </p>
          <a
            href={`${authUrl}/modules`}
            className="inline-flex mt-5 px-4 py-2 rounded-sm bg-tertiary text-white text-sm font-semibold hover:bg-[#0b6355]"
          >
            Kembali ke Portal Modul
          </a>
        </section>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="min-h-screen grid place-items-center bg-neutral text-primary font-body p-6">
        <section className="w-full max-w-lg bg-surface border border-red-200 rounded-lg p-6 text-center">
          <span className="material-symbols-rounded text-red-600 text-4xl" aria-hidden="true">error</span>
          <h1 className="font-heading font-bold text-2xl mt-3">Akses SPMB Belum Dapat Dimuat</h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{state.message}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="inline-flex px-4 py-2 rounded-sm bg-tertiary text-white text-sm font-semibold hover:bg-[#0b6355]"
            >
              Coba lagi
            </button>
            <a
              href={`${authUrl}/modules`}
              className="inline-flex px-4 py-2 rounded-sm border border-tertiary text-tertiary text-sm font-semibold hover:bg-[#e6f4f1]"
            >
              Kembali ke Portal Modul
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral text-primary font-body p-6 grid place-items-center">
      <section className="w-full max-w-3xl">
        <header className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <SpmbBrandMark surface="content" />
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-tertiary">SPMB {foundationName}</p>
          <h1 className="font-heading font-bold text-3xl mt-2">Pilih Ruang Kerja SPMB</h1>
          <p className="text-sm text-gray-600 mt-2">Pilih akses sesuai peran Anda pada proses penerimaan siswa baru.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {state.entries.map((entry) => (
            <a
              key={entry.id}
              href={entry.path}
              className="bg-surface border border-border rounded-lg p-5 hover:border-tertiary transition-colors"
            >
              <span className="material-symbols-rounded text-tertiary text-3xl" aria-hidden="true">{entry.icon}</span>
              <h2 className="font-heading font-bold text-xl mt-3">{entry.label}</h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{entry.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
