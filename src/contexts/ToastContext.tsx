"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, X, Info, AlertTriangle } from "lucide-react";
import clsx from "clsx";

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentStyles = {
      success: "bg-white/90 border-green-200 text-green-800",
      error: "bg-white/90 border-red-200 text-red-800",
      info: "bg-white/90 border-blue-200 text-blue-800",
      warning: "bg-white/90 border-amber-200 text-amber-800"
  };

  const iconStyles = {
      success: "bg-green-100 text-green-600",
      error: "bg-red-100 text-red-600",
      info: "bg-blue-100 text-blue-600",
      warning: "bg-amber-100 text-amber-600"
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={clsx(
                "pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transform transition-all duration-500 animate-in slide-in-from-right-10 fade-in",
                currentStyles[toast.type]
            )}
            style={{ minWidth: '300px' }}
          >
             <div className={clsx("p-1 rounded-full", iconStyles[toast.type])}>
                 {toast.type === 'success' && <CheckCircle2 size={18} />}
                 {toast.type === 'error' && <XCircle size={18} />}
                 {toast.type === 'info' && <Info size={18} />}
                 {toast.type === 'warning' && <AlertTriangle size={18} />}
             </div>
             <p className="flex-1 text-sm font-medium">{toast.message}</p>
             <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 p-1">
                 <X size={16} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
