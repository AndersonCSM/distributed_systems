import { useState, useEffect } from 'react';
import { socketService } from '../services/socketClient';
import type { Room, Player, GameState } from '../types/game';
import { DominoWithId } from '../mocks/mockData';

const ROOM_CACHE_KEY = 'domino_room_cache';
const ROOM_STATE_KEY = 'domino_room_state';

// Importante: usar sessionStorage para isolar estado por aba do navegador.
// localStorage é compartilhado entre abas e causava conflito de identidade.
const storage = window.sessionStorage;

type RoomCache = {
  roomCode: string;
  playerId: string;
  playerName: string;
};

function readRoomCache(): RoomCache | null {
  try {
    const cacheRaw = storage.getItem(ROOM_CACHE_KEY);
    if (!cacheRaw) return null;
    const parsed = JSON.parse(cacheRaw) as RoomCache;
    if (!parsed?.roomCode || !parsed?.playerId) {
      storage.removeItem(ROOM_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    storage.removeItem(ROOM_CACHE_KEY);
    return null;
  }
}

function writeRoomCache(cache: RoomCache) {
  try {
    storage.setItem(ROOM_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignora falhas de storage para não quebrar render do app
  }
}

function clearRoomCache() {
  try {
    storage.removeItem(ROOM_CACHE_KEY);
    storage.removeItem(ROOM_STATE_KEY);
  } catch {
    // noop
  }
}

function readPersistedState(): Pick<ClientGameState, 'room' | 'me'> {
  try {
    const raw = storage.getItem(ROOM_STATE_KEY);
    if (!raw) return { room: null, me: null };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      storage.removeItem(ROOM_STATE_KEY);
      return { room: null, me: null };
    }

    return {
      room: parsed.room || null,
      me: parsed.me || null,
    };
  } catch {
    try {
      storage.removeItem(ROOM_STATE_KEY);
    } catch {
      // noop
    }
    return { room: null, me: null };
  }
}

function persistState(room: Room | null, me: Player | null) {
  try {
    if (!room || !me) {
      storage.removeItem(ROOM_STATE_KEY);
      return;
    }

    storage.setItem(ROOM_STATE_KEY, JSON.stringify({ room, me }));
  } catch {
    // Ignora falhas de storage para não quebrar fluxo
  }
}

interface ClientGameState {
  room: Room | null;
  me: Player | null;
  myHand: DominoWithId[];
  gameState: GameState | null;
  isConnected: boolean;
  error: string | null;
}

function toClientGameState(serverGame: any, room: Room | null): GameState | null {
  if (!serverGame || !room) return null;

  // Se o servidor já enviou no formato do cliente, apenas normalize campos críticos.
  if (
    Array.isArray(serverGame.players) &&
    typeof serverGame.currentPlayerIndex === 'number' &&
    typeof serverGame.mode === 'string'
  ) {
    return {
      status:
        serverGame.status === 'finished'
          ? 'finished'
          : serverGame.status === 'playing'
            ? 'playing'
            : 'waiting',
      mode: serverGame.mode,
      board: Array.isArray(serverGame.board)
        ? serverGame.board.map((d: any) => ({ id: d.id, left: d.left, right: d.right }))
        : [],
      players: serverGame.players,
      currentPlayerIndex: serverGame.currentPlayerIndex,
      round: typeof serverGame.round === 'number' ? serverGame.round : 1,
      winner: serverGame.winner || null,
      winnerName: serverGame.winnerName || null,
      winType: serverGame.winType || null,
      stockCount: typeof serverGame.stockCount === 'number' ? serverGame.stockCount : 0,
    };
  }

  const roomPlayers = Array.isArray(room.players) ? room.players : [];
  const orderedPlayerIds = Array.isArray(serverGame.players) ? serverGame.players : [];

  const playersFromOrder = orderedPlayerIds
    .map((id: string) => roomPlayers.find((p) => p.id === id))
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      handCount: typeof p.handCount === 'number' ? p.handCount : 0,
      score: typeof p.score === 'number' ? p.score : 0,
      isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
      canPlay: p.id === serverGame.currentPlayer,
      position: p.position || 'bottom',
    }));

  const players = playersFromOrder.length > 0 ? playersFromOrder : roomPlayers;

  const currentPlayerIndex = Math.max(
    0,
    players.findIndex((p: any) => p.id === serverGame.currentPlayer)
  );

  const board = Array.isArray(serverGame.board)
    ? serverGame.board.map((d: any) => ({ id: d.id, left: d.left, right: d.right }))
    : [];

  return {
    status:
      serverGame.status === 'finished'
        ? 'finished'
        : serverGame.status === 'playing'
          ? 'playing'
          : 'waiting',
    mode: room.gameMode,
    board,
    players,
    currentPlayerIndex,
    round: typeof serverGame.round === 'number' ? serverGame.round : 1,
    winner: serverGame.winner || null,
    winnerName: serverGame.winnerName || null,
    winType: serverGame.winType || null,
    stockCount: typeof serverGame.stockCount === 'number' ? serverGame.stockCount : 0,
  };
}

export function useGameState() {
  const [state, setState] = useState<ClientGameState>(() => {
    const persisted = readPersistedState();
    return {
      room: persisted.room,
      me: persisted.me,
      myHand: [],
      gameState: null,
      isConnected: false,
      error: null,
    };
  });

  useEffect(() => {
    // Inicializar conexão se ainda não estiver conectada
    const socket = socketService.connect();

    const handleConnect = () => setState(s => ({ ...s, isConnected: true, error: null }));
    const handleDisconnect = () => setState(s => ({ ...s, isConnected: false }));
    const handleConnectError = () => setState(s => ({ ...s, error: 'Erro de conexão com o servidor' }));

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);

    // Se a conexão já existia
    if (socket.connected) {
      handleConnect();
    }

    // ==========================================
    // LISTENERS DE SALA
    // ==========================================
    socketService.on('room_created', (data: any) => {
      if (data.success) {
        const cache: RoomCache = {
          roomCode: data.room.code,
          playerId: data.player.id,
          playerName: data.player.name,
        };
        writeRoomCache(cache);
        persistState(data.room, data.player);

        setState(s => ({ ...s, room: data.room, me: data.player, error: null }));
      } else {
        setState(s => ({ ...s, error: data.error }));
      }
    });

    socketService.on('room_joined', (data: any) => {
      if (data.success) {
        const cache: RoomCache = {
          roomCode: data.room.code,
          playerId: data.player.id,
          playerName: data.player.name,
        };
        writeRoomCache(cache);
        persistState(data.room, data.player);

        setState(s => ({ ...s, room: data.room, me: data.player, error: null }));
      } else {
        setState(s => ({ ...s, error: data.error }));
      }
    });

    socketService.on('room_closed', (data: any) => {
      clearRoomCache();
      setState(s => ({
        ...s,
        room: null,
        me: null,
        myHand: [],
        gameState: null,
        error: data?.error || 'A sala foi encerrada pelo host.',
      }));
    });

    socketService.on('player_joined_notify', (data: any) => {
      // Outro player entrou, atualizar lista de jogadores da sala
      setState(s => {
        if (!s.room) return s;
        const nextRoom = {
          ...s.room,
          players: data.players || s.room.players
        };
        persistState(nextRoom as Room, s.me);
        return {
          ...s,
          room: nextRoom
        };
      });
    });

    socketService.on('player_left_notify', (data: any) => {
      setState(s => {
        if (!s.room) return s;
        const nextRoom = {
          ...s.room,
          players: data.players || s.room.players.filter(p => p.name !== data.playerName)
        };
        persistState(nextRoom as Room, s.me);
        return {
          ...s,
          room: nextRoom
        };
      });
    });

    socketService.on('player_ready_notify', (data: any) => {
      setState(s => {
        if (!s.room) return s;
        const updatedPlayers = s.room.players.map(p => 
          p.id === data.playerId ? { ...p, isReady: data.isReady } : p
        );
        const nextRoom = { ...s.room, players: updatedPlayers as any };
        persistState(nextRoom as Room, s.me);
        return {
          ...s,
          room: nextRoom
        };
      });
    });

    // ==========================================
    // LISTENERS DE JOGO
    // ==========================================
    socketService.on('game_started_notify', (data: any) => {
      setState((s) => {
        const nextRoom = s.room ? ({ ...s.room, status: 'playing' } as Room) : s.room;
        const normalized = toClientGameState(data.game, data.room || nextRoom);

        if (nextRoom) {
          persistState(nextRoom, s.me);
        }

        return {
          ...s,
          gameState: normalized,
          myHand: data.myHand || s.myHand,
          room: nextRoom,
        };
      });
    });

    // Eventos futuros a serem implementados do lado do servidor:
    // game_state_sync: Recebe o estado completo (mesa, de quem é a vez, mão atualizada)
    socketService.on('game_state_sync', (data: any) => {
      setState(s => ({
        ...s,
        gameState: toClientGameState(data.game || data.gameState, data.room || s.room),
        myHand: data.myHand || s.myHand
      }));
    });

    socketService.on('error', (data: any) => {
      setState(s => ({ ...s, error: data.message || 'Erro desconhecido' }));
    });

    socketService.on('start_game_error', (data: any) => {
      setState((s) => ({ ...s, error: data?.error || 'Não foi possível iniciar o jogo' }));
    });

    socketService.on('move_error', (data: any) => {
      setState((s) => ({ ...s, error: data?.error || 'Movimento inválido' }));
    });

    socketService.on('pass_turn_error', (data: any) => {
      setState((s) => ({ ...s, error: data?.error || 'Não foi possível passar a vez' }));
    });

    socketService.on('draw_piece_error', (data: any) => {
      setState((s) => ({ ...s, error: data?.error || 'Não foi possível comprar peça' }));
    });

    // ==========================================
    // LISTENER DE RE-SINCRONIZAÇÃO
    // ==========================================
    socketService.on('current_state', (data: any) => {
      if (data.success) {
        const cache: RoomCache = {
          roomCode: data.room.code,
          playerId: data.player.id,
          playerName: data.player.name,
        };
        writeRoomCache(cache);
        persistState(data.room, data.player);

        setState(s => ({
          ...s,
          room: data.room || null,
          me: data.player || null,
          gameState: toClientGameState(data.game, data.room || s.room),
          myHand: data.myHand || s.myHand,
          error: null,
        }));
      } else {
        setState(s => ({ ...s, error: data.error }));
      }
    });

    // ==========================================
    // AUTO-SYNC: aceitar /game/:roomCode e ?roomCode=
    // ==========================================
    const params = new URLSearchParams(window.location.search);
    const roomCodeFromQuery = params.get('roomCode');
    const match = window.location.pathname.match(/^\/game\/([^/]+)$/);
    const roomCodeFromPath = match?.[1] || null;
    const roomCodeFromUrl = roomCodeFromQuery || roomCodeFromPath;
    const cache = readRoomCache();
    const roomCode = roomCodeFromUrl || cache?.roomCode || null;

    let syncTimer: ReturnType<typeof setTimeout> | null = null;
    if (roomCode && !state.room && !state.me) {
      syncTimer = setTimeout(() => {
        socketService.emit('get_current_state', { roomCode, playerId: cache?.playerId });
        console.log(`AUTO-SYNC solicitando estado atual da sala: ${roomCode}`);
      }, 100);
    }

    return () => {
      // Limpar todos os eventos registrados por este hook
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('room_created');
      socketService.off('room_joined');
      socketService.off('player_joined_notify');
      socketService.off('player_left_notify');
      socketService.off('player_ready_notify');
      socketService.off('game_started_notify');
      socketService.off('game_state_sync');
      socketService.off('current_state');
      socketService.off('room_closed');
      socketService.off('error');
      socketService.off('start_game_error');
      socketService.off('move_error');
      socketService.off('pass_turn_error');
      socketService.off('draw_piece_error');
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
    };
  }, []);

  // ==========================================
  // ACTIONS
  // ==========================================
  const actions = {
    createRoom: (name: string, maxPlayers: number, gameMode: string, playerName: string, roomCode?: string) => {
      socketService.emit('create_room', { name, maxPlayers, gameMode, playerName, roomCode });
    },
    joinRoom: (roomCode: string, playerName: string) => {
      socketService.emit('join_room', { roomCode, playerName });
    },
    leaveRoom: () => {
      if (state.me && state.room) {
        socketService.emit('leave_room', { playerId: state.me.id, roomCode: state.room.code });
        clearRoomCache();
        setState(s => ({ ...s, room: null, me: null, gameState: null }));
      }
    },
    toggleReady: (isReady: boolean) => {
      if (state.me && state.room) {
        socketService.emit('player_ready', { playerId: state.me.id, roomCode: state.room.code, isReady });
      }
    },
    startGame: () => {
      if (state.room) {
        socketService.emit('start_game', { roomCode: state.room.code });
      }
    },
    playMove: (dominoId: string, side: 'left' | 'right') => {
      if (state.me && state.room) {
        socketService.emit('play_move', { roomCode: state.room.code, playerId: state.me.id, dominoId, side });
      }
    },
    drawPiece: () => {
      if (state.me && state.room) {
        socketService.emit('draw_piece', { roomCode: state.room.code, playerId: state.me.id });
      }
    },
    passTurn: () => {
      if (state.me && state.room) {
        socketService.emit('pass_turn', { roomCode: state.room.code, playerId: state.me.id });
      }
    },
    clearError: () => setState(s => ({ ...s, error: null }))
  };

  return { ...state, actions };
}
