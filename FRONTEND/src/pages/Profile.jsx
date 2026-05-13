import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, Button, Input, Badge, Toast } from '../components/UI'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

const NIVEAU_LABELS = { L1:'Licence 1', L2:'Licence 2', L3_GLSI:'L3 GLSI', L3_ASR:'L3 ASR' }

export default function Profile() {
  const { user, logout } = useAuth()
  const { toasts, toast, remove } = useToast()
  const [editing,   setEditing]   = useState(false)
  const [pwForm,    setPwForm]    = useState({ old_password:'', new_password:'', confirm:'' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError,   setPwError]   = useState('')

  const et       = user?.etudiant
  const initials = `${user?.prenom?.[0]||''}${user?.nom?.[0]||''}`.toUpperCase()

  const handlePw = async e => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) return setPwError('Les mots de passe ne correspondent pas')
    if (pwForm.new_password.length < 6)         return setPwError('Minimum 6 caractères')
    setPwLoading(true); setPwError('')
    try {
      await api.post('/auth/change-password/', { old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast('Mot de passe modifié avec succès !', 'success')
      setPwForm({ old_password:'', new_password:'', confirm:'' })
      setEditing(false)
    } catch (err) {
      setPwError(err.response?.data?.message || 'Mot de passe actuel incorrect')
    } finally { setPwLoading(false) }
  }

  return (
    <div style={{ padding:'24px', maxWidth:700, margin:'0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      {/* Hero card */}
      <Card style={{ padding:'32px', marginBottom:'20px', overflow:'hidden', position:'relative' }} className="fade-up">
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(15,37,87,.04)', pointerEvents:'none' }} />
        <div style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--navy), var(--blue-mid))',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:800, fontSize:'28px', flexShrink:0,
            boxShadow:'0 4px 20px rgba(15,37,87,.25)',
          }}>{initials}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'var(--navy)', marginBottom:'4px' }}>
              {user?.prenom} {user?.nom}
            </h1>
            <p style={{ fontSize:'14px', color:'var(--gray-500)', marginBottom:'10px' }}>{user?.email}</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <Badge color={user?.role==='admin'?'orange':'navy'}>
                {user?.role==='admin' ? '👑 Administrateur' : '🎓 Étudiant'}
              </Badge>
              {et?.niveau  && <Badge color="blue">{NIVEAU_LABELS[et.niveau]||et.niveau}</Badge>}
              {et?.filiere_nom && <Badge color="green">{et.filiere_nom}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Academic info */}
      {et && (
        <Card style={{ padding:'24px', marginBottom:'20px' }} className="fade-up">
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--navy)', marginBottom:'18px' }}>Informations académiques</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'14px' }}>
            {[
              { label:'Matricule',        value:et.matricule,                              icon:'🪪' },
              { label:'Niveau',           value:NIVEAU_LABELS[et.niveau]||et.niveau,       icon:'📊' },
              { label:'Filière',          value:et.filiere?.libelle_fil||'—',              icon:'🏫' },
              { label:'Année inscription',value:et.annee_inscription||'—',                 icon:'📅' },
              { label:'Téléphone',        value:et.telephone||'—',                         icon:'📱' },
              { label:'Adresse',          value:et.adresse||'—',                           icon:'📍' },
            ].map(item => (
              <div key={item.label} style={{ padding:'14px 16px', background:'var(--off-white)', borderRadius:'var(--radius-sm)', border:'1px solid var(--gray-100)' }}>
                <p style={{ fontSize:'11px', color:'var(--gray-400)', marginBottom:'4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>
                  {item.icon} {item.label}
                </p>
                <p style={{ fontSize:'14px', fontWeight:600, color:'var(--gray-700)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security */}
      <Card style={{ padding:'24px', marginBottom:'20px' }} className="fade-up">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--navy)' }}>Sécurité du compte</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Annuler' : '🔑 Changer le mot de passe'}
          </Button>
        </div>
        {!editing
          ? <div style={{ padding:'16px', background:'var(--off-white)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', color:'var(--gray-500)' }}>
              <span style={{ fontSize:'20px' }}>🔒</span>
              <span>Mot de passe sécurisé</span>
            </div>
          : <form onSubmit={handlePw} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <Input label="Mot de passe actuel"  type="password" placeholder="••••••••" value={pwForm.old_password}  onChange={e => setPwForm(f=>({...f,old_password:e.target.value}))}  required />
              <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" value={pwForm.new_password}  onChange={e => setPwForm(f=>({...f,new_password:e.target.value}))}  required />
              <Input label="Confirmer"            type="password" placeholder="••••••••" value={pwForm.confirm}       onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))}        required />
              {pwError && <div style={{ padding:'10px 14px', background:'var(--red-light)', borderRadius:'var(--radius-sm)', color:'var(--red)', fontSize:'13px' }}>{pwError}</div>}
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
                <Button type="submit" loading={pwLoading}>Modifier</Button>
              </div>
            </form>
        }
      </Card>

      {/* Danger zone */}
      <Card style={{ padding:'24px', border:'1px solid #fecaca' }} className="fade-up">
        <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--red)', marginBottom:'14px' }}>Zone de danger</h2>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <p style={{ fontSize:'14px', fontWeight:600, color:'var(--gray-700)' }}>Se déconnecter</p>
            <p style={{ fontSize:'13px', color:'var(--gray-400)' }}>Vous serez redirigé vers la page de connexion.</p>
          </div>
          <Button variant="danger" onClick={logout}>Se déconnecter</Button>
        </div>
      </Card>
    </div>
  )
}