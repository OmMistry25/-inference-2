-- Create core tables for Secondary Inference DaaS
-- Based on architecture.md specification

-- Create core schema
CREATE SCHEMA IF NOT EXISTS core;

-- Organizations table
-- Top-level tenant for a customer
CREATE TABLE core.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects table
-- Dataset or job namespace under an Organization
CREATE TABLE core.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure unique project names per organization
    UNIQUE(org_id, name)
);

-- API Keys table
-- Scoped to an Organization and Project with usage limits
CREATE TABLE core.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES core.projects(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- bcrypt hashed API key
    name TEXT NOT NULL, -- Human-readable name for the key
    scope TEXT NOT NULL DEFAULT 'read' CHECK (scope IN ('read', 'write', 'admin')),
    usage_limit_gb INTEGER DEFAULT NULL, -- Monthly usage limit in GB
    usage_limit_requests INTEGER DEFAULT NULL, -- Monthly request limit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Ensure unique key names per project
    UNIQUE(project_id, name)
);

-- Create indexes for performance
CREATE INDEX idx_organizations_owner_id ON core.organizations(owner_id);
CREATE INDEX idx_projects_org_id ON core.projects(org_id);
CREATE INDEX idx_projects_status ON core.projects(status);
CREATE INDEX idx_api_keys_project_id ON core.api_keys(project_id);
CREATE INDEX idx_api_keys_key_hash ON core.api_keys(key_hash);
CREATE INDEX idx_api_keys_revoked_at ON core.api_keys(revoked_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON core.organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON core.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON SCHEMA core IS 'Core business entities for Secondary Inference DaaS';
COMMENT ON TABLE core.organizations IS 'Top-level tenant for a customer';
COMMENT ON TABLE core.projects IS 'Dataset or job namespace under an Organization';
COMMENT ON TABLE core.api_keys IS 'Scoped to an Organization and Project with usage limits';

COMMENT ON COLUMN core.organizations.owner_id IS 'Reference to auth.users - the organization owner';
COMMENT ON COLUMN core.projects.org_id IS 'Parent organization for this project';
COMMENT ON COLUMN core.projects.status IS 'Project status: active, paused, or archived';
COMMENT ON COLUMN core.api_keys.key_hash IS 'bcrypt hashed API key - never store plaintext';
COMMENT ON COLUMN core.api_keys.scope IS 'API key permissions: read, write, or admin';
COMMENT ON COLUMN core.api_keys.usage_limit_gb IS 'Monthly data processing limit in GB';
COMMENT ON COLUMN core.api_keys.usage_limit_requests IS 'Monthly API request limit';
