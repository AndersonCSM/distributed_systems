import type { Domino, Player, GameState } from '../types/game'

export interface DominoWithId extends Domino {
  id: string
}

export const mockPlayerHand: DominoWithId[] = [
  { id: 'd1', left: 6, right: 4 },
  { id: 'd2', left: 3, right: 3 },
  { id: 'd3', left: 5, right: 2 },
  { id: 'd4', left: 1, right: 6 },
  { id: 'd5', left: 0, right: 3 },
  { id: 'd6', left: 4, right: 4 },
  { id: 'd7', left: 2, right: 1 },
]

export const mockBoard: DominoWithId[] = [
  { id: 'b1', left: 6, right: 6 },
  { id: 'b2', left: 6, right: 3 },
  { id: 'b3', left: 3, right: 5 },
  { id: 'b4', left: 5, right: 5 },
  { id: 'b5', left: 5, right: 1 },
  { id: 'b6', left: 1, right: 4 },
]

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'João',
    position: 'bottom',
    handCount: 7,
    score: 0,
    isActive: true,
    canPlay: true,
  },
  {
    id: 'p2',
    name: 'Maria',
    position: 'left',
    handCount: 6,
    score: 0,
    isActive: true,
    canPlay: false,
  },
  {
    id: 'p3',
    name: 'Carlos',
    position: 'top',
    handCount: 5,
    score: 0,
    isActive: true,
    canPlay: false,
  },
  {
    id: 'p4',
    name: 'Ana',
    position: 'right',
    handCount: 7,
    score: 0,
    isActive: true,
    canPlay: false,
  },
]

export const mockGameState: GameState = {
  status: 'playing',
  mode: 'classico',
  board: mockBoard,
  players: mockPlayers,
  currentPlayerIndex: 0,
  round: 1,
}

export const mockPlayableDominoIds = ['d1', 'd4']
