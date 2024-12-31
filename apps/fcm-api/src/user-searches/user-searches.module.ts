import { Module } from '@nestjs/common'
import { UserSearchesController } from './user-searches.controller.js'
import { UserSearchesService } from './user-searches.service.js'

@Module({
  controllers: [UserSearchesController],
  providers: [UserSearchesService],
  exports: [UserSearchesService], // Export the service so other modules can use it
})
export class UserSearchesModule {}
