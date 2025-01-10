import { Module } from '@nestjs/common'
import { MonitoringService } from './monitoring.service.js'
import { MonitoringController } from './monitoring.controller.js'
import { WebsocketModule } from '../websocket/websocket.module.js'

@Module({
  imports: [WebsocketModule],
  providers: [MonitoringService],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {}