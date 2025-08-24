-- Create contacts table for parliamentary contact information
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  department VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  office_location VARCHAR(255),
  constituency VARCHAR(255),
  party VARCHAR(100),
  province VARCHAR(100),
  category VARCHAR(100), -- MP, Senator, Staff, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Removed foreign key constraints and made user_id nullable for demo purposes
-- Create orders table for tracking purchases
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT, -- Nullable, no foreign key constraint for demo
  contact_ids INTEGER[],
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'CAD',
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_results table for tracking search queries and results
CREATE TABLE IF NOT EXISTS search_results (
  id SERIAL PRIMARY KEY,
  user_id TEXT, -- Nullable, no foreign key constraint for demo
  query_text TEXT,
  filters JSONB,
  result_count INTEGER,
  contact_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_department ON contacts(department);
CREATE INDEX IF NOT EXISTS idx_contacts_party ON contacts(party);
CREATE INDEX IF NOT EXISTS idx_contacts_province ON contacts(province);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_search_results_user_id ON search_results(user_id);
