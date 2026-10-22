import { request } from './api.js'

export function listPatients(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request(`/patients${query}`).then((data) => data.patients)
}

export function getPatient(id) {
  return request(`/patients/${id}`)
}

export function createPatient(payload) {
  return request('/patients', { method: 'POST', body: payload }).then((data) => data.patient)
}

export function updatePatient(id, payload) {
  return request(`/patients/${id}`, { method: 'PUT', body: payload }).then((data) => data.patient)
}

export function deletePatient(id) {
  return request(`/patients/${id}`, { method: 'DELETE' })
}
