"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { ClipboardList, CheckCircle, Clock, Wrench, ArrowRight } from 'lucide-react';

interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    asset: {
        serialNumber: string;
        modelName: string;
    };
    scheduledDate?: string;
    estimatedHours?: number;
}

export default function MaintenanceDashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get current user
            const userRes = await fetch('/api/auth/me');
            const user = await userRes.json();
            setCurrentUser(user);

            // Get my tasks
            const tasksRes = await fetch(`/api/maintenance-tasks?assignedTo=${user.id}`);
            const myTasks = await tasksRes.json();
            setTasks(myTasks);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const myPendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'assigned');
    const myActiveTasks = tasks.filter(t => t.status === 'in_progress');
    const completedToday = tasks.filter(t => {
        if (t.status !== 'completed') return false;
        // Simple check, should use actual completion date
        return true;
    }).length;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleStartTask = async (taskId: string) => {
        try {
            await fetch(`/api/maintenance-tasks/${taskId}/start`, { method: 'POST' });
            fetchData();
        } catch (error) {
            console.error('Error starting task:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500">{t('loading')}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">{t('nav_maintenance_dashboard')}</h1>
                <p className="text-slate-500 text-sm">{t('maintenance_management')}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <ClipboardList size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">{t('my_pending_tasks')}</div>
                            <div className="text-2xl font-bold text-slate-900">{myPendingTasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">{t('my_active_tasks')}</div>
                            <div className="text-2xl font-bold text-slate-900">{myActiveTasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">{t('completed_today')}</div>
                            <div className="text-2xl font-bold text-slate-900">{completedToday}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Tasks List */}
            <div className="card">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">{t('my_active_tasks')}</h2>
                </div>

                <div className="divide-y divide-slate-200">
                    {myActiveTasks.length === 0 && myPendingTasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            {t('no_tasks_status')}
                        </div>
                    ) : (
                        <>
                            {myActiveTasks.map(task => (
                                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                    {t(`priority_${task.priority}` as any)}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {task.asset.serialNumber} - {task.asset.modelName}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-slate-900 mb-1">{task.title}</h3>
                                            <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                                            {task.estimatedHours && (
                                                <div className="text-xs text-slate-500 mt-2">
                                                    {t('estimated_hours')}: {task.estimatedHours} {t('hours' as any)}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => router.push(`/maintenance/tasks/${task.id}`)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            {t('view_details')}
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {myPendingTasks.map(task => (
                                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                    {t(`priority_${task.priority}` as any)}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {task.asset.serialNumber} - {task.asset.modelName}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-slate-900 mb-1">{task.title}</h3>
                                            <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleStartTask(task.id)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            {t('start_task')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
