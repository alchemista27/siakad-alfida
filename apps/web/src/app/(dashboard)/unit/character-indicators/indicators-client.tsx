"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { createCharacterIndicator, deleteCharacterIndicator } from "@/actions/unit-monitoring";

export function CharacterIndicatorsClient({ units, indicators }: any) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentIndicators = indicators.filter((i: any) => i.unitId === selectedUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedUnit) return;

    startTransition(async () => {
      await createCharacterIndicator(selectedUnit, name, description);
      setName("");
      setDescription("");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus indikator ini? Data penilaian terkait mungkin akan hilang!")) return;
    
    startTransition(async () => {
      await deleteCharacterIndicator(id);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tambah Indikator</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Pendidikan</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                {units.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Indikator</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Misal: Salat 5 Waktu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Panduan Penilaian</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Panduan untuk wali kelas..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isPending || !name || !selectedUnit}
              className="w-full py-2 bg-tertiary text-white rounded-md text-sm font-semibold hover:bg-tertiary/90 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Indikator"}
            </button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Daftar Indikator</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              Total: {currentIndicators.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {currentIndicators.length > 0 ? (
              currentIndicators.map((ind: any) => (
                <div key={ind.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-800">{ind.name}</h3>
                    {ind.description && (
                      <p className="text-sm text-gray-600 mt-1">{ind.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(ind.id)}
                    disabled={isPending}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="Hapus Indikator"
                  >
                    <Icon name="delete" className="text-xl" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="assignment" className="text-2xl" />
                </div>
                <p className="text-gray-500 font-medium">Belum ada indikator karakter di unit ini.</p>
                <p className="text-sm text-gray-400 mt-1">Gunakan form di samping untuk menambahkan.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
