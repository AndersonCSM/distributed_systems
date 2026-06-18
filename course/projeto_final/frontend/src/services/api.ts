const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const getToken = () => localStorage.getItem('token') ?? ''

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
})

async function handleResponse(res: Response) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

export const api = {
  login: (email: string, senha: string) =>
    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    }).then(handleResponse),

  getItens: () =>
    fetch(`${API}/itens`, { headers: authHeaders() }).then(handleResponse),

  postItem: (data: {
    nome: string
    descricao?: string
    local_encontrado?: string
    foto?: string
  }) =>
    fetch(`${API}/itens`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  devolverItem: (id: string) =>
    fetch(`${API}/itens/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handleResponse),
}
