-- Create RPC function to get user projects with organization info
CREATE OR REPLACE FUNCTION get_user_projects(user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    org_id UUID,
    organization JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.org_id,
        jsonb_build_object(
            'id', o.id,
            'name', o.name,
            'owner_id', o.owner_id
        ) as organization
    FROM core.projects p
    JOIN core.organizations o ON p.org_id = o.id
    WHERE o.owner_id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;
