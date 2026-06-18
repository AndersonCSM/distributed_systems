# 🎯 Fase 3: Gerenciamento de Salas - Documentação

## Visão Geral

A **Fase 3** implementa o gerenciamento completo de salas de jogo com suporte a distribuição através de **AWS SQS**. Permite que múltiplos jogadores criem, entrem e participem de salas de dominó em simultâneo.

## 📋 Requisitos Implementados

- ✅ **RoomService**: Criar, entrar, listar salas
- ✅ **Persistência em memória**: Salas e jogadores mantidos em Map
- ✅ **Broadcast de estado**: Notificações em tempo real via Socket.IO
- ✅ **Tratamento de desconexão**: Limpeza automática de recursos
- ✅ **AWS SQS Integration**: Sincronização distribuída (opcional)

## 🏗️ Arquitetura

### Componentes

#### 1. **RoomService** (`src/services/RoomService.ts`)

Gerencia o ciclo de vida das salas e jogadores:

```typescript
class RoomService {
  // Criar nova sala
  async createRoom(config: RoomConfig): Promise<Room>
  
  // Gerenciar entrada de jogadores
  async joinRoom(roomCode, playerName, socketId)
  
  // Gerenciar saída de jogadores
  async leaveRoom(playerId)
  
  // Operações de consulta
  getRoomInfo(roomCode)
  listRooms()
  
  // Controle de jogo
  async startGame(roomCode)
  async finishGame(roomCode, winnerId)
  async recordMove(roomCode, playerId, move)
}
```

**Características:**

- Usa `Map<string, Room>` para armazenar salas em memória
- Código de sala único: 4 letras maiúsculas (ex: `A3K7`)
- Nomes de jogadores prefixados: `lb-{playerName}` (ex: `lb-João`)
- Posicionamento automático de jogadores: `bottom`, `left`, `top`, `right`

#### 2. **SqsService** (`src/services/SqsService.ts`)

Interface com AWS SQS para sincronização distribuída:

```typescript
interface SqsMessage {
  type: 'room_created' | 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'move_played'
  roomCode: string
  timestamp: number
  data: Record<string, unknown>
}

class SqsService {
  async sendMessage(message: SqsMessage): Promise<string | null>
  async receiveMessages(maxMessages?: number): Promise<SqsMessage[]>
}
```

**Características:**

- Modo offline automático se AWS não estiver configurado
- Suporta diferentes tipos de eventos
- Inclui atributos de mensagem para filtragem

#### 3. **Room Handlers** (`src/handlers/roomHandlers.ts`)

Handlers de Socket.IO para gerenciamento de sala:

| Evento | Direção | Dados |
|--------|---------|-------|
| `create_room` | Cliente → Servidor | `{ name, maxPlayers, gameMode, playerName }` |
| `room_created` | Servidor → Cliente | `{ success, roomCode, room }` |
| `join_room` | Cliente → Servidor | `{ roomCode, playerName }` |
| `room_joined` | Servidor → Cliente | `{ success, player, room }` |
| `list_rooms` | Cliente → Servidor | - |
| `rooms_list` | Servidor → Cliente | `{ rooms, count }` |
| `get_room_info` | Cliente → Servidor | `{ roomCode }` |
| `room_info` | Servidor → Cliente | `{ success, room }` |
| `player_ready` | Cliente → Servidor | `{ playerId, roomCode, isReady }` |
| `start_game` | Cliente → Servidor | `{ roomCode }` |
| `game_started_notify` | Servidor → Sala | `{ success, room }` |

## 🔄 Fluxo de Uso

### Criar Sala

```
1. Cliente emite: create_room
   ↓
2. RoomService.createRoom()
   - Gera código único
   - Salva em memória
   - Envia mensagem SQS: 'room_created'
   ↓
3. Servidor retorna: room_created
   ├─ socketId: id da sala
   └─ room: dados da sala
```

### Entrar na Sala

```
1. Cliente emite: join_room
   ↓
2. RoomService.joinRoom()
   - Valida sala e limite de jogadores
   - Cria jogador com nome prefixado (lb-{nome})
   - Registra posição (bottom, left, top, right)
   - Envia mensagem SQS: 'player_joined'
   ↓
3. Servidor retorna: room_joined
   ├─ Ao cliente: { success, player, room }
   └─ À sala: player_joined_notify (notifica outros)
```

### Sair da Sala

```
1. Cliente emite: leave_room
   ↓
2. RoomService.leaveRoom()
   - Remove jogador da sala
   - Envia mensagem SQS: 'player_left'
   - Se sala vazia: deleta sala
   ↓
3. Servidor retorna: room_left
   └─ À sala (se não deletada): player_left_notify
```

## 🌐 Integração AWS SQS

### Configuração

Variáveis de ambiente necessárias (`.env`):

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<sua_chave>
AWS_SECRET_ACCESS_KEY=<sua_secret>
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/domino-queue
```

### Criação da Fila (AWS Console)

1. Acesse **AWS SQS**
2. Criar fila padrão: `domino-queue`
3. Copiar URL da fila
4. Adicionar ao `.env`

### Modo Offline

Se variáveis AWS não estiverem configuradas, o sistema funciona **100% em memória**:

```
✅ Sem mudança de código
✅ Sem AWS configurada = logs offline
✅ Perfeito para desenvolvimento local
⚠️ Perdidos ao reiniciar servidor (esperado)
```

## 💾 Estrutura de Dados

### Room

```typescript
interface Room {
  code: string                    // "A3K7"
  name: string                    // "Sala do João"
  owner: string                   // UUID
  maxPlayers: number              // 2, 3 ou 4
  players: Player[]               // [ { ... }, ... ]
  gameMode: 'classico' | 'mexicano'
  status: 'waiting' | 'in_progress' | 'finished'
  createdAt: number               // timestamp
  startedAt?: number
  finishedAt?: number
}
```

### Player

```typescript
interface Player {
  id: string                      // UUID
  name: string                    // "lb-João"
  socketId: string                // Socket.IO ID
  roomCode: string                // "A3K7"
  isReady: boolean
  isActive: boolean
  position: 'left' | 'top' | 'right' | 'bottom'
  hand: Domino[]                  // Peças na mão
  score: number
}
```

## 🎮 Exemplo de Uso (Cliente)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Criar sala
socket.emit('create_room', {
  name: 'Minha Sala',
  maxPlayers: 4,
  gameMode: 'classico',
  playerName: 'João',
});

socket.on('room_created', (data) => {
  console.log(`Sala criada: ${data.roomCode}`);
});

// Entrar em sala
socket.emit('join_room', {
  roomCode: 'A3K7',
  playerName: 'Maria',
});

socket.on('room_joined', (data) => {
  console.log('Entrou na sala:', data.room);
});

// Ouvir notificações
socket.on('player_joined_notify', (data) => {
  console.log(`${data.player.name} entrou na sala`);
});
```

## 🔍 Debug

### Endpoints HTTP

```bash
# Health check
curl http://localhost:3001/health

# Info do servidor
curl http://localhost:3001/info

# Listar filas SQS (se configuradas)
curl http://localhost:3001/debug/sqs-queues
```

### Logs do Servidor

```
✅ Sala criada: A3K7 (Minha Sala)
✅ Jogador lb-João entrou na sala A3K7
📤 Mensagem SQS enviada: player_joined (ID: xxx)
📨 Listadas 1 salas
```

## 📊 Métricas SQS

Cada mensagem em SQS inclui:

```json
{
  "type": "player_joined",
  "roomCode": "A3K7",
  "timestamp": 1698765432123,
  "data": {
    "playerId": "uuid-xxx",
    "playerName": "lb-João",
    "totalPlayers": 2
  }
}
```

Tipos de mensagens:
- `room_created` - Sala nova criada
- `player_joined` - Jogador entrou
- `player_left` - Jogador saiu
- `game_started` - Jogo iniciou
- `game_ended` - Jogo terminou
- `move_played` - Movimento registrado

## ✅ Checklist de Testes

- [ ] Criar sala (deve retornar código único)
- [ ] Entrar em sala (nome deve ter prefixo `lb-`)
- [ ] Sair de sala (deve notificar outros)
- [ ] Listar salas (deve mostrar apenas "waiting")
- [ ] Entrar em sala cheia (deve recusar)
- [ ] Entrar em jogo em progresso (deve recusar)
- [ ] Mensagens SQS sendo enviadas (verificar fila)
- [ ] Modo offline (sem AWS configurada)

## 🚀 Próximos Passos

**Fase 4: Backend - Socket.IO Handlers**
- Handlers: `play_move`, `pass_turn`, `draw_piece`
- Integração com GameService (Fase 2)

## 📚 Referências

- Socket.IO: https://socket.io/docs/v4/
- AWS SQS SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/
- Tipos TypeScript: `src/types/`
