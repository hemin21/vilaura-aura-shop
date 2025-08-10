-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create wishlists table
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create recently_viewed table
CREATE TABLE public.recently_viewed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create cart table for persistent cart items
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add category_id to products table
ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add to their own wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can remove from their own wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Recently viewed policies  
CREATE POLICY "Users can view their own recently viewed" ON public.recently_viewed
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add to their own recently viewed" ON public.recently_viewed
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own recently viewed" ON public.recently_viewed
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Cart items policies
CREATE POLICY "Users can view their own cart" ON public.cart_items
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add to their own cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own cart" ON public.cart_items
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete from their own cart" ON public.cart_items
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at DESC);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);

-- Insert sample categories
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Herbal Soap', 'Natural herbal soaps with traditional ingredients', true),
  ('Glycerine Soap', 'Gentle glycerine-based soaps for sensitive skin', true),
  ('Skincare', 'Premium skincare products and treatments', true),
  ('Face Care', 'Specialized products for facial care', true),
  ('Body Care', 'Complete body care solutions', true);

-- Update existing products with categories
UPDATE public.products SET category_id = (
  SELECT id FROM public.categories WHERE name = 'Herbal Soap' LIMIT 1
) WHERE category = 'Herbal Soap';

UPDATE public.products SET category_id = (
  SELECT id FROM public.categories WHERE name = 'Glycerine Soap' LIMIT 1
) WHERE category = 'Glycerine Soap';

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();