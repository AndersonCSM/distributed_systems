# PLAN-debug-fase7.md

## 1. Análise de Impacto
Os bugs atuais impedem o fluxo principal do jogo (Happy Path). O problema principal é a perda de referência do jogador após a navegação e a volatilidade do servidor em desenvolvimento.

## 2. Tarefas de Correção

### Fase 1: Estabilização de Tipos e Ambiente
- [x] Corrigir `tsconfig.json` (Remover chaves duplicadas e garantir `@types/node`).
- [ ] Unificar ENUMs de `Status` (usar `playing` em ambos os lados ou `in_progress`).
- [ ] Adicionar Logs de Auditoria no Servidor para cada evento recebido/enviado.

### Fase 2: Persistência e Sincronização
- [ ] **Mecanismo de Re-Sync**: Implementar um evento `get_current_state` no servidor.
- [ ] No `useEffect` do `useGameState`, se houver um `roomCode` na URL mas o estado estiver vazio, disparar automaticamente o pedido de sincronização para o servidor.
- [ ] O servidor deve responder com os dados da sala e do jogador baseando-se no `socket.id` atual.

### Fase 3: UX e Fluxo
- [x] Re-ativar o botão "Gerar Código" (🎲) em `CreateRoom.tsx`.
- [ ] Garantir que o botão "Iniciar Partida" só apareça/habilite quando `allReady` for verdadeiro.
- [x] Remover tela de Lobby isolada e usar Overlay sobre o tabuleiro.

## 3. Verificação (Checklist)
- [ ] Criar sala -> Navegar -> Ver mesa (sem travar em "Conectando").
- [ ] Entrar em aba anônima -> Ver jogador aparecendo em tempo real.
- [ ] Ambos prontos -> Dono inicia -> Jogo começa para ambos.

## 4. Agentes
- `@backend-specialist`: Ajustar handlers de re-sincronização.
- `@frontend-specialist`: Implementar lógica de auto-sync no hook e UI do Board.
- `@debugger`: Validar fluxo de eventos no terminal.
