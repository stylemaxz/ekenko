"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
    ArrowLeft, Calendar, Clock, MapPin, User, 
    FileText, CheckSquare, AlertTriangle, Wrench,
    Box, DollarSign
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduledDate: string;
    estimatedHours?: number;
    notes?: string;
    asset: {
        serialNumber: string;
        modelName: string;
        location?: {
            name: string;
        };
    };
    assignedEmployee?: {
        name: string;
        email: string;
    };
    partsUsage: {
        id: string;
        quantity: number;
        part: {
            name: string;
            partNumber: string;
            price: number;
            unit?: string;
        };
    }[];
    totalCost?: number;
    createdAt: string;
    updatedAt: string;
}

export default function AdminMaintenanceTaskDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { showToast } = useToast();
    
    const [task, setTask] = useState<MaintenanceTask | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchTaskDetails();
    }, [id]);

    const fetchTaskDetails = async () => {
        try {
            const res = await fetch(`/api/maintenance-tasks/${id}`);
            if (!res.ok) throw new Error('Failed to fetch task');
            const data = await res.json();
            setTask(data);
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to load task details', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
    if (!task) return <div className="p-8 text-center">Task not found</div>;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-100 text-slate-600';
            case 'assigned': return 'bg-blue-100 text-blue-600';
            case 'in_progress': return 'bg-blue-100 text-blue-600';
            case 'completed': return 'bg-green-100 text-green-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button 
                onClick={() => router.back()}
                className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                {t('back')}
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                            {t(`priority_${task.priority}` as any)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getStatusColor(task.status)}`}>
                            {t(`status_${task.status}` as any)}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Box size={16} />
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-sm text-slate-700">
                            {task.asset.serialNumber}
                        </span>
                        <span>•</span>
                        <span>{task.asset.modelName}</span>
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

                    {/* Technician Notes */}
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckSquare size={20} className="text-red-600" />
                            {t('technician_notes')}
                        </h2>
                        {task.notes ? (
                            <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-line border border-slate-100">
                                {task.notes}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic">No notes recorded</div>
                        )}
                    </div>

                    {/* Parts Used */}
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Wrench size={20} className="text-red-600" />
                            {t('parts_used')}
                        </h2>
                        
                        {task.partsUsage && task.partsUsage.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('part_name')}</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">{t('quantity')}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('cost')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {task.partsUsage.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">{item.part.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{item.part.partNumber}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-700">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    ฿{(item.part.price * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}

                                        <tr className="bg-slate-50 font-bold">
                                            <td colSpan={2} className="px-4 py-3 text-right text-slate-900">{t('total_cost')}</td>
                                            <td className="px-4 py-3 text-right text-red-700">
                                                ฿{task.totalCost?.toLocaleString() || "0"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                {t('no_parts_used')}
                            </div>
                        )}
                    </div>

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-bold text-slate-900 mb-4">{t('task_info')}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('scheduled_date')}</div>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Calendar size={16} className="text-red-500" />
                                    {new Date(task.scheduledDate).toLocaleDateString()}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('estimated_hours')}</div>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Clock size={16} className="text-red-500" />
                                    {task.estimatedHours || '-'} {t('hours')}
                                </div>
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

                    <div className="card p-6">
                        <h3 className="font-bold text-slate-900 mb-4">{t('assigned_technician')}</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                {task.assignedEmployee?.name?.charAt(0) || <User size={20} />}
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">{task.assignedEmployee?.name || t('unassigned')}</div>
                                <div className="text-xs text-slate-500">{task.assignedEmployee?.email}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
