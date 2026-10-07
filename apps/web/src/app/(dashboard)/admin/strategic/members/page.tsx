'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { getMyMembers, addDepartmentMember, removeDepartmentMember, getStrategicUsers, getDepartments, getMyBiros, createSubDepartment } from '@/actions/strategic';
import { useAuth } from '@/components/providers/auth-provider';
import { Modal } from '@/components/ui/modal';
import { NotificationModal } from '@/components/ui/notification-modal';
import { Button } from '@/components/ui/button';

export default function DepartmentMembersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.roles?.some((r: any) => r.role === 'super_admin');

  const [activeTab, setActiveTab] = useState<'anggota' | 'biro'>('anggota');
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  // Members Data
  const [members, setMembers] = useState<any[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [memberRole, setMemberRole] = useState('');
  
  // Biros Data
  const [biros, setBiros] = useState<any[]>([]);
  const [isAddBiroModalOpen, setIsAddBiroModalOpen] = useState(false);
  const [newBiro, setNewBiro] = useState({ name: '', description: '', parentId: '', adminUserId: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'anggota') {
        const res = await getMyMembers();
        setMembers(res);
        if (res.length > 0 && !selectedDepartment) {
          setSelectedDepartment(res[0].departmentId);
        }
      } else {
        const res = await getMyBiros();
        setBiros(res);
        if (res.length > 0 && !newBiro.parentId) {
          setNewBiro(prev => ({ ...prev, parentId: res[0].parentId }));
        }
      }
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: e?.message || 'Gagal mengambil data', type: 'error' });
    }
    setLoading(false);
  };

  const handleOpenAddMemberModal = async () => {
    setIsAddMemberModalOpen(true);
    try {
      const [u, d] = await Promise.all([
        users.length === 0 ? getStrategicUsers() : Promise.resolve(users),
        departments.length === 0 ? getDepartments() : Promise.resolve(departments)
      ]);
      setUsers(u);
      setDepartments(d);
      
      // Auto-set department
      if (!selectedDepartment) {
        if (members.length > 0) {
          setSelectedDepartment(members[0].departmentId);
        } else if (d.length > 0) {
          setSelectedDepartment(d[0].id);
        }
      }
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: 'Gagal memuat data pengguna', type: 'error' });
    }
  };

  const handleOpenAddBiroModal = async () => {
    setIsAddBiroModalOpen(true);
    try {
      const [u, d] = await Promise.all([
        users.length === 0 ? getStrategicUsers() : Promise.resolve(users),
        departments.length === 0 ? getDepartments() : Promise.resolve(departments)
      ]);
      setUsers(u);
      setDepartments(d);

      // Auto-set parentId
      if (!newBiro.parentId) {
        if (members.length > 0) {
          setNewBiro(prev => ({ ...prev, parentId: members[0].departmentId }));
        } else if (d.length > 0) {
          setNewBiro(prev => ({ ...prev, parentId: d[0].id }));
        }
      }
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: 'Gagal memuat data formulir', type: 'error' });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptId = selectedDepartment || (members.length > 0 ? members[0].departmentId : (departments[0]?.id || 'my'));
    if (!selectedUser || !deptId) return;
    setIsSubmitting(true);
    try {
      await addDepartmentMember(deptId, { userId: selectedUser, role: memberRole });
      setIsAddMemberModalOpen(false);
      setSelectedUser('');
      setMemberRole('');
      fetchData();
      setNotif({ isOpen: true, title: 'Sukses', message: 'Anggota berhasil ditambahkan', type: 'success' });
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: e?.message || 'Gagal menambahkan anggota', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleAddBiro = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentId = newBiro.parentId || (members.length > 0 ? members[0].departmentId : departments[0]?.id);
    if (!newBiro.name || !parentId) return;
    setIsSubmitting(true);
    try {
      await createSubDepartment({ ...newBiro, parentId });
      setIsAddBiroModalOpen(false);
      setNewBiro({ name: '', description: '', parentId, adminUserId: '' });
      fetchData();
      setNotif({ isOpen: true, title: 'Sukses', message: 'Biro berhasil dibuat', type: 'success' });
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: e?.message || 'Gagal membuat biro', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleRemoveMember = async (departmentId: string, userId: string) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    try {
      await removeDepartmentMember(departmentId, userId);
      fetchData();
      setNotif({ isOpen: true, title: 'Sukses', message: 'Anggota berhasil dihapus', type: 'success' });
    } catch (e: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: e?.message || 'Gagal menghapus anggota', type: 'error' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Struktur & Anggota Bidang</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Kelola daftar biro serta anggota/staf yang berada di bawah bidang Anda.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-border">
        <button 
          onClick={() => setActiveTab('anggota')} 
          className={`pb-2 px-2 text-sm font-medium transition-colors ${activeTab === 'anggota' ? 'border-b-2 border-secondary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Daftar Anggota
        </button>
        <button 
          onClick={() => setActiveTab('biro')} 
          className={`pb-2 px-2 text-sm font-medium transition-colors ${activeTab === 'biro' ? 'border-b-2 border-secondary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Struktur Biro (Sub)
        </button>
      </div>

      <div className="bg-surface border border-border rounded-md p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
          </div>
        ) : activeTab === 'anggota' ? (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleOpenAddMemberModal} variant="primary" className="flex items-center gap-2">
                <Icon name="person_add" /> Tambah Anggota
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="p-3 text-sm font-semibold text-gray-700">Nama</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Departemen/Bidang</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Role Spesifik</th>
                    <th className="p-3 text-sm font-semibold text-gray-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m: any) => (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium text-primary">{m.user?.fullName || m.user?.username}</p>
                        <p className="text-xs text-gray-500">{m.user?.email}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{m.department?.name}</td>
                      <td className="p-3 text-sm text-gray-700">
                        {m.role ? <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{m.role}</span> : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleRemoveMember(m.departmentId, m.userId)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus dari bidang">
                          <Icon name="delete" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 text-sm italic">Belum ada anggota di bidang ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleOpenAddBiroModal} variant="primary" className="flex items-center gap-2">
                <Icon name="domain_add" /> Tambah Biro
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="p-3 text-sm font-semibold text-gray-700">Nama Biro</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Deskripsi</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">PIC / Admin Biro</th>
                  </tr>
                </thead>
                <tbody>
                  {biros.map((b: any) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-medium text-primary">{b.name}</td>
                      <td className="p-3 text-sm text-gray-600">{b.description || '-'}</td>
                      <td className="p-3 text-sm text-gray-700">
                        {b.admins?.length > 0 ? (
                          b.admins.map((a:any) => <div key={a.id} className="text-sm">{a.user?.fullName}</div>)
                        ) : (
                          <span className="text-gray-400 italic">Belum ada PIC</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {biros.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500 text-sm italic">Belum ada biro di bawah bidang ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Tambah Anggota ke Bidang">
        <form onSubmit={handleAddMember} className="p-5 space-y-4">
          {isSuperAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Bidang (Tujuan)</label>
              <select className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} required>
                <option value="">-- Pilih --</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <Icon name="info" className="text-blue-600 text-sm" />
              <span>
                Anggota akan secara otomatis ditambahkan ke bidang: <strong>{departments.find((d: any) => d.id === selectedDepartment)?.name || members[0]?.department?.name || "Bidang Anda"}</strong>
              </span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pengguna</label>
            <select className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required>
              <option value="">-- Cari Pengguna --</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Jabatan Spesifik (Opsional)</label>
            <input type="text" className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={memberRole} onChange={e => setMemberRole(e.target.value)} placeholder="Contoh: Staf Teknis..." />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddMemberModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddBiroModalOpen} onClose={() => setIsAddBiroModalOpen(false)} title="Tambah Biro Baru">
        <form onSubmit={handleAddBiro} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Biro</label>
            <input type="text" className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={newBiro.name} onChange={e => setNewBiro({...newBiro, name: e.target.value})} required placeholder="Contoh: Biro SDM" />
          </div>
          {isSuperAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Di Bawah Bidang</label>
              <select className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={newBiro.parentId} onChange={e => setNewBiro({...newBiro, parentId: e.target.value})} required>
                <option value="">-- Pilih Induk Bidang --</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <Icon name="info" className="text-blue-600 text-sm" />
              <span>
                Biro baru akan otomatis terdaftar di bawah bidang: <strong>{departments.find((d: any) => d.id === newBiro.parentId)?.name || members[0]?.department?.name || "Bidang Anda"}</strong>
              </span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
            <textarea className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={newBiro.description} onChange={e => setNewBiro({...newBiro, description: e.target.value})} placeholder="Deskripsi singkat tentang biro ini..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIC / Admin Biro</label>
            <select className="w-full p-2 border border-border rounded focus:ring-1 focus:ring-tertiary" value={newBiro.adminUserId} onChange={e => setNewBiro({...newBiro, adminUserId: e.target.value})}>
              <option value="">-- Pilih PIC (Bisa dikosongkan) --</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">PIC akan secara otomatis ditugaskan sebagai Admin Biro untuk biro ini.</p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddBiroModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <NotificationModal 
        isOpen={notif.isOpen} 
        onClose={() => setNotif({ ...notif, isOpen: false })} 
        title={notif.title} 
        message={notif.message} 
        type={notif.type} 
      />
    </div>
  );
}
