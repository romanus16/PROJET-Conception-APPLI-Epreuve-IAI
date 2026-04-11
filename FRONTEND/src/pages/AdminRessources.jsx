import React, { useEffect, useState } from 'react'
import { ressourcesAPI } from '../utils/api'
import { Card, Badge, Spinner, EmptyState } from '../components/UI'

const TYPE_ICONS   = { cours:'📚', td:'✏️', tp:'💻', examen:'📝', autre:'📎' }
const TYPE_LABELS  = { cours:'Cours', td:'TD', tp:'TP', examen:'Examen', autre:'Autre' }
const STATUT_COLOR = { en_attente:'yellow', valide:'green', refuse:'red' }
const STATUT_LABEL = { en_attente:'En attente', valide:'Validé', refuse:'Refusé' }

export default function AdminRessources() {
  const [ressources, setRessources] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filtStatut, setFiltStatut] = useState('')
  const [filtType,   setFiltType]   = useState('')

  useEffect(() => {
    ressourcesAPI.list().then(r => setRessources(r.data.data)).finally(() => setLoading(false))
  }, [])

  const filtered = ressources.filter(r => {
    const ms = !search ||
      r.titres_ressources.toLowerCase().includes(search.toLowerCase()) ||
      r.utilisateur?.nom.toLowerCase().includes(search.toLowerCase()) ||
      r.matiere?.nom_matiere.toLowerCase().includes(search.toLowerCase())
    const mst = !filtStatut || r.statut         === filtStatut
    const mt  = !filtType   || r.type_ressources=== filtType
    return ms && mst && mt
  })

  return (
    <div style={{ padding:'24px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }} className="fade-up">
        <h1 style={{ fontSize:'24px', fontWeight:800, color:'var(--navy)' }}>Toutes les ressources</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'14px', marginTop:'4px' }}>{filtered.length} résultat{filtered.length!==1?'s':''}</p>
      </div>

      {/* Filters */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'10px', marginBottom:'20px' }}>
        <input placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)', fontSize:'13px', background:'#fff', fontFamily:'var(--font-sans)', outline:'none' }} />
        <select value={filtStatut} onChange={e => setFiltStatut(e.target.value)}
          style={{ padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)', fontSize:'13px', background:'#fff', fontFamily:'var(--font-sans)', cursor:'pointer' }}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">⏳ En attente</option>
          <option value="valide">✅ Validé</option>
          <option value="refuse">❌ Refusé</option>
        </select>
        <select value={filtType} onChange={e => setFiltType(e.target.value)}
          style={{ padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-sm)', fontSize:'13px', background:'#fff', fontFamily:'var(--font-sans)', cursor:'pointer' }}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v,l]) => (
            <option key={v} value={v}>{TYPE_ICONS[v]} {l}</option>
          ))}
        </select>
      </div>

      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}><Spinner /></div>
        : filtered.length === 0
          ? <EmptyState icon="📭" title="Aucune ressource trouvée" subtitle="Modifiez vos filtres." />
          : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {filtered.map((r, i) => (
                <Card key={r.id} style={{ padding:'16px 20px', animationDelay:`${i*.03}s` }} className="fade-up">
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'24px', flexShrink:0 }}>{TYPE_ICONS[r.type_ressources]||'📎'}</span>
                    <div style={{ flex:1, minWidth:180 }}>
                      <p style={{ fontWeight:700, fontSize:'14px', color:'var(--gray-800)', marginBottom:'3px' }}>{r.titres_ressources}</p>
                      <p style={{ fontSize:'12px', color:'var(--gray-400)' }}>{r.matiere?.nom_matiere} · par {r.utilisateur?.prenom} {r.utilisateur?.nom}</p>
                    </div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
                      <Badge color={STATUT_COLOR[r.statut]}>{STATUT_LABEL[r.statut]}</Badge>
                      <Badge color="gray">{TYPE_LABELS[r.type_ressources]}</Badge>
                      <span style={{ fontSize:'12px', color:'var(--gray-400)' }}>📥 {r.nombre_telechargements}</span>
                      <span style={{ fontSize:'12px', color:'var(--gray-400)' }}>{new Date(r.date_soumission).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
      }
    </div>
  )
}