
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, ChevronRight, Sparkles, RefreshCcw, Minus } from 'lucide-react';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { Product } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { slugify } from '../lib/utils';
import { supabase } from '../lib/supabase';

const { Link, useLocation } = ReactRouterDOM;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  products?: Product[];
  timestamp: Date;
}

const QUICK_REPLIES = [
    "Sản phẩm HOT 🔥",
    "Tài khoản Netflix",
    "Phần mềm thiết kế",
    "Học tiếng Anh",
    "VPN bảo mật"
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! 👋 Tôi là trợ lý AI của AIDAYNE. Bạn cần tìm phần mềm hay tài khoản gì hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Determine bottom position based on route (Mobile only)
  // Product Detail has Buy Bar (~80px) -> Needs bottom-24
  // Main Pages have Bottom Nav (~90px) -> Needs bottom-28
  // Login/Admin -> bottom-6
  const getMobilePositionClass = () => {
      const path = location.pathname;
      if (path.startsWith('/admin') || path === '/login') return 'bottom-6';
      if (path.startsWith('/product/')) return 'bottom-24'; // Above Buy Bar
      return 'bottom-28'; // Above Bottom Nav
  };

  const mobileBottomClass = getMobilePositionClass();

  // 1. Fetch Real Data on Mount
  useEffect(() => {
      const fetchProducts = async () => {
          try {
              const { data, error } = await supabase.from('products').select('*');
              if (!error && data && data.length > 0) {
                  // Merge fallback images if needed
                  const merged = data.map((p: Product) => {
                      if (!p.image) {
                          const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(p.id));
                          return fallback ? { ...p, image: fallback.image } : p;
                      }
                      return p;
                  });
                  setAllProducts(merged);
              } else {
                  setAllProducts(FALLBACK_PRODUCTS);
              }
          } catch (e) {
              setAllProducts(FALLBACK_PRODUCTS);
          }
      };
      fetchProducts();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  // 2. Intelligent Search Logic
  const analyzeIntent = (inputText: string): { response: string, products?: Product[] } => {
    const normalizeInput = slugify(inputText); // "thiet ke"
    const lowerInput = inputText.toLowerCase();
    
    // A. Special Keywords
    if (lowerInput.includes('hot') || lowerInput.includes('bán chạy')) {
        const hotProducts = allProducts.filter(p => p.isHot).slice(0, 3);
        return {
            response: "Đây là những sản phẩm đang bán chạy nhất tại AIDAYNE 🔥:",
            products: hotProducts
        };
    }

    if (lowerInput.includes('mới') || lowerInput.includes('new')) {
        const newProducts = allProducts.filter(p => p.isNew).slice(0, 3);
        return {
            response: "Dạ, đây là các sản phẩm mới cập nhật:",
            products: newProducts
        };
    }

    // B. Scoring System Search
    // Tách câu input thành các từ khóa: "mua", "tai", "khoan", "netflix"
    const keywords = normalizeInput.split('-').filter(k => k.length > 1); // Loại bỏ từ quá ngắn
    
    const scoredProducts = allProducts.map(p => {
        let score = 0;
        const pName = slugify(p.name);
        const pDesc = slugify(p.description);
        const pCat = p.category.toLowerCase();

        // Check full phrase match (High priority)
        if (pName.includes(normalizeInput)) score += 20;
        
        // Check keywords
        keywords.forEach(word => {
            if (pName.includes(word)) score += 5; // Tên có chứa từ khóa
            if (pDesc.includes(word)) score += 2; // Mô tả có chứa
            if (pCat.includes(word)) score += 3; // Danh mục có chứa
        });

        return { product: p, score };
    });

    // Filter & Sort
    const matched = scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product)
        .slice(0, 3); // Lấy top 3

    if (matched.length > 0) {
        return {
            response: `Tôi tìm thấy ${matched.length} kết quả phù hợp nhất với "${inputText}":`,
            products: matched
        };
    }

    // C. Fallback
    return {
        response: "Xin lỗi, tôi chưa tìm thấy sản phẩm nào khớp với yêu cầu. Bạn thử tìm theo tên danh mục như 'Giải trí', 'Học tập' xem sao nhé?",
        products: []
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const { response, products } = analyzeIntent(text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        products: products,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend(inputValue);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${mobileBottomClass} lg:bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group 
        ${isOpen 
            ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto bg-gray-900 rotate-90' 
            : 'opacity-100 bg-primary animate-bounce-slow'
        }`}
      >
        {isOpen ? (
            <X size={28} className="text-white" />
        ) : (
            <>
                <MessageCircle size={28} className="text-white fill-white" />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400 border-2 border-white"></span>
                </span>
            </>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed ${mobileBottomClass} lg:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[70vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 z-[60] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-20 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-white/50 backdrop-blur-md p-5 flex items-center justify-between shrink-0 border-b border-gray-100">
           <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Bot size={22} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                 <h3 className="font-extrabold text-gray-900 text-base">AIDAYNE AI</h3>
                 <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Sparkles size={10} className="text-primary" /> Trợ lý ảo thông minh
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-2">
               <button onClick={() => setMessages([messages[0]])} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" title="Làm mới đoạn chat">
                 <RefreshCcw size={18} />
               </button>
               {/* Mobile Close Button */}
               <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Đóng chat">
                 <Minus size={22} />
               </button>
           </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F8F9FA] scroll-smooth">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                
                {/* Text Bubble */}
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                   {msg.text}
                </div>
                
                {/* Product Recommendations Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 space-y-3 w-full max-w-[95%]">
                    {msg.products.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.slug || slugify(product.name)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group"
                      >
                         <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         </div>
                         <div className="flex-1 min-w-0 py-0.5">
                            <div className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</div>
                            <p className="text-[10px] text-gray-500 line-clamp-1 mb-1.5">{product.description}</p>
                            <div className="flex items-center gap-2">
                               <span className="text-primary font-extrabold text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                               {product.discount > 0 && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-bold">-{product.discount}%</span>}
                            </div>
                         </div>
                         <div className="self-center">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                         </div>
                      </Link>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium opacity-60">
                  {msg.sender === 'user' ? 'Bạn' : 'AI Support'} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
           ))}
           
           {isTyping && (
             <div className="flex items-start">
               <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-1.5 w-fit">
                 <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                 <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-2 pb-4">
           {/* Quick Replies */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 px-2 mb-1">
               {QUICK_REPLIES.map((reply, idx) => (
                   <button 
                      key={idx}
                      onClick={() => handleSend(reply)}
                      className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200 rounded-full text-xs font-bold text-gray-600 transition-all active:scale-95"
                   >
                      {reply}
                   </button>
               ))}
           </div>

           <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2 px-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tên phần mềm..." 
                className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-[1.5rem] pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors shadow-lg shadow-primary/30"
              >
                <Send size={16} className={inputValue.trim() ? "translate-x-0.5" : ""} />
              </button>
           </form>
        </div>
      </div>
    </>
  );
};
