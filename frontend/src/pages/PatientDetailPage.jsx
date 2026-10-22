import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPatient } from '../services/patients.service.js'
import { deleteRecord, createRecord } from '../services/records.service.js'
import { listDoctors } from '../services/doctors.service.js'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { ageFromBirthDate, formatDate, formatDateTime, todayInput } from '../utils/format.js'

const EMPTY_RECORD = {
  doctor_id: '',
  record_date: todayInput(),
  complaint: '',
  diagnosis: '',
  prescription: '',
}

export default function PatientDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_RECORD)
  const [saving, setSaving] = useState(false)

  async function load() {
    const detail = await getPatient(id)
    setData(detail)
  }

  useEffect(() => {
    let active = true
    Promise.all([getPatient(id), listDoctors()])
      .then(([detail, doctorList]) => {
        if (!active) return
        setData(detail)
        setDoctors(doctorList)
      })
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [id])

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  function openRecordModal() {
    setForm(EMPTY_RECORD)
    setModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createRecord({ ...form, patient_id: id, doctor_id: form.doctor_id || null })
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRecord(record) {
    if (!window.confirm('Excluir este registro do prontuário?')) return
    try {
      await deleteRecord(record.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!data) {
    return (
      <div className="page">
        {error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="card">
            <div className="page-loading">Carregando prontuário…</div>
          </div>
        )}
      </div>
    )
  }

  const { patient, records, appointments } = data
  const age = ageFromBirthDate(patient.birth_date)

  return (
    <div className="page">
      <div>
        <Link to="/pacientes" className="back-link">
          ← Pacientes
        </Link>
      </div>

      <header className="page-header">
        <div>
          <p className="eyebrow">Prontuário</p>
          <h1 className="page-title">{patient.full_name}</h1>
          <p className="page-subtitle">
            {patient.cpf ? `CPF ${patient.cpf}` : 'CPF não informado'}
            {age !== null ? ` · ${age} anos` : ''}
          </p>
        </div>
        <div className="page-actions">
          <Button onClick={openRecordModal}>Novo prontuário</Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Dados cadastrais</h2>
              <p className="card-subtitle">Cadastrado em {formatDate(patient.created_at)}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="info-list">
              <div className="info-item">
                <span>Nascimento</span>
                <strong>{formatDate(patient.birth_date)}</strong>
              </div>
              <div className="info-item">
                <span>Telefone</span>
                <strong>{patient.phone || '—'}</strong>
              </div>
              <div className="info-item">
                <span>E-mail</span>
                <strong>{patient.email || '—'}</strong>
              </div>
              <div className="info-item">
                <span>Endereço</span>
                <strong>{patient.address || '—'}</strong>
              </div>
            </div>
            {patient.notes && <div className="notes-box">{patient.notes}</div>}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Histórico de atendimentos</h2>
              <p className="card-subtitle">{records.length} registro(s) no prontuário</p>
            </div>
          </div>
          {records.length === 0 ? (
            <EmptyState
              title="Prontuário vazio"
              description="Registre a primeira consulta deste paciente."
              action={
                <Button variant="secondary" size="sm" onClick={openRecordModal}>
                  Novo prontuário
                </Button>
              }
            />
          ) : (
            <div className="record-list">
              {records.map((record) => (
                <article className="record-item" key={record.id}>
                  <div className="record-head">
                    <span className="record-date">{formatDate(record.record_date)}</span>
                    <span className="record-doctor">{record.doctor_name || 'Equipe'}</span>
                  </div>
                  {record.complaint && (
                    <div className="record-field">
                      <b>Queixa</b>
                      {record.complaint}
                    </div>
                  )}
                  {record.diagnosis && (
                    <div className="record-field">
                      <b>Diagnóstico</b>
                      {record.diagnosis}
                    </div>
                  )}
                  {record.prescription && (
                    <div className="record-field">
                      <b>Prescrição</b>
                      {record.prescription}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="record-delete"
                    onClick={() => handleDeleteRecord(record)}
                  >
                    Excluir registro
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Consultas</h2>
            <p className="card-subtitle">Agendamentos deste paciente</p>
          </div>
          <Link to="/agendamentos" className="btn btn-ghost btn-sm">
            Ir para a agenda →
          </Link>
        </div>
        {appointments.length === 0 ? (
          <EmptyState
            title="Nenhuma consulta registrada"
            description="Marque um atendimento na agenda e ele aparecerá aqui."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data e hora</th>
                  <th>Profissional</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatDateTime(appointment.scheduled_at)}</td>
                    <td>
                      <div className="cell-strong">{appointment.doctor_name}</div>
                      <div className="cell-muted">{appointment.specialty}</div>
                    </td>
                    <td>{appointment.type}</td>
                    <td>
                      <Badge value={appointment.status} />
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
        title="Novo prontuário"
        subtitle={`Registro de atendimento · ${patient.full_name}`}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="record-form" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar registro'}
            </Button>
          </>
        }
      >
        <form id="record-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Profissional">
            <select value={form.doctor_id} onChange={setField('doctor_id')}>
              <option value="">Selecione</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name} · {doctor.specialty}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data do atendimento">
            <input type="date" value={form.record_date} onChange={setField('record_date')} />
          </Field>
          <Field label="Queixa principal" className="span-2">
            <textarea value={form.complaint} onChange={setField('complaint')} rows={2} />
          </Field>
          <Field label="Diagnóstico" className="span-2">
            <textarea value={form.diagnosis} onChange={setField('diagnosis')} rows={2} />
          </Field>
          <Field label="Prescrição" className="span-2">
            <textarea value={form.prescription} onChange={setField('prescription')} rows={3} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
