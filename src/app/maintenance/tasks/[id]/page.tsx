"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { 
    ArrowLeft, Calendar, Clock, MapPin, 
    Box, AlertTriangle, CheckCircle, 
    User, FileText, Play, CheckSquare, Loader2 
} from "lucide-react";
import Image from "next/image";

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

    const handleStatusChange = async (action: 'start' | 'complete') => {
        if (!confirm(t(`confirm_${action}_task` as any) || `Are you sure you want to ${action} this task?`)) return;

        setActionLoading(true);
        try {
            const endpoint = action === 'start' ? 'start' : 'complete';
            const res = await fetch(`/api/maintenance-tasks/${id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // For complete, we might need body (actual hours, notes), currently simple
                body: JSON.stringify(action === 'complete' ? { 
                    actualHours: task?.estimatedHours || 1, // Defaulting if not provided
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
        }
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
                                className="btn btn-success bg-green-600 hover:bg-green-700 text-white"
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
                            <FileText size={20} className="text-indigo-600" />
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
                                <FileText size={20} className="text-indigo-600" />
                                {t('technician_notes')}
                            </h2>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="btn btn-sm btn-outline text-indigo-600 border-indigo-200 hover:bg-indigo-50"
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
                                         <MapPin size={16} className="mt-0.5 text-indigo-500" />
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
                                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
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
        </div>
    );
}
