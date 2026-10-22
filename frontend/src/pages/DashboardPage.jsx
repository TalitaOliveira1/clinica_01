import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOverview } from '../services/dashboard.service.js'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { formatDateTime } from '../utils/format.js'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getOverview()
      .then((overview) => {
        if (active) setData(overview)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = data?.stats

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1 className="page-title">Bom trabalho hoje</h1>
          <p className="page-subtitle">Resumo da clínica e dos próximos atendimentos.</p>
        </div>
        <div className="page-actions">
          <Link to="/agendamentos" className="btn btn-secondary">
            Ver agenda
          </Link>
          <Link to="/pacientes" className="btn btn-primary">
            Novo paciente
          </Link>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {!data ? (
        <div className="card">
          <div className="page-loading">Carregando indicadores…</div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Pacientes"
              value={stats.total_patients}
              hint="cadastros ativos na clínica"
            />
            <StatCard
              label="Consultas hoje"
              value={stats.appointments_today}
              hint="inclui confirmadas e atendidas"
            />
            <StatCard
              label="Próximos agendamentos"
              value={stats.upcoming_appointments}
              hint="agendados ou confirmados"
            />
            <StatCard
              label="Prontuários"
              value={stats.total_records}
              hint="atendimentos registrados"
            />
          </div>

          <section className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Próximos atendimentos</h2>
                <p className="card-subtitle">Agenda a partir de agora</p>
              </div>
              <Link to="/agendamentos" className="btn btn-ghost btn-sm">
                Abrir agenda →
              </Link>
            </div>

            {data.nextAppointments.length === 0 ? (
              <EmptyState
                title="Nenhum atendimento futuro"
                description="Os próximos agendamentos aparecerão aqui automaticamente."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Profissional</th>
                      <th>Quando</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.nextAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <Link
                            to={`/pacientes/${appointment.patient_id}`}
                            className="table-link"
                          >
                            {appointment.patient_name}
                          </Link>
                        </td>
                        <td>
                          <div className="cell-strong">{appointment.doctor_name}</div>
                          <div className="cell-muted">{appointment.specialty}</div>
                        </td>
                        <td>{formatDateTime(appointment.scheduled_at)}</td>
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
        </>
      )}
    </div>
  )
}
