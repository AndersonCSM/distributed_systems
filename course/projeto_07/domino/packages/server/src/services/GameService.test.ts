import test from 'node:test';
import assert from 'node:assert/strict';
import { GameService } from './GameService.js';

const gameService = new GameService();

test('createGame should deal 7 pieces per player and set playing status', () => {
  const players = ['p1', 'p2', 'p3', 'p4'];
  const game = gameService.createGame('room-123', players);

  assert.equal(game.id, 'room-123');
  assert.equal(game.status, 'playing');
  assert.equal(game.players.length, 4);
  assert.equal(game.board.length, 0);

  for (const playerId of players) {
    const hand = game.hands.get(playerId);
    assert.ok(hand);
    assert.equal(hand!.length, 7);
  }

  assert.equal(game.stock.length, 28 - players.length * 7);
  assert.ok(players.includes(game.currentPlayer));
});

test('playMove should reject move from non-current player', () => {
  const game = gameService.createGame('room-abc', ['p1', 'p2']);
  const nonCurrentPlayer = game.currentPlayer === 'p1' ? 'p2' : 'p1';
  const hand = game.hands.get(nonCurrentPlayer)!;
  const anyDominoId = hand[0].id;

  const result = gameService.playMove(game, nonCurrentPlayer, anyDominoId, 'left');
  assert.equal(result, null);
});

test('playMove should accept first move from current player', () => {
  const game = gameService.createGame('room-first', ['p1', 'p2']);
  const current = game.currentPlayer;
  const hand = game.hands.get(current)!;
  const firstDomino = hand[0];

  const result = gameService.playMove(game, current, firstDomino.id, 'left');
  assert.ok(result);
  assert.equal(result!.board.length, 1);
  assert.equal(result!.board[0].id, firstDomino.id);
  assert.notEqual(result!.currentPlayer, current);
});

test('getValidMoves should return only dominos matching board ends', () => {
  const hand = [
    { id: 'a', left: 1, right: 5 },
    { id: 'b', left: 2, right: 3 },
    { id: 'c', left: 6, right: 1 },
  ];
  const board = [
    { id: 'x', left: 6, right: 6 },
    { id: 'y', left: 6, right: 4 },
  ];

  const valid = gameService.getValidMoves(hand, board);
  const ids = valid.map((d) => d.id).sort();

  assert.deepEqual(ids, ['c']);
});
