import { AuthModule } from '@/auth/auth.module.js'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggingModule } from '../logging/logging.module.js'
import { FlightOffersController } from './flight-offers.controller.js'
import { FlightOffersService } from './flight-offers.service.js'

@Module({
  imports: [ConfigModule, LoggingModule, AuthModule],
  controllers: [FlightOffersController],
  providers: [FlightOffersService],
  exports: [FlightOffersService],
})
export class FlightOffersModule {}
