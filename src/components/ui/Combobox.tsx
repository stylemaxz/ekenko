"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    subLabel?: string;
    value?: any;
}

interface ComboboxProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
    required?: boolean;
    className?: string;
}

export default function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    label,
    disabled = false,
    error,
    required = false,
    className = "",
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.subLabel && option.subLabel.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div
                className={`
                    w-full px-3 py-2 rounded-lg border bg-white flex items-center justify-between cursor-pointer transition-all
                    ${error ? 'border-red-500' : 'border-slate-200'}
                    ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70' : 'hover:border-slate-300'}
                    ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex-1 truncate">
                    {selectedOption ? (
                        <span className="text-slate-900">{selectedOption.label}</span>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    {selectedOption && !disabled && (
                        <button 
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border-none rounded-md outline-none focus:ring-1 focus:ring-primary/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            <div className="p-1">
                                {filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelect(option.id)}
                                        className={`
                                            flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer
                                            ${value === option.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'}
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.label}</span>
                                            {option.subLabel && (
                                                <span className="text-xs text-slate-500">{option.subLabel}</span>
                                            )}
                                        </div>
                                        {value === option.id && <Check size={16} />}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-slate-500">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
