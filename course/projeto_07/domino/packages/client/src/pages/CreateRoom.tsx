import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState'

export default function CreateRoom() {
  const navigate = useNavigate()
  const { room, error, actions } = useGameState()
  const { clearError } = actions
  
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('2')
  const [gameMode, setGameMode] = useState('classico')
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [clipboardFeedback, setClipboardFeedback] = useState('')
  const [pendingRoomCode, setPendingRoomCode] = useState('')

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
    setClipboardFeedback('')
  }

  const sanitizeRoomCode = (value: string) =>
    value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

  const handleCopyCode = async () => {
    if (!roomCode) return
    try {
      await navigator.clipboard.writeText(roomCode)
      setClipboardFeedback('Código copiado!')
    } catch {
      setClipboardFeedback('Não foi possível copiar automaticamente')
    }
  }

  // Ouve quando a sala for criada com sucesso
  useEffect(() => {
    if (room && isCreating && room.code === pendingRoomCode) {
      navigate(`/game/${room.code}`)
    }
  }, [room, isCreating, pendingRoomCode, navigate])

  useEffect(() => {
    if (error && isCreating) {
      setIsCreating(false)
    }
  }, [error, isCreating])

  const handleCreateRoom = () => {
    if (!playerName || !roomName || !roomCode) {
      return
    }
    
    setIsCreating(true)
    setPendingRoomCode(roomCode)
    clearError()
    actions.createRoom(roomName, parseInt(maxPlayers), gameMode, playerName, roomCode)
  }

  const isFormValid = playerName.trim() && roomName.trim() && roomCode

  return (
    <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ivory-50">
            Criar <span className="text-amber-400">Sala</span>
          </h1>
          <p className="text-ivory-100/50 mt-2">Configure sua partida de dominó</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="card space-y-5">
          {/* Player Name */}
          <div>
            <label htmlFor="input-player-name" className="label">
              Nome do Jogador
            </label>
            <input
              id="input-player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Seu nome"
              className="input-field"
              maxLength={20}
              disabled={isCreating}
            />
          </div>

          {/* Room Name */}
          <div>
            <label htmlFor="input-room-name" className="label">
              Nome da Sala
            </label>
            <input
              id="input-room-name"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Ex: Jogo com Amigos"
              className="input-field"
              maxLength={30}
              disabled={isCreating}
            />
          </div>

          {/* Players + Mode Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="select-max-players" className="label">
                Jogadores
              </label>
              <select
                id="select-max-players"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="select-field"
                disabled={isCreating}
              >
                <option value="2">2 Jogadores</option>
                <option value="3">3 Jogadores</option>
                <option value="4">4 Jogadores</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-game-mode" className="label">
                Modo de Jogo
              </label>
              <select
                id="select-game-mode"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="select-field"
                disabled={isCreating}
              >
                <option value="classico">Clássico</option>
                <option value="mexicano">Mexicano</option>
              </select>
            </div>
          </div>

          {/* Room Code */}
          <div>
            <label className="label">Código da Sala</label>
            <div className="flex gap-3">
              <input
                id="input-generated-room-code"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(sanitizeRoomCode(e.target.value))}
                placeholder="ABC123"
                className="input-field flex-1 font-mono text-center tracking-[0.3em] uppercase text-amber-400 font-bold"
                maxLength={6}
                disabled={isCreating}
              />
              <button
                id="btn-generate-code"
                type="button"
                onClick={generateRoomCode}
                className="btn-secondary whitespace-nowrap text-sm"
                disabled={isCreating}
              >
                🎲 Gerar
              </button>
              <button
                id="btn-copy-code"
                type="button"
                onClick={handleCopyCode}
                className="btn-secondary whitespace-nowrap text-sm"
                disabled={isCreating || !roomCode}
                title="Copiar código"
                aria-label="Copiar código"
              >
                📎
              </button>
            </div>
            {clipboardFeedback && (
              <p className="mt-2 text-xs text-ivory-100/60">{clipboardFeedback}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="btn-create-room"
            onClick={handleCreateRoom}
            disabled={!isFormValid || isCreating}
            className="btn-primary w-full text-lg mt-2 relative"
          >
            {isCreating ? 'Criando...' : 'Criar Sala'}
          </button>
        </div>

        {/* Back */}
        <button
          id="btn-back"
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-ivory-100/40 hover:text-ivory-100/70 transition-colors text-sm py-2"
          disabled={isCreating}
        >
          ← Voltar ao início
        </button>
      </div>
    </div>
  )
}
