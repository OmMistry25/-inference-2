-- Create ingest schema and sources table for Secondary Inference DaaS
-- Based on architecture.md specification

-- Create ingest schema
CREATE SCHEMA IF NOT EXISTS ingest;

-- Sources table
-- Reference to input artifacts already inferred elsewhere (tracks, poses, boxes, etc.)
CREATE TABLE ingest.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES core.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('tracks', 'poses', 'detections', 'captions')),
    schema_version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'error')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_sources_project_id ON ingest.sources(project_id);
CREATE INDEX idx_sources_kind ON ingest.sources(kind);
CREATE INDEX idx_sources_status ON ingest.sources(status);
CREATE INDEX idx_sources_created_at ON ingest.sources(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at 
    BEFORE UPDATE ON ingest.sources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
