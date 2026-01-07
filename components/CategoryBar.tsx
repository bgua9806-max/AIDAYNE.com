
import React, { useRef, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

const { Link, useLocation } = ReactRouterDOM;

export const CategoryBar: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category') || 'all';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to active item logic
  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = document.getElementById(`cat-${activeCategory}`);
      if (activeItem) {
        const container = scrollRef.current;
        // Tính toán để item nằm giữa màn hình
        const scrollLeft = activeItem.offsetLeft - container.offsetWidth / 2 + activeItem.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeCategory]);

  const allCategories = [
    { id: 'all', name: 'Tất cả', icon: LayoutGrid },
    ...CATEGORIES
  ];

  return (
    // Container dính (Sticky) khi cuộn, có z-index cao để nổi lên trên
    <div className="sticky top-[72px] lg:top-[80px] z-40 mb-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating Dock Wrapper */}
        <div className="relative mx-auto lg:max-w-fit">
            
            {/* Hiệu ứng nền kính mờ (Glassmorphism) & Bóng đổ mềm */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"></div>

            {/* Scrollable Content */}
            <div 
                ref={scrollRef}
                className="relative z-10 flex items-center gap-2 p-2 overflow-x-auto no-scrollbar rounded-[2rem] scroll-smooth mask-linear-fade"
            >
                {allCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const linkTo = cat.id === 'all' ? '/products' : `/products?category=${cat.id}`;

                    return (
                        <Link 
                            key={cat.id} 
                            id={`cat-${cat.id}`}
                            to={linkTo} 
                            className={`
                                group flex items-center gap-2 px-5 py-3 rounded-[1.5rem] transition-all duration-300 whitespace-nowrap select-none border
                                ${isActive 
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.02]' 
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }
                            `}
                        >
                            <cat.icon 
                                size={18} 
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} 
                            />
                            <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {cat.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};
