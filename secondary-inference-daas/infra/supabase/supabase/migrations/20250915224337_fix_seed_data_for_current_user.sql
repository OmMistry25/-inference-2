-- Fix seed data to work with any authenticated user
-- This migration ensures that when a user signs up, they get access to demo data

-- Create a function to ensure demo data exists for the current user
CREATE OR REPLACE FUNCTION ensure_demo_data_for_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_org_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    demo_project_1_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    demo_project_2_id UUID := '550e8400-e29b-41d4-a716-446655440002';
    demo_project_3_id UUID := '550e8400-e29b-41d4-a716-446655440003';
BEGIN
    -- Create demo organization for the user if it doesn't exist
    INSERT INTO core.organizations (id, name, owner_id) 
    VALUES (demo_org_id, 'Demo Organization', user_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = user_id;

    -- Create demo projects
    INSERT INTO core.projects (id, org_id, name, status) VALUES 
    (demo_project_1_id, demo_org_id, 'Retail Analytics', 'active'),
    (demo_project_2_id, demo_org_id, 'Traffic Monitoring', 'active'),
    (demo_project_3_id, demo_org_id, 'Security Events', 'paused')
    ON CONFLICT (id) DO NOTHING;

    -- Create demo sources
    INSERT INTO ingest.sources (id, project_id, name, kind, schema_version, status, metadata) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', demo_project_1_id, 'Store Camera 1 - Tracks', 'tracks', '1.0', 'active', '{"camera_id": "cam_001", "location": "entrance"}'),
    ('550e8400-e29b-41d4-a716-446655440011', demo_project_1_id, 'Store Camera 2 - Poses', 'poses', '1.0', 'active', '{"camera_id": "cam_002", "location": "aisle_1"}'),
    ('550e8400-e29b-41d4-a716-446655440012', demo_project_2_id, 'Traffic Cam - Detections', 'detections', '1.0', 'active', '{"camera_id": "traffic_001", "intersection": "main_st"}'),
    ('550e8400-e29b-41d4-a716-446655440013', demo_project_3_id, 'Security Cam - Captions', 'captions', '1.0', 'active', '{"camera_id": "security_001", "zone": "parking_lot"}')
    ON CONFLICT (id) DO NOTHING;

    -- Create demo jobs
    INSERT INTO ingest.jobs (id, project_id, source_id, status, job_type, input_path, output_path, config, started_at, completed_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440020', demo_project_1_id, '550e8400-e29b-41d4-a716-446655440010', 'completed', 'normalize', 'uploads/tracks_001.json', 'features/normalized/tracks_001.parquet', '{"window_size": 30}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440021', demo_project_1_id, '550e8400-e29b-41d4-a716-446655440011', 'running', 'extract_features', 'uploads/poses_001.json', 'features/kinematics/poses_001.parquet', '{"compute_curvature": true}', NOW() - INTERVAL '30 minutes', NULL),
    ('550e8400-e29b-41d4-a716-446655440022', demo_project_2_id, '550e8400-e29b-41d4-a716-446655440012', 'queued', 'normalize', 'uploads/detections_001.json', 'features/normalized/detections_001.parquet', '{"window_size": 60}', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440023', demo_project_3_id, '550e8400-e29b-41d4-a716-446655440013', 'failed', 'score_events', 'features/normalized/captions_001.parquet', 'events/scored/captions_001.parquet', '{"model_version": "v1.2"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes')
    ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_demo_data_for_user(UUID) TO authenticated;
