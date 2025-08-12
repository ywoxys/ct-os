/*
  # Create histories table

  1. New Tables
    - `histories`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `user_id` (uuid, foreign key to users)
      - `user_name` (text)
      - `action` (text)
      - `description` (text)
      - `old_data` (jsonb, optional)
      - `new_data` (jsonb, optional)
      - `timestamp` (timestamp)
      - `type` (text with check constraint)

  2. Security
    - Enable RLS on `histories` table
    - Add policies for authenticated users to read and create histories
*/

CREATE TABLE IF NOT EXISTS histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  user_name text NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  timestamp timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN ('automatic', 'manual'))
);

ALTER TABLE histories ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all histories
CREATE POLICY "Users can read all histories"
  ON histories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert histories
CREATE POLICY "Users can insert histories"
  ON histories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_histories_client_id ON histories(client_id);
CREATE INDEX IF NOT EXISTS idx_histories_user_id ON histories(user_id);
CREATE INDEX IF NOT EXISTS idx_histories_timestamp ON histories(timestamp);
CREATE INDEX IF NOT EXISTS idx_histories_action ON histories(action);