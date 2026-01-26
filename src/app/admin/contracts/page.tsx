"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, CheckCircle, AlertCircle, XCircle, FileSignature } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import CreateContractModal from "@/components/admin/CreateContractModal";

interface Contract {
    id: string;
    contractNumber: string;
    customer: {
        id: string;
        name: string;
    };
    status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'VOID' | 'CLOSED';
    startDate: string;
    endDate: string;
    price: number;
    items: {
        asset: {
            modelName: string;
            serialNumber: string;
        }
    }[];
}

export default function ContractsPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/contracts');
            if (!res.ok) throw new Error('Failed to fetch contracts');
            const data = await res.json();
            setContracts(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load contracts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'DRAFT': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'EXPIRED': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'TERMINATED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredContracts = contracts.filter(c => {
        const matchesSearch = 
            c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
            c.customer.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('contracts_management')}</h1>
                    <p className="text-slate-500">{t('contracts_desc') || "Manage service contracts"}</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    {t('create_contract')}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('search_placeholder') || "Search..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select w-full md:w-48"
                >
                    <option value="ALL">{t('all_statuses') || 'All Statuses'}</option>
                    <option value="ACTIVE">{t('contract_active')}</option>
                    <option value="DRAFT">{t('contract_draft')}</option>
                    <option value="EXPIRED">{t('contract_expired')}</option>
                </select>
            </div>

            {/* Contracts List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading...</div>
                ) : filteredContracts.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <FileSignature className="mx-auto text-slate-300 mb-3" size={48} />
                        <h3 className="text-lg font-medium text-slate-900">{t('no_contracts')}</h3>
                        <p className="text-slate-500 mb-4">{t('no_contracts_desc') || "Start by creating a new service contract."}</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-outline">
                            {t('create_new_contract')}
                        </button>
                    </div>
                ) : (
                    filteredContracts.map(contract => (
                        <div key={contract.id} className="card p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-indigo-600">{contract.contractNumber}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(contract.status)}`}>
                                        {t(`contract_${contract.status.toLowerCase()}` as any)}
                                    </span>
                                </div>
                                <div className="text-slate-900 font-medium mb-1">{contract.customer.name}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-4">
                                    <span>{new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{contract.items.length} {t('assets') || "Assets"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right mr-4">
                                    <div className="text-sm text-slate-500">{t('contract_price')}</div>
                                    <div className="font-bold text-slate-900">฿{contract.price.toLocaleString()}</div>
                                </div>
                                <button className="btn btn-ghost btn-sm text-slate-500 hover:text-indigo-600">
                                    {t('view_details')}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CreateContractModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchContracts();
                }}
            />
        </div>
    );
}
