/// <reference types="vite/client" />
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  connect() {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor Socket.IO:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado do servidor:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Erro de conexão:', error);
    });

    return this.socket;
  }

  getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Wrapper para facilitar a emissão de eventos
  emit(event: string, data?: any) {
    const socket = this.getSocket();
    socket.emit(event, data);
  }

  // Wrapper para adicionar listeners
  on(event: string, callback: (...args: any[]) => void) {
    const socket = this.getSocket();
    socket.on(event, callback);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Wrapper para remover listeners e evitar memory leaks
  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Limpar todos os listeners registrados via service
  clearAllListeners() {
    if (!this.socket) return;
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket?.off(event, cb));
    });
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
