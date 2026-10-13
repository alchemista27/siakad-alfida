# Panduan Operasional Produksi (Production SOP)

Dokumen ini berisi prosedur standar operasional (SOP) untuk rilis dan pemeliharaan lingkungan produksi **SIM-Alfida** di VPS Coolify.

---

## 1. Checklist Pra-Rilis (Pre-Deployment Checklist)

Sebelum melakukan deployment versi baru ke lingkungan produksi:

1. **Uji Kompilasi Lokal**:
   Pastikan seluruh monorepo lulus build dan typecheck:
   ```bash
   pnpm turbo run build
   pnpm turbo run typecheck
   ```
2. **Audit Variabel Lingkungan**:
   - Pastikan `JWT_SECRET` yang digunakan di seluruh microservice identik agar token SSO dapat divalidasi silang.
   - Pastikan `COOKIE_DOMAIN` diset ke `.alfida.or.id` (dengan titik di awal).
   - Pastikan `INTERNAL_SERVICE_SECRET` terpasang pada service SPMB dan Monolit Legacy untuk komunikasi handoff.
3. **Backup Database PostgreSQL**:
   Lakukan backup snapshot database di Coolify sebelum menjalankan migrasi skema tabel:
   ```bash
   pg_dump -U postgres -d <nama_database> > backup_<nama_database>_$(date +%Y%m%d).sql
   ```

---

## 2. Checklist Pasca-Rilis (Post-Deployment Verification)

Setelah kontainer aktif di Coolify:

1. **Health Check Port & HTTP**:
   - Buka `https://auth.alfida.or.id/login` dan pastikan halaman login terbuka sempurna.
   - Buka `https://spmb.alfida.or.id` dan pastikan daftar gelombang aktif muncul.
   - Buka `https://simakin.alfida.or.id` dan periksa koneksi data proker.
   - Buka `https://simpeg.alfida.or.id` dan pastikan perizinan geolokasi browser berfungsi.
2. **Verifikasi SSO Lintas Subdomain**:
   - Lakukan login di `auth.alfida.or.id`.
   - Buka tab baru ke `spmb.alfida.or.id/admin` atau `simakin.alfida.or.id`.
   - Pastikan sesi login langsung terdeteksi tanpa meminta login ulang.
3. **Pemeriksaan Penggunaan Memori Server**:
   Jalankan perintah monitoring di terminal VPS:
   ```bash
   docker stats --no-stream
   ```
   Pastikan tidak ada kontainer yang mendekati batas memori atau mengalami siklus restart (*crash loop*).

---

## 3. Prosedur Rollback Cepat

Jika ditemukan anomali kritis pada rilis terbaru:
1. Masuk ke dasbor **Coolify** -> pilih **Application**.
2. Pada kolom **Docker Image**, ubah tag `:latest` menjadi tag SHA commit sebelumnya (contoh: `ghcr.io/<owner>/<repo>/spmb:<commit_sha_sebelumnya>`).
3. Klik **Redeploy**. Kontainer akan kembali ke versi stabil sebelumnya dalam waktu kurang dari 1 menit.
