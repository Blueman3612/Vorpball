-- Add trigger for automatic cascade deletion of thread replies
--
-- Problem: When a thread parent message is deleted, replies from other users remain in database
-- Solution: Create a database trigger to automatically delete all replies when a parent message is deleted

-- Create function to handle cascading deletes for thread replies
CREATE OR REPLACE FUNCTION handle_thread_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- When a message that is the parent of a thread gets deleted,
    -- delete all replies regardless of who posted them
    DELETE FROM channel_messages
    WHERE reply_to = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically call the function when a message is deleted
DROP TRIGGER IF EXISTS trigger_thread_delete ON channel_messages;
CREATE TRIGGER trigger_thread_delete
BEFORE DELETE ON channel_messages
FOR EACH ROW
EXECUTE FUNCTION handle_thread_delete(); 