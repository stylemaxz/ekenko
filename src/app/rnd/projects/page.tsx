"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import {
    Search,
    Plus,
    FolderOpen,
    Package,
    ChevronRight,
    X,
    Filter,
    ChevronDown
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
    products: {
        id: string;
        name: string;
        status: string;
        samples: any[];
    }[];
    rndTasks: {
        status: string;
    }[];
}

interface Company {
    id: string;
    name: string;
}

export default function RndProjectsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        customerId: '',
        targetDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [projects, searchQuery, statusFilter]);

    const fetchData = async () => {
        try {
            const [projectsRes, companiesRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/companies')
            ]);

            const [projectsData, companiesData] = await Promise.all([
                projectsRes.json(),
                companiesRes.json()
            ]);

            setProjects(projectsData);
            setCompanies(companiesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast(t('load_failed'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterProjects = () => {
        let filtered = [...projects];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.customer.name.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        setFilteredProjects(filtered);
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
            setNewProject({ name: '', description: '', customerId: '', targetDate: '' });
            router.push(`/rnd/projects/${project.id}`);
        } catch (error) {
            showToast(t('error_creating_project'), 'error');
        }
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

    const getProductStatusCounts = (products: Project['products']) => {
        const counts = {
            development: 0,
            sampling: 0,
            approved: 0,
            production: 0
        };
        products.forEach(p => {
            if (counts[p.status as keyof typeof counts] !== undefined) {
                counts[p.status as keyof typeof counts]++;
            }
        });
        return counts;
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
                    <h1 className="text-2xl font-bold text-slate-900">{t('nav_projects')}</h1>
                    <p className="text-slate-500 text-sm">{t('manage_projects')}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    {t('create_project')}
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('search_projects')}
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
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <Combobox
                            label={t('status')}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { id: 'all', label: t('all') },
                                { id: 'active', label: t('project_status_active') },
                                { id: 'on_hold', label: t('project_status_on_hold') },
                                { id: 'completed', label: t('project_status_completed') },
                                { id: 'cancelled', label: t('project_status_cancelled') }
                            ]}
                            className="w-full md:w-64"
                        />
                    </div>
                )}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full card p-8 text-center text-slate-500">
                        {t('no_projects_found')}
                    </div>
                ) : (
                    filteredProjects.map(project => {
                        const productCounts = getProductStatusCounts(project.products);
                        const pendingTasks = project.rndTasks.filter(t => t.status !== 'completed').length;

                        return (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/rnd/projects/${project.id}`)}
                                className="card hover:shadow-lg cursor-pointer transition-all"
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                            <FolderOpen size={20} className="text-pink-600" />
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                            {t(`project_status_${project.status}` as any)}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
                                    <p className="text-sm text-slate-500 mb-3">{project.customer.name}</p>

                                    {project.description && (
                                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{project.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Package size={14} />
                                            {project.products.length} {t('products')}
                                        </span>
                                        {pendingTasks > 0 && (
                                            <span className="text-orange-600">
                                                {pendingTasks} {t('pending_tasks')}
                                            </span>
                                        )}
                                    </div>

                                    {project.products.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {productCounts.development > 0 && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                                                    {productCounts.development} {t('product_status_development')}
                                                </span>
                                            )}
                                            {productCounts.sampling > 0 && (
                                                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs rounded">
                                                    {productCounts.sampling} {t('product_status_sampling')}
                                                </span>
                                            )}
                                            {productCounts.approved > 0 && (
                                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded">
                                                    {productCounts.approved} {t('product_status_approved')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                                    <span className="text-slate-500">
                                        {t('started')}: {new Date(project.startDate).toLocaleDateString()}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('create_project')}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('project_name')} *</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="input w-full"
                                    placeholder={t('enter_project_name')}
                                    required
                                />
                            </div>

                            <Combobox
                                label={t('customer')}
                                value={newProject.customerId}
                                onChange={(val) => setNewProject({ ...newProject, customerId: val })}
                                options={companies.map(c => ({ id: c.id, label: c.name }))}
                                placeholder={t('select_customer')}
                                required
                            />

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('description')}</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="input w-full"
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
                                    className="input w-full"
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
                                    onClick={handleCreateProject}
                                    disabled={!newProject.name || !newProject.customerId}
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
