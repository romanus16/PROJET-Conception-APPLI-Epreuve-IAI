import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { filieresAPI, matieresAPI, ressourcesAPI } from '../utils/api'
import { Input, Select, Button, Card, Toast } from '../components/UI'
import { useToast } from '../hooks/useToast'

const TYPES = [
  { value:'cours',  label:'📚 Cours'              },
  { value:'td',     label:'✏️ Travaux Dirigés'    },
  { value:'tp',     label:'💻 Travaux Pratiques'  },
  { value:'examen', label:'📝 Examen'             },
  { value:'autre',  label:'📎 Autre'              },
]

export default function Upload() {
  const navigate = useNavigate()
  const { toasts, toast, remove } = useToast()
  const [filieres, setFilieres] = useState([])
  const [matieres, setMatieres] = useState([])
  const [form, setForm] = useState({ titres_ressources:'', type_ressources:'cours', filiere:'', matiere:'', description:'', file:null })
  const [loading, setLoading] = useState(false)

  useEffect(() => { filieresAPI.list().then(r => setFilieres(r.data.data)) }, [])
  useEffect(() => {
    if (form.filiere) matieresAPI.list({ filiere: form.filiere }).then(r => setMatieres(r.data.data))
    else setMatieres([])
  }, [form.filiere])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async e => {
    e.preventDefault()
    if (!form.file)    return toast('Veuillez sélectionner un fichier ZIP', 'error')
    if (!form.matiere) return toast('Veuillez sélectionner une matière',    'error')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('titres_ressources', form.titres_ressources)
      fd.append('type_ressources',   form.type_ressources)
      fd.append('matiere',           form.matiere)
      fd.append('description',       form.description)
      fd.append('url',               form.file)
      await ressourcesAPI.upload(fd)
      toast('Ressource envoyée pour validation !', 'success')
      setTimeout(() => navigate('/mes-ressources'), 1500)
    } catch (err) {
      toast(err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Erreur lors de l\'upload', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding:'24px', maxWidth:640, margin:'0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ marginBottom:'24px' }} className="fade-up">
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:'13px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'4px' }}>← Retour</button>
        <h1 style={{ fontSize:'24px', fontWeight:800, color:'var(--navy)' }}>Déposer une ressource</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'14px', marginTop:'4px' }}>Partagez vos cours, TDs, TPs ou examens</p>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'var(--radius)', padding:'14px 18px', marginBottom:'24px', fontSize:'13px', color:'#1d4ed8', display:'flex', gap:'10px' }}>
        <span>ℹ️</span>
        <span>Votre ressource sera soumise à validation par un administrateur. Vous recevrez un email de confirmation.</span>
      </div>

      <Card style={{ padding:'32px' }} className="fade-up">
        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          <Input label="Titre de la ressource *" placeholder="Ex: Cours Bases de Données – L3 GLSI"
            value={form.titres_ressources} onChange={set('titres_ressources')} required />
          <Select label="Type *" value={form.type_ressources} onChange={set('type_ressources')}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Select label="Filière *" value={form.filiere} onChange={set('filiere')} required>
            <option value="">Sélectionnez une filière</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{f.libelle_fil}</option>)}
          </Select>
          {matieres.length > 0 && (
            <Select label="Matière *" value={form.matiere} onChange={set('matiere')} required>
              <option value="">Sélectionnez une matière</option>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
            </Select>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'13px', fontWeight:600, color:'var(--gray-700)' }}>Description</label>
            <textarea placeholder="Décrivez brièvement le contenu…" value={form.description} onChange={set('description')} rows={3}
              style={{ padding:'11px 14px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius)', fontSize:'14px', outline:'none', fontFamily:'var(--font-sans)', resize:'vertical', color:'var(--gray-800)' }} />
          </div>

          {/* Drop zone */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'13px', fontWeight:600, color:'var(--gray-700)' }}>Fichier ZIP *</label>
            <div style={{
              border:`2px dashed ${form.file ? 'var(--green)' : 'var(--gray-200)'}`,
              borderRadius:'var(--radius)', padding:'28px', textAlign:'center',
              background: form.file ? 'var(--green-light)' : 'var(--gray-50)',
              transition:'all .2s', position:'relative', cursor:'pointer',
            }}>
              <input type="file" accept=".zip"
                onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}
                required />
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>{form.file ? '✅' : '📦'}</div>
              {form.file
                ? <p style={{ fontWeight:600, color:'var(--green)', fontSize:'14px' }}>{form.file.name}</p>
                : <>
                    <p style={{ fontWeight:600, color:'var(--gray-600)', fontSize:'14px' }}>Glissez votre fichier ZIP ici</p>
                    <p style={{ color:'var(--gray-400)', fontSize:'12px', marginTop:'4px' }}>ou cliquez pour sélectionner</p>
                  </>
              }
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={loading} size="lg">📤 Soumettre la ressource</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}