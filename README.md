# Flight Cost Monitor (FCM)

A modern flight search and cost monitoring application built with Next.js and NestJS. FCM provides real-time flight information and cost tracking using the Amadeus API, wrapped in a user-friendly interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Turbo](https://img.shields.io/badge/Built%20with-Turbo-blue)](https://turbo.build/)
[![Powered by Next.js](https://img.shields.io/badge/Powered%20by-Next.js%2015-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/Built%20with-NestJS%2010-red)](https://nestjs.com/)

## Features

### Flight Search
- Simple and advanced search options
- Multi-city routing support
- Real-time pricing updates
- Flexible date options
- Customizable search filters

### Search Management
- Save and name frequent searches
- Search history tracking
- Favorite searches feature
- Easy search reload

### User Features
- GitHub and Google OAuth authentication
- Personalized search history
- User preferences
- Customizable alerts

### User Interface
- Modern Material UI design
- Responsive layout
- Real-time notifications
- Comprehensive error handling

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9.15.5
- Docker and Docker Compose (for containerized deployment)
- Amadeus API credentials
- GitHub OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/flight-cost-monitor.git
cd flight-cost-monitor
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Create environment files
cp apps/fcm-api/.env.example apps/fcm-api/.env
cp apps/fcm-webui/.env.example apps/fcm-webui/.env
```

4. Start development servers
```bash
# Start all services
pnpm dev

# Or start individual services
pnpm --filter @fcm/api dev
pnpm --filter @fcm/webui dev
```

### Docker Deployment

1. Build images
```bash
pnpm docker:build
```

2. Start services
```bash
pnpm docker:up
```

## Project Structure

```
flight-cost-monitor/
├── apps/
│   ├── fcm-api/         # NestJS backend service
│   └── fcm-webui/       # Next.js frontend application
├── packages/
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── fcm-shared/      # Shared business logic and types
│   ├── fcm-shared-webui/# Shared UI components
│   ├── jest-config/     # Shared Jest configuration
│   └── typescript-config/# Shared TypeScript configuration
└── docs/               # Project documentation
```

## Tech Stack

### Frontend (@fcm/webui)
- Next.js 15
- React 19
- Material UI 6
- TypeScript
- React Query for data fetching
- Next Auth for authentication

### Backend (@fcm/api)
- NestJS 10
- TypeScript
- Prisma ORM
- JWT authentication
- Swagger/OpenAPI documentation

### Shared Infrastructure
- Monorepo using Turbo
- pnpm for package management
- Docker containerization
- ESLint with flat config
- Jest for testing

## Documentation

- [Authentication System](docs/authentication.md) - OAuth and JWT authentication setup
- [Docker Deployment Guide](docs/docker-deployment.md) - Complete guide for Docker setup and deployment

## Available Scripts

### Root Directory
- \`pnpm dev\` - Start development servers
- \`pnpm build\` - Build all packages and applications
- \`pnpm test\` - Run unit tests
- \`pnpm test:e2e\` - Run end-to-end tests
- \`pnpm lint\` - Lint all packages
- \`pnpm format\` - Format code using Prettier

### Docker Commands
- \`pnpm docker:build\` - Build Docker images
- \`pnpm docker:up\` - Start Docker containers
- \`pnpm docker:down\` - Stop Docker containers

### Package-Specific Commands
```bash
# Run commands for specific packages
pnpm --filter @fcm/api dev
pnpm --filter @fcm/webui build
```

## Development

### IDE Setup
FCM is optimized for Visual Studio Code with the following extensions:
- ESLint
- Prettier
- Docker
- TypeScript and JavaScript Language Features

### Adding Dependencies
```bash
# Add to root
pnpm add -w package-name

# Add to specific package
pnpm --filter package-name add dependency-name
```

### Environment Setup
Configure the following environment variables:

#### Web UI (.env.local)
```env
AUTH_GITHUB_ID=your_github_id
AUTH_GITHUB_SECRET=your_github_secret
AUTH_SECRET=your_secret_key
```

#### API (.env)
```env
JWT_SECRET=your_jwt_secret
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
```

## API Documentation

Access the API documentation at:
- Development: http://localhost:3001/api/docs
- Production: https://your-domain.com/api/docs

## Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @fcm/api test
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e
```

### Coverage Reports
Coverage reports are generated in the \`coverage\` directory of each package.

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

### Style Guide
- Use TypeScript for all code
- Follow ESLint configuration
- Use Prettier for formatting
- Follow conventional commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or join our Slack channel.

## Acknowledgments

- Amadeus API for flight data
- Next.js team for the amazing framework
- NestJS team for the robust backend framework
- All contributors who have helped shape FCM