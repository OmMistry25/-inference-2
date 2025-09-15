# Vercel Deployment Configuration

This directory contains the deployment configuration for the Secondary Inference DaaS Next.js application on Vercel.

## Files

- `vercel.json` - Main Vercel configuration
- `README.md` - This file

## Deployment

### Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link project: `vercel link`

### Environment Variables

Set the following environment variables in Vercel dashboard or via CLI:

```bash
# Supabase configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL

# Storage configuration
vercel env add SUPABASE_STORAGE_BUCKET
```

### Deploy

```bash
# From the project root
vercel --prod
```

### Development

```bash
# Deploy preview
vercel

# Local development with Vercel
vercel dev
```

## Configuration

- **Framework**: Next.js 14
- **Build Command**: `cd apps/web && npm run build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `cd apps/web && npm install`
- **Region**: US East (iad1)
- **Function Timeout**: 30 seconds for API routes

## Features

- Automatic deployments from Git
- Preview deployments for PRs
- Edge functions for global performance
- Built-in analytics and monitoring
- Custom domains support

## API Routes

API routes are configured with:
- Maximum duration: 30 seconds
- Automatic scaling
- Edge runtime support

## Monitoring

- Built-in Vercel Analytics
- Function logs and metrics
- Performance monitoring
- Error tracking
