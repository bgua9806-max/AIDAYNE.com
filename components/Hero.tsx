
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { HERO_SLIDES as FALLBACK_SLIDES, PRODUCTS } from '../constants';
import { HeroSlide } from '../types';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

export const Hero: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('isActive', true)
          .order('order', { ascending: true });

        if (!error && data && data.length > 0) {
          // Process link to ensure it uses slugs if it points to a product ID
          const processedData = data.map(slide => {
              if (slide.ctaLink.includes('/product/')) {
                  const idPart = slide.ctaLink.split('/product/')[1];
                  // Simple check if it looks like a number ID or UUID
                  const product = PRODUCTS.find(p => p.id === idPart);
                  if (product) {
                      return { ...slide, ctaLink: `/product/${slugify(product.name)}` };
                  }
              }
              return slide;
          });
          setSlides(processedData);
        } else {
          // Fallback slides processing
          const processedFallback = FALLBACK_SLIDES.map(slide => {
              if (slide.ctaLink.includes('/product/')) {
                  const idPart = slide.ctaLink.split('/product/')[1];
                  const product = PRODUCTS.find(p => p.id === idPart);
                  if (product) {
                      return { ...slide, ctaLink: `/product/${slugify(product.name)}` };
                  }
              }
              return slide;
          });
          setSlides(processedFallback);
        }
      } catch (err) {
        console.error("Fetch hero slides error:", err);
        setSlides(FALLBACK_SLIDES);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto Scroll Timer
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [currentSlide, isPaused, slides.length, nextSlide]);

  if (loading) {
    return <div className="pt-24 lg:pt-32 pb-8 lg:pb-12 px-4 max-w-[1440px] mx-auto h-[230px] md:h-[600px] bg-gray-100 rounded-[2rem] lg:rounded-[2.5rem] animate-pulse"></div>;
  }

  if (slides.length === 0) return null;

  return (
    <div className="pt-24 lg:pt-32 pb-6 lg:pb-12 px-3 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      {/* 
         Mobile Height: h-[230px] (Horizontal frame) 
         Desktop Height: md:h-[600px] (Original size)
      */}
      <div 
        className="relative h-[230px] sm:h-[400px] md:h-[600px] w-full rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-soft group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Inner */}
        <div 
          className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative">
               <img 
                 src={slide.image} 
                 alt={slide.title} 
                 className="absolute inset-0 w-full h-full object-cover"
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1600x600?text=Banner+Error' }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent lg:from-black/60 lg:via-black/20"></div>
               
               {/* Text Content */}
               <div className="absolute bottom-0 left-0 p-5 md:p-16 w-full max-w-4xl pb-8 md:pb-16 lg:pb-16">
                  <h2 
                    className={`text-xl sm:text-3xl md:text-6xl font-bold mb-1 md:mb-4 tracking-tight leading-tight transform transition-all duration-700 delay-100 line-clamp-2 ${
                        slide.textColor === 'black' ? 'text-gray-900' : 'text-white'
                    } ${currentSlide === slides.indexOf(slide) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  >
                    {slide.title}
                  </h2>
                  <p 
                     className={`text-xs sm:text-base md:text-xl font-medium mb-3 md:mb-8 max-w-xl transform transition-all duration-700 delay-200 line-clamp-1 md:line-clamp-none ${
                         slide.textColor === 'black' ? 'text-gray-700' : 'text-gray-200'
                     } ${currentSlide === slides.indexOf(slide) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  >
                    {slide.subtitle}
                  </p>
                  
                  {slide.ctaText && (
                    <Link 
                       to={slide.ctaLink} 
                       className={`inline-flex items-center gap-1.5 px-4 py-2 md:px-8 md:py-3.5 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition-all transform duration-700 delay-300 ${
                           slide.textColor === 'black' 
                           ? 'bg-gray-900 text-white hover:bg-black' 
                           : 'bg-white text-gray-900 hover:bg-gray-100'
                       } ${currentSlide === slides.indexOf(slide) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                    >
                       {slide.ctaText} <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </Link>
                  )}
               </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows (Visible on Hover, Desktop Only) */}
        {slides.length > 1 && (
            <>
                <button 
                  onClick={prevSlide}
                  className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300"
                >
                  <ChevronRight size={24} />
                </button>
            </>
        )}

        {/* Navigation Dots */}
        {slides.length > 1 && (
            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 z-20">
            {slides.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                    currentSlide === index 
                    ? 'w-4 h-1.5 md:w-8 md:h-2 bg-white' 
                    : 'w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
