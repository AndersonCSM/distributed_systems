interface Item {
  id: string
  nome: string
  descricao: string | null
  local_encontrado: string | null
  foto: string | null
  status: 'ativo' | 'devolvido'
  usuario_id: string
  autor: string
  criado_em: string
}

interface Props {
  item: Item
  currentUserId: string
  currentUserRole: string
  onDevolver: (id: string) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ItemCard({ item, currentUserId, currentUserRole, onDevolver }: Props) {
  const canDevolver =
    item.status === 'ativo' &&
    (item.usuario_id === currentUserId || currentUserRole === 'adm')

  return (
    <div className={`item-card ${item.status === 'devolvido' ? 'devolvido' : ''}`}
      style={{ opacity: item.status === 'devolvido' ? 0.65 : 1 }}>

      <div className="item-card-header">
        {item.foto ? (
          <img
            src={item.foto}
            alt={item.nome}
            className="item-photo"
            onError={e => {
              const el = e.currentTarget
              el.style.display = 'none'
              const ph = el.nextElementSibling as HTMLElement
              if (ph) ph.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="item-photo-placeholder" style={{ display: item.foto ? 'none' : 'flex' }}>
          📦
        </div>

        <div className="item-info">
          <div className="item-name">{item.nome}</div>
          {item.local_encontrado && (
            <div className="item-location">
              <svg viewBox="0 0 20 20" fill="currentColor" width={12} height={12}>
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {item.local_encontrado}
            </div>
          )}
        </div>

        <span className={`badge badge-${item.status}`}>
          {item.status === 'ativo' ? 'Ativo' : 'Devolvido'}
        </span>
      </div>

      {item.descricao && <p className="item-desc">{item.descricao}</p>}

      <div className="item-footer">
        <span className="item-author">por {item.autor} · {formatDate(item.criado_em)}</span>
        {canDevolver && (
          <button
            id={`btn-devolver-${item.id}`}
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (confirm(`Marcar "${item.nome}" como devolvido?`)) onDevolver(item.id)
            }}
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            ✓ Devolvido
          </button>
        )}
      </div>
    </div>
  )
}
