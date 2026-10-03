'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

export default function DepartmentMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch from API: fetch('/api/strategic/departments/my-members')
    setTimeout(() => {
      setMembers([
        { id: '1', user: { fullName: 'Ahmad Faisal', email: 'ahmad@alfida.or.id' }, department: { name: 'Bidang Pendidikan' }, role: 'Staf' },
        { id: '2', user: { fullName: 'Budi Santoso', email: 'budi@alfida.or.id' }, department: { name: 'Bidang Pendidikan' }, role: 'Anggota' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Anggota Bidang / Departemen</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Kelola daftar karyawan dan staf yang ditugaskan di bawah bidang Anda.</p>
        </div>
        <button className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm hover:bg-tertiary/90 transition-all font-medium flex items-center gap-2 whitespace-nowrap">
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
                    <td className="py-4 pl-4 font-semibold text-primary">{member.user.fullName}</td>
                    <td className="py-4 text-gray-500">{member.user.email}</td>
                    <td className="py-4 text-gray-500">{member.department.name}</td>
                    <td className="py-4 capitalize">
                      <span className="px-2.5 py-1 bg-neutral text-gray-600 rounded-md text-xs font-medium border border-border inline-flex items-center gap-1.5">
                        <Icon name="badge" className="text-sm" />
                        {member.role || '-'}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold hover:underline flex items-center justify-end gap-1 ml-auto">
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
    </div>
  );
}
