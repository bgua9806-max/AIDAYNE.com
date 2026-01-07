
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ProductsPage } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { OrderLookup } from './pages/OrderLookup';
import { Login } from './pages/Login';
import { Contact } from './pages/Contact';
import { Checkout } from './pages/Checkout';
import { CartDrawer } from './components/CartDrawer';
import { ChatBot } from './components/ChatBot';
import { Product, CartItem } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

// Admin Imports
import { AdminLayout } from './components/layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import { AdminFlashSale } from './pages/admin/AdminFlashSale';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminHero } from './pages/admin/AdminHero';
import { AdminReviews } from './pages/admin/AdminReviews';

const { HashRouter: Router, Routes, Route, Navigate } = ReactRouterDOM;

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- AUTOMATIC SUPABASE KEEP-ALIVE MECHANISM ---
  useEffect(() => {
    const runKeepAlive = async () => {
      try {
        // 1. Check the last heartbeat
        const { data, error } = await supabase
          .from('keep_alive')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        const now = new Date();
        let shouldPing = false;

        if (error || !data || data.length === 0) {
          // If table is empty or error (table might create first time), try to ping
          shouldPing = true;
        } else {
          const lastPing = new Date(data[0].created_at);
          const diffTime = Math.abs(now.getTime() - lastPing.getTime());
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          // Only ping if last ping was more than 2.5 days ago (safety buffer for 3 days)
          if (diffDays >= 2.5) {
            shouldPing = true;
          }
        }

        // 2. Perform Ping (Insert) if needed
        if (shouldPing) {
          console.log("🛡️ System Heartbeat: Sending keep-alive signal to Supabase...");
          await supabase.from('keep_alive').insert({});
          
          // 3. Cleanup: Remove rows older than 30 days to keep table light
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          await supabase.from('keep_alive').delete().lt('created_at', thirtyDaysAgo.toISOString());
        }
      } catch (err) {
        // Silent fail to not disrupt user experience
        console.warn("Heartbeat check failed (Active only if 'keep_alive' table exists).");
      }
    };

    runKeepAlive();
  }, []);
  // ----------------------------------------------

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // Open cart when item is added
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ChatBot /> 
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="products" element={<AdminProducts />} />
             <Route path="reviews" element={<AdminReviews />} />
             <Route path="orders" element={<AdminOrders />} />
             <Route path="flash-sale" element={<AdminFlashSale />} />
             <Route path="promotions" element={<AdminPromotions />} />
             <Route path="blog" element={<AdminBlog />} />
             <Route path="customers" element={<AdminCustomers />} />
             <Route path="hero" element={<AdminHero />} />
          </Route>

          {/* Public Routes */}
          <Route path="*" element={
            <>
              <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
              <Routes>
                <Route path="/" element={<Home addToCart={addToCart} />} />
                <Route path="/products" element={<ProductsPage addToCart={addToCart} />} />
                <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
                <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost addToCart={addToCart} />} />
                <Route path="/order-lookup" element={<OrderLookup />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
        
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cart} 
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
