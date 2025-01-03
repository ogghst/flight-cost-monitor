import { FlightOffersModule } from '@/flight-offers/flight-offers.module.js'
import { LoggingModule } from '@/logging/logging.module.js'
import { UserSearchesModule } from '@/user-searches/user-searches.module.js'
import { UsersModule } from '@/users/users.module.js'
import { AuthModule } from '@/auth/auth.module.js'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    AuthModule,
    FlightOffersModule,
    UsersModule,
    UserSearchesModule,
  ],
})
export class AppModule {}