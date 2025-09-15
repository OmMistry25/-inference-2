# Secondary Inference Workers

Python services for processing primary inference outputs into secondary events.

## Setup

```bash
pip install -e .
```

## Development

```bash
pip install -e ".[dev]"
```

## Services

- `inference/` - Torch models for temporal event scoring
- `rules/` - Rule definitions from ontology  
- `pipelines/` - Orchestrates steps: ingest → features → candidates → score → export
- `io/` - Parquet/JSONL/S3/Supabase Storage utils
- `serving/` - FastAPI app with internal endpoints
- `cli/` - Command-line tools for local runs
