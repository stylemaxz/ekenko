"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AllTasksPage() {
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{t('nav_all_tasks')}</h1>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['ALL', 'pending', 'assigned', 'in_progress', 'completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                            statusFilter === status
                                ? 'bg-primary text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {status === 'ALL' ? t('all_tasks') : t(`status_${status}` as any)}
                    </button>
                ))}
            </div>

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center">{t('loading')}</div>
                ) : tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">{t('no_tasks_status')}</div>
                ) : (
                    <div className="divide-y">
                        {tasks.map((task: any) => (
                            <div key={task.id} className="p-4">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-slate-600">
                                    {task.asset?.serialNumber} - {task.asset?.modelName}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <span className="badge">{t(`priority_${task.priority}` as any)}</span>
                                    <span className="badge">{t(`status_${task.status}` as any)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
