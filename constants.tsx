
import { 
  Monitor, 
  Gamepad2, 
  Briefcase, 
  ShieldCheck, 
  Cloud, 
  GraduationCap, 
  Film, 
  Music,
  Bot
} from 'lucide-react';
import { Category, Product, BlogPost, HeroSlide } from './types';

export const CATEGORIES: Category[] = [
  { id: 'ai', name: 'AI Tools', icon: Bot },
  { id: 'entertainment', name: 'Giải trí', icon: Film },
  { id: 'work', name: 'Làm việc', icon: Briefcase },
  { id: 'design', name: 'Thiết kế', icon: Monitor },
  { id: 'security', name: 'Bảo mật', icon: ShieldCheck },
  { id: 'education', name: 'Học tập', icon: GraduationCap },
  { id: 'game', name: 'Game', icon: Gamepad2 },
  { id: 'music', name: 'Nghe nhạc', icon: Music },
  { id: 'cloud', name: 'Lưu trữ', icon: Cloud },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: '1',
    title: 'Unlock the Power of GPT-4o',
    subtitle: 'Experience the next generation of AI. Smarter, faster, and more creative than ever before.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Get Started',
    ctaLink: '/product/3',
    order: 1,
    isActive: true,
    textColor: 'white'
  },
  {
    id: '2',
    title: 'Adobe Creative Cloud All Apps',
    subtitle: 'Everything you need to create anything you can imagine. Now 70% off.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Buy Now',
    ctaLink: '/product/5',
    order: 2,
    isActive: true,
    textColor: 'white'
  },
  {
    id: '3',
    title: 'Netflix Premium 4K HDR',
    subtitle: 'Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime.',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Upgrade Now',
    ctaLink: '/product/1',
    order: 3,
    isActive: true,
    textColor: 'white'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tài khoản Netflix Premium',
    description: 'Xem phim 4K HDR, không quảng cáo, hỗ trợ mọi thiết bị.',
    price: 69000,
    originalPrice: 260000,
    discount: 73,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=500&fit=crop',
    category: 'entertainment',
    rating: 4.9,
    sold: 15420,
    isHot: true,
    warrantyPolicy: 'Bảo hành trọn đời gói. Lỗi 1 đổi 1 trong 5 phút.',
    variants: [
      { id: 'v1', name: '1 Tháng', price: 69000, originalPrice: 260000 },
      { id: 'v2', name: '3 Tháng', price: 199000, originalPrice: 780000 },
      { id: 'v3', name: '1 Năm', price: 750000, originalPrice: 3120000 },
    ],
    reviews: [
      { id: 'r1', user: 'Nguyễn Văn A', rating: 5, comment: 'Shop uy tín, tài khoản dùng mượt, 4K nét căng.', date: '12/03/2024', purchasedType: '1 Năm' },
      { id: 'r2', user: 'Trần Thị B', rating: 5, comment: 'Hỗ trợ nhiệt tình, 1h sáng nhắn tin vẫn rep.', date: '10/03/2024', purchasedType: '1 Tháng' }
    ]
  },
  {
    id: '6',
    name: 'Canva Pro Vĩnh Viễn',
    description: 'Thiết kế đồ họa dễ dàng, hàng triệu mẫu có sẵn.',
    price: 49000,
    originalPrice: 199000,
    discount: 75,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?w=500&h=500&fit=crop',
    category: 'design',
    rating: 4.8,
    sold: 7800,
    isHot: true,
    warrantyPolicy: 'Bảo hành vĩnh viễn (Lifetime). Nếu mất Pro sẽ được nâng cấp lại miễn phí.',
    variants: [
       { id: 'c1', name: 'Gia hạn Chính Chủ', price: 49000, originalPrice: 199000 },
       { id: 'c2', name: 'Cấp Tài khoản Mới', price: 29000, originalPrice: 99000 },
    ]
  },
  {
    id: '2',
    name: 'Nâng cấp YouTube Premium',
    description: 'Không quảng cáo, nghe nhạc tắt màn hình, YouTube Music.',
    price: 29000,
    originalPrice: 79000,
    discount: 63,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=500&fit=crop',
    category: 'entertainment',
    rating: 4.8,
    sold: 8900,
    isHot: true
  },
  {
    id: '3',
    name: 'Tài khoản ChatGPT Plus',
    description: 'Sử dụng GPT-4, DALL-E 3, phân tích dữ liệu nâng cao.',
    price: 499000,
    originalPrice: 590000,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1694509748680-77a876779b63?w=500&h=500&fit=crop',
    category: 'ai',
    rating: 5.0,
    sold: 3200,
    isNew: true
  },
  {
    id: '4',
    name: 'Nâng cấp Spotify Premium',
    description: 'Nghe nhạc chất lượng cao, tải nhạc offline.',
    price: 19000,
    originalPrice: 59000,
    discount: 68,
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500&h=500&fit=crop',
    category: 'music',
    rating: 4.7,
    sold: 5600
  },
  {
    id: '5',
    name: 'Tài khoản Adobe All Apps',
    description: 'Photoshop, Illustrator, Premiere Pro, After Effects...',
    price: 150000,
    originalPrice: 900000,
    discount: 83,
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop',
    category: 'design',
    rating: 4.9,
    sold: 1200
  },
  {
    id: '7',
    name: 'Key Windows 11 Pro',
    description: 'Bản quyền vĩnh viễn, update thoải mái từ Microsoft.',
    price: 199000,
    originalPrice: 4500000,
    discount: 95,
    image: 'https://images.unsplash.com/photo-1633419461186-7d40a2e50594?w=500&h=500&fit=crop',
    category: 'work',
    rating: 4.9,
    sold: 2300
  },
  {
    id: '8',
    name: 'Microsoft Office 365',
    description: 'Word, Excel, PowerPoint, OneDrive 1TB. Chính chủ.',
    price: 129000,
    originalPrice: 1200000,
    discount: 89,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    category: 'work',
    rating: 4.9,
    sold: 4500
  },
  {
    id: '9',
    name: 'Tài khoản ELSA Speak Pro',
    description: 'Học phát âm tiếng Anh chuẩn bản xứ với AI.',
    price: 89000,
    originalPrice: 289000,
    discount: 69,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&h=500&fit=crop',
    category: 'education',
    rating: 4.6,
    sold: 1100
  },
  {
    id: '10',
    name: 'ExpressVPN 1 Năm',
    description: 'Bảo mật thông tin, truy cập web bị chặn, tốc độ cao.',
    price: 399000,
    originalPrice: 2300000,
    discount: 82,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=500&fit=crop',
    category: 'security',
    rating: 5.0,
    sold: 800
  },
  {
    id: '11',
    name: 'Duolingo Super',
    description: 'Học ngoại ngữ không giới hạn, không quảng cáo.',
    price: 159000,
    originalPrice: 599000,
    discount: 73,
    image: 'https://images.unsplash.com/photo-1552068751-345134f9a3e6?w=500&h=500&fit=crop',
    category: 'education',
    rating: 4.9,
    sold: 2100
  },
  {
    id: '12',
    name: 'Midjourney',
    description: 'Tạo ảnh AI nghệ thuật chất lượng cao nhất hiện nay.',
    price: 250000,
    originalPrice: 750000,
    discount: 66,
    image: 'https://images.unsplash.com/photo-1684469046643-415c8e76311d?w=500&h=500&fit=crop',
    category: 'ai',
    rating: 4.9,
    sold: 1500,
    isNew: true
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'GPT-4o vs Claude 3.5 Sonnet: Ai mới là ông vua AI hiện tại?',
    excerpt: 'So sánh chi tiết về khả năng coding, viết content và xử lý hình ảnh của hai mô hình ngôn ngữ lớn nhất hiện nay.',
    content: `Cuộc chiến AI tạo sinh chưa bao giờ nóng đến thế. Nếu như OpenAI vừa tung ra GPT-4o với khả năng đa phương thức thời gian thực (Omni), thì Anthropic cũng không kém cạnh khi giới thiệu Claude 3.5 Sonnet - mô hình được đánh giá là "thông minh nhất" ở thời điểm hiện tại.\n\nTrong bài viết này, chúng ta sẽ đi sâu vào so sánh hai "gã khổng lồ" này trên các tiêu chí quan trọng nhất: Khả năng lập trình, Sáng tạo nội dung và Tốc độ xử lý.\n\nGPT-4o: Tốc độ và Đa phương thức\nĐiểm mạnh lớn nhất của GPT-4o chính là tốc độ. Nó phản hồi gần như tức thì, mang lại cảm giác như đang trò chuyện với người thật. Khả năng xử lý hình ảnh và giọng nói của GPT-4o cũng vượt trội, giúp nó trở thành trợ lý ảo toàn năng nhất.\n\nClaude 3.5 Sonnet: Tư duy và Lập trình\nNgược lại, Claude 3.5 Sonnet lại tỏa sáng ở khả năng tư duy logic và viết code. Các bài test cho thấy code do Claude tạo ra ít lỗi hơn, sạch hơn và tuân thủ các best-practice tốt hơn so với GPT-4o. Ngoài ra, văn phong của Claude cũng tự nhiên và "giống người" hơn trong các tác vụ viết lách sáng tạo.\n\nKết luận: Nên chọn ai?\nNếu bạn cần một trợ lý đa năng, xử lý nhanh gọn mọi thứ từ hình ảnh đến giọng nói, GPT-4o là lựa chọn số 1 (có trong gói ChatGPT Plus).\nTuy nhiên, nếu công việc của bạn tập trung vào lập trình (Coding) hoặc viết lách chuyên sâu, Claude 3.5 Sonnet sẽ là người bạn đồng hành đáng tin cậy hơn.`,
    author: 'Minh Techie',
    date: '15/03/2024',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    category: 'Công nghệ AI',
    readTime: '5 phút',
    relatedProductId: '3'
  },
  {
    id: '2',
    title: '5 mẹo sử dụng Canva Pro để thiết kế Slide đẹp như Designer',
    excerpt: 'Tổng hợp các phím tắt và tính năng ẩn trên Canva giúp bạn tiết kiệm 50% thời gian thiết kế.',
    content: `Bạn không cần phải là một Designer chuyên nghiệp để tạo ra những bản thuyết trình (Slide) ấn tượng. Với Canva Pro, mọi thứ trở nên dễ dàng hơn bao giờ hết. Dưới đây là 5 mẹo "nhỏ mà có võ" giúp bạn nâng tầm bản thiết kế của mình.\n\n1. Sử dụng tính năng "Brand Kit"\nĐừng lãng phí thời gian chỉnh sửa màu sắc thủ công cho từng slide. Hãy thiết lập Brand Kit (Bộ thương hiệu) bao gồm Logo, Bảng màu và Font chữ. Chỉ với 1 cú click, toàn bộ slide sẽ được đổi sang màu sắc thương hiệu của bạn.\n\n2. Phím tắt "thần thánh"\n- Nhấn "T" để thêm văn bản.\n- Nhấn "R" để thêm hình chữ nhật.\n- Nhấn "C" để thêm hình tròn.\n- Nhấn "L" để thêm đường kẻ.\n\n3. Tính năng Magic Resize\nBạn thiết kế một banner cho Facebook nhưng muốn đăng lên cả Instagram Story? Đừng làm lại từ đầu. Tính năng Magic Resize của bản Pro sẽ tự động điều chỉnh kích thước và bố cục cho phù hợp với mọi nền tảng chỉ trong vài giây.\n\n4. Xóa phông nền (Background Remover)\nĐây là tính năng đáng tiền nhất của Canva Pro. Chỉ cần 1 click, bạn có thể tách chủ thể ra khỏi nền ảnh cực kỳ sắc nét, giúp slide trông chuyên nghiệp và thoáng mắt hơn hẳn.`,
    author: 'Lan Design',
    date: '12/03/2024',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?w=1200&auto=format&fit=crop&q=80',
    category: 'Thủ thuật',
    readTime: '3 phút',
    relatedProductId: '6'
  },
  {
    id: '3',
    title: 'Tại sao nên mua YouTube Premium thay vì dùng các tool chặn quảng cáo?',
    excerpt: 'Phân tích rủi ro bảo mật khi dùng phần mềm bên thứ 3 và lợi ích của gói Premium chính chủ.',
    content: `Việc quảng cáo xuất hiện dày đặc trên YouTube khiến nhiều người khó chịu. Giải pháp thường thấy là cài đặt các tiện ích chặn quảng cáo (Adblock). Tuy nhiên, Google đang ngày càng mạnh tay với các công cụ này, và quan trọng hơn, chúng tiềm ẩn nhiều rủi ro bảo mật.\n\nRủi ro từ phần mềm chặn quảng cáo lậu\nNhiều tiện ích mở rộng yêu cầu quyền truy cập vào dữ liệu duyệt web của bạn. Điều này có nghĩa là họ có thể theo dõi lịch sử truy cập, thậm chí đánh cắp thông tin đăng nhập nếu tiện ích đó chứa mã độc.\n\nLợi ích của YouTube Premium chính chủ\nVới chi phí chỉ bằng một ly cà phê mỗi tháng (khi mua tại AIDAYNE), bạn nhận được:\n- Trải nghiệm sạch bóng quảng cáo 100% trên mọi thiết bị (TV, điện thoại, PC).\n- YouTube Music Premium: Nghe nhạc chất lượng cao, tắt màn hình vẫn nghe được nhạc.\n- Tải video xuống để xem offline khi không có mạng.\n- Hỗ trợ các nhà sáng tạo nội dung mà bạn yêu thích.\n\nĐầu tư cho Premium không chỉ là mua sự thoải mái, mà còn là mua sự an toàn cho tài khoản Google của bạn.`,
    author: 'Admin AIDAYNE',
    date: '10/03/2024',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&auto=format&fit=crop&q=80',
    category: 'Đánh giá',
    readTime: '4 phút',
    relatedProductId: '2'
  },
  {
    id: '4',
    title: 'Top 3 phần mềm VPN tốt nhất để bảo mật thông tin năm 2024',
    excerpt: 'Đánh giá chi tiết NordVPN, ExpressVPN và Surfshark dựa trên tốc độ và độ ổn định tại Việt Nam.',
    content: `Trong kỷ nguyên số, dữ liệu cá nhân là tài sản vô giá. Sử dụng VPN (Mạng riêng ảo) không chỉ giúp bạn truy cập các nội dung bị giới hạn địa lý mà còn mã hóa toàn bộ dữ liệu truyền tải, bảo vệ bạn khỏi sự dòm ngó của hacker khi sử dụng Wifi công cộng.\n\n1. ExpressVPN - Ông vua tốc độ\nNếu bạn cần tốc độ nhanh nhất để xem phim 4K, chơi game không lag, ExpressVPN là lựa chọn số 1. Giao thức Lightway độc quyền giúp kết nối cực nhanh và ổn định. Tuy nhiên, giá thành khá cao so với mặt bằng chung.\n\n2. NordVPN - Cân bằng hoàn hảo\nNordVPN nổi tiếng với tính năng bảo mật kép (Double VPN) và chặn quảng cáo tích hợp. Tốc độ rất tốt và mạng lưới máy chủ rộng khắp. Đây là sự lựa chọn cân bằng giữa hiệu năng và giá cả.\n\n3. Surfshark - Giá rẻ cho mọi nhà\nĐiểm mạnh nhất của Surfshark là cho phép kết nối KHÔNG GIỚI HẠN thiết bị. Bạn có thể mua 1 tài khoản và chia sẻ cho cả gia đình lớn sử dụng. Tốc độ ổn định, đủ dùng cho nhu cầu cơ bản.`,
    author: 'Tuan Security',
    date: '08/03/2024',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee46a38531?w=1200&auto=format&fit=crop&q=80',
    category: 'Bảo mật',
    readTime: '6 phút',
    relatedProductId: '10'
  },
  {
    id: '5',
    title: 'Review Microsoft 365 Copilot: Trợ lý AI đắc lực cho dân văn phòng',
    excerpt: 'Cách AI tích hợp trong Word, Excel, PowerPoint thay đổi cách chúng ta làm việc mãi mãi.',
    content: `Microsoft đã chính thức đưa AI vào bộ ứng dụng văn phòng quen thuộc của họ với cái tên Microsoft 365 Copilot. Đây không chỉ là một bản cập nhật nhỏ, mà là một cuộc cách mạng thực sự.\n\nCopilot trong Word\nBạn bí ý tưởng khi viết báo cáo? Chỉ cần gõ một câu lệnh, Copilot sẽ soạn thảo bản nháp đầu tiên cho bạn, tóm tắt các văn bản dài, hoặc viết lại đoạn văn theo giọng điệu chuyên nghiệp hơn.\n\nCopilot trong Excel\nQuên đi những công thức hàm phức tạp. Giờ đây, bạn có thể hỏi Excel bằng tiếng Việt: "Hãy phân tích xu hướng doanh thu quý này và vẽ biểu đồ so sánh với năm ngoái". Copilot sẽ làm tất cả cho bạn trong tích tắc.\n\nCopilot trong PowerPoint\nBiến một file Word dài dằng dặc thành một bài thuyết trình Slide đẹp mắt chỉ với 1 cú click? Đó chính xác là những gì Copilot làm được. Nó giúp bạn tiết kiệm hàng giờ đồng hồ căn chỉnh bố cục và tìm ảnh minh họa.`,
    author: 'Office Master',
    date: '05/03/2024',
    image: 'https://images.unsplash.com/photo-1662947036643-a745941aa52b?w=1200&auto=format&fit=crop&q=80',
    category: 'Tin tức',
    readTime: '5 phút',
    relatedProductId: '8'
  }
];
