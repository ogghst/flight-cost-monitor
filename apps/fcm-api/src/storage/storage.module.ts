import { Module } from '@nestjs/common'
import { refreshTokenRepository } from '@fcm/storage'
import { REFRESH_TOKEN_REPOSITORY } from './storage.tokens.js'

@Module({
  providers: [
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useValue: refreshTokenRepository
    }
  ],
  exports: [REFRESH_TOKEN_REPOSITORY]
})
export class StorageModule {}