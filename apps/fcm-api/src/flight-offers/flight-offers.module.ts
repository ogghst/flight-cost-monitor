import { Module } from '@nestjs/common';
import { FlightOffersController } from './flight-offers.controller.js';
import { FlightOffersService } from './flight-offers.service.js';

@Module({
  controllers: [FlightOffersController],
  providers: [FlightOffersService],
  exports: [FlightOffersService],
})
export class FlightOffersModule {}
