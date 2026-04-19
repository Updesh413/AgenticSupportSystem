-- Create legacy schema
CREATE SCHEMA IF NOT EXISTS legacy;

-- Create legacy orders table
CREATE TABLE IF NOT EXISTS legacy.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some legacy data
INSERT INTO legacy.orders (customer_email, status, total_amount) VALUES
('test@example.com', 'SHIPPED', 99.99),
('refund_me@example.com', 'DELIVERED', 45.00),
('pending@example.com', 'PENDING', 120.50);
