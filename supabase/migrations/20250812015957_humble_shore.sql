/*
  # Create ZTalk system tables

  1. New Tables
    - `ztalk_contacts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text, unique)
      - `email` (text, optional)
      - `tags` (text array)
      - `last_interaction` (timestamp, optional)
      - `status` (text with check constraint)
      - `created_at` (timestamp)

    - `ztalk_conversations`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to ztalk_contacts)
      - `contact_name` (text)
      - `contact_phone` (text)
      - `assigned_to` (uuid, foreign key to users, optional)
      - `assigned_to_name` (text, optional)
      - `status` (text with check constraint)
      - `priority` (text with check constraint)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_message` (text, optional)
      - `last_message_at` (timestamp, optional)

    - `ztalk_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to ztalk_conversations)
      - `sender_id` (uuid, foreign key to users)
      - `sender_name` (text)
      - `message` (text)
      - `type` (text with check constraint)
      - `direction` (text with check constraint)
      - `timestamp` (timestamp)
      - `status` (text with check constraint)

    - `ztalk_queues`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, optional)
      - `members` (uuid array)
      - `auto_assign` (boolean, default true)
      - `max_conversations` (integer, default 5)
      - `working_hours` (jsonb)
      - `is_active` (boolean, default true)

    - `ztalk_broadcasts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `message` (text)
      - `recipients` (text array)
      - `scheduled_for` (timestamp, optional)
      - `status` (text with check constraint)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `sent_at` (timestamp, optional)
      - `stats` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin users to manage ZTalk
*/

CREATE TABLE IF NOT EXISTS ztalk_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  tags text[] DEFAULT '{}',
  last_interaction timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'blocked', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ztalk_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES ztalk_contacts(id) NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  status text NOT NULL CHECK (status IN ('open', 'closed', 'pending', 'in_progress')) DEFAULT 'open',
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message text,
  last_message_at timestamptz
);

CREATE TABLE IF NOT EXISTS ztalk_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES ztalk_conversations(id) NOT NULL,
  sender_id uuid REFERENCES users(id) NOT NULL,
  sender_name text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'image', 'document', 'audio')) DEFAULT 'text',
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')) DEFAULT 'sent'
);

CREATE TABLE IF NOT EXISTS ztalk_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  members uuid[] DEFAULT '{}',
  auto_assign boolean DEFAULT true,
  max_conversations integer DEFAULT 5 CHECK (max_conversations > 0),
  working_hours jsonb NOT NULL DEFAULT '{"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}',
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS ztalk_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  recipients text[] NOT NULL,
  scheduled_for timestamptz,
  status text NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')) DEFAULT 'draft',
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  stats jsonb DEFAULT '{"sent": 0, "delivered": 0, "read": 0, "failed": 0}'
);

-- Enable RLS on all tables
ALTER TABLE ztalk_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ztalk_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ztalk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ztalk_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ztalk_broadcasts ENABLE ROW LEVEL SECURITY;

-- Policies for ztalk_contacts
CREATE POLICY "Admin users can manage contacts"
  ON ztalk_contacts
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

-- Policies for ztalk_conversations
CREATE POLICY "Admin users can manage conversations"
  ON ztalk_conversations
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

-- Policies for ztalk_messages
CREATE POLICY "Admin users can manage messages"
  ON ztalk_messages
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

-- Policies for ztalk_queues
CREATE POLICY "Admin users can manage queues"
  ON ztalk_queues
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

-- Policies for ztalk_broadcasts
CREATE POLICY "Admin users can manage broadcasts"
  ON ztalk_broadcasts
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ztalk_contacts_phone ON ztalk_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_ztalk_contacts_status ON ztalk_contacts(status);
CREATE INDEX IF NOT EXISTS idx_ztalk_conversations_contact_id ON ztalk_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_ztalk_conversations_assigned_to ON ztalk_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ztalk_conversations_status ON ztalk_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ztalk_messages_conversation_id ON ztalk_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ztalk_messages_timestamp ON ztalk_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_ztalk_queues_is_active ON ztalk_queues(is_active);
CREATE INDEX IF NOT EXISTS idx_ztalk_broadcasts_status ON ztalk_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_ztalk_broadcasts_created_by ON ztalk_broadcasts(created_by);