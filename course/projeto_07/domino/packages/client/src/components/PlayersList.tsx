import type { Player } from '../types/game'

interface PlayersListProps {
  players: Player[]
  currentPlayerIndex: number
}

export default function PlayersList({ players, currentPlayerIndex }: PlayersListProps) {
  const shortId = (id: string) => id.slice(-6)

  return (
    <div className="flex flex-col gap-3 w-[200px]">
      {players.map((player, index) => {
        const isCurrentTurn = index === currentPlayerIndex

        return (
          <div
            key={player.id}
            className={`
              p-3 rounded-xl border flex items-center gap-3 transition-all duration-300
              ${
                isCurrentTurn
                  ? 'bg-wood-700 border-amber-400/50 shadow-glow-amber'
                  : 'bg-wood-800/60 border-wood-500/20'
              }
              ${!player.isActive ? 'opacity-50' : ''}
            `}
          >
            {/* Avatar placeholder */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${isCurrentTurn ? 'bg-amber-400 text-wood-900' : 'bg-wood-600 text-ivory-100'}
              `}
            >
              {player.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ivory-50 truncate" title={player.name}>
                  {player.name}
                </span>
                <span className="text-[10px] font-mono text-ivory-100/40" title={player.id}>
                  #{shortId(player.id)}
                </span>
                {isCurrentTurn && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </div>
              
              <div className="flex gap-3 text-xs text-ivory-100/60 mt-1">
                <span className="flex items-center gap-1" title="Peças na mão">
                  🀄 {player.handCount}
                </span>
                <span className="flex items-center gap-1" title="Pontos">
                  ⭐ {player.score}
                </span>
                <span
                  className={`flex items-center gap-1 ${player.isReady ? 'text-felt-300' : 'text-amber-300/80'}`}
                  title={player.isReady ? 'Pronto para jogar' : 'Aguardando pronto'}
                >
                  {player.isReady ? '✅' : '⏳'}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
