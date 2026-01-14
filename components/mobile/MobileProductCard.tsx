
import React from 'react';
import { Product } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { slugify } from '../../lib/utils';

const { Link } = ReactRouterDOM;

interface MobileProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const MobileProductCard: React.FC<MobileProductCardProps> = ({ product, onAddToCart }) => {
  const productLink = `/product/${product.slug || slugify(product.name)}`;

  return (
    <div className="group relative flex-shrink-0 w-[160px] snap-center">
      <Link to={productLink} className="block active:scale-95 transition-transform duration-200">
        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white shadow-sm border border-gray-100 mb-3">
          <img 
            src={product.image || 'https://placehold.co/300'} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>
      </Link>

      <div className="px-1">
        <div className="flex items-start justify-between gap-2 mb-1">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{product.category}</span>
              <Link to={productLink}>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 h-9">
                  {product.name}
                </h3>
              </Link>
           </div>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div className="flex flex-col">
             <span className="font-extrabold text-primary text-sm">
               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}
             </span>
             {product.originalPrice > product.price && (
               <span className="text-[10px] text-gray-400 line-through">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.originalPrice)}
               </span>
             )}
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-gray-900/20"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
