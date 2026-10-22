import { request } from './api.js'

export function getOverview() {
  return request('/dashboard')
}
