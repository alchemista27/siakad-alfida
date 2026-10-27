# Update Fitur SIAKAD — Temuan dan Status Implementasi

_Diperbarui: 18 Oktober 2026 (UTC)._

## Status ringkas

Implementasi telah dimulai dan satu vertical slice backend SIAKAD sudah selesai serta terverifikasi secara lokal: autentikasi token, lifecycle migration deployment, master akademik, penempatan siswa, penugasan guru/wali kelas, jadwal pelajaran, dan deklarasi RBAC controller.

**Paritas penuh dengan modul akademik monolith belum selesai.** Workflow guru batch, lesson plan, ekstrakurikuler, rapor generation, promosi, SPP, monitoring siswa, UI SIAKAD, migrasi data, dan CI masih belum diimplementasikan. Tidak ada commit atau push.

## Fitur yang sudah diimplementasikan

### 1. Verifikasi SSO/JWT SIAKAD

File utama:

- `services/siakad/api/src/auth/siakad-auth.guard.ts`
- `services/siakad/api/scripts/test-siakad-auth-verification.ts`

Perubahan:

- Menghapus perilaku lama yang hanya melakukan Base64 decode payload JWT.
- Token sekarang diverifikasi oleh `verifyAuthToken()` dari `@alfida/auth-sdk`.
- Verifikasi memakai signature, issuer, audience, serta expiry dari library `jose`.
- Konfigurasi runtime bersifat fail-closed:
  - `AUTH_JWKS_URL` untuk JWKS, atau
  - `AUTH_SECRET` / `BETTER_AUTH_SECRET` / `JWT_SECRET` untuk signature simetris,
  - `AUTH_JWT_ISSUER` wajib tersedia,
  - `AUTH_JWT_AUDIENCE` default `siakad`.
- Mendukung bearer token dan cookie `alfida_session`, `better-auth.session_token`, serta `__Secure-better-auth.session_token`.
- Cookie Better Auth berformat signed token dinormalisasi menjadi tiga segmen JWT sebelum diverifikasi.

Bukti test:

```text
SIAKAD auth verification contract passed
```

Kontrak membuktikan token valid diterima, sedangkan token forged, issuer salah, dan token kedaluwarsa ditolak.

### 2. Lifecycle migration pada startup container

File utama:

- `services/siakad/start.sh`
- `services/siakad/api/scripts/test-prisma-deployment-lifecycle.ts`

Perubahan:

```sh
pnpm --filter siakad-api exec prisma migrate deploy --schema services/siakad/api/prisma/schema.prisma
```

Perintah tersebut dijalankan sebelum proses NestJS menerima request. Startup tidak memakai `prisma db push`.

Bukti test:

```text
SIAKAD Prisma deployment lifecycle contract passed
```

Catatan: migration belum dijalankan ke database Coolify/produksi dalam pekerjaan ini. Deployment tetap harus memverifikasi `DATABASE_URL`, izin schema `siakad`, status migration, dan backup database lebih dahulu.

### 3. RBAC deklaratif controller

File utama:

- `services/siakad/api/src/auth/auth.module.ts`
- `services/siakad/api/src/common/guards/siakad-roles.guard.ts`
- `services/siakad/api/scripts/test-siakad-controller-rbac-contract.ts`

Controller SIAKAD berikut sekarang memakai:

```ts
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("...")
```

- `academic-years`
- `subjects`
- `classrooms`
- `placement`
- `teaching`
- `lhbs`
- `assignments`
- `schedules`

`AuthModule` sekarang menyediakan dan mengekspor `SiakadRolesGuard`; module penugasan dan jadwal mengimpor `AuthModule` agar guard dapat di-resolve oleh NestJS saat runtime.

Bukti test:

```text
SIAKAD controller RBAC declarations contract passed
```

### 4. Tahun ajaran

File utama:

- `services/siakad/api/src/academic-years/academic-years.controller.ts`
- `services/siakad/api/src/academic-years/academic-years.service.ts`
- `services/siakad/api/scripts/test-academic-years-contract.ts`

Kemampuan yang tersedia:

- list dan detail scoped per unit;
- create;
- update nama, tanggal, dan status;
- update status;
- delete jika belum mempunyai kelas maupun enrollment;
- validasi nama kosong, tanggal invalid, tanggal akhir sebelum tanggal mulai, duplicate nama dalam satu unit, dan akses lintas unit.

Bukti test:

```text
Academic years contract passed
```

### 5. Mata pelajaran

File utama:

- `services/siakad/api/src/subjects/subjects.controller.ts`
- `services/siakad/api/src/subjects/subjects.service.ts`
- `services/siakad/api/scripts/test-subjects-contract.ts`

Kemampuan yang tersedia:

- list dan detail scoped;
- create;
- update;
- delete dengan guard terhadap referensi akademik aktif;
- normalisasi kode mapel dan penolakan duplicate/lintas unit.

Bukti test:

```text
Subjects contract passed
```

### 6. Kelas, roster, dan penempatan siswa

File utama:

- `services/siakad/api/src/classrooms/classrooms.controller.ts`
- `services/siakad/api/src/classrooms/classrooms.service.ts`
- `services/siakad/api/src/placement/placement.controller.ts`
- `services/siakad/api/src/placement/placement.service.ts`
- `services/siakad/api/scripts/test-classes-contract.ts`
- `services/siakad/api/scripts/test-placement-command-contract.ts`

Kemampuan yang tersedia:

- CRUD kelas scoped per unit/tahun ajaran;
- proteksi hapus kelas bila masih memiliki enrollment;
- proteksi penurunan kapasitas di bawah jumlah siswa aktif;
- daftar siswa belum ditempatkan;
- roster per kelas;
- place dan move student dengan verifikasi unit, tahun ajaran, kapasitas, dan status enrollment.

Bukti test:

```text
Classrooms contract passed
Placement command contract passed
```

### 7. Penugasan guru dan wali kelas

File utama:

- `services/siakad/api/src/assignments/assignments.module.ts`
- `services/siakad/api/src/assignments/assignments.controller.ts`
- `services/siakad/api/src/assignments/assignments.service.ts`
- `services/siakad/api/scripts/test-assignments-contract.ts`

Endpoint baru:

- `GET|POST /api/assignments/teachers`
- `GET|PATCH|DELETE /api/assignments/teachers/:id`
- `GET|POST /api/assignments/homerooms`
- `GET|PATCH|DELETE /api/assignments/homerooms/:id`

Perlindungan yang diterapkan:

- admin unit hanya dapat melihat/mengubah assignment pada unitnya;
- tahun ajaran, kelas, dan mapel harus satu unit dan satu tahun ajaran;
- guru harus ada sebagai `UserProjection` aktif dengan role SIAKAD `guru`;
- satu kelas-mapel-tahun hanya satu assignment guru;
- satu kelas-tahun hanya satu wali kelas.

Bukti test:

```text
Assignments contract passed
```

### 8. Jadwal pelajaran

File utama:

- `services/siakad/api/src/schedules/schedules.module.ts`
- `services/siakad/api/src/schedules/schedules.controller.ts`
- `services/siakad/api/src/schedules/schedules.service.ts`
- `services/siakad/api/scripts/test-schedules-contract.ts`

Endpoint baru:

- `GET|POST /api/schedules`
- `GET|PATCH|DELETE /api/schedules/:id`

Perlindungan yang diterapkan:

- format waktu wajib `HH:mm`;
- hari wajib bernilai 1 sampai 7;
- jam selesai harus setelah jam mulai;
- mapel harus milik unit kelas;
- jadwal hanya boleh dibuat jika assignment guru untuk kelas-mapel-tahun sudah ada;
- konflik waktu kelas ditolak;
- konflik waktu guru lintas kelas pada tahun ajaran yang sama ditolak.

Bukti test:

```text
Schedules contract passed
```

## Validasi yang sudah lulus

Command yang sudah dijalankan pada repository lokal:

```text
SIAKAD auth verification contract passed
SIAKAD Prisma deployment lifecycle contract passed
Academic years contract passed
Subjects contract passed
Classrooms contract passed
Placement command contract passed
Assignments contract passed
Schedules contract passed
SIAKAD controller RBAC declarations contract passed
```

Selain test kontrak tersebut, perintah berikut lulus:

```bash
pnpm --filter siakad-api typecheck
pnpm --filter siakad-api build
```

Build API menyelesaikan:

```text
nest build && cp -r src/generated dist/
```

## Temuan yang masih harus dikerjakan untuk paritas monolith

### Prioritas kritis sebelum production rollout

1. **Kontrak token produksi wajib diverifikasi terhadap Auth sebenarnya.**
   Test lokal membuktikan JWT HS256/JWKS diverifikasi dengan benar, tetapi environment Coolify harus menyediakan issuer, audience, dan sumber kunci yang sama dengan Auth. SIAKAD tidak boleh dideploy sebelum validasi token SSO asli berhasil.
2. **Migration database belum dibuat untuk gap schema.**
   Schema SIAKAD saat ini belum setara dengan monolith pada label nilai, tipe lesson plan, teacher ownership lesson plan, schedule ekskul, SPP, indikator karakter, pelanggaran, dan laporan BPI.
3. **Belum ada verifikasi `prisma migrate status` pada database target.**
   `migrate deploy` telah ditambahkan ke startup, namun belum boleh dieksekusi ke production sebelum namespace, history `_prisma_migrations`, dan baseline schema diperiksa.

### Fitur backend yang belum ada atau belum setara

| Area | Status | Gap utama |
|---|---|---|
| Absensi siswa | Belum | batch upsert per jadwal/kelas, list/edit, validasi roster |
| Nilai | Parsial | masih single record; belum batch/upsert, label, daftar/edit grid |
| Jurnal mengajar | Parsial | belum list/update/delete dan ownership lengkap |
| Prota/Promes/RPP | Belum | API CRUD, type, ownership guru, policy file URL |
| Ekstrakurikuler | Belum | CRUD, pembina, jadwal, member, join/leave orang tua, jurnal, nilai |
| LHBS | Parsial | belum compile snapshot, list, generate PDF aman, draft/recompute |
| Kenaikan/kelulusan | Belum | batch decision, enrollment year berikutnya, audit state |
| SPP | Belum | belum ada keputusan ownership domain dan API billing/upload/verifikasi |
| Karakter/pelanggaran/BPI | Belum | model, API scoped wali kelas, dashboard monitoring |
| Portal orang tua | Hampir belum ada | children, jadwal, ekskul, rapor, SPP, daftar ulang |
| Monitoring admin/pengawas | Belum | rollup kehadiran, nilai, jurnal, pelanggaran, karakter |
| Migrasi dari monolith | Belum | importer idempoten, mapping ID, dry run, reconciliation |
| CI | Belum | contract test SIAKAD belum menjadi gate CI resmi |

### Fitur frontend yang belum ada

`services/siakad/web/src/app/page.tsx` masih menampilkan `ServicePlaceholder`. Belum ada:

- routing dashboard berbasis persona SSO;
- app shell/sidebar/topbar SIAKAD;
- halaman admin unit untuk master akademik, assignment, jadwal, ekskul, promosi, dan monitoring;
- halaman guru/wali kelas untuk absensi, nilai, jurnal, lesson plan, rapor, dan monitoring siswa;
- halaman orang tua;
- notification/modal sesuai `DESIGN.md`;
- kontrak UI dan build verification setelah halaman operasional dibuat.

## Batasan desain yang masih perlu diputuskan

1. **SPP:** tetap di SIAKAD atau pindah ke bounded context billing/keuangan.
2. **Kewenangan wali kelas/pembina ekskul:** claim role SSO terpisah atau kewenangan diturunkan dari assignment di SIAKAD.
3. **Daftar ulang dan promosi:** apakah promosi otomatis membuat enrollment tahun berikutnya, atau wajib dikonfirmasi orang tua.
4. **Migrasi historis:** periode/tahun ajaran mana yang dipindahkan dari schema `sim`, dan data mana yang cukup menjadi read-only legacy.
5. **Identifier schedule:** implementasi saat ini menghubungkan jadwal ke assignment melalui kombinasi class-mapel-tahun. Migration berikutnya sebaiknya menambah `teacherAssignmentId` agar referensi lebih eksplisit dan tidak ambigu.

## Dampak layanan

- **Auth:** SIAKAD sekarang menolak token palsu; konfigurasi SSO yang salah akan fail closed menjadi 401, bukan membuka akses.
- **SIAKAD API:** endpoint master akademik, assignment, dan schedule tersedia setelah deployment image baru serta migration baseline lolos.
- **SPMB:** tidak diubah pada slice ini; handoff yang sudah ada tetap menjadi jalur penerimaan siswa.
- **Monolith:** tidak diubah. Tidak ada dual-write dan tidak ada redirect/decommission route monolith pada tahap ini.
- **Coolify/production:** belum disentuh dan belum dideploy.

## Kesimpulan

Slice fondasi dan operasional admin unit sudah siap untuk tahap UI setelah konfigurasi SSO runtime dikonfirmasi. Paritas penuh belum dapat diklaim karena mayoritas workflow guru, orang tua, pembinaan siswa, laporan, keuangan, UI, CI, dan migrasi data masih belum ada.

---

# Tambahan Scope Disetujui — Identitas Unit Pendidikan dan Boundary Akses Aplikasi

**Dicatat:** 18 Oktober 2026 UTC
**Status:** kebutuhan produk yang harus diimplementasikan; belum dikerjakan pada SIAKAD.

## Keputusan ownership unit

1. **Identitas unit pendidikan dikelola di SIAKAD.** Admin unit pendidikan dapat mengubah logo unit dan tanda tangan kepala sekolah dari menu identitas unit SIAKAD.
2. **Unit non-pendidikan dikelola hanya melalui SIMPEG.** Pengelolaan unit, data kepegawaian, dan admin unit non-pendidikan tetap berada di SIMPEG; SIAKAD tidak menyediakan halaman maupun API identitas untuk unit tersebut.
3. **Kategori unit bersumber dari SIMPEG.** `services/simpeg/api/prisma/schema.prisma` sudah memiliki `Unit.category` dengan nilai `pendidikan` atau `nondik`. SIAKAD harus menerima kategori tersebut sebagai bagian dari projection organisasi yang tervalidasi, bukan menebak kategori dari nama unit.

## Fitur baru wajib: Identitas Unit Pendidikan di SIAKAD

### Data dan migration

- Tambahkan model/field SIAKAD yang menyimpan, minimal: `unitId`, `logoUrl`, `principalName`, `principalSignatureUrl`, `updatedAt`, dan metadata audit pembaruan.
- Gunakan constraint satu record identitas per unit pendidikan.
- Simpan kategori pada `UnitProjection` atau model projection terkait agar service dapat menolak unit `nondik` secara deterministik.
- Migration harus additive dan idempoten; seluruh field identitas baru nullable pada rollout awal agar unit pendidikan lama tetap dapat diakses sebelum aset diisi.
- Jangan menyimpan secret Cloudinary, API key, atau API secret di database maupun response API.

### API, policy aset, dan RBAC

- Tambahkan endpoint read/update identitas unit pada `services/siakad/api`, dengan scope unit dari principal SSO, bukan `unitId` bebas dari browser.
- Hanya `super_admin` dan `siakad:admin_unit` untuk unit pendidikan yang dapat memperbarui identitas.
- `siakad:admin_unit_nondik` wajib menerima `403` untuk semua endpoint identitas dan seluruh endpoint operasional SIAKAD.
- URL aset baru hanya boleh berasal dari Cloudinary pada folder yang dipisahkan dari aset Yayasan, misalnya:
  - `units/{unitId}/logo`
  - `units/{unitId}/principal-signature`
- Validasi URL wajib memeriksa cloud name, folder yang tepat, dan kecocokan `unitId`; URL dari unit lain, folder Yayasan, host eksternal, atau path traversal harus ditolak.
- Logo dan signature lama yang sudah tersimpan hanya boleh dipertahankan jika persis tidak berubah; aset baru wajib memenuhi policy baru.

### UI SIAKAD

- Tambahkan halaman **Identitas Unit** pada dashboard admin unit pendidikan.
- Form memuat nama unit read-only dari projection, nama kepala sekolah, uploader logo, uploader tanda tangan, preview, status upload, error non-native, dan tombol simpan sesuai token `DESIGN.md`.
- Uploader browser memakai konfigurasi `NEXT_PUBLIC_CLOUDINARY_*` yang tersedia ketika build; deployment/rebuild wajib dilakukan setelah perubahan env public.
- Unit `nondik` tidak boleh melihat menu, route, ataupun action upload SIAKAD.

## Boundary akses: unit pendidikan vs non-pendidikan

Target perilaku yang wajib dibuktikan:

| Kategori unit | Peran organisasi | SIMPEG | SIAKAD |
|---|---|---|---|
| `pendidikan` | `admin_unit` scoped ke unit | Diizinkan | Diizinkan sesuai scope unit |
| `nondik` | `admin_unit_nondik` scoped ke unit | Diizinkan | Ditolak/diarahkan ke halaman tidak berwenang |

Kondisi saat ini:

- **Assignment backend SIMPEG sudah tepat:** `services/simpeg/api/src/common/organization-access.policy.ts` hanya mengizinkan app `siakad`/`spmb` untuk `Unit.category === "pendidikan"`; `UnitsService.assignAdmin()` menolak penugasan SIAKAD atau SPMB pada unit `nondik`.
- **Namun boundary web SIAKAD belum lengkap:** `services/siakad/web/src/middleware.ts` saat ini hanya memeriksa keberadaan cookie sesi, bukan claim aplikasi/role/kategori unit. Seorang admin unit non-pendidikan dengan sesi Auth yang valid masih dapat melewati redirect middleware dan baru akan ditolak API ber-guard. Implementasi berikutnya harus membuat pemeriksaan server-side terhadap `/api/auth/me` atau endpoint SSO ekuivalen, lalu menolak/mengarahkan role yang tidak memiliki akses SIAKAD sebelum dashboard dirender.
- API SIAKAD juga harus mempertahankan fail-closed policy: tidak ada fallback dummy user, tidak ada default `admin_unit`, dan tidak ada bypass karena projection kategori hilang/stale.

## Dropdown role Admin — status dan perubahan yang wajib didokumentasikan

**Sudah diimplementasikan di Admin, tetapi sebelumnya belum tercatat dalam dokumen ini.**

Bukti implementasi:

- `services/admin/web/src/components/user-role-modal.tsx` memakai dropdown aplikasi, peran, unit, dan bidang; tidak lagi meminta UUID unit/bidang manual.
- `services/admin/web/src/components/user-role-modal.tsx` memuat katalog dari `GET /api/admin/users/units` dan `GET /api/admin/users/departments`.
- `services/admin/api/src/users/users.controller.ts` menyediakan kedua endpoint katalog tersebut.
- Penetapan peran berscope unit diteruskan ke SIMPEG melalui `OrganizationRoleAdminService`, sehingga `UnitsService.assignAdmin()` menjadi enforcement point kategori unit.

Pekerjaan lanjutan untuk memenuhi boundary baru:

1. Endpoint katalog unit Admin harus ikut mengembalikan `category` (`pendidikan`/`nondik`), bukan hanya `id`, `name`, dan `slug`.
2. Setelah operator memilih unit `nondik`, dropdown aplikasi harus membatasi pilihan hanya ke `SIMPEG`; opsi `SIAKAD` dan `SPMB` tidak boleh bisa dipilih atau dikirim dari browser.
3. Setelah operator memilih unit pendidikan, dropdown boleh menampilkan aplikasi yang sah untuk unit pendidikan sesuai katalog role.
4. Validasi SIMPEG yang sudah ada tetap menjadi source of truth server-side; filter UI bukan pengganti policy API.
5. Tambahkan contract test untuk memastikan payload Admin yang memaksa `app: "siakad"` pada unit `nondik` ditolak `400`, serta role `admin_unit_nondik` tidak dapat mengakses route dashboard/API SIAKAD.

## Kriteria penerimaan dan verifikasi wajib

1. Tulis contract test gagal untuk upload/update identitas unit pendidikan, lalu implementasikan minimal hingga test lulus.
2. Tulis contract test gagal untuk URL Cloudinary logo/signature dari unit lain atau folder terlarang; API harus menjawab `400`.
3. Tulis test RBAC untuk empat kasus tabel kategori di atas, termasuk token valid `admin_unit_nondik` yang mencoba route SIAKAD.
4. Tulis test UI yang membuktikan dropdown Admin menyembunyikan/menonaktifkan SIAKAD dan SPMB setelah unit `nondik` dipilih.
5. Jalankan minimal `pnpm --filter siakad-api typecheck`, test kontrak SIAKAD yang baru, typecheck/build web SIAKAD, test kontrak Admin, serta typecheck/build Admin sebelum deployment.
6. Setelah build production, lakukan verifikasi browser dengan akun admin unit pendidikan dan akun admin unit non-pendidikan; jangan menganggap restart container sebagai pengganti rebuild untuk variable `NEXT_PUBLIC_*`.

---

# Update Eksekusi Remediasi — 18 Oktober 2026 UTC

## Selesai dan tervalidasi lokal

### Identitas unit pendidikan (backend SIAKAD)

- Migration additive baru: `services/siakad/api/prisma/migrations/20261018102000_unit_identity/migration.sql`.
  - menambahkan `UnitProjection.category` dan `sourceUpdatedAt`;
  - membuat tabel `siakad.unit_identities` satu-ke-satu dengan `unit_projections`.
- Module baru `services/siakad/api/src/unit-identity/` menyediakan endpoint:
  - `GET|PATCH /api/unit-identity/me` untuk admin unit pendidikan dengan tepat satu scope;
  - `GET|PATCH /api/unit-identity/:unitId` untuk `super_admin`.
- Policy Cloudinary hanya menerima URL HTTPS di cloud yang dikonfigurasi dan folder tepat `units/{unitId}/logo` atau `units/{unitId}/principal-signature`.
- Unit berstatus tidak aktif, `nondik`, atau category projection yang belum diketahui ditolak fail-closed. URL legacy hanya dapat dipertahankan bila persis tidak berubah.
- Kontrak `test-unit-identity-contract.ts`, typecheck, Prisma generate, dan build SIAKAD API lulus.

### Boundary pendidikan/nondik

- Katalog unit Admin sekarang membawa `category` dari `sim.units`; fallback lokal pun menyertakan kategori eksplisit.
- Dropdown Admin membatasi unit `nondik` ke aplikasi `SIMPEG`, mereset pilihan SIAKAD/SPMB yang tidak sah, dan memberi pesan non-native bila payload tidak sesuai. SIMPEG tetap merupakan enforcement server-side kanonikal.
- Root SIAKAD kini diproteksi oleh Edge middleware untuk seluruh route aplikasi, mendukung cookie `__Secure-better-auth.session_token`, dan halaman root memverifikasi `/api/auth/me` sebelum merender.
- Claim `admin_unit_nondik` dan setiap role tanpa grant SIAKAD diarahkan kembali ke portal modul Auth; tidak ada fallback user dummy.
- Kontrak UI/Admin dan middleware/SIAKAD web, typecheck, serta build masing-masing lulus.

### Handoff dan reliability lintas layanan

- Dispatcher outbox SPMB telah berjalan terjadwal melalui `@nestjs/schedule`, memakai lease lintas replika, retry dengan backoff, dan pencegahan overlap proses.
- Penerima handoff SIAKAD tidak lagi dapat mengganti `sourceAcademicYearId` yang tidak terproyeksi dengan tahun ajaran aktif/acak. Unit tujuan wajib projection aktif kategori `pendidikan`, dan tahun ajaran harus cocok untuk unit yang sama.
- Kontrak dispatcher SPMB, handoff outbox, internal handoff SIAKAD, typecheck, dan build API lulus.

### CI contract gate dan pendaftaran staf

- `pnpm test:contracts` kini mengecualikan script yang eksplisit bertanda `@contract-test: external`; tiga script yang membaca/memutasi database konfigurasi eksternal tidak lagi dijalankan oleh CI.
- Script kontrak baru membuktikan pendaftaran staf selalu menghasilkan akun nonaktif sampai approval administrator; `AUTO_APPROVE_STAFF` tidak lagi dapat membuka akun staf secara default.
- Full no-external-state suite lulus: `Contract suite passed (92 tests)`.

## Masih belum selesai

1. **Projection kategori unit dari SIMPEG ke SIAKAD belum memiliki producer/consumer sinkronisasi otomatis.** Schema dan policy SIAKAD sudah fail-closed (`unknown` ditolak), namun unit pendidikan tidak dapat memakai identitas hingga projection dengan category `pendidikan` tersedia.
2. **UI operasional SIAKAD belum dibangun.** Halaman root masih menggunakan placeholder setelah gate SSO; halaman Identitas Unit, uploader Cloudinary browser, dashboard per-persona, dan menu admin/guru/orang tua belum ada.
3. Gap paritas akademik besar pada bagian sebelumnya tetap berlaku: absensi batch, grid nilai, jurnal/lesson plan penuh, ekskul, LHBS/PDF, promosi, SPP, karakter/BPI, monitoring, dan importer monolith.
4. Migration baru belum diterapkan ke database target. Sebelum deploy, lakukan baseline/migration-status check sesuai prosedur Prisma dan pastikan nilai konfigurasi `NEXT_PUBLIC_*` tersedia saat build.

## Status operasi

- Tidak ada `git commit`, `git push`, deployment Coolify, atau migration database produksi.
- Semua perubahan masih lokal pada working tree yang sebelumnya sudah dirty.
