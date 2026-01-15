
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, CreditCard, Lock, CheckCircle, Package, Copy, Download, Mail, Info } from 'lucide-react';

const { useNavigate, Link } = ReactRouterDOM;

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
}

// Cấu hình ngân hàng
const BANK_INFO = {
  BANK_ID: 'MB', // MBBank
  ACCOUNT_NO: '808123456789',
  ACCOUNT_NAME: 'NGUYEN TRONG HUU',
  TEMPLATE: 'compact2' // Giao diện QR: compact, compact2, qr_only, print
};

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
  const [isPaidConfirmed, setIsPaidConfirmed] = useState(false); // Trạng thái xác nhận đã thanh toán
  const [orderId, setOrderId] = useState('');
  const [finalTotal, setFinalTotal] = useState(0); // Lưu tổng tiền để tạo QR

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

  // Tự động xóa khoảng trắng thừa khi người dùng nhập xong (blur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Clean data before sending
      const cleanData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          note: formData.note.trim()
      };

      // 1. Create Order Payload
      const newOrder = {
        customer_name: cleanData.name,
        email: cleanData.email,
        phone: cleanData.phone,
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
      setFinalTotal(totalAmount); // Lưu lại tổng tiền trước khi clear cart
      setIsSuccess(true);
      clearCart();
      window.scrollTo(0, 0);
      
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error);
      
      // Xử lý thông báo lỗi cụ thể cho người dùng/admin
      let errorMessage = error.message || 'Lỗi kết nối';
      
      if (errorMessage.includes("Could not find the 'email' column")) {
          alert(`LỖI HỆ THỐNG (DATABASE):\n\nBảng 'orders' trong Supabase chưa có cột 'email'.\n\nVui lòng chạy lệnh SQL:\nALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;`);
      } else if (errorMessage.includes("Could not find the 'phone' column")) {
          alert(`LỖI HỆ THỐNG (DATABASE):\n\nBảng 'orders' trong Supabase chưa có cột 'phone'.\n\nVui lòng chạy lệnh SQL:\nALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;`);
      } else {
          alert('Có lỗi xảy ra khi tạo đơn hàng: ' + errorMessage);
      }
      setIsProcessing(false);
    }
  };

  const handleConfirmPaid = async () => {
      setIsPaidConfirmed(true);
      window.scrollTo(0, 0);
      
      // Cập nhật trạng thái đơn hàng thành 'processing' (Đang xử lý)
      if (orderId) {
          try {
              await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId);
          } catch (error) {
              console.error("Lỗi cập nhật trạng thái:", error);
          }
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép: ' + text);
  };

  if (isSuccess) {
    // Tạo nội dung chuyển khoản: ADN + 6 ký tự đầu của mã đơn
    const transferContent = `ADN${orderId.slice(0, 6).toUpperCase()}`;
    // Link tạo QR động từ VietQR
    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${finalTotal}&addInfo=${transferContent}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`;

    // Hiển thị QR nếu chọn QR và chưa bấm xác nhận thanh toán
    const showQrView = paymentMethod === 'qr' && !isPaidConfirmed;

    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
        <div className="max-w-xl w-full text-center space-y-8 animate-fade-in-up">
           
           {showQrView ? (
             <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-primary p-6 text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard size={32} strokeWidth={3} />
                    </div>
                    <h1 className="text-2xl font-extrabold">Thanh toán đơn hàng</h1>
                    <p className="text-white/80 text-sm mt-2">Vui lòng quét mã bên dưới để hoàn tất.</p>
                </div>
                
                <div className="p-8">
                    {/* QR Code Section */}
                    <div className="relative group w-fit mx-auto">
                        <img 
                            src={qrUrl} 
                            alt="VietQR Payment" 
                            className="w-full max-w-[300px] mx-auto rounded-xl border-2 border-gray-100 shadow-sm"
                        />
                        <a 
                            href={qrUrl} 
                            download="payment-qr.png"
                            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg text-gray-700 hover:text-primary shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Tải mã QR"
                        >
                            <Download size={20} />
                        </a>
                    </div>

                    {/* Bank Details */}
                    <div className="mt-8 space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-500 text-sm">Ngân hàng</span>
                            <span className="font-bold text-gray-900">MB BANK (Quân Đội)</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-500 text-sm">Chủ tài khoản</span>
                            <span className="font-bold text-gray-900 uppercase">{BANK_INFO.ACCOUNT_NAME}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-500 text-sm">Số tài khoản</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-primary tracking-wider">{BANK_INFO.ACCOUNT_NO}</span>
                                <button onClick={() => copyToClipboard(BANK_INFO.ACCOUNT_NO)} className="text-gray-400 hover:text-gray-900"><Copy size={14}/></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-500 text-sm">Số tiền</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-red-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                                </span>
                                <button onClick={() => copyToClipboard(finalTotal.toString())} className="text-gray-400 hover:text-gray-900"><Copy size={14}/></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Nội dung</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 bg-yellow-100 px-2 py-1 rounded text-sm">{transferContent}</span>
                                <button onClick={() => copyToClipboard(transferContent)} className="text-gray-400 hover:text-gray-900"><Copy size={14}/></button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button 
                            onClick={handleConfirmPaid}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-pulse-slow"
                        >
                            <CheckCircle size={20} /> Tôi đã thanh toán
                        </button>
                        <p className="text-xs text-gray-400 italic">
                            * Lưu ý: Chỉ bấm nút trên sau khi bạn đã chuyển khoản thành công.
                        </p>
                    </div>
                </div>
             </div>
           ) : (
             // Standard Success View (Used for MoMo, Card, or QR after clicking "Paid")
             <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce-slow">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Đặt hàng thành công!</h1>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Cảm ơn bạn đã mua hàng. Hệ thống đang kiểm tra thanh toán và sẽ gửi đơn hàng cho bạn trong giây lát.
                </p>
                <div className="bg-gray-100 py-3 px-6 rounded-xl font-mono text-xl font-bold text-gray-900 inline-block border border-gray-200 border-dashed">
                    #{orderId.slice(0, 8).toUpperCase()}
                </div>
                <p className="text-sm text-gray-500">
                    Thông tin đơn hàng cũng sẽ được gửi tới email <strong>{formData.email}</strong>.
                </p>
             </>
           )}
           
           <div className="pt-4 space-y-3 max-w-sm mx-auto">
              <Link to="/order-lookup" className="block w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all">
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
                            onBlur={handleBlur}
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
                            onBlur={handleBlur}
                            placeholder="0912..." 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email nhận key/tài khoản</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="email" 
                              name="email" 
                              required 
                              autoComplete="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              placeholder="name@example.com" 
                              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none" 
                            />
                        </div>
                        {/* Changed visual style to Info box to prevent error confusion */}
                        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-1">
                            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                Quan trọng: Đơn hàng sẽ được gửi tự động qua email này. Vui lòng nhập chính xác.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Ghi chú (Tùy chọn)</label>
                        <textarea 
                          name="note" 
                          rows={2}
                          value={formData.note}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
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
                       <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200 shadow-sm text-blue-600 overflow-hidden">
                          <img src="https://img.vietqr.io/image/MB-808123456789-compact.png" className="w-full h-full object-cover p-1" alt="VietQR" />
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-gray-900">Chuyển khoản Ngân hàng (VietQR)</div>
                          <div className="text-xs text-gray-500">Tự động điền nội dung & số tiền</div>
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
