-- Policies for ingest.jobs table

-- Allow authenticated users to view jobs belonging to their projects
CREATE POLICY "Authenticated users can view their jobs."
ON ingest.jobs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE p.id = project_id AND o.owner_id = auth.uid()
    )
);

-- Allow authenticated users to insert jobs into their projects
CREATE POLICY "Authenticated users can insert jobs into their projects."
ON ingest.jobs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE p.id = project_id AND o.owner_id = auth.uid()
    )
);

-- Allow authenticated users to update jobs in their projects
CREATE POLICY "Authenticated users can update their jobs."
ON ingest.jobs FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE p.id = project_id AND o.owner_id = auth.uid()
    )
);

-- Allow authenticated users to delete jobs from their projects
CREATE POLICY "Authenticated users can delete their jobs."
ON ingest.jobs FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM core.projects p
        JOIN core.organizations o ON p.org_id = o.id
        WHERE p.id = project_id AND o.owner_id = auth.uid()
    )
);
