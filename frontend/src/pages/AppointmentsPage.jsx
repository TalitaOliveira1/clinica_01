import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from '../services/appointments.service.js'
import { listPatients } from '../services/patients.service.js'
import { listDoctors } from '../services/doctors.service.js'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { formatDateTime, toDateTimeInput, todayInput } from '../utils/format.js'

const EMPTY_FORM = {
  patient_id: '',
  doctor_id: '',
  scheduled_at: '',
  type: 'Consulta',
  status: 'agendado',
  notes: '',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [filters, setFilters] = useState({ date: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([listPatients(), listDoctors()])
      .then(([patientList, doctorList]) => {
        setPatients(patientList)
        setDoctors(doctorList.filter((doctor) => doctor.active))
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    listAppointments(filters)
      .then((data) => {
        if (!active) return
        setAppointments(data)
        setError('')
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [filters])

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, scheduled_at: `${todayInput()}T09:00`, status: 'agendado' })
    setModalOpen(true)
  }

  function openEdit(appointment) {
    setEditing(appointment)
    setForm({
      patient_id: String(appointment.patient_id),
      doctor_id: String(appointment.doctor_id),
      scheduled_at: toDateTimeInput(appointment.scheduled_at),
      type: appointment.type || 'Consulta',
      status: appointment.status,
      notes: appointment.notes || '',
    })
    setModalOpen(true)
  }

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function refresh() {
    const data = await listAppointments(filters)
    setAppointments(data)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) await updateAppointment(editing.id, form)
      else await createAppointment(form)
      setModalOpen(false)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(appointment, status) {
    try {
      const updated = await updateAppointmentStatus(appointment.id, status)
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(appointment) {
    if (!window.confirm('Excluir este agendamento?')) return
    try {
      await deleteAppointment(appointment.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const hasFilters = Boolean(filters.date || filters.status)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Consultas, retornos e avaliações da clínica.</p>
        </div>
        <div className="page-actions">
          <Button onClick={openCreate}>Novo agendamento</Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <div className="card-header">
          <div className="toolbar" style={{ flex: 1 }}>
            <input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
              aria-label="Filtrar por data"
              style={{ width: 170 }}
            />
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              aria-label="Filtrar por status"
              style={{ width: 170 }}
            >
              <option value="">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="atendido">Atendido</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ date: todayInput(), status: '' })}
            >
              Hoje
            </Button>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ date: '', status: '' })}
              >
                Limpar filtros
              </Button>
            )}
          </div>
          <span className="cell-muted">
            {appointments.length} {appointments.length === 1 ? 'consulta' : 'consultas'}
          </span>
        </div>

        {loading && appointments.length === 0 ? (
          <div className="page-loading">Carregando agenda…</div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento encontrado"
            description={
              hasFilters
                ? 'Ajuste os filtros para ver outros períodos.'
                : 'Marque a primeira consulta para iniciar a agenda.'
            }
            action={
              <Button variant="secondary" size="sm" onClick={openCreate}>
                Novo agendamento
              </Button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Profissional</th>
                  <th>Data e hora</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <Link to={`/pacientes/${appointment.patient_id}`} className="table-link">
                        {appointment.patient_name}
                      </Link>
                      <div className="cell-muted">{appointment.type}</div>
                    </td>
                    <td>
                      <div className="cell-strong">{appointment.doctor_name}</div>
                      <div className="cell-muted">{appointment.specialty}</div>
                    </td>
                    <td>{formatDateTime(appointment.scheduled_at)}</td>
                    <td>
                      <Badge value={appointment.status} />
                    </td>
                    <td>
                      <div className="cell-actions">
                        {appointment.status === 'agendado' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => changeStatus(appointment, 'confirmado')}
                          >
                            Confirmar
                          </Button>
                        )}
                        {(appointment.status === 'agendado' ||
                          appointment.status === 'confirmado') && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => changeStatus(appointment, 'atendido')}
                            >
                              Concluir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => changeStatus(appointment, 'cancelado')}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(appointment)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(appointment)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar agendamento' : 'Novo agendamento'}
        subtitle="Selecione paciente, profissional e horário."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="appointment-form" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar agendamento'}
            </Button>
          </>
        }
      >
        <form id="appointment-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Paciente" className="span-2">
            <select value={form.patient_id} onChange={setField('patient_id')} required>
              <option value="">Selecione o paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Profissional">
            <select value={form.doctor_id} onChange={setField('doctor_id')} required>
              <option value="">Selecione</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name} · {doctor.specialty}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data e hora">
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={setField('scheduled_at')}
              required
            />
          </Field>
          <Field label="Tipo">
            <select value={form.type} onChange={setField('type')}>
              <option>Consulta</option>
              <option>Retorno</option>
              <option>Avaliação</option>
              <option>Procedimento</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={setField('status')}>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="atendido">Atendido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>
          <Field label="Observações" className="span-2">
            <textarea value={form.notes} onChange={setField('notes')} rows={3} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
