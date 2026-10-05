"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { completeDisposition } from "@/actions/secretariat";

export function CorrespondenceClient({ correspondences, myDispositions }: { correspondences: any[], myDispositions: any[] }) {
  const [activeTab, setActiveTab] = useState<"surat" | "disposisi" | "tambah">("disposisi");

  // Form states
  const [type, setType] = useState("INCOMING");
  const [refNo, setRefNo] = useState("");
  const [date, setDate] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (id: string) => {
    try {
      await completeDisposition(id);
      alert("Disposisi berhasil diselesaikan.");
    } catch (e) {
      alert("Gagal menyelesaikan disposisi.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { createCorrespondence } = await import("@/actions/secretariat");
      await createCorrespondence({
        type, referenceNumber: refNo, date, sender, recipient, subject, attachmentUrl
      });
      alert("Surat berhasil dicatat!");
      setActiveTab("surat");
      setRefNo(""); setSender(""); setRecipient(""); setSubject(""); setAttachmentUrl("");
    } catch (e) {
      alert("Gagal mencatat surat.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab("disposisi")}
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'disposisi' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Disposisi Saya ({myDispositions.filter(d => d.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab("surat")}
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'surat' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Semua Surat ({correspondences.length})
        </button>
        <button 
          onClick={() => setActiveTab("tambah")}
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'tambah' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} ml-auto flex items-center gap-1`}
        >
          <Icon name="add" className="text-lg" /> Tambah Surat
        </button>
      </div>

      {activeTab === 'tambah' && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold font-heading mb-4 text-primary">Input Surat Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Surat</label>
                  <select value={type} onChange={e=>setType(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary">
                    <option value="INCOMING">Surat Masuk</option>
                    <option value="OUTGOING">Surat Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Surat</label>
                  <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Surat / Referensi</label>
                <input required value={refNo} onChange={e=>setRefNo(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary" placeholder="001/SIM/X/2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pengirim (Asal)</label>
                  <input required value={sender} onChange={e=>setSender(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary" placeholder="Dinas Pendidikan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Penerima (Tujuan)</label>
                  <input required value={recipient} onChange={e=>setRecipient(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary" placeholder="Ketua Yayasan" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Perihal / Subject</label>
                <input required value={subject} onChange={e=>setSubject(e.target.value)} className="w-full text-sm p-2 border border-border rounded focus:border-primary" placeholder="Undangan Seminar" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">File Surat</label>
                <CldUploadWidget 
                  uploadPreset="ml_default" // default preset if not specified
                  onSuccess={(result: any) => {
                    if (result?.info?.secure_url) {
                      setAttachmentUrl(result.info.secure_url);
                    }
                  }}
                >
                  {({ open }) => (
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => open()} 
                        className="bg-neutral text-gray-700 border border-border px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <Icon name="cloud_upload" className="text-[18px]" />
                        Upload File
                      </button>
                      {attachmentUrl && (
                        <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                          <Icon name="check_circle" className="text-sm" /> File terlampir
                        </span>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveTab("surat")}
                  className="w-1/3 border border-border text-gray-600 py-2 rounded text-sm font-semibold hover:bg-neutral transition-colors"
                >
                  Batal
                </button>
                <button disabled={isSubmitting} type="submit" className="w-2/3 bg-primary text-white py-2 rounded text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {isSubmitting ? "Menyimpan..." : "Simpan Surat"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'disposisi' && (
        <div className="space-y-4">
          {myDispositions.length === 0 ? (
             <div className="text-center p-10 text-gray-500">Belum ada disposisi untuk Anda.</div>
          ) : myDispositions.map(disp => (
            <Card key={disp.id} className={disp.status === 'completed' ? 'opacity-60' : ''}>
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={disp.status === 'pending' ? 'amber' : 'green'}>
                      {disp.status === 'pending' ? 'Menunggu' : 'Selesai'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Tenggat: {disp.dueDate ? format(new Date(disp.dueDate), 'dd MMM yyyy', { locale: localeId }) : '-'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{disp.correspondence.subject}</h3>
                  <p className="text-sm text-gray-600 mb-2">Ref: {disp.correspondence.referenceNumber} • Pengirim: {disp.correspondence.sender}</p>
                  
                  <div className="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-100 mb-2">
                    <span className="font-semibold block mb-1">Instruksi:</span>
                    {disp.instructions}
                  </div>
                  
                  {disp.correspondence.attachmentUrl && (
                    <a href={disp.correspondence.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <Icon name="attach_file" className="text-base" /> Lihat Lampiran Surat
                    </a>
                  )}
                </div>
                
                {disp.status === 'pending' && (
                  <button 
                    onClick={() => handleComplete(disp.id)}
                    className="bg-primary text-white px-4 py-2 rounded shadow text-sm hover:bg-primary/90 flex items-center gap-2 shrink-0"
                  >
                    <Icon name="check_circle" className="text-lg" /> Selesaikan
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'surat' && (
        <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Tanggal / No Ref</th>
                <th className="py-3 px-4">Pengirim / Tujuan</th>
                <th className="py-3 px-4">Perihal</th>
                <th className="py-3 px-4">Status Disposisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {correspondences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Belum ada data surat.</td>
                </tr>
              ) : correspondences.map(surat => (
                <tr key={surat.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Badge variant={surat.type === 'INCOMING' ? 'blue' : 'gray'}>{surat.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(surat.date), 'dd MMM yyyy', { locale: localeId })}<br/>
                    <span className="text-gray-500 text-xs">{surat.referenceNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-500 text-xs block">Dari:</span> {surat.sender}<br/>
                    <span className="text-gray-500 text-xs block mt-1">Ke:</span> {surat.recipient}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {surat.subject}
                    {surat.attachmentUrl && (
                      <a href={surat.attachmentUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary mt-1 hover:underline">
                        Lihat Lampiran
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {surat.dispositions.length} disposisi
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
