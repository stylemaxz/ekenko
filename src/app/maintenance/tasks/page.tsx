"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AllTasksPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchTasks();
    }, [statusFilter]);

    const fetchTasks = async () => {
        try {
            const url = statusFilter === 'ALL' 
                ? '/api/maintenance-tasks'
                : `/api/maintenance-tasks?status=${statusFilter}`;
            const res = await fetch(url);
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
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
            case 'in_progress': return 'bg-indigo-100 text-indigo-600'; // Keep in_progress indigo/blueish or maybe orange/yellow? Let's stick to standard status colors. Wait, user said "Theme system is Red". But status colors usually have semantic meaning. "In Progress" in blue/indigo is common. Let's keep semantic colors but ensure they look good. User specifically asked for "Medium" and "In Progress" to be visible tags.
            case 'completed': return 'bg-emerald-100 text-emerald-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">{t('nav_all_tasks')}</h1>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'pending', 'assigned', 'in_progress', 'completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                            statusFilter === status
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        {status === 'ALL' ? t('all_tasks') : t(`status_${status}` as any)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">{t('loading')}</div>
                ) : tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">{t('no_tasks_status')}</h3>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tasks.map((task: any) => (
                            <div 
                                key={task.id} 
                                onClick={() => router.push(`/maintenance/tasks/${task.id}`)}
                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{task.title}</div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 mb-3">
                                    {task.asset?.serialNumber} <span className="text-slate-300 mx-1">|</span> {task.asset?.modelName}
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                        {t(`priority_${task.priority}` as any)}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {t(`status_${task.status}` as any)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
