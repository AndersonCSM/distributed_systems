# Arquitetura do Jogo de Dominó Online

## Visão Geral

Este é um jogo de dominó multiplayer em tempo real, construído com:
- **Backend**: Node.js + Express + TypeScript + Socket.IO
- **Frontend**: React + TypeScript + Vite + Socket.IO Client
- **Comunicação**: WebSocket (Socket.IO)
- **Persistência**: Em memória (MVP)
- **Containerização**: Docker + Docker Compose

## Arquitetura da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Navegador)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React App (TypeScript)                              │   │
│  │  ├── Pages: Home, CreateRoom, JoinRoom, Game         │   │
│  │  ├── Components: Board, Player, common               │   │
│  │  ├── Hooks: useGameState, useSocket                  │   │
│  │  └── Services: socketClient.ts                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────────────────────┘
                      │
                 WebSocket (Socket.IO)
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                   Servidor Node.js                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express + Socket.IO (TypeScript)                    │  │
│  │  ├── Routes: /health, /rooms, etc                    │  │
│  │  ├── Services: GameService, RoomService, etc         │  │
│  │  ├── Handlers: Socket.IO event handlers              │  │
│  │  ├── Types: Game, Player, Room                       │  │
│  │  └── Memory Store: Rooms & Games in-memory           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

```
projeto_01-domino/
├── packages/
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts                 # Entry point
│   │   │   ├── types/
│   │   │   │   ├── game.ts              # Tipos do jogo
│   │   │   │   ├── player.ts            # Tipos do jogador
│   │   │   │   └── room.ts              # Tipos da sala
│   │   │   ├── services/
│   │   │   │   ├── gameService.ts       # Lógica do jogo
│   │   │   │   ├── roomService.ts       # Gerenciamento de salas
│   │   │   │   └── matchmakingService.ts # Matchmaking
│   │   │   └── handlers/
│   │   │       └── socketHandlers.ts    # Socket.IO handlers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── dist/ (build output)
│   │
│   └── client/
│       ├── src/
│       │   ├── main.tsx                 # React entry
│       │   ├── App.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── CreateRoom.tsx
│       │   │   ├── JoinRoom.tsx
│       │   │   └── Game.tsx
│       │   ├── components/
│       │   │   ├── Board.tsx
│       │   │   ├── Player.tsx
│       │   │   └── common/
│       │   ├── services/
│       │   │   └── socketClient.ts
│       │   ├── hooks/
│       │   │   └── useGameState.ts
│       │   ├── styles/
│       │   │   └── index.css
│       │   ├── types/
│       │   │   └── game.ts
│       │   └── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── Dockerfile
│       ├── nginx.conf (produção)
│       └── dist/ (build output)
│
├── docs/
│   ├── ARCHITECTURE.md          # Este arquivo
│   ├── API.md                   # Documentação de API
│   └── SETUP.md                 # Instruções de setup
├── package.json (root)
├── docker-compose.yml
├── Dockerfile.prod
├── .gitignore
└── .github/
    └── CODEOWNERS
```

## Fluxo de Dados

### Criação de Sala
1. Usuário na tela CreateRoom preenche: nome, modo de jogo, quantidade de jogadores
2. Frontend gera código aleatório e emite evento Socket.IO `create_room`
3. Backend cria nova Room na memória
4. Backend emite confirmação e redirect para Game
5. Outros usuários podem entrar com código

### Entrada em Sala
1. Usuário na tela JoinRoom insere nome e código
2. Frontend emite evento Socket.IO `join_room`
3. Backend valida código e adiciona jogador à sala
4. Todos recebem atualização de participantes
5. Quando sala está cheia, pode começar jogo

### Gameplay
1. Jogador faz move: seleciona peça e clica jogar
2. Frontend emite `play_move` com domino selecionado
3. Backend valida movimento conforme regras
4. Se válido: atualiza board, passa turno
5. Se inválido: retorna erro
6. Todos recebem estado atualizado

## Divisão de Responsabilidades

### Backend (Node.js)
- ✅ Validação de movimentos conforme regras do dominó
- ✅ Gerenciamento de salas (criar, entrar, listar)
- ✅ Gerenciamento de turno e ordem dos jogadores
- ✅ Persistência em memória de estado das salas
- ✅ Broadcast de atualizações para todos clientes

### Frontend (React)
- ✅ Interface com 4 telas conforme specs
- ✅ Renderização do estado do jogo recebido
- ✅ Coleta de input do jogador
- ✅ Comunicação com servidor via Socket.IO
- ✅ Controle de roteamento entre telas

## Próximas Fases

1. **Fase 2**: Implementar services do backend (GameService, RoomService)
2. **Fase 3**: Setup de componentes base do frontend (Board, Player, Hooks)
3. **Fase 4**: Desenvolvimento paralelo das 4 telas
4. **Fase 5**: Integração Socket.IO completa
5. **Fase 6**: Deploy em Docker e AWS

## Stack Versões

- **Node.js**: 20 LTS (Alpine)
- **React**: 18.2.0
- **TypeScript**: 5.3.0
- **Express**: 4.18.2
- **Socket.IO**: 4.7.2
- **Vite**: 5.0.8
