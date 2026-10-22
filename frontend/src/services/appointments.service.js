import { request } from './api.js'

export function listAppointments(filters = {}) {
  const params = new URLSearchParams()
  if (filters.date) params.set('date', filters.date)
  if (filters.status) params.set('status', filters.status)
  if (filters.patientId) params.set('patientId', filters.patientId)
  const query = params.toString()

  return request(`/appointments${query ? `?${query}` : ''}`).then((data) => data.appointments)
}

export function createAppointment(payload) {
  return request('/appointments', { method: 'POST', body: payload }).then((data) => data.appointment)
}

export function updateAppointment(id, payload) {
  return request(`/appointments/${id}`, { method: 'PUT', body: payload }).then(
    (data) => data.appointment
  )
}

export function updateAppointmentStatus(id, status) {
  return request(`/appointments/${id}/status`, { method: 'PATCH', body: { status } }).then(
    (data) => data.appointment
  )
}

export function deleteAppointment(id) {
  return request(`/appointments/${id}`, { method: 'DELETE' })
}
