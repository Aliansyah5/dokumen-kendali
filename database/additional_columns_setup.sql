-- SQL script untuk menambahkan tabel kolom tambahan dokumen
-- Run this in your Supabase SQL Editor

-- Create additional_document_data table untuk menyimpan kolom tambahan
CREATE TABLE IF NOT EXISTS additional_document_data (
  id BIGSERIAL PRIMARY KEY,
  package_id TEXT NOT NULL,
  sub_document_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_name TEXT NOT NULL,
  -- Kolom untuk sub document 1 (Balai)
  kak TEXT,
  -- Kolom untuk sub document 2 (Direktorat Irigasi dan Rawa)
  nota_dinas_dir_irigasi_ke_ditjen TEXT,
  nota_dinas_dit_irwa_ke_ki TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraint untuk memastikan kombinasi package_id, sub_document_id, document_id unik
  UNIQUE(package_id, sub_document_id, document_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_additional_document_data_package_sub
ON additional_document_data(package_id, sub_document_id);

CREATE INDEX IF NOT EXISTS idx_additional_document_data_document
ON additional_document_data(document_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_additional_document_data_updated_at
  BEFORE UPDATE ON additional_document_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE additional_document_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on additional_document_data" ON additional_document_data
  FOR ALL USING (true) WITH CHECK (true);
