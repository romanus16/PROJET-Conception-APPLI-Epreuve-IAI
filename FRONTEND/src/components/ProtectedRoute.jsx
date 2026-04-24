import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './UI'

export function ProtectedRoute({ children, adminOnly = false }) {
  const auth = useAuth()

  // Contexte pas encore monté (ne devrait pas arriver avec AppRoutes mais sécurité)
  if (!auth) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={36} color="var(--navy)" />
    </div>
  )

  const { user, loading } = auth

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: 48, height: 48, background: 'var(--navy)', borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: '20px', color: '#fff', fontFamily: 'var(--font-mono)',
        animation: 'pulse 1.5s ease infinite',
      }}>IA</div>
      <Spinner size={28} color="var(--navy)" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export function PublicRoute({ children }) {
  const auth = useAuth()

  if (!auth) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={36} color="var(--navy)" />
    </div>
  )

  const { user, loading } = auth

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={36} color="var(--navy)" />
    </div>
  )

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}