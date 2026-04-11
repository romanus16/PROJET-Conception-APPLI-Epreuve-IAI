import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ressourcesAPI } from '../utils/api'
import { Card, Badge, Spinner, EmptyState, Button } from '../components/UI'

const TYPE_ICONS   = { cours:'📚', td:'✏️', tp:'💻', examen:'📝', autre:'📎' }
const STATUT_COLOR = { en_attente:'yellow', valide:'green', refuse:'red' }
const STATUT_LABEL = { en_attente:'En attente', valide:'Validé', refuse:'Refusé' }

export default function MesRessources() {
  const navigate = useNavigate()
  const [ressources, setRessources] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    ressourcesAPI.mesRessources().then(r => setRessources(r.data.data)).finally(() => setLoading(false))
  }, [])

  const stats = {
    total:      ressources.length,
    valide:     ressources.filter(r => r.statut==='valide').length,
    en_attente: ressources.filter(r => r.statut==='en_attente').length,
    refuse:     ressources.filter(r => r.statut==='refuse').length,
  }

  return (
    <div style={{ padding:'24px', maxWidth:800, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'var(--navy)' }}>Mes ressources</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'14px', marginTop:'4px' }}>Gérez vos contributions</p>
        </div>
        <Button onClick={() => navigate('/upload')}>+ Nouvelle ressource</Button>
      </div>

      {/* Mini stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'24px' }}>
        {[
          { label:'Total',      value:stats.total,      color:'var(--navy)' },
          { label:'Validées',   value:stats.valide,     color:'var(--green)' },
          { label:'En attente', value:stats.en_attente, color:'var(--yellow)' },
          { label:'Refusées',   value:stats.refuse,     color:'var(--red)' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:'var(--radius)', padding:'14px 16px', border:'1px solid var(--gray-100)', textAlign:'center' }}>
            <p style={{ fontSize:'22px', fontWeight:800, color:s.color }}>{s.value}</p>
            <p style={{ fontSize:'11px', color:'var(--gray-500)', marginTop:'2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}><Spinner /></div>
        : ressources.length === 0
          ? <EmptyState icon="📤" title="Vous n'avez pas encore soumis de ressource"
              subtitle="Partagez vos cours et TDs avec vos camarades."
              action={<Button onClick={() => navigate('/upload')}>Déposer ma première ressource</Button>} />
          : <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {ressources.map(r => (
                <Card key={r.id} style={{ padding:'18px 22px' }} className="fade-up">
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:46, height:46, borderRadius:'var(--radius-sm)', background:'var(--off-white)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                      {TYPE_ICONS[r.type_ressources]||'📎'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'4px' }}>
                        <h3 style={{ fontWeight:700, fontSize:'14px', color:'var(--gray-800)' }} className="truncate">{r.titres_ressources}</h3>
                        <Badge color={STATUT_COLOR[r.statut]}>{STATUT_LABEL[r.statut]}</Badge>
                      </div>
                      <p style={{ fontSize:'12px', color:'var(--gray-400)' }}>
                        {r.matiere?.nom_matiere} · {new Date(r.date_soumission).toLocaleDateString('fr-FR')}
                      </p>
                      {r.statut==='refuse' && r.commentaire_refus && (
                        <div style={{ marginTop:'6px', padding:'6px 10px', background:'var(--red-light)', borderRadius:'6px', fontSize:'12px', color:'var(--red)' }}>
                          Motif : {r.commentaire_refus}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize:'12px', color:'var(--gray-400)', flexShrink:0 }}>📥 {r.nombre_telechargements}</span>
                  </div>
                </Card>
              ))}
            </div>
      }
    </div>
  )
}