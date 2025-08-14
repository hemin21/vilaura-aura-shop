-- Create owner_notifications table for tracking new orders
CREATE TABLE public.owner_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'new_order',
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  details JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.owner_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (you can modify this based on your admin system)
CREATE POLICY "Owner notifications are viewable by authenticated users" 
ON public.owner_notifications 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_owner_notifications_updated_at
BEFORE UPDATE ON public.owner_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();