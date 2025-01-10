import { Injectable } from '@nestjs/common'
import { TelegramService } from './providers/telegram.service.js'
import { WebsocketGateway } from '../websocket/websocket.gateway.js'

interface Alert {
  type: 'ERROR' | 'WARNING' | 'INFO'
  message: string
  error?: string
  taskId?: string
  executionId?: string
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly websocketGateway: WebsocketGateway
  ) {}

  async sendAlert(alert: Alert) {
    // Send to Telegram
    await this.telegramService.sendMessage(this.formatAlertMessage(alert))

    // Broadcast via WebSocket
    this.websocketGateway.broadcastToAll('alert', alert)

    return alert
  }

  private formatAlertMessage(alert: Alert): string {
    let message = `⚠️ FCM Alert\n\nType: ${alert.type}\nMessage: ${alert.message}`

    if (alert.taskId) {
      message += `\nTask ID: ${alert.taskId}`
    }

    if (alert.executionId) {
      message += `\nExecution ID: ${alert.executionId}`
    }

    if (alert.error) {
      message += `\n\nError: ${alert.error}`
    }

    return message
  }
}