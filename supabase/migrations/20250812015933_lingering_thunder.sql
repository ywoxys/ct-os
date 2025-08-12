/*
  # Create cash_flows table

  1. New Tables
    - `cash_flows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `user_name` (text)
      - `type` (text with check constraint)
      - `amount` (decimal)
      - `description` (text)
      - `category` (text, optional)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `cash_flows` table
    - Add policies for authenticated users to manage cash flows
*/

CREATE TABLE IF NOT EXISTS cash_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  user_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cash_flows ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all cash flows
CREATE POLICY "Users can read all cash flows"
  ON cash_flows
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admin users to insert cash flows
CREATE POLICY "Admin users can insert cash flows"
  ON cash_flows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('administrador-all', 'administrador')
      AND u.is_active = true
    )
  );

-- Policy for admin users to update cash flows
CREATE POLICY "Admin users can update cash flows"
  ON cash_flows
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('administrador-all', 'administrador')
      AND u.is_active = true
    )
  );

-- Policy for admin-all users to delete cash flows
CREATE POLICY "Admin-all users can delete cash flows"
  ON cash_flows
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
CREATE INDEX IF NOT EXISTS idx_cash_flows_user_id ON cash_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flows_type ON cash_flows(type);
CREATE INDEX IF NOT EXISTS idx_cash_flows_date ON cash_flows(date);
CREATE INDEX IF NOT EXISTS idx_cash_flows_created_at ON cash_flows(created_at);