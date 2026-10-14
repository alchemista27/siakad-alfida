# Panduan Deployment Microservices SIM-Alfida di Coolify

Dokumen ini menjelaskan tata cara deployment arsitektur microservices SIM-Alfida pada VPS Coolify dengan spesifikasi 2 vCPU, 8 GB RAM, 100 GB Storage.

> [!IMPORTANT]
> **Metode Deployment Utama (Direkomendasikan)**:
> Jika repositori Git Anda terhubung langsung ke Coolify dan menggunakan Webhook otomatis saat push commit, ikuti panduan lengkap:
> 👉 [`docs/deployment/coolify-git-webhook-guide.md`](./coolify-git-webhook-guide.md)
>
> Dokumen di bawah ini merupakan referensi alternatif jika Anda menggunakan alur image GitHub Container Registry (GHCR).

---

## 1. Topologi Arsitektur Microservices

| Service | Subdomain | Database Terpusat | Internal Ports | Keterangan |
|---|---|---|---|---|
| **auth** | `auth.alfida.or.id` | `alfida_auth` | 3000 (Web), 3001 (API) | Identity Provider & SSO Cookie `.alfida.or.id` |
| **admin** | `admin.alfida.or.id` | `alfida_auth` | 3000 (Web), 3001 (API) | Pusat Identitas Yayasan (Logo & Favicon), Rekening, & Approval User |
| **simakin** | `simakin.alfida.or.id` | `alfida_simakin` | 3000 (Web), 3001 (API) | Perencanaan, Program Kerja, & Monitoring KPI |
| **simpeg** | `simpeg.alfida.or.id` | `alfida_simpeg` | 3000 (Web), 3001 (API) | Kepegawaian, Penugasan Unit, Presensi GPS, Cuti, & Liqo |
| **siyaum** | `siyaum.alfida.or.id` | `alfida_siyaum` | 3000 (Web), 3001 (API) | Program Yaum Ma'al Quran (YMQ) Guru & Karyawan |
| **spmb** | `spmb.alfida.or.id` | `alfida_spmb` | 3000 (Web), 3001 (API) | Penerimaan Siswa Baru, Klaim WA, Observasi, & Handoff |
| **monolith** | `sim.alfida.or.id` | `simalfida` | 3000 (Web), 3001 (API) | Siakad, Siskeu, Sisarpras, Sisurat (Masa Transisi) |

> **Prinsip Efisiensi RAM**: Masing-masing microservice dikemas dalam **1 container gabungan** (Next.js standalone di port 3000 melayani UI + NestJS di port 3001 melayani REST API), sehingga konsumsi RAM per service hanya berkisar 200 - 350 MB.

---

## 2. Persiapan Database Terpusat di Coolify

Untuk menghemat beban memori, jangan membuat instance PostgreSQL baru. Gunakan service PostgreSQL yang sudah aktif di Coolify, lalu buat database untuk masing-masing service:

```sql
-- Eksekusi via Terminal / Database Management di Coolify
CREATE DATABASE alfida_auth;
CREATE DATABASE alfida_simakin;
CREATE DATABASE alfida_simpeg;
CREATE DATABASE alfida_siyaum;
CREATE DATABASE alfida_spmb;
```

---

## 3. Otomatisasi Image GHCR (GitHub Container Registry)

Setiap kali branch `main` diperbarui, GitHub Actions (`.github/workflows/deploy-services.yml`) otomatis mem-build image multi-stage dan mem-push ke GHCR:
- `ghcr.io/<owner>/<repo>/auth:latest`
- `ghcr.io/<owner>/<repo>/simakin:latest`
- `ghcr.io/<owner>/<repo>/simpeg:latest`
- `ghcr.io/<owner>/<repo>/siyaum:latest`
- `ghcr.io/<owner>/<repo>/spmb:latest`

Pastikan repository GitHub memiliki izin package write pada workflow permissions.

---

## 4. Konfigurasi Application di Dashboard Coolify

Buat **Application** bertipe **Docker Image** untuk setiap subdomain:

### A. Service Auth (`auth.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/auth:latest`
- **Exposed Port**: `3000`
- **FQDN**: `https://auth.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:<password>@<db-host>:5432/alfida_auth?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang>
  COOKIE_DOMAIN=.alfida.or.id
  NEXT_PUBLIC_APP_URL=https://auth.alfida.or.id
  ```

### B. Service SIMAKIN (`simakin.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/simakin:latest`
- **Exposed Port**: `3000`
- **FQDN**: `https://simakin.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:<password>@<db-host>:5432/alfida_simakin?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang-sama-dengan-auth>
  COOKIE_DOMAIN=.alfida.or.id
  INTERNAL_API_URL=http://127.0.0.1:3001
  ```

### C. Service SIMPEG (`simpeg.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/simpeg:latest`
- **Exposed Port**: `3000`
- **FQDN**: `https://simpeg.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:<password>@<db-host>:5432/alfida_simpeg?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang-sama-dengan-auth>
  COOKIE_DOMAIN=.alfida.or.id
  INTERNAL_API_URL=http://127.0.0.1:3001
  ```

### D. Service SIYAUM (`siyaum.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/siyaum:latest`
- **Exposed Port**: `3000`
- **FQDN**: `https://siyaum.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:<password>@<db-host>:5432/alfida_siyaum?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang-sama-dengan-auth>
  COOKIE_DOMAIN=.alfida.or.id
  INTERNAL_API_URL=http://127.0.0.1:3001
  ```

### E. Service SPMB (`spmb.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/spmb:latest`
- **Exposed Port**: `3000`
- **FQDN**: `https://spmb.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:***@<db-host>:5432/alfida_spmb?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang-sama-dengan-auth>
  COOKIE_DOMAIN=.alfida.or.id
  INTERNAL_API_URL=http://127.0.0.1:3001
  NEXT_PUBLIC_APP_URL=https://spmb.alfida.or.id
  INTERNAL_SIAKAD_API_URL=http://<monolith-container-or-host>:3001
  INTERNAL_SERVICE_SECRET=<generate-strong-random-secret>
  ```

### F. Service Admin Yayasan (`admin.alfida.or.id`)
- **Docker Image**: `ghcr.io/<owner>/<repo>/admin:latest` (atau Git source: `services/admin/Dockerfile`)
- **Exposed Port**: `3000`
- **FQDN**: `https://admin.alfida.or.id`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:***@<db-host>:5432/alfida_auth?schema=public
  JWT_SECRET=<kunci-rahasia-sso-panjang-sama-dengan-auth>
  COOKIE_DOMAIN=.alfida.or.id
  INTERNAL_API_URL=http://127.0.0.1:3001
  NEXT_PUBLIC_APP_URL=https://admin.alfida.or.id
  ```

---

## 5. Migrasi Skema Awal Database (Prisma Migration)

Pada saat pertama kali container di-deploy atau sebelum traffic dialihkan, jalankan migrasi tabel ke masing-masing database dengan perintah berikut:

```bash
# Migrasi DB Auth
DATABASE_URL="postgresql://.../alfida_auth" pnpm --filter auth-api exec prisma db push

# Migrasi DB SIMAKIN
DATABASE_URL="postgresql://.../alfida_simakin" pnpm --filter @alfida/simakin-api exec prisma db push

# Migrasi DB SIMPEG
DATABASE_URL="postgresql://.../alfida_simpeg" pnpm --filter simpeg-api exec prisma db push

# Migrasi DB SIYAUM
DATABASE_URL="postgresql://.../alfida_siyaum" pnpm --filter siyaum-api exec prisma db push

# Migrasi DB SPMB
DATABASE_URL="postgresql://.../alfida_spmb" pnpm --filter spmb-api exec prisma db push
```

---

## 6. Sinkronisasi Data Identitas Legacy ke Service Auth

Telah disediakan skrip migrasi identitas otomatis dari database legacy ke service Auth:

```bash
LEGACY_DATABASE_URL="postgresql://.../simalfida" \
DATABASE_URL="postgresql://.../alfida_auth" \
pnpm --filter auth-api run migrate:legacy
```

Pengguna yang sudah ada akan otomatis disinkronkan ke auth terpusat tanpa kehilangan kata sandi atau data akun.
