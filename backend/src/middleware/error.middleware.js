export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso não encontrado.' })
}

export function errorHandler(error, req, res, next) {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Já existe um cadastro com esses dados (CPF, CRM ou e-mail).' })
  }
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Paciente ou profissional inválido.' })
  }
  if (error.code === '22P02') {
    return res.status(400).json({ error: 'Identificador ou data inválida.' })
  }

  const status = error.status || 500
  if (status >= 500) console.error(error)

  res.status(status).json({
    error: status >= 500 ? 'Erro interno no servidor.' : error.message,
  })
}
