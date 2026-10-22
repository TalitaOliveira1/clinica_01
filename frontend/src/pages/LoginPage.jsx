import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@clinica.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <section className="login-brand">
        <div className="login-brand-top">
          <span className="brand-mark">+</span>
          <div>
            <strong style={{ color: '#fff', display: 'block' }}>Clínica Vida Plena</strong>
            <small style={{ color: 'rgba(234,246,243,0.6)', fontSize: 12 }}>
              gestão de atendimentos
            </small>
          </div>
        </div>

        <div className="login-brand-content">
          <h1>Cuidar de pessoas começa com uma agenda organizada.</h1>
          <p>
            Cadastre pacientes, organize a agenda dos profissionais e registre cada atendimento em um
            prontuário único — tudo em um só lugar.
          </p>
          <ul className="login-highlights">
            <li>Agenda por profissional com status de cada consulta</li>
            <li>Prontuário com queixa, diagnóstico e prescrição</li>
            <li>Visão rápida do dia e dos próximos atendimentos</li>
          </ul>
        </div>

        <span className="login-footnote">Sistema interno da clínica</span>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Acesso da equipe</p>
            <h2>Entre na sua conta</h2>
          </div>
          <p>Use suas credenciais para acessar o painel da clínica.</p>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@clinica.com"
              autoComplete="username"
              required
            />
          </Field>

          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>

          {error && <div className="alert alert-error">{error}</div>}

          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>

          <div className="demo-hint">
            <strong>Acesso de demonstração</strong>
            <br />
            E-mail: admin@clinica.com · Senha: admin123
          </div>
        </form>
      </section>
    </div>
  )
}
