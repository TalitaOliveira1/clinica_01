import { query } from '../../config/database.js'

export async function getOverview() {
  const stats = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM patients) AS total_patients,
       (SELECT COUNT(*)::int FROM doctors WHERE active) AS total_doctors,
       (SELECT COUNT(*)::int FROM appointments
         WHERE scheduled_at::date = CURRENT_DATE AND status <> 'cancelado') AS appointments_today,
       (SELECT COUNT(*)::int FROM appointments
         WHERE status IN ('agendado', 'confirmado') AND scheduled_at >= NOW()) AS upcoming_appointments,
       (SELECT COUNT(*)::int FROM medical_records) AS total_records`
  )

  const nextAppointments = await query(
    `SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name, d.specialty
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
      WHERE a.scheduled_at >= NOW() AND a.status IN ('agendado', 'confirmado')
      ORDER BY a.scheduled_at
      LIMIT 6`
  )

  return { stats: stats.rows[0], nextAppointments: nextAppointments.rows }
}
