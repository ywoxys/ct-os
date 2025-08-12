/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `cpf` (text, unique)
      - `telefone` (text)
      - `email` (text, optional)
      - `endereco` (text, optional)
      - `matricula` (text, optional)
      - `telefones_adicionais` (text array, optional)
      - `observacoes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to users)
      - `updated_by` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for authenticated users to manage clients
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text UNIQUE NOT NULL,
  telefone text NOT NULL,
  email text,
  endereco text,
  matricula text,
  telefones_adicionais text[],
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all clients
CREATE POLICY "Users can read all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert clients
CREATE POLICY "Users can insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
    )
  );

-- Policy for users to update clients
CREATE POLICY "Users can update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
    )
  );

-- Policy for admin users to delete clients
CREATE POLICY "Admin users can delete clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'administrador-all'
      AND u.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);
CREATE INDEX IF NOT EXISTS idx_clients_nome ON clients(nome);
CREATE INDEX IF NOT EXISTS idx_clients_telefone ON clients(telefone);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);