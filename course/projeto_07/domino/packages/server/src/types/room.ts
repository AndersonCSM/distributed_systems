import { GameMode, GameStatus } from './game.js';
import { Player } from './player.js';

export interface Room {
  code: string;
  name: string;
  owner: string;
  maxPlayers: number;
  players: Player[];
  gameMode: GameMode;
  status: GameStatus;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface RoomConfig {
  name: string;
  maxPlayers: 2 | 3 | 4;
  gameMode: GameMode;
  ownerName: string;
}

export interface RoomInfo {
  code: string;
  name: string;
  owner?: string;
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
  gameMode: GameMode;
  players: Array<{
    id: string;
    name: string;
    isReady: boolean;
    position?: Player['position'];
    score?: number;
    handCount?: number;
    isActive?: boolean;
    socketId?: string;
  }>;
}
