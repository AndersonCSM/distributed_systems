import { useNavigate } from 'react-router-dom'
import DominoTile from '@components/DominoTile'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-wood-grain flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative dominos */}
      <div className="absolute top-8 left-8 opacity-10 rotate-12">
        <DominoTile left={6} right={6} size="lg" />
      </div>
      <div className="absolute bottom-12 right-12 opacity-10 -rotate-45">
        <DominoTile left={3} right={5} size="lg" />
      </div>
      <div className="absolute top-1/4 right-16 opacity-5 rotate-[30deg]">
        <DominoTile left={4} right={2} size="lg" orientation="horizontal" />
      </div>

      {/* Main content */}
      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-ivory-50 mb-3 tracking-tight">
          Dominó
          <span className="text-amber-400"> Online</span>
        </h1>
        <p className="text-ivory-100/60 text-lg md:text-xl font-medium">
          Jogue com amigos em tempo real 🎲
        </p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col sm:flex-row gap-5 z-10 w-full max-w-md sm:max-w-lg">
        <button
          id="btn-create-room"
          onClick={() => navigate('/create-room')}
          className="group flex-1 card hover:border-amber-400/40 
                     transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-amber
                     text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="text-xl font-bold text-ivory-50 mb-1">Criar Sala</h2>
          <p className="text-sm text-ivory-100/50">
            Crie uma nova sala e convide amigos
          </p>
          <div className="mt-4 text-amber-400 text-sm font-semibold 
                          group-hover:translate-x-1 transition-transform duration-200">
            Começar →
          </div>
        </button>

        <button
          id="btn-join-room"
          onClick={() => navigate('/join-room')}
          className="group flex-1 card hover:border-felt-600/40 
                     transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-green
                     text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">🎮</div>
          <h2 className="text-xl font-bold text-ivory-50 mb-1">Entrar na Sala</h2>
          <p className="text-sm text-ivory-100/50">
            Entre com o código de uma sala existente
          </p>
          <div className="mt-4 text-felt-500 text-sm font-semibold 
                          group-hover:translate-x-1 transition-transform duration-200">
            Entrar →
          </div>
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-ivory-100/20 text-xs z-10">
        Anderson Carlos · Caio Fontes · Pedro Henrique
      </footer>
    </div>
  )
}
