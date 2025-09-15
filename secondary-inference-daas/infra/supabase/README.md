# Supabase Local Development Setup

This directory contains the Supabase configuration for local development.

## Prerequisites

1. **Docker Desktop** - Required for local Supabase development
   - Download and install from: https://docs.docker.com/desktop/
   - Start Docker Desktop before running Supabase commands

## Setup Instructions

1. **Start Docker Desktop**
   ```bash
   # Make sure Docker Desktop is running
   docker --version
   ```

2. **Start Local Supabase**
   ```bash
   cd infra/supabase
   supabase start
   ```

3. **Copy Environment Variables**
   - The `supabase start` command will output connection details
   - Copy the generated keys to `apps/web/.env.local`
   - Replace the placeholder values with the actual generated keys

4. **Access Local Supabase**
   - Studio: http://localhost:54323
   - API: http://localhost:54321
   - Database: localhost:54322

## Configuration Files

- `config.toml` - Main Supabase configuration
- `.vscode/settings.json` - VS Code settings for Deno

## Next Steps

After starting Supabase locally:
1. Create the database schema (Task #4)
2. Set up Row-Level Security policies (Task #5)
3. Seed initial data (Task #6)
