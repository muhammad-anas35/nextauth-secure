-- ============================================
-- ADMIN SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON public.profiles(is_admin);

-- Step 3: Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 4: Create policy allowing admins to view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  -- User can see their own profile OR
  auth.uid() = id 
  OR
  -- User is an admin (can see all profiles)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Step 5: Create policy allowing admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- SET YOUR ADMIN USER
-- Replace 'your@email.com' with your actual email
-- ============================================
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';

-- Verify the migration
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_admin';
