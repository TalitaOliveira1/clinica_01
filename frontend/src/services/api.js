const TOKEN_KEY = 'clinica.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function request(path, options = {}) {
  const headers = {}
  if (options.body) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (response.status === 401) {
    setToken(null)
    window.dispatchEvent(new Event('clinica:unauthorized'))
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Não foi possível concluir a operação.')
  }

  return data
}
