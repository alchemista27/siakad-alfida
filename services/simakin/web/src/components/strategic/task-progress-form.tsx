"use client";

import { useState } from "react";
import { createLog, transitionWorkflow } from "@/actions/strategic";
import { PicEvidenceUploader } from "./pic-evidence-uploader";

interface TaskProgressFormProps {
  taskId: string;
  programId: string;
  taskLabel: string;
  onComplete?: () => void;
}

export function TaskProgressForm({ taskId, programId, taskLabel, onComplete }: TaskProgressFormProps) {
  const [activityName, setActivityName] = useState(taskLabel);
  const [output, setOutput] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activityName.trim()) {
      setFeedback("Nama realisasi wajib diisi.");
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const log = await createLog({
        programId,
        taskId,
        activityDate: new Date().toISOString(),
        activityName: activityName.trim(),
        output: output.trim() || undefined,
        notes: notes.trim() || undefined,
        evidenceId: evidenceId || undefined,
      }) as { id: string };
      await transitionWorkflow("realization_log", log.id, "submitted_to_biro");
      setFeedback("Realisasi telah dikirim. Status: Menunggu review Biro.");
      onComplete?.();
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Realisasi belum dapat dikirim.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div><h3 className="font-heading text-sm font-bold text-primary">Laporan progres</h3><p className="mt-1 text-xs text-gray-500">Laporan ini akan masuk ke review Biro setelah dikirim.</p></div>
      <input value={activityName} onChange={(event) => setActivityName(event.target.value)} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" placeholder="Kegiatan yang direalisasikan" />
      <input value={output} onChange={(event) => setOutput(event.target.value)} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" placeholder="Output atau capaian saat ini" />
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" placeholder="Catatan pelaksanaan atau kendala" />
      <PicEvidenceUploader programId={programId} taskId={taskId} onCreated={setEvidenceId} />
      <button type="submit" disabled={saving} className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700 disabled:opacity-50">{saving ? "Mengirim..." : "Kirim progres untuk review"}</button>
      {feedback && <p className="text-xs text-gray-700" role="status">{feedback}</p>}
    </form>
  );
}
