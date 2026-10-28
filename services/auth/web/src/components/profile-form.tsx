"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell, type NavGroup } from "@alfida/ui";
import { ProfileAvatarUploader } from "@/components/profile-avatar-uploader";

type ProfileUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: Array<{ app?: string; role: string }>;
};

type Status = { tone: "success" | "error" | "info"; message: string } | null;
type StatusTone = NonNullable<Status>["tone"];

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { message?: unknown; error?: { message?: unknown } };
  if (typeof record.message === "string") return record.message;
  if (Array.isArray(record.message) && typeof record.message[0] === "string") return record.message[0];
  if (typeof record.error?.message === "string") return record.error.message;
  return fallback;
}

function primaryRole(user: ProfileUser) {
  return (user.roles[0]?.role || "staff").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(tone: StatusTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "error") return "border-red-200 bg-red-50 text-red-800";
  return "border-border bg-neutral text-gray-700";
}

export function ProfileForm() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileStatus, setProfileStatus] = useState<Status>(null);
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sidebarGroups: NavGroup[] = useMemo(() => [
    {
      title: "Navigasi",
      items: [
        { label: "Pilih Modul", href: "/modules", icon: "apps" },
        { label: "Profil Saya", href: "/profile", icon: "person", active: true },
      ],
    },
  ], []);

  const applyUser = (nextUser: ProfileUser) => {
    setUser(nextUser);
    setFullName(nextUser.fullName);
    setEmail(nextUser.email);
    setPhone(nextUser.phone || "");
    setAvatarUrl(nextUser.avatarUrl || null);
  };

  const loadProfile = async () => {
    setLoading(true);
    setProfileStatus(null);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/login?return_to=/profile");
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      const nextUser = (payload as { user?: unknown } | null)?.user;
      if (!response.ok || !nextUser || typeof nextUser !== "object") {
        throw new Error(errorMessage(payload, "Profil belum dapat dimuat. Silakan coba lagi."));
      }
      applyUser(nextUser as ProfileUser);
    } catch (error) {
      setProfileStatus({ tone: "error", message: error instanceof Error ? error.message : "Profil belum dapat dimuat. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone.trim() || null, avatarUrl }),
      });
      if (response.status === 401) {
        window.location.assign("/login?return_to=/profile");
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      const nextUser = (payload as { user?: unknown } | null)?.user;
      if (!response.ok || !nextUser || typeof nextUser !== "object") {
        throw new Error(errorMessage(payload, "Profil belum dapat disimpan."));
      }
      applyUser(nextUser as ProfileUser);
      setProfileStatus({ tone: "success", message: "Profil berhasil disimpan." });
    } catch (error) {
      setProfileStatus({ tone: "error", message: error instanceof Error ? error.message : "Profil belum dapat disimpan." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      const response = await fetch("/api/auth/me/password", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(errorMessage(payload, "Password belum dapat diubah."));
      }
      const message = errorMessage(payload, "Password berhasil diubah. Silakan masuk kembali.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({ tone: "success", message });
      window.setTimeout(() => window.location.assign("/login?return_to=/profile"), 800);
    } catch (error) {
      setPasswordStatus({ tone: "error", message: error instanceof Error ? error.message : "Password belum dapat diubah." });
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.assign("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral p-6 text-primary">
        <div className="mx-auto max-w-xl rounded-md border border-border bg-white p-5 text-sm text-gray-600" role="status">Memuat profil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral p-6 text-primary">
        <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="status">
          {profileStatus?.message || "Profil belum dapat dimuat."}
          <button type="button" onClick={() => void loadProfile()} className="ml-3 font-semibold underline">Coba lagi</button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      serviceName="Profil Saya"
      userName={user.fullName}
      userRole={primaryRole(user)}
      avatarUrl={user.avatarUrl}
      profileHref="/profile"
      sidebarGroups={sidebarGroups}
      onLogout={logout}
      topbarActions={
        <a href="/modules" className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-tertiary transition-colors hover:bg-[#eef7f5]">
          <span className="material-symbols-rounded text-[17px]">apps</span>
          <span className="hidden sm:inline">Modul</span>
        </a>
      }
      className="mx-auto w-full max-w-4xl"
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Profil Saya</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola informasi akun dan keamanan akses Anda.</p>
        </div>

        <form onSubmit={handleProfileSave} className="rounded-md border border-border bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-primary">Informasi Profil</h2>
              <p className="mt-1 text-sm text-gray-600">Perbarui foto, nama, email, dan nomor HP Anda.</p>
            </div>
          </div>
          <div className="mt-5">
            <ProfileAvatarUploader userId={user.id} value={avatarUrl} onChange={setAvatarUrl} disabled={savingProfile} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-primary">Nama Lengkap</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={3} maxLength={200} className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-primary">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={255} className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-primary">Nomor HP</span>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} minLength={8} maxLength={30} className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
          </div>
          {profileStatus && <p role="status" className={`mt-4 rounded-sm border px-3 py-2 text-sm ${statusClass(profileStatus.tone)}`}>{profileStatus.message}</p>}
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={savingProfile} className="rounded-sm bg-tertiary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0b6b5c] disabled:cursor-not-allowed disabled:opacity-60">
              {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSave} className="rounded-md border border-border bg-white p-5 sm:p-6">
          <h2 className="font-heading text-lg font-bold text-primary">Keamanan Akun</h2>
          <p className="mt-1 text-sm text-gray-600">Gunakan password baru minimal 8 karakter. Anda akan diminta masuk kembali setelah perubahan berhasil.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-primary">Password Saat Ini</span>
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-primary">Password Baru</span>
              <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} maxLength={128} className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-primary">Konfirmasi Password</span>
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} className="mt-1.5 w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-tertiary focus:ring-2 focus:ring-[#e6f4f1]" />
            </label>
          </div>
          {passwordStatus && <p role="status" className={`mt-4 rounded-sm border px-3 py-2 text-sm ${statusClass(passwordStatus.tone)}`}>{passwordStatus.message}</p>}
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={savingPassword} className="rounded-sm border border-tertiary bg-white px-4 py-2.5 text-sm font-semibold text-tertiary transition-colors hover:bg-[#eef7f5] disabled:cursor-not-allowed disabled:opacity-60">
              {savingPassword ? "Mengubah..." : "Ganti Password"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
