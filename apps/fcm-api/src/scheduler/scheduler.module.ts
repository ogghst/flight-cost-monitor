import { FlightOffersModule } from '@/flight-offers/flight-offers.module.js'
import { UserSearchesModule } from '@/user-searches/user-searches.module.js'
import { Module } from '@nestjs/common'
import { AlertsModule } from '../alerts/alerts.module.js'
import { MonitoringModule } from '../monitoring/monitoring.module.js'
import { WebsocketModule } from '../websocket/websocket.module.js'
import { SchedulerController } from './scheduler.controller.js'
import { SchedulerService } from './scheduler.service.js'

@Module({
  imports: [
    WebsocketModule,
    MonitoringModule,
    AlertsModule,
    FlightOffersModule,
    UserSearchesModule,
  ],
  providers: [SchedulerService],
  controllers: [SchedulerController],
  exports: [SchedulerService],
})
export class SchedulerModule {}
