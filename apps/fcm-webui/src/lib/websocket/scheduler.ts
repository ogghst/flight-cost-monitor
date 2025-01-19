import { Socket, io } from 'socket.io-client'

interface SchedulerEvents {
  'task:created': (taskId: string) => void
  'task:updated': (taskId: string) => void
  'task:deleted': (taskId: string) => void
  'task:execution': (taskId: string, status: string) => void
}

type EventHandler = (...args: unknown[]) => void

export class SchedulerSocket {
  private static instance: SchedulerSocket
  private socket: Socket | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()

  private constructor() {
    // Initialize socket connection
    this.socket = io('http://localhost:3001/tasks', {
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      autoConnect: false,
      withCredentials: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to scheduler websocket')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from scheduler websocket')
    })

    // Setup event handlers
    this.socket.on('task:created', (taskId: string) => this.emit('task:created', taskId))
    this.socket.on('task:updated', (taskId: string) => this.emit('task:updated', taskId))
    this.socket.on('task:deleted', (taskId: string) => this.emit('task:deleted', taskId))
    this.socket.on('task:execution', (taskId: string, status: string) => 
      this.emit('task:execution', taskId, status)
    )
  }

  public static getInstance(): SchedulerSocket {
    if (!SchedulerSocket.instance) {
      SchedulerSocket.instance = new SchedulerSocket()
    }
    return SchedulerSocket.instance
  }

  public connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect()
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  public on<T extends keyof SchedulerEvents>(
    event: T,
    handler: SchedulerEvents[T]
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }

    const handlers = this.handlers.get(event)!
    handlers.add(handler as EventHandler)

    return () => {
      handlers.delete(handler as EventHandler)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  private emit(event: keyof SchedulerEvents, ...args: unknown[]): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(...args))
    }
  }
}