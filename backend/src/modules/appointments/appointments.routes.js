import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import * as appointmentsService from './appointments.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      appointments: await appointmentsService.list({
        date: req.query.date,
        status: req.query.status,
        patientId: req.query.patientId,
      }),
    })
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.status(201).json({ appointment: await appointmentsService.create(req.body || {}) })
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ appointment: await appointmentsService.update(req.params.id, req.body || {}) })
  })
)

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body || {}
    res.json({ appointment: await appointmentsService.updateStatus(req.params.id, status) })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await appointmentsService.remove(req.params.id)
    res.status(204).end()
  })
)

export default router
