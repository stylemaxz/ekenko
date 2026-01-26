"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, Loader2, Calendar, FileText, DollarSign, Building2, Box, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

interface CreateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Customer {
    id: string;
    name: string;
}

interface Asset {
    id: string;
    modelName: string;
    serialNumber: string;
}

export default function CreateContractModal({ isOpen, onClose, onSuccess }: CreateContractModalProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    
    // Steps: 1=Select Customer, 2=Select Assets, 3=Details
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Data
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    
    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]); // asset IDs
    const [contractNumber, setContractNumber] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    // Search
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen && step === 1) fetchCustomers();
    }, [isOpen]);

    useEffect(() => {
        if (step === 2 && selectedCustomer) fetchAssets(selectedCustomer.id);
    }, [step, selectedCustomer]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/customers'); // Reuse existing API
            const data = await res.json();
            // Simplify data structure for specific need if API returns complex object
            // Assuming API returns array of Customer
            setCustomers(data); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssets = async (customerId: string) => {
        setLoading(true);
        try {
            // Need an endpoint to get assets by customer?
            // Or general asset list filtered frontend?
            // Usually assets are linked to location -> company.
            // Let's assume we fetch all assets for now or modify API later.
            // For now, let's try fetching all assets and filtering (inefficient but works for MVP)
            // Ideally: /api/assets?customerId=...
            const res = await fetch('/api/assets');
            const data = await res.json();
            // Filter logic might be tricky if Asset -> Location -> Company
            // Let's assume the API returns location.companyId
            // Or we just show all available assets.
            // Better: Filter by location linked to this customer.
            
            // Temporary: Show all assets (Should restrict to Customer's assets in production)
            setAssets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    contractNumber,
                    startDate,
                    endDate,
                    price,
                    description,
                    assetIds: selectedAssets,
                    status: 'DRAFT'
                })
            });

            if (!res.ok) throw new Error('Failed to create contract');

            showToast(t('create_success') || 'Contract created successfully', 'success');
            onSuccess();
            resetForm();
        } catch (error: any) {
            console.error(error);
            showToast('Failed to create contract', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectedCustomer(null);
        setSelectedAssets([]);
        setContractNumber("");
        setStartDate("");
        setEndDate("");
        setPrice("");
        setDescription("");
    };

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    
    // Simple logic for assets search
    const filteredAssets = assets.filter(a => 
        a.modelName.toLowerCase().includes(search.toLowerCase()) || 
        a.serialNumber.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('create_new_contract')}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`w-2 h-2 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            ))}
                            <span className="text-xs text-slate-500 ml-1">Step {step} of 3</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 mb-2">{t('select_customer_first')}</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search customer..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input pl-10 w-full"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredCustomers.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => { setSelectedCustomer(customer); setSearch(""); setStep(2); }}
                                        className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{customer.name}</div>
                                            <div className="text-xs text-slate-500">Customer ID: {customer.id.substring(0,8)}...</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">{t('select_assets')}</h3>
                                <span className="text-sm text-slate-500">{selectedAssets.length} selected</span>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-2 text-sm text-indigo-700 mb-2">
                                <Building2 size={16} />
                                Customer: <span className="font-bold">{selectedCustomer?.name}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search assets..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input pl-10 w-full"
                                />
                            </div>
                             <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredAssets.map(asset => {
                                    const isSelected = selectedAssets.includes(asset.id);
                                    return (
                                        <div 
                                            key={asset.id}
                                            onClick={() => {
                                                if (isSelected) setSelectedAssets(prev => prev.filter(id => id !== asset.id));
                                                else setSelectedAssets(prev => [...prev, asset.id]);
                                            }}
                                            className={`
                                                cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all
                                                ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Box size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{asset.modelName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{asset.serialNumber}</div>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle size={20} className="text-indigo-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                             <h3 className="font-semibold text-slate-900">{t('contract_details')}</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label-text">{t('contract_number')} <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="input w-full" 
                                        value={contractNumber}
                                        onChange={(e) => setContractNumber(e.target.value)}
                                        placeholder="e.g. CTR-2024-001"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">{t('contract_start_date')} <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        className="input w-full"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label-text">{t('contract_end_date')} <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        className="input w-full"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-text">{t('contract_price')}</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="number" 
                                            className="input w-full pl-10" 
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="label-text">{t('description')}</label>
                                    <textarea 
                                        className="textarea w-full" 
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Terms, conditions, or notes..."
                                    />
                                </div>
                             </div>

                             <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mt-4">
                                <div className="flex justify-between mb-1">
                                    <span>Customer:</span>
                                    <span className="font-semibold">{selectedCustomer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Assets Covered:</span>
                                    <span className="font-semibold">{selectedAssets.length} items</span>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-between">
                    {step > 1 ? (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="btn btn-ghost"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button 
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !selectedCustomer}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !contractNumber || !startDate || !endDate}
                            className="btn btn-primary min-w-[120px]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Contract'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
