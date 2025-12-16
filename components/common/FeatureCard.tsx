
import React, { ComponentType } from 'react';
import { ChevronRightIcon } from '../icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tags?: string[];
  color?: string; // Expecting tailwind classes like 'bg-blue-500'
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, tags, color = 'bg-gray-500', onClick }) => {
    // Extract base color name to build gradients dynamically
    // Example: 'bg-blue-500' -> baseColorName = 'blue'
    const colorParts = color.split('-');
    const baseColorName = colorParts.length > 1 ? colorParts[1] : 'gray';
    
    // Create soft gradient backgrounds based on the input color
    const gradientBg = `bg-gradient-to-br from-${baseColorName}-50 to-white`;
    const iconContainerBg = `bg-${baseColorName}-100`;
    const iconColor = `text-${baseColorName}-600`;

    return (
        <button
            onClick={onClick}
            className={`group relative w-full flex flex-col p-6 rounded-3xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-soft bg-white border border-slate-100 overflow-hidden text-left h-full`}
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradientBg}`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl ${iconContainerBg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${iconColor}`} />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                        <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-800" />
                    </div>
                </div>
                
                <h3 className="text-xl font-display font-bold text-slate-800 mb-2 group-hover:text-brand-dark line-clamp-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow line-clamp-2">{description}</p>
                
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                        {tags.map((tag, idx) => (
                            <span 
                                key={idx} 
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-white group-hover:border-slate-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
};

export default FeatureCard;
