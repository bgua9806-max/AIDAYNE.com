
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, CreditCard, QrCode, Lock, CheckCircle, Package } from 'lucide-react';

const { useNavigate, Link } = ReactRouterDOM;

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate('/products');
    }
    window.scrollTo(0, 0);
  }, [cart, navigate, isSuccess]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Create Order Payload
      const newOrder = {
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        total: totalAmount,
        status: 'pending', // Default status
        payment_method: paymentMethod === 'qr' ? 'Chuyển khoản QR' : paymentMethod === 'momo' ? 'Ví MoMo' : 'Thẻ quốc tế',
        items: cart // Store cart items as JSON
      };

      // 2. Insert into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) throw error;

      // 3. Success Handling
      setOrderId(data.id);
      setIsSuccess(true);
      clearCart();
      
    } catch (error: any) {
      alert('Có lỗi xảy ra khi tạo đơn hàng: ' + error.message);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in-up">
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle size={48} strokeWidth={3} />
           </div>
           <h1 className="text-3xl font-extrabold text-gray-900">Đặt hàng thành công!</h1>
           <p className="text-gray-500 text-lg">
             Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là:
           </p>
           <div className="bg-gray-100 py-3 px-6 rounded-xl font-mono text-xl font-bold text-gray-900 inline-block border border-gray-200 border-dashed">
              #{orderId.slice(0, 8).toUpperCase()}
           </div>
           <p className="text-sm text-gray-500">
             Thông tin đơn hàng đã được gửi tới email <strong>{formData.email}</strong>.
           </p>
           
           <div className="pt-8 space-y-3">
              <Link to="/order-lookup" className="block w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-primary-hover transition-all">
                 Tra cứu đơn hàng
              </Link>
              <Link to="/" className="block w-full py-4 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all">
                 Về trang chủ
              </Link>
           </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full text-gray-500 hover:text-black shadow-sm transition-all">
              <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-bold text-gray-900">Thanh toán an toàn</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: FORM */}
           <div className="lg:col-span-7 space-y-6">
              
              {/* Customer Info */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm">1</span>
                    Thông tin nhận hàng
                 </h2>
                 <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Họ và tên</label>
                          <input 
                            type="text" 
                            name="name" 
                            required 
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nguyễn Văn A" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            required 
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="0912..." 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email nhận key/tài khoản</label>
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none" 
                        />
                        <p className="text-xs text-orange-500 font-medium ml-1">Vui lòng nhập chính xác email để nhận thông tin đơn hàng.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Ghi chú (Tùy chọn)</label>
                        <textarea 
                          name="note" 
                          rows={2}
                          value={formData.note}
                          onChange={handleInputChange}
                          placeholder="Lời nhắn cho người bán..." 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none resize-none" 
                        ></textarea>
                    </div>
                 </form>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm">2</span>
                    Phương thức thanh toán
                 </h2>
                 <div className="space-y-3">
                    
                    {/* QR Code Banking */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-primary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                       <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-primary" />
                       <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200 shadow-sm text-blue-600">
                          <QrCode size={24} />
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-gray-900">Chuyển khoản Ngân hàng (VietQR)</div>
                          <div className="text-xs text-gray-500">Tự động xác nhận sau 30 giây</div>
                       </div>
                    </label>

                    {/* Momo */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-[#A50064] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}>
                       <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#A50064]" />
                       <div className="w-10 h-10 rounded-lg bg-[#A50064] flex items-center justify-center shadow-sm text-white font-bold text-xs">
                          MoMo
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-gray-900">Ví điện tử MoMo</div>
                          <div className="text-xs text-gray-500">Quét mã thanh toán siêu tốc</div>
                       </div>
                    </label>

                    {/* Visa/Master */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                       <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-black" />
                       <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm text-white">
                          <CreditCard size={20} />
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-gray-900">Thẻ quốc tế (Visa/Master)</div>
                          <div className="text-xs text-gray-500">An toàn, bảo mật SSL</div>
                       </div>
                    </label>

                 </div>
              </div>

           </div>

           {/* RIGHT: SUMMARY */}
           <div className="lg:col-span-5">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-28">
                 <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package size={20} /> Tóm tắt đơn hàng
                 </h2>
                 
                 <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                       <div key={item.id} className="flex gap-3 items-start">
                          <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                             <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</div>
                             <div className="text-xs text-gray-500 mt-1">SL: {item.quantity}</div>
                          </div>
                          <div className="font-bold text-primary text-sm">
                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-gray-500">
                       <span>Tạm tính</span>
                       <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                       <span>Giảm giá</span>
                       <span className="text-green-600 font-medium">0đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-2">
                       <span>Tổng cộng</span>
                       <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
                    </div>
                 </div>

                 <button 
                    form="checkout-form"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {isProcessing ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                       <>Thanh toán ngay <ShieldCheck size={20} /></>
                    )}
                 </button>

                 <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock size={12} /> Thông tin được mã hóa bảo mật 256-bit
                 </div>
              </div>
           </div>

        </div>
      </div>
    </main>
  );
};
