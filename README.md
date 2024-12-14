# Flight Cost Monitor

A monorepo project for monitoring and analyzing flight costs using the Amadeus API. Built with TypeScript, NestJS, and React.

## Project Structure

```
flight-cost-monitor/
├── apps/
│   ├── fcm-api/         # Backend API service
│   └── fcm-webui/       # Frontend web application
├── packages/
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── fcm-shared/      # Shared business logic and types
│   ├── fcm-shared-webui/# Shared UI components
│   ├── jest-config/     # Shared Jest configuration
│   └── typescript-config/# Shared TypeScript configuration
```

## Prerequisites

- Node.js >= 18
- pnpm 8.15.5 or higher
- Amadeus API credentials

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flight-cost-monitor.git
   cd flight-cost-monitor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env files in both apps/fcm-api and apps/fcm-webui
   cp apps/fcm-api/.env.example apps/fcm-api/.env
   cp apps/fcm-webui/.env.example apps/fcm-webui/.env
   ```

4. **Start development servers**
   ```bash
   # Start all services
   pnpm dev

   # Or start individual services
   pnpm --filter fcm-api dev
   pnpm --filter fcm-webui dev
   ```

## Development

### Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and applications
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code using Prettier
- `pnpm clean` - Clean build artifacts
- `pnpm clean:all` - Deep clean including node_modules

### Debugging

VSCode launch configurations are provided for debugging:

1. Set breakpoints in your code
2. Press F5 or use the Run and Debug panel
3. Select the appropriate debug configuration

### Package Management

This project uses pnpm workspaces. To add dependencies:

```bash
# Add to root
pnpm add -w package-name

# Add to specific package/app
pnpm --filter package-name add dependency-name
```

## Architecture

### Backend (fcm-api)

- Built with NestJS
- Integrates with Amadeus API for flight data
- RESTful API design
- TypeScript for type safety

### Frontend (fcm-webui)

- React application
- TypeScript
- Shared UI components
- Integration with backend API

### Shared Packages

- **fcm-shared**: Common business logic, API clients, and types
- **fcm-shared-webui**: Reusable UI components
- **Configuration packages**: Shared development tool configurations

## API Documentation

API documentation is available at:
- Development: http://localhost:3000/api/docs
- Production: https://your-domain.com/api/docs

## Testing

- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Coverage reports are generated in the `coverage` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
