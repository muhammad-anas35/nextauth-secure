-- ============================================
-- FIX: Recursion Error in Admin Policy
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create a secure function to check admin status 
-- This function runs with "SECURITY DEFINER" to bypass RLS and avoid infinite loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public -- Secure search path
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Step 2: Drop the old, buggy policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Step 3: Create new, safe policies using the helper function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR
  public.is_admin()
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR
  public.is_admin()
);

-- ============================================
-- REMINDER: Set yourself as admin if needed
-- ============================================
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
