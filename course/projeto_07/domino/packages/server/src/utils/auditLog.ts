/**
 * Sistema de Logs de Auditoria
 * Rastreia todos os eventos do Socket.IO para debugging
 */

export interface AuditLogEntry {
  timestamp: string;
  socketId: string;
  event: string;
  action: 'RECEIVED' | 'SENT' | 'ERROR';
  data: any;
  roomCode?: string;
  playerId?: string;
  status: 'SUCCESS' | 'FAIL';
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Log evento recebido do cliente
   */
  logReceived(
    socketId: string,
    event: string,
    data: any,
    roomCode?: string,
    playerId?: string
  ) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      socketId,
      event,
      action: 'RECEIVED',
      data,
      roomCode,
      playerId,
      status: 'SUCCESS',
    };

    this.logs.push(entry);
    this.trimLogs();

    console.log(`📥 [${event}] Socket: ${socketId.slice(0, 8)}... | Room: ${roomCode || 'N/A'}`);
  }

  /**
   * Log evento enviado para cliente(s)
   */
  logSent(
    event: string,
    target: 'socket' | 'room' | 'broadcast',
    socketId: string,
    data: any,
    roomCode?: string
  ) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      socketId,
      event,
      action: 'SENT',
      data,
      roomCode,
      status: 'SUCCESS',
    };

    this.logs.push(entry);
    this.trimLogs();

    const targetStr =
      target === 'socket' ? 'Direct' : target === 'room' ? `Room: ${roomCode}` : 'Broadcast';
    console.log(`📤 [${event}] To: ${targetStr} | Socket: ${socketId.slice(0, 8)}...`);
  }

  /**
   * Log erro em evento
   */
  logError(
    socketId: string,
    event: string,
    error: any,
    roomCode?: string,
    playerId?: string
  ) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      socketId,
      event,
      action: 'RECEIVED',
      data: { error: String(error) },
      roomCode,
      playerId,
      status: 'FAIL',
    };

    this.logs.push(entry);
    this.trimLogs();

    console.error(`❌ [${event}] Error in Socket: ${socketId.slice(0, 8)}... | ${String(error)}`);
  }

  /**
   * Obter últimos N logs
   */
  getRecent(count: number = 50): AuditLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Filtrar logs por evento
   */
  filterByEvent(event: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.event === event);
  }

  /**
   * Filtrar logs por sala
   */
  filterByRoom(roomCode: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.roomCode === roomCode);
  }

  /**
   * Limpar logs antigos
   */
  private trimLogs() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Exportar todos os logs
   */
  exportLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpar todos os logs
   */
  clearLogs() {
    this.logs = [];
    console.log('🗑️  Logs de auditoria limpos');
  }
}

export const auditLog = new AuditLogger();
