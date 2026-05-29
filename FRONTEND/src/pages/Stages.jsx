import React, { useEffect, useState } from 'react'
import { documentsAPI } from '../utils/api'
import { Card, Badge, Spinner, EmptyState, Button, Modal, Input, Select, Toast } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

const TYPE_DOCS = [
  { value:'convention', label:'📄 Convention de stage' },
  { value:'rapport',    label:'📑 Rapport de stage'   },
  { value:'attestation',label:'📜 Attestation'        },
  { value:'autre',      label:'📎 Autre'              },
]
const QUICK = [
  { icon:'📋', label:'Modèle de CV',          desc:'Template Word professionnel', color:'#0e7490' },
  { icon:'✉️', label:'Lettre de Motivation',   desc:'Structure type',             color:'#7c3aed' },
  { icon:'📊', label:'Fiche de Suivi',         desc:'Suivi hebdomadaire',         color:'#d97706' },
  { icon:'📑', label:'Rapport de Stage',       desc:'Plan officiel IAI',          color:'#dc2626' },
]

export default function Stages() {
  const { user } = useAuth()
  const { toasts, toast, remove } = useToast()
  const [docs,    setDocs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)
  const [form,    setForm]    = useState({ titre:'', type_document:'rapport', file:null })
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    documentsAPI.list().then(r => setDocs(r.data.data)).finally(() => setLoading(false))
  }, [])

  const handleUpload = async e => {
    e.preventDefault()
    if (!form.file) return toast('Veuillez sélectionner un fichier', 'error')
    if (!form.titre.trim()) return toast('Veuillez entrer un titre', 'error')
    
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titre', form.titre.trim())
      fd.append('type_document', form.type_document)
      fd.append('url_document', form.file)
      
      const res = await documentsAPI.upload(fd)
      
      if (res.data.success) {
        setDocs(d => [res.data.data, ...d])
        setOpen(false)
        toast('Document déposé avec succès !', 'success')
        setForm({ titre:'', type_document:'rapport', file:null })
      } else {
        const errorMsg = res.data.message || res.data.errors 
          ? JSON.stringify(res.data.errors) 
          : 'Erreur inconnue'
        toast(`Erreur: ${errorMsg}`, 'error')
      }
    } catch (err) {
      console.error('Upload error:', err)
      const errorMsg = err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors)
        : err.response?.data?.message 
        ? err.response.data.message
        : 'Erreur lors de l\'upload. Vérifiez votre connexion.'
      toast(errorMsg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding:'24px', maxWidth:900, margin:'0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      {/* Banner */}
      <div style={{
        background:'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
        borderRadius:'var(--radius-xl)', padding:'28px 32px', marginBottom:'28px',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px',
      }} className="fade-up">
        <div>
          <div style={{ fontSize:'28px', marginBottom:'8px' }}>🎓</div>
          <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'4px' }}>Espace Stage</h1>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,.7)' }}>Gérez vos documents et suivez votre stage</p>
        </div>
        <Button onClick={() => setOpen(true)}
          style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,.3)' }}>
          + Déposer un document
        </Button>
      </div>

      {/* Quick docs */}
      <section style={{ marginBottom:'28px' }}>
        <h2 style={{ fontSize:'16px', fontWeight:800, color:'var(--navy)', marginBottom:'14px' }}>Guide & Modèles officiels</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px' }}>
          {QUICK.map((d,i) => (
            <Card key={d.label} hover style={{ padding:'18px', cursor:'pointer', animationDelay:`${i*.06}s` }} className="fade-up">
              <div style={{ width:44, height:44, borderRadius:'var(--radius-sm)', background:d.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'10px' }}>{d.icon}</div>
              <p style={{ fontWeight:700, fontSize:'13px', color:'var(--gray-800)', marginBottom:'4px' }}>{d.label}</p>
              <p style={{ fontSize:'11px', color:'var(--gray-400)' }}>{d.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA validation */}
      <Card style={{ padding:'20px 24px', marginBottom:'28px', background:'linear-gradient(90deg,#fff7ed,#fff)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:48, height:48, background:'var(--orange)', borderRadius:'var(--radius)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>✅</div>
            <div>
              <p style={{ fontWeight:700, color:'var(--navy)', fontSize:'15px' }}>Validation de Stage</p>
              <p style={{ color:'var(--gray-500)', fontSize:'13px' }}>Soumettez votre rapport pour validation</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)}>Soumettre mon rapport →</Button>
        </div>
      </Card>

      {/* My docs */}
      <section>
        <h2 style={{ fontSize:'16px', fontWeight:800, color:'var(--navy)', marginBottom:'14px' }}>Mes documents ({docs.length})</h2>
        {loading
          ? <div style={{ display:'flex', justifyContent:'center', padding:'32px' }}><Spinner /></div>
          : docs.length === 0
            ? <EmptyState icon="📂" title="Aucun document" subtitle="Déposez votre premier document." action={<Button onClick={() => setOpen(true)}>Déposer</Button>} />
            : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {docs.map(d => (
                  <Card key={d.id} style={{ padding:'16px 20px' }} className="fade-up">
                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                      <span style={{ fontSize:'28px' }}>{TYPE_DOCS.find(t=>t.value===d.type_document)?.label.split(' ')[0]||'📎'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:'14px', color:'var(--gray-800)' }} className="truncate">{d.titre}</p>
                        <p style={{ fontSize:'12px', color:'var(--gray-400)', marginTop:'2px' }}>
                          {TYPE_DOCS.find(t=>t.value===d.type_document)?.label.replace(/^[^ ]+ /,'')}
                        </p>
                      </div>
                      <Badge color={d.est_valide?'green':'yellow'}>{d.est_valide?'Validé':'En attente'}</Badge>
                      <a href={d.url_document?.startsWith('http') ? d.url_document : `http://127.0.0.1:8000${d.url_document}`} target="_blank" rel="noreferrer"
                        style={{ background:'var(--navy)', color:'#fff', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>Voir</a>
                    </div>
                    {d.commentaire_admin && (
                      <div style={{ marginTop:'10px', padding:'8px 12px', background:'var(--yellow-light)', borderRadius:'var(--radius-sm)', fontSize:'12px', color:'var(--yellow)' }}>
                        💬 {d.commentaire_admin}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
        }
      </section>

      {/* Upload modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Déposer un document de stage">
        <form onSubmit={handleUpload} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <Input label="Titre du document" placeholder="Ex: Rapport de stage – Entreprise XYZ" value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))} required />
          <Select label="Type" value={form.type_document} onChange={e => setForm(f=>({...f,type_document:e.target.value}))}>
            {TYPE_DOCS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'13px', fontWeight:600, color:'var(--gray-700)' }}>Fichier</label>
            <input type="file" accept=".pdf,.doc,.docx,.zip"
              onChange={e => setForm(f=>({...f,file:e.target.files[0]}))}
              style={{ padding:'10px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)', fontSize:'14px', fontFamily:'var(--font-sans)' }}
              required />
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>Déposer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}