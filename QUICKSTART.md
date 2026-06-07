# Quick Start Guide - Smart Expense Behavior Analyzer

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. **Create Supabase Account**
   - Visit: https://supabase.com
   - Sign up (free)

2. **Create New Project**
   - Click "New Project"
   - Name it "Smart Expense"
   - Choose a database password (save it!)
   - Select your region
   - Click "Create new project"
   - Wait ~1-2 minutes

3. **Run Database Setup**
   - Go to **SQL Editor** (left sidebar)
   - Click "New query"
   - Open file: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)
   - ✅ Success!

4. **Get Your API Keys**
   - Go to **Project Settings** (gear icon)
   - Click **API**
   - Copy these two values:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon/public key**: `eyJhbGc...` (long string)

### Step 2: Configure the App (1 minute)

1. **Create .env file**
   ```bash
   # In the project folder, create a file named .env
   ```

2. **Add your Supabase credentials**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Replace the values with your actual keys from Step 1.

### Step 3: Start the App (30 seconds)

The development server is already running! 

Just click the preview button in your tool panel to open the app.

Or visit: **http://localhost:5173**

### Step 4: Create Your Account (30 seconds)

1. Click **"Sign up"** on the login page
2. Enter your email and password (min 6 characters)
3. Click **"Sign Up"**
4. You'll be redirected to the dashboard! 🎉

### Step 5: Add Your First Expense (1 minute)

1. Click **"Add Expense"** in the sidebar
2. Fill in the form:
   - **Amount**: 25.50
   - **Category**: Food
   - **Date**: Today
   - **Time**: Current time
   - **Description**: Lunch at cafe
3. Click **"Add Expense"**
4. ✅ Success! You'll see a confirmation message

## 🎯 What to Do Next

### Explore the Dashboard
- **View your stats**: Total expenses, budget, top category
- **See recent transactions**: Your latest expenses listed
- **Check alerts**: Any warnings about spending patterns

### Add More Expenses
Add at least 5-10 expenses across different:
- Categories (Food, Transport, Entertainment, etc.)
- Days of the week
- Times of day

This will give you better analytics and insights!

### Check Analytics
1. Click **"Analytics"** in the sidebar
2. Toggle between **Weekly**, **Monthly**, **Yearly**
3. View your:
   - 🥧 **Pie Chart**: Spending by category
   - 📊 **Bar Chart**: Category comparison
   - 📈 **Line Chart**: Spending trends
   - 💡 **Insights**: Smart observations about your habits

### Set Your Budget
1. Go to **"Profile"** page
2. Update your **Monthly Budget** (e.g., $1000)
3. This enables budget tracking and alerts!

### Monitor Alerts
- Check the **Alerts** page regularly
- Dashboard shows your top 3 unread alerts
- Alerts include:
  - ⚠️ Budget warnings (75%, 90% spent)
  - 🌙 Time-based warnings ("You usually spend at 9 PM")
  - 📅 Weekend overspending detection
  - 📊 Category spending spikes

## 📱 Features Overview

### ✅ What Works Right Now

- **User Authentication**: Secure login/signup
- **Expense Tracking**: Add, view, delete expenses
- **Dashboard**: Real-time stats and overview
- **Analytics**: Interactive charts with filters
- **Behavior Analysis**: 
  - Time pattern detection
  - Weekend spending analysis
  - Top category identification
- **Smart Alerts**: 
  - Budget threshold warnings
  - Time-based spending alerts
  - Weekend overspending detection
  - Category spike alerts
- **Predictions**: Next month expense forecast
- **Profile Management**: Update budget settings
- **Responsive Design**: Works on mobile, tablet, desktop

## 🎨 UI Features

- **Dark Sidebar**: Professional navigation
- **Light Dashboard**: Clean, modern cards
- **Color-Coded Categories**: Easy visual identification
- **Interactive Charts**: Hover for details
- **Toast Notifications**: Success/error messages
- **Badge Counters**: Unread alerts shown in sidebar

## 💡 Tips for Best Results

1. **Add expenses daily** - Track every purchase for accurate insights
2. **Use categories consistently** - Helps with accurate analysis
3. **Set realistic budget** - Based on your actual spending
4. **Check analytics weekly** - Identify patterns early
5. **Respond to alerts** - Adjust spending when warned
6. **Add time of expense** - Enables time-based insights

## 📊 Sample Data to Add

To see all features in action, add these sample expenses:

| Amount | Category | Date | Time | Description |
|--------|----------|------|------|-------------|
| 15.00 | Food | Today | 08:30 | Breakfast |
| 50.00 | Transport | Today | 09:00 | Gas |
| 25.00 | Food | Today | 12:30 | Lunch |
| 100.00 | Shopping | Yesterday | 15:00 | Clothes |
| 30.00 | Entertainment | Yesterday | 20:00 | Movie |
| 200.00 | Bills | 2 days ago | 10:00 | Electricity |
| 45.00 | Food | Weekend | 19:00 | Dinner |
| 80.00 | Health | Weekend | 11:00 | Gym membership |

Add at least 10-15 expenses to see meaningful predictions and insights!

## 🔧 Troubleshooting

### App won't load?
- Check that the dev server is running: `npm run dev`
- Open browser console (F12) for errors

### "Missing Supabase variables" error?
- Make sure `.env` file exists in project root
- Verify both variables are set correctly
- Restart the dev server after creating `.env`

### Can't create account?
- Check browser console for errors
- Verify SQL migration ran successfully
- Check Supabase project is active (not paused)

### No data showing?
- Add some expenses first
- Check browser console for errors
- Verify Supabase credentials are correct

## 📚 Need More Help?

- **Full Documentation**: See `README.md`
- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Supabase Docs**: https://supabase.com/docs

## 🎉 You're All Set!

Start tracking your expenses and discover your spending patterns. The app will:
- ✅ Track all your expenses
- ✅ Analyze your behavior
- ✅ Predict future spending
- ✅ Warn you before overspending

**Track • Analyze • Predict • Stay in control!**

---

Happy expense tracking! 💰📊
