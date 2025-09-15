# Grafana Monitoring Stack

This directory contains the monitoring configuration for the Secondary Inference DaaS platform using Grafana, Prometheus, and Loki.

## Services

- **Grafana**: Web-based monitoring and visualization (port 3001)
- **Prometheus**: Metrics collection and storage (port 9090)
- **Loki**: Log aggregation (port 3100)
- **Promtail**: Log shipping agent

## Quick Start

```bash
# Start the monitoring stack
docker-compose up -d

# Access Grafana
open http://localhost:3001
# Username: admin, Password: admin
```

## Configuration Files

- `docker-compose.yml` - Main orchestration file
- `prometheus.yml` - Prometheus scrape configuration
- `loki-config.yml` - Loki log aggregation config
- `promtail-config.yml` - Log shipping configuration
- `grafana/provisioning/` - Grafana datasources and dashboards

## Monitoring Targets

- **Next.js App**: `host.docker.internal:3000/api/metrics`
- **Python Workers**: `host.docker.internal:8000/metrics`
- **Supabase**: `host.docker.internal:54321/metrics`
- **System Metrics**: Node exporter and cAdvisor

## Dashboards

Pre-configured dashboards for:
- Application performance metrics
- Infrastructure monitoring
- Log analysis
- Error tracking
- Business metrics (jobs, events, usage)

## Data Retention

- **Prometheus**: 200 hours (8+ days)
- **Loki**: 30 days
- **Grafana**: Persistent storage

## Security

- Default admin credentials: admin/admin
- Change default password in production
- Configure authentication providers
- Enable HTTPS in production

## Production Deployment

For production deployment:
1. Update credentials and secrets
2. Configure persistent volumes
3. Set up backup strategies
4. Enable authentication
5. Configure alerting rules
