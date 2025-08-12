/*
  # Create chat system tables

  1. New Tables
    - `chat_channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, optional)
      - `type` (text with check constraint)
      - `members` (uuid array)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to users)
      - `sender_name` (text)
      - `receiver_id` (uuid, foreign key to users, optional)
      - `receiver_name` (text, optional)
      - `message` (text)
      - `type` (text with check constraint)
      - `channel_id` (uuid, foreign key to chat_channels, optional)
      - `timestamp` (timestamp)
      - `is_read` (boolean, default false)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage chat
*/

CREATE TABLE IF NOT EXISTS chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('public', 'private')),
  members uuid[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) NOT NULL,
  sender_name text NOT NULL,
  receiver_id uuid REFERENCES users(id),
  receiver_name text,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('private', 'group', 'broadcast')),
  channel_id uuid REFERENCES chat_channels(id),
  timestamp timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_channels
CREATE POLICY "Users can read channels they are members of"
  ON chat_channels
  FOR SELECT
  TO authenticated
  USING (
    type = 'public' OR 
    auth.uid() = ANY(members) OR 
    auth.uid() = created_by
  );

CREATE POLICY "Users can create channels"
  ON chat_channels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
    )
  );

CREATE POLICY "Channel creators can update their channels"
  ON chat_channels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for chat_messages
CREATE POLICY "Users can read messages in their channels or directed to them"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    (channel_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM chat_channels c 
      WHERE c.id = channel_id 
      AND (c.type = 'public' OR auth.uid() = ANY(c.members))
    ))
  );

CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
    )
  );

CREATE POLICY "Users can update their own messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by ON chat_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_channels_type ON chat_channels(type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);