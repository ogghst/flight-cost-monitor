import { UsersController } from '@/users/users.controller.js'
import { UsersService } from '@/users/users.service.js'
import { Module } from '@nestjs/common'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export the service so other modules can use it
})
export class UsersModule {}
