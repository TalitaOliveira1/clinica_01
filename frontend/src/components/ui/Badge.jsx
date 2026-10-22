const LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  atendido: 'Atendido',
  cancelado: 'Cancelado',
  ativo: 'Ativo',
  inativo: 'Inativo',
}

export default function Badge({ value, label }) {
  return <span className={`badge badge-${value}`}>{label || LABELS[value] || value}</span>
}
