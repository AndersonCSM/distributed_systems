export interface Player {
  id: string;
  name: string;
  socketId: string;
  roomCode: string;
  isReady: boolean;
  isActive: boolean;
  position: 'left' | 'top' | 'right' | 'bottom';
  hand: Array<{
    left: number;
    right: number;
  }>;
  score: number;
}

export interface PlayerMove {
  playerId: string;
  domino: {
    left: number;
    right: number;
  };
  side: 'left' | 'right';
  timestamp: number;
}

export interface PlayerStatus {
  playerId: string;
  playerName: string;
  handCount: number;
  score: number;
  isActive: boolean;
  canPlay: boolean;
}
