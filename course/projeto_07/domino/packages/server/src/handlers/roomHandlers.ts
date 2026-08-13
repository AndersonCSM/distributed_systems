import { Socket, Server as SocketIOServer } from 'socket.io';
import { roomService } from '../services/RoomService.js';
import { auditLog } from '../utils/auditLog.js';
import { sqsService } from '../services/SqsService.js';

/**
 * Registrar todos os handlers de sala
 */
export function registerRoomHandlers(io: SocketIOServer, socket: Socket) {
  /**
   * Criar nova sala
   * Cliente: socket.emit('create_room', { name, maxPlayers, gameMode, playerName })
   * Servidor: socket.emit('room_created', { roomCode, room })
   */
  socket.on('create_room', (data) => {
    try {
      const { name, maxPlayers, gameMode, playerName, roomCode } = data;

      auditLog.logReceived(
        socket.id,
        'create_room',
        { name, maxPlayers, gameMode, playerName, roomCode },
        roomCode
      );

      const room = roomService.createRoom({
        name,
        maxPlayers,
        gameMode,
        ownerName: playerName,
        code: roomCode,
        ownerSocketId: socket.id,
      });

      // O criador também precisa estar na room do Socket.IO
      socket.join(room.code);

      socket.emit('room_created', {
        success: true,
        roomCode: room.code,
        room,
        player: room.players[0], // O criador é sempre o primeiro
      });

      // Enviar para SQS
      sqsService.sendMessage({
        type: 'room_created',
        roomCode: room.code,
        timestamp: Date.now(),
        data: { name, maxPlayers, gameMode, playerName },
      });

      auditLog.logSent('room_created', 'socket', socket.id, { roomCode: room.code }, room.code);
    } catch (error) {
      const { roomCode } = data || {};
      socket.emit('room_created', {
        success: false,
        error: 'Erro ao criar sala',
      });
      auditLog.logError(socket.id, 'create_room', error, roomCode);
    }
  });

  /**
   * Entrar em uma sala
   * Cliente: socket.emit('join_room', { roomCode, playerName })
   * Servidor: socket.emit('room_joined', { success, player, room })
   *           io.to(roomCode).emit('player_joined_notify', { player, players })
   */
  socket.on('join_room', (data) => {
    try {
      const { roomCode, playerName } = data;

      auditLog.logReceived(socket.id, 'join_room', { roomCode, playerName }, roomCode);

      const result = roomService.joinRoom(roomCode, playerName, socket.id);

      if (!result.success) {
        socket.emit('room_joined', {
          success: false,
          error: result.error,
        });
        auditLog.logError(socket.id, 'join_room', result.error, roomCode);
        return;
      }

      socket.join(roomCode);

      socket.emit('room_joined', {
        success: true,
        player: result.player,
        room: result.room,
      });

      // Notificar outros jogadores
      io.to(roomCode).emit('player_joined_notify', {
        player: result.player,
        players: result.room?.players,
        message: `${result.player?.name} entrou na sala`,
      });

      // Enviar para SQS
      sqsService.sendMessage({
        type: 'player_joined',
        roomCode,
        timestamp: Date.now(),
        data: { playerName, playerId: result.player?.id },
      });

      auditLog.logSent('player_joined_notify', 'room', socket.id, result.player, roomCode);
    } catch (error) {
      const { roomCode } = data || {};
      socket.emit('room_joined', {
        success: false,
        error: 'Erro ao entrar na sala',
      });
      auditLog.logError(socket.id, 'join_room', error, roomCode);
    }
  });

  /**
   * Sair de uma sala
   * Cliente: socket.emit('leave_room', { playerId, roomCode })
   * Servidor: socket.emit('room_left', { success })
   *           io.to(roomCode).emit('player_left_notify', { playerName, players })
   */
  socket.on('leave_room', (data) => {
    try {
      const { playerId, roomCode } = data;

      auditLog.logReceived(socket.id, 'leave_room', { playerId, roomCode }, roomCode, playerId);

      const player = roomService.getPlayer(playerId);

      const result = roomService.leaveRoom(playerId);

      // Enviar para SQS
      sqsService.sendMessage({
        type: 'player_left',
        roomCode,
        timestamp: Date.now(),
        data: { playerName: player?.name, playerId },
      });

      if (!result.success) {
        socket.emit('room_left', { success: false });
        auditLog.logError(socket.id, 'leave_room', 'Could not leave room', roomCode, playerId);
        return;
      }

      // Se o host saiu, todos os jogadores devem ser desconectados e a sala destruída
      if (result.hostLeft) {
        io.to(roomCode).emit('room_closed', {
          success: false,
          error: 'O host saiu da sala. A sala foi encerrada.',
          roomCode,
        });

        io.in(roomCode).socketsLeave(roomCode);
        socket.emit('room_left', { success: true, roomDeleted: true, hostLeft: true });
        auditLog.logSent('room_closed', 'room', socket.id, { roomCode }, roomCode);
        return;
      }

      socket.leave(roomCode);

      socket.emit('room_left', { success: true });

      // Notificar outros jogadores
      if (!result.roomDeleted) {
        io.to(roomCode).emit('player_left_notify', {
          playerName: player?.name,
          players: roomService.getRoomInfo(roomCode)?.players,
          message: `${player?.name} saiu da sala`,
        });
      }

      auditLog.logSent('player_left_notify', 'room', socket.id, player, roomCode);
    } catch (error) {
      const { roomCode, playerId } = data || {};
      socket.emit('room_left', { success: false });
      auditLog.logError(socket.id, 'leave_room', error, roomCode, playerId);
    }
  });

  /**
   * Listar salas disponíveis
   * Cliente: socket.emit('list_rooms')
   * Servidor: socket.emit('rooms_list', { rooms })
   */
  socket.on('list_rooms', () => {
    try {
      auditLog.logReceived(socket.id, 'list_rooms', {});

      const rooms = roomService.listRooms();

      socket.emit('rooms_list', {
        success: true,
        rooms,
        count: rooms.length,
      });

      auditLog.logSent('rooms_list', 'socket', socket.id, { count: rooms.length });
    } catch (error) {
      socket.emit('rooms_list', {
        success: false,
        error: 'Erro ao listar salas',
      });
      auditLog.logError(socket.id, 'list_rooms', error);
    }
  });

  /**
   * Obter informações da sala
   * Cliente: socket.emit('get_room_info', { roomCode })
   * Servidor: socket.emit('room_info', { success, room })
   */
  socket.on('get_room_info', (data) => {
    try {
      const { roomCode } = data;
      auditLog.logReceived(socket.id, 'get_room_info', { roomCode }, roomCode);

      const roomInfo = roomService.getRoomInfo(roomCode);

      if (!roomInfo) {
        socket.emit('room_info', {
          success: false,
          error: 'Sala não encontrada',
        });
        auditLog.logError(socket.id, 'get_room_info', 'Room not found', roomCode);
        return;
      }

      socket.emit('room_info', {
        success: true,
        room: roomInfo,
      });

      auditLog.logSent('room_info', 'socket', socket.id, { roomCode });
    } catch (error) {
      const { roomCode } = data || {};
      socket.emit('room_info', {
        success: false,
        error: 'Erro ao obter info da sala',
      });
      auditLog.logError(socket.id, 'get_room_info', error, roomCode);
    }
  });

  /**
   * Marcar jogador como pronto
   * Cliente: socket.emit('player_ready', { playerId, roomCode, isReady })
   * Servidor: io.to(roomCode).emit('player_ready_notify', { playerId, isReady })
   */
  socket.on('player_ready', (data) => {
    try {
      const { playerId, roomCode, isReady } = data;
      auditLog.logReceived(socket.id, 'player_ready', { playerId, isReady }, roomCode, playerId);

      const room = roomService.getRoom(roomCode);

      if (!room) {
        auditLog.logError(socket.id, 'player_ready', 'Room not found', roomCode, playerId);
        return;
      }

      const player = room.players.find((p: any) => p.id === playerId);
      if (player) {
        player.isReady = isReady;
      }

      io.to(roomCode).emit('player_ready_notify', {
        playerId,
        playerName: player?.name,
        isReady,
        allReady: room.players.every((p: any) => p.isReady),
      });

      auditLog.logSent('player_ready_notify', 'room', socket.id, { playerId, isReady, allReady: room.players.every((p: any) => p.isReady) }, roomCode);
    } catch (error) {
      const { roomCode, playerId } = data || {};
      auditLog.logError(socket.id, 'player_ready', error, roomCode, playerId);
    }
  });
}
