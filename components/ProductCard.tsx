import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const { Link } = ReactRouterDOM;

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imgSrc, setImgSrc] = useState(product.image);

  useEffect(() => {
    setImgSrc(product.image || 'https://placehold.co/400x400?text=No+Image');
  }, [product.image]);

  const handleImageError = () => {
    setImgSrc('https://placehold.co/400x400?text=No+Image');
  };

  return (
    <div className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-hover transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full active-scale">
      
      {/* Image Area - Square with rounded corners */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4 shadow-inner">
        <img 
          src={imgSrc} 
          alt={product.name} 
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.discount > 0 && (
           <div className="absolute top-2 right-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              -{product.discount}%
           </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{product.category}</p>
           {product.isHot && <span className="text-[10px] font-bold text-orange-500">HOT</span>}
        </div>
        
        <Link to={`/product/${product.id}`} className="block mb-2">
           <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 h-10 group-hover:text-primary transition-colors">
             {product.name}
           </h3>
        </Link>
        
        <div className="mt-auto flex items-center justify-between pt-2">
           <div className="flex flex-col">
              <span className="text-gray-900 font-bold">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
              <span className="text-gray-400 text-xs line-through">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
              </span>
           </div>
           
           <button 
             onClick={(e) => {
               e.preventDefault();
               onAddToCart(product);
             }}
             className="bg-gray-100 text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
             title="Thêm vào giỏ"
           >
             <ShoppingCart size={18} strokeWidth={2.5} />
           </button>
        </div>
      </div>
    </div>
  );
};