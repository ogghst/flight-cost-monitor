# Implementing Authentication in FCM API

## Overview
This guide shows how to implement authentication in FCM API endpoints.

## Basic Authentication Guard

```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('Token validation failed', { error });
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
```

## Role-Based Access Control

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectLogger() private readonly logger: Logger
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRole) {
      this.logger.warn('Access denied - insufficient roles', {
        required: requiredRoles,
        userRoles: user.roles
      });
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

## Using Guards in Controllers

```typescript
// flight-offers.controller.ts
@Controller('flight-offers')
@UseGuards(AuthGuard)
export class FlightOffersController {
  constructor(
    private readonly flightOffersService: FlightOffersService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  @Get()
  @Roles(['USER', 'ADMIN'])
  @UseGuards(RolesGuard)
  async getFlightOffers(@CurrentUser() user: User) {
    this.logger.info('Fetching flight offers', { userId: user.id });
    return this.flightOffersService.getFlightOffers();
  }

  @Post()
  @Roles(['ADMIN'])
  @UseGuards(RolesGuard)
  async createFlightOffer(
    @CurrentUser() user: User,
    @Body() data: CreateFlightOfferDto
  ) {
    this.logger.info('Creating flight offer', { 
      userId: user.id,
      data
    });
    return this.flightOffersService.createFlightOffer(data);
  }
}
```

## Current User Decorator

```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Auth Module Setup

```typescript
// auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: config.get('JWT_EXPIRATION') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
```

## Error Handling

```typescript
// auth.filter.ts
@Catch(UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  catch(exception: UnauthorizedException | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof UnauthorizedException ? 401 : 403;

    this.logger.warn('Authentication error', {
      path: request.url,
      error: exception.message,
      status
    });

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

## Environment Configuration

```env
# .env
JWT_SECRET=your-secure-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

## Testing Authentication

```typescript
// flight-offers.controller.spec.ts
describe('FlightOffersController', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/flight-offers')
      .expect(401);
    
    expect(response.body.message).toBe('Missing authentication token');
  });

  it('should require proper role', async () => {
    const token = generateTestToken({ roles: ['USER'] });
    
    const response = await request(app)
      .post('/flight-offers')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    
    expect(response.body.message).toBe('Insufficient permissions');
  });
});
```

## Security Best Practices

1. Token Validation
   - Always validate token signature
   - Check token expiration
   - Validate issuer and audience
   - Use appropriate token expiration times

2. Role Checking
   - Always use RolesGuard for protected routes
   - Implement role hierarchy if needed
   - Log access denials for monitoring

3. Error Handling
   - Never expose internal errors
   - Use appropriate HTTP status codes
   - Log authentication failures
   - Implement rate limiting

4. Testing
   - Test all authentication paths
   - Test role-based access
   - Test token expiration
   - Test error scenarios