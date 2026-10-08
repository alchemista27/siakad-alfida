"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from './icon';

export function AccordionDepartments({ departments }: { departments: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (openId === id) setOpenId(null);
    else setOpenId(id);
  };

  return (
    <div className="space-y-4">
      {departments.map((dept) => {
        const isOpen = openId === dept.id;
        const hasSub = dept.children && dept.children.length > 0;
        
        return (
          <div key={dept.id} className="bg-white border border-border rounded-lg shadow-sm overflow-hidden transition-all">
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isOpen ? 'bg-gray-50 border-b border-border' : ''}`}
              onClick={() => toggle(dept.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-teal-50 text-tertiary flex items-center justify-center">
                  <Icon name="domain" className="text-xl" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary text-lg">Bidang {dept.name}</h3>
                  <p className="text-xs text-gray-500">{hasSub ? `${dept.children.length} Biro / Unit Pelaksana` : 'Tidak ada biro pelaksana'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href={`/pengawas/department/${dept.id}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
                >
                  Laporan Bidang
                </Link>
                {hasSub && (
                  <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-gray-400 text-xl" />
                )}
              </div>
            </div>
            
            {isOpen && hasSub && (
              <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dept.children.map((biro: any) => (
                    <div key={biro.id} className="bg-white border border-gray-200 rounded p-4 hover:border-tertiary transition-colors group relative">
                       <h4 className="font-bold text-gray-800 mb-1">{biro.name}</h4>
                       <p className="text-xs text-gray-500 mb-4">{biro.workPrograms?.length || 0} Program Kerja terdaftar</p>
                       <Link 
                         href={`/pengawas/department/${biro.id}`} 
                         className="text-xs font-semibold text-tertiary hover:underline flex items-center gap-1"
                       >
                         Lihat Laporan Biro <Icon name="arrow_forward" className="text-[10px]" />
                       </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
