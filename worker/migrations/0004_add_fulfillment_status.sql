ALTER TABLE orders ADD COLUMN fulfillment_status TEXT;
ALTER TABLE orders ADD COLUMN fulfillment_status_updated_at TEXT;

UPDATE orders
SET fulfillment_status = CASE
  WHEN status = 'paid' THEN 'paid'
  ELSE 'pending_payment'
END
WHERE fulfillment_status IS NULL;

UPDATE orders
SET fulfillment_status_updated_at = CASE
  WHEN status = 'paid' THEN COALESCE(paid_at, updated_at, created_at)
  ELSE created_at
END
WHERE fulfillment_status_updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
