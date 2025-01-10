import { WebsocketModule } from '@/websocket/websocket.module.js'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AlertsService } from './alerts.service.js'
import { TelegramService } from './providers/telegram.service.js'

@Module({
  imports: [
    HttpModule, // Add this to make HttpService available
    WebsocketModule,
  ],
  providers: [AlertsService, TelegramService],
  exports: [AlertsService],
})
export class AlertsModule {}
