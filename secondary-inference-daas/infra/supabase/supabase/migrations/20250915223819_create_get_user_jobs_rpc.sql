-- Create RPC function to get user jobs with related information
CREATE OR REPLACE FUNCTION get_user_jobs(user_id UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    source_id UUID,
    status TEXT,
    job_type TEXT,
    input_path TEXT,
    output_path TEXT,
    config JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    source JSONB,
    project JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.project_id,
        j.source_id,
        j.status,
        j.job_type,
        j.input_path,
        j.output_path,
        j.config,
        j.error_message,
        j.started_at,
        j.completed_at,
        j.created_at,
        j.updated_at,
        jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'kind', s.kind,
            'schema_version', s.schema_version
        ) as source,
        jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'org_id', p.org_id,
            'organization', jsonb_build_object(
                'id', o.id,
                'name', o.name,
                'owner_id', o.owner_id
            )
        ) as project
    FROM ingest.jobs j
    JOIN ingest.sources s ON j.source_id = s.id
    JOIN core.projects p ON j.project_id = p.id
    JOIN core.organizations o ON p.org_id = o.id
    WHERE o.owner_id = user_id
    ORDER BY j.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_jobs(UUID) TO authenticated;
