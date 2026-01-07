
import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { CartItem } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemove, 
  onUpdateQuantity 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow render before transition
      requestAnimationFrame(() => setIsAnimating(true));
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutNavigation = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 ease-out transform ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Giỏ hàng <span className="text-gray-400 font-medium text-base ml-1">({cartItems.length})</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                 <Trash2 size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Giỏ hàng trống</h3>
              <p className="text-gray-500 max-w-[200px]">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
              <button 
                onClick={() => { onClose(); navigate('/products'); }}
                className="mt-4 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</h4>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-primary">
                       {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                         onClick={() => onUpdateQuantity(item.id, 1)}
                         className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 safe-area-bottom">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Tạm tính</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Giảm giá</span>
                <span className="text-green-600 font-medium">-0 ₫</span>
              </div>
              <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-extrabold text-2xl text-primary tracking-tight">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleCheckoutNavigation}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 text-lg"
              >
                Tiến hành đặt hàng <ArrowRight size={20} />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                 <ShieldCheck size={14} className="text-green-600" />
                 <span>Bảo mật 100%</span>
                 <span className="mx-1 text-gray-300">|</span>
                 <CreditCard size={14} className="text-gray-400" />
                 <span>Thanh toán đa dạng</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
