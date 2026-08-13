import type { Domino } from '../types/game'

interface GameControlsProps {
  canPlay: boolean
  canPass: boolean
  canDraw: boolean
  selectedDomino?: Domino
  onPlayLeft?: () => void
  onPlayRight?: () => void
  onPass?: () => void
  onDraw?: () => void
}

export default function GameControls({
  canPlay,
  canPass,
  canDraw,
  selectedDomino,
  onPlayLeft,
  onPlayRight,
  onPass,
  onDraw,
}: GameControlsProps) {
  return (
    <div className="flex gap-4 justify-center mt-6">
      <button
        onClick={onDraw}
        disabled={!canDraw}
        className={`btn-secondary min-w-[120px] flex items-center justify-center gap-2
                    ${canDraw ? 'shadow-glow-amber border-amber-400/50 animate-pulse ring-2 ring-amber-400/60' : ''}`}
      >
        <span>🃏</span> {canDraw ? 'Comprar (obrigatório)' : 'Comprar'}
      </button>

      <button
        onClick={onPass}
        disabled={!canPass}
        className="btn-danger min-w-[120px]"
      >
        Passar
      </button>

      <div className="flex bg-wood-800/80 rounded-lg p-1 gap-1 border border-wood-500/30">
        <button
          onClick={onPlayLeft}
          disabled={!canPlay || !selectedDomino}
          className="px-6 py-2 rounded font-semibold text-wood-900 bg-amber-400 
                     disabled:opacity-50 disabled:bg-wood-600 disabled:text-ivory-100/50
                     transition-colors hover:bg-amber-300 disabled:hover:bg-wood-600"
          title="Jogar na Esquerda"
        >
          ← Jogar
        </button>

        <button
          onClick={onPlayRight}
          disabled={!canPlay || !selectedDomino}
          className="px-6 py-2 rounded font-semibold text-wood-900 bg-amber-400 
                     disabled:opacity-50 disabled:bg-wood-600 disabled:text-ivory-100/50
                     transition-colors hover:bg-amber-300 disabled:hover:bg-wood-600"
          title="Jogar na Direita"
        >
          Jogar →
        </button>
      </div>
    </div>
  )
}
