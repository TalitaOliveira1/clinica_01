import { useEffect, useState } from 'react'
import {
  createDoctor,
  deleteDoctor,
  listDoctors,
  updateDoctor,
} from '../services/doctors.service.js'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

const EMPTY_FORM = {
  full_name: '',
  specialty: '',
  crm: '',
  phone: '',
  email: '',
  active: true,
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const data = await listDoctors()
      setDoctors(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(doctor) {
    setEditing(doctor)
    setForm({
      full_name: doctor.full_name || '',
      specialty: doctor.specialty || '',
      crm: doctor.crm || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      active: doctor.active,
    })
    setModalOpen(true)
  }

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) await updateDoctor(editing.id, form)
      else await createDoctor(form)
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(doctor) {
    if (!window.confirm(`Excluir ${doctor.full_name} da equipe?`)) return
    try {
      await deleteDoctor(doctor.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Equipe</p>
          <h1 className="page-title">Profissionais</h1>
          <p className="page-subtitle">Corpo clínico disponível para agendamentos.</p>
        </div>
        <div className="page-actions">
          <Button onClick={openCreate}>Novo profissional</Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        {loading ? (
          <div className="page-loading">Carregando equipe…</div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="Nenhum profissional cadastrado"
            description="Cadastre o corpo clínico para poder marcar consultas."
            action={
              <Button variant="secondary" size="sm" onClick={openCreate}>
                Cadastrar profissional
              </Button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Especialidade</th>
                  <th>CRM</th>
                  <th>Contato</th>
                  <th>Situação</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="cell-strong">{doctor.full_name}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.crm}</td>
                    <td>
                      <div>{doctor.phone || '—'}</div>
                      {doctor.email && <div className="cell-muted">{doctor.email}</div>}
                    </td>
                    <td>
                      <Badge value={doctor.active ? 'ativo' : 'inativo'} />
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(doctor)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doctor)}>
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
        title={editing ? 'Editar profissional' : 'Novo profissional'}
        subtitle="Dados do corpo clínico."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="doctor-form" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar profissional'}
            </Button>
          </>
        }
      >
        <form id="doctor-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Nome completo" className="span-2">
            <input
              value={form.full_name}
              onChange={setField('full_name')}
              placeholder="Ex.: Dra. Camila Prado"
              required
            />
          </Field>
          <Field label="Especialidade">
            <input
              value={form.specialty}
              onChange={setField('specialty')}
              placeholder="Ex.: Dermatologia"
              required
            />
          </Field>
          <Field label="CRM">
            <input value={form.crm} onChange={setField('crm')} placeholder="CRM-SP 000000" required />
          </Field>
          <Field label="Telefone">
            <input value={form.phone} onChange={setField('phone')} placeholder="(11) 90000-0000" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={form.email} onChange={setField('email')} placeholder="nome@clinica.com" />
          </Field>
          <Field label="Situação" className="span-2">
            <select
              value={form.active ? 'true' : 'false'}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.value === 'true' }))
              }
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
