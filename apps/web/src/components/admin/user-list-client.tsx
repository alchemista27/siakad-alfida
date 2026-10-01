"use client";

import { useState } from "react";
import { UserRole } from "@sim/database";
import { updateUserRoles, deleteUser, resetUserPassword } from "@/actions/users";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

const ALL_ROLES = [
  "super_admin", "admin_unit", "admin_unit_nondik", "guru", "karyawan", 
  "orang_tua", "observer", "tim_ppdb", "admin_bidang"
];

export function UserListClient({ users }: { users: any[] }) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [groupsInput, setGroupsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user: currentUser } = useAuth();

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    const res = await deleteUser(deletingUser.id);
    if (res.success) {
      setSuccessMessage(`Akun ${deletingUser.fullName} berhasil dihapus.`);
      setDeletingUser(null);
    } else {
      setErrorMessage("Gagal menghapus: " + res.error);
    }
    setDeleteLoading(false);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setSelectedRoles(user.roles?.map((r: any) => r.role) || []);
    setGroupsInput(user.groups?.join(", ") || "");
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setLoading(true);
    const groups = groupsInput.split(",").map(g => g.trim()).filter(g => g);
    const res = await updateUserRoles(editingUser.id, selectedRoles as UserRole[], groups);
    if (res.success) {
      setSuccessMessage(`Data akses ${editingUser.fullName} berhasil diperbarui.`);
      setEditingUser(null);
    } else {
      setErrorMessage("Gagal update: " + res.error);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resettingUser || !newPassword) return;
    setResetLoading(true);
    const res = await resetUserPassword(resettingUser.id, newPassword);
    if (res.success) {
      setSuccessMessage(`Password untuk ${resettingUser.fullName} berhasil diubah.`);
      setResettingUser(null);
      setNewPassword("");
      setShowResetPassword(false);
    } else {
      setErrorMessage("Gagal mereset password: " + res.error);
    }
    setResetLoading(false);
  };

  return (
    <>
      <div className="bg-surface rounded-md border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-primary">
          <thead className="bg-neutral border-b border-border text-primary">
            <tr>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Groups / Jabatan</th>
              <th className="p-4 font-semibold">Akses Sistem</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral/50">
                <td className="p-4 font-medium">{user.username || '-'}</td>
                <td className="p-4">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs opacity-70">{user.firstName} {user.lastName}</div>
                </td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.groups?.map((g: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral text-primary text-xs rounded border border-border">
                        {g}
                      </span>
                    ))}
                    {(!user.groups || user.groups.length === 0) && <span className="opacity-50">-</span>}
                  </div>
                </td>
                <td className="p-4">
                  {Array.from(new Set(user.roles?.map((r: any) => r.role) || [])).map((role: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded border border-secondary/20 mr-1">
                      {role}
                    </span>
                  ))}
                  {(!user.roles || user.roles.length === 0) && <span className="opacity-50">Default (Orang Tua)</span>}
                </td>
                <td className="p-4 flex gap-2 flex-wrap">
                  <button 
                    onClick={() => openEdit(user)}
                    className="text-tertiary hover:opacity-80 font-medium text-xs bg-transparent border border-tertiary px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => { setResettingUser(user); setNewPassword(""); setShowResetPassword(false); }}
                    className="text-primary hover:text-tertiary font-medium text-xs bg-transparent border border-border hover:border-tertiary px-3 py-1 rounded transition-colors"
                  >
                    Reset Pass
                  </button>
                  {currentUser?.id !== user.id && (
                    <button 
                      onClick={() => setDeletingUser(user)}
                      className="text-white hover:opacity-80 font-medium text-xs bg-red-600 border border-red-600 px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Edit Peran & Jabatan</h3>
              <p className="text-sm opacity-70 font-body">{editingUser.fullName} ({editingUser.email})</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-2 font-body tracking-wide">PERAN (AKSES SISTEM)</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-border rounded bg-neutral/50">
                  {ALL_ROLES.map(role => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedRoles(selectedRoles.filter(r => r !== role));
                          else setSelectedRoles([...selectedRoles, role]);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                          isSelected 
                            ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm' 
                            : 'bg-surface text-primary border-border hover:bg-neutral'
                        }`}
                      >
                        {role.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-2 font-body tracking-wide">GROUPS / JABATAN</label>
                <input 
                  type="text"
                  value={groupsInput}
                  onChange={e => setGroupsInput(e.target.value)}
                  className="w-full bg-surface text-primary border-border rounded px-[14px] py-[10px] shadow-sm focus:border-tertiary focus:ring-1 focus:ring-tertiary text-sm"
                  placeholder="e.g. Guru Kelas, Wakil Kepala"
                />
              </div>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
              >
                Batal
              </button>
              <button 
                onClick={saveEdit}
                disabled={loading}
                className="px-[20px] py-[12px] text-sm font-medium text-on-tertiary bg-tertiary hover:opacity-90 rounded disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Konfirmasi Hapus</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm font-body text-primary">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold">{deletingUser.fullName}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setDeletingUser(null)}
                className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-[20px] py-[12px] text-sm font-medium text-white bg-red-600 hover:opacity-90 rounded disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resettingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden border border-border">
            <div className="p-6 border-b border-border bg-neutral/30">
              <h3 className="text-lg font-bold text-primary font-heading flex items-center gap-2">
                <Icon name="key" /> Reset Password
              </h3>
              <p className="text-sm opacity-70 font-body mt-1">
                Ganti password untuk akun <span className="font-bold">{resettingUser.fullName}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="relative w-full">
                <Input
                  label="Password Baru"
                  type={showResetPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 text-sm"
                >
                  <Icon name={showResetPassword ? "visibility_off" : "visibility"} className="text-lg" />
                </button>
              </div>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3 border-t border-border">
              <button 
                onClick={() => { setResettingUser(null); setShowResetPassword(false); }}
                className="px-[20px] py-[12px] text-sm font-medium text-primary hover:text-tertiary bg-transparent rounded hover:bg-black/5 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleResetPassword}
                disabled={resetLoading || !newPassword}
                className="px-[20px] py-[12px] text-sm font-medium text-on-tertiary bg-tertiary hover:opacity-90 rounded disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {resetLoading ? (
                  <><Icon name="progress_activity" className="animate-spin text-sm" /> Menyimpan...</>
                ) : (
                  <><Icon name="save" className="text-sm" /> Simpan Password</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-sm overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <Icon name="check_circle" className="text-5xl text-teal-600 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-primary font-heading mb-2">Berhasil!</h3>
              <p className="text-sm font-body text-primary opacity-80">{successMessage}</p>
            </div>
            <div className="bg-neutral/50 px-6 py-4 flex justify-center border-t border-border">
              <button 
                onClick={() => setSuccessMessage("")}
                className="w-full py-2.5 text-sm font-semibold text-on-tertiary bg-tertiary hover:opacity-90 rounded transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-sm overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <Icon name="error" className="text-5xl text-red-600 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-red-700 font-heading mb-2">Gagal!</h3>
              <p className="text-sm font-body text-primary opacity-80">{errorMessage}</p>
            </div>
            <div className="bg-neutral/50 px-6 py-4 flex justify-center border-t border-border">
              <button 
                onClick={() => setErrorMessage("")}
                className="w-full py-2.5 text-sm font-semibold text-white bg-red-600 hover:opacity-90 rounded transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
