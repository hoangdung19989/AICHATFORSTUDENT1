import React from 'react';
import { HomeIcon, ChevronRightIcon } from '../icons';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-slate-500 mb-6 flex-wrap">
      <HomeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.onClick ? (
              <button onClick={item.onClick} className="hover:underline">
                {item.label}
              </button>
            ) : (
              <span className={`font-semibold ${isLast ? 'text-slate-700' : ''}`}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRightIcon className="h-4 w-4 mx-1 flex-shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
