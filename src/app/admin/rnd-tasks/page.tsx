"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import Combobox from '@/components/ui/Combobox';
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
    Plus,
    Smile,
    Meh,
    Frown,
    MessageSquare
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
        notes?: string;
        product: { name: string };
        feedback?: {
            customerReaction: string;
            comments?: string;
        };
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
            case 'overdue': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'sample_followup': return <Package size={16} className="text-[var(--color-primary)]" />;
            case 'development': return <FlaskConical size={16} className="text-purple-500" />;
            default: return <ClipboardList size={16} className="text-slate-500" />;
        }
    };
    
    // Helper to get reaction icon
    const getReactionIcon = (reaction?: string) => {
        switch (reaction) {
            case 'very_positive':
            case 'positive':
                return <Smile size={18} className="text-green-500" />;
            case 'neutral':
                return <Meh size={18} className="text-yellow-500" />;
            case 'negative':
            case 'very_negative':
                return <Frown size={18} className="text-red-500" />;
            default:
                return null;
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
                        <FlaskConical className="text-[var(--color-primary)] opacity-80" size={24} />
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
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="text-sm font-medium text-slate-700 mb-1 block">{t('search')}</label>
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_tasks')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-outline flex items-center gap-2 mb-[1px]"
                    >
                        <Filter size={18} />
                        {t('filters')}
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <Combobox
                            label={t('status')}
                            options={[
                                { id: 'all', label: t('all') },
                                { id: 'pending', label: t('status_pending') },
                                { id: 'in_progress', label: t('status_in_progress') },
                                { id: 'completed', label: t('status_completed') },
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                        
                        <Combobox
                            label={t('task_type')}
                            options={[
                                { id: 'all', label: t('all') },
                                { id: 'sample_followup', label: t('task_type_sample_followup') },
                                { id: 'development', label: t('task_type_development') },
                                { id: 'revision', label: t('task_type_revision') },
                                { id: 'testing', label: t('task_type_testing') },
                                { id: 'documentation', label: t('task_type_documentation') },
                                { id: 'general', label: t('task_type_general') },
                            ]}
                            value={typeFilter}
                            onChange={setTypeFilter}
                        />
                    </div>
                )}
            </div>

            {/* Tasks Table */}
            <div className="card">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('all_tasks')}</h2>
                    <span className="text-sm text-slate-500">{filteredTasks.length} {t('tasks_total')}</span>
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
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getTaskTypeIcon(task.taskType)}
                                                <span className="text-xs text-slate-600">{t(`task_type_${task.taskType}` as any)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 group flex items-center gap-2">
                                                {task.title}
                                                {task.sample?.feedback && (
                                                    <span title={t('feedback_received')}>
                                                        {getReactionIcon(task.sample.feedback.customerReaction)}
                                                    </span>
                                                )}
                                                {task.sample?.notes && (
                                                    <MessageSquare size={14} className="text-slate-400" />
                                                )}
                                            </div>
                                            {task.sample && (
                                                <div className="text-xs text-[var(--color-primary)] font-medium mt-0.5">
                                                    {task.sample.sampleNumber}
                                                </div>
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
                            <h2 className="text-lg font-semibold text-slate-900">{t('task_details')}</h2>
                            <button 
                                onClick={() => setSelectedTask(null)} 
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Tags */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {getTaskTypeIcon(selectedTask.taskType)}
                                <span className="text-sm font-medium text-slate-700">{t(`task_type_${selectedTask.taskType}` as any)}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedTask.status)}`}>
                                    {t(`status_${selectedTask.status}` as any)}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(selectedTask.priority)}`}>
                                    {t(`priority_${selectedTask.priority}` as any)}
                                </span>
                            </div>

                            {/* Title & Description */}
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedTask.title}</h3>
                                {selectedTask.description && (
                                    <p className="text-slate-600 whitespace-pre-wrap">{selectedTask.description}</p>
                                )}
                            </div>

                             {/* Sample Info - Highlighted */}
                             {selectedTask.sample && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                        <Package size={16} />
                                        {t('sample_information')}
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">{t('sample_number')}</span>
                                            <p className="font-medium text-[var(--color-primary)]">{selectedTask.sample.sampleNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">{t('product')}</span>
                                            <p className="font-medium">{selectedTask.sample.product.name}</p>
                                        </div>
                                    </div>

                                    {/* Sample Notes */}
                                    {selectedTask.sample.notes && (
                                        <div className="pt-2 border-t border-slate-200">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">{t('notes')}</span>
                                            <p className="text-sm text-slate-700 italic bg-white p-2 rounded border border-slate-100">
                                                "{selectedTask.sample.notes}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Customer Feedback */}
                                    {selectedTask.sample.feedback && (
                                        <div className="pt-2 border-t border-slate-200">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">{t('customer_feedback')}</span>
                                            <div className="bg-white p-3 rounded border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getReactionIcon(selectedTask.sample.feedback.customerReaction)}
                                                    <span className="font-medium text-slate-900">
                                                        {t(`reaction_${selectedTask.sample.feedback.customerReaction}` as any)}
                                                    </span>
                                                </div>
                                                {selectedTask.sample.feedback.comments && (
                                                     <p className="text-sm text-slate-600">
                                                        "{selectedTask.sample.feedback.comments}"
                                                     </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm pt-2">
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('project')}</span>
                                    <p className="font-medium text-slate-900">{selectedTask.project.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('customer')}</span>
                                    <p className="font-medium text-slate-900">{selectedTask.project.customer.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('assigned_to')}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {selectedTask.assignee.name.charAt(0)}
                                        </div>
                                        <p className="font-medium text-slate-900">{selectedTask.assignee.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('created_by')}</span>
                                    <p className="font-medium text-slate-900">{selectedTask.creator.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('due_date')}</span>
                                    <p className="font-medium text-slate-900">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('created_at')}</span>
                                    <p className="font-medium text-slate-900">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedTask.status !== 'completed' && (
                                <div className="flex gap-3 pt-6 border-t border-slate-200">
                                    {selectedTask.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                                            className="btn btn-outline flex-1 py-2.5"
                                        >
                                            {t('start_task')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                                        className="btn btn-primary flex-1 py-2.5 shadow-lg shadow-primary/20"
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
