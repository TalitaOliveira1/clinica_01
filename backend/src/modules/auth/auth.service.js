import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../../config/database.js'
import { env } from '../../config/env.js'
import { HttpError } from '../../utils/http-error.js'

export async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, 'Informe e-mail e senha.')
  }

  const { rows } = await query(
    `SELECT id, name, email, role, password_hash FROM users WHERE lower(email) = lower($1)`,
    [email]
  )
  const user = rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'E-mail ou senha inválidos.')
  }

  const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export async function getProfile(id) {
  const { rows } = await query(`SELECT id, name, email, role FROM users WHERE id = $1`, [id])
  if (!rows[0]) throw new HttpError(404, 'Usuário não encontrado.')
  return rows[0]
}
