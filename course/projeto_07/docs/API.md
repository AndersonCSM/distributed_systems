# Documentação de API - Socket.IO e HTTP

## Endpoints HTTP

### Health Check
```
GET /health
Response: 200 OK
{
  "status": "ok",
  "timestamp": "2024-04-23T10:30:00.000Z"
}
```

## Socket.IO Events

### Connection
```
connect
```
Emitido quando cliente conecta ao servidor.

---

## Client → Server Events

### Criar Sala
**Event**: `create_room`

**Payload**:
```json
{
  "playerName": "João",
  "roomName": "Jogo com Amigos",
  "maxPlayers": 4,
  "gameMode": "classico"
}
```

**Response**: Emite `room_created` para o cliente

---

### Entrar na Sala
**Event**: `join_room`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "playerName": "Maria"
}
```

**Response**: Emite `joined_room` ou `error`

---

### Jogar Peça
**Event**: `play_move`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "playerId": "player_id_123",
  "domino": {
    "left": 3,
    "right": 5
  },
  "side": "left"
}
```

**Validações**:
- Deve ser turno do jogador
- Peça deve estar na mão do jogador
- Peça deve ser válida (um lado deve bater com board)

**Response**: Emite `move_played` para todos na sala ou `move_rejected`

---

### Passar Turno
**Event**: `pass_turn`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "playerId": "player_id_123"
}
```

**Response**: Emite `turn_passed` para todos

---

### Sair da Sala
**Event**: `leave_room`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "playerId": "player_id_123"
}
```

**Response**: Emite `player_left` para todos na sala

---

## Server → Client Events

### Sala Criada
**Event**: `room_created`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "roomName": "Jogo com Amigos",
  "maxPlayers": 4,
  "gameMode": "classico",
  "owner": "João",
  "players": [
    {
      "id": "player_1",
      "name": "João",
      "isReady": false,
      "position": "bottom"
    }
  ]
}
```

---

### Jogador Entrou
**Event**: `player_joined`

**Payload**:
```json
{
  "roomCode": "ABC123",
  "player": {
    "id": "player_2",
    "name": "Maria",
    "position": "left"
  },
  "totalPlayers": 2
}
```

---

### Estado do Jogo Atualizado
**Event**: `game_state_updated`

**Payload**:
```json
{
  "status": "in_progress",
  "board": [
    { "left": 6, "right": 4 },
    { "left": 4, "right": 2 }
  ],
  "players": [
    {
      "id": "player_1",
      "name": "João",
      "position": "bottom",
      "handCount": 6,
      "score": 0,
      "isActive": true,
      "canPlay": false
    },
    {
      "id": "player_2",
      "name": "Maria",
      "position": "left",
      "handCount": 7,
      "score": 0,
      "isActive": true,
      "canPlay": true
    }
  ],
  "currentPlayerIndex": 1,
  "round": 1
}
```

---

### Turno do Jogador
**Event**: `your_turn`

**Payload**:
```json
{
  "playerId": "player_1",
  "playerName": "João",
  "hand": [
    { "left": 1, "right": 2 },
    { "left": 2, "right": 5 },
    { "left": 3, "right": 4 }
  ],
  "validMoves": [
    {
      "domino": { "left": 2, "right": 5 },
      "sides": ["left", "right"]
    }
  ]
}
```

---

### Movimento Rejeitado
**Event**: `move_rejected`

**Payload**:
```json
{
  "reason": "Peça não é válida para este board",
  "validMoves": [
    {
      "domino": { "left": 2, "right": 5 },
      "sides": ["left"]
    }
  ]
}
```

---

### Erro
**Event**: `error`

**Payload**:
```json
{
  "code": "ROOM_NOT_FOUND",
  "message": "Sala não encontrada",
  "details": {}
}
```

---

## Errors

| Code | Message | Causa |
|------|---------|-------|
| `ROOM_NOT_FOUND` | Sala não encontrada | Código de sala inválido |
| `ROOM_FULL` | Sala cheia | Máximo de jogadores atingido |
| `INVALID_MOVE` | Movimento inválido | Peça não bate com board |
| `NOT_YOUR_TURN` | Não é seu turno | Tentou jogar fora de turno |
| `PLAYER_NOT_IN_ROOM` | Jogador não está na sala | Socket não está associado à sala |
| `INVALID_DOMINO` | Peça inválida | Peça não existe na mão |
| `GAME_NOT_STARTED` | Jogo não começou | Tentou jogar antes de começar |

---

## Fluxo Exemplo: Criar e Entrar na Sala

```
Jogador 1                          Servidor                          Jogador 2
    │                                 │                                 │
    │──── create_room ────────────────>│                                 │
    │                                 │                                 │
    │<─── room_created ────────────────│                                 │
    │                                 │                                 │
    │                              (mantém estado)                       │
    │                                 │                                 │
    │                                 │<──── join_room ────────────────┤
    │                                 │                                 │
    │<─── player_joined ───────────────│──── player_joined ────────────>│
    │                                 │                                 │
    │                                 │<── player_joined ─────────────┤
    │                                 │──── game_state_updated ──────>│
    │<─── game_state_updated ─────────│                                 │
    │                                 │                                 │
```

---

## Exemplo de Uso com Socket.IO Client

```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

// Criar sala
socket.emit('create_room', {
  playerName: 'João',
  roomName: 'Meu Jogo',
  maxPlayers: 4,
  gameMode: 'classico'
})

// Escutar confirmação
socket.on('room_created', (data) => {
  console.log('Sala criada:', data.roomCode)
})

// Jogar peça
socket.emit('play_move', {
  roomCode: 'ABC123',
  playerId: 'player_1',
  domino: { left: 3, right: 5 },
  side: 'left'
})

// Receber atualização
socket.on('game_state_updated', (state) => {
  console.log('Jogo atualizado:', state)
})
```
