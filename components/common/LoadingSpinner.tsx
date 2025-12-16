import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
    subText?: string;
    color?: 'sky' | 'amber';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    text = "Đang tải...", 
    subText,
    color = 'sky'
}) => {
    const borderColor = color === 'sky' ? 'border-t-sky-500' : 'border-t-amber-500';

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className={`w-12 h-12 border-4 border-slate-200 ${borderColor} rounded-full animate-spin mb-4`}></div>
            <p className="text-slate-600 font-semibold">{text}</p>
            {subText && <p className="text-slate-500 text-sm mt-1">{subText}</p>}
        </div>
    );
};

export default LoadingSpinner;
