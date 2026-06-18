import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !senha) { setError('Preencha email e senha'); return }
    setLoading(true)
    try {
      const data = await api.login(email, senha)
      login(data.token, data.usuario)
    } catch (err: any) {
      setError(err.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <img src="/icon-192.png" alt="Logo" className="login-logo" />
      <h1 className="login-title">Achados e Perdidos</h1>
      <p className="login-subtitle">Campus UFERSA</p>

      <div className="login-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button id="btn-login" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
