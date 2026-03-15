CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  inv_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL,
  amount_kopecks INTEGER NOT NULL,
  amount_rub TEXT NOT NULL,
  items_json TEXT NOT NULL,
  customer_json TEXT,
  status_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_inv_id ON orders(inv_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_token ON orders(status_token);
