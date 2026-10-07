import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { prisma } from "@/lib/prisma";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
  href?: string;
}

function ModuleCard({
  title,
  subtitle,
  icon,
  active = false,
  href = "#",
}: ModuleCardProps) {
  return (
    <Card
      className={`flex flex-col justify-between p-6 transition-all ${
        active
          ? "border-tertiary shadow-sm hover:shadow-md"
          : "opacity-75 bg-neutral/50 border-border"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              active ? "bg-teal-50 text-tertiary" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Icon name={icon} className="text-2xl" />
          </div>
          {active ? (
            <Badge variant="teal">AKTIF</Badge>
          ) : (
            <Badge variant="gray">Segera Hadir</Badge>
          )}
        </div>
        <h3 className="font-heading font-bold text-lg text-primary mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-6">{subtitle}</p>
      </div>

      <div>
        {active ? (
          <Link
            href={href}
            className="w-full py-2.5 px-4 bg-tertiary text-on-tertiary rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-colors"
          >
            <span>Buka Modul</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-200 text-gray-400 rounded text-xs font-semibold cursor-not-allowed"
          >
            Belum Tersedia
          </button>
        )}
      </div>
    </Card>
  );
}

export default async function ModulesPage() {
  const user = await getCurrentUser();
  const roles = user?.roles || [];
  
  // Default routing
  const isSuperAdmin = roles.some((r: any) => r.role === "super_admin");
  const isAdminUnit = roles.some((r: any) => r.role === "admin_unit" || r.role === "admin_unit_nondik" || r.role === "tim_ppdb");
  const isKaryawan = roles.some((r: any) => r.role === "karyawan");
  const isGuru = roles.some((r: any) => r.role === "guru");
  const isMurobbi = roles.some((r: any) => r.role === "murobbi");
  const isPengawas = roles.some((r: any) => r.role === "pengawas_yayasan");

  const isDepartmentAdmin = roles.some((r: any) => r.role === "admin_bidang");
  const isBiroAdmin = roles.some((r: any) => r.role === "admin_biro");

  const ppdbHref = isSuperAdmin ? "/admin/units" : (isAdminUnit ? "/unit/dashboard" : "/parent/dashboard");
  const akademikHref = isSuperAdmin ? "/admin/academic" : (isGuru ? "/teacher/schedules" : "/parent/dashboard");
  const bpiHref = isSuperAdmin ? "/admin/bpi/liqo" : (isMurobbi ? "/murobbi/liqo" : "/staff/liqo");
  const strategicHref = (isSuperAdmin || isDepartmentAdmin || isBiroAdmin) ? "/admin/strategic" : "/execution/action-items";
  const supervisorHref = "/supervisor";
  // Cek apakah user adalah admin kesekretariatan atau SDM
  const userDepts = user ? await prisma.departmentAdmin.findMany({ 
    where: { userId: user.id }, 
    include: { department: true } 
  }) : [];
  const isKesekretariatan = userDepts.some((d: any) => d.department.name.toLowerCase().includes("kesekretariatan"));
  const isAdminKepegawaian = userDepts.some((d: any) => d.department.name.toLowerCase().includes("sdm") || d.department.name.toLowerCase().includes("kepegawaian"));
  const isAdminPendidikan = userDepts.some((d: any) => d.department.name.toLowerCase().includes("pendidikan"));
  const isAdminBpi = userDepts.some((d: any) => d.department.name.toLowerCase().includes("bpi") || d.department.name.toLowerCase().includes("bina pribadi"));
  const isSarprasAdmin = isSuperAdmin || userDepts.some((d: any) => d.department.name.toLowerCase().includes("sarpras") || d.department.name.toLowerCase().includes("sarana") || d.department.name.toLowerCase().includes("kerumahtanggaan"));

  const isParent = roles.some((r: any) => r.role === "orang_tua");
  const isOnlyParent = isParent && !isSuperAdmin && !isAdminUnit && !isKaryawan && !isGuru && !isAdminKepegawaian && !isMurobbi && !isAdminPendidikan && !isSarprasAdmin;
  
  const isObserver = roles.some((r: any) => r.role === "observer");
  const isTimPpdb = roles.some((r: any) => r.role === "tim_ppdb");
  const showPpdb = isSuperAdmin || isAdminUnit || isTimPpdb || isObserver || isParent;



  const hrAdminHref = "/admin/hr/dashboard";
  const staffHref = "/staff/attendance";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Pilih Modul Sistem Informasi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang, {user?.name || "Pengguna"}. Pilih modul yang ingin Anda akses sesuai dengan peranan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showPpdb && (
          <ModuleCard
            title="SPMB (Seleksi Penerimaan Murid Baru)"
            subtitle="Pendaftaran calon siswa baru, verifikasi berkas, observasi, dan seleksi."
            icon="school"
            active={true}
            href={ppdbHref}
          />
        )}

        {(isSuperAdmin || isAdminUnit || isGuru || isParent) && (
          <ModuleCard
            title="Modul Akademik"
            subtitle="Pengelolaan data siswa, kelas, jadwal pelajaran, nilai, dan rapor."
            icon="menu_book"
            active={true}
            href={akademikHref}
          />
        )}

        {(isSuperAdmin || isAdminPendidikan) && (
          <ModuleCard
            title="Monitoring Kesiswaan"
            subtitle="Dasbor rekapan akademik, kehadiran, pelanggaran, dan karakter BPI siswa tingkat Yayasan."
            icon="admin_panel_settings"
            active={true}
            href={supervisorHref}
          />
        )}

        {!isOnlyParent && (
          <>
            {(isSuperAdmin || isAdminKepegawaian) && (
              <ModuleCard
                title="Manajemen Kepegawaian (HR)"
                subtitle="Dasbor SDM, rekap presensi, approval cuti, dan distribusi pegawai."
                icon="admin_panel_settings"
                active={true}
                href={hrAdminHref}
              />
            )}

            {(isKaryawan || isGuru || isSuperAdmin || isAdminKepegawaian) && (
              <ModuleCard
                title="Layanan Pegawai"
                subtitle="Presensi harian, pengajuan cuti, mutabaah, dan profil pegawai."
                icon="badge"
                active={true}
                href={staffHref}
              />
            )}
            
            {(!isKesekretariatan && (isSuperAdmin || isAdminBpi || isMurobbi)) && (
              <ModuleCard
                title="Bina Pribadi Islami (BPI)"
                subtitle="Manajemen kelompok mentoring (Liqo), Murobbi, dan rekap amal yaumi."
                icon="groups"
                active={true}
                href={bpiHref}
              />
            )}
            
            {(isSuperAdmin || isDepartmentAdmin || isBiroAdmin) && (
              <ModuleCard
                title="Perencanaan & Monitoring"
                subtitle="Monitoring program kerja, indikator kinerja (KPI), isu, dan meeting."
                icon="monitoring"
                active={true}
                href={strategicHref}
              />
            )}

            {isSarprasAdmin && (
              <ModuleCard
                title="Inventaris & Sarpras"
                subtitle="Pencatatan aset, sarana prasarana, inventarisasi barang, dan fasilitas."
                icon="inventory_2"
                active={true}
                href="/admin/sarpras/inventory"
              />
            )}

            {isKesekretariatan && (
              <ModuleCard
                title="Layanan Kesekretariatan"
                subtitle="Buku tamu online, manajemen persuratan, dan peminjaman fasilitas ruang rapat."
                icon="home_repair_service"
                active={true}
                href="/admin/secretariat/dashboard"
              />
            )}

            {isPengawas && !isSuperAdmin && (
              <>
                <ModuleCard
                  title="Dashboard Eksekutif"
                  subtitle="Ringkasan kesehatan strategis dan pencapaian kinerja Yayasan Alfida."
                  icon="monitoring"
                  active={true}
                  href="/bph-dashboard"
                />
                <ModuleCard
                  title="Laporan KPI per Bidang"
                  subtitle="Akses matriks sasaran, indikator, dan capaian program kerja per departemen."
                  icon="domain"
                  active={true}
                  href="/pengawas/departments"
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
        <Icon name="info" className="text-base text-blue-600 flex-shrink-0" />
        <span>
          Akses terhadap modul-modul di atas dibatasi secara otomatis berdasarkan peranan (role) akun Anda.
        </span>
      </div>
    </div>
  );
}
