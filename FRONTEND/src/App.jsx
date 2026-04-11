import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

// Public
import Login    from './pages/Login'
import Register from './pages/Register'

// Student
import Dashboard     from './pages/Dashboard'
import Cours         from './pages/Cours'
import Stages        from './pages/Stages'
import Upload        from './pages/Upload'
import MesRessources from './pages/MesRessources'
import Profile       from './pages/Profile'

// Admin
import AdminDashboard  from './pages/AdminDashboard'
import AdminValidation from './pages/AdminValidation'
import AdminRessources from './pages/AdminRessources'
import AdminEtudiants  from './pages/AdminEtudiants'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ── */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* ── Student protected ── */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="cours"          element={<Cours />} />
            <Route path="stages"         element={<Stages />} />
            <Route path="upload"         element={<Upload />} />
            <Route path="mes-ressources" element={<MesRessources />} />
            <Route path="profile"        element={<Profile />} />
          </Route>

          {/* ── Admin protected ── */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="validation" element={<AdminValidation />} />
            <Route path="ressources" element={<AdminRessources />} />
            <Route path="etudiants"  element={<AdminEtudiants />} />
            <Route path="profile"    element={<Profile />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}