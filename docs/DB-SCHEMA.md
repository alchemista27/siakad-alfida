# Skema Database (DB Schema)

## SIM-Alfida: Sistem Informasi Manajemen Terpadu Yayasan Alfida

| Atribut         | Detail                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| **Versi**       | 1.0.0-microservices                                                    |
| **Tanggal**     | 13 Oktober 2026                                                        |
| **Engine**      | PostgreSQL 16 Terpusat (Coolify VPS)                                   |
| **ORM**         | Prisma 6 (Multi-output isolated client per service)                    |
| **Referensi**   | PRD.md, TDD.md, coolify-microservices.md                               |

---

## 1. Arsitektur Multi-Database Terpusat

Untuk menjaga independensi siklus hidup data sekaligus memaksimalkan efisiensi memori VPS Coolify (8 GB RAM), SIM-Alfida mengadopsi **satu cluster database PostgreSQL terpusat** dengan **database logis terpisah per domain microservice**.

```mermaid
graph TD
    PGCluster[("Cluster PostgreSQL Terpusat (Port 5432)")]
    PGCluster --> DBAuth["alfida_auth<br/>(Better Auth SSO & RBAC)"]
    PGCluster --> DBSimakin["alfida_simakin<br/>(Strategic Goals & KPI)"]
    PGCluster --> DBSimpeg["alfida_simpeg<br/>(Pegawai, GPS, Cuti)"]
    PGCluster --> DBSpmb["alfida_spmb<br/>(Pendaftaran, Observasi, Klaim WA)"]
    PGCluster --> DBSiyaum["alfida_siyaum<br/>(YMQ, Tilawah, Halaqah)"]
    PGCluster --> DBLegacy["simalfida<br/>(SIAKAD, SPP, Sarpras Transisi)"]
```

---

## 2. Skema Database per Layanan

### 2.1 Database Service Auth (`alfida_auth`)

Database ini menjadi sumber identitas tunggal bagi seluruh pemangku kepentingan yayasan (guru, karyawan, pimpinan, pengurus, orang tua santri).

#### Diagram ERD (Auth)
```mermaid
erDiagram
    users ||--o{ sessions : "memiliki"
    users ||--o{ accounts : "terhubung"
    users ||--o{ user_roles : "memiliki peran"
    verifications {
        string id PK
        string identifier
        string value
        timestamptz expiresAt
    }
    users {
        uuid id PK
        string name
        string email UK
        boolean emailVerified
        string image
        string phone
        timestamptz createdAt
        timestamptz updatedAt
    }
    sessions {
        uuid id PK
        uuid userId FK
        string token UK
        timestamptz expiresAt
        string ipAddress
        string userAgent
    }
    accounts {
        uuid id PK
        uuid userId FK
        string accountId
        string providerId
        string password
    }
    user_roles {
        uuid id PK
        uuid userId FK
        string role
        uuid unitId
        timestamptz createdAt
    }
```

---

### 2.2 Database Service SPMB (`alfida_spmb`)

Database khusus penerimaan peserta didik baru yang mencakup jalur pendaftaran online mandiri, entri offline panitia di sekolah, impor batch CSV, undangan klaim WhatsApp, serta seleksi observasi.

#### Diagram ERD (SPMB)
```mermaid
erDiagram
    admission_periods ||--o{ registrations : "menaungi"
    admission_periods ||--o{ observation_schedules : "memiliki"
    users ||--o{ registrations : "wali_terkait"
    users ||--o{ observation_results : "penilai"

    registrations ||--o| payments : "pembayaran"
    registrations ||--o| student_data : "biodata_siswa"
    registrations ||--o{ parent_data : "data_orang_tua"
    registrations ||--o{ documents : "berkas_digital"
    registrations ||--o| observation_bookings : "booking_slot"
    registrations ||--o| observation_results : "nilai_observasi"
    registrations ||--o{ registration_events : "audit_log"

    observation_schedules ||--o{ observation_bookings : "memiliki"

    admission_periods {
        uuid id PK
        uuid unit_id
        string unit_name
        string unit_slug
        string label
        boolean is_open
        int quota
        decimal fee
        string bank_name
        string bank_number
        string bank_holder
    }

    registrations {
        uuid id PK
        string registration_number UK
        uuid period_id FK
        enum source "online | offline"
        string external_ref
        enum status
        uuid parent_id FK
        string guardian_name
        string guardian_phone
        string guardian_email
        string invite_token UK
        timestamptz invite_expires_at
        timestamptz claimed_at
        enum handoff_status "not_ready | pending | done | failed"
        timestamptz handoff_at
        text handoff_error
    }

    student_data {
        uuid id PK
        uuid registration_id FK,UK
        string full_name
        string nickname
        enum gender "male | female"
        string birth_place
        date birth_date
        string nisn
        text address
    }

    parent_data {
        uuid id PK
        uuid registration_id FK
        enum type "father | mother | guardian"
        string full_name
        string nik
        string phone
        string education
        string occupation
        string income_range
    }

    payments {
        uuid id PK
        uuid registration_id FK,UK
        decimal amount
        text proof_url
        enum method "transfer_proof | offline"
        enum status "pending | uploaded | verified | rejected"
        timestamptz verified_at
    }

    observation_schedules {
        uuid id PK
        uuid period_id FK
        date date
        string start_time
        string end_time
        int quota
        int booked
    }

    observation_results {
        uuid id PK
        uuid registration_id FK,UK
        uuid observer_id FK
        decimal score
        text notes
        int rank
    }

    registration_events {
        uuid id PK
        uuid registration_id FK
        uuid actor_id
        enum from_status
        enum to_status
        string kind "transition | backfill | claim | handoff | import"
        text note
        timestamptz created_at
    }
```

---

### 2.3 Database Service SIMAKIN (`alfida_simakin`)

Database khusus manajemen kinerja strategis, program kerja yayasan, monitoring KPI, pelaporan berkala, dan penanganan isu.

#### Diagram ERD (SIMAKIN)
```mermaid
erDiagram
    strategic_goals ||--o{ work_programs : "mencakup"
    work_programs ||--o{ program_kpis : "memiliki_kpi"
    work_programs ||--o{ activity_reports : "dilaporkan_dalam"
    activity_reports ||--o{ action_items : "menghasilkan"
    strategic_meetings ||--o{ action_items : "menghasilkan"

    strategic_goals {
        uuid id PK
        string title
        text description
        string target_year
        string status
    }

    work_programs {
        uuid id PK
        uuid goal_id FK
        uuid department_id
        string name
        decimal budget_planned
        decimal budget_realized
        int progress_percentage
    }

    program_kpis {
        uuid id PK
        uuid program_id FK
        string kpi_code
        string metric_name
        decimal target_value
        decimal actual_value
        string unit_of_measure
        string traffic_light "green | yellow | red"
    }

    activity_reports {
        uuid id PK
        uuid program_id FK
        enum period_type "weekly | monthly"
        int month
        int year
        text achievements
        text obstacles
        text evidence_url
    }

    action_items {
        uuid id PK
        string task_title
        uuid pic_user_id
        date due_date
        enum status "open | in_progress | resolved"
    }
```

---

### 2.4 Database Service SIMPEG (`alfida_simpeg`)

Database pengelolaan sumber daya manusia, penugasan unit, presensi kehadiran berbasis GPS browser riil, dan permohonan cuti.

#### Diagram ERD (SIMPEG)
```mermaid
erDiagram
    departments ||--o{ employees : "memiliki_staf"
    positions ||--o{ employees : "ditempati"
    employees ||--o{ unit_assignments : "ditugaskan_ke"
    employees ||--o{ attendances : "mencatat"
    employees ||--o{ leave_requests : "mengajukan"

    employees {
        uuid id PK
        uuid user_id UK
        string nip UK
        string full_name
        enum gender "male | female"
        string phone
        enum employment_status "permanent | contract | honorary"
        date hire_date
    }

    unit_assignments {
        uuid id PK
        uuid employee_id FK
        uuid unit_id
        boolean is_primary
        date start_date
    }

    attendances {
        uuid id PK
        uuid employee_id FK
        uuid unit_id
        date date
        timestamptz check_in
        timestamptz check_out
        decimal check_in_lat
        decimal check_in_lng
        boolean is_valid_location
        enum status "present | late | leave | absent"
    }

    leave_requests {
        uuid id PK
        uuid employee_id FK
        enum leave_type "annual | sick | maternity | urgent"
        date start_date
        date end_date
        text reason
        enum status "pending | approved_by_lead | approved | rejected"
        uuid approved_by
    }
```

---

### 2.5 Database Service SIYAUM (`alfida_siyaum`)

Database monitoring Yaum Ma'al Quran (YMQ) bagi seluruh tenaga pendidik dan kependidikan di bawah bimbingan musyrif halaqah.

#### Diagram ERD (SIYAUM)
```mermaid
erDiagram
    musyrifs ||--o{ halaqahs : "membina"
    halaqahs ||--o{ halaqah_members : "beranggotakan"
    halaqah_members ||--o{ tilawah_records : "mencatat_setoran"

    musyrifs {
        uuid id PK
        uuid user_id UK
        string full_name
        boolean is_active
    }

    halaqahs {
        uuid id PK
        uuid musyrif_id FK
        string name
        enum category "ikhwan | akhwat"
        string schedule_day
    }

    halaqah_members {
        uuid id PK
        uuid halaqah_id FK
        uuid employee_id UK
        date joined_date
    }

    tilawah_records {
        uuid id PK
        uuid member_id FK
        date date
        int pages_read
        int juz_number
        string surah_name
        boolean verified_by_musyrif
        timestamptz verified_at
        text notes
    }
```

---

### 2.6 Database Monolit Legacy (`simalfida`)

Database utama yang menampung modul dalam masa transisi:
- **Akademik**: `academic_years`, `classes`, `subjects`, `teacher_assignments`, `grades`, `lesson_plans`, `student_enrollments`, `lhbs_reports`.
- **Keuangan SPP**: `spp_bills`, `spp_payments`, `bank_accounts`.
- **Sarpras**: `inventory_items`, `inventory_categories`, `room_bookings`.
- **Kesekretariatan**: `guestbook_entries`, `correspondences`.
- **Tabel Penampung Handoff**: `registrations`, `student_data`, `parent_data` yang di-upsert oleh SPMB API via `POST /api/internal/spmb-handoff`.

---

## 3. Konvensi Rekayasa Data

| Aspek | Standar yang Diterapkan |
|---|---|
| **Penamaan Tabel** | `snake_case` bentuk jamak (contoh: `admission_periods`, `leave_requests`). |
| **Penamaan Kolom** | `snake_case` (contoh: `registration_number`, `is_valid_location`). |
| **Kunci Utama (PK)** | UUID v4 / v7 dengan nama kolom `id`. |
| **Kunci Asing (FK)** | Format `{referenced_table_singular}_id` (contoh: `period_id`, `employee_id`). |
| **Waktu / Timestamps**| `created_at` (NOT NULL DEFAULT now() timestamptz), `updated_at` (nullable timestamptz). |
| **Mata Uang / Nilai** | `Decimal(12, 2)` untuk uang (biaya SPP, anggaran), `Decimal(5, 2)` untuk nilai/skor ujian. |
| **Enums** | Native PostgreSQL enum untuk integritas data di tingkat basis data. |
