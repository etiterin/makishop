ALTER TABLE promo_codes ADD COLUMN free_shipping INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_promo_codes_free_shipping ON promo_codes(free_shipping);
