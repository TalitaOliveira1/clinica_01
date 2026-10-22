import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from '../utils/http-error.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next(new HttpError(401, 'Sessão não encontrada. Faça login novamente.'))
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret)
    next()
  } catch {
    next(new HttpError(401, 'Sessão expirada. Faça login novamente.'))
  }
}
