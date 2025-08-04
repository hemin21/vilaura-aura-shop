-- Allow guest orders by modifying the orders table and RLS policies

-- Drop existing RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Drop existing RLS policies for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

-- Create new RLS policies for orders that allow guest orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Create new RLS policies for order_items that allow guest orders
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id IS NULL OR orders.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id IS NULL OR orders.user_id = auth.uid())
    )
  ); 