import { query } from '../../config/database.js'
import { HttpError } from '../../utils/http-error.js'

export const STATUSES = ['agendado', 'confirmado', 'atendido', 'cancelado']

const SELECT = `
  SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name, d.specialty
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id`

function toRecord(payload) {
  const data = {}
  if (payload.patient_id !== undefined) data.patient_id = Number(payload.patient_id) || null
  if (payload.doctor_id !== undefined) data.doctor_id = Number(payload.doctor_id) || null
  if (payload.scheduled_at !== undefined) data.scheduled_at = payload.scheduled_at || null
  if (payload.type !== undefined) data.type = payload.type || 'Consulta'
  if (payload.status !== undefined) data.status = payload.status
  if (payload.notes !== undefined) data.notes = payload.notes || null
  return data
}

function validate(data, { partial = false } = {}) {
  if (!partial) {
    if (!data.patient_id) throw new HttpError(400, 'Selecione o paciente.')
    if (!data.doctor_id) throw new HttpError(400, 'Selecione o profissional.')
    if (!data.scheduled_at) throw new HttpError(400, 'Informe a data e a hora da consulta.')
  }
  if (data.status && !STATUSES.includes(data.status)) throw new HttpError(400, 'Status inválido.')
}

export async function list({ date, status, patientId } = {}) {
  const { rows } = await query(
    `${SELECT}
      WHERE ($1::date IS NULL OR a.scheduled_at::date = $1::date)
        AND ($2::text IS NULL OR a.status = $2)
        AND ($3::int IS NULL OR a.patient_id = $3)
      ORDER BY a.scheduled_at`,
    [date || null, status || null, patientId ? Number(patientId) : null]
  )
  return rows
}

export async function findById(id) {
  const { rows } = await query(`${SELECT} WHERE a.id = $1`, [id])
  if (!rows[0]) throw new HttpError(404, 'Agendamento não encontrado.')
  return rows[0]
}

export async function create(payload) {
  const data = toRecord(payload)
  validate(data)
  data.status = data.status || 'agendado'

  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')

  const { rows } = await query(
    `INSERT INTO appointments (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    values
  )
  return findById(rows[0].id)
}

export async function update(id, payload) {
  await findById(id)

  const data = toRecord(payload)
  validate(data, { partial: true })
  if (data.scheduled_at === null) throw new HttpError(400, 'Informe a data e a hora da consulta.')

  const columns = Object.keys(data)
  if (!columns.length) return findById(id)

  const assignments = columns.map((column, index) => `${column} = $${index + 1}`).join(', ')
  await query(`UPDATE appointments SET ${assignments} WHERE id = $${columns.length + 1}`, [
    ...Object.values(data),
    id,
  ])
  return findById(id)
}

export async function updateStatus(id, status) {
  validate({ status })
  await findById(id)
  await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id])
  return findById(id)
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM appointments WHERE id = $1', [id])
  if (!rowCount) throw new HttpError(404, 'Agendamento não encontrado.')
}
