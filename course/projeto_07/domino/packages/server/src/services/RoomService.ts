import { GameService } from './GameService.js';
import { GameState } from '../types/game.js';
import { Room, RoomConfig, RoomInfo } from '../types/room.js';
import { Player } from '../types/player.js';
import { MoveSide } from '../types/game.js';

class RoomService {
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();
  private games: Map<string, GameState> = new Map();
  private gameService = new GameService();

  // ===============================
  // 🏠 CREATE ROOM
  // ===============================
  createRoom(config: RoomConfig & { code?: string; ownerSocketId?: string }): Room {
    const code = config.code || this.generateRoomCode();
    const ownerId = `player-${Date.now()}`;

    const owner: Player = {
      id: ownerId,
      name: config.ownerName,
      socketId: config.ownerSocketId || '',
      roomCode: code,
      isReady: false,
      isActive: true,
      position: this.getRandomPosition([]),
      hand: [],
      score: 0,
    };

    const room: Room = {
      code,
      name: config.name,
      owner: ownerId,
      maxPlayers: config.maxPlayers,
      players: [owner],
      gameMode: config.gameMode,
      status: 'waiting',
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.players.set(ownerId, owner);

    return room;
  }

  // ===============================
  // 👥 JOIN ROOM
  // ===============================
  joinRoom(
    roomCode: string,
    playerName: string,
    socketId: string
  ): { success: boolean; player?: Player; room?: Room; error?: string } {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Sala não está disponível' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Sala cheia' };
    }

    const playerId = `player-${Date.now()}-${Math.random()}`;
    const usedPositions = room.players.map((p: any) => p.position);
    const position = this.getRandomPosition(usedPositions);

    const player: Player = {
      id: playerId,
      name: playerName,
      socketId,
      roomCode,
      isReady: false,
      isActive: true,
      position,
      hand: [],
      score: 0,
    };

    room.players.push(player);
    this.players.set(playerId, player);

    return { success: true, player, room };
  }

  // ===============================
  // 🚪 LEAVE ROOM
  // ===============================
  leaveRoom(playerId: string): {
    success: boolean;
    roomDeleted: boolean;
    hostLeft?: boolean;
    roomCode?: string;
  } {
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, roomDeleted: false };
    }

    const room = this.rooms.get(player.roomCode);
    if (!room) {
      return { success: false, roomDeleted: false };
    }

    // Se o host sair, destruir a sala e remover todos os jogadores
    if (room.owner === playerId) {
      for (const p of room.players) {
        this.players.delete(p.id);
      }
      this.games.delete(player.roomCode);
      this.rooms.delete(player.roomCode);
      return {
        success: true,
        roomDeleted: true,
        hostLeft: true,
        roomCode: player.roomCode,
      };
    }

    room.players = room.players.filter((p: any) => p.id !== playerId);
    this.players.delete(playerId);

    const roomDeleted = room.players.length === 0;
    if (roomDeleted) {
      this.games.delete(player.roomCode);
      this.rooms.delete(player.roomCode);
    }

    return { success: true, roomDeleted, roomCode: player.roomCode };
  }

  // ===============================
  // 🔌 LEAVE BY SOCKET (disconnect)
  // ===============================
  leaveBySocketId(socketId: string): {
    success: boolean;
    roomCode?: string;
    playerName?: string;
    roomDeleted?: boolean;
    hostLeft?: boolean;
    players?: Array<{ id: string; name: string; isReady: boolean }>;
  } {
    const player = Array.from(this.players.values()).find((p) => p.socketId === socketId);

    if (!player) {
      return { success: false };
    }

    const playerName = player.name;
    const roomCode = player.roomCode;
    const result = this.leaveRoom(player.id);

    if (!result.success) {
      return { success: false };
    }

    if (result.hostLeft || result.roomDeleted) {
      return {
        success: true,
        roomCode,
        playerName,
        roomDeleted: result.roomDeleted,
        hostLeft: result.hostLeft,
      };
    }

    const roomInfo = this.getRoomInfo(roomCode);
    return {
      success: true,
      roomCode,
      playerName,
      roomDeleted: false,
      hostLeft: false,
      players: roomInfo?.players,
    };
  }

  // ===============================
  // 🎮 START GAME
  // ===============================
  startGame(roomCode: string): GameState | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.players.length < 2) return null;

    const playerIds = room.players.map((p: any) => p.id);
    const game = this.gameService.createGame(roomCode, playerIds);
    this.games.set(roomCode, game);

    room.status = 'playing';
    room.startedAt = Date.now();
    this.syncRoomPlayersFromGame(room, game);

    return game;
  }

  // ===============================
  // 🎯 PLAY MOVE
  // ===============================
  playMove(
    roomCode: string,
    playerId: string,
    dominoId: string,
    side: MoveSide
  ): GameState | null {
    const room = this.rooms.get(roomCode);
    const game = this.games.get(roomCode);
    if (!room || !game) return null;

    const updated = this.gameService.playMove(game, playerId, dominoId, side);
    if (!updated) return null;

    this.games.set(roomCode, updated);
    this.syncRoomPlayersFromGame(room, updated);
    if (updated.status === 'finished') {
      room.status = 'finished';
      room.finishedAt = Date.now();
    }

    return updated;
  }

  // ===============================
  // ⛔ PASS TURN
  // ===============================
  passTurn(roomCode: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomCode);
    const game = this.games.get(roomCode);
    if (!room || !game) return null;

    const updated = this.gameService.passTurn(game, playerId);
    if (!updated) return null;

    this.games.set(roomCode, updated);
    this.syncRoomPlayersFromGame(room, updated);
    if (updated.status === 'finished') {
      room.status = 'finished';
      room.finishedAt = Date.now();
    }

    return updated;
  }

  // ===============================
  // 🃏 DRAW
  // ===============================
  draw(roomCode: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomCode);
    const game = this.games.get(roomCode);
    if (!room || !game) return null;

    const updated = this.gameService.drawUntilPlayable(game, playerId);
    if (!updated) return null;

    this.games.set(roomCode, updated);
    this.syncRoomPlayersFromGame(room, updated);
    return updated;
  }

  getGame(roomCode: string): GameState | null {
    return this.games.get(roomCode) || null;
  }

  // ===============================
  // 📡 GET ROOM
  // ===============================
  getRoom(roomCode: string): Room | null {
    return this.rooms.get(roomCode) || null;
  }
  // ===============================
  // 👤 GET PLAYER
  // ===============================
  getPlayer(playerId: string): Player | null {
    return this.players.get(playerId) || null;
  }

  // ===============================
  // 📋 LIST ROOMS
  // ===============================
  listRooms(): RoomInfo[] {
    return Array.from(this.rooms.values())
      .filter((room) => room.status === 'waiting')
      .map((room) => ({
        code: room.code,
        name: room.name,
        owner: room.owner,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        gameMode: room.gameMode,
        players: room.players.map((p: any) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
          position: p.position,
          score: p.score,
          handCount: p.hand?.length || 0,
          isActive: p.isActive,
          socketId: p.socketId,
        })),
      }));
  }

  // ===============================
  // 📊 GET ROOM INFO
  // ===============================
  getRoomInfo(roomCode: string): RoomInfo | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    return {
      code: room.code,
      name: room.name,
      owner: room.owner,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      status: room.status,
      gameMode: room.gameMode,
      players: room.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        isReady: p.isReady,
        position: p.position,
        score: p.score,
        handCount: p.hand?.length || 0,
        isActive: p.isActive,
        socketId: p.socketId,
      })),
    };
  }

  private syncRoomPlayersFromGame(room: Room, game: GameState) {
    for (const player of room.players) {
      const hand = game.hands.get(player.id) || [];
      player.hand = hand.map((d) => ({ left: d.left, right: d.right }));
      if (game.scores.has(player.id)) {
        player.score = game.scores.get(player.id)!;
      }
    }
  }

  // ===============================
  // 🔧 HELPERS
  // ===============================
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private getRandomPosition(
    usedPositions: Array<'left' | 'top' | 'right' | 'bottom'>
  ): 'left' | 'top' | 'right' | 'bottom' {
    const allPositions: Array<'left' | 'top' | 'right' | 'bottom'> = [
      'left',
      'top',
      'right',
      'bottom',
    ];
    const available = allPositions.filter((p) => !usedPositions.includes(p));
    return available[Math.floor(Math.random() * available.length)];
  }
}

export const roomService = new RoomService();