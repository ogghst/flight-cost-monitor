import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { headers } from 'next/headers'
import { Server as IOServer } from 'socket.io'

let io: IOServer | undefined

if (!io) {
  const httpServer = new NetServer()
  io = new IOServer(httpServer, {
    path: '/api/ws',
    addTrailingSlash: false,
  })

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  httpServer.listen(3001)
}

export async function GET(req: Request, res: NextApiResponse) {
  if (!io) {
    return new Response('WebSocket server not initialized', { status: 500 })
  }

  const headersList = headers()
  const upgradeHeader = (await headersList).get('upgrade')

  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: WebSocket', { status: 426 })
  }

  // handle WS here
  return new Response('WebSocket server is running', { status: 101 })
}
