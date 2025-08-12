/*
  # Create reports system table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text with check constraint)
      - `data` (jsonb)
      - `generated_by` (uuid, foreign key to users)
      - `generated_at` (timestamp)
      - `period_start` (timestamp)
      - `period_end` (timestamp)
      - `filters` (jsonb, optional)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for admin users to manage reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('clients', 'cash', 'employees', 'ztalk', 'general')),
  data jsonb NOT NULL,
  generated_by uuid REFERENCES users(id) NOT NULL,
  generated_at timestamptz DEFAULT now(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  filters jsonb
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to read all reports
CREATE POLICY "Admin users can read all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('administrador-all', 'administrador')
      AND u.is_active = true
    )
  );

-- Policy for admin users to create reports
CREATE POLICY "Admin users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    generated_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('administrador-all', 'administrador')
      AND u.is_active = true
    )
  );

-- Policy for admin-all users to delete reports
CREATE POLICY "Admin-all users can delete reports"
  ON reports
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
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_reports_period ON reports(period_start, period_end);