# Secondary Inference DaaS — Architecture

**Goal**  
Offer a privacy-safe Data-as-a-Service that transforms existing vision model outputs — detections, tracks, poses, captions — into higher-order, time-aware **secondary events**: movements, actions, interactions, decisions, and reactions. Deliver these as versioned datasets, APIs, and analytics to customers.

---

## Stack at a Glance
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Recharts.
- **Auth + DB + Storage**: Supabase (Auth, Postgres, Row-Level Security, Storage buckets).
- **APIs**: Next.js Route Handlers for customer-facing APIs. Internal compute via FastAPI workers.
- **Workers**: Python 3.11, FastAPI, Pydantic, PyTorch/Lightning, Polars, PyArrow, OpenCV, FFmpeg.
- **Queues / Orchestration**: Supabase Realtime channels for simple job pub-sub; Cron via Supabase Scheduled Functions.
- **Object Store**: Supabase Storage for small/medium assets, optional S3 for large clips.
- **Observability**: OpenTelemetry traces, Prometheus metrics, Loki logs (or Supabase logs), Grafana.
- **Billing & Metering**: Usage tables in Postgres, Stripe for subscriptions and credits.
- **Infra**: Vercel for the Next.js app; Workers on Fly.io or Railway; CDN via Vercel Edge for downloads.

---

## Domain Model
### Core entities
- **Organization**: top-level tenant for a customer.
- **Project**: dataset or job namespace under an Organization.
- **Source**: reference to input artifacts already inferred elsewhere (tracks, poses, boxes, etc.).
- **Job**: an execution unit that runs the secondary pipeline on a chunked time window.
- **Event**: verified secondary event with type, time span, actors, context.
- **Dataset**: materialized bundle with schema version and splits; immutable once published.
- **API Key**: scoped to an Organization and Project with usage limits.
- **Invoice**: Stripe record mirrored for Postgres.

### Ontology
Versioned `ontology.yaml` that defines event types, start/end rules, evidences, and metrics. Stored per Project.

---

## High-Level Data Flow
1. **Ingest & Normalize**  
   - Customer uploads primary inference outputs to a Source: tracks.parquet, poses.jsonl, frame index, optional zones map.
   - Validation & schema normalization write to `ingest.*` tables and storage.

2. **Feature Derivation**  
   - Workers compute kinematics, inter-object relations, zone relations, change points. Persist to `features.*` Parquet.

3. **Candidate Generation**  
   - Rule engine proposes candidate events with scores and provenance. Write to `candidates` table and Parquet.

4. **Scoring & Human Verification**  
   - Lightweight temporal models rescore candidates. Reviewers use web UI to accept, adjust, or reject. Confirmed samples become `events`.

5. **Dataset Assembly**  
   - Exporter compiles splits (train/val/test), writes data card, schema manifest, and version tag. Stores in `datasets/{version}/...`.

6. **Delivery**  
   - Customers pull via signed URLs, stream via Dataset API, or query analytics API for aggregates and timelines.

7. **Billing & Metering**  
   - Every GB processed, minute of video, or event produced increments usage. Stripe webhooks reconcile invoices.

---

## Repos & File/Folder Structure

```
secondary-inference-daas/
├─ apps/
│  ├─ web/                         # Next.js customer + reviewer dashboard
│  │  ├─ app/
│  │  │  ├─ (marketing)/           # Landing, pricing, docs
│  │  │  ├─ (console)/
│  │  │  │  ├─ dashboard/          # Org/Project overview, usage, invoices
│  │  │  │  ├─ sources/            # Source create + schema validation
│  │  │  │  ├─ jobs/               # Create/run jobs, status, logs
│  │  │  │  ├─ review/             # Candidate review and event editing
│  │  │  │  ├─ datasets/           # Version list, download links, data cards
│  │  │  │  ├─ api-keys/           # Key management
│  │  │  │  └─ analytics/          # Charts for events, reaction latency, etc.
│  │  ├─ components/
│  │  ├─ lib/                      # Supabase client, fetchers, hooks
│  │  ├─ server/                   # Route handlers for public Dataset/API
│  │  ├─ styles/
│  │  └─ package.json
│  └─ workers/                     # Python services
│     ├─ inference/                # Torch models for temporal event scoring
│     ├─ rules/                    # Rule definitions from ontology
│     ├─ pipelines/                # Orchestrates steps: ingest → features → candidates → score → export
│     ├─ io/                       # Parquet/JSONL/S3/Supabase Storage utils
│     ├─ serving/                  # FastAPI app with internal endpoints
│     ├─ cli/                      # Command-line tools for local runs
│     ├─ tests/
│     └─ pyproject.toml
│
├─ packages/
│  ├─ schema/                      # Shared TypeScript + Python schema definitions via JSONSchema
│  ├─ ontology/                    # Default ontology examples and validators
│  └─ clients/                     # TS/py client SDKs for Dataset and Analytics APIs
│
├─ infra/
│  ├─ supabase/                    # SQL, RLS, triggers, scheduled functions
│  ├─ vercel/                      # Project config
│  ├─ fly/                         # Worker deployment config
│  └─ grafana/                     # Dashboards
│
├─ datasets/                       # Sample public datasets and fixtures (small)
├─ docs/                           # Markdown docs for API, dataset formats, data cards
└─ README.md
```

---

## Database: Supabase Postgres Schema

### Tables (namespaced by feature)

**auth**  
- Managed by Supabase (users, sessions).

**core**
- `organizations(id, name, owner_id, created_at)`
- `projects(id, org_id, name, status, created_at)`
- `api_keys(id, project_id, key_hash, scope, created_at, revoked_at)`

**ingest**
- `sources(id, project_id, kind, uri, bytes, schema_version, created_at)`
- `jobs(id, project_id, source_id, status, progress, stats_json, error_text, created_at, updated_at)`

**features**
- `feature_manifests(id, job_id, path, type, rows, bytes, created_at)`

**candidates**
- `candidates(id, job_id, type, start_t, end_t, actors_json, objects_json, rule_name, rule_score, model_score, created_at)`

**events**
- `events(id, job_id, type, start_t, end_t, actors_json, objects_json, confidence, source, created_at, verified_by)`

**datasets**
- `dataset_versions(id, project_id, semver, manifest_path, rows, bytes, created_at, published_by)`

**billing**
- `usage_counters(id, project_id, metric, value, window_start, window_end)`
- `invoices(id, org_id, stripe_id, amount_cents, status, created_at)`

Row-Level Security restricts rows by `org_id` or `project_id`. API keys map to a specific project scope.

---

## Where State Lives
- **Cold assets** (Parquet, JSONL, clips): Supabase Storage or S3 under `org/{org_id}/project/{project_id}/...`.
- **Hot metadata** (job status, candidates, events, versions): Postgres tables.
- **Ontology & schemas**: Small JSON/YAML stored in Postgres and mirrored to Storage.
- **Auth state**: Supabase Auth.
- **Usage/metering**: Postgres `billing.usage_counters` incremented by workers and API gateway.

---

## Services and Connections
- **Next.js (apps/web)** ↔ Supabase (Auth, DB, Storage) via client libraries.
- **Next.js Route Handlers** expose:
  - `/api/datasets/:version/manifest` for dataset discovery.
  - `/api/events/query` for analytics.
  - `/api/ingest/upload` signed upload URLs.
- **Workers (FastAPI)** consume jobs from Postgres and Supabase Realtime channels:
  - `/internal/jobs/:id/run` starts processing.
  - Access Storage to read primary inference outputs.
  - Write derived features, candidates, events, and update job status.
- **Stripe** ↔ Webhooks to `/api/billing/stripe` to sync invoices and entitlements.

---

## Pipeline Modules (Python Workers)

1) **Normalizer**  
   - Input: customer-provided tracks/poses/boxes.  
   - Output: canonical Parquet with strict schema, FPS, timecodes, zone maps.

2) **Kinematics & Relations**  
   - Compute speed, accel, jerk, curvature, heading.
   - Pairwise distances, bearing, approach speed, occlusion score, gaze alignment.

3) **Change-Point Detection**  
   - Velocity and pose entropy breakpoints for reaction timing.

4) **Rule Engine**  
   - Create candidates with `rule_name` and `rule_score` driven by ontology thresholds.

5) **Temporal Scoring Model**  
   - Small Transformer/TCN to refine candidate scores and prune false positives.

6) **Human-in-the-Loop Review**  
   - Web UI to adjust boundaries, actors, acceptance.  
   - Writes final `events` rows.

7) **Exporter**  
   - Build versioned dataset folder: splits, data card, schema manifest, checksums.

8) **Quality Gates**  
   - Great Expectations suite on schemas and constraints.  
   - Class balance and drift reports.

---

## Public APIs

### Dataset Delivery API
- `GET /api/datasets` — list versions.
- `GET /api/datasets/:semver/manifest` — JSON manifest with file paths and checksums.
- `GET /api/datasets/:semver/download?split=train` — signed URL to a split archive.
- `GET /api/datasets/:semver/datacard` — machine-readable data card.

### Analytics API
- `POST /api/events/query` — filter by event types, time ranges, confidence, actors.
- `GET /api/projects/:id/metrics` — aggregates like reaction latency histograms, dwell times, follow rates.

### Ingest API
- `POST /api/ingest/signed-url` — obtain Storage URL scoped to a Source.
- `POST /api/jobs` — create a processing job.
- `GET /api/jobs/:id` — poll job status.

All endpoints authenticated via Supabase Auth tokens or API keys with scope checks.

---

## Privacy & Compliance
- Faces, plates, and voices must be anonymized before or during ingestion.
- Store only clips around events if raw video is provided.
- Configurable retention and auto-deletion policies per Project.
- Data cards document intended use, known biases, and privacy steps.

---

## Scalability Notes
- **Parallelization**: chunk video into fixed windows, process in parallel workers.
- **Backpressure**: cap concurrent jobs per Project based on plan limits.
- **Caching**: reuse derived features for multiple ontologies.
- **Multi-tenant isolation**: Storage prefixes by org/project, RLS in Postgres.

---

## Local Dev
- Supabase CLI for local Postgres and Storage.
- `make run-workers` starts FastAPI with a local queue loop.
- Seed fixtures in `datasets/fixtures` to run the full flow end-to-end.

---

## Security
- RLS policies on all tenant tables.
- API keys hashed with bcrypt, never stored in plaintext.
- All downloads via expiring signed URLs.
- Auditing on `events` edits and dataset publishes.
