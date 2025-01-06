import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FlightOffersController } from './flight-offers.controller.js'
import { FlightOffersService } from './flight-offers.service.js'
import { LoggingModule } from '../logging/logging.module.js'

@Module({
  imports: [
    ConfigModule,
    LoggingModule
  ],
  controllers: [FlightOffersController],
  providers: [FlightOffersService],
  exports: [FlightOffersService],
})
export class FlightOffersModule {}