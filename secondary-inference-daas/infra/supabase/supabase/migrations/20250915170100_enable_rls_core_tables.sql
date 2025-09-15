-- Enable Row-Level Security (RLS) for core tables
-- Ensures proper cross-tenant isolation

-- Enable RLS on all core tables
ALTER TABLE core.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================================================

-- Users can only see organizations they own
CREATE POLICY "Users can view their own organizations" ON core.organizations
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can only insert organizations they own
CREATE POLICY "Users can create organizations they own" ON core.organizations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can only update organizations they own
CREATE POLICY "Users can update their own organizations" ON core.organizations
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can only delete organizations they own
CREATE POLICY "Users can delete their own organizations" ON core.organizations
    FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can only see projects from organizations they own
CREATE POLICY "Users can view projects from their organizations" ON core.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM core.organizations 
            WHERE id = org_id AND owner_id = auth.uid()
        )
    );

-- Users can only insert projects into organizations they own
CREATE POLICY "Users can create projects in their organizations" ON core.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM core.organizations 
            WHERE id = org_id AND owner_id = auth.uid()
        )
    );

-- Users can only update projects from organizations they own
CREATE POLICY "Users can update projects in their organizations" ON core.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM core.organizations 
            WHERE id = org_id AND owner_id = auth.uid()
        )
    );

-- Users can only delete projects from organizations they own
CREATE POLICY "Users can delete projects in their organizations" ON core.projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM core.organizations 
            WHERE id = org_id AND owner_id = auth.uid()
        )
    );

-- ============================================================================
-- API KEYS TABLE POLICIES
-- ============================================================================

-- Users can only see API keys from projects in organizations they own
CREATE POLICY "Users can view API keys from their projects" ON core.api_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM core.projects p
            JOIN core.organizations o ON p.org_id = o.id
            WHERE p.id = project_id AND o.owner_id = auth.uid()
        )
    );

-- Users can only insert API keys into projects they own
CREATE POLICY "Users can create API keys in their projects" ON core.api_keys
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM core.projects p
            JOIN core.organizations o ON p.org_id = o.id
            WHERE p.id = project_id AND o.owner_id = auth.uid()
        )
    );

-- Users can only update API keys from projects they own
CREATE POLICY "Users can update API keys in their projects" ON core.api_keys
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM core.projects p
            JOIN core.organizations o ON p.org_id = o.id
            WHERE p.id = project_id AND o.owner_id = auth.uid()
        )
    );

-- Users can only delete API keys from projects they own
CREATE POLICY "Users can delete API keys in their projects" ON core.api_keys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM core.projects p
            JOIN core.organizations o ON p.org_id = o.id
            WHERE p.id = project_id AND o.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- SERVICE ROLE POLICIES (for server-side operations)
-- ============================================================================

-- Service role can perform all operations (for API server)
CREATE POLICY "Service role can manage all organizations" ON core.organizations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all projects" ON core.projects
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all API keys" ON core.api_keys
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- API KEY AUTHENTICATION POLICIES
-- ============================================================================

-- Function to validate API key and get project context
CREATE OR REPLACE FUNCTION core.validate_api_key(api_key TEXT)
RETURNS TABLE(project_id UUID, org_id UUID, scope TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ak.project_id,
        p.org_id,
        ak.scope
    FROM core.api_keys ak
    JOIN core.projects p ON ak.project_id = p.id
    WHERE ak.key_hash = crypt(api_key, ak.key_hash)
    AND ak.revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if API key has required scope
CREATE OR REPLACE FUNCTION core.check_api_scope(required_scope TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_scope TEXT;
BEGIN
    -- Get current API key scope from JWT claims
    current_scope := COALESCE(current_setting('request.jwt.claims', true)::json->>'scope', '');
    
    -- Check scope hierarchy: admin > write > read
    RETURN CASE required_scope
        WHEN 'read' THEN current_scope IN ('read', 'write', 'admin')
        WHEN 'write' THEN current_scope IN ('write', 'admin')
        WHEN 'admin' THEN current_scope = 'admin'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can view their own organizations" ON core.organizations IS 
'Ensures users can only access organizations they own';

COMMENT ON POLICY "Users can view projects from their organizations" ON core.projects IS 
'Ensures users can only access projects from organizations they own';

COMMENT ON POLICY "Users can view API keys from their projects" ON core.api_keys IS 
'Ensures users can only access API keys from projects in organizations they own';

COMMENT ON FUNCTION core.validate_api_key(TEXT) IS 
'Validates API key and returns project context for server-side operations';

COMMENT ON FUNCTION core.check_api_scope(TEXT) IS 
'Checks if current API key has required permission scope';
