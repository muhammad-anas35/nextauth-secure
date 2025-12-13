-- ============================================
-- ADVANCED FEATURES MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. STORAGE SETUP (Avatars)
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public can view avatars
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Users can upload their own avatars
DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
CREATE POLICY "Avatar Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatars
DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
CREATE POLICY "Avatar Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. AUDIT LOGS (Security)
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Audit Logs (Admins only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING ( public.is_admin() );

-- Helper function to log actions
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, target_id, details)
  VALUES (auth.uid(), p_action, p_target_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================
-- 3. ADMIN USER DELETION
-- ============================================

-- Secure function to delete user (requires admin)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
BEGIN
  -- 1. Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- 2. Log the deletion before it happens
  PERFORM public.log_activity(
    'USER_DELETE',
    user_id,
    jsonb_build_object('reason', 'Admin initiated deletion')
  );

  -- 3. Delete the user from Auth (cascades to profiles)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- ============================================
-- VERIFICATION SELECT
-- ============================================
SELECT 
  (SELECT count(*) FROM storage.buckets WHERE id = 'avatars') as buckets_count,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'audit_logs') as tables_count;
