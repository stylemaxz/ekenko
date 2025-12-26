"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Modal } from "./Modal";
import clsx from "clsx";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success'; 
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = 'danger',
    confirmLabel,
    cancelLabel
}: ConfirmDialogProps) {
    const { t } = useLanguage();

    const colors = {
        danger: { bg: 'bg-red-50', icon: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700 text-white', iconComp: AlertCircle },
        warning: { bg: 'bg-amber-50', icon: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700 text-white', iconComp: AlertTriangle },
        info: { bg: 'bg-blue-50', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white', iconComp: Info },
        success: { bg: 'bg-green-50', icon: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700 text-white', iconComp: CheckCircle2 },
    };

    const style = colors[type];
    const Icon = style.iconComp;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            width="max-w-md"
            footer={
                <>
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                        {cancelLabel || t('cancel')}
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className={clsx("px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-opacity-20", style.btn)}>
                        {confirmLabel || t('confirm')}
                    </button>
                </>
            }
        >
            <div className="flex items-start gap-4">
                <div className={clsx("p-3 rounded-full shrink-0", style.bg, style.icon)}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-600 leading-relaxed">{message}</p>
                </div>
            </div>
        </Modal>
    );
}
