import { Socket, Server as SocketIOServer } from 'socket.io';
import { roomService } from '../services/RoomService.js';
import { auditLog } from '../utils/auditLog.js';

/**
 * Registrar todos os handlers de jogo
 */
export function registerGameHandlers(io: SocketIOServer, socket: Socket) {
  const toClientGameState = (roomCode: string, game: any) => {
    const room = roomService.getRoom(roomCode);
    if (!room || !game) return null;

    const players = room.players.map((p: any) => ({
      id: p.id,
      name: p.name,
      socketId: p.socketId,
      position: p.position,
      handCount: game.hands.get(p.id)?.length || 0,
      score: p.score || 0,
      isActive: p.isActive,
      canPlay: game.currentPlayer === p.id,
      isReady: p.isReady,
    }));

    const winnerPlayer = game.winner
      ? room.players.find((p: any) => p.id === game.winner)
      : null;

    return {
      status: game.status,
      mode: room.gameMode,
      board: game.board.map((d: any) => ({ id: d.id, left: d.left, right: d.right })),
      players,
      currentPlayerIndex: Math.max(
        0,
        players.findIndex((p: any) => p.id === game.currentPlayer)
      ),
      round: 1,
      winner: game.winner || null,
      winnerName: winnerPlayer?.name || null,
      winType: game.winType || null,
      stockCount: game.stock?.length || 0,
    };
  };

  const emitStateToRoomPlayers = (roomCode: string, eventName: string, message: string) => {
    const room = roomService.getRoom(roomCode);
    const game = roomService.getGame(roomCode);
    if (!room || !game) return;

    const gameState = toClientGameState(roomCode, game);
    const roomInfo = roomService.getRoomInfo(roomCode);

    for (const player of room.players) {
      if (!player.socketId) continue;
      io.to(player.socketId).emit(eventName, {
        success: true,
        game: gameState,
        room: roomInfo,
        myHand: game.hands.get(player.id) || [],
        meId: player.id,
        message,
      });
    }
  };
  /**
   * Iniciar jogo
   * Cliente: socket.emit('start_game', { roomCode })
   * Servidor: io.to(roomCode).emit('game_started_notify', { game, hands })
   */
  socket.on('start_game', (data) => {
    try {
      const { roomCode } = data;

      auditLog.logReceived(socket.id, 'start_game', { roomCode }, roomCode);

      const game = roomService.startGame(roomCode);

      if (!game) {
        socket.emit('start_game_error', {
          error: 'Não é possível iniciar o jogo',
        });
        auditLog.logError(socket.id, 'start_game', 'Could not start game', roomCode);
        return;
      }

      emitStateToRoomPlayers(roomCode, 'game_started_notify', 'Jogo iniciado!');

      auditLog.logSent('game_started_notify', 'room', socket.id, { gameId: game.id }, roomCode);
    } catch (error) {
      const { roomCode } = data || {};
      socket.emit('start_game_error', {
        error: 'Erro ao iniciar jogo',
      });
      auditLog.logError(socket.id, 'start_game', error, roomCode);
    }
  });

  /**
   * Executar movimento
   * Cliente: socket.emit('play_move', { roomCode, playerId, dominoId, side })
   * Servidor: io.to(roomCode).emit('move_executed', { game, move })
   */
  socket.on('play_move', (data) => {
    try {
      const { roomCode, playerId, dominoId, side } = data;

      auditLog.logReceived(socket.id, 'play_move', { playerId, dominoId, side }, roomCode, playerId);

      const game = roomService.playMove(roomCode, playerId, dominoId, side);

      if (!game) {
        socket.emit('move_error', {
          error: 'Movimento inválido',
        });
        auditLog.logError(socket.id, 'play_move', 'Invalid move', roomCode, playerId);
        return;
      }

      emitStateToRoomPlayers(roomCode, 'game_state_sync', `${playerId} jogou uma peça`);

      auditLog.logSent('move_executed', 'room', socket.id, { playerId, dominoId }, roomCode);
    } catch (error) {
      socket.emit('move_error', {
        error: 'Erro ao executar movimento',
      });
      const { roomCode, playerId } = data;
      auditLog.logError(socket.id, 'play_move', error, roomCode, playerId);
    }
  });

  /**
   * Passar turno
   * Cliente: socket.emit('pass_turn', { roomCode, playerId })
   * Servidor: io.to(roomCode).emit('turn_passed', { game })
   */
  socket.on('pass_turn', (data) => {
    try {
      const { roomCode, playerId } = data;

      auditLog.logReceived(socket.id, 'pass_turn', { playerId }, roomCode, playerId);

      const game = roomService.passTurn(roomCode, playerId);

      if (!game) {
        socket.emit('pass_turn_error', {
          error: 'Não é possível passar a vez',
        });
        auditLog.logError(socket.id, 'pass_turn', 'Could not pass turn', roomCode, playerId);
        return;
      }

      emitStateToRoomPlayers(roomCode, 'game_state_sync', `${playerId} passou a vez`);

      auditLog.logSent('turn_passed', 'room', socket.id, { playerId }, roomCode);
    } catch (error) {
      const { roomCode, playerId } = data || {};
      socket.emit('pass_turn_error', {
        error: 'Erro ao passar a vez',
      });
      auditLog.logError(socket.id, 'pass_turn', error, roomCode, playerId);
    }
  });

  /**
   * Comprar peça
   * Cliente: socket.emit('draw_piece', { roomCode, playerId })
   * Servidor: io.to(roomCode).emit('piece_drawn', { game })
   */
  socket.on('draw_piece', (data) => {
    try {
      const { roomCode, playerId } = data;

      auditLog.logReceived(socket.id, 'draw_piece', { playerId }, roomCode, playerId);

      const game = roomService.draw(roomCode, playerId);

      if (!game) {
        socket.emit('draw_piece_error', {
          error: 'Não é possível comprar peça',
        });
        auditLog.logError(socket.id, 'draw_piece', 'Could not draw piece', roomCode, playerId);
        return;
      }

      emitStateToRoomPlayers(roomCode, 'game_state_sync', `${playerId} comprou uma peça`);

      auditLog.logSent('piece_drawn', 'room', socket.id, { playerId }, roomCode);
    } catch (error) {
      const { roomCode, playerId } = data || {};
      socket.emit('draw_piece_error', {
        error: 'Erro ao comprar peça',
      });
      auditLog.logError(socket.id, 'draw_piece', error, roomCode, playerId);
    }
  });

  /**
   * Sincronizar estado do jogo (reconexão)
   * Cliente: socket.emit('sync_game_state', { roomCode, playerId })
   * Servidor: socket.emit('game_state_synced', { game })
   */
  socket.on('sync_game_state', (data) => {
    try {
      const { roomCode } = data;

      auditLog.logReceived(socket.id, 'sync_game_state', { roomCode }, roomCode);

      const roomInfo = roomService.getRoomInfo(roomCode);
      const game = roomService.getGame(roomCode);

      if (!roomInfo || !game) {
        socket.emit('game_state_synced', {
          success: false,
          error: 'Sala não encontrada',
        });
        auditLog.logError(socket.id, 'sync_game_state', 'Room not found', roomCode);
        return;
      }

      const room = roomService.getRoom(roomCode);
      const me = room?.players.find((p: any) => p.socketId === socket.id);
      socket.emit('game_state_synced', {
        success: true,
        room: roomInfo,
        game: toClientGameState(roomCode, game),
        myHand: me ? game.hands.get(me.id) || [] : [],
        message: 'Estado sincronizado',
      });

      auditLog.logSent('game_state_synced', 'socket', socket.id, { roomCode });
    } catch (error) {
      socket.emit('game_state_synced', {
        success: false,
        error: 'Erro ao sincronizar estado',
      });
      const { roomCode } = data;
      auditLog.logError(socket.id, 'sync_game_state', error, roomCode);
    }
  });

  /**
   * Obter estado atual do jogo (re-sincronização)
   * Cliente: socket.emit('get_current_state', { roomCode })
   * Servidor: socket.emit('current_state', { room, player, game })
   */
  socket.on('get_current_state', (data) => {
    try {
      const { roomCode, playerId } = data;

      auditLog.logReceived(socket.id, 'get_current_state', { roomCode }, roomCode);

      const room = roomService.getRoom(roomCode);
      const roomInfo = roomService.getRoomInfo(roomCode);
      const game = roomService.getGame(roomCode);

      if (!room || !roomInfo) {
        socket.emit('current_state', {
          success: false,
          error: 'Sala não encontrada',
        });
        auditLog.logError(socket.id, 'get_current_state', 'Room not found', roomCode);
        return;
      }

      let fullPlayer = room.players.find((p: any) => p.socketId === socket.id);

      // Fallback de reconexão: encontrar por playerId cacheado e atualizar socketId
      if (!fullPlayer && playerId) {
        fullPlayer = room.players.find((p: any) => p.id === playerId);
        if (fullPlayer) {
          fullPlayer.socketId = socket.id;
        }
      }

      if (!fullPlayer) {
        socket.emit('current_state', {
          success: false,
          error: 'Jogador não encontrado nesta sala',
        });
        auditLog.logError(socket.id, 'get_current_state', 'Player not found in room', roomCode);
        return;
      }

      const player = {
        id: fullPlayer.id,
        name: fullPlayer.name,
        socketId: fullPlayer.socketId,
        position: fullPlayer.position,
        handCount: fullPlayer.hand.length,
        score: fullPlayer.score,
        isActive: fullPlayer.isActive,
        canPlay: false,
        isReady: fullPlayer.isReady,
      };

      socket.emit('current_state', {
        success: true,
        room: roomInfo,
        player,
        game: game ? toClientGameState(roomCode, game) : null,
        myHand: game ? game.hands.get(player.id) || [] : [],
        message: 'Estado atual recuperado com sucesso',
      });

      // Garantir que o socket re-conectado está inscrito na sala
      socket.join(roomCode);

      auditLog.logSent('current_state', 'socket', socket.id, { roomCode, playerId: player.id }, roomCode);
    } catch (error) {
      const { roomCode } = data || {};
      socket.emit('current_state', {
        success: false,
        error: 'Erro ao recuperar estado atual',
      });
      auditLog.logError(socket.id, 'get_current_state', error, roomCode);
    }
  });
}
