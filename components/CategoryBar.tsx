
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
    // FIX: Tăng top mobile lên 84px để tránh bị dính vào Navbar (Navbar cao khoảng 60-70px)
    <div className="sticky top-[84px] lg:top-[100px] z-40 mb-6 lg:mb-10 transition-all duration-300">
      
      {/* DESKTOP VERSION: PILLS */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto lg:max-w-fit">
            {/* Background Glass Layer */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"></div>
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

      {/* MOBILE VERSION: INSTAGRAM STORIES STYLE */}
      {/* Thêm background gradient nhẹ để khi scroll nội dung bên dưới không bị lẫn vào text */}
      <div className="lg:hidden pl-4 overflow-x-auto no-scrollbar py-2 bg-gradient-to-b from-[#F5F5F7]/95 to-[#F5F5F7]/80 backdrop-blur-md">
         <div className="flex gap-4 min-w-full pr-4">
            {allCategories.map((cat) => {
               const isActive = activeCategory === cat.id;
               const linkTo = cat.id === 'all' ? '/products' : `/products?category=${cat.id}`;
               
               return (
                 <Link 
                    key={cat.id} 
                    to={linkTo}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                 >
                    <div className={`p-[2px] rounded-full ${isActive ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-transparent'}`}>
                        <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center border-[3px] border-white shadow-sm transition-transform active:scale-95 ${!isActive ? 'bg-gray-50' : ''}`}>
                            <cat.icon size={24} className={`${isActive ? 'text-primary' : 'text-gray-500'}`} strokeWidth={1.5} />
                        </div>
                    </div>
                    <span className={`text-[11px] font-medium ${isActive ? 'text-black font-bold' : 'text-gray-500'}`}>
                        {cat.name}
                    </span>
                 </Link>
               )
            })}
         </div>
      </div>

    </div>
  );
};
