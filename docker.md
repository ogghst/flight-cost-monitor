# Docker Setup Documentation

This document describes the Docker setup for the Flight Cost Monitor (FCM) application.

## Project Structure

The project uses a monorepo structure with the following services:
- `fcm-webui`: Next.js frontend application (port 3000)
- `fcm-api`: NestJS backend API (port 3001)

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Node.js v20 or higher
- pnpm 9.15.5 or higher

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Settings
DATABASE_URL=file:/app/apps/fcm-api/prisma/dev.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

# Amadeus API Configuration (Required)
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret

# Web UI Settings
API_URL=http://fcm-api:3001
API_TIMEOUT=60000

# Auth Settings (Optional - defaults provided)
AUTH_SECRET=your-secret-key-min-32-chars-long
NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
```

### Default Configuration

The following environment variables have default values:

**FCM Web UI:**
- PORT: 3000
- NODE_ENV: production
- AUTH_GITHUB_ID: Ov23li0AghVx0GGNzgo7
- AUTH_GITHUB_SECRET: 6a101af4f6eb6a6199b850fe23689b8049c48acb

**FCM API:**
- PORT: 3001
- NODE_ENV: production
- JWT_ACCESS_EXPIRATION: 15m
- JWT_REFRESH_EXPIRATION: 7d
- AMADEUS_FLIGHT_OFFER_API_URL: https://test.api.amadeus.com/v2/shopping/flight-offers
- AMADEUS_AUTH_URL: https://test.api.amadeus.com/v1/security/oauth2/token
- AMADEUS_TIMEOUT: 60000

## Build Process

### Using Turbo (Recommended)

From the root directory:

```bash
# Build all services
pnpm docker:build

# Build specific service
pnpm --filter @fcm/webui docker:build
pnpm --filter @fcm/api docker:build
```

### Manual Build

Individual services can be built manually:

```bash
# Build Web UI
docker build -t fcm-webui -f apps/fcm-webui/Dockerfile .

# Build API
docker build -t fcm-api -f apps/fcm-api/Dockerfile .
```

## Running the Application

### Using Docker Compose (Recommended)

Start all services:
```bash
docker-compose up -d
```

Stop all services:
```bash
docker-compose down
```

With custom environment variables:
```bash
AMADEUS_CLIENT_ID=your_id AMADEUS_CLIENT_SECRET=your_secret docker-compose up -d
```

### Running Individual Services

Web UI:
```bash
docker run -p 3000:3000 \
  -e AMADEUS_CLIENT_ID=your_id \
  -e AMADEUS_CLIENT_SECRET=your_secret \
  fcm-webui
```

API:
```bash
docker run -p 3001:3001 \
  -e AMADEUS_CLIENT_ID=your_id \
  -e AMADEUS_CLIENT_SECRET=your_secret \
  fcm-api
```

## Volumes

The Docker setup includes two persistent volumes:

- `api-logs`: Stores API logs at `/app/apps/fcm-api/logs`
- `api-data`: Stores database files at `/app/apps/fcm-api/prisma`

## Health Checks

Both services include health checks:

- Web UI: Checks `http://localhost:3000`
- API: Checks `http://localhost:3001/health`

Health check configuration:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

## Development Workflow

1. Make changes to the code
2. Build the services: `pnpm docker:build`
3. Start the services: `pnpm docker:up`
4. Check logs: `docker-compose logs -f`
5. Stop services: `pnpm docker:down`

## Troubleshooting

### Common Issues

1. Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Stop conflicting process
taskkill /PID <process_id> /F
```

2. Volume Permissions
```bash
# Reset volumes
docker-compose down -v
docker-compose up -d
```

3. Network Issues
```bash
# Check network
docker network ls
docker network inspect flight-cost-monitor_default
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f fcm-webui
docker-compose logs -f fcm-api
```

## Security Notes

- The GitHub OAuth credentials are hard-coded in the docker-compose.yml file
- JWT_SECRET should be changed in production
- API_URL defaults to internal Docker network address
- Environment variables can be overridden via command line or .env file

## CI/CD Integration

The Docker configuration is CI/CD ready with:

- Multi-stage builds for smaller image sizes
- Health checks for container orchestration
- Environment variable configuration
- Volume management for persistent data