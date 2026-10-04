"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { bookRoom } from "@/actions/secretariat";

export function RoomsClient({ rooms, bookings }: { rooms: any[], bookings: any[] }) {
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">("rooms");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookRoom({
        roomId: selectedRoom,
        title,
        date,
        startTime,
        endTime
      });
      alert("Ruangan berhasil dibooking!");
      setActiveTab("bookings");
      setTitle("");
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan saat membooking ruangan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab("rooms")}
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Daftar Ruangan
        </button>
        <button 
          onClick={() => setActiveTab("bookings")}
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Jadwal Pemakaian
        </button>
      </div>

      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="meeting_room" className="text-primary text-xl" />
                  {room.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 flex flex-col gap-1 mb-4">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Kapasitas:</span>
                    <span className="font-semibold text-gray-900">{room.capacity} Orang</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Lokasi:</span>
                    <span className="font-medium text-gray-900">{room.location || "-"}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setSelectedRoom(room.id); setActiveTab("bookings"); }}
                  className="w-full bg-neutral text-primary font-medium py-2 rounded border border-transparent hover:border-primary transition-colors text-sm"
                >
                  Pinjam Ruangan Ini
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold font-heading text-lg flex items-center gap-2">
              <Icon name="calendar_month" className="text-gray-400" /> Jadwal Terkini
            </h2>
            {bookings.length === 0 ? (
              <div className="p-10 border border-dashed rounded-xl text-center text-gray-500">
                Belum ada jadwal peminjaman ruangan.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 rounded-lg border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{b.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Icon name="meeting_room" className="text-[16px]" /> {b.room.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Icon name="person" className="text-[16px]" /> Peminjam: {b.booker?.fullName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
                        {format(new Date(b.date), 'dd MMM yyyy', { locale: localeId })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">
                        {b.startTime} - {b.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-surface border border-border p-5 rounded-xl sticky top-20">
              <h3 className="font-bold font-heading mb-4 text-primary">Form Peminjaman Baru</h3>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ruangan</label>
                  <select 
                    required 
                    value={selectedRoom} 
                    onChange={e => setSelectedRoom(e.target.value)}
                    className="w-full text-sm p-2 border border-border rounded focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Pilih Ruangan --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} org)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Agenda / Kegiatan</label>
                  <input 
                    required 
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Rapat Pleno BPH"
                    className="w-full text-sm p-2 border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
                  <input 
                    required type="date"
                    value={date} onChange={e => setDate(e.target.value)}
                    className="w-full text-sm p-2 border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mulai</label>
                    <input 
                      required type="time"
                      value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full text-sm p-2 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Selesai</label>
                    <input 
                      required type="time"
                      value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="w-full text-sm p-2 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full mt-2 bg-primary text-white py-2 rounded text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Submit Peminjaman
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
