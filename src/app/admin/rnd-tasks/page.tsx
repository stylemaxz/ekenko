"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import {
    FlaskConical,
    ClipboardList,
    CheckCircle,
    Clock,
    Package,
    Search,
    Filter,
    ChevronDown,
    X,
    Plus
} from 'lucide-react';

interface RndTask {
    id: string;
    title: string;
    description?: string;
    taskType: string;
    priority: string;
    status: string;
    dueDate: string;
    createdAt: string;
    project: {
        id: string;
        name: string;
        customer: { name: string };
    };
    sample?: {
        sampleNumber: string;
        product: { name: string };
    };
    assignee: { id: string; name: string };
    creator: { name: string };
}

export default function AdminRndTasksPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<RndTask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<RndTask[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Task detail modal
    const [selectedTask, setSelectedTask] = useState<RndTask | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchQuery, statusFilter, typeFilter]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/rnd-tasks');
            
            if (!res.ok) {
                if (res.status === 401) {
                   // Handle unauthorized if needed, or let middleware handle it
                   throw new Error('Unauthorized');
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch tasks');
            }

            const data = await res.json();
            
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                console.error('Invalid data format received:', data);
                setTasks([]);
                showToast(t('load_failed'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast(t('load_failed'), 'error');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const filterTasks = () => {
        let filtered = [...tasks];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.project.name.toLowerCase().includes(query) ||
                t.assignee.name.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.taskType === typeFilter);
        }

        setFilteredTasks(filtered);
    };

    const handleUpdateStatus = async (taskId: string, status: string) => {
        try {
            const res = await fetch(`/api/rnd-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update task');

            showToast(t('task_updated'), 'success');
            fetchData();
            setSelectedTask(null);
        } catch (error) {
            showToast(t('error_updating_task'), 'error');
        }
    };

    const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        sampleFollowups: tasks.filter(t => t.taskType === 'sample_followup' && t.status !== 'completed').length,
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'sample_followup': return <Package size={16} className="text-blue-500" />;
            case 'development': return <FlaskConical size={16} className="text-purple-500" />;
            default: return <ClipboardList size={16} className="text-slate-500" />;
        }
    };

    if (loading) {
        return <div className="p-6">{t('loading')}</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('rnd_tasks')}</h1>
                    <p className="text-slate-500 text-sm">{t('manage_rnd_tasks')}</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="text-purple-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('total_tasks')}</div>
                            <div className="text-2xl font-bold">{taskStats.total}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <Clock className="text-yellow-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_pending')}</div>
                            <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="text-blue-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_in_progress')}</div>
                            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('status_completed')}</div>
                            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <Package className="text-orange-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('sample_followups')}</div>
                            <div className="text-2xl font-bold text-orange-600">{taskStats.sampleFollowups}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('search_tasks')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Filter size={18} />
                        {t('filters')}
                        <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">{t('status')}</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input w-full"
                            >
                                <option value="all">{t('all')}</option>
                                <option value="pending">{t('status_pending')}</option>
                                <option value="in_progress">{t('status_in_progress')}</option>
                                <option value="completed">{t('status_completed')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">{t('task_type')}</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="input w-full"
                            >
                                <option value="all">{t('all')}</option>
                                <option value="sample_followup">{t('task_type_sample_followup')}</option>
                                <option value="development">{t('task_type_development')}</option>
                                <option value="revision">{t('task_type_revision')}</option>
                                <option value="testing">{t('task_type_testing')}</option>
                                <option value="documentation">{t('task_type_documentation')}</option>
                                <option value="general">{t('task_type_general')}</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Tasks Table */}
            <div className="card">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">{t('all_tasks')}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('type')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('title')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('project')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('assigned_to')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('priority')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('due_date')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        {t('no_tasks_found')}
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map(task => (
                                    <tr
                                        key={task.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getTaskTypeIcon(task.taskType)}
                                                <span className="text-xs text-slate-600">{t(`task_type_${task.taskType}` as any)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{task.title}</div>
                                            {task.sample && (
                                                <div className="text-xs text-blue-600">{task.sample.sampleNumber}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900">{task.project.name}</div>
                                            <div className="text-xs text-slate-500">{task.project.customer.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{task.assignee.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(task.priority)}`}>
                                                {t(`priority_${task.priority}` as any)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(task.status)}`}>
                                                {t(`status_${task.status}` as any)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('task_details')}</h2>
                            <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                {getTaskTypeIcon(selectedTask.taskType)}
                                <span className="text-sm text-slate-600">{t(`task_type_${selectedTask.taskType}` as any)}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                                    {t(`status_${selectedTask.status}` as any)}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                                    {t(`priority_${selectedTask.priority}` as any)}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold text-slate-900">{selectedTask.title}</h3>

                            {selectedTask.description && (
                                <p className="text-slate-600">{selectedTask.description}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">{t('project')}:</span>
                                    <p className="font-medium">{selectedTask.project.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('customer')}:</span>
                                    <p className="font-medium">{selectedTask.project.customer.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('assigned_to')}:</span>
                                    <p className="font-medium">{selectedTask.assignee.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('due_date')}:</span>
                                    <p className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('created_by')}:</span>
                                    <p className="font-medium">{selectedTask.creator.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('created_at')}:</span>
                                    <p className="font-medium">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedTask.sample && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">{t('related_sample')}:</span> {selectedTask.sample.sampleNumber}
                                    </p>
                                    <p className="text-xs text-blue-600">{selectedTask.sample.product.name}</p>
                                </div>
                            )}

                            {selectedTask.status !== 'completed' && (
                                <div className="flex gap-2 pt-4 border-t border-slate-200">
                                    {selectedTask.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                                            className="btn btn-outline flex-1"
                                        >
                                            {t('start_task')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                                        className="btn btn-primary flex-1"
                                    >
                                        {t('mark_complete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
