"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MeetingsClient({ meetings, users }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Rapat Pimpinan</h1>
        <p className="text-sm text-gray-500">Notulensi dan Tindak Lanjut Rapat Strategis</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-border">
            Belum ada data rapat pimpinan.
          </div>
        ) : (
          meetings.map((m: any) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{m.title}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full mt-2 sm:mt-0">
                    {new Date(m.meetingDate).toLocaleDateString("id-ID")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                  <span className="font-semibold text-gray-700">Agenda:</span> {m.agenda}
                </div>
                
                {m.decisions && m.decisions.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tindak Lanjut / Keputusan:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {m.decisions.map((d: any) => (
                        <li key={d.id} className="text-sm">
                          <span className={d.isDone ? "line-through text-gray-400" : "text-gray-800"}>
                            {d.decision}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            (PIC: {d.pic?.fullName || 'Belum ditugaskan'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
