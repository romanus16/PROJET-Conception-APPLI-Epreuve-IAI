import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)',
    }}>
      {/* Illustration panel — desktop only */}
      <div className="left-panel" style={{
        flex: 1, display: 'none', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px',
      }}>
        <div style={{ color: '#fff', maxWidth: 380 }}>
          <div style={{
            width: 64, height: 64, background: 'var(--orange)', borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '26px', color: '#fff', fontFamily: 'var(--font-mono)',
            marginBottom: '28px', boxShadow: '0 8px 32px rgba(240,124,30,.4)',
          }}>IA</div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.15, marginBottom: '14px' }}>
            IAI-Ressources<br />
            <span style={{ color: 'var(--orange-light)' }}>Togo</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: '28px' }}>
            Tous vos cours, épreuves &amp; ressources de stage en un seul endroit.
          </p>
          {['L1 – L2 Tronc Commun','L3 Spécialisation GLSI','L3 Spécialisation ASR','M-TWI'].map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,.75)', fontSize: '14px', marginBottom: '10px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div style={{
        width: '100%', maxWidth: 460, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
      }}>
        <div style={{
          width: '100%', background: '#fff', borderRadius: 'var(--radius-xl)',
          padding: '40px 36px', boxShadow: '0 24px 64px rgba(9,26,64,.4)',
          animation: 'fadeUp .4s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: 52, height: 52, background: 'var(--navy)', borderRadius: '16px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '20px', color: '#fff', fontFamily: 'var(--font-mono)',
              marginBottom: '14px',
            }}>IA</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)' }}>Connexion</h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>
              Accédez à votre espace étudiant
            </p>
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Adresse email" type="email" placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Mot de passe" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            {error && (
              <div style={{
                padding: '10px 14px', background: 'var(--red-light)',
                borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: '13px', fontWeight: 500,
              }}>{error}</div>
            )}
            <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '4px' }}>
              Se connecter
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--gray-500)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--blue-mid)' }}>S'inscrire</Link>
          </p>
        </div>
      </div>

      <style>{`@media (min-width: 900px) { .left-panel { display: flex !important; } }`}</style>
    </div>
  )
}