-- Enable RLS on ingest.sources table
-- Based on architecture.md specification for multi-tenant isolation

-- Enable RLS on sources table
ALTER TABLE ingest.sources ENABLE ROW LEVEL SECURITY;

-- Policies for sources
-- Users can view sources for projects they have access to
CREATE POLICY "Sources are viewable by project members."
ON ingest.sources FOR SELECT
USING (
    project_id IN (
        SELECT p.id 
        FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE o.owner_id = auth.uid()
    )
);

-- Users can insert sources for projects they have access to
CREATE POLICY "Sources are insertable by project members."
ON ingest.sources FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT p.id 
        FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE o.owner_id = auth.uid()
    )
);

-- Users can update sources for projects they have access to
CREATE POLICY "Sources are updatable by project members."
ON ingest.sources FOR UPDATE
USING (
    project_id IN (
        SELECT p.id 
        FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE o.owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT p.id 
        FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE o.owner_id = auth.uid()
    )
);

-- Users can delete sources for projects they have access to
CREATE POLICY "Sources are deletable by project members."
ON ingest.sources FOR DELETE
USING (
    project_id IN (
        SELECT p.id 
        FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE o.owner_id = auth.uid()
    )
);
