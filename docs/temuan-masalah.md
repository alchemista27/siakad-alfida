# Laporan Audit Perubahan Sejak 16 Oktober 2026 — SIMALFIDA

**Waktu audit:** 18 Oktober 2026, 00:19–00:36 UTC
**Repository / branch:** `/home/alchemista/alfida/simalfida` / `master`
**Baseline historis:** `337df3e941f5d74f280cd45b053ae1b87da4e329`
**Commit yang diperiksa:**

1. `cc44649` — 16 Oktober 2026 00:30 UTC — SIMAKIN governance hardening.
2. `8871e4b` — 16 Oktober 2026 06:59 UTC — organization, units, departments, branding.
3. `1f977f5` — 17 Oktober 2026 03:06 UTC — SPMB parity, SIAKAD scaffold, production deployment.
4. `faf7d96` — 17 Oktober 2026 04:35 UTC — lockfile/build/Coolify watch-path adjustment.
5. `337df3e` — 17 Oktober 2026 09:54 UTC — SPMB root/SSO redirect.

## Batas Audit

- Audit ini **read-only**. Tidak ada source code, database, environment, container, deployment, commit, atau push yang diubah.
- Working tree saat audit berisi perubahan lokal yang belum di-commit pada Admin, SPMB, dan `docs/log.md`. Semua klaim historis di bawah ditambatkan ke commit baseline `337df3e`, bukan ke perubahan lokal tersebut.
- Fokus audit adalah seluruh handwritten code yang berubah sejak 16 Oktober beserta boundary transitive-nya: contracts, SSO/RBAC, migrations, internal APIs, handoff/outbox, container/build, dan test gate. Generated Prisma output tidak direview baris demi baris, tetapi direview sebagai risiko repository/deployment.

## Ringkasan Severity

- **SEV-1 / Critical:** 1
- **SEV-2 / High:** 12 *(10 confirmed, 2 berdampak final tergantung IAM/DNS runtime)*
- **SEV-3 / Medium:** 6
- **Perlu verifikasi runtime/deployment:** 4 dari temuan di bawah memiliki dampak final yang bergantung pada konfigurasi produksi/IAM/DNS.

---

# Temuan Terkonfirmasi

## [SEV-1] SIAKAD menerima bearer token palsu tanpa verifikasi signature

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - `services/siakad/api/src/auth/siakad-auth.guard.ts:39-48`
  - `services/siakad/api/src/common/guards/siakad-roles.guard.ts:17-26,41-48`
  - `services/siakad/api/src/common/siakad-scope-policy.ts:23-27,51-57`
- **Bukti:** `SiakadAuthGuard` hanya memecah token pada `.`, decode base64url payload segment kedua, lalu langsung menaruh `payload.sub` dan `payload.roles` ke `request.user`. Tidak ada verifikasi signature, issuer, audience, expiration, atau session server-side.
- **Skenario gagal/serangan:** Pihak yang dapat menjangkau SIAKAD API dapat mengirim token buatan sendiri berisi role `{ app: "auth", role: "super_admin" }`. Role guard dan scope policy kemudian memperlakukan payload tersebut sebagai principal valid dengan akses lintas unit.
- **Dampak:** Bypass autentikasi dan RBAC penuh pada SIAKAD; perubahan tahun ajaran, kelas, penempatan siswa, dan data akademik dapat dilakukan tanpa sesi SSO valid.
- **Mengapa test belum menangkap:** `test-siakad-rbac.ts` menginjeksi `request.user` yang telah dipercaya; test tidak mengeksekusi guard dengan token valid/palsu.
- **Reproduksi bukti:**
  ```bash
  git show 337df3e:services/siakad/api/src/auth/siakad-auth.guard.ts | nl -ba
  git show 337df3e:services/siakad/api/src/common/guards/siakad-roles.guard.ts | nl -ba
  ```

## [SEV-2] Endpoint “PDF” acceptance SPMB merender data kandidat sebagai HTML tanpa escaping

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:** `services/spmb/web/src/app/api/pdf/acceptance/route.ts:29-61`
- **Bukti:** `registrationNumber`, `unitName`, `academicYearLabel`, `studentName`, dan `decisionNote` diinterpolasi langsung ke string HTML; response dikirim sebagai `content-type: text/html`, bukan PDF.
- **Skenario gagal/serangan:** Nama calon siswa atau catatan keputusan yang berisi HTML/script tersimpan lalu dibuka oleh panitia melalui route surat. Browser akan memproses response pada origin SPMB, sehingga script dapat melakukan request same-origin menggunakan sesi panitia.
- **Dampak:** Stored XSS pada origin SPMB; data pendaftar dan tindakan admin berpotensi diakses/diubah sesuai hak panitia yang membuka surat.
- **Mengapa test belum menangkap:** Tidak ada test yang memasukkan payload HTML ke `studentName` atau `decisionNote` lalu memeriksa output encoding/CSP/content-type.
- **Reproduksi bukti:**
  ```bash
  git show 337df3e:services/spmb/web/src/app/api/pdf/acceptance/route.ts | nl -ba
  ```

## [SEV-2] Outbox handoff SPMB tidak memiliki dispatcher otomatis

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - enqueue: `services/spmb/api/src/decisions/decisions.service.ts:78-100,135-157`
  - processor: `services/spmb/api/src/handoff/handoff.processor.ts:14-46`
  - wiring: `services/spmb/api/src/handoff/handoff.module.ts:6-10`
- **Bukti:** Acceptance membuat record outbox berstatus `pending`. `HandoffProcessor.processPendingOutbox()` ada, tetapi tidak ditemukan scheduler, queue consumer, `OnModuleInit`, `@Cron`, `@Interval`, controller route, atau caller production yang memanggilnya.
- **Skenario gagal:** Kandidat diterima. Record handoff tetap `pending` sampai seseorang manual menekan endpoint sync; kegagalan delivery juga tidak mendapat retry otomatis.
- **Dampak:** Siswa yang diterima dapat tidak pernah dikirim ke SIAKAD; outbox tidak memberikan reliable delivery sebagaimana desainnya.
- **Mengapa test belum menangkap:** Contract test memanggil `deliverOutbox()` langsung dan tidak menyalakan aplikasi untuk membuktikan scheduler/consumer berjalan.
- **Reproduksi bukti:**
  ```bash
  git grep -nE 'processPendingOutbox|HandoffProcessor|@Cron|@Interval|ScheduleModule' \
    337df3e -- services/spmb/api/src
  ```

## [SEV-2] Perubahan schema SPMB tidak memiliki Prisma migration

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - schema baru: `services/spmb/api/prisma/schema.prisma:79-102,136-154,324-348`
  - runtime use: `services/spmb/api/src/handoff/handoff.service.ts`
- **Bukti:** Commit memperkenalkan `source_academic_year_id`, `handoff_status`, `handoff_outbox`, `admission_period_counters`, serta enum/model terkait. Pada baseline commit, `services/spmb/api/prisma/` hanya berisi `schema.prisma`; tidak ada `prisma/migrations/**/migration.sql`.
- **Skenario gagal:** Deploy API terhadap database SPMB yang telah ada. Ketika decision/handoff memakai kolom/tabel baru, Prisma mengakses database yang tidak memiliki struktur tersebut.
- **Dampak:** Keputusan acceptance dan handoff dapat gagal di production akibat missing table/column; aplikasi dan database drift.
- **Mengapa test belum menangkap:** Test handoff memakai mock Prisma/in-memory dan tidak menjalankan migration terhadap PostgreSQL.
- **Reproduksi bukti:**
  ```bash
  git ls-tree -r --name-only 337df3e services/spmb/api/prisma | sort
  git show 337df3e:services/spmb/api/prisma/schema.prisma | nl -ba
  ```

## [SEV-2] Container SIAKAD tidak menerapkan migration database saat deployment

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - `services/siakad/Dockerfile:11-17,29-35`
  - `services/siakad/start.sh:19-23`
  - `services/siakad/api/prisma/migrations/0_init/migration.sql`
  - `services/siakad/api/package.json:5-12`
- **Bukti:** Image hanya menjalankan `prisma generate` dan build. Startup script hanya menyalakan Nest di background dan Next.js di foreground. Tidak ada `prisma migrate deploy`, `db push`, atau script deployment migration.
- **Skenario gagal:** Fresh database atau database hasil restore dipakai oleh container baru. Proses dapat hidup, tetapi endpoint pertama yang mengakses schema `siakad` gagal karena tabel/migration belum diterapkan.
- **Dampak:** Deployment tampak berhasil namun SIAKAD tidak operasional.
- **Mengapa test belum menangkap:** Tidak ada test container fresh-database yang membuktikan migration dijalankan sebelum API menerima request.
- **Reproduksi bukti:**
  ```bash
  git show 337df3e:services/siakad/Dockerfile | nl -ba
  git show 337df3e:services/siakad/start.sh | nl -ba
  git grep -nE 'migrate deploy|prisma db push' 337df3e -- services/siakad
  ```

## [SEV-2] Handoff SPMB dapat gagal permanen bila SIAKAD belum memiliki academic year valid

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - `services/siakad/api/src/internal/internal.service.ts:57-127`
  - `services/siakad/api/prisma/migrations/0_init/migration.sql:386-408`
- **Bukti:** Receiver mencoba memakai `sourceAcademicYearId`, lalu fallback ke active/any academic year. Jika tidak ada sama sekali, nilai source tetap dipakai untuk membuat enrollment. Tetapi `enrollments.academic_year_id` memiliki FK ke `academic_years.id`.
- **Skenario gagal:** Unit baru menerima handoff sebelum academic year lokal dibuat/diaktifkan. Insert enrollment memakai ID dari SPMB yang tidak ada di schema SIAKAD dan transaksi gagal karena FK.
- **Dampak:** Kandidat accepted tidak dapat ditransfer untuk unit yang belum dipreseed; SPMB menyimpan failure handoff.
- **Mengapa test belum menangkap:** Test handoff menyediakan active academic year yang cocok; empty-state tidak diuji.

## [SEV-2] SIAKAD tidak memiliki writer untuk `unit_projections`, padahal entity lain mewajibkannya

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - model/FK: `services/siakad/api/prisma/migrations/0_init/migration.sql:312-318,386-408`
  - read-only consumer: `services/siakad/api/src/internal/internal.service.ts:138-150`
- **Bukti:** Pencarian pada handwritten SIAKAD source tidak menemukan `unitProjection.create`, `upsert`, `update`, `createMany`, atau delete; hanya generated Prisma yang memiliki methods tersebut. Sementara `academic_years`, `classrooms`, dan `subjects` memiliki foreign key ke `unit_projections`.
- **Skenario gagal:** Deployment SIAKAD baru tidak menerima seed/projection unit eksternal. Admin tidak bisa membuat academic year karena target unit projection tidak tersedia.
- **Dampak:** Bootstrap SIAKAD bergantung pada proses eksternal yang tidak disediakan code path yang diperiksa.
- **Mengapa test belum menangkap:** Mock Prisma tidak menerapkan foreign-key constraint atau prerequisite data projection.

## [SEV-2] Penempatan siswa oleh admin unit SIAKAD selalu berisiko ditolak karena relation siswa tidak dimuat

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:** `services/siakad/api/src/placement/placement.service.ts:14-31`
- **Bukti:** `enrollment.findUnique()` tidak menyertakan relation `student`, tetapi authorization memakai `(enrollment as any).student?.unitId`. Pada hasil Prisma nyata, `student` tidak tersedia; nilai yang divalidasi menjadi `undefined`.
- **Skenario gagal:** `admin_unit` mencoba menempatkan enrollment dari unitnya sendiri. `assertUnitAccess` menerima `undefined` lalu menolak karena scope unit tidak cocok. Super admin dapat lolos karena bypass global.
- **Dampak:** Operasi utama placement untuk admin unit tidak bekerja di runtime.
- **Mengapa test belum menangkap:** Mock test memberikan property `student` meski production query tidak memintanya.
- **Reproduksi bukti:**
  ```bash
  git show 337df3e:services/siakad/api/src/placement/placement.service.ts | nl -ba
  ```

## [SEV-2] SIAKAD tidak mengonfirmasi enrollment kembali ke SPMB

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - callback yang menunggu pemanggilan: `services/spmb/api/src/handoff/handoff.controller.ts:41-47`, `handoff.service.ts:328-376`
  - create/activate enrollment: `services/siakad/api/src/internal/internal.service.ts:89-135`, `services/siakad/api/src/placement/placement.service.ts:49-55`
- **Bukti:** SPMB menyediakan `POST /handoff/confirm-enrollment` dengan internal secret. Pencarian seluruh source SIAKAD tidak menemukan `confirm-enrollment`, `confirmEnrollment`, `INTERNAL_SPMB`, atau `SPMB_API_URL`.
- **Skenario gagal:** SIAKAD membuat dan mengaktifkan enrollment, tetapi registration SPMB tetap `accepted`, bukan `enrolled`.
- **Dampak:** Lifecycle siswa dan audit/counter lintas layanan permanen tidak sinkron kecuali operator memperbaikinya secara manual.
- **Mengapa test belum menangkap:** Test memanggil method confirmation SPMB secara langsung, bukan membuktikan SIAKAD mengirim callback setelah placement.

## [SEV-2] CI tidak menjalankan 67 contract-test script baru pada service yang berubah

- **Status:** Confirmed
- **Commit:** `cc44649`, `8871e4b`, `1f977f5`
- **Lokasi:**
  - `.github/workflows/ci.yml:30-37`
  - `package.json:7-10`
  - `turbo.json:27-29`
  - manifests `services/{spmb,siakad,simakin,simpeg}/**/package.json`
- **Bukti:** CI menjalankan `pnpm test`, root script menjalankan `turbo test`, namun `turbo.json` tidak mengikat script test dan package service utama tidak memiliki `test` script. Terdapat 67 file `scripts/test-*.ts` pada layanan tersebut, termasuk runner SPMB yang tidak direferensikan CI/package script.
- **Skenario gagal:** Pull request dapat green walaupun contract test baru gagal, karena script tidak dijalankan oleh CI.
- **Dampak:** Coverage yang tampak ada tidak menjadi release gate; regresi pada handoff/RBAC/workflow dapat masuk production.
- **Reproduksi bukti:**
  ```bash
  git ls-tree -r --name-only 337df3e -- services/spmb services/siakad services/simakin services/simpeg \
    | grep '/scripts/test-.*\.ts$' | wc -l
  git show 337df3e:.github/workflows/ci.yml | nl -ba | sed -n '30,40p'
  ```

## [SEV-2] Penugasan admin bidang SIMPEG dapat meninggalkan hak Auth aktif ketika sinkronisasi lokal gagal

- **Status:** Confirmed
- **Commit:** `8871e4b`
- **Lokasi:** `services/simpeg/api/src/departments/departments.service.ts:93-133`
- **Bukti:** Service mengaktifkan local assignment, lalu grant role remote pada Auth. Setelah grant sukses, service menjalankan transaksi kedua untuk menyimpan `authAssignmentId` dan membuat outbox. Bila transaksi kedua gagal, catch hanya menonaktifkan local assignment; tidak ada compensating remote Auth revoke. Karena `authAssignmentId` tidak tersimpan, revoke berikutnya juga melewati `revokeAuthRole`.
- **Skenario gagal:** Auth grant berhasil, tetapi insert outbox/update assignment gagal. UI/SIMPEG menunjukkan assignment gagal/nonaktif, tetapi token/session Auth masih dapat membawa role `simakin:admin_bidang`.
- **Dampak:** Privilege orphan di authoritative authentication service, sulit dideteksi dari UI organisasi.
- **Mengapa test belum menangkap:** Test hanya mencakup grant/revoke sukses dan tidak menyimulasikan failure setelah remote grant.

---

# Temuan Berisiko Tinggi yang Bergantung pada Konfigurasi Runtime

## [SEV-2] Offline import SPMB menerima `objectKey` bebas lalu menandatangani download URL tanpa prefix validation

- **Status:** Confirmed code-path; dampak final membutuhkan verifikasi IAM/bucket
- **Commit:** `1f977f5`
- **Lokasi:**
  - client-supplied key type: `services/spmb/api/src/imports/backfill-manifest.policy.ts:4-10`
  - signer: `services/spmb/api/src/documents/documents.service.ts:181-197`
  - persistence path: `services/spmb/api/src/registrations/registrations.service.ts` pada pemrosesan offline manifest
- **Bukti:** Manifest mendefinisikan `documents[].objectKey` dan `medical.objectKey` dari body. Signing function membuat `GetObjectCommand` langsung dari persisted key tanpa validasi prefix/ownership/metadata.
- **Skenario gagal:** Operator scoped memasukkan known key dari object lain ke manifest offline, mengambil document ID hasil import, lalu meminta signed URL. Jika IAM role mengizinkan bucket/prefix yang luas, key arbitrary tersebut dapat terbaca.
- **Dampak:** Potensi disclosure object storage lintas pendaftaran/lintas layanan.
- **Verifikasi runtime yang diperlukan:** Periksa IAM policy dan bucket prefix yang benar-benar diizinkan oleh credential SPMB serta route offline import yang live.

## [SEV-2] CORS credentialed mempercayai semua `https://*.alfida.or.id`

- **Status:** Confirmed policy; exploitability membutuhkan inventaris DNS/subdomain
- **Commit:** `1f977f5`
- **Lokasi:**
  - `services/spmb/api/src/common/cors-policy.ts:1-10`
  - `services/siakad/api/src/common/cors-policy.ts:1-10`
  - `services/{spmb,siakad}/api/src/main.ts`
  - session cookie domain: `services/auth/api/src/auth/auth.controller.ts`
- **Bukti:** Rule menerima hostname apa pun yang berakhiran `.alfida.or.id`; API mengaktifkan `credentials: true`.
- **Skenario gagal:** Jika satu sibling subdomain dikuasai pihak tidak setara trust-nya (dangling DNS, delegated SaaS, user-hosted content, compromise), browser dari subdomain itu dapat membaca response credentialed SPMB/SIAKAD.
- **Dampak:** Kebocoran data/aksi API lintas subdomain.
- **Verifikasi runtime yang diperlukan:** Inventaris DNS, delegated custom domain, SaaS integrations, dan subdomain dormant. Bila satu saja tidak trusted setara, policy ini tidak aman.

---

# Temuan Medium

## [SEV-3] Login Auth memiliki open redirect eksternal setelah login

- **Status:** Confirmed
- **Commit:** `8871e4b`
- **Lokasi:** `services/auth/web/src/components/login-form.tsx:53-62`
- **Bukti:** `callbackUrl`/`return_to` dengan prefiks `http://` atau `https://` langsung diarahkan menggunakan `window.location.href` tanpa allowlist origin.
- **Skenario gagal:** Link phishing ke login SSO dengan `return_to=https://attacker.example` mengarahkan korban ke situs attacker tepat sesudah berhasil login.
- **Dampak:** SSO phishing lebih meyakinkan; dapat digabung dengan situs tiruan modul.

## [SEV-3] Admin unit SIMPEG dapat mengambil rekap absensi/cuti seluruh organisasi tanpa `unitId`

- **Status:** Confirmed
- **Commit:** `8871e4b`
- **Lokasi:**
  - `services/simpeg/api/src/attendance/attendance.controller.ts:51-62`
  - `services/simpeg/api/src/attendance/attendance.service.ts:153-215`
- **Bukti:** Endpoint memberi `admin_unit` dan `admin_unit_nondik` akses role-level, tetapi tidak meneruskan principal ke service. Filter unit hanya diterapkan bila caller secara sukarela mengirim `unitId`; tanpa query tersebut, service memuat users, attendance, dan approved leave global.
- **Skenario gagal:** Admin Unit A memanggil `/attendance/recap?start=...&end=...` tanpa unitId lalu menerima nama, unit, role, hadir/terlambat/cuti seluruh pegawai.
- **Dampak:** Disclosure data personal/HR lintas unit.

## [SEV-3] SIMPEG → SIMAKIN user projection bisa ditimpa snapshot lama

- **Status:** Confirmed
- **Commit:** `8871e4b`
- **Lokasi:**
  - concurrent delivery: `services/simpeg/api/src/organization-sync/organization-sync.processor.ts:20-26`
  - unconditional write: `services/simakin/api/src/strategic/organization-sync/users.service.ts:9-12`
- **Bukti:** Processor mengambil rows terurut tetapi mengirim semuanya parallel via `Promise.all`. Receiver selalu upsert data user tanpa `sourceUpdatedAt`/version guard.
- **Skenario gagal:** Dua event user yang berbeda selesai dengan urutan HTTP terbalik. Snapshot yang lebih lama tiba belakangan dan menimpa data baru pada SIMAKIN.
- **Dampak:** Nama/email/status user dapat stale pada SIMAKIN, mengganggu ownership/notification.

## [SEV-3] SIAKAD dapat memiliki lebih dari satu academic year aktif per unit dan memilihnya tanpa order

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:**
  - status update: `services/siakad/api/src/academic-years/academic-years.service.ts:71-81`
  - fallback handoff: `services/siakad/api/src/internal/internal.service.ts:70-84`
  - constraint: `services/siakad/api/prisma/migrations/0_init/migration.sql:318-324`
- **Bukti:** Tidak ada transaction untuk menutup tahun aktif lain dan tidak ada partial unique index satu tahun `active` per unit. Handoff memakai `findFirst({ unitId, status: "active" })` tanpa `orderBy`.
- **Skenario gagal:** Dua academic year active untuk unit yang sama. Handoff yang tidak menemukan source ID cocok memilih row arbitrary.
- **Dampak:** Enrollment bisa masuk tahun ajaran salah.

## [SEV-3] SIAKAD menjalankan API di background tanpa supervisor/health check API

- **Status:** Likely; perlu verifikasi konfigurasi Coolify
- **Commit:** `1f977f5`
- **Lokasi:** `services/siakad/start.sh:19-23`, `services/siakad/Dockerfile:32-35`
- **Bukti:** API diluncurkan dengan `&`; Next.js di foreground menjaga container hidup. `set -e` tidak memastikan child background yang mati menghentikan shell. Docker hanya expose port 3000 dan tidak memiliki healthcheck API.
- **Skenario gagal:** API crash setelah startup, web tetap hidup dan container/Traefik dapat terlihat healthy sementara rewrite `/api/*` gagal.
- **Dampak:** Partial outage yang sulit terdeteksi.

## [SEV-3] Generated Prisma output dan native engine dikomit; review/deployment menjadi noisy dan tidak portabel

- **Status:** Confirmed repository hygiene; native engine impact needs environment verification
- **Commit:** terutama `1f977f5`, juga generated changes pada SIMAKIN/SIMPEG/SPMB
- **Lokasi:** `services/*/api/src/generated/prisma/**`, termasuk `services/siakad/api/src/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node`.
- **Bukti:** 48 file generated Prisma berubah sejak 16 Oktober; SIAKAD mengandung engine native Debian/OpenSSL serta wasm. Generated diff juga menghasilkan sangat banyak trailing-whitespace warning dari `git diff --check`.
- **Skenario gagal:** Developer non-Debian/non-glibc atau direct build task memakai engine yang dikomit tanpa regenerate; review source juga tertutupi puluhan ribu baris generated artifact.
- **Dampak:** Reproducibility/lintas platform dan signal-to-noise review memburuk.

## [SEV-3] Template `.env.example` menggabungkan dua variabel auth pada satu baris

- **Status:** Confirmed
- **Commit:** `1f977f5`
- **Lokasi:** `.env.example:19-20`
- **Bukti:** Baris terakhir berbentuk:
  ```dotenv
  BETTER_AUTH_URL="http://localhost:3000"NEXT_PUBLIC_APP_URL="http://localhost:3000"
  ```
- **Skenario gagal:** Developer/automation menyalin template dan parser dotenv membaca konfigurasi URL secara salah/tidak membuat `NEXT_PUBLIC_APP_URL` independen.
- **Dampak:** Redirect dan public URL auth dapat salah konfigurasi.

## [SEV-3] Konfigurasi Coolify watch-path hanya tercatat sebagai dokumentasi, tidak deklaratif di repository

- **Status:** Needs runtime verification
- **Commit:** `faf7d96`
- **Lokasi:** `docs/log.md`; tidak ada manifest Coolify checked-in yang menyimpan `watch_paths`.
- **Bukti:** Commit `faf7d96` mengubah lockfile dan docs, bukan konfigurasi Coolify yang dapat direproduksi dari repository.
- **Skenario gagal:** Recreate/migrasi aplikasi Coolify kehilangan setting external watch-path dan perubahan shared lockfile kembali memicu build semua service.
- **Dampak:** Build storm/disk exhaustion dapat berulang bila state dashboard tidak didokumentasikan sebagai infrastructure-as-code.

---

# Catatan Positif yang Diverifikasi

- Tidak ditemukan mismatch lockfile/manifests yang pasti pada baseline audit untuk SIAKAD; lockfile pada tip menyelesaikan Prisma ke versi yang konsisten dengan resolution saat ini.
- CORS parser SPMB/SIAKAD menolak hostname malformed/lookalike. Risiko CORS yang dicatat adalah trust boundary terlalu luas pada wildcard subdomain, bukan parsing malformed origin.
- SIMPEG organization sync memiliki scheduler/lease/retry dasar; kelemahan yang ditemukan berada pada ordering/versioning user projection, bukan ketiadaan worker.

# Lampiran: Perintah Bukti Utama

```bash
cd /home/alchemista/alfida/simalfida

git log --since='2026-10-16 00:00:00 +0000' --date=iso-strict \
  --pretty=format:'%H%x09%ad%x09%an%x09%s'

git grep -nE 'processPendingOutbox|HandoffProcessor|@Cron|@Interval|ScheduleModule' \
  337df3e -- services/spmb/api/src

git ls-tree -r --name-only 337df3e services/spmb/api/prisma | sort

git show 337df3e:services/siakad/api/src/auth/siakad-auth.guard.ts | nl -ba

git show 337df3e:services/spmb/web/src/app/api/pdf/acceptance/route.ts | nl -ba

git show 337df3e:services/auth/web/src/components/login-form.tsx | nl -ba

git diff --name-only HEAD~5..HEAD | grep '/src/generated/prisma/' | wc -l
```

---

# Pemeriksaan Tambahan Runtime — Upload Identitas Yayasan dan Unit SIAKAD

**Waktu pemeriksaan:** 18 Oktober 2026 UTC
**Cakupan:** source lokal, revision container Admin yang sedang berjalan, metadata environment Coolify tanpa membaca nilai rahasia, serta source/schema SIAKAD.
**Catatan:** Temuan ini ditambahkan setelah audit baseline di atas; tidak mengubah angka severity audit historis.

## [SEV-3] Frontend Admin yang sedang berjalan masih memakai bundle sebelum konfigurasi Cloudinary build-time tersedia

- **Status:** Confirmed
- **Lokasi:**
  - revision container aktif: image `rtio1rmf39lrfybxpxx5iu0c:faf7d96e4faebb9c1203162187cb144c50f90c87`
  - source pada revision aktif: `services/admin/web/src/components/foundation-asset-uploader.tsx`
  - source lokal yang belum dideploy: `services/admin/web/src/components/foundation-asset-uploader.tsx:99-103`
  - konfigurasi Coolify aplikasi `admin-alfida` (`rtio1rmf39lrfybxpxx5iu0c`)
- **Bukti:** Bundle yang sedang dideploy membaca hanya `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_FOUNDATION_UPLOAD_PRESET`. Jika salah satu tidak ada saat **build**, UI menghentikan upload dan menampilkan pesan _“Konfigurasi upload Cloudinary belum tersedia.”_
- **Bukti runtime:** Metadata Coolify saat diperiksa memang memiliki `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_FOUNDATION_UPLOAD_PRESET` untuk production, keduanya bertanda `is_buildtime = true`. Namun container aktif memakai revision `faf7d96...`, sementara metadata aplikasi terakhir diperbarui kemudian. Pada Next.js, `NEXT_PUBLIC_*` di-inline ke bundle browser ketika build, sehingga menambah/mengubah environment setelah image dibuat tidak memperbaiki bundle yang sudah berjalan.
- **Bukti source lokal:** Perbaikan lokal memakai fallback cloud dan preset resmi, termasuk fallback dari `NEXT_PUBLIC_CLOUDINARY_FOUNDATION_UPLOAD_PRESET` ke `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Perbaikan ini belum terdapat pada image aktif dan belum dideploy.
- **Penyebab pesan yang dialami pengguna:** browser memuat JavaScript dari image lama. Di sana nilai public Cloudinary tidak tersedia pada build terdahulu, lalu kondisi `if (!cloudName || !uploadPreset)` menampilkan pesan tersebut. Ini bukan kegagalan upload Cloudinary atau validasi API Yayasan.
- **Dampak:** Upload logo/favikon/tanda tangan ketua Yayasan tidak dapat dimulai dari Admin meskipun preset Cloudinary saat ini telah dicatat di Coolify.
- **Perbaikan yang diperlukan:** lakukan deployment/rebuild selektif aplikasi `admin-alfida` setelah perubahan source dan environment build-time sudah tersimpan. Setelah deployment, verifikasi bundle baru di browser, unggah file uji yang sesuai policy, simpan pengaturan, lalu hapus aset uji bila tidak digunakan. Jangan hanya me-restart container karena restart tidak membangun ulang bundle `NEXT_PUBLIC_*`.

## [SEV-2] SIAKAD belum memiliki fitur identitas unit maupun jalur upload Cloudinary

- **Status:** Confirmed
- **Lokasi:**
  - `services/siakad/web/src/app/page.tsx:1-5`
  - `services/siakad/web/src/components/service-placeholder.tsx`
  - `services/siakad/api/prisma/schema.prisma:13-26`
- **Bukti:** Web SIAKAD masih hanya merender `ServicePlaceholder`. Tidak ditemukan komponen upload, endpoint API, environment Cloudinary, atau policy URL Cloudinary dalam source `services/siakad`.
- **Bukti schema:** `UnitProjection` hanya memiliki `id`, `name`, `slug`, `status`, dan `updatedAt`. Tidak ada kolom URL logo unit maupun URL tanda tangan kepala sekolah.
- **Kesimpulan:** SIAKAD **tidak mengalami pesan Cloudinary yang sama**, karena fitur upload logo unit/tanda tangan kepala sekolah belum ada sama sekali. Saat UI identitas unit dibangun, fitur tersebut akan gagal memenuhi kebutuhan bisnis kecuali ditambahkan schema/migration, API scoped per unit, policy Cloudinary folder khusus unit, environment build-time web, dan uploader UI.
- **Dampak:** Admin unit belum dapat mengelola identitas visual dan tanda tangan kepala sekolah dari SIAKAD; kebutuhan ini saat ini tidak memiliki data model ataupun delivery path.
- **Rekomendasi implementasi:** gunakan boundary terpisah dari aset Yayasan, misalnya folder Cloudinary `units/{unitId}/logo` dan `units/{unitId}/principal-signature`; API harus memastikan `admin_unit` hanya dapat mengubah aset unit dalam scope principal-nya; URL baru harus divalidasi terhadap cloud name/folder yang diizinkan; tambahkan migration dengan field nullable terlebih dahulu agar rollout aman terhadap unit lama.
