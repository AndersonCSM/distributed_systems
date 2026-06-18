# Frontend — Fases 5 + 6

## Goal

Construir as 4 páginas (Fase 5) e 5 componentes UI (Fase 6) do jogo de dominó com **Tailwind CSS**, tema visual **mesa de bar clássica** e peças de dominó em **SVG**. Tudo com mock data — integração Socket.IO na Fase 7.

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Estilização** | Tailwind CSS 3.3.6 | Já instalado, classes utilitárias |
| **Tema** | Mesa de bar clássica | Madeira, feltro verde, luz quente |
| **Peça de dominó** | SVG puro | Nítido, escalável, animável |
| **Dados** | Mock estático | Sem Socket.IO até Fase 7 |
| **Branch** | `main` | Integração na `fase_04` depois |

## Paleta de Cores (Mesa de Bar)

```
Feltro verde (mesa):   #1a5c2a / #2d7a3e
Madeira escura (fundo): #1c1410 / #2a1f17
Madeira média (cards):  #3d2b1f / #5c3d2e
Madeira clara (hover):  #8b6914 / #a67c00
Âmbar quente (accent):  #d4a03c / #e8b84a
Marfim (texto/peças):   #f5f0e1 / #faf6eb
Vermelho (erro/alerta): #c0392b
Verde sucesso:          #27ae60
```

## Tasks

- [ ] **Task 1: Setup Tailwind + Design System**
  - Adicionar `@tailwind base/components/utilities` no `index.css`
  - Estender `tailwind.config.js` com paleta mesa de bar (cores acima)
  - Adicionar font `Inter` via Google Fonts no `index.html`
  - Definir estilos base do body (fundo madeira escura)
  - → Verificar: `npm run dev` roda, fundo escuro aparece, Tailwind funciona com uma classe de teste

- [ ] **Task 2: Componente DominoTile.tsx (SVG)**
  - Criar `src/components/DominoTile.tsx`
  - Props: `left: number, right: number, isDouble?: boolean, isSelected?: boolean, isPlayable?: boolean, onClick?: () => void, orientation?: 'horizontal' | 'vertical'`
  - SVG com retângulo arredondado, linha divisória, pontos (dots) posicionados conforme valor 0-6
  - Cores: fundo marfim `#faf6eb`, pontos preto `#1c1410`, borda madeira
  - Estados visuais: selected (brilho âmbar), playable (borda verde), disabled (opacidade)
  - Suporte a orientação horizontal/vertical
  - Criar também `DominoTileBack.tsx` — costas da peça (para mãos de oponentes)
  - → Verificar: Renderizar `<DominoTile left={6} right={4} />` isolado — pontos aparecem corretos

- [ ] **Task 3: Página Home.tsx**
  - Redesign completo com Tailwind
  - Layout: logo/título centralizado "Dominó Online 🎲" em tipografia grande
  - Fundo: madeira escura com textura sutil (gradient)
  - Dois botões grandes tipo "card": "Criar Sala" e "Entrar na Sala"
  - Estilo: botões com bordas arredondadas, fundo âmbar, hover com brilho
  - Rodapé sutil com créditos dos autores
  - → Verificar: Abrir `/`, ver layout centralizado com tema mesa de bar, botões navegam para rotas corretas

- [ ] **Task 4: Página CreateRoom.tsx**
  - Redesign com Tailwind — card central em fundo madeira
  - Formulário estilizado: inputs com borda suave, labels claras
  - Campos: Nome do jogador, Nome da sala, Qtd jogadores (select estilizado), Modo de jogo (toggle/select)
  - Botão "Gerar Código" com feedback visual (código aparece animado)
  - Botão "Criar Sala" (âmbar/destaque) + "Voltar" (secundário)
  - Validação visual nos campos obrigatórios
  - Manter lógica existente (generateRoomCode, navigate)
  - → Verificar: Abrir `/create-room`, preencher formulário, gerar código, criar sala → navega para `/game/{code}`

- [ ] **Task 5: Página JoinRoom.tsx**
  - Redesign com Tailwind — mesmo padrão visual do CreateRoom
  - Card central: Nome do jogador + Código da sala (input uppercase, monospace)
  - Código com estilo "slot machine" ou letras separadas para dar personalidade
  - Botão "Entrar" + "Voltar"
  - Manter lógica existente
  - → Verificar: Abrir `/join-room`, preencher dados, entrar → navega para `/game/{code}`

- [ ] **Task 6: Componente Hand.tsx**
  - Criar `src/components/Hand.tsx`
  - Props: `dominos: Domino[], selectedId?: string, playableDominos?: string[], onSelect?: (domino) => void, isCurrentPlayer?: boolean`
  - Display: linha horizontal de `DominoTile` na base da tela (para o jogador local)
  - Peças clicáveis se `isCurrentPlayer`, com hover lift (translateY)
  - Peça selecionada: destaque âmbar, levemente acima das demais
  - Peças jogáveis: borda verde sutil
  - Dados mock: array de 7 dominós aleatórios
  - → Verificar: Renderizar Hand com 7 peças mock, clicar seleciona, hover anima

- [ ] **Task 7: Componente PlayersList.tsx**
  - Criar `src/components/PlayersList.tsx`
  - Props: `players: Player[], currentPlayerIndex: number`
  - Lista vertical de jogadores com: avatar placeholder (iniciais), nome, qtd peças na mão, pontuação
  - Jogador ativo: destaque com borda âmbar + ícone de "vez"
  - Dados mock: 4 jogadores com dados variados
  - → Verificar: Renderizar lista, jogador ativo visualmente distinto

- [ ] **Task 8: Componente GameControls.tsx**
  - Criar `src/components/GameControls.tsx`
  - Props: `canPlay: boolean, canPass: boolean, canDraw: boolean, selectedDomino?: Domino, onPlayLeft?: () => void, onPlayRight?: () => void, onPass?: () => void, onDraw?: () => void`
  - Layout: barra horizontal de ações
  - Botões: "Jogar ← Esquerda", "Jogar → Direita", "Passar", "Comprar"
  - Botões desabilitados quando ação não é permitida (opacidade)
  - Botão "Jogar" só ativo se há peça selecionada
  - → Verificar: Renderizar controles, botões refletem estado (enabled/disabled)

- [ ] **Task 9: Componente Board.tsx (Redesign)**
  - Redesign completo do Board existente
  - Props: `dominos: Domino[], leftEnd?: number, rightEnd?: number`
  - Fundo: feltro verde com borda arredondada (estilo mesa de sinuca)
  - Peças renderizadas horizontalmente em cadeia usando `DominoTile`
  - Scroll horizontal se muitas peças
  - Indicadores visuais das pontas (esquerda/direita) para onde jogar
  - Dados mock: board com 5-8 peças pré-jogadas
  - → Verificar: Board verde com peças SVG em cadeia, scroll se necessário

- [ ] **Task 10: Página Game.tsx (Assembly)**
  - Redesign completo — montagem final de todos componentes
  - Layout grid: Board central, Hand na base, PlayersList lateral, GameControls abaixo do Hand
  - Header: código da sala + indicador de turno
  - Oponentes: mostrar `DominoTileBack` (costas) para mãos dos outros jogadores
  - Posicionamento: jogadores topo/esquerda/direita com costas das peças visíveis
  - Jogador local: base com peças visíveis (Hand)
  - Tudo com mock data estático importado de um arquivo `mockData.ts`
  - Criar `src/mocks/mockData.ts` com dados de jogo realistas
  - → Verificar: Abrir `/game/ABC123`, ver layout completo com Board + Hand + Players + Controls, tudo visual

## Ordem de Execução

```
Task 1 (Tailwind) ──► Task 2 (DominoTile) ──► Task 3 (Home)
                                              Task 4 (CreateRoom)
                                              Task 5 (JoinRoom)
                                              
Task 2 (DominoTile) ──► Task 6 (Hand)
                        Task 9 (Board)

Task 6 + Task 7 + Task 8 + Task 9 ──► Task 10 (Game Assembly)
```

**Crítico**: Tasks 1 e 2 são bloqueantes. Tasks 3-5 são paralelas. Tasks 6-9 dependem da Task 2. Task 10 depende de todas.

## Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `src/styles/index.css` | ✏️ Modificar (adicionar Tailwind directives) |
| `tailwind.config.js` | ✏️ Modificar (paleta mesa de bar) |
| `index.html` | ✏️ Modificar (Google Fonts) |
| `src/components/DominoTile.tsx` | ➕ Criar |
| `src/components/DominoTileBack.tsx` | ➕ Criar |
| `src/components/Hand.tsx` | ➕ Criar |
| `src/components/PlayersList.tsx` | ➕ Criar |
| `src/components/GameControls.tsx` | ➕ Criar |
| `src/components/Board.tsx` | ✏️ Redesign |
| `src/components/Player.tsx` | 🗑️ Pode ser absorvido pelo PlayersList |
| `src/pages/Home.tsx` | ✏️ Redesign |
| `src/pages/CreateRoom.tsx` | ✏️ Redesign |
| `src/pages/JoinRoom.tsx` | ✏️ Redesign |
| `src/pages/Game.tsx` | ✏️ Redesign |
| `src/mocks/mockData.ts` | ➕ Criar |

## Done When

- [ ] `npm run dev` roda sem erros
- [ ] Todas as 4 rotas renderizam com tema mesa de bar
- [ ] Peças SVG aparecem corretas (pontos 0-6)
- [ ] Game.tsx mostra layout completo com Board + Hand + Players + Controls
- [ ] Tudo funcional com mock data (sem Socket.IO)
- [ ] Navegação entre páginas funciona
- [ ] Responsivo (desktop-first, mínimo 1024px)

## Notes

- **Não** criar `services/socketClient.ts` ainda — isso é Fase 7
- **Não** criar `hooks/useGameState.ts` ainda — isso é Fase 7
- O componente `Player.tsx` existente pode ser removido e substituído por `PlayersList.tsx`
- As peças SVG devem ser puras (sem imagens externas) para facilitar animações futuras
- Manter os `@types` path alias do Vite para imports limpos
