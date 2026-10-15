"use client";

import React from "react";

interface KpiPieChartProps {
  green: number;
  yellow: number;
  red: number;
  total: number;
}

export function KpiPieChart({ green, yellow, red, total }: KpiPieChartProps) {
  if (total === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 bg-[#F7F8F8] rounded-xl border border-border">
        Belum ada data indikator KPI yang dapat divisualisasikan.
      </div>
    );
  }

  const greenPercent = Math.round((green / total) * 100);
  const yellowPercent = Math.round((yellow / total) * 100);
  const redPercent = Math.max(0, 100 - greenPercent - yellowPercent);

  // SVG Donut calculation (radius 50, circumference = 2 * PI * 50 = 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const greenStroke = (green / total) * circumference;
  const yellowStroke = (yellow / total) * circumference;
  const redStroke = (red / total) * circumference;

  const greenOffset = 0;
  const yellowOffset = -greenStroke;
  const redOffset = -(greenStroke + yellowStroke);

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center justify-center relative flex-shrink-0">
        <svg width="170" height="170" viewBox="0 0 140 140" className="transform -rotate-90">
          {/* Lingkaran Background */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#E3E8E7"
            strokeWidth="16"
          />
          {/* Segmen Hijau */}
          {green > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="16"
              strokeDasharray={`${greenStroke} ${circumference - greenStroke}`}
              strokeDashoffset={greenOffset}
              className="transition-all duration-700 ease-out"
            />
          )}
          {/* Segmen Kuning */}
          {yellow > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="16"
              strokeDasharray={`${yellowStroke} ${circumference - yellowStroke}`}
              strokeDashoffset={yellowOffset}
              className="transition-all duration-700 ease-out"
            />
          )}
          {/* Segmen Merah */}
          {red > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="16"
              strokeDasharray={`${redStroke} ${circumference - redStroke}`}
              strokeDashoffset={redOffset}
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Label di Tengah Lingkaran */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-bold font-heading text-emerald-600 leading-none">
            {greenPercent}%
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
            On-Track
          </span>
        </div>
      </div>

      {/* Legenda & Persentase Rinci */}
      <div className="flex-1 space-y-3 w-full">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>Sesuai Target (&ge; 95%)</span>
            </span>
            <span className="font-mono text-gray-700">
              {green} KPI ({greenPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${greenPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Peringatan (75% - 94%)</span>
            </span>
            <span className="font-mono text-gray-700">
              {yellow} KPI ({yellowPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${yellowPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span>Kritis (&lt; 75%)</span>
            </span>
            <span className="font-mono text-gray-700">
              {red} KPI ({redPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${redPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
