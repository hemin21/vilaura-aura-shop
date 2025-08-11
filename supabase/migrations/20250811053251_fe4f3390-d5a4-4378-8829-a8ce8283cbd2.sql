-- Add policies for service functions to create orders and order_items bypassing RLS
-- This allows the edge function to create orders for any user (including guests)

-- Allow service role to insert orders (for edge functions)
CREATE POLICY "service_insert_orders" ON public.orders
FOR INSERT
WITH CHECK (true);

-- Allow service role to insert order_items (for edge functions) 
CREATE POLICY "service_insert_order_items" ON public.order_items
FOR INSERT  
WITH CHECK (true);

-- Allow service role to update orders (for edge functions)
CREATE POLICY "service_update_orders" ON public.orders
FOR UPDATE
USING (true);

-- Add some debugging to help track order processing
COMMENT ON TABLE public.orders IS 'Orders table with RLS policies that allow both authenticated users and service functions to manage orders';
COMMENT ON TABLE public.order_items IS 'Order items table with RLS policies that allow both authenticated users and service functions to manage order items';