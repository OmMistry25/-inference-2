-- Create jobs table for processing pipeline
CREATE TABLE ingest.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES core.projects(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES ingest.sources(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
    job_type TEXT NOT NULL, -- 'normalize', 'extract_features', 'score_events', etc.
    input_path TEXT, -- path to input file in storage
    output_path TEXT, -- path to output file in storage
    config JSONB DEFAULT '{}'::jsonb, -- job-specific configuration
    error_message TEXT, -- error details if status is 'failed'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_status CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    CONSTRAINT chk_job_type CHECK (job_type IN ('normalize', 'extract_features', 'score_events', 'generate_dataset'))
);

-- Index for faster lookups by project and status
CREATE INDEX idx_jobs_project_id ON ingest.jobs (project_id);
CREATE INDEX idx_jobs_status ON ingest.jobs (status);
CREATE INDEX idx_jobs_source_id ON ingest.jobs (source_id);

-- Enable Row Level Security (RLS)
ALTER TABLE ingest.jobs ENABLE ROW LEVEL SECURITY;
