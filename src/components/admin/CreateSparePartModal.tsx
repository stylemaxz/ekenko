"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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

interface CreateSparePartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: SparePart | null;
}

export default function CreateSparePartModal({ isOpen, onClose, onSuccess, initialData }: CreateSparePartModalProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("0");
    const [minStock, setMinStock] = useState("5");
    const [price, setPrice] = useState("0");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setPartNumber(initialData.partNumber);
            setDescription(initialData.description || "");
            setStock(initialData.stock.toString());
            setMinStock(initialData.minStock.toString());
            setPrice(initialData.price.toString());
            setImagePreview(initialData.imageUrl || null);
            setImage(null);
        } else if (isOpen && !initialData) {
            resetForm();
        }
    }, [isOpen, initialData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const  handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = initialData?.imageUrl || "";

            // 1. Upload Image if new one selected
            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Failed to upload image');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            // 2. Create or Update Spare Part
            const url = initialData ? `/api/spare-parts/${initialData.id}` : '/api/spare-parts';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    partNumber,
                    description,
                    stock: parseInt(stock),
                    minStock: parseInt(minStock),
                    price: parseFloat(price),
                    imageUrl
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || t('create_failed'));
            }

            showToast(initialData ? t('update_success') : t('part_created_success'), 'success');
            onSuccess();
            if (!initialData) resetForm(); // Only reset on create, keep data for edit visual feedback (modal closes anyway)
        } catch (error: any) {
            console.error(error);
            showToast(error.message || t('create_failed'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setPartNumber("");
        setDescription("");
        setStock("0");
        setMinStock("5");
        setPrice("0");
        setImage(null);
        setImagePreview(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800">
                        {initialData ? t('edit_details') : t('create_spare_part')}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Area */}
                        <div className="flex justify-center">
                            <div className="relative group w-32 h-32">
                                <div className={`
                                    w-full h-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-200
                                    ${imagePreview ? 'border-primary/20 bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'}
                                `}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                            <div className="p-3 bg-slate-50 group-hover:bg-primary/10 rounded-full transition-colors">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-xs font-medium">{t('add_image')}</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    title={t('upload_logo')}
                                />
                                {imagePreview && (
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50 border border-slate-100 transition-colors z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            {/* Name & Part Number */}
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    {t('part_name')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input w-full transition-all focus:ring-4 focus:ring-primary/10"
                                    placeholder={t('company_name_placeholder')}
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    {t('part_number')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={partNumber}
                                    onChange={(e) => setPartNumber(e.target.value)}
                                    className="input w-full font-mono text-sm bg-slate-50/50"
                                    placeholder="e.g. PART-001"
                                />
                            </div>

                            {/* Stock & Price */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('stock_quantity')}</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="input w-full font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('min_stock')}</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                    className="input w-full text-slate-600"
                                />
                            </div>

                             <div className="col-span-2 space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('price_per_unit')}</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">฿</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="input w-full pl-9 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('description')}</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input w-full min-h-[100px] py-3 resize-none leading-relaxed"
                                    placeholder={t('notes_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 btn btn-outline hover:bg-slate-50 hover:border-slate-300 text-slate-600"
                                disabled={loading}
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="flex-[2] btn btn-primary shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
