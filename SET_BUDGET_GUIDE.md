# 💰 How to Set Your Monthly Budget

## Option 1: Through the App (Easiest)

### Step 1: Run the Database Migration First
**IMPORTANT**: You must run the SQL migration first!

1. Go to: https://supabase.com/dashboard/project/qcbbkjhahkieedzyqpcj/sql/new
2. Copy ALL the SQL from: `supabase/migrations/002_complete_schema_setup.sql`
3. Paste and click **Run**
4. Wait for success messages

### Step 2: Set Budget in the App

1. **Refresh your browser** (after running migration)
2. Click **"Profile"** in the sidebar
3. You'll see **Quick Set Budget** buttons:
   - ₹5,000
   - ₹10,000
   - ₹15,000
   - ₹20,000
   - ₹25,000
   - ₹30,000
   - ₹50,000
   - ₹1,00,000
4. Click a preset button OR enter custom amount
5. Click **"Update Budget"**
6. ✅ Success!

---

## Option 2: Set Budget Directly in Database (If App Doesn't Work)

If the Profile page gives you errors, set the budget directly in Supabase:

### Step 1: Go to Supabase SQL Editor
Visit: https://supabase.com/dashboard/project/qcbbkjhahkieedzyqpcj/sql/new

### Step 2: Run This SQL

**Replace `15000` with your desired budget amount:**

```sql
-- Set monthly budget to ₹15,000
UPDATE profiles 
SET monthly_budget = 15000 
WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

Click **Run**.

### Step 3: Verify It Worked

Run this query to check:

```sql
SELECT email, monthly_budget FROM profiles;
```

You should see your email and the budget you set.

### Step 4: Refresh Your App

Go back to your app and refresh the browser. The budget should now show!

---

## Option 3: If Profile Doesn't Exist

If you get an error that the profile doesn't exist, create it first:

### Step 1: Check if Profile Exists

Go to SQL Editor and run:

```sql
SELECT * FROM profiles;
```

### Step 2: If Empty, Create Profile Manually

```sql
-- Create profile for the first user
INSERT INTO profiles (id, email, monthly_budget)
SELECT id, email, 15000
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```

Replace `15000` with your desired budget.

### Step 3: Update Budget Later

You can always update it later:

```sql
-- Change budget to ₹20,000
UPDATE profiles 
SET monthly_budget = 20000 
WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

---

## Quick Budget Presets (Copy & Run)

Here are quick SQL commands for common budgets:

### ₹10,000 Budget
```sql
UPDATE profiles SET monthly_budget = 10000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### ₹15,000 Budget
```sql
UPDATE profiles SET monthly_budget = 15000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### ₹20,000 Budget
```sql
UPDATE profiles SET monthly_budget = 20000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### ₹25,000 Budget
```sql
UPDATE profiles SET monthly_budget = 25000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### ₹30,000 Budget
```sql
UPDATE profiles SET monthly_budget = 30000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### ₹50,000 Budget
```sql
UPDATE profiles SET monthly_budget = 50000 WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

---

## Troubleshooting

### "Table profiles does not exist"
**Solution**: Run the main SQL migration first:
- File: `supabase/migrations/002_complete_schema_setup.sql`
- Copy all and run in SQL Editor

### "Budget won't update in app"
**Solution**: Use Option 2 (direct SQL) above

### "Profile doesn't exist"
**Solution**: Use Option 3 to create profile manually

### "I don't see the preset buttons"
**Solution**: Refresh your browser (Ctrl+Shift+R)

---

## What Happens After Setting Budget?

Once you set your budget:

1. ✅ Dashboard shows your budget amount
2. ✅ Budget percentage calculations work
3. ✅ Alerts trigger when you reach 75% or 90% of budget
4. ✅ Analytics can compare spending vs budget
5. ✅ You'll get warnings before overspending

---

## Recommended Budget Amounts

Based on Indian cities:

- **Tier 3 Cities**: ₹10,000 - ₹15,000
- **Tier 2 Cities**: ₹15,000 - ₹25,000
- **Tier 1 Cities**: ₹25,000 - ₹50,000
- **Metro Cities**: ₹30,000 - ₹1,00,000+

---

## Need Help?

If none of these work:
1. Make sure you ran the main SQL migration
2. Check that you're logged in
3. Try logging out and logging back in
4. Clear browser cache
5. Restart the dev server

---

**Easiest Method**: Use the Profile page with preset buttons after running the migration! 🎯
