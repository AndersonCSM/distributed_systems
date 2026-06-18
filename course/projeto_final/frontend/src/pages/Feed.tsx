import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ItemCard from '../components/ItemCard'

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

export default function Feed() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItens = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getItens()
      setItens(data)
    } catch (err: any) {
      if (err.message?.includes('inválido') || err.message?.includes('ausente')) {
        logout()
      } else {
        setError('Não foi possível carregar os itens.')
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => { fetchItens() }, [fetchItens])

  const handleDevolver = async (id: string) => {
    try {
      await api.devolverItem(id)
      setItens(prev => prev.map(i => i.id === id ? { ...i, status: 'devolvido' } : i))
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar como devolvido')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feed</h1>
          <p className="page-subtitle">Olá, {user?.nome?.split(' ')[0]} 👋</p>
        </div>
        <button id="btn-logout" className="btn btn-ghost btn-sm" onClick={logout}>Sair</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : itens.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>Nenhum item ainda</h3>
          <p>Seja o primeiro a cadastrar um item perdido!</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', marginTop: 8 }}
            onClick={() => navigate('/cadastrar')}>
            + Cadastrar Item
          </button>
        </div>
      ) : (
        <div id="items-list">
          {itens.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              currentUserId={user?.id ?? ''}
              currentUserRole={user?.role ?? 'user'}
              onDevolver={handleDevolver}
            />
          ))}
        </div>
      )}
    </div>
  )
}
