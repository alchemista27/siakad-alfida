export default function StrategicDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary mb-2">SMART Execution Control Center</h1>
        <p className="text-primary font-body text-base">Pusat kendali kinerja strategis BPH Yayasan Alfida.</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold font-heading mb-4 border-b pb-2">Master Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/strategic/departments" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Struktur Bidang & PIC</h3>
            <p className="mt-2 text-sm text-gray-500">Kelola hierarki organisasi yayasan, biro, dan unit.</p>
          </a>
          <a href="/admin/strategic/programs" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Program Sekolah (RKT/RKJM)</h3>
            <p className="mt-2 text-sm text-gray-500">Pantau dan kelola program kerja strategis.</p>
          </a>
          <a href="/admin/strategic/kpis" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">KPI & Target Kinerja</h3>
            <p className="mt-2 text-sm text-gray-500">Kelola Indikator Kinerja Utama (KPI) setiap program.</p>
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold font-heading mb-4 border-b pb-2">Eksekusi & Operasional</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <a href="/admin/strategic/milestones" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Milestones</h3>
            <p className="mt-2 text-sm text-gray-500">Pembagian fase program.</p>
          </a>
          <a href="/admin/strategic/tasks" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Delegasi Tugas</h3>
            <p className="mt-2 text-sm text-gray-500">Pendelegasian & pemantauan tugas.</p>
          </a>
          <a href="/admin/strategic/logs" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Log Realisasi</h3>
            <p className="mt-2 text-sm text-gray-500">Catatan harian/mingguan.</p>
          </a>
          <a href="/admin/strategic/evidence" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Evidence Register</h3>
            <p className="mt-2 text-sm text-gray-500">Unggah bukti dokumen & Cloudinary.</p>
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold font-heading mb-4 border-b pb-2">Evaluasi & Risiko</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/admin/strategic/issues" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Manajemen Risiko (Risk/Issue)</h3>
            <p className="mt-2 text-sm text-gray-500">Pelaporan kendala, masalah operasional, dan eskalasi risiko secara sistematis.</p>
          </a>
          <a href="/admin/strategic/meetings" className="block p-6 bg-surface border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold font-heading">Notulensi & Rapat Pimpinan</h3>
            <p className="mt-2 text-sm text-gray-500">Pencatatan notulensi rapat, hasil keputusan, dan instruksi tindak lanjut.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
