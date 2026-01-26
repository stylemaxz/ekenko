"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wrench, ClipboardList, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { CreateMaintenanceTaskModal } from '@/components/admin/CreateMaintenanceTaskModal';

export default function AdminMaintenancePage() {
    const { t } = useLanguage();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, empRes] = await Promise.all([
                fetch('/api/maintenance-tasks'),
                fetch('/api/employees?role=maintenance')
            ]);
            
            const tasksData = await tasksRes.json();
            const empData = await empRes.json();
            
            setTasks(tasksData);
            setEmployees(empData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const tasksByStatus = {
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
    };

    const tasksByPriority = {
        urgent: tasks.filter((t: any) => t.priority === 'urgent').length,
        high: tasks.filter((t: any) => t.priority === 'high').length,
        medium: tasks.filter((t: any) => t.priority === 'medium').length,
        low: tasks.filter((t: any) => t.priority === 'low').length,
    };

    if (loading) {
        return <div className="p-6">{t('loading')}</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('maintenance_management')}</h1>
                    <p className="text-slate-500 text-sm">{t('team_performance')}</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t('create_task')}
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <Wrench className="text-indigo-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('active_tasks')}</div>
                            <div className="text-2xl font-bold">{tasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="text-orange-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_pending')}</div>
                            <div className="text-2xl font-bold text-orange-600">{tasksByStatus.pending}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-blue-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_in_progress')}</div>
                            <div className="text-2xl font-bold text-blue-600">{tasksByStatus.in_progress}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_completed')}</div>
                            <div className="text-2xl font-bold text-green-600">{tasksByStatus.completed}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks by Priority */}
            <div className="card mb-8">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">{t('tasks_by_priority')}</h2>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{tasksByPriority.urgent}</div>
                        <div className="text-sm text-slate-600">{t('priority_urgent')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{tasksByPriority.high}</div>
                        <div className="text-sm text-slate-600">{t('priority_high')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{tasksByPriority.medium}</div>
                        <div className="text-sm text-slate-600">{t('priority_medium')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{tasksByPriority.low}</div>
                        <div className="text-sm text-slate-600">{t('priority_low')}</div>
                    </div>
                </div>
            </div>

            {/* All Tasks Table */}
            <div className="card">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">{t('all_tasks')}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('asset')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('task_title')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('priority')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('assigned_technician')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {tasks.map((task: any) => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm">
                                        {task.asset?.serialNumber}
                                        <div className="text-xs text-slate-500">{task.asset?.modelName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{task.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {t(`priority_${task.priority}` as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded bg-slate-100">
                                            {t(`status_${task.status}` as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {task.assignedEmployee?.name || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <CreateMaintenanceTaskModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
