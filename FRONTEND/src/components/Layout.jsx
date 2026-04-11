import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'

const NAV_STUDENT = [
  { path: '/dashboard',        label: 'Accueil', icon: '🏠' },
  { path: '/cours',            label: 'Cours',   icon: '📚' },
  { path: '/stages',           label: 'Stages',  icon: '💼' },
  { path: '/profile',          label: 'Profil',  icon: '👤' },
]
const NAV_ADMIN = [
  { path: '/admin',            label: 'Dashboard',  icon: '📊' },
  { path: '/admin/ressources', label: 'Ressources', icon: '📚' },
  { path: '/admin/etudiants',  label: 'Étudiants',  icon: '🎓' },
  { path: '/admin/validation', label: 'Validation', icon: '✅' },
]

export default function Layout() {
  const { isAdmin } = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const items = isAdmin ? NAV_ADMIN : NAV_STUDENT

  const isActive = p =>
    location.pathname === p ||
    (p !== '/admin' && p !== '/dashboard' && location.pathname.startsWith(p))

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, paddingBottom: 72 }}>
      <Navbar />
      <main><Outlet /></main>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid var(--gray-100)',
        display: 'flex', zIndex: 100,
        boxShadow: '0 -4px 16px rgba(15,37,87,.08)',
      }}>
        {items.map(item => (
          <button key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '8px 4px 10px', background: 'none', border: 'none',
              cursor: 'pointer', position: 'relative',
              color: isActive(item.path) ? 'var(--navy)' : 'var(--gray-400)',
              transition: 'color .15s',
            }}>
            {isActive(item.path) && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 3, background: 'var(--orange)', borderRadius: '0 0 4px 4px',
              }} />
            )}
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive(item.path) ? 700 : 500 }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
          main { padding-bottom: 0; }
        }
      `}</style>
    </div>
  )
}