-- Seed data for Secondary Inference DaaS core tables
-- This file is automatically run after migrations

-- Create a demo organization for development/testing
INSERT INTO core.organizations (id, name, owner_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization', auth.uid())
ON CONFLICT (id) DO NOTHING;

-- Create demo projects under the organization
INSERT INTO core.projects (id, org_id, name, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Retail Analytics', 'active'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Traffic Monitoring', 'active'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Security Events', 'paused')
ON CONFLICT (id) DO NOTHING;

-- Create demo sources for testing
INSERT INTO ingest.sources (id, project_id, name, kind, schema_version, status, metadata) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Store Camera 1 - Tracks', 'tracks', '1.0', 'active', '{"camera_id": "cam_001", "location": "entrance"}'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Store Camera 2 - Poses', 'poses', '1.0', 'active', '{"camera_id": "cam_002", "location": "aisle_1"}'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Traffic Cam - Detections', 'detections', '1.0', 'active', '{"camera_id": "traffic_001", "intersection": "main_st"}'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Security Cam - Captions', 'captions', '1.0', 'active', '{"camera_id": "security_001", "zone": "parking_lot"}')
ON CONFLICT (id) DO NOTHING;

-- Note: API keys are not seeded as they require proper bcrypt hashing
-- They will be created through the application API with secure key generation
