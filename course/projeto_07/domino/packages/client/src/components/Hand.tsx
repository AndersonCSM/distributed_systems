import DominoTile from './DominoTile'
import type { Domino } from '../types/game'

interface DominoWithId extends Domino {
  id: string
}

interface HandProps {
  dominos: DominoWithId[]
  selectedId?: string
  playableDominoIds?: string[]
  onSelect?: (domino: DominoWithId) => void
  isCurrentPlayer?: boolean
}

export default function Hand({
  dominos,
  selectedId,
  playableDominoIds = [],
  onSelect,
  isCurrentPlayer = true,
}: HandProps) {
  return (
    <div className="flex justify-center items-end h-[120px] pb-2">
      <div className="flex gap-2 p-4 bg-wood-800/80 rounded-2xl border border-wood-500/30 shadow-2xl backdrop-blur-sm">
        {dominos.map((domino) => {
          const isSelected = selectedId === domino.id
          const isPlayable = isCurrentPlayer && playableDominoIds.includes(domino.id)
          const isDisabled = !isCurrentPlayer || (!isPlayable && playableDominoIds.length > 0)

          return (
            <DominoTile
              key={domino.id}
              left={domino.left}
              right={domino.right}
              isSelected={isSelected}
              isPlayable={isPlayable}
              isDisabled={isDisabled}
              onClick={() => onSelect && onSelect(domino)}
              size="lg"
            />
          )
        })}

        {dominos.length === 0 && (
          <div className="text-ivory-100/30 text-sm italic py-8 px-4">
            Mão vazia
          </div>
        )}
      </div>
    </div>
  )
}
