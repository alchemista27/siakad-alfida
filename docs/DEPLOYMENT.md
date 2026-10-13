# Panduan Deployment Microservices SIM-Alfida

Sistem Informasi Manajemen Yayasan Alfida (SIM-Alfida) menggunakan arsitektur **Turborepo Monorepo Microservices**. Seluruh layanan dideploy ke server mandiri menggunakan **Coolify VPS**.

> [!IMPORTANT]
> **Panduan Deployment Coolify**:
> - **Koneksi Git & Otomatisasi Webhook (Direkomendasikan)**: 👉 [`docs/deployment/coolify-git-webhook-guide.md`](./deployment/coolify-git-webhook-guide.md)
> - **Topologi & Konfigurasi Variabel Lingkungan**: 👉 [`docs/deployment/coolify-microservices.md`](./deployment/coolify-microservices.md)

---

## 1. Topologi Deployment Produksi

- **Platform Host**: VPS Mandiri dengan Coolify Engine (2 vCPU, 8 GB RAM, 100 GB Storage).
- **Reverse Proxy**: Traefik (bawaan Coolify) dengan otomatisasi SSL wildcard / sertifikat Let's Encrypt untuk `*.alfida.or.id`.
- **Image Registry**: GitHub Container Registry (`ghcr.io`).
- **Database Engine**: PostgreSQL 16 terpusat pada server Coolify dengan basis data terisolasi per layanan.
- **Object Storage**: MinIO S3-compatible lokal via Docker.

### Daftar Layanan & Port:

| Layanan | Subdomain Resmi | Port Kontainer | Basis Data | Image GHCR |
|---|---|---|---|---|
| **Auth** | `https://auth.alfida.or.id` | 3000 (Web), 3001 (API) | `alfida_auth` | `ghcr.io/<owner>/<repo>/auth:latest` |
| **SIMAKIN** | `https://simakin.alfida.or.id` | 3000 (Web), 3001 (API) | `alfida_simakin` | `ghcr.io/<owner>/<repo>/simakin:latest` |
| **SIMPEG** | `https://simpeg.alfida.or.id` | 3000 (Web), 3001 (API) | `alfida_simpeg` | `ghcr.io/<owner>/<repo>/simpeg:latest` |
| **SPMB** | `https://spmb.alfida.or.id` | 3000 (Web), 3001 (API) | `alfida_spmb` | `ghcr.io/<owner>/<repo>/spmb:latest` |
| **SIYAUM** | `https://siyaum.alfida.or.id` | 3000 (Web), 3001 (API) | `alfida_siyaum` | `ghcr.io/<owner>/<repo>/siyaum:latest` |
| **Monolit** | `https://sim.alfida.or.id` | 3000 (Web), 3001 (API) | `simalfida` | Menampung SIAKAD, SISKEU, SISARPRAS |

---

## 2. Otomatisasi CI/CD (GitHub Actions)

Setiap *push* ke branch `main` pada repositori akan otomatis memicu GitHub Actions ([`.github/workflows/deploy-services.yml`](../.github/workflows/deploy-services.yml)) yang menjalankan proses:
1. Menyiapkan Docker Buildx.
2. Login ke GitHub Container Registry (`ghcr.io`).
3. Membangun multi-stage build untuk setiap service yang mengalami perubahan.
4. Menerbitkan image bertag `:latest` dan `:${{ github.sha }}` ke GHCR.

---

## 3. Langkah Rilis Cepat di Dashboard Coolify

1. **Persiapan Database Terpusat**:
   Eksekusi pembuatan basis data di terminal PostgreSQL Coolify:
   ```sql
   CREATE DATABASE alfida_auth;
   CREATE DATABASE alfida_simakin;
   CREATE DATABASE alfida_simpeg;
   CREATE DATABASE alfida_siyaum;
   CREATE DATABASE alfida_spmb;
   ```

2. **Migrasi Skema Tabel (Prisma)**:
   Jalankan pendorongan skema dari repositori lokal atau runner:
   ```bash
   pnpm --filter auth-api exec prisma db push
   pnpm --filter @alfida/simakin-api exec prisma db push
   pnpm --filter simpeg-api exec prisma db push
   pnpm --filter siyaum-api exec prisma db push
   pnpm --filter spmb-api exec prisma db push
   ```

3. **Buat Application di Coolify**:
   - **Opsi A (Rekomendasi - Git Source + Webhook)**:
     - Pilih tipe: **Public/Private Git Repository**.
     - Base Directory: `/` (Root Monorepo).
     - Dockerfile Location: `/services/<service>/Dockerfile` (atau `/Dockerfile` untuk monolit).
     - Port: `3000`.
     - Watch Paths: Tentukan path sesuai modul (misal: `services/spmb/**\npackages/**\npnpm-lock.yaml`).
     - Panduan detail: [`docs/deployment/coolify-git-webhook-guide.md`](./deployment/coolify-git-webhook-guide.md).
   - **Opsi B (Docker Image via GHCR)**:
     - Pilih tipe: **Docker Image**.
     - Masukkan tag image dari GHCR (contoh: `ghcr.io/<owner>/<repo>/spmb:latest`).
     - Port: `3000`.
   - Tentukan FQDN domain (contoh: `https://spmb.alfida.or.id`).
   - Masukkan variabel lingkungan standar (`NODE_ENV=production`, `DATABASE_URL=...`, `JWT_SECRET=...`, `COOKIE_DOMAIN=.alfida.or.id`).

4. **Deploy & Verifikasi**:
   Klik tombol **Deploy** di Coolify. Traefik akan otomatis mengarahkan trafik HTTPS ke kontainer.
