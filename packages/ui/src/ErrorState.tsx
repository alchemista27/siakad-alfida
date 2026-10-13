import React from "react";
import { cn } from "./utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-red-200 bg-red-50/60",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 text-lg font-bold">
        ✕
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-700 max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Coba Kembali
        </button>
      )}
    </div>
  );
};
