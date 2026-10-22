import { query } from '../../config/database.js'
import { HttpError } from '../../utils/http-error.js'

export async function list({ patientId } = {}) {
  const { rows } = await query(
    `SELECT r.*, d.full_name AS doctor_name
       FROM medical_records r
       LEFT JOIN doctors d ON d.id = r.doctor_id
      WHERE ($1::int IS NULL OR r.patient_id = $1)
      ORDER BY r.record_date DESC, r.id DESC`,
    [patientId ? Number(patientId) : null]
  )
  return rows
}

export async function create(payload) {
  const patientId = Number(payload.patient_id) || null
  if (!patientId) throw new HttpError(400, 'Selecione o paciente.')
  if (!payload.complaint && !payload.diagnosis && !payload.prescription) {
    throw new HttpError(400, 'Descreva ao menos uma informação do atendimento.')
  }

  const { rows } = await query(
    `INSERT INTO medical_records
       (patient_id, doctor_id, appointment_id, record_date, complaint, diagnosis, prescription)
     VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6, $7)
     RETURNING *`,
    [
      patientId,
      Number(payload.doctor_id) || null,
      Number(payload.appointment_id) || null,
      payload.record_date || null,
      payload.complaint || null,
      payload.diagnosis || null,
      payload.prescription || null,
    ]
  )
  return rows[0]
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM medical_records WHERE id = $1', [id])
  if (!rowCount) throw new HttpError(404, 'Prontuário não encontrado.')
}
