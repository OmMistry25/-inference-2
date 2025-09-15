-- Test script to verify RLS policies are working correctly
-- Run this in Supabase Studio SQL Editor to test cross-tenant isolation

-- ============================================================================
-- TEST 1: Verify RLS is enabled
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'core'
ORDER BY tablename;

-- ============================================================================
-- TEST 2: Check existing policies
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'core'
ORDER BY tablename, policyname;

-- ============================================================================
-- TEST 3: Test data access (should show current user's data only)
-- ============================================================================

-- This should only return organizations owned by the current user
SELECT 'Organizations accessible to current user:' as test;
SELECT id, name, owner_id FROM core.organizations;

-- This should only return projects from organizations owned by current user
SELECT 'Projects accessible to current user:' as test;
SELECT p.id, p.name, p.org_id, o.name as org_name 
FROM core.projects p
JOIN core.organizations o ON p.org_id = o.id;

-- This should only return API keys from projects owned by current user
SELECT 'API keys accessible to current user:' as test;
SELECT ak.id, ak.name, ak.scope, p.name as project_name, o.name as org_name
FROM core.api_keys ak
JOIN core.projects p ON ak.project_id = p.id
JOIN core.organizations o ON p.org_id = o.id;

-- ============================================================================
-- TEST 4: Verify functions exist
-- ============================================================================

SELECT 'RLS helper functions:' as test;
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'core'
AND routine_name IN ('validate_api_key', 'check_api_scope');

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- 1. All core tables should have rls_enabled = true
-- 2. Multiple policies should exist for each table (SELECT, INSERT, UPDATE, DELETE)
-- 3. Data queries should only return records owned by the current user
-- 4. Helper functions should exist for API key validation
-- ============================================================================
