"use client";

import { useState, useEffect, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import {
    Search,
    Filter,
    Plus,
    Package,
    FlaskConical,
    ClipboardList,
    MessageSquare,
    ChevronDown,
    X,
    Send
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface RndTask {
    id: string;
    title: string;
    description?: string;
    taskType: string;
    priority: string;
    status: string;
    dueDate: string;
    completionNote?: string;
    createdAt: string;
    project: {
        id: string;
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
    assignee: {
        id: string;
        name: string;
    };
    creator: {
        name: string;
    };
    comments: {
        id: string;
        content: string;
        createdAt: string;
        author: {
            name: string;
            avatar?: string;
        };
    }[];
}

interface Employee {
    id: string;
    name: string;
    role: string;
}

interface Project {
    id: string;
    name: string;
}

function RndTasksContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<RndTask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<RndTask[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('filter') || 'all');
    const [showFilters, setShowFilters] = useState(false);

    // Task detail modal
    const [selectedTask, setSelectedTask] = useState<RndTask | null>(null);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Create task modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        projectId: '',
        title: '',
        description: '',
        taskType: 'general',
        assigneeId: '',
        dueDate: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchQuery, statusFilter, typeFilter]);

    useEffect(() => {
        const taskId = searchParams.get('taskId');
        if (taskId && tasks.length > 0) {
            const task = tasks.find(t => t.id === taskId);
            if (task) setSelectedTask(task);
        }
    }, [searchParams, tasks]);

    const fetchData = async () => {
        try {
            const [tasksRes, employeesRes, projectsRes] = await Promise.all([
                fetch('/api/rnd-tasks'),
                fetch('/api/employees'),
                fetch('/api/projects')
            ]);

            const [tasksData, employeesData, projectsData] = await Promise.all([
                tasksRes.json(),
                employeesRes.json(),
                projectsRes.json()
            ]);

            setTasks(tasksData);
            setEmployees(employeesData.filter((e: Employee) => ['sales', 'rnd'].includes(e.role)));
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast(t('load_failed'), 'error');
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
                t.project.customer.name.toLowerCase().includes(query)
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

    const handleCreateTask = async () => {
        try {
            const res = await fetch('/api/rnd-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if (!res.ok) throw new Error('Failed to create task');

            showToast(t('task_created'), 'success');
            setShowCreateModal(false);
            setNewTask({
                projectId: '',
                title: '',
                description: '',
                taskType: 'general',
                assigneeId: '',
                dueDate: '',
                priority: 'medium'
            });
            fetchData();
        } catch (error) {
            showToast(t('error_creating_task'), 'error');
        }
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

            if (selectedTask?.id === taskId) {
                setSelectedTask({ ...selectedTask, status });
            }
        } catch (error) {
            showToast(t('error_updating_task'), 'error');
        }
    };

    const handleAddComment = async () => {
        if (!selectedTask || !newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/rnd-tasks/${selectedTask.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (!res.ok) throw new Error('Failed to add comment');

            const comment = await res.json();
            setSelectedTask({
                ...selectedTask,
                comments: [...selectedTask.comments, comment]
            });
            setNewComment('');
            showToast(t('comment_added'), 'success');
        } catch (error) {
            showToast(t('error_adding_comment'), 'error');
        } finally {
            setSubmittingComment(false);
        }
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('nav_rnd_tasks')}</h1>
                    <p className="text-slate-500 text-sm">{t('manage_rnd_tasks')}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    {t('create_task')}
                </button>
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

            {/* Tasks List */}
            <div className="card">
                <div className="divide-y divide-slate-200">
                    {filteredTasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            {t('no_tasks_found')}
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        {getTaskTypeIcon(task.taskType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                                                {t(`status_${task.status}` as any)}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {t(`priority_${task.priority}` as any)}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {t('due')}: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-medium text-slate-900">{task.title}</h3>
                                        <p className="text-sm text-slate-500">
                                            {task.project.name} - {task.project.customer.name}
                                        </p>
                                        {task.sample && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                {t('sample')}: {task.sample.sampleNumber} ({task.sample.product.name})
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>{task.assignee.name}</p>
                                        {task.comments.length > 0 && (
                                            <p className="text-xs">{task.comments.length} {t('comments')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:max-w-2xl md:rounded-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('task_details')}</h2>
                            <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Task Info */}
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
                            </div>

                            {selectedTask.sample && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">{t('related_sample')}:</span> {selectedTask.sample.sampleNumber}
                                    </p>
                                    <p className="text-xs text-blue-600">{selectedTask.sample.product.name}</p>
                                </div>
                            )}

                            {/* Status Actions */}
                            {selectedTask.status !== 'completed' && (
                                <div className="flex gap-2">
                                    {selectedTask.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                                            className="btn btn-primary flex-1"
                                        >
                                            {t('start_task')}
                                        </button>
                                    )}
                                    {selectedTask.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                                            className="btn btn-primary flex-1"
                                        >
                                            {t('mark_complete')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="border-t border-slate-200 pt-4">
                                <h4 className="font-medium text-slate-900 mb-3">{t('comments')}</h4>

                                {selectedTask.comments.length === 0 ? (
                                    <p className="text-sm text-slate-500 mb-4">{t('no_comments')}</p>
                                ) : (
                                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                        {selectedTask.comments.map(comment => (
                                            <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={t('add_comment')}
                                        className="input flex-1"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={submittingComment || !newComment.trim()}
                                        className="btn btn-primary"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('create_task')}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('project')} *</label>
                                <select
                                    value={newTask.projectId}
                                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">{t('select_project')}</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('title')} *</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('description')}</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="input w-full"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('task_type')}</label>
                                    <select
                                        value={newTask.taskType}
                                        onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="general">{t('task_type_general')}</option>
                                        <option value="development">{t('task_type_development')}</option>
                                        <option value="revision">{t('task_type_revision')}</option>
                                        <option value="testing">{t('task_type_testing')}</option>
                                        <option value="documentation">{t('task_type_documentation')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('priority')}</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="low">{t('priority_low')}</option>
                                        <option value="medium">{t('priority_medium')}</option>
                                        <option value="high">{t('priority_high')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('assign_to')} *</label>
                                <select
                                    value={newTask.assigneeId}
                                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">{t('select_assignee')}</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('due_date')} *</label>
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-outline flex-1"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={!newTask.projectId || !newTask.title || !newTask.assigneeId || !newTask.dueDate}
                                    className="btn btn-primary flex-1"
                                >
                                    {t('create')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RndTasksPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-slate-500">Loading...</div></div>}>
            <RndTasksContent />
        </Suspense>
    );
}
