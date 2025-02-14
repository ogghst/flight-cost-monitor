import { ExecutionState } from '@fcm/shared/scheduler'
import { Logger } from '@nestjs/common'
import {
  WebSocketGateway as NestWebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

interface TaskUpdate {
  taskId: string
  state: ExecutionState
  executionId?: string
  result?: any
  error?: string
}

@NestWebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'tasks',
  transports: ['websocket', 'polling'],
  path: '/socket.io/', // Explicit path
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(WebsocketGateway.name)
  private connectedClients: Map<string, Set<string>> = new Map()

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    // Remove client from all task subscriptions
    this.connectedClients.forEach((clients, taskId) => {
      clients.delete(client.id)
      if (clients.size === 0) {
        this.connectedClients.delete(taskId)
      }
    })
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, taskId: string) {
    this.logger.debug(`Client ${client.id} subscribing to task ${taskId}`)
    if (!this.connectedClients.has(taskId)) {
      this.connectedClients.set(taskId, new Set())
    }
    this.connectedClients.get(taskId).add(client.id)
    return { event: 'subscribed', data: { taskId } }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, taskId: string) {
    this.logger.debug(`Client ${client.id} unsubscribing from task ${taskId}`)
    const clients = this.connectedClients.get(taskId)
    if (clients) {
      clients.delete(client.id)
      if (clients.size === 0) {
        this.connectedClients.delete(taskId)
      }
    }
    return { event: 'unsubscribed', data: { taskId } }
  }

  broadcastTaskUpdate(update: TaskUpdate) {
    const clients = this.connectedClients.get(update.taskId)
    if (clients && clients.size > 0) {
      this.logger.debug(
        `Broadcasting update for task ${update.taskId} to ${clients.size} clients`
      )
      this.server.to(Array.from(clients)).emit('taskUpdate', update)
    }
  }

  broadcastToAll(event: string, data: any) {
    this.logger.debug(`Broadcasting ${event} to all clients`)
    this.server.emit(event, data)
  }
}
