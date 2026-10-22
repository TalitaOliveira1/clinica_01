import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import * as doctorsService from './doctors.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ doctors: await doctorsService.list() })
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.status(201).json({ doctor: await doctorsService.create(req.body || {}) })
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ doctor: await doctorsService.update(req.params.id, req.body || {}) })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await doctorsService.remove(req.params.id)
    res.status(204).end()
  })
)

export default router
