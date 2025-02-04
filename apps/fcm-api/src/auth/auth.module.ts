import { CryptoModule } from '@/crypto/crypto.module.js'
import { UsersModule } from '@/users/users.module.js'
import { UsersService } from '@/users/users.service.js'
import { refreshTokenRepository } from '@fcm/storage'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ThrottlerGuard } from '@nestjs/throttler'
import { AuthController } from './controllers/auth.controller.js'
import { OAuthController } from './controllers/oauth.controller.js'
import { JwtAuthGuard } from './guards/jwt.guard.js'
import { RolesGuard } from './guards/roles.guard.js'
import { AuthService } from './services/auth.service.js'
import { TokenService } from './services/token.service.js'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js'
import { JwtStrategy } from './strategies/jwt.strategy.js'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION') ?? '900',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CryptoModule,
  ],
  providers: [
    {
      provide: 'REFRESH_TOKEN_REPOSITORY',
      useValue: refreshTokenRepository,
    },
    UsersService,
    AuthService,
    TokenService,
    JwtRefreshStrategy,
    JwtStrategy,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController, OAuthController],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
