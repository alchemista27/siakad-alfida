# Product Requirements Document (PRD)

## SIM-Alfida: Sistem Informasi Manajemen Terpadu Yayasan Alfida

| Atribut         | Detail                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| **Versi**       | 1.0.0-microservices                                                    |
| **Tanggal**     | 13 Oktober 2026                                                        |
| **Penulis**     | Tim Pengembangan SIM-Alfida                                            |
| **Status**      | Active Development & Deployment                                        |
| **Arsitektur**  | Microservices Monorepo (Turborepo)                                     |
| **Referensi**   | AGENTS.md, TDD.md, DB-SCHEMA.md, coolify-microservices.md              |

---

## 1. Ringkasan Eksekutif

SIM-Alfida adalah ekosistem Sistem Informasi Manajemen Terpadu berbasis **arsitektur microservices** untuk lingkungan Yayasan Alfida yang menaungi 2 TKIT, 3 SDIT, 1 SMPIT, 1 SMAIT, Pesantren Alquran, dan Kantor Yayasan.

Sebelumnya, sistem dikembangkan dalam satu monolit terpusat. Seiring bertambahnya kebutuhan spesifik dari masing-masing bidang (Perencanaan, Kepegawaian, PPDB/SPMB, Ibadah Guru/Karyawan, Akademik, Keuangan, Sarana Prasarana), arsitektur monolit diputuskan untuk dirombak total menjadi layanan mandiri (*microservices*) yang dideploy pada subdomain masing-masing, namun tetap terintegrasi dalam satu sumber identitas tunggal (*Single Sign-On*).

Platform ini dibangun di atas infrastruktur mandiri menggunakan **Coolify VPS** dengan alokasi sumber daya 2 vCPU, 8 GB RAM, dan 100 GB SSD. Untuk menghemat memori, setiap service dikemas dalam **1 container gabungan (Next.js App Router + NestJS REST API)**.

---

## 2. Tujuan & Sasaran

### 2.1 Tujuan Strategis
- Mengurangi kompleksitas monolit dengan memecah fungsionalitas ke dalam domain bounded-context masing-masing.
- Menyediakan portal khusus bagi masing-masing bidang tanpa saling mengganggu stabilitas operasional bidang lain.
- Menjamin integrasi identitas dan data siswa/guru melalui Single Sign-On (SSO) lintas subdomain `.alfida.or.id`.
- Menyediakan transisi mulus bagi pendaftar siswa yang saat ini telah berjalan di luar sistem melalui fitur entri luring, impor massal CSV, dan klaim akun via WhatsApp.

### 2.2 Sasaran Terukur
| Sasaran                                                 | Target       |
| ------------------------------------------------------- | ------------ |
| Ketersediaan layanan mandiri per bidang                 | 8 Services   |
| Efisiensi penggunaan RAM per service di Coolify         | ≤ 350 MB     |
| Keberhasilan impor data pendaftar offline ke sistem     | 100%         |
| Waktu respon SSO lintas subdomain                       | < 150 ms     |
| Adopsi sistem oleh seluruh unit sekolah & kantor        | 9/9 Unit     |

---

## 3. Ekosistem Microservices SIM-Alfida

Sistem terdiri dari 8 layanan terpisah yang saling terhubung:

| Service | Subdomain | Domain / Tugas Utama | Status Implementasi |
|---|---|---|---|
| **Auth** | `auth.alfida.or.id` | Single Sign-On (SSO), manajemen akun, verifikasi sesi cookie `.alfida.or.id`, RBAC terpusat. | Selesai & Aktif |
| **SIMAKIN** | `simakin.alfida.or.id` | Perencanaan strategis, program kerja tahunan/bulanan, monitoring KPI, rapat, dan isu yayasan. | Selesai & Aktif |
| **SIMPEG** | `simpeg.alfida.or.id` | Manajemen kepegawaian, penugasan unit, presensi GPS browser riil, cuti & izin, rekrutmen staf. | Selesai & Aktif |
| **SPMB** | `spmb.alfida.or.id` | Penerimaan murid baru (online & walk-in offline), seleksi observasi, klaim WA, handoff ke SIAKAD. | Selesai & Aktif |
| **SIYAUM** | `siyaum.alfida.or.id` | Monitoring program Yaum Ma'al Quran (YMQ), pencatatan tilawah harian, bimbingan halaqah musyrif. | Selesai (Testing Ready) |
| **SIAKAD** | `siakad.alfida.or.id` | Manajemen akademik, jadwal belajar, jurnal guru, penempatan kelas, rapor LHBS. | Masa Transisi (Monolit) |
| **SISKEU** | `siskeu.alfida.or.id` | Keuangan yayasan, tagihan SPP, approval penggajian, pelaporan penerimaan & pengeluaran. | Masa Transisi (Monolit) |
| **SISARPRAS**| `sisarpras.alfida.or.id`| Manajemen inventaris aset, pencatatan sarana dan prasarana yayasan dan unit sekolah. | Masa Transisi (Monolit) |

> [!NOTE]
> Layanan yang berada dalam status *Masa Transisi* dilayani sementara oleh monolit `sim.alfida.or.id` hingga jadwal migrasi domain terkait dieksekusi.

---

## 4. Tech Stack & Standar Rekayasa

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Monorepo Engine** | Turborepo (pnpm workspaces) | Manajemen dependensi dan caching build pipeline |
| **Frontend UI** | Next.js 15 (React 19, App Router) | Rendering antarmuka web mandiri di port 3000 |
| **Backend REST API**| NestJS 11 | Controller, Service, Guard, dan Middleware di port 3001 |
| **Shared Packages** | `@alfida/contracts`, `@alfida/auth-sdk`, `@alfida/ui` | Standarisasi kontrak data, guard auth, dan komponen UI |
| **Identity / Auth** | Better Auth | Session-based SSO, cookie lintas domain `.alfida.or.id` |
| **Database** | PostgreSQL terpusat (Coolify) | Database terpisah per service: `alfida_auth`, `alfida_simakin`, `alfida_simpeg`, `alfida_siyaum`, `alfida_spmb`, `simalfida` |
| **ORM** | Prisma 6 | Multi-output schema per service (`../src/generated/prisma`) |
| **Object Storage** | MinIO (S3-compatible) | Penyimpanan berkas pendaftaran, pasfoto, bukti bayar |
| **Deployment / OS** | Coolify VPS (Ubuntu Linux) | 1 Container gabungan (Web + API) per service |
| **Styling & Icons** | Tailwind CSS + Material UI Icons | Mengikuti palet resmi Yayasan Alfida tanpa emoji |

---

## 5. Design System

Mengacu pada standar desain antarmuka SIM-Alfida:

### 5.1 Palet Warna Resmi
- `primary`: `#454545` (Teks utama dan heading kontras)
- `secondary`: `#06bfa2` (Aksen sekunder, indikator aktif, tombol aksi)
- `tertiary`: `#0f7f6d` (CTA utama, penekanan prioritas tinggi)
- `neutral`: `#F7F8F8` (Latar belakang warm neutral)
- `surface`: `#FFFFFF` (Latar belakang kartu dan panel)
- `border`: `#E3E8E7` (Garis pemisah dan pembatas kartu)

### 5.2 Tipografi
- Heading: `Lora, serif` atau `Roboto, sans-serif`
- Body & Form: `Inter, sans-serif`

### 5.3 Ketentuan Khusus (Antislop Rules)
- Tidak menggunakan em-dash.
- Seluruh antarmuka wajib menyediakan *empty state*, *loading state*, dan *error state* dari `@alfida/ui`.
- Dilarang keras menggunakan emoji sebagai ikon UI; gunakan Material UI Icons atau SVG murni.
- Tidak ada tautan mati atau tombol tanpa aksi (*dead controls*).

---

## 6. Detail Fungsional Layanan Terpadu

### 6.1 Service Auth (`auth.alfida.or.id`)
- **Penyedia Identitas Tunggal**: Sumber kebenaran akun untuk guru, karyawan, pimpinan, pengurus, dan orang tua.
- **Single Sign-On (SSO)**: Cookie sesi `.alfida.or.id` berlaku otomatis saat pengguna berpindah ke `simakin.`, `simpeg.`, `spmb.`, atau subdomain lainnya.
- **Multi-Role Scoping**: Satu pengguna dapat memiliki peran berbeda di unit berbeda (contoh: Guru di SDIT Iqra 1 sekaligus Musyrif di YMQ).
- **Verifikasi Internal**: Setiap request ke API microservice diverifikasi menggunakan `@alfida/auth-sdk` (`ServiceJwtAuthGuard`).

---

### 6.2 Service SIMAKIN (`simakin.alfida.or.id`)
- **Perencanaan Program Kerja**: Penyusunan target kerja tahunan per biro, bidang, dan unit sekolah.
- **Pemantauan KPI**: Matriks 113 indikator kinerja utama yayasan dengan evaluasi berbobot (*traffic light system*).
- **Laporan Aktivitas**: Pelaporan kegiatan berkala bulanan dan mingguan dengan lampiran eviden kerja.
- **Action Items & Issues**: Manajemen daftar tugas, tindak lanjut rapat BPH, dan eskalasi hambatan operasional.
- **Dashboard Eksekutif BPH**: Ringkasan performa yayasan secara komprehensif bagi pengurus dan pimpinan.

---

### 6.3 Service SIMPEG (`simpeg.alfida.or.id`)
- **Master Data Pegawai**: Biodata, NIP/NUPTK, status kepegawaian (tetap/kontrak/magang), dan riwayat jabatan.
- **Penugasan Unit**: Distribusi penempatan guru dan staf pada unit-unit pendidikan di bawah yayasan.
- **Presensi GPS Riil**: Pencatatan kehadiran masuk dan pulang menggunakan koordinat geolokasi peramban (*browser geolocation*) terhadap radius titik koordinat unit sekolah yang telah ditentukan.
- **Manajemen Hari Libur & Jam Kerja**: Pengaturan hari operasional dan tanggal merah per unit.
- **Cuti & Izin**: Pengajuan cuti tahunan, sakit, dan izin melahirkan dengan persetujuan bertingkat (*approval chain*) oleh atasan langsung dan admin kepegawaian.
- **Rekrutmen Pegawai Baru**: Publikasi lowongan formasi, seleksi berkas, dan tahap tes calon tenaga pendidik/kependidikan.

---

### 6.4 Service SPMB (`spmb.alfida.or.id`)
- **Manajemen Periode & Gelombang**: Pembuatan kuota penerimaan, biaya formulir, jadwal buka-tutup, dan rekening tujuan per unit.
- **Pendaftaran Daring (Online)**: Formulir registrasi mandiri calon siswa, data orang tua, dan unggah berkas (KK, Akta, Pasfoto).
- **Akomodasi Pendaftar Luring (Offline Walk-in)**:
  - Form entri cepat oleh petugas panitia di kantor unit.
  - Opsi *backfill* status: langsung tandai lunas dan input skor observasi jika proses telah berjalan secara manual.
- **Impor Massal Berkas (CSV)**:
  - Pratinjau validasi baris CSV sebelum disimpan ke database.
  - Komit impor massal otomatis menghasilkan nomor registrasi resmi dan token klaim.
- **Klaim Akun WhatsApp (`wa.me`)**:
  - Generator tautan unik `/claim/[token]` untuk pendaftar luring.
  - Pembuatan link pesan WhatsApp otomatis dengan template sapaan resmi panitia untuk dikirimkan kepada orang tua santri.
- **Seleksi Observasi & Perankingan**:
  - Penjadwalan slot kuota observasi (kemampuan Al-Quran, motorik, kognitif, dan wawancara orang tua).
  - Input skor penilaian (0-100) dan rekomendasi penguji.
  - Perankingan otomatis berdasarkan skor observasi.
- **Penetapan Kelulusan & Handoff SIAKAD**:
  - Penetapan kelulusan santri diterima (*accepted*) atau ditolak (*rejected*) per siswa maupun massal.
  - Serah terima (*handoff*) otomatis data siswa dan orang tua yang diterima ke endpoint internal SIAKAD legacy (`POST /api/internal/spmb-handoff`) untuk persiapan penempatan kelas.

---

### 6.5 Service SIYAUM (`siyaum.alfida.or.id`)
- **Manajemen Halaqah & Musyrif**: Pengelompokan guru dan staf ke dalam kelompok pembinaan Al-Quran di bawah bimbingan musyrif resmi.
- **Pencatatan Tilawah Harian**: Input mutabaah yaumiyah (juz, halaman, surat, dan amalan sunnah).
- **Verifikasi Setoran**: Musyrif memverifikasi capaian tilawah dan setoran hafalan anggota halaqahnya dengan kontrol otorisasi ketat.
- **Laporan Kepatuhan YMQ**: Rekapitulasi target tilawah bulanan per unit dan yayasan untuk evaluasi kedisiplinan spiritual pegawai.

---

### 6.6 Service SIAKAD (`siakad.alfida.or.id`)
- **Penempatan Kelas (Class Placement)**: Menempatkan siswa baru dari SPMB (berstatus *accepted*) dan siswa naik kelas ke rombongan belajar.
- **Struktur Akademik**: Kurikulum, mata pelajaran, alokasi jam mengajar, dan pembagian tugas mengajar guru.
- **Jurnal Pembelajaran**: Guru mencatat materi ajar, kehadiran siswa di kelas, dan jurnal kegiatan harian.
- **Perencanaan Pembelajaran**: Guru menyusun Program Tahunan (Prota), Program Semester (Promes), dan Modul Ajar/RPP.
- **Asesmen & Rapor LHBS**: Penginputan nilai formatif, sumatif (ATS/AAS), dan pencetakan Laporan Hasil Belajar Siswa (LHBS) resmi ber-kop yayasan.

---

### 6.7 Service SISKEU (`siskeu.alfida.or.id`)
- **Pembayaran SPP**: Tagihan bulanan, pencatatan bukti transfer, dan verifikasi status lunas.
- **Penggajian Pegawai (Payroll)**: Kalkulasi gaji pokok, tunjangan jabatan, insentif kehadiran dari SIMPEG, dan approval pimpinan yayasan.
- **Anggaran & Buku Kas**: Pencatatan rencana anggaran pendapatan dan belanja sekolah (RAPBS) serta laporan kas harian.

---

### 6.8 Service SISARPRAS (`sisarpras.alfida.or.id`)
- **Inventaris Aset**: Pencatatan kode barang, kondisi (baik/rusak ringan/rusak berat), lokasi ruangan, dan nilai perolehan.
- **Peminjaman Fasilitas**: Jadwal pemakaian ruangan serbaguna, laboratorium, dan kendaraan yayasan.
- **Pemeliharaan**: Tiket pengajuan perbaikan sarana sekolah dan pelaporan biaya pemeliharaan.

---

## 7. Kebutuhan Non-Fungsional & Keamanan

### 7.1 Keamanan Sistem
- **Zero Secrets in Code**: Seluruh kunci rahasia disimpan dalam `.env` dan di-inject via Coolify Environment Variables.
- **Perlindungan Endpoint**: Setiap endpoint NestJS wajib menggunakan Guard otorisasi server-side (`ServiceJwtAuthGuard`). Next.js middleware hanya difungsikan untuk pengalihan navigasi.
- **Inter-Service Communication**: Komunikasi internal antar-service dilindungi oleh token rahasia `x-internal-service-key`.
- **Validasi Data Masuk**: Semua data dari formulir eksternal divalidasi ketat menggunakan Zod schemas atau DTO terstruktur.

### 7.2 Efisiensi Memori Server
- Mengingat VPS memiliki kapasitas 8 GB RAM untuk seluruh ekosistem:
  - Setiap microservice dibatasi maksimal 350 MB RAM.
  - Single container gabungan per service (port 3000 Web + port 3001 API).
  - PostgreSQL dijalankan secara terpusat dalam 1 instance engine dengan multi-database terpisah.

---

## 8. Roadmap Transformasi Microservices

```
Fase A: Fondasi Microservices & SSO (SELESAI)
├── Setup Turborepo monorepo multi-service
├── Service Auth terpusat (auth.alfida.or.id)
├── Shared Packages (@alfida/contracts, @alfida/auth-sdk, @alfida/ui)
└── Pipeline CI/CD GitHub Actions & GHCR

Fase B: Core Services SIMAKIN, SIMPEG, & SIYAUM (SELESAI)
├── Service SIMAKIN (simakin.alfida.or.id)
├── Service SIMPEG dengan GPS browser riil (simpeg.alfida.or.id)
└── Service SIYAUM siap uji halaqah (siyaum.alfida.or.id)

Fase C: SPMB Full Flow & Urgent PPDB Season (SELESAI)
├── Service SPMB mandiri (spmb.alfida.or.id)
├── Jalur entri luring offline walk-in & backfill nilai
├── Impor batch CSV dengan pratinjau validasi
├── Generator klaim WhatsApp (wa.me)
├── Modul observasi, jadwal, penilaian, dan ranking
└── Internal handoff endpoint ke SIAKAD (apps/api)

Fase D: Transisi SIAKAD & Penempatan Siswa (TAHAP BERIKUTNYA)
├── Ekstraksi modul akademik dari monolit ke service siakad mandiri
└── Alur penempatan kelas otomatis pasca-handoff SPMB

Fase E: SISKEU & SISARPRAS (TAHAP BERIKUTNYA)
├── Ekstraksi modul SPP & Payroll ke siskeu.alfida.or.id
└── Ekstraksi modul inventaris ke sisarpras.alfida.or.id
```

---

## 9. Kriteria Penerimaan (Definition of Done)
1. Seluruh kode ditulis dalam TypeScript tanpa tipe `any`.
2. Lulus uji kompilasi monorepo `pnpm turbo run build` dan `pnpm turbo run typecheck` tanpa error.
3. Seluruh dependensi terisolasi rapi dan tidak mengotori skema database service lain.
4. Tautan antar-layanan berjalan mulus via cookie session SSO `.alfida.or.id`.
5. Dockerfile dan skrip start service lolos uji packaging dan siap dideploy ke Coolify VPS.
