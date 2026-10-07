"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NotificationModal } from "@/components/ui/notification-modal";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/actions/inventory";

interface InventoryItem {
  id: string;
  code: string | null;
  name: string;
  category: string;
  quantity: number;
  unitOfMeasure: string;
  condition: string;
  location: string | null;
  departmentId: string | null;
  unitId: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  sourceOfFund: string | null;
  notes: string | null;
  department?: { id: string; name: string } | null;
  unit?: { id: string; name: string } | null;
}

interface InventoryClientProps {
  initialItems: InventoryItem[];
  stats: any;
  departments: { id: string; name: string }[];
  units: { id: string; name: string }[];
}

const CATEGORIES = [
  "Elektronik & IT",
  "Furnitur & Mebeul",
  "Kendaraan Operasional",
  "Sarana Pembelajaran & Lab",
  "Alat Tulis Kantor (ATK)",
  "Perlengkapan Asrama/Gedung",
  "Lainnya",
];

const CONDITIONS = [
  { value: "baik", label: "Baik", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "rusak_ringan", label: "Rusak Ringan", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "rusak_berat", label: "Rusak Berat", color: "bg-red-100 text-red-800 border-red-200" },
];

export function InventoryClient({ initialItems, stats, departments, units }: InventoryClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ isOpen: false, title: "", message: "", type: "info" as "success" | "error" | "info" });

  const defaultForm = {
    code: "",
    name: "",
    category: CATEGORIES[0],
    quantity: 1,
    unitOfMeasure: "unit",
    condition: "baik",
    location: "",
    departmentId: "",
    unitId: "",
    purchaseDate: "",
    purchasePrice: "",
    sourceOfFund: "Yayasan",
    notes: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code || "",
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure || "unit",
        condition: item.condition,
        location: item.location || "",
        departmentId: item.departmentId || "",
        unitId: item.unitId || "",
        purchaseDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
        purchasePrice: item.purchasePrice ? String(item.purchasePrice) : "",
        sourceOfFund: item.sourceOfFund || "Yayasan",
        notes: item.notes || "",
      });
    } else {
      setEditingItem(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        code: formData.code || undefined,
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unitOfMeasure: formData.unitOfMeasure || "unit",
        condition: formData.condition,
        location: formData.location || undefined,
        departmentId: formData.departmentId || undefined,
        unitId: formData.unitId || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        sourceOfFund: formData.sourceOfFund || undefined,
        notes: formData.notes || undefined,
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id, payload);
        setNotif({ isOpen: true, title: "Sukses", message: "Barang inventaris berhasil diperbarui.", type: "success" });
      } else {
        await createInventoryItem(payload);
        setNotif({ isOpen: true, title: "Sukses", message: "Barang inventaris baru berhasil ditambahkan.", type: "success" });
      }

      setIsModalOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setNotif({ isOpen: true, title: "Gagal", message: err?.message || "Gagal menyimpan data inventaris.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus aset "${name}" dari inventaris?`)) return;
    try {
      await deleteInventoryItem(id);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setNotif({ isOpen: true, title: "Gagal", message: err?.message || "Gagal menghapus aset.", type: "error" });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.code && item.code.toLowerCase().includes(search.toLowerCase())) || (item.location && item.location.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    const matchCondition = !conditionFilter || item.condition === conditionFilter;
    return matchSearch && matchCategory && matchCondition;
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Icon name="inventory_2" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Item Barang</p>
            <p className="text-xl font-bold text-primary">{stats?.totalItems || items.length}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Icon name="check_circle" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Kondisi Baik</p>
            <p className="text-xl font-bold text-emerald-700">
              {stats?.conditionCounts?.find((c: any) => c.condition === "baik")?._sum?.quantity || items.filter(i => i.condition === "baik").reduce((acc, i) => acc + i.quantity, 0)} Unit
            </p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Icon name="warning" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rusak Ringan</p>
            <p className="text-xl font-bold text-amber-700">
              {stats?.conditionCounts?.find((c: any) => c.condition === "rusak_ringan")?._sum?.quantity || items.filter(i => i.condition === "rusak_ringan").reduce((acc, i) => acc + i.quantity, 0)} Unit
            </p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Icon name="report" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rusak Berat</p>
            <p className="text-xl font-bold text-red-700">
              {stats?.conditionCounts?.find((c: any) => c.condition === "rusak_berat")?._sum?.quantity || items.filter(i => i.condition === "rusak_berat").reduce((acc, i) => acc + i.quantity, 0)} Unit
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface rounded-lg border border-border p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Daftar Inventaris Sarpras</h2>
            <p className="text-xs text-gray-500">Pencatatan aset sarana, prasarana, dan fasilitas yayasan</p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 text-xs"
          >
            <Icon name="add" className="text-sm" />
            Tambah Barang Inventaris
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Cari nama barang, kode, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-lg focus:ring-1 focus:ring-tertiary text-primary"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-surface border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-tertiary text-primary"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="text-xs bg-surface border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-tertiary text-primary"
          >
            <option value="">Semua Kondisi</option>
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>{cond.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-primary">
            <thead className="text-[10px] text-gray-500 uppercase bg-neutral/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode & Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-4 py-3 font-semibold">Lokasi / Penempatan</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                    Belum ada data barang inventaris yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const condObj = CONDITIONS.find((c) => c.value === item.condition) || CONDITIONS[0];
                  return (
                    <tr key={item.id} className="hover:bg-neutral/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary">{item.name}</div>
                        <div className="text-[10px] text-gray-500">{item.code || "Tanpa Kode"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-neutral text-primary rounded border border-border text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.quantity} {item.unitOfMeasure}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${condObj.color}`}>
                          {condObj.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.location || "-"}
                        {item.unit && <span className="block text-[10px] text-gray-400">Unit: {item.unit.name}</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(item)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Barang Inventaris" : "Tambah Barang Inventaris Baru"}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">KODE BARANG (OPSIONAL)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Misal: INV-SAR-001"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">KATEGORI</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">NAMA BARANG / ASET</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Misal: Proyektor Epson EB-X500"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">JUMLAH (QTY)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SATUAN</label>
              <input
                type="text"
                required
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                placeholder="unit, buah, set, pcs"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">KONDISI BARANG</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                required
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">LOKASI PENEMPATAN</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Misal: Lab Komputer SMP, Ruang Rapat"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">TANGGAL PEMBELIAN / PEROLEHAN</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">HARGA PEROLEHAN / UNIT (RP)</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SUMBER DANA</label>
              <input
                type="text"
                value={formData.sourceOfFund}
                onChange={(e) => setFormData({ ...formData, sourceOfFund: e.target.value })}
                placeholder="Yayasan, BOS, Wakaf/Hibah"
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">PENUGASAN UNIT (OPSIONAL)</label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              >
                <option value="">-- Tanpa Unit Khusus --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">CATATAN / SPESIFIKASI TAMBAHAN</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Keterangan nomor seri, garansi, kondisi spesifik..."
                rows={2}
                className="w-full bg-surface text-primary border border-border rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Inventaris"}
            </Button>
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
