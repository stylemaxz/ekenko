"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import {
    FolderOpen,
    FlaskConical,
    ClipboardList,
    CheckCircle,
    Clock,
    ArrowRight,
    Package,
    MessageSquare
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    status: string;
    customer: {
        name: string;
    };
    products: any[];
}

interface RndTask {
    id: string;
    title: string;
    description?: string;
    taskType: string;
    priority: string;
    status: string;
    dueDate: string;
    project: {
        name: string;
        customer: {
            name: string;
        };
    };
    sample?: {
        sampleNumber: string;
        product: {
            name: string;
        };
    };
}

export default function RndDashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<RndTask[]>([]);
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

            // Fetch projects and tasks in parallel
            const [projectsRes, tasksRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/rnd-tasks')
            ]);

            const [projectsData, tasksData] = await Promise.all([
                projectsRes.json(),
                tasksRes.json()
            ]);

            setProjects(projectsData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeProjects = projects.filter(p => p.status === 'active');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const sampleFollowUps = tasks.filter(t => t.taskType === 'sample_followup' && t.status !== 'completed');

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'sample_followup': return <Package size={16} className="text-blue-500" />;
            case 'development': return <FlaskConical size={16} className="text-purple-500" />;
            case 'revision': return <MessageSquare size={16} className="text-orange-500" />;
            default: return <ClipboardList size={16} className="text-slate-500" />;
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
                <h1 className="text-2xl font-bold text-slate-900">{t('nav_rnd_dashboard')}</h1>
                <p className="text-slate-500 text-sm">{t('rnd_dashboard_subtitle')}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FolderOpen size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">{t('active_projects')}</div>
                            <div className="text-xl font-bold text-slate-900">{activeProjects.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <ClipboardList size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">{t('pending_tasks')}</div>
                            <div className="text-xl font-bold text-slate-900">{pendingTasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">{t('in_progress')}</div>
                            <div className="text-xl font-bold text-slate-900">{inProgressTasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">{t('completed')}</div>
                            <div className="text-xl font-bold text-slate-900">{completedTasks.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sample Follow-ups Alert */}
            {sampleFollowUps.length > 0 && (
                <div className="card bg-blue-50 border-blue-200 p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-blue-600" />
                        <div className="flex-1">
                            <h3 className="font-medium text-blue-900">{t('pending_sample_feedback')}</h3>
                            <p className="text-sm text-blue-700">{sampleFollowUps.length} {t('samples_awaiting_feedback')}</p>
                        </div>
                        <button
                            onClick={() => router.push('/rnd/tasks?filter=sample_followup')}
                            className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {t('view_all')}
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Projects */}
            <div className="card mb-6">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">{t('recent_projects')}</h2>
                    <button
                        onClick={() => router.push('/rnd/projects')}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        {t('view_all')} <ArrowRight size={14} />
                    </button>
                </div>

                <div className="divide-y divide-slate-200">
                    {activeProjects.slice(0, 3).map(project => (
                        <div
                            key={project.id}
                            onClick={() => router.push(`/rnd/projects/${project.id}`)}
                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-900">{project.name}</h3>
                                    <p className="text-sm text-slate-500">{project.customer.name}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-slate-600">
                                        {project.products.length} {t('products')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeProjects.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            {t('no_active_projects')}
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">{t('upcoming_tasks')}</h2>
                    <button
                        onClick={() => router.push('/rnd/tasks')}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        {t('view_all')} <ArrowRight size={14} />
                    </button>
                </div>

                <div className="divide-y divide-slate-200">
                    {[...pendingTasks, ...inProgressTasks].slice(0, 5).map(task => (
                        <div
                            key={task.id}
                            className="p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    {getTaskTypeIcon(task.taskType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                            {t(`priority_${task.priority}` as any)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-slate-900 truncate">{task.title}</h3>
                                    <p className="text-sm text-slate-500 truncate">
                                        {task.project.name} - {task.project.customer.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(`/rnd/tasks?taskId=${task.id}`)}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {pendingTasks.length === 0 && inProgressTasks.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            {t('no_pending_tasks')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
