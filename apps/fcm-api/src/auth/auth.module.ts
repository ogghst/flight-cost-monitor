import { CryptoModule } from '@/crypto/crypto.module.js'
import { LoggingModule } from '@/logging/logging.module.js'
import { StorageModule } from '@/storage/storage.module.js'
import { UsersModule } from '@/users/users.module.js'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './controllers/auth.controller.js'
import { OAuthController } from './controllers/oauth.controller.js'
import { AuthService } from './services/auth.service.js'
import { TokenService } from './services/token.service.js'
import { JwtStrategy } from './strategies/jwt.strategy.js'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ConfigModule,
    CryptoModule,
    UsersModule,
    StorageModule,
    LoggingModule,
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, TokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
