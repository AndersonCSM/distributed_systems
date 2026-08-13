import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketClient';
import type { Room, Player, GameState } from '../types/game';
import { DominoWithId } from '../mocks/mockData';

interface ClientGameState {
  room: Room | null;
  me: Player | null;
  myHand: DominoWithId[];
  gameState: GameState | null;
  isConnected: boolean;
  error: string | null;
}

interface GameContextType extends ClientGameState {
  actions: {
    createRoom: (name: string, maxPlayers: number, gameMode: string, playerName: string, roomCode?: string) => void;
    joinRoom: (roomCode: string, playerName: string) => void;
    leaveRoom: () => void;
    toggleReady: (isReady: boolean) => void;
    startGame: () => void;
    playMove: (dominoId: string, side: 'left' | 'right') => void;
    drawPiece: () => void;
    passTurn: () => void;
    clearError: () => void;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClientGameState>({
    room: null,
    me: null,
    myHand: [],
    gameState: null,
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setState(s => ({ ...s, isConnected: true, error: null }));
    const handleDisconnect = () => setState(s => ({ ...s, isConnected: false }));
    const handleConnectError = () => setState(s => ({ ...s, error: 'Erro de conexão com o servidor' }));

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);

    if (socket.connected) {
      handleConnect();
    }

    // Handlers
    socketService.on('room_created', (data: any) => {
      if (data.success) {
        setState(s => ({ ...s, room: data.room, me: data.player, error: null }));
      } else {
        setState(s => ({ ...s, error: data.error }));
      }
    });

    socketService.on('room_joined', (data: any) => {
      if (data.success) {
        setState(s => ({ ...s, room: data.room, me: data.player, error: null }));
      } else {
        setState(s => ({ ...s, error: data.error }));
      }
    });

    socketService.on('player_joined_notify', (data: any) => {
      setState(s => {
        if (!s.room) return s;
        return {
          ...s,
          room: { ...s.room, players: data.players || s.room.players }
        };
      });
    });

    socketService.on('player_left_notify', (data: any) => {
      setState(s => {
        if (!s.room) return s;
        return {
          ...s,
          room: {
            ...s.room,
            players: data.players || s.room.players.filter(p => p.name !== data.playerName)
          }
        };
      });
    });

    socketService.on('player_ready_notify', (data: any) => {
      setState(s => {
        if (!s.room) return s;
        const updatedPlayers = s.room.players.map(p => 
          p.id === data.playerId ? { ...p, isReady: data.isReady } : p
        );
        return {
          ...s,
          room: { ...s.room, players: updatedPlayers as any }
        };
      });
    });

    socketService.on('game_started_notify', (data: any) => {
      setState(s => ({
        ...s,
        gameState: data.game || null,
        room: s.room ? { ...s.room, status: 'playing' as any } : null
      }));
    });

    socketService.on('game_state_sync', (data: any) => {
      setState(s => ({
        ...s,
        gameState: data.gameState,
        myHand: data.myHand || s.myHand
      }));
    });

    socketService.on('error', (data: any) => {
      setState(s => ({ ...s, error: data.message || 'Erro desconhecido' }));
    });

    return () => {
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
      socketService.off('error');
    };
  }, []);

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

  return (
    <GameContext.Provider value={{ ...state, actions }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameStateProvider');
  }
  return context;
};
