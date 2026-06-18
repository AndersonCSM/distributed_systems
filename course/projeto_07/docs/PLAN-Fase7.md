# Plano de Implementação: Fase 7 (Integração Socket.IO)

## Objetivo
Integrar o Frontend Estático (Fases 5 e 6) com o Backend de Handlers (Fase 4), substituindo os mocks por comunicação em tempo real via Socket.IO.

## Escopo (De acordo com o README)
- [ ] Conectar eventos Socket.IO com handlers do servidor
- [ ] Sincronizar estado do jogo em tempo real
- [ ] Tratamento de erros e validação do lado do cliente
- [ ] Feedback visual (animações, notificações)

## Tarefas a Executar (Phase 2 - Implementação em Paralelo)

### Camada 1: Fundação do Client (Frontend)
1. **Instalar dependência**: `npm install socket.io-client` no `packages/client`.
2. **Criar `src/services/socketClient.ts`**:
   - Inicializar e exportar o singleton do `socket.io-client`.
   - Lidar com reconexão automática e debug logs.
3. **Criar Hook `src/hooks/useGameState.ts`**:
   - Manter o estado global sincronizado ouvindo os eventos: `room_created`, `room_joined`, `game_started_notify`, `player_joined_notify` e atualizações do board.

### Camada 2: Integração nas Telas (Frontend + Backend)
4. **Atualizar `CreateRoom.tsx` e `JoinRoom.tsx`**:
   - Substituir os `console.log` existentes pelos disparos de evento: `socket.emit('create_room', ...)` e `socket.emit('join_room', ...)`.
   - Navegar para a tela do jogo apenas no recebimento da resposta `success: true`.
5. **Atualizar `Game.tsx` e `GameControls.tsx`**:
   - Ligar os botões aos eventos `play_move`, `pass_turn` e `draw_piece`.
   - Adicionar botão de `start_game` para o owner da sala quando todos estiverem prontos.

### Camada 3: Validação e Feedback
6. **Polimento Visual**:
   - Adicionar toasts (avisos de "Fulano entrou", "Vez de Ciclano").
   - Tratar erros de conexão do lado do cliente (ex: "Sala não encontrada").
7. **Verificações Finais**:
   - Garantir que não há leaks de listeners do Socket (usar _cleanup_ no `useEffect`).

## Agentes Designados
- Implementação Frontend/Hooks: `@frontend-specialist`
- Verificação de Eventos/Backend: `@backend-specialist`
- Quality Assurance: `@test-engineer`
