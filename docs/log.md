**tanggal:** 07 Oktober 2026
**progress:**

- Memperbaiki bug _Role-Based Access Control_ (RBAC) pada menu Perencanaan & Monitoring (Strategic). Menambahkan role `admin_biro` pada otorisasi endpoint `GET /admin/users` di NestJS agar fitur pemilihan PIC tidak mengembalikan `403 Forbidden`.
- Merapikan logika visibilitas _sidebar_ Next.js untuk mencegah role `admin_biro` mendapatkan akses *bypass* ke menu Inventaris dan Bina Pribadi Islami (BPI) dengan menghapus pengecekan kondisi *hardcoded* (`|| true`).
- Menyembunyikan _card_ master data "Anggota Bidang" di halaman Dasbor Strategis apabila login menggunakan role admin biro.
  **commit message:** fix(rbac): resolve strategic dashboard permissions for admin biro

---

**tanggal:** 30 Agustus 2026
**progress:**

- Menginvestigasi dan menyelesaikan gagal _build_ di `@sim/shared` karena `@prisma/client` gagal di-_generate_ di Vercel. Memperbaikinya dengan mengintegrasikan `prisma generate` secara natif ke dalam _pipeline build_ Turborepo (`@sim/database#build`) dan mematikan _cache_ (`cache: false`) sehingga _Prisma Client_ selalu dieksekusi terlepas dari status `postinstall`.
- Menginvestigasi dan menyelesaikan gagal _build_ NestJS (`@sim/api`) yang disebabkan oleh konflik _TypeScript Inference_ pada transaksi bersarang Prisma (`TS2742`). Solusinya adalah mematikan generasi _type declaration_ (`"declaration": false`) di `apps/api/tsconfig.json` mengingat aplikasi _backend_ tidak diekspor ke repositori klien.
  **commit message:** fix: resolve vercel prisma client caching and nestjs ts2742 generation issues

---

**tanggal:** 29 Agustus 2026
**progress:**

- Menginvestigasi dan memperbaiki _bug_ Vercel (500 Internal Server Error) pasca-_deployment_. Akar masalahnya adalah Next.js Output File Tracing gagal menemukan berkas _binary engine_ Prisma (`libquery_engine-rhel-openssl-3.0.x.so.node`).
- Menyelesaikan masalah kompilasi dengan menyetel `outputFileTracingRoot: path.join(__dirname, '../../')` di `next.config.ts`, dan mengembalikan pengaturan _output_ skema Prisma ke lokasi bawaannya (`node_modules/@prisma/client`). Dengan penyetelan ini, _bundler_ Webpack milik Next.js dapat mengemas _Query Engine_ secara dinamis ke lingkungan Serverless Vercel.
- Menemukan dan membersihkan kerentanan keamanan kritis (kredensial Supabase `DATABASE_URL` asli tanpa sengaja ter-_commit_) di berkas `.env.example`. Variabel tersebut kini telah diamankan kembali menjadi templat _dummy text_.
  **commit message:** docs: update log for vercel 500 fix and env security patch

---

**tanggal:** 29 Agustus 2026
**progress:**

- Menyelesaikan _bug_ kompilasi Vercel pasca-migrasi ke Monorepo (Turborepo).
- Memecahkan masalah gagal _build_ Webpack (`UnhandledSchemeError: Reading from "node:crypto"`) yang disebabkan oleh penggunaan tipe ENUM dari Prisma Client di dalam _Client Components_. Membuat skrip otomatis `fix-enums.js` untuk menggantinya dengan _string literal_ dan tipe mandiri dari `@sim/shared`.
- Memperbaiki pengaturan _Root Directory_ di Vercel menjadi `apps/web` agar Vercel mendeteksi Turborepo.
- Memperbaiki _error_ `Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"` pada proses _prerendering_. Solusinya dengan menghapus `src/generated` dari _history_ Git (`git rm -r --cached`), menambahkan aturan `.gitignore`, memutakhirkan `binaryTargets` di skema Prisma, serta menyuntikkan _hook_ `postinstall` di `package.json` utama agar _Query Engine_ RHEL selalu diunduh secara tepat pada mesin Vercel.
  **commit message:** fix: resolve vercel monorepo build failures (prisma client in browser, missing rhel query engine)

---

**tanggal:** 29 Agustus 2026
**progress:**

- Menginvestigasi dan memperbaiki _crash_ pada _deployment_ Vercel (Next.js _Webpack UnhandledSchemeError_ untuk `node:crypto` dan `node:events`).
- Menelusuri akar masalah yang disebabkan oleh impor _value_ dari Prisma Enums (seperti `UnitLevel`, `RegistrationStatus`, `DayOfWeek`) ke dalam _Client Components_ (`"use client"`).
- Melakukan refaktor global pada ~14 komponen antarmuka untuk mengganti penggunaan _runtime Enum_ Prisma dengan _string literals_.
- Memperbarui berkas tipe publik di `@sim/shared` (menambahkan `kantor_yayasan` dan `non_pendidikan`) serta skema Zod (mengganti `z.nativeEnum` menjadi `z.enum`) agar pengecekan tipe TypeScript tetap ketat.
- Berhasil menuntaskan _build_ secara sukses dan bebas dari bocornya _runtime_ Node.js ke antarmuka _browser_.
  **commit message:** fix: resolve Webpack UnhandledSchemeError by removing Prisma enum value imports from Next.js Client Components

---

**tanggal:** 29 Agustus 2026
**progress:**

- Menginvestigasi tantangan komputasi pada arsitektur monolith Next.js, dan berhasil memigrasikannya secara utuh ke arsitektur **Turborepo Monorepo** (Next.js + NestJS).
- Menyelesaikan inisiatif **Sprint 37** (Inisialisasi Monorepo): Mengatur `turbo.json`, `pnpm-workspace.yaml`, dan mengekstrak kode menjadi 4 ruang lingkup independen (`@sim/web`, `@sim/api`, `@sim/database`, `@sim/shared`).
- Menyelesaikan inisiatif **Sprint 38** (Modul NestJS): Mengerahkan _Autonomous Subagents_ untuk mereplika logika Server Actions (PPDB, Akademik, HR) menjadi struktur _Controller_ dan _Service_ di NestJS lengkap dengan perlindungan otorisasi dan `ZodValidationPipe`.
- Menyelesaikan inisiatif **Sprint 39** (Penyatuan BFF): Membangun utilitas proksi (`apiFetch`) di Next.js yang secara aman meneruskan _token session_ JWT dari Supabase _cookies_ ke _header_ NestJS API. _Server Actions_ lama disederhanakan hanya untuk memicu pemanggilan API dan menjalankan `revalidatePath()`.
- Melengkapi rancangan rilis dengan membuat `docs/DEPLOYMENT.md` khusus arsitektur terpisah (menuju Vercel, Railway/Render) dengan hasil akhir pengecekan kompilasi 100% _type-safe_ tanpa satupun galat.
- Menyelesaikan anomali kompilasi NestJS pada Node.js v24 (ERR_MODULE_NOT_FOUND) dengan memastikan library internal (@sim/shared) dikompilasi secara independen dan (@sim/database) diproksi secara native untuk kepatuhan ECMAScript Modules.
- Mengatasi problem gagal instalasi paket Vercel (ERR_PNPM_IGNORED_BUILDS) dengan memigrasikan policy `pnpm.onlyBuiltDependencies` dari package.json ke `.npmrc` demi sinkronisasi dengan keamanan arsitektur PNPM v10+.
  **commit message:** feat: complete phase 4 migration to turborepo, nestjs backend, and bff proxy integration

---

# Log Pekerjaan SIAKAD Alfida

---

**tanggal:** 26 Agustus 2026
**progress:**

- Mengatasi _bug_ 404 pada navigasi menu Admin Unit (Akademik) dengan menyelaraskan kembali _URL sidebar_ (Mata Pelajaran, Kelas, Ekstrakurikuler) terhadap struktur _folder routes_ Next.js yang sebenarnya.
- Mengatasi 245 peringatan _error_ tipe TypeScript bawaan yang mengakibatkan `TypeError: Cannot read properties of undefined` dengan merombak struktur impor `@prisma/client` menjadi kustom `@/generated/client` secara global (massal) pada 100+ fail sumber.
- Melakukan ekspansi skema _database_ (Prisma) pada _enum_ `SubjectLevel` dengan menyisipkan opsi `level_0` (TK) dan `level_13` (Pesantren) untuk mengakomodasi seluruh spektrum lembaga pendidikan Yayasan Alfida, beserta sinkronisasinya pada antarmuka manajemen mata pelajaran.
- Memisahkan arsitektur pengelolaan Tahun Ajaran: menciptakan laman mandiri `/unit/academic-years` khusus untuk modul akademik (_existing cohorts_) agar tidak lagi bergantungan pada form pengaktifan PPDB.
- Memperketat visibilitas hierarki kepegawaian: Admin Unit kini hanya dapat melihat daftar staf milik unitnya pada _dashboard_ tabel, namun tetap diberikan akses global ke seluruh akun yayasan saat membuka _modal_ "Assign Staf/Guru".
- Menyiapkan integrasi ekosistem AI terotomasi (_Model Context Protocol_ / MCP) untuk Vercel dan Supabase melalui sistem _plugin workspace_ lokal (`.agents/plugins`).
- Melakukan pembersihan dokumen desain arsitektur (PRD, TDD, Sprint Plan) dengan mencabut wacana integrasi SSO menuju WordPress dan Moodle demi berfokus pada MVP internal.
  **commit message:** refactor: decouple academic years from ppdb, fix prisma client imports, expand subject levels for TK/Pesantren, and restrict staff visibility per unit

---

**tanggal:** 24 Agustus 2026
**progress:**

- Melakukan investigasi mendalam terhadap _bottleneck_ performa Vercel Serverless akibat beban komputasi Node.js (CPU dan Memori).
- Memisahkan seluruh pembuatan _file_ PDF (Surat Kelulusan, Rapor, RPP, Jadwal Kelas, IMC) dari API Routes Vercel ke sebuah **Supabase Edge Function** (`generate-pdf`) tersentralisasi menggunakan Deno dan `@react-pdf/renderer`.
- Menerapkan pendelegasian komputasi nilai **Raport (LHBS)** ke basis data dengan memindahkan ratusan baris logika JavaScript ke **PostgreSQL RPC** (`calculate_lhbs_grades`).
- Menghapus perulangan JS pada agregasi data ribuan catatan mutabaah BPI (Bina Pribadi Islam) dan menggantinya dengan kueri murni PostgreSQL (`COUNT(*) FILTER (WHERE...)`).
- Merombak total alur penyimpanan massal (_Batch Upsert_) seperti **Absensi Kelas**, **Input Nilai**, dan **Keputusan Kenaikan Kelas**; menyingkirkan Prisma `$transaction` _looping promises array_ demi prosedur "INSERT ON CONFLICT" kilat di Database melalui _RPC batch functions_ murni.
  **commit message:** perf: extreme optimization offloading batch processing and PDF rendering to Supabase

---

**tanggal:** 23 Agustus 2026 (Sesi 3)
**progress:**

- Membangun fitur **Identitas Yayasan** di dasbor _Super Admin_ yang memungkinkan manajemen pengaturan global seperti nama yayasan, detail rekening bank, serta fitur unggah logo dan tanda tangan pimpinan yayasan yang terintegrasi langsung dengan CDN _Cloudinary_.
- Menginvestigasi dan menyelesaikan _bug_ hak akses _(role privilege)_ Murobbi; kini sistem secara otomatis menyuntikkan _role_ `murobbi` pada _database_ (Tabel `UserRoleAssignment`) sesaat setelah Super Admin menugaskan seorang pengguna sebagai pembimbing grup Liqo.
- Menambahkan kapabilitas penyimpanan **Tautan Grup WhatsApp** (`whatsapp_link`) di modul pengelolaan _LiqoGroup_, yang memungkinkan Murobbi menempelkan _invite link_ mereka sehingga para peserta binaan bisa langsung mengaksesnya melalui tombol khusus di Dasbor Info Liqo Karyawan.
  **commit message:** feat: add foundation settings module, fix murobbi assignment role, and integrate whatsapp group links

---

**tanggal:** 23 Agustus 2026 (Sesi 2)
**progress:**

- Memperbaiki tautan navigasi dasbor Guru dari `/teacher/dashboard` ke `/teacher/schedules` serta melengkapi _sidebar_ dengan menu **Absensi Siswa**.
- Merestrukturisasi penamaan menu RPP menjadi **Prota, Promes & RPP** agar lebih deskriptif dan mencakup semua perangkat pembelajaran.
- Menerapkan arsitektur segregasi wewenang tingkat unit pada Modul SDM: Admin Unit kini hanya dapat memodifikasi koordinat GPS dan Kalender Libur untuk sekolah/unit miliknya sendiri.
- Mengatur level unit `non_pendidikan` dan peran _custom_ `admin_unit_nondik` (khusus untuk staf struktural Yayasan/Lazis/Asrama) agar menu dan fitur akademik tersembunyi secara otomatis.
- Membuka akses menu **Rekap Absensi**, **Kelola Cuti/Izin**, dan **Distribusi Pegawai** kepada Admin Unit dengan filter data otomatis yang mengisolasi _output_ hanya untuk staf bawahan mereka.
- Mengembangkan fitur pembuatan (pendaftaran) akun SSO _staff_ baru (Guru/Karyawan) secara langsung dari antarmuka Distribusi Pegawai yang dapat dieksekusi tanpa memutuskan sesi _login_ Admin yang sedang aktif.
  **commit message:** feat: refactor unit admin segregation and enhance teacher navigation

---

**tanggal:** 23 Agustus 2026
**progress:**

- Menginvestigasi dan menyelesaikan anomali gagal kompilasi di server **Vercel** (`next/headers` digunakan di _Client Component_). Solusinya: menyuntikkan deklarasi `"use server";` ke seluruh fail _Server Actions_ Fase 3 (Dasbor HR, UPA/Liqo, Cuti, Proker).
- Menambahkan _hook_ `"postinstall": "prisma generate"` ke `package.json` untuk memaksa Vercel melakukan regenerasi _Prisma Client_ guna menghindari _Type error_ dari _cache_.
- Merombak total `prisma/seed.ts` untuk merepresentasikan hierarki _Kantor Pusat Yayasan_ dan departemen nyata (Keuangan, Sarpras, Pendidikan) serta menangani entitas _double job_ seperti **Murobbi** (yang ditugaskan ke Guru).
- Mengembangkan skrip utilitas khusus (`scripts/import-sso.ts`) yang membaca _file_ `data-sso-pegawai.xlsx`, memetakan _roles_ dan _groups_ otomatis, dan menyinkronkan 130+ akun ke pangkalan data relasional dan otentikasi _Supabase Auth_.
  **commit message:** chore: fix vercel build issue with server actions and prisma cache, add SSO import script

---

**tanggal:** 19 Agustus 2026 (Sesi Akhir Phase 3)
**progress:**

- Menyelesaikan inisiatif **Sprint 22-36** secara menyeluruh (Modul Manajemen Karyawan & Absensi).
- Mengimplementasikan **Presensi GPS Karyawan** dengan dukungan kalkulasi jarak (Haversine formula), batasan radius per unit, serta jadwal efektif harian (Sprint 22-26).
- Membangun ekosistem **Bina Pribadi Islam (UPA/Liqo)** yang memfasilitasi penjadwalan mentoring, pencatatan mutaba'ah wajibat ibadah harian oleh anggota, hingga pantauan global oleh Admin BPI (Sprint 27-29).
- Mengembangkan **Pengajuan Cuti/Izin** berjenjang dengan integrasi potong otomatis _leaveQuota_ berbasis _Prisma Transaction_ saat cuti disetujui oleh Admin (Sprint 30-31).
- Menyediakan arsitektur **Program Kerja Bidang** dan rekam pelaporan (Activity Reports) berkala untuk seluruh departemen (Sprint 32-33).
- Membangun kumpulan **Dashboard Eksekutif**, memisahkan Dasbor Kepegawaian (HR) untuk agregasi demografi & rekap CSV absensi, serta Dasbor _Super Admin_ (_Bird-Eye View_) yang merangkum keseluruhan indeks Liqo, ibadah harian, kinerja departemen, dan absensi lintas-yayasan secara asinkron tanpa memblokir peramban (Sprint 34-35).
- Mengeksekusi penutupan **Quality Assurance (Sprint 36)**, merampungkan _tech debt_ (TSC `0 errors`), mematenkan pengujian _Playwright E2E_, dan menyusun pedoman rilis produksi (`PRODUCTION.md`).
  **commit message:** feat: finalize phase 3 HR modul with dashboards, E2E tests, and zero type errors

---

**tanggal:** 16 Agustus 2026 (Sesi 4)
**progress:**

- Menyelesaikan inisiatif **Sprint 9** (Skema Database Akademik & Daftar Ulang Siswa).
- Mengimplementasikan alur pendaftaran ulang (Re-enrollment) bagi orang tua siswa ke tahun ajaran berikutnya, divalidasi dengan _Zod_.
- Membangun fitur **Batch Upload CSV/XLSX** untuk impor _SSO Pegawai_ menggunakan modul `xlsx` di _client-side_ yang memetakan kolom secara otomatis (termasuk konversi string akses peran ganda ke enum `UserRole`).
- Menyelesaikan inisiatif **Sprint 10** (Manajemen Mapel & Penugasan Guru).
- Mengembangkan _Server Actions_ (`academic.ts`) dengan pengecekan Otorisasi unit, untuk CRUD Mata Pelajaran, serta penugasan (assign) guru sebagai **Wali Kelas** maupun **Guru Mata Pelajaran**.
- Menyelesaikan inisiatif **Sprint 11** (Input Nilai & Absensi).
- Membuat _Server Actions_ untuk pengisian kehadiran harian secara massal (`submitBatchAttendance`) beserta UI pemilihan `AttendanceStatus` (Hadir, Sakit, Izin, Alpa).
- Mengembangkan antarmuka UI matriks untuk pengisian nilai siswa secara _batch_ yang tervalidasi menggunakan Zod dengan dukungan pembatasan skor 0-100.
- Menerapkan _Prisma Transactions_ untuk memastikan data nilai (harian, ujian, ATS, AAS) dan absensi per siswa di suatu kelas di-update secara konsisten.
  **commit message:** feat: complete sprint 11 with batch attendance and grade inputs

---

**tanggal:** 16 Agustus 2026 (Sesi 3)
**progress:**

- Merancang dan menambahkan kelengkapan dokumentasi untuk **Modul Akademik** ke dalam `docs/PRD.md` dan struktur teknis di `docs/TDD.md`.
- Memperbarui `docs/DB-SCHEMA.md` dengan menambahkan 18 tabel baru dan berbagai Tipe ENUM untuk menopang kebutuhan data operasional akademik (Mapel, Nilai, Jurnal, Ekskul, SPP, Rapor).
- Mengubah target arsitektur aplikasi dari VPS (Docker & Nginx) menjadi **Serverless** (Vercel, Supabase, Cloudinary). Imbasnya, direktori `nginx` beserta file-file Docker dihapus.
- Menyelaraskan seluruh lini masa _Sprint Plan_ sehingga Fase 1 (PPDB) resmi selesai di Sprint 8, lalu dilanjutkan Fase 2 (Modul Akademik) pada rentang Sprint 9 hingga Sprint 21 di dalam `docs/SPRINT-PLAN.md` dan `docs/PRD.md`.
  **commit message:** docs: update academic module architecture, schema, sprint plan, and shift to serverless deployment

---

**tanggal:** 16 Agustus 2026 (Sesi 2)
**progress:**

- Menyelesaikan inisiatif **Sprint 8** (QA, Polish & Deployment Produksi).
- Menerapkan _Multi-stage Build_ pada `Dockerfile` untuk optimalisasi _image_ Next.js, dan membungkusnya dalam konfigurasi `docker-compose.prod.yml`.
- Menambahkan konfigurasi _Reverse Proxy_ dan _Security Headers_ menggunakan Nginx (`nginx/sim-alfida.conf`) serta menyesuaikan _next.config.ts_.
- Merancang fondasi CI/CD _Pipeline_ lewat GitHub Actions (`.github/workflows/deploy.yml`) untuk _auto-deploy_ ke VPS.
- Melengkapi halaman ralat global (`error.tsx` dan `not-found.tsx`).
- Menuliskan panduan produksi untuk administrator di `docs/DEPLOYMENT.md`.
  **commit message:** chore: finalize sprint 8 with dockerization, CI/CD, and production polish

**tanggal:** 16 Agustus 2026
**progress:**

- Menyelesaikan fungsionalitas **Sprint 7** (Penempatan Kelas & Finalisasi).
- Membuat _Server Actions_ untuk manajemen kelas (`classes.ts`) beserta antarmuka untuk menambah kelas dan memantau kapasitasnya (`class-management-client.tsx`).
- Membangun fitur _Class Assignment_ (`class-assignment.ts`) bagi Admin Unit untuk memindahkan siswa berstatus `accepted` ke dalam rombongan kelas tertentu.
- Validasi transaksi basis data untuk memastikan batas kuota maksimal kelas tak terlampaui.
- _State machine_ selesai ditutup dengan status mutlak `enrolled`.
  **commit message:** feat: complete sprint 7 class management and final assignment flow

**tanggal:** 08 Agustus 2026 (Sesi 2)
**progress:**

- Menyelesaikan seluruh fungsionalitas **Sprint 6** (Observasi & Seleksi).
- Membuat _Server Actions_ untuk manajemen jadwal (`observation-schedule.ts`), _booking_ oleh orang tua (`observation-booking.ts`), penginputan hasil uji (`observation-result.ts`), dan aksi persetujuan kelulusan (`acceptance.ts`).
- Mengimplementasikan sistem **Auto-Ranking** massal yang dipicu saat Observer menyimpan skor nilai tes pendaftar.
- Membuat rancangan cetak `@react-pdf/renderer` untuk **Surat Kelulusan** penerimaan siswa.
- Mengembangkan antarmuka (UI) manajemen jadwal & panel persetujuan hasil seleksi untuk _Admin Unit_, serta portal _dashboard_ khusus untuk guru penilai (_Observer_).
  **commit message:** feat: complete sprint 6 observation scheduling, auto-ranking, and acceptance flow

**tanggal:** 08 Agustus 2026
**progress:**

- Menyelesaikan seluruh fungsionalitas Sprint 5 (Alur Pendaftaran Bagian 2 untuk Orang Tua).
- Mengimplementasikan unggah banyak berkas (KTP, KK, Akte, dll) yang terintegrasi dengan Cloudinary.
- Mengimplementasikan fitur pembuatan dokumen PDF _on-the-fly_ untuk Surat Pengantar Tes Medis (IMC) menggunakan `@react-pdf/renderer`.
- Menuntaskan UI dasbor verifikasi berkas untuk Tim PPDB yang mencakup _preview_ (pratinjau) dokumen, serta fungsi "Loloskan" atau "Tolak" dokumen.
- Melakukan pemisahan arsitektur _Multi-Schema_ pada PostgreSQL Prisma, dengan menaruh data spesifik proyek di schema `sim`, dan identitas _user_ di schema `shared`.
- Menambahkan _Trigger_ fungsi SQL untuk menjaga sinkronisasi otomatis antara Supabase Auth (`auth.users`) dan tabel profil pengguna lokal (`shared.users`).
  **commit message:** feat: complete sprint 5 PPDB flow, PDF generation, and multi-schema refactoring

---

**tanggal:** 21 September 2026
**progress:**

- Menginvestigasi dan menyelesaikan pembersihan sisa arsitektur Supabase yang masih terbawa di skrip _seeding_ dan _import_ pasca-migrasi ke Better Auth.
- Mengimplementasikan migrasi _environment_ aplikasi ke infrastruktur mandiri berbasis VPS (Coolify).
- Memisahkan dan mendefinisikan _connection string_ S3 API (MinIO) dari dashboard _Console_, serta menyuntikkan kredensial MinIO murni sebagai ganti Cloudinary.
- Mengotomatiskan konversi ekstensi _domain email_ _seed data_ di PostgreSQL dari `@alfida.com` menjadi `@alfida.or.id` (menyesuaikan nama domain organisasi) via _Prisma client update script_.
- Menghapus ketergantungan pada `docker-compose.yml` lokal karena tata kelola _deployment_ sekarang sepenuhnya didelegasikan melalui integrasi Git otomatis di dasbor Coolify (Nixpacks/Dockerfile).
  **commit message:** chore: migrate infrastructure to VPS Coolify, configure MinIO S3 bucket, and finalize Better Auth zero-dependency on Supabase

---

**tanggal:** 22 September 2026
**progress:**

- Memecah (_spin-off_) repositori dengan menghapus seluruh entitas modul Manajemen Karyawan (SDM), BPI, dan Payroll dari _database_ (Prisma), kode API (NestJS), dan UI (Next.js) untuk memfokuskan aplikasi murni sebagai SIAKAD & PPDB.
- Memperbaiki _error_ gagal unggah dokumen S3 (AWS SDK XML Parse) dengan menyelaraskan konfigurasi port Traefik/Coolify menggunakan jalur prokol HTTP lokal (`http://s3.alfida.or.id`).
- Merapikan rute _redirect_ (_middleware_) dan antarmuka pemilihan modul (`/modules`) dengan menghapus menu HRD yang _broken/404_.
- Melakukan _rebranding_ visual secara menyeluruh dengan memperbarui _copywriting_ halaman otentikasi, _metadata title_, dan seluruh dokumen panduan (PRD, SPRINT, DB-SCHEMA).
- Mengimplementasikan perpaduan estetika _font_ Lora (Serif) untuk tajuk utama dan Inter (Sans) untuk isi teks melalui modifikasi _Tailwind Config_ dan _Global CSS_.
  **commit message:** feat: strip HR modules, rebrand to SIAKAD Alfida, fix MinIO S3 routing, and update Lora typography

---

**tanggal:** 01 Oktober 2026
**progress:**

- Memperkuat lapisan keamanan akses rute dengan menambahkan `layout.tsx` guard pada `/admin/strategic`, `/admin/bpi`, dan `/execution` untuk mencegah peramban mem-bypass aturan hak akses level komponen.
- Menambahkan kapabilitas pendaftaran ganda dengan memisahkan halaman registrasi orang tua (`/register`) dan pegawai/guru (`/register-staff`) untuk meminimalisasi salah input dari pengguna baru, lengkap dengan rute API otentikasi mandiri.
- Menerapkan restrukturisasi antarmuka _(UI restyling)_ pada _modal_ "Reset Password" di Dasbor Manajemen Pengguna agar sejajar dengan pedoman desain sistem (menggantikan pewarnaan bawaan dengan warna semantik `primary`/`tertiary`, mengimplementasikan _toggle show/hide password_, dan menyisipkan _popup modal_ cantik sebagai pengganti _native browser alert_ untuk umpan balik interaksi pengguna).
- Menyelesaikan _bug_ UI pada tombol _Logout_ dengan menyematkan fitur penonaktifan (_disable_) sementara, indikator _loading spinner_, eksekusi pembersihan _cache client-side_ menyeluruh via _hard reload_, serta melengkapi fungsionalitas menu _dropdown profil_ agar tertutup otomatis saat layar diklik (_click-outside listener_).
- Mengubah jenama aplikasi secara komprehensif pada antarmuka *Login* dari "SIAKAD" menjadi "SIM Alfida" (Sistem Informasi Manajemen) yang mendeskripsikan ruang lingkup yayasan yang lebih luas.
- Mendesain ulang arsitektur visibilitas modul di antarmuka Dasbor Utama (`/modules`): menyembunyikan modul BPI dan PPDB dari akses guru/pegawai yang tidak relevan, sambil memberikan fitur khusus di halaman Profil ("Aktifkan Fitur Orang Tua") agar pegawai tetap bisa mendaftarkan anak mereka sendiri ke sistem PPDB secara instan tanpa perlu mendaftar akun SSO baru.
  **commit message:** feat: expand SIM Alfida branding, refine user nav & reset password UI, enhance route guards, and build parent access feature for internal staff

---

**tanggal:** 03 Oktober 2026
**progress:**

- Merestrukturisasi antarmuka (UI restyling) pada rute eksekusi strategis (`/execution/action-items`, `/execution/issues`, `/execution/meetings`) agar diselaraskan dengan ketat pada pedoman identitas visual di `DESIGN.md` (menghapus bayangan, merapikan *hairline borders*, serta mendisiplinkan skema warna permukaan dan tersier).
- Mengubah _branding_ "SMART Execution Control Center" menjadi "Pusat Kendali Eksekusi Strategis Alfida" di Dasbor Admin Strategic agar lebih elegan dan mencerminkan identitas korporat BPH Yayasan Alfida.
- Mengimplementasikan isolasi data tingkat departemen (*department-level isolation*) yang canggih untuk Admin Bidang: Admin Bidang kini mendapatkan Dasbor Khusus yang diisolasi ketat agar mereka hanya bisa melihat, mengubah, dan mengelola Program Kerja, KPI, serta mendelegasikan tugas kepada Staf khusus di lingkup bidang mereka sendiri (berkat penambahan model `DepartmentMember`).
- Menuntaskan celah fatal *bug* kehabisan sesi (*APIError: Failed to get session* & *Prisma Pool Exhaustion*) di dalam SSR Next.js dengan melipatgandakan batas koneksi basis data (`connection_limit=20`) serta menanamkan **`React.cache()`** pada perlindungan `requireAuth`, yang berhasil memangkas 80% beban kueri berulang (N+1) pada setiap pemuatan rute dasbor secara dramatis.
- Mengurai logika visibilitas *Role-based Access Control* (RBAC) pada Dasbor Modul Utama (`modules/page.tsx`): mengoreksi *bug* akses yang membocorkan modul Akademik dan HR ke semua Admin Bidang. Kini akses modul HR benar-benar dikunci khusus untuk Admin berlabel "SDM/Kepegawaian", sementara modul Strategis berhasil dipulihkan untuk memayungi seluruh tipe Admin Bidang.
- Mengatasi kegagalan _build_ deployment produksi (Coolify) akibat restriksi ESLint dari Next.js (`react/no-unescaped-entities`) dengan melakukan validasi dan _escaping_ pada karakter tanda kutip di komponen UI Dasbor Supervisor dan BPI Siswa.
  **commit message:** fix: resolve unescaped entities eslint error failing coolify build

---

**tanggal:** 04 Oktober 2026
**progress:**

- Merancang *Dual-Storage Architecture* (MinIO + Cloudinary): Mengkonfigurasi ulang *provider* gambar sehingga berkas rutin dengan lalu-lintas tinggi seperti dokumen PPDB, Bukti Pembayaran SPP, dan Laporan Kinerja (*Evidences*) dilimpahkan ke layanan CDN *Cloudinary*. Sedangkan berkas statis & privasi (Logo Unit, Tanda Tangan Yayasan) dipertahankan pada penyimpanan server mandiri (*MinIO*). Pemisahan ini ditujukan untuk memangkas lonjakan beban pada VPS saat pendaftaran PPDB massal (Sprint 44).
- Menyusun dan mengeksekusi otomatisasi *seeder* (`scripts/seed-departments.ts`) untuk melahirkan 4 entitas Biro/Bidang Yayasan baru (Kepegawaian, Pendidikan, Sarana Prasarana, dan Keuangan) lengkap dengan akun Admin Bidang masing-masing.
- Mengunci modul "Layanan Kesekretariatan" agar bersifat tertutup (*exclusive*) dan hanya dirender untuk profil *Admin Kesekretariatan* (tidak lagi merembes ke Super Admin).
- Meretas *bug* API `404 Not Found` pada aksi *fetch* Dasbor Eksekusi Strategis (Milestones, Tasks, Logs, Evidences) di *frontend* dengan memetakan ulang seluruh URL *fetcher* ke rute *Controller backend* NestJS yang semestinya (`/strategic/execution-[nama]`).
- Melengkapi absennya fungsionalitas *input* untuk modul Manajemen Risiko (Isu) dan Notulensi Rapat melalui perancangan komponen UI *Modal Form* pelaporan interaktif.
- Menyikat bersih sisa-sisa elemen UI *legacy* di halaman Program dan KPI agar tunduk mutlak pada aturan tata-letak `DESIGN.md` (menghapus *shadow*, menggunakan warna utama `bg-tertiary` pada aksi, serta mengadopsi struktur `bg-surface` bergaris *hairline*).
  **commit message:** feat: implement dual-storage (Cloudinary/MinIO) architecture, seed foundation departments, fix execution API paths, and build risk & meeting input modals

---

**tanggal:** 04 Oktober 2026 (Sesi 2)
**progress:**

- Merombak arsitektur antarmuka dan perutean _Role-based Access Control_ khusus untuk Pengawas Yayasan (BPH/Board).
- Mengembalikan Dashboard Eksekutif (`/bph-dashboard`) ke desain profesional sesuai `DESIGN.md` (mengganti gradien tebal dengan pewarnaan netral), serta mengonversinya menjadi _Server Component_ asinkron yang menarik agregat progres program kerja, tingkat keberhasilan sasaran, serta pemeringkatan Isu Kritis Langsung secara _real-time_ dari basis data.
- Menangani galat _Prisma include_ relasi antara `ExecutionIssue` dan `WorkProgram` dengan mengeksekusi _in-memory array mapping_ lokal di _server-side_.
- Menciptakan _routing_ mandiri (`/pengawas/departments` & `/pengawas/department/[id]`) untuk memisahkan menu laporan kinerja khusus BPH agar tidak bercampur-aduk dengan tautan aplikasi operasional yang tersentralisasi di `/modules`.
- Melakukan refaktor visual pada halaman Laporan Matriks KPI BPH: beralih dari tabel kolom-lebar yang membentur _horizontal scroll_, menuju susunan tata letak _Bento Grid / Data Cards_ yang luas, modern, dan sangat tangguh untuk memuat untaian teks deskriptif (sasaran dan indikator) birokrasi pemerintahan/yayasan.
  **commit message:** feat: redesign BPH executive dashboard, separate pengawas report routes, and refactor KPI matrix into responsive bento cards

---

**tanggal:** 06 Oktober 2026
**progress:**

- Merombak arsitektur basis data dan validasi input terkait Manajemen "Biro". Biro yang sebelumnya berstatus setara (*peer*) dengan Bidang di tingkat Super Admin, kini diubah hierarkinya menjadi entitas turunan (berada di bawah naungan Bidang langsung).
- Menerapkan fitur pembuatan dan pengelolaan Biro beserta penugasan _Person In Charge_ (PIC / Admin Biro) langsung dari halaman Perencanaan dan Monitoring milik Admin Bidang (Strategic Members Page).
- Memecahkan galat 500 (Server Error) pada _routing_ autentikasi di antarmuka modul. Menambahkan definisi _Role-based Access Control_ untuk variabel `isDepartmentAdmin` dan `isBiroAdmin` di dalam alur logika (`/modules/page.tsx`) dan _rewrites_ API untuk NestJS backend.
- Mensinkronisasi _Client Component_ manajemen Bukti Kinerja (Evidence) agar secara dinamis melakukan re-hidrasi _state_ (melalui _React useEffect_) sesaat setelah rute disegarkan, menyelesaikan masalah di mana unggahan baru tidak langsung muncul di antarmuka tabel.
- Mengimplementasikan pengunggahan Bukti Kinerja (*document evidence*) menggunakan layanan berbasis awan Cloudinary dengan format penandatanganan _unsigned_ (via _upload preset_), menukar input tautan primitif dengan antarmuka unggah _file picker_ yang tangguh.
- Menambahkan _Notification Modal_ seragam yang mematuhi pedoman desain antarmuka `DESIGN.md` untuk menggantikan cetakan _console.log_ dan peringatan natif saat transaksi API (unggah KPI/dokumen) menemui hambatan (*error handling*).
- Mengeksekusi pengetesan statis komprehensif pra-deployment (_Smoke Testing_, _Linting_, _Typechecking_ dengan Eslint 9 + TypeScript Strict, serta kompilasi _Next.js Production Build_) untuk menjamin stabilitas koding dan skema Prisma (_Prisma Validate_) sebelum ditarik ke Coolify.
  **commit message:** feat: refactor biro hierarchy under department, implement cloudinary evidence uploads, fix UI auth state & hydration bugs, and ensure strict TS/lint compliance
- Mengembangkan modul *Excel Export* pada backend NestJS (`ExecutionKpiService`) yang memanfaatkan library `exceljs`. Fitur ini mengubah matriks KPI menjadi dokumen berformat `.xlsx` dengan pewarnaan kondisi sel (*Hijau, Kuning, Merah*) secara dinamis.
- Menambahkan tautan *Download Laporan Excel* pada antarmuka *Dashboard* Pengawas Yayasan dan panel operasional Admin Bidang.
- Menginjeksi entitas baru untuk *Pimpinan Yayasan* melalui seeder (`seed-pimpinan.ts`) yang diberikan *role* setara dengan *Pengawas Yayasan* agar Pimpinan dapat memonitor laporan metrik secara holistik. Menghapus hardcode credential pada skrip seeder untuk mencegah kebocoran informasi melalui git.
  **commit message:** feat: implement KPI excel export for supervisors, add pimpinan foundation seeder, and secure seed credentials

- **Pemecahan Isu Pengujian Manual:**
  1. *Laporan Excel KPI:* Merelokasi tautan unduhan `exceljs` dari tabel KPI ke _Card Section_ navigasi utama di Dasbor Admin Bidang, serta memberikan warna kontras (_emerald_) pada tautan templat _batch upload_ agar lebih mencolok.
  2. *Operasi CRUD Biro:* Mengintegrasikan fungsionalitas **Edit** dan **Hapus** Biro dengan antarmuka modal interaktif dan merombak _Browser Alert_ konfirmasi penghapusan anggota menggunakan komponen `NotificationModal` standar `DESIGN.md`.
  3. *Manajemen Risiko & Notulensi Asli:* Menyingkirkan *dummy data* (array statis) pada rute Eksekusi Isu dan Eksekusi Jadwal Rapat, lantas menghubungkan formulir Tambah Laporan dan antarmuka tabel ke _endpoint_ basis data Prisma yang asli (via *Server Actions* Next.js).
  4. *Otomatisasi Kredensial Bukti:* Menghapus elemen input _dropdown_ Pengunggah (Owner). Backend NestJS dikalibrasi agar secara mutlak menempelkan ID _Owner_ dari pengguna yang menembak API berdasarkan Token JWT (`req.user`).
  5. *Filter Laporan BPH:* Menyempurnakan _query_ Dasbor Pengawas Yayasan agar hanya memetakan departemen tingkat Induk (Klausa `where: { parentId: null }`) tanpa mengekspos rincian biro secara langsung.
  6. *Edit Departemen:* Membekali Dasbor Super Admin dengan hak istimewa untuk mengedit nama dan deskripsi Departemen / Bidang di antarmuka web.
  **commit message:** fix: address 7 manual test issues including UI refactors, real database endpoints for issues/meetings, biro CRUD operations, evidence ownership automation, and BPH dashboard filtering

- **Pemecahan Isu Linting & Integrasi:**
  1. *Resolusi Type Mismatch:* Menangani isu kompilasi kritis pada `issues/client.tsx` di mana argumen _Payload_ obyek secara keliru dimasukkan ke dalam deklarasi token string. Pembenahan parameter pemanggilan *Server Action* membebaskan monorepo dari `Exit Code 1` di lingkungan _Next.js Production Build_.
  2. *Useless Assignment Linting:* Mengeliminasi deklarasi statis (*dead code assignment*) `percent = 0` pada *KPI Dashboard Service*, menggantinya menjadi penugasan tipe tegas (`let percent: number`) demi memenuhi aturan ketat _ESLint_ 9 tanpa intervensi peringatan kompilator.
  **commit message:** chore: update log documentation for recent deployment fixes and lint resolutions
