# Laporan Investigasi Error Deployment Microservices Coolify (Auth, SIMAKIN, SIMPEG)

Dokumen ini memuat laporan teknis mendalam hasil investigasi langsung terhadap server Coolify VPS, basis data antrean deployment Coolify (`coolify-db`), log kontainer yang sedang berjalan, dan proses build Docker terkait kegagalan deployment pada layanan `auth`, `simakin`, dan `simpeg`.

---

## 1. Ringkasan Eksekutif Temuan

Kegagalan deployment pada `auth`, `simakin`, dan `simpeg` disebabkan oleh kombinasi masalah pada 3 lapisan:
1. **Lapisan Build & Resource VPS (Out of Disk Space / Concurrency Spike)**: Ketiadaan konfigurasi *Watch Paths* di Coolify menyebabkan 4 aplikasi di-build secara simultan setiap kali ada commit ke Git, menghabiskan ruang penyimpanan disk (96 GB) dan memicu galat `No space left on device` serta kegagalan snapshot Redis Coolify.
2. **Lapisan Docker Build (`postinstall` script failure)**: Perintah `pnpm install --frozen-lockfile` di Dockerfile memicu script root `postinstall` (`@sim/database generate`) yang gagal di lingkungan Alpine Linux karena ketidaksesuaian binary target engine Prisma legacy.
3. **Lapisan Runtime Environment (`DATABASE_URL` Host Mismatch)**: Variabel lingkungan `DATABASE_URL` pada aplikasi `auth` dan `simakin` di Coolify diarahkan ke `172.17.0.1:5432` (gateway host yang tidak dapat diakses dari kontainer) alih-alih `bkoopidoln9uolhwy3zillrd:5432` (hostname kontainer PostgreSQL di jaringan Docker Coolify), sehingga NestJS crash seketika saat start (`P1001: Can't reach database server`).

---

## 2. Bukti Investigasi Lapisan Build & Server

### A. Galat Kehabisan Disk (No space left on device)
Dari tabel `application_deployment_queues` (ID antrean 148, 149, 150, 151):
```text
[WARN] GET https://registry.npmjs.org/@prisma/client/-/client-6.19.3.tgz error 
Failed to write to file at "/root/.local/share/pnpm/store/v11/files/...": 
No space left on device (os error 28)
```
- **Akar Masalah**:
  - Kolom `watch_paths` pada keempat aplikasi di Coolify bernilai `NULL` (kosong).
  - Setiap push git memicu 4 kontainer build paralel (`buildx`) yang masing-masing menduplikasi monorepo dan cache pnpm (~20 GB per build).
  - Disk server 96 GB terisi 100%, sehingga proses download layer Docker dan pnpm gagal total.

### B. Kegagalan Snapshot Redis Coolify (MISCONF Redis RDB)
Dampak dari disk 100% penuh terekam pada `laravel.log` kontainer `coolify`:
```text
MISCONF Redis is configured to save RDB snapshots, but it's currently unable to persist to disk. 
Commands that may modify the data set are disabled...
```
- Saat Redis menolak penulisan data, antrean job Laravel Horizon di Coolify terputus. Deployment 149, 150, dan 151 berstatus `failed` seketika tanpa sempat menyimpan log keluaran build.

### C. Kegagalan Script Root `postinstall` di Lingkungan Alpine
Pada tabel `failed_jobs` (Job ID 42):
```text
ERR_PNPM_EXECUTOR_LIFECYCLE_SCRIPT_FAILED
/app postinstall: `pnpm --filter @sim/database generate` exited with exit status: 1
ERROR: process "/bin/sh -c pnpm install --frozen-lockfile" did not complete successfully: exit code: 1
```
- **Akar Masalah**:
  - Root `package.json` mendefinisikan `"postinstall": "pnpm --filter @sim/database generate"`.
  - Saat `pnpm install` dijalankan di dalam Dockerfile (`node:22-alpine`), Prisma mencoba men-download engine query untuk platform Alpine (`linux-musl-openssl-3.0.x`).
  - Paket `@sim/database` adalah basis data monolith legacy yang tidak digunakan oleh microservices `auth`, `simakin`, dan `simpeg` (masing-masing microservice memiliki skema mandiri di `services/<service>/api/prisma`).
  - Kegagalan download engine legacy tersebut membatalkan seluruh proses instalasi dependensi di dalam Dockerfile.

---

## 3. Bukti Investigasi Lapisan Runtime Kontainer

### A. Crash Database Connection pada Auth & SIMAKIN
Log kontainer aktif `auth-alfida` (`fc60daebc66b`) dan `simakin-alfida` (`5e28fddf595e`):
```text
PrismaClientInitializationError: Can't reach database server at `172.17.0.1:5432`
Please make sure your database server is running at `172.17.0.1:5432`.
errorCode: 'P1001'
```
Pemeriksaan nilai environment variable kontainer (`docker inspect`):
- `auth`: `DATABASE_URL=postgresql://postgres:...@172.17.0.1:5432/alfida_auth?schema=public`
- `simakin`: `DATABASE_URL=postgresql://postgres:...@172.17.0.1:5432/alfida_simakin?schema=public`
- `simpeg`: `DATABASE_URL=postgresql://postgres:...@bkoopidoln9uolhwy3zillrd:5432/alfida_simpeg?schema=public`

**Analisis**:
- Kontainer PostgreSQL lokal Coolify berjalan dengan nama container `bkoopidoln9uolhwy3zillrd` pada bridge network `coolify`.
- IP `172.17.0.1` adalah gateway interface default docker0 di host, yang tidak meneruskan traffic port 5432 ke kontainer PostgreSQL.
- SIMPEG berhasil terkoneksi ke database (`Simpeg API running on port 3001`) karena menggunakan hostname internal `bkoopidoln9uolhwy3zillrd:5432`.
- Auth dan SIMAKIN gagal booting karena masih menggunakan IP `172.17.0.1:5432`.

### B. Binding Hostname Next.js Standalone
Pada kontainer `simpeg`:
- Next.js standalone mengikat port 3000 secara default ke IP container (`10.0.1.7:3000`), bukan ke wildcard interface `0.0.0.0:3000`.
- Akibatnya, pemanggilan dari `localhost:3000` atau `127.0.0.1:3000` di dalam start script atau healthcheck mengembalikan `ECONNREFUSED`.
- Menambahkan `HOSTNAME=0.0.0.0` sebelum menjalankan `node server.js` memastikan Next.js melayani permintaan pada semua antarmuka jaringan kontainer.

---

## 4. Solusi dan Rekomendasi Perbaikan

### Tindakan 1: Isolasi `postinstall` pada Dockerfile
Gunakan flag `--ignore-scripts` pada instruksi instalasi dependensi di seluruh Dockerfile microservices:
```dockerfile
RUN pnpm install --frozen-lockfile --ignore-scripts
```
Kemudian jalankan generate Prisma secara eksplisit hanya untuk service yang bersangkutan:
```dockerfile
RUN pnpm --filter @alfida/<service>-api exec prisma generate
```
Langkah ini mencegah eksekusi skrip postinstall `@sim/database` legacy yang tidak relevan.

### Tindakan 2: Perbarui Host `DATABASE_URL` di Dashboard Coolify
Ubah nilai `DATABASE_URL` pada tab **Environment Variables** di Coolify untuk layanan:
- **`auth-alfida`**:
  `postgresql://postgres:Y3xXZFbMB5O0BSDtY30a70aDANiffTYEBmvWl9XQFmJswBsxT2Mf4rheSINjVIjU@bkoopidoln9uolhwy3zillrd:5432/alfida_auth?schema=public`
- **`simakin-alfida`**:
  `postgresql://postgres:Y3xXZFbMB5O0BSDtY30a70aDANiffTYEBmvWl9XQFmJswBsxT2Mf4rheSINjVIjU@bkoopidoln9uolhwy3zillrd:5432/alfida_simakin?schema=public`

### Tindakan 3: Pasang `Watch Paths` di Coolify
Agar Coolify tidak mem-build seluruh 4 aplikasi secara serentak setiap kali commit:
1. Buka aplikasi `auth-alfida` > General Settings > **Watch Paths**:
   ```text
   services/auth/**
   packages/**
   ```
2. Buka aplikasi `simakin-alfida` > General Settings > **Watch Paths**:
   ```text
   services/simakin/**
   packages/**
   ```
3. Buka aplikasi `simpeg-alfida` > General Settings > **Watch Paths**:
   ```text
   services/simpeg/**
   packages/**
   ```
4. Buka aplikasi `siakad-alfida` > General Settings > **Watch Paths**:
   ```text
   apps/**
   packages/**
   ```

### Tindakan 4: Tambahkan `HOSTNAME=0.0.0.0` pada `start.sh`
Perbarui baris start Next.js di ke-5 file `services/*/start.sh`:
```bash
HOSTNAME=0.0.0.0 PORT=3000 node services/<service>/web/.next/standalone/services/<service>/web/server.js
```
Hal ini memastikan Next.js menerima koneksi dari Traefik proxy dan internal container.
