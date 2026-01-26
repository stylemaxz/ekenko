"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import {
    FolderOpen,
    Plus,
    Search,
    Package,
    CheckCircle,
    Clock,
    PauseCircle,
    XCircle,
    ChevronRight,
    X
} from 'lucide-react';
import Combobox from '@/components/ui/Combobox';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    startDate: string;
    targetDate?: string;
    customer: {
        id: string;
        name: string;
    };
    location?: {
        id: string;
        name: string;
    };
    products: any[];
    rndTasks: any[];
}

interface Company {
    id: string;
    name: string;
}

interface Location {
    id: string;
    name: string;
}

export default function AdminProjectsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        customerId: '',
        locationId: '',
        targetDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch locations when customer changes
    useEffect(() => {
        if (newProject.customerId) {
            fetchLocations(newProject.customerId);
        } else {
            setLocations([]);
        }
    }, [newProject.customerId]);

    const fetchData = async () => {
        try {
            const [projectsRes, companiesRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/companies')
            ]);

            const projectsData = await projectsRes.json().catch(() => []);
            const companiesData = await companiesRes.json().catch(() => []);

            if (projectsRes.ok && Array.isArray(projectsData)) {
                setProjects(projectsData);
            } else {
                console.error('Invalid projects data:', projectsData);
                setProjects([]);
                // Only show toast if it's a real error, not just empty
                if (!projectsRes.ok) showToast(t('load_failed'), 'error');
            }

            if (companiesRes.ok && Array.isArray(companiesData)) {
                setCompanies(companiesData);
            } else {
                console.error('Invalid companies data:', companiesData);
                setCompanies([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast(t('load_failed'), 'error');
            setProjects([]);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async (customerId: string) => {
        try {
            const res = await fetch(`/api/companies/${customerId}/locations`);
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocations([]);
        }
    };

    const handleCreateProject = async () => {
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });

            if (!res.ok) throw new Error('Failed to create project');

            const project = await res.json();
            showToast(t('project_created'), 'success');
            setShowCreateModal(false);
            setNewProject({ name: '', description: '', customerId: '', locationId: '', targetDate: '' });
            router.push(`/admin/projects/${project.id}`);
        } catch (error) {
            showToast(t('error_creating_project'), 'error');
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const projectStats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        completed: projects.filter(p => p.status === 'completed').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'on_hold': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Prepare options for Combobox
    const companyOptions = companies.map(c => ({ id: c.id, label: c.name }));
    const locationOptions = locations.map(l => ({ id: l.id, label: l.name }));

    if (loading) {
        return <div className="p-6">{t('loading')}</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('project_management')}</h1>
                    <p className="text-slate-500 text-sm">{t('manage_oem_rnd_projects')}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t('create_project')}
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6 border-l-4 border-l-[var(--color-primary)]">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="text-[var(--color-primary)]" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('total_projects')}</div>
                            <div className="text-2xl font-bold">{projectStats.total}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('project_status_active')}</div>
                            <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <PauseCircle className="text-yellow-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('project_status_on_hold')}</div>
                            <div className="text-2xl font-bold text-yellow-600">{projectStats.onHold}</div>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <Clock className="text-blue-600" size={24} />
                        <div>
                            <div className="text-sm text-slate-500">{t('project_status_completed')}</div>
                            <div className="text-2xl font-bold text-blue-600">{projectStats.completed}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('search_projects')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full focus:ring-[var(--color-primary)/20] focus:border-[var(--color-primary)]"
                    />
                </div>
            </div>

            {/* Projects Table */}
            <div className="card">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">{t('all_projects')}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('project_name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('customer')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('products')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('pending_tasks')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('start_date')}</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        {t('no_projects_found')}
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => {
                                    const pendingTasks = project.rndTasks.filter((t: any) => t.status !== 'completed').length;
                                    return (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-slate-50 cursor-pointer"
                                            onClick={() => router.push(`/admin/projects/${project.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 hover:text-[var(--color-primary)] transition-colors">
                                                    {project.name}
                                                </div>
                                                {project.description && (
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{project.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div>{project.customer.name}</div>
                                                {project.location && (
                                                    <div className="text-xs text-slate-400">{project.location.name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Package size={14} className="text-slate-400" />
                                                    {project.products.length}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(project.status)}`}>
                                                    {t(`project_status_${project.status}` as any)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {pendingTasks > 0 ? (
                                                    <span className="text-sm text-orange-600 font-medium">{pendingTasks}</span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(project.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ChevronRight size={18} className="text-slate-400" />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('create_project')}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('project_name')} *</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="input w-full focus:ring-[var(--color-primary)/20] focus:border-[var(--color-primary)]"
                                    placeholder={t('enter_project_name')}
                                />
                            </div>

                            <Combobox
                                label={`${t('customer')} *`}
                                options={companyOptions}
                                value={newProject.customerId}
                                onChange={(value) => setNewProject({ ...newProject, customerId: value, locationId: '' })}
                                placeholder={t('select_customer')}
                                searchPlaceholder={t('search_customers')}
                                required
                            />

                            <Combobox
                                label={t('branch')}
                                options={locationOptions}
                                value={newProject.locationId}
                                onChange={(value) => setNewProject({ ...newProject, locationId: value })}
                                placeholder={t('select_branch')}
                                searchPlaceholder={t('search_location')}
                                disabled={!newProject.customerId}
                            />

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('description')}</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="input w-full focus:ring-[var(--color-primary)/20] focus:border-[var(--color-primary)]"
                                    rows={3}
                                    placeholder={t('enter_project_description')}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('target_date')}</label>
                                <input
                                    type="date"
                                    value={newProject.targetDate}
                                    onChange={(e) => setNewProject({ ...newProject, targetDate: e.target.value })}
                                    className="input w-full focus:ring-[var(--color-primary)/20] focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="btn btn-outline flex-1">
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={!newProject.name || !newProject.customerId}
                                className="btn bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md active:scale-95 flex-1 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {t('create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
