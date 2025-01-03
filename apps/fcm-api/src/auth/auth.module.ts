import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { userRepository, refreshTokenRepository } from '@fcm/storage'
import { AuthController } from './controllers/auth.controller.js'
import { JwtAuthGuard } from './guards/jwt.guard.js'
import { RolesGuard } from './guards/roles.guard.js'
import { AuthService } from './services/auth.service.js'
import { TokenService } from './services/token.service.js'
import { JwtStrategy } from './strategies/jwt.strategy.js'
import { UsersModule } from '@/users/users.module.js'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule, // Import UsersModule for UsersService
  ],
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useValue: userRepository,
    },
    {
      provide: 'REFRESH_TOKEN_REPOSITORY',
      useValue: refreshTokenRepository,
    },
    AuthService,
    TokenService,
    JwtStrategy,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, TokenService],
})
export class AuthModule {}