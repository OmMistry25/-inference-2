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

-- Note: API keys are not seeded as they require proper bcrypt hashing
-- They will be created through the application API with secure key generation
