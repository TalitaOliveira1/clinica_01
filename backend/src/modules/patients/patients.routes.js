import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import * as patientsService from './patients.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ patients: await patientsService.list({ search: req.query.search }) })
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await patientsService.getDetail(req.params.id))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.status(201).json({ patient: await patientsService.create(req.body || {}) })
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ patient: await patientsService.update(req.params.id, req.body || {}) })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await patientsService.remove(req.params.id)
    res.status(204).end()
  })
)

export default router
