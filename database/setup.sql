-- SQL script to create tables in Supabase
-- Run this in your Supabase SQL Editor

-- Create timeline_schedules table
CREATE TABLE IF NOT EXISTS timeline_schedules (
  id BIGSERIAL PRIMARY KEY,
  package_id TEXT NOT NULL,
  sub_document_id TEXT,
  document_id TEXT NOT NULL,
  document_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_links table
CREATE TABLE IF NOT EXISTS document_links (
  id BIGSERIAL PRIMARY KEY,
  package_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_name TEXT NOT NULL,
  link_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timeline_schedules_package_sub
ON timeline_schedules(package_id, sub_document_id);

CREATE INDEX IF NOT EXISTS idx_timeline_schedules_date
ON timeline_schedules(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_document_links_package
ON document_links(package_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_timeline_schedules_updated_at
  BEFORE UPDATE ON timeline_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_links_updated_at
  BEFORE UPDATE ON document_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE timeline_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_links ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on timeline_schedules" ON timeline_schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on document_links" ON document_links
  FOR ALL USING (true) WITH CHECK (true);
