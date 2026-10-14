# Laporan Investigasi Masalah dan Rencana Perbaikan Sistem

Dokumen ini memuat temuan teknis hasil investigasi langsung pada kontainer Coolify yang sedang berjalan, analisis perbandingan antarmuka terhadap `docs/wireframe`, serta rencana aksi terstruktur untuk menyelesaikan masalah login dan ketidaksesuaian tampilan di seluruh microservices SIM-Alfida.

---

## 1. Laporan Investigasi Langsung pada Kontainer Coolify

Pengecekan dilakukan langsung ke Docker daemon dan kontainer aktif di server Coolify menggunakan perintah inspeksi kontainer (`docker inspect`, `docker logs`, dan `docker exec`).

### A. Temuan Masalah Login di Service Auth (`auth.alfida.or.id`)

**Gejala di Browser**:
Saat menekan tombol Masuk di `auth.alfida.or.id`, muncul pesan:
`Perhatian: Unexpected token 'I', "Internal S"... is not valid`

**Hasil Pengecekan Kontainer `auth-alfida` (ID: `91ffc7ff2609`)**:
1. Log kontainer menunjukkan backend NestJS (port 3001) **mengalami crash seketika saat kontainer pertama kali dihidupkan**:
   ```text
   Memulai Alfida Auth API (NestJS) pada port 3001...
   Memulai Alfida Auth Web (Next.js) pada port 3000...
   node:internal/modules/cjs/loader:1433
     throw err;
     ^
   Error: Cannot find module '/app/services/auth/api/dist/main.js'
       at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
       ...
   Failed to proxy http://127.0.0.1:3001/api/auth/login Error: connect ECONNREFUSED 127.0.0.1:3001
   ```
2. **Akar Masalah 1: Pergeseran Struktur Output Kompilasi (`dist`)**:
   - Di dalam `services/auth/api/src/scripts/migrate-from-legacy.ts`, terdapat import:
     `import { PrismaClient as LegacyPrisma } from "../../../../../packages/database/src";`
   - Berkas `tsconfig.json` menyertakan `"include": ["src/**/*"]` tanpa `"rootDir": "src"` dan tanpa mengecualikan folder `scripts`.
   - Akibatnya, TypeScript mendeteksi berkas sumber berada di luar direktori proyek (pada level monorepo), sehingga titik pangkal kompilasi (*common source root*) bergeser ke root repositori `/app`.
   - Hasil kompilasi `main.js` tidak berada di `dist/main.js`, melainkan terperangkap di:
     `/app/services/auth/api/dist/services/auth/api/src/main.js`
   - Skrip start [`services/auth/start.sh`](file:///home/alchemista/alfida/simalfida/services/auth/start.sh) yang menjalankan `node services/auth/api/dist/main.js` langsung gagal dengan status `MODULE_NOT_FOUND`.

3. **Akar Masalah 2: Berkas Prisma Generated Client Tidak Masuk ke `dist`**:
   - Ketika dicoba menjalankan `/app/services/auth/api/dist/services/auth/api/src/main.js` secara manual di dalam kontainer, proses kembali crash dengan:
     ```text
     Error: Cannot find module '../generated/prisma'
     Require stack:
     - /app/services/auth/api/dist/services/auth/api/src/prisma/prisma.service.js
     ```
   - Skema Prisma menghasilkan client ke `src/generated/prisma`. Kompilator TypeScript (`tsc`/`nest build`) hanya mengkompilasi file `.ts` dan mengabaikan file `.js` serta binary engine native (`.so.node`), sehingga folder `dist/generated/prisma` tidak terbentuk. Masalah ini juga terjadi pada kontainer `simakin-alfida` dan `simpeg-alfida`.

4. **Akar Masalah 3: Inkompatibilitas Ekspor CommonJS pada `cookie-parser`**:
   - Pada file `main.ts` seluruh service:
     `import cookieParser from "cookie-parser";`
   - Karena `tsconfig.json` tidak mengaktifkan `"esModuleInterop": true`, kode terkompilasi menjadi `(0, cookie_parser_1.default)()`.
   - Di lingkungan Node.js, `cookie-parser` adalah CommonJS murni (`module.exports = cookieParser`) tanpa properti `.default`, sehingga menghasilkan runtime crash:
     `TypeError: (0, cookie_parser_1.default) is not a function`.

5. **Akar Masalah 4: Penanganan Respon di Frontend Next.js**:
   - Karena backend NestJS mati (port 3001 tidak mendengarkan koneksi), Next.js internal rewrite menghasilkan `ECONNREFUSED` dan menyajikan halaman HTTP 500 teks polos: `"Internal Server Error"`.
   - Kode frontend di [`services/auth/web/src/app/login/page.tsx`](file:///home/alchemista/alfida/simalfida/services/auth/web/src/app/login/page.tsx) langsung memanggil `await res.json()` tanpa memeriksa tipe konten respon:
     ```ts
     const res = await fetch("/api/auth/login", { ... });
     const data = await res.json(); // Crash di sini saat menerima string "Internal Server Error"
     ```
   - JSON parser browser melempar galat sintaks: `Unexpected token 'I', "Internal S"... is not valid JSON`. Galat ini ditangkap oleh blok catch dan dimunculkan ke komponen UI di bawah teks `Perhatian:`.

---

## 2. Laporan Ketidaksesuaian Tampilan terhadap `docs/wireframe`

Berdasarkan audit komparatif terhadap 24 berkas referensi di [`docs/wireframe`](file:///home/alchemista/alfida/simalfida/docs/wireframe), ditemukan kesenjangan utama:

### A. Halaman Login (`01-login.html`)
- **Desain Wireframe**:
  - Menggunakan **Split Screen Layout** (40% panel kiri dan 60% panel kanan).
  - Panel kiri: Gradien diagonal dari hijau toska tua (`#0f7f6d`) ke toska muda (`#06bfa2`), teks besar "SIM-Alfida", dan subjudul "Sistem Informasi Manajemen Yayasan Alfida".
  - Panel kanan: Latar belakang putih bersih (`#FFFFFF`), form login terpusat dengan lebar maksimum 400px, label input eksplisit, input password dilengkapi tombol toggle visibilitas ikon mata (Material Symbols), tombol utama "Masuk" dengan latar `#0f7f6d` dan teks putih, pemisah "Belum punya akun?", serta tautan "Daftar sekarang".
- **Kondisi Aktual**:
  - Tampilan berupa kotak kartu tunggal di tengah layar yang tidak mengadopsi split layout wireframe.
  - Belum ada fitur intip/sembunyikan password dengan ikon Material Symbols.

### B. Desain Token, Tipografi, dan Ikon
- **Desain Wireframe**:
  - Font Heading: `Roboto, sans-serif` (tegas, modern).
  - Font Body: `Inter, sans-serif` (keterbacaan tinggi).
  - Palet Warna Baku:
    - Primary text: `#454545`
    - Brand Tertiary / Accent utama: `#0f7f6d`
    - Brand Secondary: `#06bfa2`
    - Background Neutral: `#F7F8F8`
    - Surface: `#FFFFFF`
    - Border: `#E3E8E7`
  - Ikonografi: Standar tunggal **Google Material Symbols Rounded** (`font-family: 'Material Symbols Rounded'`), dilarang menggunakan emoji.
- **Kondisi Aktual**:
  - Beberapa komponen masih menggunakan font standar browser tanpa pemisahan Roboto dan Inter.
  - Komponen ikon belum terdistribusi secara seragam melalui pustaka UI `@alfida/ui`.

### C. Layout Aplikasi dan Dasbor (`03-modules.html`, `04-admin-dashboard.html`)
- **Desain Wireframe**:
  - Struktur layout dasbor baku terdiri dari 3 pilar:
    1. **Sidebar Kiri Tetap (Fixed, 250px)**: Header logo SIM-Alfida (tinggi 60px), navigasi dikelompokkan per kategori (`nav-group`), link dengan penanda aktif berupa latar toska lembut dan garis batas kanan `3px solid #0f7f6d`.
    2. **Sticky Topbar (Tinggi 60px)**: Menempel di atas dengan border bawah tipis, menampilkan pencarian/judul halaman di kiri dan profil pengguna (avatar inisial lingkaran serta nama) di kanan.
    3. **Area Konten Utama (Main Content)**: Berlatar belakang `#F7F8F8` dengan padding 24px, kartu-kartu berlatar putih dengan border `#E3E8E7`.
- **Kondisi Aktual**:
  - Layanan SIMAKIN, SIMPEG, SIYAUM, dan SPMB saat ini hanya memakai `Navbar` horizontal sederhana di bagian atas tanpa navigasi sidebar standar wireframe.
  - Halaman pemilihan modul terpadu (`03-modules.html`) yang menampilkan grid modul Alfida belum tersedia sebagai portal utama pasca-login.

### D. Alur Pendaftaran SPMB (`15-ppdb-dashboard.html` s.d. `23-ppdb-result.html`)
- **Desain Wireframe**:
  - Menyediakan wizard pendaftaran 8 tahap berurutan dengan indikator langkah (*step progress bar*) visual di bagian atas:
    1. Pilih Unit Pendidikan
    2. Pembayaran Biaya Pendaftaran
    3. Biodata Calon Siswa
    4. Data Orang Tua / Wali
    5. Unggah Berkas Dokumen
    6. Riwayat Medis / Kesehatan
    7. Jadwal Observasi
    8. Pengumuman Hasil Seleksi
- **Kondisi Aktual**:
  - Halaman pendaftaran SPMB publik belum mengadopsi struktur visual wizard bertahap yang ada di wireframe.

---

## 3. Rencana Solusi dan Perbaikan Menyeluruh

### Fase 1: Perbaikan Backend dan Kontainer (Membuat Login & Seluruh API Berjalan Normal)

1. **Karantina Skrip Migrasi & Kunci Root Dir Kompilasi**:
   - Pindahkan folder `services/auth/api/src/scripts` keluar dari `src` menjadi `services/auth/api/scripts`.
   - Tambahkan `"rootDir": "src"` dan `"exclude": ["node_modules", "dist", "scripts", "**/*.spec.ts"]` pada `services/auth/api/tsconfig.json`.
   - Hal ini menjamin `nest build` selalu menghasilkan `dist/main.js` di root folder dist.

2. **Resolusi Ekspor CommonJS `cookie-parser`**:
   - Tambahkan `"esModuleInterop": true` pada `tsconfig.json` di seluruh kelima service backend (`auth/api`, `simakin/api`, `simpeg/api`, `siyaum/api`, `spmb/api`).

3. **Sinkronisasi Berkas Prisma Generated ke `dist`**:
   - Perbarui skrip build di masing-masing `services/*/api/package.json`:
     `"build": "nest build && cp -r src/generated dist/"`
   - Tambahkan instruksi penyalinan `src/generated` ke `dist/` di seluruh `Dockerfile` dan skrip `start.sh` sebagai pelindung runtime.

4. **Penguatan Respon Frontend Next.js**:
   - Perbarui logika pemanggilan API di [`services/auth/web/src/app/login/page.tsx`](file:///home/alchemista/alfida/simalfida/services/auth/web/src/app/login/page.tsx) agar memeriksa `res.ok` dan header `content-type` sebelum melakukan `res.json()`.
   - Berikan pesan kesalahan yang ramah pengguna apabila server backend mengembalikan 500 atau respon non-JSON.

---

### Fase 2: Standarisasi Design System pada `@alfida/ui`

1. **Injeksi Font & Ikon**:
   - Memastikan font Google `Roboto` (Heading) dan `Inter` (Body) serta Google `Material Symbols Rounded` dimuat pada tingkat layout dasar monorepo.

2. **Komponen Layout Baku (`AppShell` & `Sidebar`)**:
   - Membuat komponen `Sidebar` dan `AppShell` di `@alfida/ui`:
     - Lebar 250px tetap di desktop, dapat dilipat (*collapsible*) pada perangkat mobile.
     - Styling persis sesuai `03-modules.html` dan `04-admin-dashboard.html` (warna background, border `#E3E8E7`, active state border kanan `3px solid #0f7f6d`).
     - Komponen `Topbar` dengan avatar bulat pengguna, informasi peran, dan tombol aksi.

3. **Komponen Form & Button Standar Wireframe**:
   - Menyesuaikan styling input dan tombol agar mengadopsi `--color-tertiary: #0f7f6d` dengan sudut kurva `rounded-sm` (4px) atau `rounded-md` (8px).

---

### Fase 3: Rombak Tampilan Layanan Sesuai Wireframe

1. **Auth Service (`services/auth/web`)**:
   - Rombak total [`app/login/page.tsx`](file:///home/alchemista/alfida/simalfida/services/auth/web/src/app/login/page.tsx) menjadi **Split Screen Layout** sesuai `01-login.html`:
     - Panel kiri: Gradien `#0f7f6d` ke `#06bfa2` dengan tipografi branding SIM-Alfida.
     - Panel kanan: Form login dengan input password toggle visibility, tombol Masuk `#0f7f6d`, divider, dan tautan pendaftaran.
   - Bangun rute portal modul [`app/modules/page.tsx`](file:///home/alchemista/alfida/simalfida/services/auth/web/src/app/modules/page.tsx) mengadopsi `03-modules.html` untuk navigasi antar-microservice pasca-login.
   - Perbarui halaman admin pengguna [`app/admin/users/page.tsx`](file:///home/alchemista/alfida/simalfida/services/auth/web/src/app/admin/users/page.tsx) dengan struktur `AppShell` wireframe.

2. **Layanan SIMAKIN (`services/simakin/web`)**:
   - Ubah layout dasbor dari top navbar menjadi `AppShell` dengan sidebar navigasi:
     - Grup Strategic / KPI
     - Program Kerja
     - Rapat & Notulensi
     - Laporan & Matriks
   - Terapkan kartu modul dan tabel aktivitas sesuai `04-admin-dashboard.html`.

3. **Layanan SIMPEG (`services/simpeg/web`)**:
   - Terapkan `AppShell` dengan sidebar navigasi:
     - Master Pegawai & Guru
     - Penugasan Unit
     - Presensi Kehadiran GPS
     - Pengajuan & Persetujuan Cuti

4. **Layanan SIYAUM (`services/siyaum/web`)**:
   - Terapkan `AppShell` dengan sidebar navigasi:
     - Catatan Tilawah Harian
     - Kelompok Halaqah
     - Setoran & Verifikasi Musyrif

5. **Layanan SPMB (`services/spmb/web`)**:
   - Halaman pendaftaran publik: Terapkan wizard pendaftaran bertahap (*multi-step wizard*) sesuai `15-ppdb-dashboard.html` s.d. `23-ppdb-result.html`.
   - Halaman panitia/admin: Terapkan `AppShell` dengan menu overview, verifikasi bayar, verifikasi berkas, dan observasi sesuai `09` s.d. `14`.

---

## 4. Rencana Verifikasi dan Pengujian

1. **Uji Coba Backend Kontainer**:
   - Menjalankan kompilasi TypeScript dan verifikasi lokasi output berkas `dist/main.js` serta `dist/generated/prisma`.
   - Menjalankan `node dist/main.js` di dalam kontainer untuk memastikan NestJS mendengarkan di port 3001 tanpa runtime error.
   - Menguji pemanggilan `POST /api/auth/login` melalui Next.js reverse-proxy dan memastikan cookie sesi terpasang dengan benar.

2. **Uji Coba Visual Antarmuka**:
   - Memeriksa tampilan login pada resolusi desktop (split screen) dan mobile (stacked panel vertikal).
   - Memeriksa keterbacaan font Roboto dan Inter serta render ikon Material Symbols Rounded.
   - Memeriksa fungsionalitas navigasi sidebar pada masing-masing microservice.
