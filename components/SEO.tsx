
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: object; // JSON-LD Structured Data
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "AIDAYNE.com - Kho phần mềm bản quyền, AI Tools & Tài khoản Premium giá rẻ, uy tín số 1 Việt Nam.", 
  image = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80",
  url = window.location.href,
  type = 'website',
  schema
}) => {
  
  useEffect(() => {
    // 1. Update Title
    document.title = title.includes('AIDAYNE') ? title : `${title} | AIDAYNE.com`;

    // 2. Helper to update meta tags
    const updateMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta
    updateMeta('description', description);
    
    // 4. Update Open Graph (Facebook/Zalo)
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', url, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:site_name', 'AIDAYNE.com', 'property');

    // 5. Update Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // 6. Inject JSON-LD Schema (For Google Rich Snippets)
    if (schema) {
      let script = document.querySelector('#seo-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    // Cleanup function
    return () => {
        // Optional: Remove schema on unmount if needed, or let next page overwrite it
    };
  }, [title, description, image, url, type, schema]);

  return null;
};
