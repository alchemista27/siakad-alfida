"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PasswordMeter } from "./password-meter";

export function RegisterStaffForm({ units }: { units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("karyawan");
  const [unitId, setUnitId] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, confirmPassword, role, unitId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center max-w-sm">
        <Icon name="check_circle" className="text-4xl text-emerald-600 mb-2" />
        <h4 className="font-bold text-lg mb-1 font-heading">Pendaftaran Berhasil!</h4>
        <p className="text-xs text-emerald-700">
          Akun Anda telah dibuat. Mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-sm text-left">
      {error && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
          <Icon name="error" className="text-base text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Peran</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="karyawan">Karyawan</option>
          <option value="guru">Guru</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Unit Kerja</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="" disabled>Pilih Unit Kerja...</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="Sesuai KTP"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="No. WA / HP"
        type="tel"
        placeholder="081234567890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 karakter, 1 kapital, 1 angka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordMeter password={password} />
      </div>

      <Input
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? (
          <>
            <Icon name="progress_activity" className="animate-spin" /> Mendaftarkan...
          </>
        ) : (
          <>
            <Icon name="person_add" /> Daftar Akun
          </>
        )}
      </Button>
    </form>
  );
}
