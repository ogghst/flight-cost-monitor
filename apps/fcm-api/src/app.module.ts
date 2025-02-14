import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AlertsModule } from './alerts/alerts.module.js'
import { AuthModule } from './auth/auth.module.js'
import { FlightOffersModule } from './flight-offers/flight-offers.module.js'
import { MonitoringModule } from './monitoring/monitoring.module.js'
import { SchedulerModule } from './scheduler/scheduler.module.js'
import { UserSearchesModule } from './user-searches/user-searches.module.js'
import { UsersModule } from './users/users.module.js'
import { WebsocketModule } from './websocket/websocket.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HttpModule,
    AuthModule,
    FlightOffersModule,
    SchedulerModule,
    MonitoringModule,
    AlertsModule,
    WebsocketModule,
    UsersModule,
    UserSearchesModule,
  ],
})
export class AppModule {}
