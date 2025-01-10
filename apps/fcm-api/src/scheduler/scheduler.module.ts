import { Module } from '@nestjs/common'
import { SchedulerService } from './scheduler.service.js'
import { SchedulerController } from './scheduler.controller.js'
import { WebsocketModule } from '../websocket/websocket.module.js'
import { MonitoringModule } from '../monitoring/monitoring.module.js'
import { AlertsModule } from '../alerts/alerts.module.js'

@Module({
  imports: [
    WebsocketModule,
    MonitoringModule,
    AlertsModule
  ],
  providers: [SchedulerService],
  controllers: [SchedulerController],
  exports: [SchedulerService]
})
export class SchedulerModule {}