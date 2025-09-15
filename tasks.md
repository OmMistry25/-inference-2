# Secondary Inference DaaS — MVP Task Plan

Each task is tiny, testable, and focused on one concern. Suggested order is top to bottom.

## 0. Repo and Environment
1. **Init monorepo**
   - Start: create `secondary-inference-daas` folder
   - End: `apps/web` Next.js app scaffolded, `apps/workers` Python project created

2. **Supabase project**
   - Start: Supabase CLI login
   - End: local Supabase started and `.env.local` populated with keys

3. **Infra skeleton**
   - Start: create `infra/supabase` and `infra/fly`
   - End: empty config files committed

## 1. Schema & Auth
4. **Create core tables**
   - Start: write SQL for `core.organizations`, `core.projects`, `core.api_keys`
   - End: migrations applied locally; tables visible

5. **Enable RLS**
   - Start: write RLS policies per table
   - End: tests confirm cross-tenant isolation

6. **Seed org + project**
   - Start: SQL seed script
   - End: one org and project exist

## 2. Web App Skeleton
7. **Auth wiring**
   - Start: add Supabase Auth helpers
   - End: sign in/out flows working

8. **Console shell**
   - Start: create app layout in `(console)`
   - End: navbar with Org/Project switcher

9. **Sources page (list)**
   - Start: simple table reading `ingest.sources`
   - End: displays seeded empty list

10. **New Source form**
    - Start: form with `kind`, `name`, `schema_version`
    - End: inserts row; toast on success

## 3. Storage & Signed Upload
11. **Create bucket per org**
    - Start: server route to ensure bucket exists
    - End: bucket created if missing

12. **Signed upload URL**
    - Start: API route `/api/ingest/signed-url`
    - End: returns scoped signed URL

13. **Upload client hook**
    - Start: React hook to PUT files
    - End: file appears in Storage

## 4. Jobs
14. **Jobs table**
    - Start: SQL for `ingest.jobs`
    - End: migration applied

15. **Create job endpoint**
    - Start: POST `/api/jobs`
    - End: row inserted with `queued` status

16. **Realtime channel**
    - Start: open channel `jobs:{project_id}`
    - End: UI receives job status updates

## 5. Workers — Normalizer
17. **Worker boot**
    - Start: FastAPI skeleton with `/health`
    - End: returns 200 OK

18. **Storage client**
    - Start: utility to read from Supabase Storage
    - End: can stream a file by path

19. **Schema validator**
    - Start: JSONSchema for tracks and poses
    - End: invalid payload rejected with message

20. **Parquet writer**
    - Start: Polars write to Parquet
    - End: output file appears in `features/` prefix

21. **Job loop**
    - Start: poll DB for `queued` jobs
    - End: marks `running`, `completed`

## 6. Feature Derivation
22. **Kinematics**
    - Start: function to compute speed, accel, jerk, curvature
    - End: columns appended to Parquet

23. **Relations**
    - Start: pairwise distance and bearing per window
    - End: relations Parquet written

24. **Change points**
    - Start: velocity CUSUM detector
    - End: events of sudden change emitted to log

## 7. Rule Engine & Candidates
25. **Ontology loader**
    - Start: read YAML and validate
    - End: parsed into in-memory thresholds

26. **Movement rules**
    - Start: implement `enter`, `exit`, `dwell`
    - End: `candidates` rows created

27. **Interaction rules**
    - Start: implement `follow`, `overtake`, `handover` (proximity proxy)
    - End: more candidates created

28. **Decision proxies**
    - Start: implement `choose_route` with route polylines
    - End: candidates appear when branching

29. **Reaction rules**
    - Start: trigger-aligned change point search
    - End: `reaction.startle` candidates emitted

## 8. Temporal Scoring Model
30. **Window builder**
    - Start: slice tensors `[T, F]` around candidates
    - End: .npy written per candidate

31. **Tiny Transformer**
    - Start: 2-layer encoder with positional encoding
    - End: train on synthetic fixtures

32. **Rescoring**
    - Start: assign `model_score`
    - End: persisted to `candidates`

## 9. Review UI
33. **Candidate table**
    - Start: list with filters by type and score
    - End: paginated grid

34. **Clip player**
    - Start: HLS player that loads signed clip URLs
    - End: plays pre/post window

35. **Span editor**
    - Start: draggable start/end handles
    - End: updates local state only

36. **Accept/Reject actions**
    - Start: write to `events` with adjusted span
    - End: row created with `source='human'`

## 10. Exporter
37. **Manifest schema**
    - Start: JSON manifest structure
    - End: validator written

38. **Split builder**
    - Start: scene/time split logic
    - End: train/val/test folders created

39. **Data card**
    - Start: templated Markdown with metrics
    - End: file saved in dataset folder

40. **Signer**
    - Start: server route that returns signed URLs
    - End: download button works

## 11. Billing & Metering
41. **Usage counters**
    - Start: increment on job complete (bytes, minutes)
    - End: row appears in `billing.usage_counters`

42. **Stripe webhook**
    - Start: test-mode endpoint
    - End: invoice status mirrored

## 12. Quality Gates
43. **Expectations suite**
    - Start: Great Expectations on tracks and events
    - End: failing dataset blocks publish

44. **Class balance report**
    - Start: compute histogram per split
    - End: chart visible in Analytics page

45. **Drift check**
    - Start: compare new vs previous version
    - End: diff report shown

## 13. Security
46. **RLS tests**
    - Start: unit tests for row access
    - End: cross-project read denied

47. **Key hashing**
    - Start: bcrypt on API keys
    - End: stored only as hash

48. **Signed downloads**
    - Start: expiring URLs with path scoping
    - End: unauthorized access fails

## 14. Docs & Samples
49. **API docs**
    - Start: write OpenAPI for dataset and analytics APIs
    - End: published to `/docs`

50. **Sample dataset**
    - Start: small fixture in `datasets/fixtures`
    - End: end-to-end pipeline passes with sample

