import { FlightOffersModule } from '#/flight-offers/flight-offers.module.js';
import { LoggingModule } from '#/logging/logging.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    FlightOffersModule,
  ],
})
export class AppModule {}
