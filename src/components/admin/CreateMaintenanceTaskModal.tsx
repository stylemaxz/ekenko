"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { Loader2, Calendar, Clock, User, AlertTriangle, Box, Search, X, ChevronDown, type LucideIcon } from "lucide-react";

interface CreateMaintenanceTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface AssetOption {
    id: string;
    serialNumber: string;
    modelName: string;
    location?: {
        name: string;
        company: { name: string };
    };
}

interface EmployeeOption {
    id: string;
    name: string;
    email: string;
}

export function CreateMaintenanceTaskModal({ isOpen, onClose, onSuccess }: CreateMaintenanceTaskModalProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    
    // Form State
    const [assetId, setAssetId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [assignedTo, setAssignedTo] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [estimatedHours, setEstimatedHours] = useState("");

    // Search State
    const [assetSearch, setAssetSearch] = useState("");
    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

    // Data State
    const [assets, setAssets] = useState<AssetOption[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (isOpen) {
            fetchData();
        } else {
            // Reset form on close
            setAssetId("");
            setAssetSearch("");
            setIsAssetDropdownOpen(false);
            setTitle("");
            setDescription("");
            setPriority("medium");
            setAssignedTo("");
            setScheduledDate("");
            setEstimatedHours("");
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            // Fetch assets
            const assetsRes = await fetch('/api/assets');
            const assetsData = await assetsRes.json();
            setAssets(assetsData);

            // Fetch maintenance employees
            const employeesRes = await fetch('/api/employees?role=maintenance');
            const employeesData = await employeesRes.json();
            setEmployees(employeesData);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast(t('error_fetching_data'), 'error');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!assetId || !title || !description || !scheduledDate) {
            showToast(t('fill_required_fields'), 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                assetId,
                title,
                description,
                priority,
                assignedTo: assignedTo || null,
                scheduledDate: scheduledDate || null,
                estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
            };

            const res = await fetch('/api/maintenance-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create task');
            }

            showToast(t('task_created_success'), 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating task:", error);
            showToast(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorities = [
        { value: 'low', label: t('priority_low'), color: 'text-green-600 bg-green-50' },
        { value: 'medium', label: t('priority_medium'), color: 'text-yellow-600 bg-yellow-50' },
        { value: 'high', label: t('priority_high'), color: 'text-orange-600 bg-orange-50' },
        { value: 'urgent', label: t('priority_urgent'), color: 'text-red-600 bg-red-50' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('create_task')}
            subtitle={t('create_maintenance_task_desc')}
            width="max-w-2xl"
        >
            {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Asset Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('asset')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={assetSearch}
                                    onChange={(e) => {
                                        setAssetSearch(e.target.value);
                                        setIsAssetDropdownOpen(true);
                                        if (e.target.value === '') setAssetId("");
                                    }}
                                    onFocus={() => setIsAssetDropdownOpen(true)}
                                    className="input pl-10 pr-10 w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                    placeholder={t('search_asset_placeholder')}
                                />
                                {assetId ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssetId("");
                                            setAssetSearch("");
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                ) : (
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                )}
                            </div>

                            {/* Dropdown List */}
                            {isAssetDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {assets.filter(a => 
                                        a.serialNumber.toLowerCase().includes(assetSearch.toLowerCase()) || 
                                        a.modelName.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                        (a.location?.name || '').toLowerCase().includes(assetSearch.toLowerCase())
                                    ).length > 0 ? (
                                        assets.filter(a => 
                                            a.serialNumber.toLowerCase().includes(assetSearch.toLowerCase()) || 
                                            a.modelName.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                            (a.location?.name || '').toLowerCase().includes(assetSearch.toLowerCase())
                                        ).map(asset => (
                                            <button
                                                key={asset.id}
                                                type="button"
                                                onClick={() => {
                                                    setAssetId(asset.id);
                                                    setAssetSearch(`${asset.serialNumber} - ${asset.modelName}`);
                                                    setIsAssetDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50"
                                            >
                                                <div className="font-medium text-slate-800">{asset.serialNumber} - {asset.modelName}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Box size={12} />
                                                    {asset.location?.name || t('unassigned')}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-500 text-sm">
                                            {t('no_assets_found')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Overlay to close dropdown */}
                            {isAssetDropdownOpen && (
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsAssetDropdownOpen(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('task_title')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                placeholder={t('task_example_title')}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('priority')}
                            </label>
                            <div className="relative">
                                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="input pl-10 w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                >
                                    {priorities.map(p => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('assigned_technician')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="input pl-10 w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                >
                                    <option value="">{t('unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('task_description')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input w-full h-32 py-3 bg-slate-50 border-slate-200 focus:bg-white resize-none"
                            placeholder={t('task_description_placeholder')}
                        />
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('scheduled_date')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="input pl-10 w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('estimated_hours')}
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={estimatedHours}
                                    onChange={(e) => setEstimatedHours(e.target.value)}
                                    className="input pl-10 w-full h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                         <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={isSubmitting}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                t('create_task')
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
