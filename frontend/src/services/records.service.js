import { request } from './api.js'

export function listRecords(patientId) {
  return request(`/records?patientId=${patientId}`).then((data) => data.records)
}

export function createRecord(payload) {
  return request('/records', { method: 'POST', body: payload }).then((data) => data.record)
}

export function deleteRecord(id) {
  return request(`/records/${id}`, { method: 'DELETE' })
}
