import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { Product } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  products?: Product[];
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! 👋 Tôi là trợ lý AI của AIDAYNE. Bạn đang tìm kiếm phần mềm hay tài khoản gì hôm nay? (Ví dụ: "Tôi cần phần mềm thiết kế", "Tài khoản xem phim giá rẻ")',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const analyzeIntent = (text: string): { response: string, products?: Product[] } => {
    const lowerText = text.toLowerCase();
    let foundProducts: Product[] = [];
    
    // 1. Check for specific product names
    const nameMatch = PRODUCTS.filter(p => lowerText.includes(p.name.toLowerCase()));
    if (nameMatch.length > 0) {
        return {
            response: `Tôi tìm thấy ${nameMatch.length} sản phẩm phù hợp với yêu cầu của bạn:`,
            products: nameMatch
        };
    }

    // 2. Check for keywords mapping to categories
    const keywords: {[key: string]: string} = {
        'thiết kế': 'design', 'ảnh': 'design', 'video': 'design', 'adobe': 'design', 'canva': 'design',
        'phim': 'entertainment', 'nhạc': 'entertainment', 'giải trí': 'entertainment', 'netflix': 'entertainment', 'youtube': 'entertainment',
        'học': 'education', 'tiếng anh': 'education', 'duolingo': 'education', 'elsa': 'education',
        'làm việc': 'work', 'office': 'work', 'win': 'work', 'word': 'work', 'excel': 'work',
        'bảo mật': 'security', 'vpn': 'security', 'virus': 'security',
        'ai': 'ai', 'gpt': 'ai', 'chat': 'ai', 'bot': 'ai'
    };

    let matchedCategory = '';
    for (const [key, catId] of Object.entries(keywords)) {
        if (lowerText.includes(key)) {
            matchedCategory = catId;
            break;
        }
    }

    if (matchedCategory) {
        foundProducts = PRODUCTS.filter(p => p.category === matchedCategory).slice(0, 3);
        return {
            response: `Dưới đây là các gợi ý hàng đầu cho nhu cầu "${matchedCategory === 'ai' ? 'Trí tuệ nhân tạo' : matchedCategory === 'design' ? 'Thiết kế' : 'Giải trí'}" của bạn:`,
            products: foundProducts
        };
    }

    // 3. Check for "cheap" or "price" intent
    if (lowerText.includes('rẻ') || lowerText.includes('giá')) {
        foundProducts = [...PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 3);
        return {
            response: "Đây là những sản phẩm có giá tốt nhất tại cửa hàng hiện nay:",
            products: foundProducts
        };
    }

    // 4. Fallback (General help)
    return {
        response: "Tôi chưa hiểu rõ ý bạn lắm. Bạn có thể thử hỏi về danh mục cụ thể như 'Giải trí', 'Học tập' hoặc tên phần mềm như 'Netflix', 'ChatGPT' được không?",
        products: []
    };
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const { response, products } = analyzeIntent(userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        products: products,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-primary animate-bounce-slow'}`}
      >
        {isOpen ? (
            <X size={28} className="text-white" />
        ) : (
            <>
                <MessageCircle size={28} className="text-white fill-white" />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400 border-2 border-primary"></span>
                </span>
            </>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[70vh] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-orange-600 p-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                 <Bot size={20} className="text-white" />
              </div>
              <div>
                 <h3 className="font-bold text-white text-sm">AIDAYNE Assistant</h3>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-xs text-red-100 font-medium">Sẵn sàng hỗ trợ</span>
                 </div>
              </div>
           </div>
           <button onClick={toggleChat} className="text-white/80 hover:text-white p-1">
             <X size={20} />
           </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                   {msg.text}
                </div>
                
                {/* Product Recommendations */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 space-y-2 w-full max-w-[90%]">
                    {msg.products.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        onClick={() => setIsOpen(false)} // Close chat on click (optional)
                        className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                         <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                         <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-xs truncate group-hover:text-primary transition-colors">{product.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-primary font-bold text-xs">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                               {product.discount > 0 && <span className="text-[10px] text-gray-400 line-through">-{product.discount}%</span>}
                            </div>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                         </div>
                      </Link>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
           ))}
           
           {isTyping && (
             <div className="flex items-start">
               <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100">
           <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-lg shadow-red-500/20"
              >
                <Send size={16} className={inputValue.trim() ? "translate-x-0.5" : ""} />
              </button>
           </form>
           <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <Sparkles size={10} /> Được hỗ trợ bởi AIDAYNE AI
              </span>
           </div>
        </div>
      </div>
    </>
  );
};