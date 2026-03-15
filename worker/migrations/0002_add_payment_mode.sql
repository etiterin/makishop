ALTER TABLE orders ADD COLUMN payment_mode TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_mode ON orders(payment_mode);
