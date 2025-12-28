
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRightIcon, XMarkIcon } from '../icons';

interface SearchableSelectProps {
    label?: string; // Label is now optional to fit filter bars better
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    required?: boolean;
    className?: string; // Allow custom styling from parent
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
    label, options, value, onChange, placeholder, disabled, required, className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Lọc danh sách dựa trên từ khóa tìm kiếm
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const search = searchTerm.toLowerCase().trim();
        return options.filter(opt => opt.toLowerCase().includes(search));
    }, [options, searchTerm]);

    // Đóng dropdown khi nhấn ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset tìm kiếm khi đóng/mở
    useEffect(() => {
        if (isOpen) setSearchTerm('');
    }, [isOpen]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${className || ''}`} ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm transition-all cursor-pointer bg-white ${
                    disabled ? 'bg-slate-50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed' : 
                    isOpen ? 'border-brand-primary ring-4 ring-indigo-50 text-slate-800' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
            >
                <span className={`truncate font-medium flex-1 ${!value ? 'text-slate-400' : 'text-slate-800'}`}>
                    {value || placeholder}
                </span>
                
                <div className="flex items-center ml-2">
                    {value && !disabled && (
                        <button 
                            onClick={handleClear}
                            className="p-1 mr-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                            title="Xóa lựa chọn"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                    <ChevronRightIcon className={`h-4 w-4 transition-transform duration-300 flex-shrink-0 text-slate-400 ${isOpen ? 'rotate-90 text-brand-primary' : ''}`} />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[100] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in origin-top">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Gõ để tìm nhanh..."
                            className="w-full bg-transparent border-none outline-none text-sm font-medium py-1 placeholder-slate-400 text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsOpen(false);
                            }}
                        />
                        {searchTerm && (
                            <button type="button" onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-200 rounded-full">
                                <XMarkIcon className="h-3 w-3 text-slate-500" />
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors truncate ${
                                        value === option ? 'bg-indigo-50 text-brand-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-xs font-medium italic">
                                Không tìm thấy kết quả
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
