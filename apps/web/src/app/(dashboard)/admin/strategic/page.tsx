import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { prisma } from "@/lib/prisma";

export default async function StrategicDashboard() {
  const user = await requireRole([UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_biro, UserRole.pengawas_yayasan]);
  const isSuperAdmin = user.roles?.some((r) => r.role === UserRole.super_admin);
  const isAdminBiro = user.roles?.some((r) => r.role === UserRole.admin_biro);

  let userDeptId = "";
  if (!isSuperAdmin) {
    const deptAdmin = await prisma.departmentAdmin.findFirst({ where: { userId: user.id } });
    if (deptAdmin) userDeptId = deptAdmin.departmentId;
  }

  const masterData = [];

  if (isSuperAdmin) {
    masterData.push({ title: "Struktur Bidang & PIC", desc: "Kelola hierarki organisasi yayasan, biro, dan unit.", href: "/admin/strategic/departments", icon: "account_tree" });
  } else if (!isAdminBiro) {
    masterData.push({ title: "Anggota Bidang", desc: "Kelola daftar staf/guru yang tergabung di bidang Anda.", href: "/admin/strategic/members", icon: "group_add" });
  }

  masterData.push(
    { title: "Program Kerja Bidang/Departemen", desc: "Pantau dan kelola program kerja strategis.", href: "/admin/strategic/programs", icon: "assignment" },
    { title: "KPI & Target Kinerja", desc: "Kelola Indikator Kinerja Utama (KPI) setiap program.", href: "/admin/strategic/kpis", icon: "track_changes" }
  );

  const execution = [
    { title: "Milestones", desc: "Pembagian fase program.", href: "/admin/strategic/milestones", icon: "flag" },
    { title: "Delegasi Tugas", desc: "Pendelegasian & pemantauan tugas.", href: "/admin/strategic/tasks", icon: "task" },
    { title: "Log Realisasi", desc: "Catatan harian/mingguan.", href: "/admin/strategic/logs", icon: "menu_book" },
    { title: "Bukti Kinerja", desc: "Unggah bukti dokumen pencapaian kinerja.", href: "/admin/strategic/evidence", icon: "cloud_upload" },
  ];

  const evaluation = [
    { title: "Manajemen Risiko", desc: "Pelaporan kendala, masalah operasional, dan eskalasi risiko.", href: "/admin/strategic/issues", icon: "warning" },
    { title: "Notulensi & Rapat", desc: "Pencatatan notulensi rapat dan instruksi tindak lanjut.", href: "/admin/strategic/meetings", icon: "groups" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10 pb-6 border-b border-border">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-tertiary mb-4">
          <Icon name="monitoring" className="text-2xl" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-primary mb-2">Pusat Kendali Perencanaan & Monitoring Alfida</h1>
        <p className="text-gray-500 font-body text-sm max-w-2xl">Pusat kendali perencanaan dan monitoring BPH Yayasan Alfida. Pantau pelaksanaan program kerja, realisasi KPI, hingga manajemen rapat secara terintegrasi.</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold font-heading mb-4 text-primary flex items-center gap-2">
          <Icon name="database" className="text-gray-400 text-lg" />
          Master Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {masterData.map((item, i) => (
            <Link key={i} href={item.href} className="group block p-5 bg-surface border border-border rounded-lg hover:border-tertiary transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral flex items-center justify-center text-gray-500 group-hover:bg-tertiary group-hover:text-white transition-colors">
                  <Icon name={item.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-primary group-hover:text-tertiary transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold font-heading mb-4 text-primary flex items-center gap-2">
          <Icon name="rocket_launch" className="text-gray-400 text-lg" />
          Perencanaan & Monitoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {execution.map((item, i) => (
            <Link key={i} href={item.href} className="group block p-5 bg-surface border border-border rounded-lg hover:border-tertiary transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral flex items-center justify-center text-gray-500 group-hover:bg-tertiary group-hover:text-white transition-colors">
                  <Icon name={item.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-primary group-hover:text-tertiary transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold font-heading mb-4 text-primary flex items-center gap-2">
          <Icon name="gavel" className="text-gray-400 text-lg" />
          Evaluasi & Risiko
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.map((item, i) => (
            <Link key={i} href={item.href} className="group block p-5 bg-surface border border-border rounded-lg hover:border-tertiary transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral flex items-center justify-center text-gray-500 group-hover:bg-tertiary group-hover:text-white transition-colors">
                  <Icon name={item.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-primary group-hover:text-tertiary transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold font-heading mb-4 text-primary flex items-center gap-2">
          <Icon name="download" className="text-gray-400 text-lg" />
          Pelaporan & Ekspor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href={`http://187.127.113.61:3001/strategic/kpis/export/excel?departmentId=${userDeptId}`} target="_blank" rel="noopener noreferrer" className="group block p-5 bg-surface border border-border rounded-lg hover:border-green-600 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Icon name="table_view" className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-heading text-primary group-hover:text-green-700 transition-colors">Laporan Excel KPI</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">Ekspor capaian indikator, sasaran, dan matriks ke format spreadsheet (XLSX).</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
