# Secondary Inference DaaS

A privacy-safe Data-as-a-Service that transforms existing vision model outputs into higher-order, time-aware secondary events.

## Repository Structure

```
secondary-inference-daas/
├─ apps/
│  ├─ web/                         # Next.js customer + reviewer dashboard
│  └─ workers/                     # Python services
├─ packages/
│  ├─ schema/                      # Shared TypeScript + Python schemas
│  ├─ ontology/                    # Default ontology examples
│  └─ clients/                     # TS/py client SDKs
├─ infra/
│  ├─ supabase/                    # SQL, RLS, triggers
│  ├─ vercel/                      # Project config
│  ├─ fly/                         # Worker deployment config
│  └─ grafana/                     # Dashboards
├─ datasets/                       # Sample datasets and fixtures
└─ docs/                           # API documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase CLI

### Development Setup

1. **Frontend (Next.js)**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

2. **Workers (Python)**
   ```bash
   cd apps/workers  
   pip install -e ".[dev]"
   ```

3. **Supabase**
   ```bash
   cd infra/supabase
   supabase start
   ```

## Architecture

See [architecture.md](architecture.md) for detailed system design.

## Tasks

See [tasks.md](tasks.md) for development roadmap.

## Model

See [model.md](model.md) for ML model specifications.