import { PlayerPosition } from '../types/game';

interface PlayerProps {
  position: PlayerPosition
}

export default function Player({ position }: PlayerProps) {
  const positionName = {
    left: 'Esquerda',
    top: 'Topo',
    right: 'Direita',
    bottom: 'Base'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: '#f0f0f0',
      borderRadius: '8px',
      padding: '15px',
      border: '2px solid #ddd'
    }}>
      <h3>{positionName[position]}</h3>
      <div style={{
        marginTop: '10px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>Jogador: -</p>
        <p>Peças: 0</p>
        <p>Pontos: 0</p>
      </div>
    </div>
  )
}
