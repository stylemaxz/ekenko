"use client";

import { AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'success';
    isLoading?: boolean;
}

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    cancelText,
    variant = 'primary',
    isLoading = false
}: ConfirmModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const getVariantColors = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-200';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-200';
            default:
                return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                        <AlertTriangle size={24} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 btn btn-outline hover:bg-slate-50 border-slate-200 text-slate-700"
                        >
                            {cancelText || t('cancel')}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 btn text-white shadow-lg shadow-indigo-500/20 ${getVariantColors()}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                confirmText || t('confirm')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
