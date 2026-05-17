CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  discount_percent INTEGER NOT NULL,
  single_use INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  reserved_at TEXT,
  reserved_order_id TEXT,
  used_at TEXT,
  used_order_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  note TEXT,
  CHECK (discount_percent >= 1 AND discount_percent <= 99),
  CHECK (single_use IN (0, 1)),
  CHECK (is_active IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, used_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_reserved_order_id ON promo_codes(reserved_order_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_used_order_id ON promo_codes(used_order_id);

ALTER TABLE orders ADD COLUMN pricing_json TEXT;
