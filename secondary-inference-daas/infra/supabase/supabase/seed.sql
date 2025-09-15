-- Seed data for Secondary Inference DaaS core tables
-- This file is automatically run after migrations

-- Insert a test organization
INSERT INTO core.organizations (id, name, owner_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test Organization', auth.uid())
ON CONFLICT (id) DO NOTHING;

-- Insert a test project
INSERT INTO core.projects (id, org_id, name, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Test Project', 'active')
ON CONFLICT (id) DO NOTHING;

-- Note: API keys are not seeded as they require proper hashing
-- They will be created through the application API
