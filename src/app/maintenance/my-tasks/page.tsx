"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function MyTasksPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            const user = await userRes.json();
            
            const tasksRes = await fetch(`/api/maintenance-tasks?assignedTo=${user.id}`);
            const data = await tasksRes.json();
            setTasks(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">{t('loading')}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{t('nav_my_tasks')}</h1>
            
            <div className="card">
                {tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {t('no_tasks_status')}
                    </div>
                ) : (
                    <div className="divide-y">
                        {tasks.map((task: any) => (
                            <div key={task.id} className="p-4 hover:bg-slate-50 cursor-pointer"
                                 onClick={() => router.push(`/maintenance/tasks/${task.id}`)}>
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-slate-600">{task.asset?.serialNumber}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
