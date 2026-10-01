"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IssuesClient({ issues, tasks, users }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Risk & Issue Register</h1>
        <p className="text-sm text-gray-500">Manajemen risiko dan kendala eksekusi program</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-border">
            Belum ada isu yang dilaporkan.
          </div>
        ) : (
          issues.map((i: any) => (
            <Card key={i.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>{i.title}</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{i.severity}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{i.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Dilaporkan oleh: {i.reportedBy?.fullName || '-'}</span>
                  <span>Ditugaskan ke: {i.assignedTo?.fullName || '-'}</span>
                  <span>Status: {i.status}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
