import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class TelegramService {
  private readonly botToken: string
  private readonly chatId: string
  private readonly apiUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN')
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID')
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      console.warn('Telegram configuration missing')
      return
    }

    try {
      await this.httpService.axiosRef.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
    }
  }
}