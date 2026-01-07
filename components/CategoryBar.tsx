import React from 'react';
import { CATEGORIES } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

export const CategoryBar: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="w-full overflow-x-auto no-scrollbar pb-4 pt-2">
        <div className="flex items-start justify-start md:justify-center gap-6 min-w-max px-2">
          {CATEGORIES.map((cat) => (
            <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                className="group flex flex-col items-center gap-3 min-w-[80px] cursor-pointer"
            >
              <div className="w-[72px] h-[72px] rounded-[22px] glass hover:bg-white shadow-sm border border-white/50 flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:shadow-glow group-hover:-translate-y-2 transition-all duration-300 ease-out">
                <cat.icon size={32} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-gray-500 group-hover:text-black transition-colors text-center tracking-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};