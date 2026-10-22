import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler.js'
import * as dashboardService from './dashboard.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await dashboardService.getOverview())
  })
)

export default router
