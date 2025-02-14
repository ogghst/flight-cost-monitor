import { Module } from '@nestjs/common'
import { WebsocketGateway } from './websocket.gateway.js'

@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}