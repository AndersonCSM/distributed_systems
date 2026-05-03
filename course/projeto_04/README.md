# Projeto 04 - Jogo com IA (React + TypeScript + Tailwind)

## 📋 Descrição

Desenvolvimento de um jogo interativo com suporte a inteligência artificial utilizando React, TypeScript e Tailwind CSS. Projeto prático que integra componentes modernos de frontend, lógica de jogabilidade e algoritmos de IA para criar uma experiência interativa e responsiva.

## 🎯 Objetivos

- Desenvolver aplicação interativa com React 18+
- Utilizar TypeScript para type safety
- Implementar interface com Tailwind CSS (utility-first)
- Criar lógica de jogo funcional e escalável
- Integrar algoritmo de IA para comportamento inteligente
- Validar performance e responsividade
- Publicar em produção com Vite

## 💻 Tecnologias & Ferramentas

- **Framework:** React 18+
- **Linguagem:** TypeScript 5+
- **Styling:** Tailwind CSS 3+
- **Build Tool:** Vite 5+
- **Node.js:** 16+ (npm/pnpm)
- **Package Manager:** npm ou pnpm
- **Linting:** ESLint (opcional)

## 🎮 Tipos de Jogos Suportados

- Tetris
- Snake
- Tic-Tac-Toe
- 2048
- Memory Game
- Quiz Game
- Flappy Bird
- Pong
- Chess (simplificado)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│     Aplicação React + TypeScript            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  App.tsx (Principal)                │   │
│  │  ├─ GameBoard Component             │   │
│  │  ├─ ScoreDisplay Component          │   │
│  │  ├─ ControlsComponent               │   │
│  │  └─ AIComponent                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Game Logic (hooks, utils)          │   │
│  │  ├─ useGameState                    │   │
│  │  ├─ AIAlgorithm                     │   │
│  │  ├─ GameRules                       │   │
│  │  └─ Validators                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Styling (Tailwind)                 │   │
│  │  ├─ Responsive Design               │   │
│  │  ├─ Dark/Light Mode                 │   │
│  │  └─ Animations                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+ instalado
- npm ou pnpm instalado
- Editor (VS Code recomendado)
- Git (opcional)

### Instalação e Setup

#### 1. Criar Novo Projeto com Vite

```bash
# Criar projeto
npm create vite@latest meu-jogo -- --template react
cd meu-jogo

# Instalar dependências
npm install

# Adicionar TypeScript (se não incluído)
npm install --save-dev typescript @types/react @types/react-dom
```

#### 2. Instalar Tailwind CSS

```bash
# Instalar Tailwind
npm install -D tailwindcss postcss autoprefixer

# Inicializar configuração
npx tailwindcss init -p

# Configurar template paths em tailwind.config.js
```

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 3. Estrutura do Projeto

```
src/
├── components/
│   ├── GameBoard.tsx
│   ├── ScoreDisplay.tsx
│   ├── Controls.tsx
│   └── AIComponent.tsx
├── hooks/
│   ├── useGameState.ts
│   └── useAI.ts
├── utils/
│   ├── gameRules.ts
│   ├── validators.ts
│   └── aiAlgorithm.ts
├── types/
│   └── game.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

#### 4. Exemplo: App.tsx (Estrutura Base)

```typescript
import React, { useState, useCallback } from 'react'
import GameBoard from './components/GameBoard'
import ScoreDisplay from './components/ScoreDisplay'
import Controls from './components/Controls'
import './App.css'

interface GameState {
  score: number
  gameOver: boolean
  board: number[][]
  level: number
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameOver: false,
    board: Array(20).fill(0).map(() => Array(10).fill(0)),
    level: 1
  })

  const handleMove = useCallback((direction: 'left' | 'right' | 'down' | 'rotate') => {
    // Lógica de movimento
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      gameOver: false,
      board: Array(20).fill(0).map(() => Array(10).fill(0)),
      level: 1
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          🎮 Jogo com IA
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ScoreDisplay 
              score={gameState.score}
              level={gameState.level}
            />
          </div>
          
          <div className="md:col-span-1">
            <GameBoard board={gameState.board} />
          </div>
          
          <div className="md:col-span-1">
            <Controls 
              onMove={handleMove}
              onReset={resetGame}
              gameOver={gameState.gameOver}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5. Executar Desenvolvimento

```bash
# Iniciar servidor dev
npm run dev

# Abrirá em http://localhost:5173
# Hot Reload ativado - alterações refletem instantly
```

#### 6. Build para Produção

```bash
# Gerar build otimizado
npm run build

# Visualizar resultado localmente
npm run preview

# Arquivos finais em /dist
```

## 🤖 Implementação de IA

### Algoritmos Comuns

**Minimax (para Tic-Tac-Toe, Chess):**
```typescript
function minimax(board: number[][], depth: number, isMaximizing: boolean): number {
  const score = evaluateBoard(board)
  
  if (depth === 0 || isGameOver(board)) return score
  
  if (isMaximizing) {
    let best = -Infinity
    for (let move of getAvailableMoves(board)) {
      const newBoard = makeMove(board, move)
      best = Math.max(best, minimax(newBoard, depth - 1, false))
    }
    return best
  } else {
    let best = Infinity
    for (let move of getAvailableMoves(board)) {
      const newBoard = makeMove(board, move)
      best = Math.min(best, minimax(newBoard, depth - 1, true))
    }
    return best
  }
}
```

**Greedy Algorithm (para Snake, 2048):**
```typescript
function getAIMove(board: GameBoard): Move {
  const possibleMoves = getPossibleMoves(board)
  
  return possibleMoves.reduce((best, move) => {
    const score = evaluateMove(board, move)
    return score > evaluateMove(board, best) ? move : best
  })
}
```

## 📊 TypeScript Types Essenciais

```typescript
// src/types/game.ts

export type GameDifficulty = 'easy' | 'medium' | 'hard'
export type Direction = 'up' | 'down' | 'left' | 'right'

export interface GameState {
  score: number
  gameOver: boolean
  paused: boolean
  level: number
  board: number[][]
}

export interface GameConfig {
  width: number
  height: number
  difficulty: GameDifficulty
  aiEnabled: boolean
}

export interface Move {
  direction: Direction
  score: number
}
```

## 🎨 Tailwind CSS Patterns

```tsx
// Responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark Mode
<div className="dark:bg-slate-900 dark:text-white">

// Animações
<div className="animate-pulse">
<div className="transition-all duration-300 ease-in-out">

// Espaçamento
<div className="p-4 md:p-8 space-y-2">

// Cores e Estilos
<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
```

## 📚 Documentação e Referências

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## ✅ Checklist de Entrega

- [ ] Projeto criado com Vite
- [ ] React + TypeScript configurado
- [ ] Tailwind CSS instalado e funcionando
- [ ] Estrutura de componentes criada
- [ ] Lógica de jogo implementada
- [ ] IA integrada e testada
- [ ] Interface responsiva
- [ ] Build sem erros
- [ ] Jogo funcional e jogável
- [ ] Performance otimizada

## 🔧 Troubleshooting

**Erro: TypeScript não reconhece tipos**
```bash
# Reinstalar tipos
npm install --save-dev @types/react @types/react-dom
```

**Tailwind não aplica estilos**
```bash
# Verificar tailwind.config.js content paths
# Verificar se @tailwind está em index.css
npx tailwindcss build
```

## 👤 Autor

Anderson Carlos da Silva Morais - 2024011327

## 📝 Notas Importantes

- Manter lógica de IA separada dos componentes React
- Usar hooks customizados para gerenciar estado do jogo
- Testar IA com diferentes níveis de dificuldade
- Otimizar performance com useMemo/useCallback
- Responsividade é essencial - testar em mobile
- Considerar PWA para instalação offline
