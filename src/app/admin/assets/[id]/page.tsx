"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, MapPin, Box, Calendar, Clock, 
    FileText, User, Wrench, AlertTriangle, 
    CheckCircle, History, Package
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";

interface AssetHistory {
    id: string;
    modelName: string;
    serialNumber: string;
    status: string;
    condition: string;
    image?: string;
    location?: {
        name: string;
        company: { name: string };
    };
    contractItems: {
        serviceContract: {
            contractNumber: string;
            startDate: string;
            endDate: string;
            customer: { name: string };
        };
    }[];
    maintenanceTasks: {
        id: string;
        title: string;
        status: string;
        priority: string;
        createdAt: string;
        completedDate?: string;
        assignedEmployee?: { name: string };
        partsUsage: {
            part: { name: string; partNumber: string };
            quantity: number;
        }[];
    }[];
}

export default function AssetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [asset, setAsset] = useState<AssetHistory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchAssetDetails();
    }, [id]);

    const fetchAssetDetails = async () => {
        try {
            const res = await fetch(`/api/assets/${id}/history`);
            if (!res.ok) throw new Error('Failed to fetch asset details');
            const data = await res.json();
            setAsset(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load asset history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-700';
            case 'MAINTENANCE': return 'bg-orange-100 text-orange-700';
            case 'RENTED': return 'bg-blue-100 text-blue-700';
            case 'BROKEN': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading asset history...</div>;
    if (!asset) return <div className="p-8 text-center text-slate-500">Asset not found</div>;

    const currentContract = asset.contractItems[0]?.serviceContract;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                {t('back')}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Asset Profile */}
                <div className="space-y-6">
                    <div className="card overflow-hidden">
                        <div className="aspect-video bg-slate-100 relative">
                            {asset.image ? (
                                <Image src={asset.image} alt={asset.modelName} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300">
                                    <Box size={48} />
                                </div>
                            )}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(asset.status)}`}>
                                {asset.status}
                            </div>
                        </div>
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">{asset.modelName}</h1>
                            <div className="text-slate-500 font-mono text-sm mb-4">SN: {asset.serialNumber}</div>
                            
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-slate-400 mt-1" size={18} />
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">Current Location</div>
                                        <div className="text-sm text-slate-500">
                                            {asset.location ? (
                                                <>
                                                    {asset.location.name}
                                                    <div className="text-xs text-indigo-600">{asset.location.company.name}</div>
                                                </>
                                            ) : "Unassigned"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="text-slate-400 mt-1" size={18} />
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">Contract Status</div>
                                        {currentContract ? (
                                            <div className="text-sm text-green-600 font-medium">
                                                Active: {currentContract.contractNumber}
                                                <div className="text-xs text-slate-500">
                                                    Ends: {new Date(currentContract.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-400">No active contract</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History Timeline */}
                <div className="md:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <History className="text-indigo-600" size={24} />
                            Maintenance History
                        </h2>

                        <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
                            {asset.maintenanceTasks.length === 0 && (
                                <div className="text-slate-500 italic">No maintenance history found.</div>
                            )}
                            
                            {asset.maintenanceTasks.map((task) => (
                                <div key={task.id} className="relative">
                                    <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white ${
                                        task.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                                    }`} />
                                    
                                    <div className="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-slate-100">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900">{task.title}</h3>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                    <Calendar size={12} />
                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                    {task.completedDate && (
                                                        <span className="text-green-600 flex items-center gap-1 ml-2">
                                                            <CheckCircle size={12} />
                                                            Completed: {new Date(task.completedDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                                task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        {task.assignedEmployee && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                                <User size={14} />
                                                Technician: <span className="font-medium">{task.assignedEmployee.name}</span>
                                            </div>
                                        )}

                                        {task.partsUsage.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <div className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                                    <Wrench size={12} /> Parts Replaced
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {task.partsUsage.map((usage, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-200 rounded px-2 py-1 text-xs flex items-center gap-1">
                                                            <Package size={12} className="text-indigo-500" />
                                                            <span className="font-medium">{usage.part.name}</span>
                                                            <span className="text-slate-400">x{usage.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
