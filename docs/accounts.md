# Akun Testing & Matriks Hak Akses (User Accounts)

Dokumen ini berisi daftar akun pengujian bawaan (*default testing accounts*), matriks peran pengguna (*roles matrix*), dan panduan hak akses lintas microservices di lingkungan SIM-Alfida.

---

## 1. Daftar Akun Pengujian (Testing Accounts)

Untuk pengujian di lingkungan lokal maupun staging, tersedia akun-akun bawaan yang dapat digunakan sesuai peran:

| Peran (Role) | Email Login | Password Default | Akses Utama Layanan |
|---|---|---|---|
| **Super Admin** | `admin@alfida.or.id` | `Admin123!` | Seluruh subdomain dan fitur yayasan |
| **Admin Kepegawaian** | `hr@alfida.or.id` | `Admin123!` | `simpeg.alfida.or.id` (Staf, Cuti, Absensi) |
| **Admin Bidang / Biro** | `bidang@alfida.or.id` | `Admin123!` | `simakin.alfida.or.id` (Proker & KPI) |
| **Admin Unit SDIT 1** | `admin.sdit1@alfida.or.id`| `Admin123!` | `spmb.alfida.or.id/admin`, `sim.alfida.or.id` |
| **Admin Unit SMPIT** | `admin.smpit@alfida.or.id`| `Admin123!` | `spmb.alfida.or.id/admin`, `sim.alfida.or.id` |
| **Guru / Karyawan** | `guru.budi@alfida.or.id` | `Guru123!` | `simpeg.alfida.or.id`, `siyaum.alfida.or.id` |
| **Musyrif YMQ** | `musyrif.ahmad@alfida.or.id`| `Musyrif123!`| `siyaum.alfida.or.id` (Verifikasi Tilawah) |
| **Orang Tua Santri** | `ortu.testing@gmail.com` | `Ortu123!` | `spmb.alfida.or.id`, `siakad.alfida.or.id` |

> [!CAUTION]
> Pada lingkungan produksi, segera ubah seluruh kata sandi akun default di atas melalui menu pengaturan profil di `auth.alfida.or.id/profile`.

---

## 2. Matriks Hak Akses Peran Pengguna Lintas Layanan

| Peran Pengguna | `auth` | `simakin` | `simpeg` | `spmb` | `siyaum` | `siakad` (Legacy) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin** | Penuh | Penuh | Penuh | Penuh | Penuh | Penuh |
| **Admin Bidang / Biro** | Profil | Input & Review | - | - | Anggota | - |
| **Admin Kepegawaian** | Profil | - | Penuh | - | - | Rekap Guru |
| **Admin Unit Sekolah** | Profil | - | Penugasan Unit | Penuh (Unit) | - | Kurikulum & Kelas |
| **Tim PPDB / Penguji** | Profil | - | - | Observasi & Skor | - | - |
| **Musyrif YMQ** | Profil | - | Presensi Mandiri| - | Verifikasi Setoran | - |
| **Guru / Karyawan** | Profil | - | Presensi GPS & Cuti| - | Input Tilawah | Jurnal & Nilai |
| **Orang Tua / Wali** | Profil | - | - | Daftar & Klaim | - | Pantau Rapor LHBS |

Keterangan:
- **Penuh**: Memiliki akses modifikasi, persetujuan, dan konfigurasi master data.
- **Profil**: Mengakses layanan identitas untuk memperbarui profil, password, dan sesi login.
- **-**: Tidak memiliki otorisasi akses ke modul tersebut.

---

## 3. Sinkronisasi Akun Legacy ke Service Auth

Jika terdapat akun lama dari database monolit (`simalfida`) yang belum tercatat pada Service Auth (`alfida_auth`), jalankan skrip migrasi identitas:

```bash
LEGACY_DATABASE_URL="postgresql://postgres:<password>@<db-host>:5432/simalfida" \
DATABASE_URL="postgresql://postgres:<password>@<db-host>:5432/alfida_auth" \
pnpm --filter auth-api run migrate:legacy
```

Skrip ini akan menyalin seluruh pengguna, password hash, dan penugasan peran ke tabel Better Auth tanpa merusak data yang telah ada.
