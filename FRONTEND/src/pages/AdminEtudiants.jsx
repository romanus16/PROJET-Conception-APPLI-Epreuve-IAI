import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { Card, Badge, Spinner, EmptyState, Button, Modal, Input, Select, Toast } from '../components/UI'
import { useToast } from '../hooks/useToast'

const NIVEAUX       = ['L1','L2','L3_GLSI','L3_ASR']
const NIVEAU_COLORS = { L1:'blue', L2:'navy', L3_GLSI:'green', L3_ASR:'orange' }

export default function AdminEtudiants() {
  const { toasts, toast, remove } = useToast()
  const [etudiants,   setEtudiants]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterNiv,   setFilterNiv]   = useState('')
  const [createOpen,  setCreateOpen]  = useState(false)
  const [creating,    setCreating]    = useState(false)
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', password:'', matricule:'', niveau:'L1', telephone:'' })

  const load = () => {
    setLoading(true)
    api.get('/etudiants/')
      .then(r => setEtudiants(r.data.data || []))
      .catch(() => setEtudiants([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = etudiants.filter(e => {
    const u = e.utilisateur || {}
    const ms = !search ||
      `${u.prenom} ${u.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      e.matricule?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const mn = !filterNiv || e.niveau === filterNiv
    return ms && mn
  })

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.value }))

  const handleCreate = async ev => {
    ev.preventDefault()
    setCreating(true)
    try {
      await api.post('/auth/register/', {
        nom: form.nom, prenom: form.prenom, email: form.email,
        password: form.password, password2: form.password, role: 'etudiant',
        etudiant: { matricule: form.matricule, niveau: form.niveau, telephone: form.telephone },
      })
      toast('Étudiant créé avec succès !', 'success')
      setCreateOpen(false)
      setForm({ nom:'', prenom:'', email:'', password:'', matricule:'', niveau:'L1', telephone:'' })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur lors de la création', 'error')
    } finally { setCreating(false) }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }} className="fade-up">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>Étudiants</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            {filtered.length} étudiant{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Ajouter un étudiant</Button>
      </div>

      {/* Niveau filter chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {NIVEAUX.map(n => {
          const count = etudiants.filter(e => e.niveau === n).length
          const active = filterNiv === n
          return (
            <button key={n} onClick={() => setFilterNiv(active ? '' : n)}
              style={{
                background: active ? 'var(--navy)' : '#fff',
                border: active ? '2px solid var(--navy)' : '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)', padding: '12px', cursor: 'pointer',
                textAlign: 'center', transition: 'all .15s',
              }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: active ? '#fff' : 'var(--navy)' }}>{count}</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: active ? 'rgba(255,255,255,.7)' : 'var(--gray-500)', marginTop: '2px' }}>{n}</p>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <input placeholder="🔍  Rechercher par nom, matricule ou email…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-200)',
          borderRadius: 'var(--radius-sm)', fontSize: '14px', background: '#fff',
          fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '16px',
        }} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎓" title="Aucun étudiant trouvé"
          action={<Button onClick={() => setCreateOpen(true)}>Ajouter le premier étudiant</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {filtered.map((e, i) => {
            const u = e.utilisateur || {}
            const initials = `${u.prenom?.[0]||''}${u.nom?.[0]||''}`.toUpperCase()
            return (
              <Card key={e.id} style={{ padding: '18px 20px', animationDelay: `${i * .04}s` }} className="fade-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--navy), var(--blue-mid))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0,
                  }}>{initials || '?'}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gray-800)' }} className="truncate">{u.prenom} {u.nom}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)' }} className="truncate">{u.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge color={NIVEAU_COLORS[e.niveau] || 'gray'}>{e.niveau}</Badge>
                    {e.filiere && <Badge color="gray">{e.filiere.libelle_fil}</Badge>}
                  </div>
                  <span style={{
                    fontSize: '11px', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)',
                    background: 'var(--gray-50)', padding: '3px 8px', borderRadius: '6px',
                  }}>{e.matricule}</span>
                </div>
                {e.telephone && <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>📱 {e.telephone}</p>}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Ajouter un étudiant" maxWidth={560}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Prénom *" placeholder="Jean"   value={form.prenom}   onChange={set('prenom')} required />
            <Input label="Nom *"    placeholder="Dupont" value={form.nom}      onChange={set('nom')}    required />
          </div>
          <Input label="Email *"       type="email"    placeholder="jean@iai.tg"   value={form.email}     onChange={set('email')}     required />
          <Input label="Mot de passe *" type="password" placeholder="••••••••"     value={form.password}  onChange={set('password')}  required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Matricule *" placeholder="IAI2024001" value={form.matricule} onChange={set('matricule')} required />
            <Input label="Téléphone"   placeholder="+228 XX XX" value={form.telephone} onChange={set('telephone')} />
          </div>
          <Select label="Niveau *" value={form.niveau} onChange={set('niveau')}>
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button type="submit" loading={creating}>Créer l'étudiant</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}