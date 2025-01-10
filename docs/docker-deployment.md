# Docker Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)

## Overview

Flight Cost Monitor consists of two main services:

- `fcm-webui`: Next.js frontend application (port 3000)
- `fcm-api`: NestJS backend API (port 3001)

## Prerequisites

- Docker >= 20.10.0
- Docker Compose >= 2.0.0
- pnpm >= 9.15.5 (for local development)
- Node.js >= 20.0.0 (for local development)

## Project Structure

```
flight-cost-monitor/
├── apps/
│ ├── fcm-api/
│ │ ├── Dockerfile
│ │ └── .dockerignore
│ └── fcm-webui/
│ ├── Dockerfile
│ └── .dockerignore
├── docker-compose.yml
├── docker-compose.override.yml
└── .env.example
```

## Environment Configuration

### Using Docker Compose

1. Create a `docker-compose.override.yml`:

```yaml
version: "3.8"

services:
  fcm-webui:
    environment:
      # Required
      - AUTH_GITHUB_ID=your-github-id
      - AUTH_GITHUB_SECRET=your-github-secret
      - AUTH_SECRET=your-secret-key-min-32-chars-long
      # Optional with defaults
      - API_URL=http://fcm-api:3001
      - API_TIMEOUT=60000
      - NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id

  fcm-api:
    environment:
      # Required
      - JWT_SECRET=your-jwt-secret-key-here
      - DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db
      - AMADEUS_CLIENT_ID=your_amadeus_id
      - AMADEUS_CLIENT_SECRET=your_amadeus_secret
      # Optional with defaults
      - PORT=3001
      - CORS_ORIGIN=http://localhost:3000
      - JWT_ACCESS_EXPIRATION=15m
      - JWT_REFRESH_EXPIRATION=7d
      - LOG_LEVEL=info
```

## Environment Variables Configuration

### Using Docker Compose (Recommended)

Create a `docker-compose.override.yml` for local settings:

```yaml
version: "3.8"

services:
  fcm-webui:
    environment:
      # Required
      - AUTH_GITHUB_ID=your-github-id
      - AUTH_GITHUB_SECRET=your-github-secret
      - AUTH_SECRET=your-secret-key-min-32-chars-long
      # Optional with defaults
      - API_URL=http://fcm-api:3001
      - API_TIMEOUT=60000
      - NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id

  fcm-api:
    environment:
      # Required
      - JWT_SECRET=your-jwt-secret-key-here
      - DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db
      - AMADEUS_CLIENT_ID=your_amadeus_id
      - AMADEUS_CLIENT_SECRET=your_amadeus_secret
      # Optional with defaults
      - PORT=3001
      - CORS_ORIGIN=http://localhost:3000
      - JWT_ACCESS_EXPIRATION=15m
      - JWT_REFRESH_EXPIRATION=7d
      - LOG_LEVEL=info
```

### Using Individual Docker Commands

#### FCM Web UI

```bash
# Minimal configuration
docker run -p 3000:3000 \
  -e AUTH_GITHUB_ID=your-github-id \
  -e AUTH_GITHUB_SECRET=your-github-secret \
  -e AUTH_SECRET=your-secret-key \
  fcm-webui

# Full configuration
docker run -p 3000:3000 \
  -e AUTH_GITHUB_ID=your-github-id \
  -e AUTH_GITHUB_SECRET=your-github-secret \
  -e AUTH_SECRET=your-secret-key \
  -e API_URL=http://fcm-api:3001 \
  -e API_TIMEOUT=60000 \
  -e NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id \
  fcm-webui
```

#### FCM API

```bash
# Minimal configuration
docker run -p 3001:3001 \
  -e JWT_SECRET=your-jwt-secret \
  -e DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db \
  -e AMADEUS_CLIENT_ID=your_amadeus_id \
  -e AMADEUS_CLIENT_SECRET=your_amadeus_secret \
  fcm-api

# Full configuration
docker run -p 3001:3001 \
  -e JWT_SECRET=your-jwt-secret \
  -e DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db \
  -e AMADEUS_CLIENT_ID=your_amadeus_id \
  -e AMADEUS_CLIENT_SECRET=your_amadeus_secret \
  -e PORT=3001 \
  -e CORS_ORIGIN=http://localhost:3000 \
  -e JWT_ACCESS_EXPIRATION=15m \
  -e JWT_REFRESH_EXPIRATION=7d \
  -e LOG_LEVEL=info \
  fcm-api
```

### Using Environment Files

#### Method 1: Using .env File with Docker Compose

1. Create a `.env` file in the project root:

```env
# Web UI Settings
AUTH_SECRET=your-secret-key
NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
API_URL=http://fcm-api:3001
API_TIMEOUT=60000

# API Settings
JWT_SECRET=your-jwt-secret
DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

2. Run Docker Compose:

```bash
docker-compose up -d
```

#### Method 2: Using Environment Files per Service

1. Create `fcm-webui.env`:

```env
AUTH_GITHUB_ID=your-github-id
AUTH_GITHUB_SECRET=your-github-secret
AUTH_SECRET=your-secret-key
API_URL=http://fcm-api:3001
API_TIMEOUT=60000
NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
```

2. Create `fcm-api.env`:

```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
LOG_LEVEL=info
```

3. Use with Docker Compose:

```yaml
version: "3.8"

services:
  fcm-webui:
    env_file: fcm-webui.env

  fcm-api:
    env_file: fcm-api.env
```

4. Or with Docker commands:

```bash
# Web UI
docker run --env-file fcm-webui.env -p 3000:3000 fcm-webui

# API
docker run --env-file fcm-api.env -p 3001:3001 fcm-api
```

### Environment Variable Precedence

The order of precedence (highest to lowest):

1. Command-line environment variables
2. Environment file variables
3. Docker Compose environment variables
4. Default values in Dockerfile
5. Application defaults

### Production Considerations

1. Never commit environment files
2. Use secrets management in production
3. Rotate sensitive values regularly
4. Use different values for each environment
5. Monitor environment variable usage

[Rest of the document remains the same...]
