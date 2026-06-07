-- Migration 003: Add Necessary/Luxury expense type split
-- Run this in your Supabase SQL Editor AFTER running 002_complete_schema_setup.sql

-- =============================================
-- 1. Add expense_type column to expenses table
-- =============================================
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'necessary';

-- Backfill existing expenses based on category
UPDATE public.expenses
SET expense_type = CASE
  WHEN category IN ('Rent', 'Groceries', 'Utilities', 'Transportation', 'Healthcare', 'Education', 'Insurance', 'Bills', 'Food', 'Transport', 'Health')
  THEN 'necessary'
  ELSE 'luxury'
END
WHERE expense_type IS NULL;

-- Add index for expense_type queries
CREATE INDEX IF NOT EXISTS idx_expenses_type
  ON public.expenses(user_id, expense_type);

-- =============================================
-- 2. Add split prediction columns to predictions table
-- =============================================
ALTER TABLE public.predictions
ADD COLUMN IF NOT EXISTS predicted_necessary DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS predicted_luxury DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS financial_score DECIMAL(5, 2);

-- =============================================
-- Done! You can now use the necessary/luxury split features.
-- =============================================
