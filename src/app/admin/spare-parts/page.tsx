"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
    Plus, Search, Package, AlertTriangle, 
    Edit2, Trash2, Settings, Box 
} from "lucide-react";
import CreateSparePartModal from "@/components/admin/CreateSparePartModal";
import { useToast } from "@/contexts/ToastContext";

interface SparePart {
    id: string;
    name: string;
    partNumber: string;
    description: string;
    imageUrl: string;
    stock: number;
    minStock: number;
    price: number;
}

export default function AdminSparePartsPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [parts, setParts] = useState<SparePart[]>([]);
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<SparePart | null>(null);

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            const res = await fetch('/api/spare-parts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setParts(data);
            } else {
                setParts([]);
                console.error("Invalid response format:", data);
            }
        } catch (error) {
            console.error(error);
            setParts([]);
            showToast('Failed to fetch parts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${t('confirm_delete')} ${name}?`)) return;

        try {
            const res = await fetch(`/api/spare-parts/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            showToast(t('delete_success'), 'success');
            fetchParts();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const filteredParts = parts.filter(part => 
        part.name.toLowerCase().includes(search.toLowerCase()) || 
        part.partNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Box size={28} className="text-red-600" />
                        {t('spare_parts_management')}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{t('spare_parts_desc')}</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingPart(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    {t('add_spare_part')}
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder={t('search_parts_placeholder')} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-10 w-full"
                />
            </div>

            {/* Parts Grid/Table */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">{t('loading')}</div>
            ) : filteredParts.length === 0 ? (
                <div className="text-center py-12">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-slate-400" />
                     </div>
                     <h3 className="text-lg font-medium text-slate-900 mb-2">{t('no_parts_found')}</h3>
                     <p className="text-slate-500">{t('no_parts_desc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredParts.map(part => (
                        <div key={part.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex">
                                <div className="w-32 h-32 bg-slate-100 relative shrink-0">
                                    {part.imageUrl ? (
                                        <img 
                                            src={part.imageUrl} 
                                            alt={part.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={32} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 line-clamp-1">{part.name}</h3>
                                            <div className="text-xs font-mono text-slate-500 bg-slate-100 px-1 rounded inline-block">
                                                {part.partNumber}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-red-600">฿{part.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('stock')}</div>
                                            <div className={`text-xl font-bold flex items-center gap-2 ${
                                                part.stock <= part.minStock ? 'text-red-600' : 'text-slate-700'
                                            }`}>
                                                {part.stock}
                                                {part.stock <= part.minStock && (
                                                    <AlertTriangle size={16} className="text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                             <button 
                                                onClick={() => {
                                                    setEditingPart(part);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition-colors"
                                            >
                                                 <Edit2 size={16} />
                                             </button>
                                             {/* Verify Trash Button */}
                                             <button 
                                                onClick={() => handleDelete(part.id, part.name)}
                                                className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                             >
                                                 <Trash2 size={16} />
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateSparePartModal 
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingPart(null);
                }}
                onSuccess={() => {
                    fetchParts();
                    setIsCreateModalOpen(false);
                    setEditingPart(null);
                }}
                initialData={editingPart}
            />
        </div>
    );
}
