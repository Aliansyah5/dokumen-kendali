# Supabase Database Setup Instructions

## Prerequisites

1. You must have a Supabase account at https://supabase.com
2. The environment variables in `.env.local` are already configured

## Database Setup

### Step 1: Create the Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL script from `database/setup.sql`
4. Click "Run" to execute the script

This will create:

- `timeline_schedules` table for calendar schedules
- `document_links` table for URL attachments
- Proper indexes for performance
- Row Level Security policies
- Auto-updating timestamps

### Step 2: Verify Tables

After running the script, check the Table Editor to verify that both tables exist:

- `timeline_schedules`
- `document_links`

### Step 3: Test the Connection

The application includes a connection test component that will show:

- 🔄 Testing Supabase connection... (while connecting)
- ✅ Supabase connected successfully (on success)
- ❌ Supabase connection failed (on error)

## Features Integrated

### URL Links (Document Attachments)

- When you add/edit links in the document table, they are now saved to Supabase
- Links are stored in the `document_links` table
- Each package can have different links for each document

### Calendar Schedules (Timeline)

- When you add calendar schedules in the timeline, they are saved to Supabase
- Schedules are stored in the `timeline_schedules` table
- Each package + sub-document combination has independent timelines
- Proper timezone handling to prevent date discrepancies

## Environment Variables

The following are already configured in `.env.local`:

```
REACT_APP_SUPABASE_URL=https://yvclagadpefpbwwxlvgq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Data Migration

If you had previous data in localStorage, it will not be automatically migrated. The new system starts fresh with Supabase storage.

## Security

The database is configured with Row Level Security (RLS) enabled. Current policies allow all operations, but you can restrict access later if needed.

## Troubleshooting

### Connection Issues

1. Verify your Supabase project is active
2. Check that the environment variables are correct
3. Ensure the database tables were created successfully
4. Check the browser console for detailed error messages

### Performance

The database includes optimized indexes for:

- Package and sub-document filtering
- Date-based queries
- Fast lookups by document ID

## Development Notes

- The service automatically converts between camelCase (frontend) and snake_case (database)
- All database operations include proper error handling
- Connection status is displayed in the UI for debugging
