"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { X, Star, MessageSquare, Camera, Send } from 'lucide-react';
import { clsx } from 'clsx';

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

interface SampleFeedbackFormProps {
    sample: Sample;
    visitId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

const REACTIONS = [
    { value: 'very_positive', label: 'reaction_very_positive', emoji: '😀', color: 'bg-green-100 border-green-300 text-green-700' },
    { value: 'positive', label: 'reaction_positive', emoji: '🙂', color: 'bg-lime-100 border-lime-300 text-lime-700' },
    { value: 'neutral', label: 'reaction_neutral', emoji: '😐', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { value: 'negative', label: 'reaction_negative', emoji: '😕', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { value: 'very_negative', label: 'reaction_very_negative', emoji: '😞', color: 'bg-red-100 border-red-300 text-red-700' },
];

export function SampleFeedbackForm({ sample, visitId, onClose, onSuccess }: SampleFeedbackFormProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [customerReaction, setCustomerReaction] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!customerReaction) {
            showToast(t('select_reaction_required'), 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/samples/${sample.id}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerReaction,
                    rating,
                    comments,
                    visitId,
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit feedback');
            }

            showToast(t('feedback_submitted'), 'success');
            onSuccess();
        } catch (error: any) {
            showToast(error.message || t('error_submitting_feedback'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-y-auto rounded-t-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">{t('sample_feedback')}</h2>
                        <p className="text-sm text-slate-500">{sample.sampleNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Sample Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={18} className="text-blue-600" />
                            <span className="font-medium text-blue-900">{sample.product.name}</span>
                        </div>
                        <p className="text-sm text-blue-700">{sample.product.project.name}</p>
                        {sample.notes && (
                            <p className="text-sm text-blue-600 mt-2 italic">{sample.notes}</p>
                        )}
                    </div>

                    {/* Customer Reaction */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            {t('customer_reaction')} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {REACTIONS.map(reaction => (
                                <button
                                    key={reaction.value}
                                    onClick={() => setCustomerReaction(reaction.value)}
                                    className={clsx(
                                        "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                                        customerReaction === reaction.value
                                            ? reaction.color + ' border-2'
                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    )}
                                >
                                    <span className="text-2xl">{reaction.emoji}</span>
                                    <span className="text-[10px] font-medium text-center">
                                        {t(reaction.label as any)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating (Optional) */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            {t('rating_optional')}
                        </label>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(rating === star ? null : star)}
                                    className="p-2"
                                >
                                    <Star
                                        size={32}
                                        className={clsx(
                                            "transition-colors",
                                            rating && rating >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-slate-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            {t('feedback_comments')}
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="input w-full"
                            rows={3}
                            placeholder={t('feedback_comments_placeholder')}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="btn btn-outline flex-1"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!customerReaction || isSubmitting}
                            className="btn btn-primary flex-1"
                        >
                            {isSubmitting ? t('submitting') : (
                                <>
                                    <Send size={18} />
                                    {t('submit_feedback')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
