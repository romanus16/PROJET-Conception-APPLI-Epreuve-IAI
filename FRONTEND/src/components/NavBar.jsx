import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_STUDENT = [
  { path: '/dashboard',       label: 'Accueil',   icon: '🏠' },
  { path: '/cours',           label: 'Cours',     icon: '📚' },
  { path: '/stages',          label: 'Stages',    icon: '💼' },
  { path: '/profile',         label: 'Profil',    icon: '👤' },
]
const NAV_ADMIN = [
  { path: '/admin',           label: 'Dashboard', icon: '📊' },
  { path: '/admin/ressources',label: 'Ressources',icon: '📚' },
  { path: '/admin/etudiants', label: 'Étudiants', icon: '🎓' },
  { path: '/admin/validation',label: 'Validation',icon: '✅' },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const items = isAdmin ? NAV_ADMIN : NAV_STUDENT

  const isActive = path =>
    location.pathname === path ||
    (path !== '/admin' && path !== '/dashboard' && location.pathname.startsWith(path))

  return (
    <>
      {/* ── Top bar ── */}
      <header style={{
        background: 'var(--navy)', color: '#fff',
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        zIndex: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        boxShadow: '0 2px 16px rgba(15,37,87,.3)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
             onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
          <div style={{
            width: 36, height: 36, background: 'var(--orange)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '15px', color: '#fff', fontFamily: 'var(--font-mono)',
          }}>IA</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>IAI-Ressources</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)', marginTop: '-2px' }}>TOGO</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '4px' }} className="desk-nav">
          {items.map(item => (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: isActive(item.path) ? 'rgba(255,255,255,.13)' : 'transparent',
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,.6)',
                border: 'none', cursor: 'pointer', padding: '8px 14px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}
              onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User info desktop */}
          <div className="user-text" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>
              {isAdmin ? 'Administrateur' : 'Étudiant'}
            </div>
          </div>
          <button onClick={logout}
            style={{
              background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
          >Déco.</button>
          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)} className="burger"
            style={{
              background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff',
              padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
              display: 'none',
            }}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(15,37,87,.6)', backdropFilter: 'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: 64, left: 0, right: 0,
            background: 'var(--navy-light)', padding: '12px',
            animation: 'fadeUp .2s ease',
          }}>
            {items.map(item => (
              <button key={item.path}
                onClick={() => { navigate(item.path); setOpen(false) }}
                style={{
                  width: '100%', background: isActive(item.path) ? 'rgba(255,255,255,.1)' : 'transparent',
                  border: 'none', color: '#fff', padding: '14px 16px', textAlign: 'left',
                  cursor: 'pointer', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px',
                }}
              >{item.icon} {item.label}</button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desk-nav  { display: none !important; }
          .user-text { display: none !important; }
          .burger    { display: flex !important; }
        }
      `}</style>
    </>
  )
}