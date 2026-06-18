import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function CadastrarItem() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [local, setLocal] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nome.trim()) { setError('Nome do item é obrigatório'); return }
    setLoading(true)
    try {
      await api.postItem({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        local_encontrado: local.trim() || undefined,
        foto: foto.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/feed'), 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cadastrar Item</h1>
          <p className="page-subtitle">Reporte um item encontrado</p>
        </div>
        <button id="btn-back" className="btn btn-ghost btn-sm" onClick={() => navigate('/feed')}>
          ← Voltar
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✓ Item cadastrado! Redirecionando...</div>}

      <form id="form-cadastrar" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome do item *</label>
          <input
            id="input-nome"
            type="text"
            className="form-input"
            placeholder="Ex: Carteira preta, Óculos, Chave..."
            value={nome}
            onChange={e => setNome(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            id="input-descricao"
            className="form-input"
            placeholder="Descreva o item com mais detalhes..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Local encontrado</label>
          <input
            id="input-local"
            type="text"
            className="form-input"
            placeholder="Ex: Cantina, Biblioteca, Sala 103..."
            value={local}
            onChange={e => setLocal(e.target.value)}
            maxLength={300}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 28 }}>
          <label className="form-label">URL da Foto (opcional)</label>
          <input
            id="input-foto"
            type="url"
            className="form-input"
            placeholder="https://... (link de imagem)"
            value={foto}
            onChange={e => setFoto(e.target.value)}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Cole um link de imagem (Google Drive, Imgur, etc.)
          </span>
          {foto && (
            <img
              src={foto}
              alt="Preview"
              style={{ marginTop: 10, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>

        <button id="btn-cadastrar" type="submit" className="btn btn-primary" disabled={loading || success}>
          {loading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Salvando...
            </>
          ) : '+ Cadastrar Item'}
        </button>
      </form>
    </div>
  )
}
