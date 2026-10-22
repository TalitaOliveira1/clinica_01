import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createPatient,
  deletePatient,
  listPatients,
  updatePatient,
} from '../services/patients.service.js'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { formatDate, toDateInput } from '../utils/format.js'

const EMPTY_FORM = {
  full_name: '',
  cpf: '',
  birth_date: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      listPatients(search)
        .then((data) => {
          if (!active) return
          setPatients(data)
          setError('')
        })
        .catch((err) => active && setError(err.message))
        .finally(() => active && setLoading(false))
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, reloadToken])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(patient) {
    setEditing(patient)
    setForm({
      full_name: patient.full_name || '',
      cpf: patient.cpf || '',
      birth_date: toDateInput(patient.birth_date),
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      notes: patient.notes || '',
    })
    setModalOpen(true)
  }

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, birth_date: form.birth_date || null }
      if (editing) await updatePatient(editing.id, payload)
      else await createPatient(payload)
      setModalOpen(false)
      setReloadToken((token) => token + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(patient) {
    if (!window.confirm(`Excluir o cadastro de ${patient.full_name}?`)) return
    try {
      await deletePatient(patient.id)
      setReloadToken((token) => token + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Cadastro</p>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Dados de contato, histórico e prontuários.</p>
        </div>
        <div className="page-actions">
          <Button onClick={openCreate}>Novo paciente</Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <div className="card-header">
          <div className="toolbar" style={{ flex: 1 }}>
            <div className="search-input">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, CPF ou telefone"
                aria-label="Buscar pacientes"
              />
            </div>
          </div>
          <span className="cell-muted">
            {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}
          </span>
        </div>

        {loading && patients.length === 0 ? (
          <div className="page-loading">Carregando pacientes…</div>
        ) : patients.length === 0 ? (
          <EmptyState
            title="Nenhum paciente encontrado"
            description={
              search
                ? 'Tente outro termo de busca ou cadastre um novo paciente.'
                : 'Cadastre o primeiro paciente para começar a agenda.'
            }
            action={
              <Button variant="secondary" size="sm" onClick={openCreate}>
                Cadastrar paciente
              </Button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Nascimento</th>
                  <th>Telefone</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <Link to={`/pacientes/${patient.id}`} className="table-link">
                        {patient.full_name}
                      </Link>
                      {patient.email && <div className="cell-muted">{patient.email}</div>}
                    </td>
                    <td>{patient.cpf || '—'}</td>
                    <td>{formatDate(patient.birth_date)}</td>
                    <td>{patient.phone || '—'}</td>
                    <td>
                      <div className="cell-actions">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(patient)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(patient)}>
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
        title={editing ? 'Editar paciente' : 'Novo paciente'}
        subtitle={
          editing ? 'Atualize os dados cadastrais.' : 'Preencha os dados para abrir o cadastro.'
        }
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-form" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar paciente'}
            </Button>
          </>
        }
      >
        <form id="patient-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Nome completo" className="span-2">
            <input
              value={form.full_name}
              onChange={setField('full_name')}
              placeholder="Ex.: Ana Beatriz Souza"
              required
            />
          </Field>
          <Field label="CPF">
            <input value={form.cpf} onChange={setField('cpf')} placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de nascimento">
            <input type="date" value={form.birth_date} onChange={setField('birth_date')} />
          </Field>
          <Field label="Telefone">
            <input value={form.phone} onChange={setField('phone')} placeholder="(11) 90000-0000" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={form.email} onChange={setField('email')} placeholder="nome@email.com" />
          </Field>
          <Field label="Endereço" className="span-2">
            <input value={form.address} onChange={setField('address')} placeholder="Rua, número, cidade" />
          </Field>
          <Field label="Observações" className="span-2" hint="Alergias, condições crônicas, preferências.">
            <textarea value={form.notes} onChange={setField('notes')} rows={3} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
