import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Select } from '../components/UI'

const NIVEAUX = ['L1','L2','L3_GLSI','L3_ASR']
const NV_LABEL = { L1:'Licence 1', L2:'Licence 2', L3_GLSI:'L3 GLSI', L3_ASR:'L3 ASR' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom:'', prenom:'', email:'', password:'', password2:'',
    niveau:'L1', matricule:'', telephone:'',
  })
  const [errors, setErrors]   = useState({})
  const [apiErr, setApiErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.nom)      e.nom      = 'Obligatoire'
    if (!form.prenom)   e.prenom   = 'Obligatoire'
    if (!form.email)    e.email    = 'Obligatoire'
    if ((form.password || '').length < 6) e.password = 'Minimum 6 caractères'
    if (form.password !== form.password2) e.password2 = 'Les mots de passe ne correspondent pas'
    if (!form.matricule) e.matricule = 'Obligatoire'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handle = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setApiErr('')
    try {
      await register({
        nom: form.nom, prenom: form.prenom, email: form.email,
        password: form.password, password2: form.password2, role: 'etudiant',
        etudiant: { matricule: form.matricule, niveau: form.niveau, telephone: form.telephone },
      })
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        const flat = {}
        Object.entries(data.errors).forEach(([k,v]) => { flat[k] = Array.isArray(v) ? v[0] : v })
        setErrors(flat)
      } else setApiErr(data?.message || 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 60%, var(--navy-light) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 520, background: '#fff',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(9,26,64,.4)', animation: 'fadeUp .4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: 52, height: 52, background: 'var(--navy)', borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '20px', color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '12px',
          }}>IA</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)' }}>Créer un compte</h2>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>Rejoignez IAI-Ressources Togo</p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Prénom" placeholder="Jean"   value={form.prenom}   onChange={set('prenom')}   error={errors.prenom}   required />
            <Input label="Nom"    placeholder="Dupont" value={form.nom}     onChange={set('nom')}     error={errors.nom}     required />
          </div>
          <Input label="Email" type="email" placeholder="vous@iai.tg" value={form.email} onChange={set('email')} error={errors.email} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Matricule" placeholder="IAI2024XXX" value={form.matricule} onChange={set('matricule')} error={errors.matricule} required />
            <Input label="Téléphone" placeholder="+228 XX XX XX" value={form.telephone} onChange={set('telephone')} />
          </div>
          <Select label="Niveau" value={form.niveau} onChange={set('niveau')}>
            {NIVEAUX.map(n => <option key={n} value={n}>{NV_LABEL[n]}</option>)}
          </Select>
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} required />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} error={errors.password2} required />
          {apiErr && (
            <div style={{ padding: '10px 14px', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: '13px' }}>
              {apiErr}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '4px' }}>S'inscrire</Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: 'var(--gray-500)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--blue-mid)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}