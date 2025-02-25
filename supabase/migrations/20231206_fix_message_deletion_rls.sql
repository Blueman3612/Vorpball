-- Fix for message deletion Row Level Security (RLS) issues
-- 
-- Problem 1: Admin users can delete messages in UI but deletions don't persist in database
-- Problem 2: When a thread parent message is deleted, only replies from the deleting user are removed

-- Drop existing policies (to ensure clean state)
DROP POLICY IF EXISTS "Users can delete their own messages" ON channel_messages;
DROP POLICY IF EXISTS "Users can delete their own messages or admins can delete any me" ON channel_messages;
DROP POLICY IF EXISTS "Admin message delete policy" ON channel_messages;

-- Create new policy with shorter name
CREATE POLICY "Admin message delete policy"
ON channel_messages FOR DELETE
USING (
  -- User can delete own message
  user_id = auth.uid()
  OR
  -- OR admin can delete any message in channels they have access to
  EXISTS (
    SELECT 1 FROM league_channels lc
    JOIN league_members lm ON lc.league_id = lm.league_id
    WHERE lc.id = channel_id
    AND lm.user_id = auth.uid()
    AND lm.role = 'admin'
    AND lm.is_active = true
  )
); 