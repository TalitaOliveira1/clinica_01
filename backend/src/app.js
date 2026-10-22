import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { query } from './config/database.js'
import { asyncHandler } from './utils/async-handler.js'
import { requireAuth } from './middleware/auth.middleware.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import patientsRoutes from './modules/patients/patients.routes.js'
import doctorsRoutes from './modules/doctors/doctors.routes.js'
import appointmentsRoutes from './modules/appointments/appointments.routes.js'
import recordsRoutes from './modules/records/records.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json())

if (env.corsOrigin) {
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
      credentials: true,
    })
  )
}

app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    await query('SELECT 1')
    res.json({ status: 'ok' })
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/patients', requireAuth, patientsRoutes)
app.use('/api/doctors', requireAuth, doctorsRoutes)
app.use('/api/appointments', requireAuth, appointmentsRoutes)
app.use('/api/records', requireAuth, recordsRoutes)
app.use('/api/dashboard', requireAuth, dashboardRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
