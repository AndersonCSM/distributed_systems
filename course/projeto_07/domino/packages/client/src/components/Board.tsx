import DominoTile from './DominoTile'
import type { Domino } from '../types/game'

interface DominoWithId extends Domino {
  id: string
}

interface BoardProps {
  dominos: DominoWithId[]
}

export default function Board({ dominos }: BoardProps) {
  return (
    <div className="w-full h-full flex items-center justify-center felt-surface relative overflow-hidden">
      
      {/* Decorative center logo/mark */}
      <div className="absolute opacity-10 pointer-events-none select-none">
        <div className="w-32 h-32 rounded-full border-4 border-wood-900 flex items-center justify-center">
          <span className="text-4xl">🎲</span>
        </div>
      </div>

      <div className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center justify-center p-8 custom-scrollbar">
        {dominos.length === 0 ? (
          <div className="text-ivory-100/40 text-lg font-medium bg-wood-900/30 px-6 py-3 rounded-full backdrop-blur-sm">
            Aguardando primeira jogada...
          </div>
        ) : (
          <div className="flex items-center gap-1 z-10 min-w-max px-8">
            {/* Left Play Indicator */}
            <div className="flex flex-col items-center justify-center mr-4 opacity-50">
              <span className="text-xs text-ivory-100 font-bold tracking-widest uppercase mb-1">Esq</span>
              <div className="w-1 h-8 bg-amber-400 rounded-full animate-pulse"></div>
            </div>

            {dominos.map((domino) => {
              // Alternate orientation for visual interest (basic representation)
              // Real domino layout logic can be complex (snake, turns), keeping it linear horizontal for now.
              return (
                <div key={domino.id} className="transform transition-transform">
                  <DominoTile
                    left={domino.left}
                    right={domino.right}
                    orientation="horizontal"
                    size="md"
                  />
                </div>
              )
            })}

            {/* Right Play Indicator */}
            <div className="flex flex-col items-center justify-center ml-4 opacity-50">
              <span className="text-xs text-ivory-100 font-bold tracking-widest uppercase mb-1">Dir</span>
              <div className="w-1 h-8 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scroll hints */}
      {dominos.length > 5 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-felt-700 to-transparent pointer-events-none z-20"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-felt-700 to-transparent pointer-events-none z-20"></div>
        </>
      )}
    </div>
  )
}
