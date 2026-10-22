import { query } from '../../config/database.js'
import { HttpError } from '../../utils/http-error.js'

const EDITABLE = ['full_name', 'cpf', 'birth_date', 'phone', 'email', 'address', 'notes']

function toRecord(payload) {
  const data = {}
  for (const field of EDITABLE) {
    if (payload[field] === undefined) continue
    data[field] = payload[field] === '' ? null : payload[field]
  }
  return data
}

export async function list({ search } = {}) {
  const term = (search || '').trim()
  const { rows } = await query(
    `SELECT id, full_name, cpf, birth_date, phone, email, created_at
       FROM patients
      WHERE $1 = ''
         OR full_name ILIKE '%' || $1 || '%'
         OR cpf ILIKE '%' || $1 || '%'
         OR phone ILIKE '%' || $1 || '%'
      ORDER BY full_name`,
    [term]
  )
  return rows
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM patients WHERE id = $1', [id])
  if (!rows[0]) throw new HttpError(404, 'Paciente não encontrado.')
  return rows[0]
}

export async function getDetail(id) {
  const patient = await findById(id)

  const records = await query(
    `SELECT r.*, d.full_name AS doctor_name
       FROM medical_records r
       LEFT JOIN doctors d ON d.id = r.doctor_id
      WHERE r.patient_id = $1
      ORDER BY r.record_date DESC, r.id DESC`,
    [id]
  )

  const appointments = await query(
    `SELECT a.*, d.full_name AS doctor_name, d.specialty
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = $1
      ORDER BY a.scheduled_at DESC`,
    [id]
  )

  return { patient, records: records.rows, appointments: appointments.rows }
}

export async function create(payload) {
  const data = toRecord(payload)
  if (!data.full_name) throw new HttpError(400, 'O nome completo é obrigatório.')

  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')

  const { rows } = await query(
    `INSERT INTO patients (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return rows[0]
}

export async function update(id, payload) {
  await findById(id)

  const data = toRecord(payload)
  if (data.full_name === null) throw new HttpError(400, 'O nome completo é obrigatório.')

  const columns = Object.keys(data)
  if (!columns.length) return findById(id)

  const assignments = columns.map((column, index) => `${column} = $${index + 1}`).join(', ')
  const { rows } = await query(
    `UPDATE patients SET ${assignments} WHERE id = $${columns.length + 1} RETURNING *`,
    [...Object.values(data), id]
  )
  return rows[0]
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM patients WHERE id = $1', [id])
  if (!rowCount) throw new HttpError(404, 'Paciente não encontrado.')
}
