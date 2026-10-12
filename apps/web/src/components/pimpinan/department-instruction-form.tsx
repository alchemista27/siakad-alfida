"use client";

import React, { useState } from "react";
import { updateDepartmentInstruction } from "@/actions/pimpinan";
import { Icon } from "@/components/ui/icon";
import { NotificationModal } from "@/components/ui/notification-modal";

export function DepartmentInstructionForm({
  departmentId,
  departmentName,
  initialNotes,
}: {
  departmentId: string;
  departmentName: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDepartmentInstruction(departmentId, notes);
      setNotif({
        isOpen: true,
        title: "Berhasil",
        message: "Arahan dan instruksi pimpinan telah tersimpan.",
        type: "success",
      });
    } catch (err: any) {
      setNotif({
        isOpen: true,
        title: "Gagal",
        message: err?.message || "Gagal menyimpan arahan.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
          <Icon name="rate_review" className="text-xl" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-heading text-gray-900">
            Penilaian & Instruksi Pimpinan
          </h2>
          <p className="text-xs text-gray-600">
            Catatan arahan ini menjadi pedoman evaluasi bagi pimpinan dan staf unit {departmentName}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
            Arahan, Evaluasi, & Instruksi Strategis
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full border border-amber-300 rounded-md p-3 text-sm focus:ring focus:ring-amber-200 bg-white"
            placeholder="Tuliskan arahan, target akselerasi, evaluasi kinerja, atau catatan instruksi untuk unit ini..."
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name="save" className="text-sm" />
            <span>{loading ? "Menyimpan..." : "Simpan Arahan & Instruksi"}</span>
          </button>
        </div>
      </form>

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
