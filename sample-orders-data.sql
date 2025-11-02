-- Sample data insertion queries for testing
-- Replace 'your-email@example.com' with your actual email

-- Insert a sample order
INSERT INTO orders (
  order_number,
  customer_email,
  customer_name,
  customer_phone,
  shipping_address,
  total,
  status,
  items,
  payment_method,
  payment_status,
  tracking_url,
  notes
) VALUES (
  'ORD-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'your-email@example.com',
  'Your Name',
  '+1234567890',
  '{"address1": "123 Main St", "city": "Manila", "state": "Metro Manila", "zip": "1000", "country": "PH"}',
  1500.00,
  'paid',
  '[{"title": "Rose Bouquet", "quantity": 1, "price": 1200.00, "image": "/images/rose-bouquet.jpg"}, {"title": "Delivery Fee", "quantity": 1, "price": 300.00}]',
  'card',
  'paid',
  'https://tracking.example.com/ABC123',
  'Please deliver after 2 PM'
);

-- Insert another sample order
INSERT INTO orders (
  order_number,
  customer_email,
  customer_name,
  total,
  status,
  items,
  payment_method,
  payment_status
) VALUES (
  'ORD-' || (EXTRACT(EPOCH FROM NOW())::BIGINT + 1),
  'your-email@example.com',
  'Your Name',
  800.00,
  'shipped',
  '[{"title": "Sunflower Arrangement", "quantity": 1, "price": 800.00}]',
  'paymongo',
  'paid'
);

-- Query to check your orders
SELECT 
  id,
  order_number,
  customer_email,
  customer_name,
  total,
  status,
  created_at,
  tracking_url
FROM orders 
WHERE customer_email = 'your-email@example.com'
ORDER BY created_at DESC;

-- Query to see all orders (for debugging)
SELECT 
  id,
  order_number,
  customer_email,
  customer_name,
  total,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC
LIMIT 10;
