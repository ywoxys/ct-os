/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text with check constraint)
      - `setor` (text with check constraint)
      - `login` (text, unique)
      - `password` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('administrador-all', 'administrador', 'funcionario')),
  setor text NOT NULL CHECK (setor IN ('adimplencia', 'homologacao', 'vendas', 'recepcao', 'geral')),
  login text UNIQUE NOT NULL,
  password text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all users
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admin users to manage users
CREATE POLICY "Admin users can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('administrador-all', 'administrador')
      AND u.is_active = true
    )
  );

-- Insert demo users
INSERT INTO users (name, email, role, setor, login, password, is_active) VALUES
  ('Admin Principal', 'admin@sistemact.com', 'administrador-all', 'geral', 'admin', 'admin123', true),
  ('João Silva', 'joao@sistemact.com', 'administrador', 'vendas', 'joao', 'joao123', true),
  ('Maria Santos', 'maria@sistemact.com', 'funcionario', 'recepcao', 'maria', 'maria123', true)
ON CONFLICT (login) DO NOTHING;