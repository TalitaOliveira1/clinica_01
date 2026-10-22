import { query } from '../../config/database.js'
import { HttpError } from '../../utils/http-error.js'

const EDITABLE = ['full_name', 'specialty', 'crm', 'phone', 'email', 'active']

function toRecord(payload) {
  const data = {}
  for (const field of EDITABLE) {
    if (payload[field] === undefined) continue
    if (field === 'active') {
      data.active = payload[field] !== false && payload[field] !== 'false'
    } else {
      data[field] = payload[field] === '' ? null : payload[field]
    }
  }
  return data
}

export async function list() {
  const { rows } = await query(
    `SELECT id, full_name, specialty, crm, phone, email, active, created_at
       FROM doctors
      ORDER BY full_name`
  )
  return rows
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM doctors WHERE id = $1', [id])
  if (!rows[0]) throw new HttpError(404, 'Profissional não encontrado.')
  return rows[0]
}

export async function create(payload) {
  const data = toRecord(payload)
  if (!data.full_name) throw new HttpError(400, 'O nome do profissional é obrigatório.')
  if (!data.specialty) throw new HttpError(400, 'A especialidade é obrigatória.')
  if (!data.crm) throw new HttpError(400, 'O CRM é obrigatório.')

  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')

  const { rows } = await query(
    `INSERT INTO doctors (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return rows[0]
}

export async function update(id, payload) {
  await findById(id)

  const data = toRecord(payload)
  if (data.full_name === null) throw new HttpError(400, 'O nome do profissional é obrigatório.')

  const columns = Object.keys(data)
  if (!columns.length) return findById(id)

  const assignments = columns.map((column, index) => `${column} = $${index + 1}`).join(', ')
  const { rows } = await query(
    `UPDATE doctors SET ${assignments} WHERE id = $${columns.length + 1} RETURNING *`,
    [...Object.values(data), id]
  )
  return rows[0]
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM doctors WHERE id = $1', [id])
  if (!rowCount) throw new HttpError(404, 'Profissional não encontrado.')
}
