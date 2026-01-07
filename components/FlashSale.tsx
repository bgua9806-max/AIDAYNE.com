
import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

interface FlashSaleProps {
  addToCart: (product: Product) => void;
}

interface FlashSaleItem {
  id: string;
  product_id: string;
  discount_percent: number;
  quantity_total: number;
  quantity_sold: number;
  end_time: string;
  product?: Product;
}

export const FlashSale: React.FC<FlashSaleProps> = ({ addToCart }) => {
  const [items, setItems] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        // 1. Lấy danh sách Flash Sale đang active
        const { data: salesData, error } = await supabase
          .from('flash_sales')
          .select('*')
          .eq('is_active', true)
          .order('end_time', { ascending: true })
          .limit(8);

        if (salesData && !error && salesData.length > 0) {
             const now = new Date();
             
             // 2. Lấy thông tin chi tiết Product từ DB
             const productIds = salesData.map(s => s.product_id);
             
             const { data: dbProducts } = await supabase
                .from('products')
                .select('*')
                .in('id', productIds);

             // 3. Merge dữ liệu thông minh (DB + Fallback)
             const mergedItems = salesData.map(sale => {
                 // Bỏ qua nếu đã hết hạn
                 if (new Date(sale.end_time) < now) return null;

                 // Tìm sản phẩm trong DB
                 let dbProduct = dbProducts?.find(p => p.id === sale.product_id);
                 
                 // Tìm sản phẩm trong Fallback (dữ liệu mẫu)
                 const fallbackProduct = FALLBACK_PRODUCTS.find(p => p.id === sale.product_id);

                 let finalProduct: Product | undefined = undefined;

                 if (dbProduct) {
                    // Nếu có trong DB, dùng DB. Nhưng nếu DB thiếu ảnh, mượn ảnh từ Fallback
                    finalProduct = { ...dbProduct };
                    if (!finalProduct.image && fallbackProduct?.image) {
                        finalProduct.image = fallbackProduct.image;
                    }
                 } else if (fallbackProduct) {
                    // Nếu không có trong DB, dùng Fallback hoàn toàn
                    finalProduct = fallbackProduct;
                 }

                 if (!finalProduct) return null;

                 // Đảm bảo luôn có ảnh placeholder nếu cả 2 đều thiếu
                 if (!finalProduct.image) {
                     finalProduct.image = 'https://via.placeholder.com/300?text=No+Image';
                 }

                 return {
                     ...sale,
                     product: finalProduct
                 };
             }).filter((item): item is FlashSaleItem => item !== null); // Lọc bỏ null
             
             setItems(mergedItems.slice(0, 4)); // Chỉ lấy 4 item đầu tiên hợp lệ
        } else {
             setItems([]);
        }
      } catch (err) {
        console.error("Flash Sale Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (items.length === 0) return;
    
    // Tìm thời gian kết thúc sớm nhất để đếm ngược
    const targetDate = new Date(items[0].end_time).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Nếu không có dữ liệu thì ẩn section
  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 animate-fade-in-up">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 overflow-hidden relative">
        {/* Header with Timer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 uppercase italic tracking-tighter">
                    Flash Sale
                 </h2>
                 <Zap className="text-yellow-400 fill-yellow-400 animate-pulse" size={32} />
              </div>
              {!loading && items.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-lg shadow-gray-400/50">
                     <span className="bg-gray-800 px-1.5 rounded">{formatTime(timeLeft.hours)}</span>:
                     <span className="bg-gray-800 px-1.5 rounded">{formatTime(timeLeft.minutes)}</span>:
                     <span className="bg-gray-800 px-1.5 rounded">{formatTime(timeLeft.seconds)}</span>
                  </div>
              )}
           </div>
           
           <Link to="/products?sort=price-asc" className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
              Xem tất cả <ArrowRight size={16} />
           </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
           {loading ? (
               [1,2,3,4].map(i => <div key={i} className="h-[340px] bg-gray-100 rounded-3xl animate-pulse"></div>)
           ) : items.map((item) => {
             if (!item.product) return null;
             
             const originalPrice = item.product.price;
             // Tính giá sau khi giảm theo % set trong bảng flash_sales
             const salePrice = Math.floor(originalPrice * (1 - item.discount_percent / 100));
             
             // Tính phần trăm đã bán (để hiển thị thanh progress)
             let soldPercentage = 0;
             if (item.quantity_total > 0) {
                soldPercentage = Math.round((item.quantity_sold / item.quantity_total) * 100);
             }
             if (soldPercentage > 100) soldPercentage = 100;

             return (
                 <div key={item.id} className="group bg-gray-50 rounded-3xl p-4 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white">
                       <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
                       <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-extrabold px-2.5 py-1.5 rounded-lg shadow-md shadow-red-600/30 flex items-center gap-1">
                          <Zap size={10} fill="currentColor" /> -{item.discount_percent}%
                       </div>
                    </div>
                    
                    <Link to={`/product/${item.product.slug || slugify(item.product.name)}`}>
                        <h3 className="font-bold text-gray-900 text-[15px] mb-2 line-clamp-2 h-[42px] leading-snug group-hover:text-primary transition-colors" title={item.product.name}>
                            {item.product.name}
                        </h3>
                    </Link>
                    
                    <div className="flex items-end gap-2 mb-3 mt-auto">
                       <span className="text-xl font-extrabold text-red-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salePrice)}
                       </span>
                       <span className="text-xs text-gray-400 line-through font-medium mb-1">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                       </span>
                    </div>

                    {/* Scarcity Bar */}
                    <div className="relative h-5 bg-red-100/50 rounded-full overflow-hidden mb-4 border border-red-100">
                       <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${soldPercentage}%` }}
                       ></div>
                       <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-red-600 uppercase drop-shadow-sm z-10">
                          <span className="bg-white/30 px-2 rounded-full backdrop-blur-[1px]">
                             {soldPercentage >= 90 ? 'Sắp cháy hàng' : `Đã bán ${item.quantity_sold}`}
                          </span>
                       </div>
                       {/* Animated stripes */}
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30 animate-pulse"></div>
                    </div>

                    <button 
                       onClick={() => addToCart({ ...item.product!, price: salePrice, originalPrice: originalPrice })}
                       className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-primary transition-all shadow-lg shadow-gray-200 group-hover:shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95"
                    >
                       Mua ngay
                    </button>
                 </div>
             );
           })}
        </div>

        {/* Background Decorations */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </section>
  );
};
