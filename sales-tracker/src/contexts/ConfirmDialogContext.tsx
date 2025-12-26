"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
    setResolver(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Confirmation Modal */}
      {isOpen && options && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                options.type === 'danger' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertTriangle 
                  size={32} 
                  className={options.type === 'danger' ? 'text-red-600' : 'text-amber-600'} 
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              {options.title}
            </h3>

            {/* Message */}
            <p className="text-slate-600 text-center mb-6 whitespace-pre-line">
              {options.message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition-all"
              >
                {options.cancelText || 'ยกเลิก'}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white active:scale-95 transition-all ${
                  options.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {options.confirmText || 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
};
