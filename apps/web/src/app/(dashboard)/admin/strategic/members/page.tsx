'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { getMyMembers, addDepartmentMember, removeDepartmentMember, getStrategicUsers, getDepartments } from '@/actions/strategic';
import { Modal } from '@/components/ui/modal';

export default function DepartmentMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Data for modal
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyMembers();
      setMembers(res);
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil data anggota');
    }
    setLoading(false);
  };

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    if (users.length === 0) {
      try {
        const [usersRes, deptsRes] = await Promise.all([
          getStrategicUsers(),
          getDepartments()
        ]);
        setUsers(usersRes.filter((u: any) => u.isActive));
        setDepartments(deptsRes);
        if (deptsRes.length > 0) {
          setSelectedDepartment(deptsRes[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser || !selectedDepartment) return alert('Pilih user dan bidang');
    setIsSubmitting(true);
    try {
      await addDepartmentMember(selectedDepartment, { userId: selectedUser, role });
      await fetchData();
      setIsAddModalOpen(false);
      setSelectedUser('');
      setRole('');
    } catch (e: any) {
      alert(e.message || 'Gagal menambahkan anggota');
    }
    setIsSubmitting(false);
  };

  const handleRemove = async (departmentId: string, userId: string) => {
    if (!confirm('Hapus anggota ini?')) return;
    try {
      await removeDepartmentMember(departmentId, userId);
      await fetchData();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus anggota');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Anggota Bidang / Departemen</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Kelola daftar karyawan dan staf yang ditugaskan di bawah bidang Anda.</p>
        </div>
        <button onClick={handleOpenAddModal} className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm hover:bg-tertiary/90 transition-all font-medium flex items-center gap-2 whitespace-nowrap">
          <Icon name="person_add" className="text-xl" />
          Tambah Anggota
        </button>
      </div>

      <div className="bg-surface border border-border rounded-md p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider font-semibold text-gray-500">
                  <th className="pb-4 pl-4">Nama Lengkap</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Bidang</th>
                  <th className="pb-4">Peran (Role)</th>
                  <th className="pb-4 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                {members.map((member: any) => (
                  <tr key={member.id} className="border-b border-border/50 hover:bg-neutral transition-colors group">
                    <td className="py-4 pl-4 font-semibold text-primary">{member.user?.fullName || member.user?.username}</td>
                    <td className="py-4 text-gray-500">{member.user?.email}</td>
                    <td className="py-4 text-gray-500">{member.department?.name}</td>
                    <td className="py-4 capitalize">
                      <span className="px-2.5 py-1 bg-neutral text-gray-600 rounded-md text-xs font-medium border border-border inline-flex items-center gap-1.5">
                        <Icon name="badge" className="text-sm" />
                        {member.role || '-'}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button onClick={() => handleRemove(member.departmentId, member.userId)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold hover:underline flex items-center justify-end gap-1 ml-auto">
                        <Icon name="delete" className="text-sm" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Belum ada anggota yang terdaftar di bidang Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Anggota Bidang">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bidang / Departemen</label>
            <select className="w-full p-2 border border-border rounded" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pengguna</label>
            <select className="w-full p-2 border border-border rounded" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">-- Pilih --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName || u.username} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peran / Jabatan (Opsional)</label>
            <input type="text" className="w-full p-2 border border-border rounded" value={role} onChange={e => setRole(e.target.value)} placeholder="Contoh: Staf, Koordinator..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-border rounded hover:bg-neutral transition-colors">Batal</button>
          <button onClick={handleAddMember} disabled={isSubmitting} className="px-4 py-2 bg-tertiary text-on-tertiary rounded hover:bg-tertiary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
