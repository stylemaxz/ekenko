"use client";

import { useState, useEffect } from "react";
import { X, Search, Package, Check, Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { Modal } from "@/components/ui/Modal";

interface SparePart {
    id: string;
    name: string;
    partNumber: string;
    imageUrl: string;
    stock: number;
    price: number;
    minStock: number;
}

interface PartSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (part: SparePart, quantity: number) => Promise<void>;
}

export default function PartSelectorModal({ isOpen, onClose, onSelect }: PartSelectorModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [parts, setParts] = useState<SparePart[]>([]);
    const [search, setSearch] = useState("");
    const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchParts();
            setSearch("");
            setSelectedPart(null);
            setQuantity(1);
        }
    }, [isOpen]);

    const fetchParts = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async () => {
        if (!selectedPart) return;
        setAdding(true);
        try {
            await onSelect(selectedPart, quantity);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setAdding(false);
        }
    };

    const filteredParts = parts.filter(part => 
        part.name.toLowerCase().includes(search.toLowerCase()) || 
        part.partNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={t('add_part')}
            width="max-w-4xl"
        >
            <div className="flex flex-col h-[70vh]">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder={t('search_parts_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 pr-2">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredParts.map(part => (
                                <div 
                                    key={part.id} 
                                    onClick={() => setSelectedPart(part)}
                                    className={`
                                        card p-0 cursor-pointer transition-all border-2 flex flex-col
                                        ${selectedPart?.id === part.id ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md' : 'border-transparent hover:border-slate-200'}
                                    `}
                                >
                                    <div className="aspect-square bg-slate-50 relative overflow-hidden rounded-t-xl group">
                                        {part.imageUrl ? (
                                            <img 
                                                src={part.imageUrl} 
                                                alt={part.name} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package size={32} />
                                            </div>
                                        )}
                                        {part.stock <= part.minStock && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                <AlertTriangle size={10} />
                                                Low
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-white rounded-b-xl border-t border-slate-50 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-slate-800">{part.name}</h3>
                                            <span className="text-xs text-slate-400 block mb-2">{part.partNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${part.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {t('stock')}: {part.stock}
                                            </div>
                                            <span className="font-bold text-indigo-600">฿{part.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && filteredParts.length === 0 && (
                        <div className="text-center py-12">
                            <Package size={48} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-slate-400">{t('no_parts_found')}</p>
                        </div>
                    )}
                </div>

                {selectedPart && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-200">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900 mb-1">{selectedPart.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {t('stock')}: <span className="font-medium text-slate-700">{selectedPart.stock}</span>
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span>{t('price_per_unit')}: <span className="font-medium text-indigo-600">฿{selectedPart.price.toLocaleString()}</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-end">
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <button 
                                        className="btn btn-sm btn-ghost w-9 h-9 p-0 rounded-l-lg hover:bg-slate-50 text-slate-600"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >-</button>
                                    <div className="w-10 text-center text-sm font-bold text-slate-700">{quantity}</div>
                                    <button 
                                        className="btn btn-sm btn-ghost w-9 h-9 p-0 rounded-r-lg hover:bg-slate-50 text-slate-600"
                                        onClick={() => setQuantity(Math.min(selectedPart.stock, quantity + 1))}
                                        disabled={quantity >= selectedPart.stock}
                                    >+</button>
                                </div>
                                <button 
                                    onClick={handleSelect}
                                    disabled={adding || selectedPart.stock === 0}
                                    className="btn btn-primary px-6 shadow-red-500/25 shadow-lg"
                                >
                                    {adding ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <Check size={18} />
                                            {t('add_parts_btn')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
