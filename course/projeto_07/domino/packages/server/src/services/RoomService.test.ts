import test from 'node:test';
import assert from 'node:assert/strict';
import { roomService } from './RoomService.js';

function uniqueCode(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 6)}`.toUpperCase().slice(0, 6);
}

test('createRoom should persist owner socketId', () => {
  const roomCode = uniqueCode('A');
  const ownerSocketId = `socket-owner-${Date.now()}`;

  const room = roomService.createRoom({
    code: roomCode,
    name: 'Sala Teste',
    maxPlayers: 2,
    gameMode: 'classico',
    ownerName: 'Host',
    ownerSocketId,
  });

  assert.equal(room.code, roomCode);
  assert.equal(room.players.length, 1);
  assert.equal(room.players[0].socketId, ownerSocketId);
  assert.equal(room.owner, room.players[0].id);
});

test('leaveRoom should destroy room when host leaves', () => {
  const roomCode = uniqueCode('B');
  const room = roomService.createRoom({
    code: roomCode,
    name: 'Sala Host Sai',
    maxPlayers: 3,
    gameMode: 'classico',
    ownerName: 'Host',
    ownerSocketId: `socket-host-${Date.now()}`,
  });

  const joinResult = roomService.joinRoom(roomCode, 'Jogador2', `socket-2-${Date.now()}`);
  assert.equal(joinResult.success, true);

  const result = roomService.leaveRoom(room.owner);

  assert.equal(result.success, true);
  assert.equal(result.roomDeleted, true);
  assert.equal(result.hostLeft, true);
  assert.equal(roomService.getRoom(roomCode), null);
  assert.equal(roomService.getPlayer(room.owner), null);
  assert.equal(roomService.getPlayer(joinResult.player!.id), null);
});

test('leaveBySocketId should remove non-host and keep room alive with updated players', () => {
  const roomCode = uniqueCode('C');
  const hostSocketId = `socket-host-${Date.now()}`;
  roomService.createRoom({
    code: roomCode,
    name: 'Sala Disconnect',
    maxPlayers: 3,
    gameMode: 'classico',
    ownerName: 'Host',
    ownerSocketId: hostSocketId,
  });

  const joinResult = roomService.joinRoom(roomCode, 'Jogador2', `socket-2-${Date.now()}`);
  assert.equal(joinResult.success, true);

  const disconnectedSocketId = joinResult.player!.socketId;
  const leaveBySocketResult = roomService.leaveBySocketId(disconnectedSocketId);

  assert.equal(leaveBySocketResult.success, true);
  assert.equal(leaveBySocketResult.roomDeleted, false);
  assert.equal(leaveBySocketResult.hostLeft, false);
  assert.equal(leaveBySocketResult.roomCode, roomCode);
  assert.ok(Array.isArray(leaveBySocketResult.players));
  assert.equal(leaveBySocketResult.players!.length, 1);
  assert.equal(leaveBySocketResult.players![0].name, 'Host');
});

test('leaveBySocketId should destroy room when last player disconnects', () => {
  const roomCode = uniqueCode('D');
  const hostSocketId = `socket-last-${Date.now()}`;
  roomService.createRoom({
    code: roomCode,
    name: 'Sala Vazia',
    maxPlayers: 2,
    gameMode: 'classico',
    ownerName: 'HostSolo',
    ownerSocketId: hostSocketId,
  });

  const result = roomService.leaveBySocketId(hostSocketId);

  assert.equal(result.success, true);
  assert.equal(result.roomDeleted, true);
  assert.equal(result.hostLeft, true);
  assert.equal(roomService.getRoom(roomCode), null);
});
