-- Add tax_status column to customers with a safe default.
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS tax_status TEXT NOT NULL DEFAULT 'final_consumer';

-- Seed existing wholesale customers with the appropriate default.
UPDATE customers
  SET tax_status = 'simplified_taxpayer'
  WHERE category = 'wholesale';
