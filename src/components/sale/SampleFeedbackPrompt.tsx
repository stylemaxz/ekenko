"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Package, ChevronRight, X } from 'lucide-react';

interface Sample {
    id: string;
    sampleNumber: string;
    version: number;
    dueDate: string;
    notes?: string;
    product: {
        name: string;
        project: {
            name: string;
        };
    };
}

interface SampleFeedbackPromptProps {
    samples: Sample[];
    onCollectFeedback: (sample: Sample) => void;
    onSkip: () => void;
}

export function SampleFeedbackPrompt({ samples, onCollectFeedback, onSkip }: SampleFeedbackPromptProps) {
    const { t } = useLanguage();

    if (samples.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">{t('pending_sample_feedback_title')}</h3>
                    <p className="text-sm text-blue-700">
                        {samples.length === 1
                            ? t('one_sample_awaiting_feedback')
                            : `${samples.length} ${t('samples_awaiting_feedback')}`
                        }
                    </p>
                </div>
                <button
                    onClick={onSkip}
                    className="p-1 hover:bg-blue-100 rounded"
                >
                    <X size={18} className="text-blue-400" />
                </button>
            </div>

            <div className="space-y-2">
                {samples.map(sample => (
                    <button
                        key={sample.id}
                        onClick={() => onCollectFeedback(sample)}
                        className="w-full bg-white p-3 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="font-medium text-slate-900">{sample.sampleNumber}</div>
                            <div className="text-xs text-slate-500">
                                {sample.product.name} - {sample.product.project.name}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                            <span className="text-xs font-medium">{t('collect_feedback')}</span>
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>

            <button
                onClick={onSkip}
                className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                {t('skip_for_now')}
            </button>
        </div>
    );
}
