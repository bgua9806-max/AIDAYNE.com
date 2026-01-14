
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { ShoppingCart, Monitor, Smartphone, Tablet, Command, Globe } from 'lucide-react';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imgSrc, setImgSrc] = useState(product.image);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(product.image || 'https://placehold.co/400x400?text=No+Image');
  }, [product.image]);

  const handleImageError = () => {
    setImgSrc('https://placehold.co/400x400?text=No+Image');
  };

  // 3D Tilt Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate rotation (limit to +/- 10 degrees)
    const rotateX = ((y - height / 2) / height) * -10;
    const rotateY = ((x - width / 2) / width) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 }); // Reset rotation
  };

  // Determine Compatibility Icons (Fallbacks if not provided in data)
  const getPlatformIcons = () => {
    // If platforms exist in data, map them (assuming strings like 'windows', 'mac')
    if (product.platforms && product.platforms.length > 0) {
       return product.platforms.map((p, i) => {
           const lowP = p.toLowerCase();
           if (lowP.includes('win')) return <Monitor key={i} size={12} className="text-gray-400" />;
           if (lowP.includes('mac') || lowP.includes('ios')) return <Command key={i} size={12} className="text-gray-400" />;
           if (lowP.includes('android')) return <Smartphone key={i} size={12} className="text-gray-400" />;
           return null;
       });
    }

    // Fallback logic based on category
    switch (product.category) {
        case 'entertainment': // Netflix, Spotify
        case 'music':
            return (
                <>
                    <Monitor size={12} className="text-gray-400" title="TV/PC" />
                    <Smartphone size={12} className="text-gray-400" title="Mobile" />
                    <Tablet size={12} className="text-gray-400" title="Tablet" />
                </>
            );
        case 'work': // Office, Windows
        case 'design': // Adobe
            return (
                <>
                    <Monitor size={12} className="text-gray-400" title="Windows" />
                    <Command size={12} className="text-gray-400" title="MacOS" />
                </>
            );
        case 'ai': // ChatGPT
        case 'security': // VPN
            return (
                <>
                    <Globe size={12} className="text-gray-400" title="Web" />
                    <Smartphone size={12} className="text-gray-400" title="App" />
                </>
            );
        default:
            return <Monitor size={12} className="text-gray-400" />;
    }
  };

  // Ưu tiên dùng slug từ DB, nếu không có thì tự tạo từ tên
  const productLink = `/product/${product.slug || slugify(product.name)}`;

  return (
    <div 
        className="group perspective-1000 h-full"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
        <div 
            ref={cardRef}
            className="relative bg-white rounded-[1.75rem] p-5 h-full flex flex-col transition-all duration-200 ease-out shadow-apple hover:shadow-float will-change-transform border border-white/50"
            style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Glassmorphism Reflection / Shine */}
            <div 
                className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 pointer-events-none transition-opacity duration-300 z-20 mix-blend-overlay"
                style={{
                    opacity: isHovering ? 0.3 : 0,
                    backgroundPosition: `${-rotation.y * 5}% ${-rotation.x * 5}%` // Simple parallax effect for shine
                }}
            />

            {/* Image Area */}
            <Link to={productLink} className="block relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F7] mb-4 shadow-inner transform-gpu translate-z-10">
                <img 
                src={imgSrc} 
                alt={product.name} 
                onError={handleImageError}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                />
                {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                    -{product.discount}%
                </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex-1 flex flex-col transform-gpu translate-z-20">
                <div className="flex justify-between items-start mb-1.5">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{product.category}</p>
                    {product.isHot && <span className="text-[10px] font-black text-orange-500 flex items-center gap-1">🔥 HOT</span>}
                </div>
                
                <Link to={productLink} className="block mb-2">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors tracking-tight">
                        {product.name}
                    </h3>
                </Link>
                
                {/* OS Icons */}
                <div className="flex items-center gap-2 mb-4 h-4">
                    {getPlatformIcons()}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-gray-900 font-extrabold text-base">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                            <span className="text-gray-400 text-[11px] line-through font-medium">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                            </span>
                        )}
                    </div>
                    
                    <button 
                        onClick={(e) => {
                        e.preventDefault();
                        onAddToCart(product);
                        }}
                        className="bg-gray-900 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95"
                        title="Thêm vào giỏ"
                    >
                        <ShoppingCart size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
