
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  description text,
  content text, -- HTML Content
  price numeric DEFAULT 0,
  "originalPrice" numeric DEFAULT 0,
  discount integer DEFAULT 0,
  image text,
  category text,
  rating numeric DEFAULT 5,
  sold integer DEFAULT 0,
  "isHot" boolean DEFAULT false,
  "isNew" boolean DEFAULT false,
  "isActive" boolean DEFAULT true,
  slug text UNIQUE,
  
  -- Additional fields
  platforms text[],
  features text[],
  "activationGuide" text,
  version text,
  developer text,
  "warrantyPolicy" text,
  variants jsonb,
  reviews jsonb
);

-- 2. ORDERS TABLE (Fixed: Added email column)
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_name text,
  email text, -- IMPORTANT: Fixed missing column
  phone text,
  note text,
  total numeric,
  status text DEFAULT 'pending', -- pending, processing, completed, cancelled
  payment_method text,
  items jsonb -- Store cart items snapshot
);

-- 3. BLOGS TABLE
CREATE TABLE IF NOT EXISTS blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text,
  author text,
  image text,
  category text,
  read_time text,
  date text -- DD/MM/YYYY
);

-- 4. CUSTOMERS TABLE (Sync with Auth)
CREATE TABLE IF NOT EXISTS customers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  phone text
);

-- 5. FLASH SALES TABLE
CREATE TABLE IF NOT EXISTS flash_sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  discount_percent integer DEFAULT 0,
  quantity_total integer DEFAULT 0,
  quantity_sold integer DEFAULT 0,
  end_time timestamp with time zone,
  is_active boolean DEFAULT true
);

-- 6. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text,
  code text UNIQUE,
  "discountPercent" integer,
  "startDate" date,
  "endDate" date,
  status text DEFAULT 'active',
  "usageCount" integer DEFAULT 0
);

-- 7. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text,
  subtitle text,
  image text,
  "ctaText" text,
  "ctaLink" text,
  "order" integer DEFAULT 0,
  "isActive" boolean DEFAULT true,
  "textColor" text DEFAULT 'white'
);

-- 8. KEEP ALIVE (Heartbeat)
CREATE TABLE IF NOT EXISTS keep_alive (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) - Optional: Disable if you want public access for demo
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read / Admin Write)
-- Note: Replace 'true' with proper auth logic for production

-- Products: Everyone can read, anyone can write (Demo Mode)
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Write Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public Delete Products" ON products FOR DELETE USING (true);

-- Orders: Everyone can insert, Everyone can read (Demo Mode)
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Update Orders" ON orders FOR UPDATE USING (true);

-- Blogs
CREATE POLICY "Public Read Blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Public Write Blogs" ON blogs FOR ALL USING (true);

-- Customers
CREATE POLICY "Public Read Customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Write Customers" ON customers FOR ALL USING (true);

-- Flash Sales
CREATE POLICY "Public Read Flash Sales" ON flash_sales FOR SELECT USING (true);
CREATE POLICY "Public Write Flash Sales" ON flash_sales FOR ALL USING (true);

-- Promotions
CREATE POLICY "Public Read Promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Public Write Promotions" ON promotions FOR ALL USING (true);

-- Hero Slides
CREATE POLICY "Public Read Hero" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Write Hero" ON hero_slides FOR ALL USING (true);

-- TRIGGER for User Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.customers (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
