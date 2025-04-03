# Message Deletion Fixes - Migration Instructions

These migration files fix two issues with message deletion:

1. Admins can delete messages in the UI, but those deletions reappear after page refresh
2. When a thread parent message is deleted, only replies from the deleting user are removed

## How to Apply These Migrations

### Using the Supabase Dashboard (Recommended)

1. Login to your Supabase dashboard at https://app.supabase.com/
2. Select your project (`tzlaxvggnulilxrhqfel`)
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `20231205_fix_message_deletion_rls.sql` into the editor
6. Run the query
7. Create another new query
8. Copy and paste the contents of `20231205_add_thread_delete_cascade.sql` into the editor
9. Run the query

### Alternative: Using the Supabase CLI (if properly configured)

```bash
supabase db push
```

## What These Files Do

### 20231205_fix_message_deletion_rls.sql

Updates the Row Level Security (RLS) policies to:
- Allow users to delete their own messages (unchanged)
- Allow admin users to delete any message in channels they have access to (new)

### 20231205_add_thread_delete_cascade.sql

Creates a database trigger that:
- Automatically deletes all replies to a message when that message is deleted
- Uses `SECURITY DEFINER` to bypass RLS checks for this operation

## Testing After Migration

After applying these migrations:

1. Log in as an admin user
2. Delete a message posted by another user
3. Refresh the page - the message should remain deleted
4. Create a thread and have multiple users post replies
5. Delete the parent message - all replies should be deleted regardless of who posted them 