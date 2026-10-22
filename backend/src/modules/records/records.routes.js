import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import * as recordsService from './records.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ records: await recordsService.list({ patientId: req.query.patientId }) })
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.status(201).json({ record: await recordsService.create(req.body || {}) })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await recordsService.remove(req.params.id)
    res.status(204).end()
  })
)

export default router
