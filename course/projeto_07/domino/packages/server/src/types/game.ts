export type GameMode = 'classico' | 'mexicano';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type MoveSide = 'left' | 'right';
export type WinType = 'hand' | 'trancado' | 'carroca' | null;

export interface Domino {
  id: string;
  left: number;
  right: number;
}

export interface GameState {
  id: string;
  players: string[];
  hands: Map<string, Domino[]>;
  board: Domino[];
  stock: Domino[];
  currentPlayer: string;
  status: GameStatus;
  passesInRow: number;
  winner: string | null;
  winType: WinType;
  scores: Map<string, number>;
}

export interface GameRound {
  playedBy: string;
  domino: Domino;
  timestamp: number;
}
