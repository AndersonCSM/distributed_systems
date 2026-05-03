# Projeto 07 - Dominó Online - Arquitetura Completa

## 📋 Descrição

Projeto completo de aplicação web multiplayer para jogo de Dominó Online. Implementa uma arquitetura distribuída com backend em Node.js, frontend moderno, sistema de salas, matchmaking e persistência de dados, demonstrando conceitos avançados de desenvolvimento full-stack.

## 🎯 Objetivos

- Desenvolverapplicação web multiplayer funcional
- Implementar backend com Node.js e Express
- Criar frontend responsivo e interativo
- Configurar comunicação real-time (WebSockets)
- Implementar sistema de salas e lobbies
- Gerenciar estado de jogo distribuído
- Implementar persistência de dados
- Deploy em infraestrutura cloud
- Validar escalabilidade e performance

## 💻 Tecnologias & Ferramentas

- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Tailwind CSS
- **Real-time:** Socket.io (WebSockets)
- **Database:** MongoDB ou PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Build:** Vite, Webpack
- **Testing:** Jest, Supertest
- **DevOps:** Docker, Docker Compose
- **Cloud:** AWS EC2/ECS
- **Version Control:** Git

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│          Cliente (React + TypeScript)               │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │ Game UI                                     │   │
│  │ ├─ Board Display                            │   │
│  │ ├─ Player Status                            │   │
│  │ ├─ Chat                                     │   │
│  │ └─ Controls                                 │   │
│  └─────────────────────────────────────────────┘   │
│         ▲                                           │
│         │ Socket.io (WebSocket)                    │
│         │                                           │
└─────────┼───────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────┐
│         ▼                                           │
│  ┌─────────────────────────────────────────────┐   │
│  │   Backend (Node.js + Express)               │   │
│  │   ├─ Socket.io Server                       │   │
│  │   ├─ Game Logic Engine                      │   │
│  │   ├─ Room Manager                           │   │
│  │   ├─ Player Manager                         │   │
│  │   └─ Authentication                         │   │
│  └─────────────────────────────────────────────┘   │
│              │                 │                    │
│              ▼                 ▼                    │
│        ┌──────────────┐  ┌──────────────┐         │
│        │  Database    │  │  Redis Cache │         │
│        │  (MongoDB)   │  │  (Sessions)  │         │
│        └──────────────┘  └──────────────┘         │
│                                                    │
│  AWS Server                                        │
└────────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- MongoDB ou PostgreSQL instalado (ou Atlas/RDS)
- Git
- Docker (opcional, para containerização)

### Estrutura do Projeto

```
projeto_07/
├── projeto_01-domino/
│   ├── packages/
│   │   ├── client/              # Frontend React
│   │   │   ├── src/
│   │   │   ├── public/
│   │   │   ├── package.json
│   │   │   └── vite.config.ts
│   │   └── server/              # Backend Node.js
│   │       ├── src/
│   │       │   ├── controllers/
│   │       │   ├── models/
│   │       │   ├── routes/
│   │       │   ├── middleware/
│   │       │   ├── sockets/
│   │       │   └── index.ts
│   │       └── package.json
│   ├── package.json             # Monorepo root
│   ├── docker-compose.yml
│   └── docs/
│       ├── API.md
│       ├── ARCHITECTURE.md
│       └── SETUP.md
├── dominó/
└── [Outras pastas...]
```

### Instalação e Setup

#### 1. Clonar/Setup do Projeto

```bash
cd projeto_07/projeto_01-domino

# Instalar dependências (monorepo)
npm install

# Ou instalar por pacote
cd packages/server && npm install
cd ../client && npm install
```

#### 2. Configurar Variáveis de Ambiente

**packages/server/.env:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/domino
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-secret-muito-seguro
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173
```

**packages/client/.env:**
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

#### 3. Iniciar Serviços (Desenvolvimento)

**Terminal 1 - Backend:**
```bash
cd packages/server
npm run dev
# Rodará em http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd packages/client
npm run dev
# Rodará em http://localhost:5173
```

#### 4. Estrutura Backend (Express + Socket.io)

**packages/server/src/index.ts:**
```typescript
import express from 'express'
import { createServer } from 'http'
import { Server as IOServer } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Join room
  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId)
    io.to(roomId).emit('playerJoined', {
      playerId: socket.id,
      totalPlayers: io.sockets.adapter.rooms.get(roomId)?.size
    })
  })

  // Play move
  socket.on('playMove', (data: { roomId: string; move: any }) => {
    io.to(data.roomId).emit('moveReceived', {
      playerId: socket.id,
      move: data.move
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

#### 5. Estrutura Frontend (React + Socket.io Client)

**packages/client/src/hooks/useSocket.ts:**
```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => newSocket.close()
  }, [url])

  return { socket, isConnected }
}
```

#### 6. Build para Produção

```bash
# Build frontend
cd packages/client
npm run build

# Build backend
cd ../server
npm run build

# Gerar bundle completo
npm run build --workspaces
```

#### 7. Docker Compose (Opcional)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./packages/server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongodb:27017/domino
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./packages/client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

```bash
# Rodar com Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 🎮 Gameplay Features

### Regras do Dominó Implementadas

- [ ] Sistema de turnos
- [ ] Validação de peças
- [ ] Cálculo de pontos
- [ ] Fim de jogo
- [ ] Placar

### Funcionalidades Multiplayer

- [ ] Criação de salas
- [ ] Sistema de lobby
- [ ] Chat em tempo real
- [ ] Sincronização de estado
- [ ] Desconexão/Reconexão

## 📊 API Endpoints

```
GET  /api/health              - Health check
POST /api/auth/register       - Criar conta
POST /api/auth/login          - Login
GET  /api/rooms               - Listar salas
POST /api/rooms               - Criar sala
GET  /api/rooms/:id           - Detalhes da sala
POST /api/rooms/:id/join      - Entrar na sala
POST /api/rooms/:id/leave     - Sair da sala
```

## 📚 Documentação Detalhada

Veja pasta `docs/`:
- [API.md](docs/API.md) - Documentação de endpoints
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detalhes arquitetura
- [SETUP.md](docs/SETUP.md) - Guia completo de setup

## ✅ Checklist de Validação

- [ ] Backend rodando sem erros
- [ ] Frontend conecta ao backend
- [ ] Socket.io conexão estabelecida
- [ ] Pode criar sala
- [ ] Pode entrar em sala
- [ ] Pode jogar peça
- [ ] Placar atualiza
- [ ] Chat funciona
- [ ] Múltiplos players sincronizados
- [ ] Desconexão tratada corretamente
- [ ] Build de produção sem erros

## 🔧 Troubleshooting

**CORS Error ao conectar Socket**
- Verificar CORS_ORIGIN no backend
- Verificar VITE_WS_URL no frontend

**Banco de dados não conecta**
- Verificar DATABASE_URL
- Verificar se MongoDB está rodando: `mongosh`

## 👤 Autores

- ANDERSON CARLOS DA SILVA MORAIS
- CAIO FONTES SOARES
- JOÃO PEDRO FERNANDES DE AQUINO
- PEDRO HENRIQUE PEREIRA DE SOUSA 

## 📝 Notas Importantes

- Sempre validar movimentos no backend
- Implementar autenticação antes de produção
- Monitorar desempenho com múltiplos conexões
- Usar HTTPS/WSS em produção
- Implementar rate limiting
- Fazer backup de dados regularmente
