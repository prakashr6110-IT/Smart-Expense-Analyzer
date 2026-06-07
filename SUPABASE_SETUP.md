# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Smart Expense Behavior Analyzer.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Sign up using GitHub, email, or other available methods

## Step 2: Create a New Project

1. After logging in, click "New Project"
2. Fill in the project details:
   - **Name**: Smart Expense Analyzer (or any name you prefer)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to you
3. Click "Create new project"
4. Wait 1-2 minutes for the database to be provisioned

## Step 3: Run the Database Migration

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click "New query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click "Run" or press `Ctrl+Enter`
7. You should see a success message

### What This Creates:

- **profiles table**: Stores user profiles and monthly budgets
- **expenses table**: Stores all expense records
- **alerts table**: Stores generated warnings and notifications
- **insights table**: Stores behavioral analysis results
- **predictions table**: Stores monthly expense predictions
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Indexes**: Optimizes query performance
- **Trigger**: Automatically creates a profile when a new user signs up

## Step 4: Get Your API Credentials

1. In your Supabase dashboard, click on **Project Settings** (gear icon in the sidebar)
2. Click on **API** under "Configuration"
3. You'll see two important values:
   - **Project URL**: Your Supabase project endpoint
   - **anon/public key**: The public API key (safe to use in frontend)

### Example:
```
Project URL: https://abcdefghijk.supabase.co
anon/public key: 
```

## Step 5: Configure Environment Variables

1. In your project root, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor

3. Replace the placeholder values with your actual credentials:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=
   ```

4. Save the file

## Step 6: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (usually `http://localhost:5173`)

3. Try to create a new account:
   - Click "Sign up"
   - Enter an email and password (min 6 characters)
   - Click "Sign Up"

4. If successful, you'll be redirected to the dashboard

5. Check your Supabase dashboard:
   - Go to **Authentication** > **Users** - you should see your new user
   - Go to **Table Editor** > **profiles** - you should see your profile
   - The `monthly_budget` should be set to 1000.00 by default

## Step 7: Test the Application

### Add Your First Expense

1. Click "Add Expense" in the sidebar
2. Fill in the form:
   - Amount: 50.00
   - Category: Food
   - Date: Today's date
   - Time: Current time
   - Description: Lunch at restaurant
3. Click "Add Expense"
4. You should see a success message

### Verify Data in Supabase

1. Go to **Table Editor** in Supabase
2. Click on **expenses** table
3. You should see your newly added expense

### Check Dashboard

1. Go back to the app
2. Click "Dashboard"
3. You should see:
   - Total Expenses: $50.00
   - Monthly Budget: $1,000.00
   - Top Category: Food
   - Your expense in Recent Transactions

## Troubleshooting

### "Invalid API key" Error

- Double-check that you copied the **anon/public** key (not the service role key)
- Ensure there are no extra spaces in your `.env` file
- Restart the development server after updating `.env`

### "relation does not exist" Error

- The SQL migration script didn't run successfully
- Go back to Step 3 and run the migration again
- Check the SQL Editor for any error messages

### Can't Create Account

- Check browser console for errors
- Verify your Supabase project is active (not paused)
- In Supabase Dashboard > Authentication > Settings, ensure "Enable email confirmations" is turned off for development

### Data Not Showing

- Check browser console for errors
- Verify RLS policies are set up correctly
- In Supabase Dashboard > Table Editor, check if data exists
- Try refreshing the page

## Security Notes

### For Development
- Using the anon/public key in the frontend is safe
- RLS policies protect your data
- Email confirmations can be disabled for easier testing

### For Production
- Enable email confirmations
- Set up custom email templates
- Consider enabling additional auth providers (Google, GitHub, etc.)
- Never expose the service role key
- Set up proper CORS policies
- Enable audit logging

## Supabase Free Tier Limits

The free tier includes:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth
- Community support

This is more than enough for personal use and testing.

## Next Steps

Once your Supabase is set up:
1. Add more expenses to see analytics
2. Check the Analytics page for charts
3. Review insights and alerts
4. Update your budget in Profile settings
5. Explore all features!

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

---

Need help? Check the main README.md or the Supabase documentation.
