"use client";

import { useState, useEffect, use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import {
    ArrowLeft,
    Package,
    Plus,
    FlaskConical,
    Send,
    ChevronDown,
    ChevronRight,
    X,
    CheckCircle,
    Clock,
    MessageSquare,
    Trash2
} from 'lucide-react';
import Combobox from '@/components/ui/Combobox';

interface Sample {
    id: string;
    sampleNumber: string;
    version: number;
    sentDate: string;
    dueDate: string;
    status: string;
    notes?: string;
    sender: {
        name: string;
    };
    feedback?: {
        rating?: number;
        customerReaction?: string;
        comments?: string;
        collectedAt: string;
        collector: {
            name: string;
        };
    };
    followUpTask?: {
        status: string;
        assignee: {
            name: string;
        };
    };
}

interface Product {
    id: string;
    name: string;
    formula?: string;
    specifications?: string;
    status: string;
    version: number;
    samples: Sample[];
}

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
    products: Product[];
    rndTasks: any[];
}

interface Employee {
    id: string;
    name: string;
    role: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useLanguage();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    // Modals
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showSendSampleModal, setShowSendSampleModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // New product form
    const [newProduct, setNewProduct] = useState({
        name: '',
        formula: '',
        specifications: ''
    });

    // New sample form
    const [newSample, setNewSample] = useState({
        sampleNumber: '',
        dueDate: '',
        assigneeId: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [projectRes, employeesRes] = await Promise.all([
                fetch(`/api/projects/${id}`),
                fetch('/api/employees')
            ]);

            if (!projectRes.ok) {
                router.push('/rnd/projects');
                return;
            }

            const [projectData, employeesData] = await Promise.all([
                projectRes.json(),
                employeesRes.json()
            ]);

            setProject(projectData);
            setEmployees(employeesData.filter((e: Employee) => e.role === 'sales'));

            // Auto-expand first product
            if (projectData.products.length > 0) {
                setExpandedProducts(new Set([projectData.products[0].id]));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast(t('load_failed'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        try {
            const res = await fetch(`/api/projects/${id}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if (!res.ok) throw new Error('Failed to add product');

            showToast(t('product_added'), 'success');
            setShowAddProductModal(false);
            setNewProduct({ name: '', formula: '', specifications: '' });
            fetchData();
        } catch (error) {
            showToast(t('error_adding_product'), 'error');
        }
    };

    const handleSendSample = async () => {
        if (!selectedProductId) return;

        try {
            const res = await fetch(`/api/products/${selectedProductId}/samples`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSample)
            });

            if (!res.ok) throw new Error('Failed to send sample');

            showToast(t('sample_sent'), 'success');
            setShowSendSampleModal(false);
            setSelectedProductId(null);
            setNewSample({ sampleNumber: '', dueDate: '', assigneeId: '', notes: '' });
            fetchData();
        } catch (error) {
            showToast(t('error_sending_sample'), 'error');
        }
    };

    const handleUpdateProjectStatus = async (status: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update project');

            showToast(t('project_updated'), 'success');
            fetchData();
        } catch (error) {
            showToast(t('error_updating_project'), 'error');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm(t('confirm_delete_product'))) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete product');

            showToast(t('product_deleted'), 'success');
            fetchData();
        } catch (error) {
            showToast(t('error_deleting_product'), 'error');
        }
    };

    const toggleProductExpand = (productId: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedProducts(newExpanded);
    };

    const openSendSampleModal = (productId: string) => {
        setSelectedProductId(productId);
        setShowSendSampleModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': case 'approved': case 'production': return 'bg-green-100 text-green-700';
            case 'completed': case 'feedback_received': return 'bg-blue-100 text-blue-700';
            case 'on_hold': case 'pending_feedback': case 'sent': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': case 'rejected': return 'bg-red-100 text-red-700';
            case 'development': case 'sampling': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getSampleStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} className="text-green-500" />;
            case 'feedback_received': return <MessageSquare size={16} className="text-blue-500" />;
            case 'sent': case 'pending_feedback': return <Clock size={16} className="text-yellow-500" />;
            default: return <Package size={16} className="text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500">{t('loading')}</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500">{t('project_not_found')}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push('/rnd/projects')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
                >
                    <ArrowLeft size={20} />
                    {t('back_to_projects')}
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                {t(`project_status_${project.status}` as any)}
                            </span>
                        </div>
                        <p className="text-slate-500">{project.customer.name}</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Combobox
                            value={project.status}
                            onChange={(val) => handleUpdateProjectStatus(val)}
                            options={[
                                { id: 'active', label: t('project_status_active') },
                                { id: 'on_hold', label: t('project_status_on_hold') },
                                { id: 'completed', label: t('project_status_completed') },
                                { id: 'cancelled', label: t('project_status_cancelled') }
                            ]}
                            className="w-full md:w-48"
                        />
                    </div>
                </div>

                {project.description && (
                    <p className="text-slate-600 mt-3">{project.description}</p>
                )}

                <div className="flex gap-4 mt-4 text-sm text-slate-500">
                    <span>{t('started')}: {new Date(project.startDate).toLocaleDateString()}</span>
                    {project.targetDate && (
                        <span>{t('target')}: {new Date(project.targetDate).toLocaleDateString()}</span>
                    )}
                </div>
            </div>

            {/* Products Section */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {t('products')} ({project.products.length})
                    </h2>
                    <button
                        onClick={() => setShowAddProductModal(true)}
                        className="btn btn-primary btn-sm"
                    >
                        <Plus size={18} />
                        {t('add_product')}
                    </button>
                </div>

                {project.products.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {t('no_products_yet')}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {project.products.map(product => (
                            <div key={product.id}>
                                {/* Product Header */}
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleProductExpand(product.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <FlaskConical size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-slate-900">{product.name}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                                                    {t(`product_status_${product.status}` as any)}
                                                </span>
                                                <span className="text-xs text-slate-400">v{product.version}</span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {product.samples.length} {t('samples')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openSendSampleModal(product.id);
                                            }}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <Send size={16} />
                                            {t('send_sample')}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProduct(product.id);
                                            }}
                                            className="p-2 hover:bg-red-50 rounded text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {expandedProducts.has(product.id) ? (
                                            <ChevronDown size={20} className="text-slate-400" />
                                        ) : (
                                            <ChevronRight size={20} className="text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Product Details (Expanded) */}
                                {expandedProducts.has(product.id) && (
                                    <div className="px-4 pb-4 bg-slate-50">
                                        {/* Product Info */}
                                        {(product.formula || product.specifications) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg">
                                                {product.formula && (
                                                    <div>
                                                        <span className="text-xs text-slate-500">{t('formula')}</span>
                                                        <p className="text-sm">{product.formula}</p>
                                                    </div>
                                                )}
                                                {product.specifications && (
                                                    <div>
                                                        <span className="text-xs text-slate-500">{t('specifications')}</span>
                                                        <p className="text-sm">{product.specifications}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Samples Timeline */}
                                        <h4 className="text-sm font-medium text-slate-700 mb-3">{t('sample_history')}</h4>
                                        {product.samples.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">{t('no_samples_sent')}</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {product.samples.map((sample, idx) => (
                                                    <div key={sample.id} className="bg-white rounded-lg p-3 border border-slate-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                {getSampleStatusIcon(sample.status)}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm">{sample.sampleNumber}</span>
                                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(sample.status)}`}>
                                                                            {t(`sample_status_${sample.status}` as any)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-500">
                                                                        {t('sent_by')}: {sample.sender.name} - {new Date(sample.sentDate).toLocaleDateString()}
                                                                    </p>
                                                                    {sample.followUpTask && (
                                                                        <p className="text-xs text-blue-600 mt-1">
                                                                            {t('assigned_to')}: {sample.followUpTask.assignee.name}
                                                                            ({t(`status_${sample.followUpTask.status}` as any)})
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-slate-500">
                                                                {t('due')}: {new Date(sample.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {sample.feedback && (
                                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <MessageSquare size={14} className="text-green-500" />
                                                                    <span className="text-xs font-medium text-green-700">{t('feedback_received')}</span>
                                                                </div>
                                                                {sample.feedback.customerReaction && (
                                                                    <p className="text-sm">
                                                                        {t('reaction')}: {t(`reaction_${sample.feedback.customerReaction}` as any)}
                                                                    </p>
                                                                )}
                                                                {sample.feedback.comments && (
                                                                    <p className="text-sm text-slate-600 mt-1">{sample.feedback.comments}</p>
                                                                )}
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    {t('collected_by')}: {sample.feedback.collector.name} - {new Date(sample.feedback.collectedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('add_product')}</h2>
                            <button onClick={() => setShowAddProductModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('product_name')} *</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="input w-full"
                                    placeholder={t('enter_product_name')}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('formula')}</label>
                                <textarea
                                    value={newProduct.formula}
                                    onChange={(e) => setNewProduct({ ...newProduct, formula: e.target.value })}
                                    className="input w-full"
                                    rows={2}
                                    placeholder={t('enter_formula')}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('specifications')}</label>
                                <textarea
                                    value={newProduct.specifications}
                                    onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                                    className="input w-full"
                                    rows={2}
                                    placeholder={t('enter_specifications')}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowAddProductModal(false)} className="btn btn-outline flex-1">
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    disabled={!newProduct.name}
                                    className="btn btn-primary flex-1"
                                >
                                    {t('add')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Sample Modal */}
            {showSendSampleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t('send_sample')}</h2>
                            <button
                                onClick={() => {
                                    setShowSendSampleModal(false);
                                    setSelectedProductId(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('sample_number')} *</label>
                                <input
                                    type="text"
                                    value={newSample.sampleNumber}
                                    onChange={(e) => setNewSample({ ...newSample, sampleNumber: e.target.value })}
                                    className="input w-full"
                                    placeholder="e.g., S001-v1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('feedback_due_date')} *</label>
                                <input
                                    type="date"
                                    value={newSample.dueDate}
                                    onChange={(e) => setNewSample({ ...newSample, dueDate: e.target.value })}
                                    className="input w-full"
                                />
                            </div>

                            <Combobox
                                label={t('assign_sales_rep')}
                                value={newSample.assigneeId}
                                onChange={(val) => setNewSample({ ...newSample, assigneeId: val })}
                                options={employees.map(e => ({ id: e.id, label: e.name }))}
                                placeholder={t('select_sales_rep')}
                                required
                            />
                            
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('notes')}</label>
                                <textarea
                                    value={newSample.notes}
                                    onChange={(e) => setNewSample({ ...newSample, notes: e.target.value })}
                                    className="input w-full"
                                    rows={2}
                                    placeholder={t('sample_notes_placeholder')}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowSendSampleModal(false);
                                        setSelectedProductId(null);
                                    }}
                                    className="btn btn-outline flex-1"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleSendSample}
                                    disabled={!newSample.sampleNumber || !newSample.dueDate || !newSample.assigneeId}
                                    className="btn btn-primary flex-1"
                                >
                                    <Send size={18} />
                                    {t('send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
