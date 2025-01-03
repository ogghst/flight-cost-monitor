# Flight Cost Monitor Authentication Documentation

## Overview
Flight Cost Monitor (FCM) supports two main authentication methods:
1. OAuth authentication (GitHub, Google)
2. Credentials-based authentication

## Authentication Flows

### 1. OAuth Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as FCM WebUI
    participant O as OAuth Provider
    participant A as FCM API
    participant D as Database

    %% OAuth Flow
    U->>W: Click OAuth Login
    W->>O: Initiate OAuth Flow
    O->>U: Show Provider Login
    U->>O: Enter Credentials
    O->>W: Return OAuth Token + User Info
    
    %% Backend Authentication
    W->>A: POST /auth/oauth/login
    A->>D: Find/Create User
    A->>A: Generate JWT & Refresh Token
    A->>W: Return Tokens + User Info
    W->>U: Redirect to Dashboard
```

### 2. Credentials Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as FCM WebUI
    participant A as FCM API
    participant D as Database

    %% Login Flow
    U->>W: Enter Credentials
    W->>A: POST /auth/login
    A->>D: Validate Credentials
    A->>A: Generate JWT & Refresh Token
    A->>W: Return Tokens + User Info
    W->>U: Redirect to Dashboard
```

### 3. Token Refresh Flow

```mermaid
stateDiagram-v2
    [*] --> ValidToken
    ValidToken --> ExpiredToken: Token Expires
    ExpiredToken --> RefreshAttempt: Auto Refresh
    RefreshAttempt --> ValidToken: Success
    RefreshAttempt --> LoginRequired: Failure
    LoginRequired --> [*]: Redirect to Login

    note right of ValidToken
        JWT in memory
        Used for API calls
    end note

    note right of RefreshAttempt
        Uses httpOnly
        refresh token
    end note
```

## Authentication Components

### 1. Token Structure

#### Access Token (JWT)
\`\`\`typescript
interface TokenPayload {
    sub: string;           // User ID
    email: string;
    authType: string;      // 'CREDENTIALS' | 'OAUTH'
    roles: string[];
    iat: number;
    exp: number;
}
\`\`\`

#### Refresh Token
\`\`\`typescript
interface RefreshToken {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    family: string;        // For token rotation
    generationNumber: number;
}
\`\`\`

### 2. API Endpoints

#### OAuth Authentication
- \`POST /auth/oauth/login\`: Exchange OAuth token for JWT
- \`POST /auth/oauth/github\`: GitHub OAuth callback
- \`POST /auth/oauth/google\`: Google OAuth callback

#### Credentials Authentication
- \`POST /auth/login\`: Login with username/password
- \`POST /auth/register\`: Register new user
- \`POST /auth/forgot-password\`: Request password reset
- \`POST /auth/reset-password\`: Reset password with token

#### Token Management
- \`POST /auth/refresh\`: Refresh access token
- \`POST /auth/logout\`: Logout and invalidate tokens

### 3. Security Measures

#### Token Storage
```mermaid
graph TD
    A[Access Token] -->|Stored in| B[Memory]
    C[Refresh Token] -->|Stored in| D[httpOnly Cookie]
    E[OAuth Token] -->|Temporary| F[Memory during OAuth Flow]
```

#### Security Features
1. Token Rotation
   - New refresh token family on login
   - Generation number increments on refresh
   - Family invalidation on suspected breach

2. CSRF Protection
   - SameSite cookie policy
   - CSRF tokens for mutations
   - Origin validation

3. Rate Limiting
   - Login attempts limited
   - Token refresh rate limited
   - IP-based throttling

## Implementation Example

### Frontend Usage
\`\`\`typescript
// OAuth Login
const handleOAuthLogin = async (provider: 'github' | 'google') => {
  const tokens = await authService.loginWithOAuth(provider);
  await tokenStorage.setTokens(tokens);
};

// Credentials Login
const handleLogin = async (credentials: LoginCredentials) => {
  const tokens = await authService.login(credentials);
  await tokenStorage.setTokens(tokens);
};

// API Call with Auth
const makeAuthenticatedCall = async () => {
  const token = await tokenStorage.getAccessToken();
  return api.call('/protected-endpoint', {
    headers: { Authorization: \`Bearer \${token}\` }
  });
};
\`\`\`

### Backend Validation
\`\`\`typescript
// Token Validation
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const token = this.extractToken(context);
    if (!token) return false;
    
    try {
      const payload = await this.jwtService.verify(token);
      return this.validatePayload(payload);
    } catch {
      return false;
    }
  }
}

// Role-Based Access
@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    return this.matchRoles(roles, user.roles);
  }
}
\`\`\`

## Security Considerations

### Token Lifecycle
1. Access tokens expire in 15 minutes
2. Refresh tokens expire in 7 days
3. Tokens are invalidated on logout
4. Compromised tokens can be revoked

### Best Practices
1. Always use HTTPS
2. Implement proper CORS policies
3. Validate all user input
4. Monitor failed login attempts
5. Log security-relevant events

## Error Handling

```mermaid
graph TD
    A[Authentication Error] -->|Invalid Credentials| B[401 Unauthorized]
    A -->|Invalid Token| C[401 Unauthorized]
    A -->|Expired Token| D[401 Unauthorized + Refresh Required]
    A -->|Invalid Refresh| E[401 Unauthorized + Login Required]
    A -->|Missing Permissions| F[403 Forbidden]
```