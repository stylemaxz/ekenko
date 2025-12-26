"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children, width = "max-w-xl", footer }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
    } else {
        const timer = setTimeout(() => setIsVisible(false), 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300", 
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
         onClick={onClose} 
       />
       
       {/* Modal Content */}
       <div className={clsx(
           "bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh] relative z-10 transform transition-all duration-300 ease-out", 
           width, 
           isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
       )}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 rounded-t-2xl">
              <div>
                  {title && <h2 className="text-xl font-bold text-slate-800">{title}</h2>}
                  {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
              </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
              {children}
          </div>

          {/* Footer (Optional) */}
          {footer && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                  {footer}
              </div>
          )}
       </div>
    </div>
  );
}
