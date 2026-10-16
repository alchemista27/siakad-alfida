"use client";

import { useCallback, useEffect, useState } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { getMyActionItems, getMyExecutionTasks } from "@/actions/strategic";
import { TaskProgressForm } from "@/components/strategic/task-progress-form";

interface ExecutionTask {
  id: string;
  description: string;
  status?: string;
  deadline?: string | null;
  programId: string;
  program?: { id: string; title: string } | null;
}

interface ActionItem {
  id: string;
  description?: string;
  status?: string;
  deadline?: string | null;
  issue?: { title: string } | null;
  meeting?: { title: string } | null;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExecutionTask | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, actionItemData] = await Promise.all([getMyExecutionTasks(), getMyActionItems()]);
      setTasks(Array.isArray(taskData) ? taskData as ExecutionTask[] : []);
      setActionItems(Array.isArray(actionItemData) ? actionItemData as ActionItem[] : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tugas saya belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <SimakinShell activePath="/my-tasks">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-primary">Tugas Saya</h1><p className="mt-1 text-xs text-gray-500">Tugas pelaksanaan yang ditetapkan kepada akun Anda, beserta tindak lanjut rapat.</p></div>
          <button type="button" onClick={() => void refresh()} className="rounded-sm border border-border bg-surface px-3 py-2 text-xs font-semibold text-tertiary hover:bg-neutral">Muat ulang</button>
        </div>
        {error && <p className="mt-5 rounded-sm border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">{error}</p>}
        {loading ? <p className="py-10 text-center text-xs text-gray-500">Memuat tugas Anda…</p> : <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tugas pelaksanaan</h2>
              {tasks.length === 0 ? <div className="mt-2 rounded-lg border border-border bg-surface p-5 text-xs text-gray-500">Belum ada tugas pelaksanaan yang ditetapkan untuk Anda.</div> : <div className="mt-2 space-y-3">{tasks.map((task) => <button key={task.id} type="button" onClick={() => setSelected(task)} className={`w-full rounded-lg border p-4 text-left ${selected?.id === task.id ? "border-tertiary bg-[#e6f4f1]" : "border-border bg-surface hover:bg-neutral"}`}><div className="flex items-start justify-between gap-3"><span className="font-semibold text-primary">{task.description}</span><span className="rounded-sm border border-border bg-neutral px-2 py-0.5 text-[10px] font-semibold text-primary">{task.status || "not_started"}</span></div><p className="mt-2 text-xs text-gray-500">Program: {task.program?.title || "-"}</p><p className="mt-1 text-xs text-gray-500">Tenggat: {task.deadline ? new Date(task.deadline).toLocaleDateString("id-ID") : "Belum ditentukan"}</p></button>)}</div>}
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tindak lanjut rapat</h2>
              {actionItems.length === 0 ? <p className="mt-2 text-xs text-gray-500">Tidak ada tindak lanjut rapat aktif.</p> : <div className="mt-2 space-y-2">{actionItems.map((item) => <div key={item.id} className="rounded-lg border border-border bg-surface p-3"><p className="text-xs font-semibold text-primary">{item.description || item.issue?.title || item.meeting?.title || "Tindak lanjut"}</p><p className="mt-1 text-[11px] text-gray-500">Status: {item.status || "not_started"} · Tenggat: {item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID") : "Belum ditentukan"}</p></div>)}</div>}
            </section>
          </div>
          <div>{selected ? <TaskProgressForm taskId={selected.id} programId={selected.programId} taskLabel={selected.description} onComplete={() => void refresh()} /> : <div className="rounded-lg border border-border bg-surface p-5 text-xs text-gray-500">Pilih tugas pelaksanaan untuk melaporkan progres, kendala, atau bukti.</div>}</div>
        </div>}
      </div>
    </SimakinShell>
  );
}
