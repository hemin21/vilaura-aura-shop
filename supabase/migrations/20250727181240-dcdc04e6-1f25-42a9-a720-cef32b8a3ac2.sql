-- Update product prices to Indian Rupees
-- CAFÉSKIN and GOLDEN GLOW = ₹50, others = ₹40

UPDATE public.products 
SET price = 50 
WHERE name IN ('CAFFÉSKIN', 'GOLDEN GLOW');

UPDATE public.products 
SET price = 40 
WHERE name IN ('LIMDA LEAF', 'KESUDA SOAP', 'KAPOOR COOL');