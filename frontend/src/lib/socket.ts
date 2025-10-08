import { io, Socket } from 'socket.io-client'
import { SocketEvents } from '@/types'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(token: string) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.emit('connect')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.emit('disconnect')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.emit('error', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any)
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback as any)
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.off(event, callback as any)
    }

    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as any)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) {
    if (this.socket) {
      this.socket.emit(event, ...args)
    }
  }

  private emitToListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }
}

export const socketService = new SocketService()