import { AuthModule } from '@/auth/auth.module.js'
import { Module } from '@nestjs/common'
import { UserSearchesController } from './user-searches.controller.js'
import { UserSearchesService } from './user-searches.service.js'

@Module({
  imports: [AuthModule],
  controllers: [UserSearchesController],
  providers: [UserSearchesService],
  exports: [UserSearchesService], // Export the service so other modules can use it
})
export class UserSearchesModule {}
