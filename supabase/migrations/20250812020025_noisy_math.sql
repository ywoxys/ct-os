/*
  # Update users table to include whatsapp role

  1. Changes
    - Update role check constraint to include 'whatsapp'

  2. Security
    - No changes to existing policies
*/

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new check constraint with whatsapp role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('administrador-all', 'administrador', 'funcionario', 'whatsapp'));

-- Insert additional demo users if they don't exist
INSERT INTO users (name, email, role, setor, login, password, is_active) VALUES
  ('Carlos WhatsApp', 'carlos@sistemact.com', 'whatsapp', 'vendas', 'carlos', 'carlos123', true)
ON CONFLICT (login) DO NOTHING;