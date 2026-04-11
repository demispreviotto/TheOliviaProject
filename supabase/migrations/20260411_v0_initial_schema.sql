-- ==========================================
-- 1. TABLES DEFINITION
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  home_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 2. SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow authenticated users to read customers"
ON customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (true);