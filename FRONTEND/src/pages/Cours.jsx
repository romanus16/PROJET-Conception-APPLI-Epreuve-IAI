import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filieresAPI, matieresAPI, ressourcesAPI } from '../utils/api'
import { Card, Badge, Spinner, EmptyState } from '../components/UI'

const TYPE_ICONS   = { cours:'📚', td:'✏️', tp:'💻', examen:'📝', autre:'📎' }
const TYPE_LABELS  = { cours:'Cours', td:'TD', tp:'TP', examen:'Examen', autre:'Autre' }
const TYPE_COLORS  = { cours:'navy', td:'blue', tp:'green', examen:'orange', autre:'gray' }
const NIVEAUX      = ['L1','L2','L3_GLSI','L3_ASR']

export default function Cours() {
  const [sp, setSp] = useSearchParams()
  const [filieres,  setFilieres]  = useState([])
  const [matieres,  setMatieres]  = useState([])
  const [ressources,setRessources]= useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,   setTab]   = useState('all')
  const [search,setSearch]= useState('')

  const filiereId = sp.get('filiere') || ''
  const niveau    = sp.get('niveau')  || ''
  const matiereId = sp.get('matiere') || ''

  useEffect(() => { filieresAPI.list().then(r => setFilieres(r.data.data)) }, [])
  useEffect(() => {
    const p = {}
    if (filiereId) p.filiere = filiereId
    if (niveau)    p.niveau  = niveau
    matieresAPI.list(p).then(r => setMatieres(r.data.data))
  }, [filiereId, niveau])
  useEffect(() => {
    setLoading(true)
    const p = {}
    if (matiereId)          p.matiere = matiereId
    if (tab === 'epreuves') p.type    = 'examen'
    ressourcesAPI.list(p).then(r => setRessources(r.data.data)).finally(() => setLoading(false))
  }, [matiereId, tab])

  const filtered = ressources.filter(r =>
    !search ||
    r.titres_ressources.toLowerCase().includes(search.toLowerCase()) ||
    r.matiere?.nom_matiere.toLowerCase().includes(search.toLowerCase())
  )

  const setP = (k, v) => {
    const p = new URLSearchParams(sp)
    if (v) p.set(k, v); else p.delete(k)
    if (k === 'filiere') p.delete('matiere')
    setSp(p)
  }

  const pill = (active, onClick, label) => (
    <button onClick={onClick} style={{
      padding:'6px 14px', borderRadius:'99px', cursor:'pointer', transition:'all .15s',
      border:`1.5px solid ${active ? 'var(--navy)' : 'var(--gray-200)'}`,
      background: active ? 'var(--navy)' : '#fff',
      color: active ? '#fff' : 'var(--gray-600)',
      fontSize:'12px', fontWeight:600,
    }}>{label}</button>
  )

  return (
    <div style={{ padding:'24px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:'20px' }} className="fade-up">
        <h1 style={{ fontSize:'24px', fontWeight:800, color:'var(--navy)' }}>Cours & Épreuves</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'14px', marginTop:'4px' }}>Trouvez tous vos supports pédagogiques</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', background:'var(--gray-100)', borderRadius:'var(--radius)', padding:'4px', width:'fit-content' }}>
        {[{id:'all',label:'Tout'},{id:'cours',label:'Cours & Livres'},{id:'epreuves',label:'Anciennes Épreuves'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 18px', borderRadius:'8px', border:'none', cursor:'pointer',
            fontSize:'13px', fontWeight:600, transition:'all .15s',
            background: tab===t.id ? '#fff' : 'transparent',
            color: tab===t.id ? 'var(--navy)' : 'var(--gray-500)',
            boxShadow: tab===t.id ? 'var(--shadow-sm)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'10px', marginBottom:'16px' }}>
        {[
          { value: filiereId, onChange: e => setP('filiere',e.target.value), placeholder:'Toutes les filières', options: filieres.map(f=>({value:f.id,label:f.libelle_fil})) },
          { value: niveau,    onChange: e => setP('niveau',e.target.value),  placeholder:'Tous les niveaux',    options: NIVEAUX.map(n=>({value:n,label:n})) },
          { value: matiereId, onChange: e => setP('matiere',e.target.value), placeholder:'Toutes les matières', options: matieres.map(m=>({value:m.id,label:m.nom_matiere})) },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={sel.onChange} style={{
            padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)',
            fontSize:'13px', background:'#fff', fontFamily:'var(--font-sans)', cursor:'pointer', outline:'none',
          }}>
            <option value="">{sel.placeholder}</option>
            {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <input placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)', fontSize:'13px', background:'#fff', fontFamily:'var(--font-sans)', outline:'none' }} />
      </div>

      {/* Matière chips */}
      {matieres.length > 0 && (
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
          {pill(!matiereId, () => setP('matiere',''), 'Tout')}
          {matieres.map(m => pill(matiereId===String(m.id), () => setP('matiere',String(m.id)), m.nom_matiere))}
        </div>
      )}

      {/* Results */}
      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}><Spinner /></div>
        : filtered.length === 0
          ? <EmptyState icon="📭" title="Aucune ressource trouvée" subtitle="Essayez de modifier vos filtres." />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
              {filtered.map((r, i) => (
                <Card key={r.id} hover style={{ padding:0, overflow:'hidden', animationDelay:`${i*.04}s` }} className="fade-up">
                  <div style={{ padding:'18px 20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                      <div style={{ width:44, height:44, borderRadius:'var(--radius-sm)', background:'var(--off-white)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>
                        {TYPE_ICONS[r.type_ressources]||'📎'}
                      </div>
                      <Badge color={TYPE_COLORS[r.type_ressources]||'gray'}>{TYPE_LABELS[r.type_ressources]}</Badge>
                    </div>
                    <h3 style={{ fontSize:'14px', fontWeight:700, color:'var(--gray-800)', marginBottom:'4px', lineHeight:1.4 }}>{r.titres_ressources}</h3>
                    <p style={{ fontSize:'12px', color:'var(--gray-400)' }}>{r.matiere?.nom_matiere}</p>
                    {r.description && <p style={{ fontSize:'12px', color:'var(--gray-500)', marginTop:'8px', lineHeight:1.5 }}>{r.description.substring(0,80)}…</p>}
                  </div>
                  <div style={{ borderTop:'1px solid var(--gray-100)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'12px', color:'var(--gray-400)' }}>📥 {r.nombre_telechargements||0}</span>
                    {r.url && (
                      <a href={typeof r.url==='object'?r.url.url:r.url} target="_blank" rel="noreferrer"
                        style={{ background:'var(--navy)', color:'#fff', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
                        Télécharger
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
      }
    </div>
  )
}