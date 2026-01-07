
export interface Variant {
  id: string;
  name: string; // Ví dụ: "1 Tháng", "1 Năm", "Vĩnh viễn"
  price: number;
  originalPrice: number;
}

export interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  purchasedType?: string; // Ví dụ: "Gói 1 năm"
}

export interface Product {
  id: string;
  name: string;
  slug?: string; // URL thân thiện SEO
  description: string; // Mô tả ngắn (Sapo)
  content?: string; // Nội dung chi tiết (HTML)
  price: number;
  originalPrice: number;
  discount: number;
  image: string; // Ảnh đại diện chính
  category: string;
  rating: number;
  sold: number;
  isHot?: boolean;
  isNew?: boolean;
  
  // Các trường bổ sung
  platforms?: string[]; // Ví dụ: ['windows', 'mac', 'ios', 'android']
  features?: string[]; // Danh sách tính năng nổi bật
  activationGuide?: string; // Hướng dẫn kích hoạt
  version?: string; // Phiên bản phần mềm
  developer?: string; // Nhà phát triển
  
  // Mới cập nhật theo yêu cầu
  warrantyPolicy?: string; // Chính sách bảo hành
  variants?: Variant[]; // Các gói đăng ký (Option)
  reviews?: Review[]; // Danh sách đánh giá
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
  textColor?: 'white' | 'black'; // Tùy chọn màu chữ để hợp với nền ảnh
}

export interface Category {
  id: string;
  name: string;
  icon: any; // Lucide icon component type
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: Variant; // Lưu gói khách chọn
}

export interface BlogPost {
  id: string;
  title: string;
  slug?: string; // URL thân thiện SEO
  excerpt: string;
  content: string; // HTML string for rich text
  author: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
  relatedProductId?: string; // To link back to product
}

export interface Customer {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}
