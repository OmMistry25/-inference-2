# Fly.io Deployment Configuration

This directory contains the deployment configuration for the Secondary Inference Workers on Fly.io.

## Files

- `fly.toml` - Main Fly.io configuration
- `Dockerfile` - Container configuration for Python workers
- `README.md` - This file

## Deployment

### Prerequisites

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login to Fly.io: `fly auth login`
3. Set up secrets for Supabase connection

### Setup Secrets

```bash
# Set Supabase configuration
fly secrets set SUPABASE_URL="your_supabase_url"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
fly secrets set DATABASE_URL="your_database_url"
```

### Deploy

```bash
# From the project root
fly deploy --config infra/fly/fly.toml
```

### Scaling

```bash
# Scale to multiple machines
fly scale count 3

# Scale CPU/memory
fly scale vm shared-cpu-2x --memory 8192
```

## Configuration

- **App Name**: `secondary-inference-workers`
- **Region**: San Jose, California (sjc)
- **CPU**: 2 shared CPUs
- **Memory**: 4GB
- **GPU**: A10 (for ML workloads)
- **Port**: 8000

## Health Checks

- HTTP health check on `/health`
- Interval: 30 seconds
- Timeout: 5 seconds

## Monitoring

- Metrics endpoint: `/metrics` on port 9090
- Prometheus-compatible metrics
