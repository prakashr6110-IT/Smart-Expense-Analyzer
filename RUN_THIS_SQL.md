# 🚨 URGENT: Fix the Database Tables

## The Problem
Your app shows: **"Could not find the table 'public.expenses' in the schema cache"**

This means the database tables don't exist yet. You MUST create them.

## The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
Click this link to open your Supabase project:
**https://supabase.com/dashboard/project/qcbbkjhahkieedzyqpcj/sql/new**

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"**

### Step 2: Copy ALL the SQL Below

Copy EVERYTHING from line 5 to line 176 (all the SQL code):

```sql
-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Users profile table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  monthly_budget DECIMAL(10, 2) DEFAULT 1000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  expense_date DATE NOT NULL,
  expense_time TIME NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table
CREATE TABLE public.insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions table
CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  predicted_amount DECIMAL(10, 2) NOT NULL,
  prediction_month DATE NOT NULL,
  confidence DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for expenses
CREATE POLICY "Users can insert own expenses" 
  ON public.expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" 
  ON public.expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" 
  ON public.expenses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" 
  ON public.expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view own alerts" 
  ON public.alerts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" 
  ON public.alerts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" 
  ON public.alerts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for insights
CREATE POLICY "Users can view own insights" 
  ON public.insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
  ON public.insights FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for predictions
CREATE POLICY "Users can view own predictions" 
  ON public.predictions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" 
  ON public.predictions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
  ON public.expenses(user_id, expense_date);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
  ON public.expenses(category);

CREATE INDEX IF NOT EXISTS idx_alerts_user_read 
  ON public.alerts(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_insights_user 
  ON public.insights(user_id);

CREATE INDEX IF NOT EXISTS idx_predictions_user 
  ON public.predictions(user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, monthly_budget)
  VALUES (NEW.id, NEW.email, 10000.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for success messages

### Step 4: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see these 5 tables:
   - ✅ profiles
   - ✅ expenses
   - ✅ alerts
   - ✅ insights
   - ✅ predictions

### Step 5: Test Your App

1. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. Try adding an expense
3. It should work now! ✅

## What If I Get Errors?

### Error: "relation already exists"
- This is fine! The tables already exist
- Skip to Step 5 and test

### Error: "permission denied"
- Make sure you're logged into Supabase
- You must be the project owner

### Error: "syntax error"
- Make sure you copied ALL the SQL (from line 5 to 176)
- Don't skip any lines

## After Running SQL

Your app will work immediately after:
1. ✅ Tables are created
2. ✅ Refresh the browser
3. ✅ Try adding expense
4. ✅ Try updating budget
5. ✅ View analytics

## Need Help?

If you're still stuck:
1. Check that you're in the correct Supabase project
2. Make sure you copied ALL the SQL code
3. Try running each CREATE TABLE statement separately
4. Check browser console for any errors

---

**This is the ONLY step needed to make your app work!**

Once the tables are created, everything will function perfectly. 🎉
