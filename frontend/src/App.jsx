import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AppShell from './components/layout/AppShell.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PatientsPage from './pages/PatientsPage.jsx'
import PatientDetailPage from './pages/PatientDetailPage.jsx'
import DoctorsPage from './pages/DoctorsPage.jsx'
import AppointmentsPage from './pages/AppointmentsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route path="pacientes/:id" element={<PatientDetailPage />} />
              <Route path="profissionais" element={<DoctorsPage />} />
              <Route path="agendamentos" element={<AppointmentsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
