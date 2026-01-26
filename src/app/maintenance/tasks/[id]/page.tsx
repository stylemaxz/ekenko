"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { 
    ArrowLeft, Calendar, Clock, MapPin, 
    Box, AlertTriangle, CheckCircle, 
    User, FileText, Play, CheckSquare, Loader2,
    Wrench, Trash2, Plus
} from "lucide-react";
import Image from "next/image";
import PartSelectorModal from "@/components/maintenance/PartSelectorModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    asset: {
        id: string;
        serialNumber: string;
        modelName: string;
        image?: string;
        location?: {
            name: string;
        };
    };
    assignedEmployee?: {
        name: string;
    };
    scheduledDate?: string;
    estimatedHours?: number;
    completedDate?: string;
    actualHours?: number;
    notes?: string;
    createdAt: string;
    partsUsage: {
        id: string;
        quantity: number;
        priceAtTime: number;
        part: {
            name: string;
            partNumber: string;
            imageUrl?: string;
        };
    }[];
    totalCost: number;
}

export default function MaintenanceTaskDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [task, setTask] = useState<MaintenanceTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    
    // Confirmation State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        variant?: 'danger' | 'primary' | 'success';
    }>({
        isOpen: false,
        title: "",
        message: "",
        action: async () => {},
        variant: 'primary'
    });

    useEffect(() => {
        if (id) {
            fetchTaskDetails();
        }
    }, [id]);

    const fetchTaskDetails = async () => {
        try {
            const res = await fetch(`/api/maintenance-tasks/${id}`);
            if (!res.ok) throw new Error('Failed to fetch task');
            const data = await res.json();
            setTask(data);
            setNotes(data.notes || "");
        } catch (error) {
            console.error(error);
            showToast('Failed to load task details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (action: 'start' | 'complete') => {
        setConfirmConfig({
            isOpen: true,
            title: action === 'start' ? t('start_task') : t('complete_task'),
            message: t(`confirm_${action}_task` as any) || `Are you sure you want to ${action} this task?`,
            variant: action === 'complete' ? 'success' : 'primary',
            action: async () => {
                setActionLoading(true);
                try {
                    const endpoint = action === 'start' ? 'start' : 'complete';
                    const res = await fetch(`/api/maintenance-tasks/${id}/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(action === 'complete' ? { 
                            actualHours: task?.estimatedHours || 1,
                            notes: "Completed via web"
                        } : {}) 
                    });

                    if (!res.ok) throw new Error('Action failed');

                    showToast(t(`${action}_task_success` as any) || 'Task updated successfully', 'success');
                    fetchTaskDetails();
                } catch (error) {
                    console.error(error);
                    showToast('Failed to update task', 'error');
                } finally {
                    setActionLoading(false);
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            const res = await fetch(`/api/maintenance-tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });

            if (!res.ok) throw new Error('Failed to save notes');
            
            showToast(t('note_saved_success'), 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to save notes', 'error');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleAddPart = async (part: any, quantity: number) => {
        try {
            const res = await fetch(`/api/maintenance-tasks/${id}/parts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partId: part.id, quantity })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add part');
            }

            fetchTaskDetails();
            showToast('Part added successfully', 'success');
        } catch (error: any) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };

    const handleRemovePart = (usageId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: t('delete'), // Or generic "Remove Part"
            message: t('confirm_delete' as any) || 'Are you sure?',
            variant: 'danger',
            action: async () => {
                try {
                    const res = await fetch(`/api/maintenance-tasks/${id}/parts?usageId=${usageId}`, {
                        method: 'DELETE'
                    });

                    if (!res.ok) throw new Error('Failed to remove part');

                    fetchTaskDetails();
                    showToast('Part removed successfully', 'success');
                } catch (error) {
                    console.error(error);
                    showToast('Failed to remove part', 'error');
                } finally {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-100 text-slate-600';
            case 'assigned': return 'bg-blue-100 text-blue-600';
            case 'in_progress': return 'bg-indigo-100 text-indigo-600';
            case 'completed': return 'bg-green-100 text-green-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-slate-500">Task not found</div>
                <button onClick={() => router.back()} className="btn btn-outline">
                    <ArrowLeft size={16} />
                    {t('back')}
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('back')}
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)} uppercase tracking-wider`}>
                                {t(`priority_${task.priority}` as any)}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)} uppercase tracking-wider`}>
                                {t(`status_${task.status}` as any)}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                             <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : t('not_scheduled')}
                             </div>
                             {task.estimatedHours && (
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {task.estimatedHours} {t('hours' as any)}
                                </div>
                             )}
                        </div>
                    </div>

                   {/* Actions */}
                   <div className="flex items-center gap-3">
                        {task.status === 'assigned' || task.status === 'pending' ? (
                            <button 
                                onClick={() => handleStatusChange('start')}
                                disabled={actionLoading}
                                className="btn btn-primary"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                {t('start_task')}
                            </button>
                        ) : task.status === 'in_progress' ? (
                            <button 
                                onClick={() => handleStatusChange('complete')}
                                disabled={actionLoading}
                                className="btn btn-success bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckSquare size={18} />}
                                {t('complete_task')}
                            </button>
                        ) : null}
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-red-600" />
                            {t('task_description')}
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line">
                            {task.description}
                        </div>
                    </div>

                    {/* Timeline / Notes (Future) */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileText size={20} className="text-red-600" />
                                {t('technician_notes')}
                            </h2>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="btn btn-sm btn-outline text-red-600 border-red-200 hover:bg-red-50"
                            >
                                {savingNotes ? <Loader2 className="animate-spin" size={14} /> : null}
                                {t('save_notes')}
                            </button>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input w-full min-h-[120px] p-4 bg-slate-50 border-slate-200 focus:bg-white resize-y"
                            placeholder={t('notes_placeholder')}
                        />
                    </div>

                    {/* Parts Used Section */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Wrench size={20} className="text-red-600" />
                                {t('parts_used')}
                            </h2>
                            <button
                                onClick={() => setIsPartModalOpen(true)}
                                disabled={task.status === 'completed' || task.status === 'cancelled'}
                                className="btn btn-sm btn-primary"
                            >
                                <Plus size={16} />
                                {t('add_parts_btn')}
                            </button>
                        </div>

                        {task.partsUsage && task.partsUsage.length > 0 ? (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="table w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th>{t('part_name')}</th>
                                            <th className="text-center">{t('quantity')}</th>
                                            <th className="text-right">{t('price_per_unit')}</th>
                                            <th className="text-right">{t('total')}</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {task.partsUsage.map((usage) => (
                                            <tr key={usage.id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 relative overflow-hidden">
                                                            {usage.part.imageUrl ? (
                                                                <Image 
                                                                    src={usage.part.imageUrl} 
                                                                    alt={usage.part.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-slate-300">
                                                                    <Box size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{usage.part.name}</div>
                                                            <div className="text-xs text-slate-500 font-mono">{usage.part.partNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center font-medium">{usage.quantity}</td>
                                                <td className="text-right text-slate-500">฿{usage.priceAtTime.toLocaleString()}</td>
                                                <td className="text-right font-bold text-slate-900">
                                                    ฿{(usage.quantity * usage.priceAtTime).toLocaleString()}
                                                </td>
                                                <td>
                                                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                                                        <button 
                                                            onClick={() => handleRemovePart(usage.id)}
                                                            className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                            <td colSpan={3} className="text-right text-slate-900">{t('total_parts_cost')}</td>
                                            <td className="text-right text-red-700 text-lg">
                                                ฿{task.totalCost?.toLocaleString() || "0"}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <Box size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500">{t('no_parts_used')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Asset Card */}
                    <div className="card overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-200">
                             <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Box size={18} />
                                {t('asset_details')}
                             </h3>
                        </div>
                        <div className="p-4">
                             {task.asset.image && (
                                 <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden border border-slate-200">
                                     <Image 
                                        src={task.asset.image} 
                                        alt={task.asset.modelName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                     />
                                 </div>
                             )}
                             <div className="space-y-3">
                                 <div>
                                     <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('model')}</div>
                                     <div className="font-medium text-slate-900">{task.asset.modelName}</div>
                                 </div>
                                 <div>
                                     <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('serial_number')}</div>
                                     <div className="font-mono text-sm bg-slate-100 px-2 py-1 rounded inline-block">{task.asset.serialNumber}</div>
                                 </div>
                                 <div>
                                     <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('location')}</div>
                                     <div className="flex items-start gap-2 text-slate-700">
                                         <MapPin size={16} className="mt-0.5 text-red-500" />
                                         {task.asset.location?.name || t('unassigned')}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Assigned Technician */}
                    <div className="card">
                         <div className="bg-slate-50 p-4 border-b border-slate-200">
                             <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <User size={18} />
                                {t('assigned_technician')}
                             </h3>
                         </div>
                         <div className="p-4">
                             {task.assignedEmployee ? (
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                         {task.assignedEmployee.name.charAt(0)}
                                     </div>
                                     <div>
                                         <div className="font-medium text-slate-900">{task.assignedEmployee.name}</div>
                                         <div className="text-xs text-slate-500">Technician</div>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="text-sm text-slate-500 italic px-2">
                                     {t('unassigned')}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>

            <PartSelectorModal 
                isOpen={isPartModalOpen}
                onClose={() => setIsPartModalOpen(false)}
                onSelect={handleAddPart}
            />

            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                isLoading={actionLoading} 
            />
        </div>
    );
}
