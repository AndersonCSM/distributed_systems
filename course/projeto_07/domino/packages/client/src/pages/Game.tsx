import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Board from '@components/Board'
import Hand from '@components/Hand'
import PlayersList from '@components/PlayersList'
import GameControls from '@components/GameControls'
import DominoTileBack from '@components/DominoTileBack'
import { useGameState } from '../hooks/useGameState'
import { DominoWithId } from '../mocks/mockData'

function getPlayableDominoIds(hand: DominoWithId[], board: Array<{ left: number; right: number }>) {
  if (board.length === 0) {
    return hand.map((d) => d.id)
  }

  const leftEnd = board[0].left
  const rightEnd = board[board.length - 1].right

  return hand
    .filter((d) => d.left === leftEnd || d.right === leftEnd || d.left === rightEnd || d.right === rightEnd)
    .map((d) => d.id)
}

function getWinTypeLabel(winType: string | null | undefined): string {
  switch (winType) {
    case 'hand': return 'Bateu! (ficou sem peças)'
    case 'trancado': return 'Jogo trancado — menor pontuação vence!'
    case 'carroca': return 'Carroça! (5+ peças duplas)'
    default: return ''
  }
}

export default function Game() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, me, myHand, gameState, actions, error } = useGameState()

  const [selectedDomino, setSelectedDomino] = useState<DominoWithId | undefined>()

  if (!room || !me) {
    return (
      <div className="min-h-screen bg-wood-grain flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="card text-center space-y-4">
            <h2 className="text-xl text-red-400 font-bold">Erro de Conexão</h2>
            <p className="text-ivory-100">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary w-full">Voltar</button>
          </div>
        ) : (
          <div className="text-amber-400 font-mono animate-pulse">Conectando à sala {roomCode}...</div>
        )}
      </div>
    )
  }

  const handleSelectDomino = (domino: DominoWithId) => {
    if (selectedDomino?.id === domino.id) {
      setSelectedDomino(undefined)
    } else {
      setSelectedDomino(domino)
    }
  }

  // Se o gameState existir, usamos ele. Se não, usamos os dados da room para mostrar a mesa de espera.
  const roomPlayers = Array.isArray(room.players) ? room.players : []
  const players = gameState?.players || roomPlayers
  const currentPlayer = gameState ? players[gameState.currentPlayerIndex] : null
  const isMyTurn = currentPlayer?.id === me.id
  
  const otherPlayers = players.filter(p => p.id !== me.id)
  const topPlayer = otherPlayers[0]
  const leftPlayer = otherPlayers[1]
  const rightPlayer = otherPlayers[2]

  const renderOpponentHand = (count: number, orientation: 'horizontal' | 'vertical') => {
    return (
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-1 justify-center items-center`}>
        {Array.from({ length: count || 0 }).map((_, i) => (
          <div key={i} className={orientation === 'vertical' ? '-mt-6 first:mt-0' : '-ml-4 first:ml-0'}>
            <DominoTileBack orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'} size="sm" />
          </div>
        ))}
      </div>
    )
  }

  const playableIds = room.status === 'waiting'
    ? myHand.map((d) => d.id)
    : getPlayableDominoIds(myHand, (gameState?.board as Array<{ left: number; right: number }>) || [])
  const isOwner = room.owner === me.id

  // Lógica de compra obrigatória: jogador não tem jogada válida
  const hasValidMoves = playableIds.length > 0
  const stockHasPieces = (gameState?.stockCount ?? 0) > 0
  // Pode comprar: é sua vez, não tem jogada válida e o estoque tem peças
  const canDraw = isMyTurn && !hasValidMoves && stockHasPieces
  // Pode passar: é sua vez, não tem jogada válida e o estoque está vazio
  const canPass = isMyTurn && !hasValidMoves && !stockHasPieces
  // Pode jogar: é sua vez e tem jogada válida
  const canPlay = isMyTurn && hasValidMoves

  // Estado de vitória
  const isGameFinished = gameState?.status === 'finished'
  const winnerName = gameState?.winnerName
  const winType = gameState?.winType
  const isWinner = gameState?.winner === me.id

  // Verificar se todos os jogadores estão prontos
  const allReady = roomPlayers.length > 0 && roomPlayers.every(p => p.isReady === true)
  const canStartGame = isOwner && roomPlayers.length >= 2 && allReady
  const startRequestedRef = useRef(false)

  useEffect(() => {
    if (room.status !== 'waiting') {
      startRequestedRef.current = false
      return
    }

    if (canStartGame && !startRequestedRef.current) {
      startRequestedRef.current = true
      actions.startGame()
    }

    if (!allReady) {
      startRequestedRef.current = false
    }
  }, [room.status, canStartGame, allReady, actions])

  return (
    <div className="min-h-screen bg-wood-grain flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 z-10">
        <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg">
          <span className="text-ivory-100/60 text-sm mr-2 uppercase tracking-wider font-semibold">Sala:</span>
          <span className="text-amber-400 font-mono font-bold tracking-widest">{room.code}</span>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-felt-400 animate-pulse' : 'bg-wood-400'}`}></span>
            <span className="text-ivory-100 font-medium">
              {room.status === 'waiting' ? 'Aguardando Início' : `Vez de ${currentPlayer?.name || '...'}`}
            </span>
          </div>
          <button 
            onClick={() => actions.leaveRoom()} 
            className="px-4 py-2 rounded-full bg-wood-800/80 hover:bg-red-600/80 border border-wood-500/30 text-ivory-100 transition-colors text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Player Identity Balloon */}
      <div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
      >
        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 text-wood-900 px-5 py-3 rounded-2xl shadow-xl border-2 border-amber-300/60">
          {/* Speech bubble tail */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[10px]"
            style={{
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '12px solid #f59e0b',
            }}
          />
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-0.5">Jogador</div>
          <div className="text-base font-extrabold leading-tight">{me.name}</div>
        </div>
      </div>

      {/* Victory Modal */}
      {isGameFinished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-sm animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'][i % 6],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <div className="relative bg-gradient-to-b from-wood-700 to-wood-800 border-2 border-amber-400/50 rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl text-center space-y-5">
            {/* Trophy icon */}
            <div className="text-6xl animate-bounce">🏆</div>

            <h2 className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {isWinner ? 'Você Venceu!' : `${winnerName} Venceu!`}
            </h2>

            <p className="text-ivory-100/80 text-lg">{getWinTypeLabel(winType)}</p>

            {/* Scores */}
            <div className="bg-wood-900/50 rounded-xl p-4 space-y-2 border border-wood-500/20">
              <h3 className="text-xs uppercase tracking-widest text-ivory-100/50 font-bold mb-2">Pontuação Final</h3>
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center px-3 py-1.5 rounded-lg ${
                    p.id === gameState?.winner ? 'bg-amber-400/20 text-amber-400 font-bold' : 'text-ivory-100/70'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {p.id === gameState?.winner && <span>👑</span>}
                    {p.name}
                  </span>
                  <span>{p.score} pts</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn-primary w-full text-lg mt-4"
            >
              Voltar ao Lobby
            </button>
          </div>
        </div>
      )}

      {/* Forced draw alert */}
      {isMyTurn && !hasValidMoves && stockHasPieces && room.status !== 'waiting' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-amber-500/90 backdrop-blur-md text-wood-900 px-6 py-3 rounded-xl shadow-xl border border-amber-300/50 font-bold text-sm flex items-center gap-2">
            <span className="text-xl">🃏</span>
            Sem jogada válida! Compre uma peça do monte.
          </div>
        </div>
      )}

      {/* Must pass alert */}
      {isMyTurn && !hasValidMoves && !stockHasPieces && room.status !== 'waiting' && !isGameFinished && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-xl border border-red-300/50 font-bold text-sm flex items-center gap-2">
            <span className="text-xl">⛔</span>
            Sem jogada e sem peças no monte. Passe a vez!
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex gap-6 min-h-0 relative">
        <aside className="hidden lg:flex flex-col z-10 shrink-0">
          <h2 className="text-ivory-100/50 text-xs font-bold uppercase tracking-widest mb-3 pl-2">Jogadores</h2>
          <PlayersList players={players as any} currentPlayerIndex={gameState?.currentPlayerIndex || 0} />
        </aside>

        <main className="flex-1 flex flex-col relative min-w-0">
          {topPlayer && (
            <div className="absolute top-0 left-0 right-0 h-24 flex items-start justify-center z-20 pointer-events-none">
              <div className="bg-wood-800/60 px-6 pt-2 pb-6 rounded-b-2xl border-b border-x border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-col items-center">
                <span className="text-ivory-100/80 text-sm font-bold mb-2">
                  {topPlayer.name} {room.status === 'waiting' && (topPlayer.isReady ? '✅' : '⏳')}
                </span>
                {renderOpponentHand((topPlayer as any).handCount, 'horizontal')}
              </div>
            </div>
          )}

          {leftPlayer && (
            <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-start z-20 pointer-events-none">
              <div className="bg-wood-800/60 py-6 pl-2 pr-6 rounded-r-2xl border-r border-y border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-row items-center gap-2">
                {renderOpponentHand((leftPlayer as any).handCount, 'vertical')}
                <span className="text-ivory-100/80 text-sm font-bold writing-vertical-rl">
                  {room.status === 'waiting' && (leftPlayer.isReady ? '✅ ' : '⏳ ')}{leftPlayer.name}
                </span>
              </div>
            </div>
          )}

          {rightPlayer && (
            <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end z-20 pointer-events-none">
              <div className="bg-wood-800/60 py-6 pr-2 pl-6 rounded-l-2xl border-l border-y border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-row items-center gap-2">
                <span className="text-ivory-100/80 text-sm font-bold writing-vertical-rl">
                  {rightPlayer.name} {room.status === 'waiting' && (rightPlayer.isReady ? '✅' : '⏳')}
                </span>
                {renderOpponentHand((rightPlayer as any).handCount, 'vertical')}
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12 z-0">
            {room.status === 'waiting' ? (
              <div className="card text-center shadow-2xl border-2 border-felt-500/30 bg-wood-800/90 max-w-sm w-full z-30">
                <h2 className="text-2xl font-bold text-ivory-50 mb-2">Mesa Pronta</h2>
                <p className="text-ivory-100/70 mb-6">Convide jogadores usando o código: <strong className="text-amber-400">{room.code}</strong></p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => actions.toggleReady(!me.isReady)}
                    className={`btn-primary w-full ${me.isReady ? '!bg-wood-600 hover:!bg-wood-500 text-ivory-100' : ''}`}
                  >
                    {me.isReady ? 'Cancelar Pronto' : 'Estou Pronto!'}
                  </button>

                  {isOwner && (
                    <button 
                      onClick={() => actions.startGame()}
                        disabled={!canStartGame}
                        className={`btn-primary w-full !bg-felt-500 hover:!bg-felt-400 disabled:opacity-50 disabled:cursor-not-allowed ${!allReady ? 'relative group' : ''}`}
                        title={!allReady ? 'Aguarde todos os jogadores ficar prontos' : 'Iniciar partida'}
                    >
                        🎲 Iniciar Partida
                        {!allReady && <span className="hidden group-hover:inline text-xs ml-2">(Aguardando {roomPlayers.filter(p => !p.isReady).length})</span>}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <Board dominos={(gameState?.board as DominoWithId[]) || []} />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-20 pb-2">
            {room.status !== 'waiting' && (
              <GameControls
                canPlay={canPlay}
                canPass={canPass}
                canDraw={canDraw}
                selectedDomino={selectedDomino}
                onPlayLeft={() => { if(selectedDomino) { actions.playMove(selectedDomino.id, 'left'); setSelectedDomino(undefined) } }}
                onPlayRight={() => { if(selectedDomino) { actions.playMove(selectedDomino.id, 'right'); setSelectedDomino(undefined) } }}
                onPass={() => actions.passTurn()}
                onDraw={() => actions.drawPiece()}
              />
            )}
            
            <div className="mt-4">
              <Hand
                dominos={myHand}
                selectedId={selectedDomino?.id}
                playableDominoIds={playableIds}
                onSelect={handleSelectDomino}
                isCurrentPlayer={isMyTurn || room.status === 'waiting'}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
