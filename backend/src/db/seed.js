import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

async function count(table) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS total FROM ${table}`)
  return rows[0].total
}

async function seedUsers() {
  if ((await count('users')) > 0) return
  const passwordHash = await bcrypt.hash('admin123', 10)
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
    ['Helena Duarte', 'admin@clinica.com', passwordHash, 'admin']
  )
}

async function seedDoctors() {
  if ((await count('doctors')) > 0) return
  const doctors = [
    ['Dra. Helena Duarte', 'Clínica Geral', 'CRM-SP 123456', '(11) 98888-1010', 'helena@clinica.com'],
    ['Dr. Rafael Menezes', 'Cardiologia', 'CRM-SP 234567', '(11) 98888-2020', 'rafael@clinica.com'],
    ['Dra. Camila Prado', 'Dermatologia', 'CRM-SP 345678', '(11) 98888-3030', 'camila@clinica.com'],
    ['Dr. Bruno Tavares', 'Ortopedia', 'CRM-SP 456789', '(11) 98888-4040', 'bruno@clinica.com'],
  ]
  for (const doctor of doctors) {
    await pool.query(
      `INSERT INTO doctors (full_name, specialty, crm, phone, email) VALUES ($1, $2, $3, $4, $5)`,
      doctor
    )
  }
}

async function seedPatients() {
  if ((await count('patients')) > 0) return
  const patients = [
    ['Ana Beatriz Souza', '111.222.333-44', '1985-04-12', '(11) 97777-1111', 'ana.souza@email.com', 'Rua das Acácias, 120 - São Paulo/SP', 'Alergia a dipirona.'],
    ['Carlos Eduardo Lima', '222.333.444-55', '1978-09-30', '(11) 97777-2222', 'carlos.lima@email.com', 'Av. Paulista, 900 - São Paulo/SP', null],
    ['Fernanda Ribeiro', '333.444.555-66', '1992-01-22', '(11) 97777-3333', 'fernanda.ribeiro@email.com', 'Rua Verde, 45 - São Paulo/SP', 'Acompanhamento dermatológico mensal.'],
    ['João Pedro Alves', '444.555.666-77', '1966-07-05', '(11) 97777-4444', 'joao.alves@email.com', 'Rua do Sol, 78 - São Paulo/SP', 'Hipertenso, uso contínuo de losartana.'],
    ['Mariana Castro', '555.666.777-88', '2001-11-17', '(11) 97777-5555', 'mariana.castro@email.com', 'Rua das Flores, 33 - São Paulo/SP', null],
    ['Rafael Nogueira', '666.777.888-99', '1989-03-08', '(11) 97777-6666', 'rafael.nogueira@email.com', 'Rua Ipiranga, 512 - São Paulo/SP', 'Pratica corrida de rua.'],
  ]
  for (const patient of patients) {
    await pool.query(
      `INSERT INTO patients (full_name, cpf, birth_date, phone, email, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      patient
    )
  }
}

async function seedAppointments() {
  if ((await count('appointments')) > 0) return
  const appointments = [
    [1, 1, `CURRENT_DATE + TIME '09:00'`, 'Consulta', 'confirmado', 'Retorno de exames.'],
    [2, 2, `CURRENT_DATE + TIME '10:30'`, 'Consulta', 'agendado', null],
    [3, 3, `CURRENT_DATE + TIME '14:00'`, 'Retorno', 'atendido', 'Avaliação de tratamento.'],
    [4, 1, `CURRENT_DATE + 1 + TIME '08:30'`, 'Consulta', 'agendado', null],
    [5, 4, `CURRENT_DATE + 1 + TIME '11:00'`, 'Avaliação', 'confirmado', 'Dor no joelho direito.'],
    [6, 2, `CURRENT_DATE + 2 + TIME '15:30'`, 'Consulta', 'agendado', null],
    [1, 3, `CURRENT_DATE - 3 + TIME '09:00'`, 'Retorno', 'atendido', null],
  ]
  for (const [patientId, doctorId, scheduledAt, type, status, notes] of appointments) {
    await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, type, status, notes)
       VALUES ($1, $2, ${scheduledAt}, $3, $4, $5)`,
      [patientId, doctorId, type, status, notes]
    )
  }
}

async function seedRecords() {
  if ((await count('medical_records')) > 0) return
  const records = [
    [1, 1, `CURRENT_DATE - 20`, 'Cansaço e dor de cabeça frequente.', 'Cefaleia tensional.', 'Orientações de higiene do sono. Dipirona 500mg se dor.'],
    [1, 1, `CURRENT_DATE - 3`, 'Retorno com melhora parcial.', 'Cefaleia tensional em melhora.', 'Manter orientações. Retorno em 30 dias.'],
    [4, 2, `CURRENT_DATE - 45`, 'Pressão alta em casa.', 'Hipertensão arterial sistêmica.', 'Losartana 50mg 2x/dia. Dieta hipossódica.'],
  ]
  for (const [patientId, doctorId, recordDate, complaint, diagnosis, prescription] of records) {
    await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, record_date, complaint, diagnosis, prescription)
       VALUES ($1, $2, ${recordDate}, $3, $4, $5)`,
      [patientId, doctorId, complaint, diagnosis, prescription]
    )
  }
}

async function main() {
  await seedUsers()
  await seedDoctors()
  await seedPatients()
  await seedAppointments()
  await seedRecords()
  console.log('[seed] dados iniciais prontos')
  await pool.end()
}

main().catch((error) => {
  console.error('[seed] falhou:', error.message)
  process.exit(1)
})
