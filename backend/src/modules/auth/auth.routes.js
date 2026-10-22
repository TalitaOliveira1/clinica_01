import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import * as authService from './auth.service.js'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {}
    res.json(await authService.login({ email, password }))
  })
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await authService.getProfile(req.user.sub) })
  })
)

export default router
