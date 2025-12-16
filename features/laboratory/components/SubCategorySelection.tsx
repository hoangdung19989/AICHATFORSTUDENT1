import React from 'react';
// FIX: Corrected import path for types
import type { LabCategory } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ChevronRightIcon } from '../../../components/icons';

interface SubCategorySelectionProps {
    parentCategory: LabCategory;
    onSelectSubcategory: (subcategory: LabCategory) => void;
    onBack: () => void;
}

const SubCategorySelection: React.FC<SubCategorySelectionProps> = ({ parentCategory, onSelectSubcategory, onBack }) => {
    const subcategories = parentCategory.subcategories || [];

    return (
        <div className="container mx-auto max-w-4xl">
             <Breadcrumb items={[{ label: 'Phòng thí nghiệm', onClick: onBack }, { label: parentCategory.name }]} />
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Chủ đề {parentCategory.name}</h1>
                <p className="text-slate-500 mt-2">Chọn một chủ đề để xem danh sách các mô phỏng.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ul className="divide-y divide-slate-200">
                    {subcategories.map((sub) => (
                        <li key={sub.id}>
                            <button onClick={() => onSelectSubcategory(sub)} className="w-full flex justify-between items-center py-4 px-2 hover:bg-slate-50 rounded-lg group">
                                <span className="text-lg font-semibold text-slate-700 group-hover:text-brand-blue-dark">{sub.name}</span>
                                <ChevronRightIcon className="h-6 w-6 text-slate-400 group-hover:text-brand-blue-dark" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubCategorySelection;