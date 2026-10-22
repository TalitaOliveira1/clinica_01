import { request } from './api.js'

export function listDoctors() {
  return request('/doctors').then((data) => data.doctors)
}

export function createDoctor(payload) {
  return request('/doctors', { method: 'POST', body: payload }).then((data) => data.doctor)
}

export function updateDoctor(id, payload) {
  return request(`/doctors/${id}`, { method: 'PUT', body: payload }).then((data) => data.doctor)
}

export function deleteDoctor(id) {
  return request(`/doctors/${id}`, { method: 'DELETE' })
}
