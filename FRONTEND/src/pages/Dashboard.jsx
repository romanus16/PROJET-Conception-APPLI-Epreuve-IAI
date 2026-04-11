import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { filieresAPI, ressourcesAPI } from '../utils/api'
import { Card, Spinner, Badge } from '../components/UI'

const TYPE_ICONS  = { cours:'📚', td:'✏️', tp:'💻', examen:'📝', autre:'📎' }
const TYPE_LABELS = { cours:'Cours', td:'TD', tp:'TP', examen:'Examen', autre:'Autre' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filieres, setFilieres] = useState([])
  const [recent,   setRecent]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([filieresAPI.list(), ressourcesAPI.list()])
      .then(([f, r]) => { setFilieres(f.data.data); setRecent(r.data.data.slice(0, 4)) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <Spinner size={40} />
    </div>
  )

  const et = user?.etudiant

  return (
    <div style={{ padding:'24px', maxWidth:900, margin:'0 auto' }}>
      {/* Hero */}
      <div className="fade-up" style={{
        background:'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
        borderRadius:'var(--radius-xl)', padding:'32px 36px', marginBottom:'28px',
        color:'#fff', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(240,124,30,.15)', pointerEvents:'none' }} />
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,.6)', marginBottom:'4px' }}>Bonjour 👋</p>
        <h1 style={{ fontSize:'26px', fontWeight:800, marginBottom:'10px' }}>{user?.prenom} {user?.nom}</h1>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {et && <>
            <span style={{ background:'rgba(255,255,255,.15)', borderRadius:'8px', padding:'4px 12px', fontSize:'13px', fontWeight:600 }}>{et.matricule}</span>
            <span style={{ background:'var(--orange)', borderRadius:'8px', padding:'4px 12px', fontSize:'13px', fontWeight:600 }}>{et.niveau}</span>
          </>}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'14px', marginBottom:'32px' }}>
        {[
          { icon:'📚', label:'Cours & Épreuves',      path:'/cours',          color:'var(--navy)' },
          { icon:'💼', label:'Espace Stage',           path:'/stages',         color:'#0e7490' },
          { icon:'📤', label:'Déposer une ressource',  path:'/upload',         color:'var(--orange-dark)' },
          { icon:'📋', label:'Mes ressources',         path:'/mes-ressources', color:'#7c3aed' },
        ].map((item, i) => (
          <Card key={item.path} hover onClick={() => navigate(item.path)}
            style={{ padding:'20px 18px', cursor:'pointer', animationDelay:`${i*.07}s` }}
            className="fade-up">
            <div style={{ width:44, height:44, borderRadius:'var(--radius)', background:item.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'12px' }}>
              {item.icon}
            </div>
            <p style={{ fontSize:'13px', fontWeight:700, color:'var(--gray-800)', lineHeight:1.3 }}>{item.label}</p>
            <div style={{ marginTop:'8px', fontSize:'11px', color:item.color, fontWeight:600 }}>Accéder →</div>
          </Card>
        ))}
      </div>

      {/* Filières */}
      <section style={{ marginBottom:'32px' }}>
        <h2 style={{ fontSize:'17px', fontWeight:800, color:'var(--navy)', marginBottom:'14px' }}>Filières disponibles</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px' }}>
          {filieres.map((f, i) => (
            <Card key={f.id} hover onClick={() => navigate(`/cours?filiere=${f.id}`)}
              style={{ padding:'18px 20px', animationDelay:`${i*.06}s` }} className="fade-up">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'22px' }}>🎓</span>
                <Badge color="navy">{f.nombre_etudiants || 0} ét.</Badge>
              </div>
              <p style={{ fontWeight:700, fontSize:'14px', color:'var(--navy)', marginBottom:'4px' }}>{f.libelle_fil}</p>
              <p style={{ fontSize:'12px', color:'var(--gray-500)' }}>{f.nombre_matieres || 0} matières</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Ressources récentes */}
      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:800, color:'var(--navy)' }}>Ressources récentes</h2>
          <button onClick={() => navigate('/cours')} style={{ background:'none', border:'none', color:'var(--blue-mid)', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Tout voir →</button>
        </div>
        {recent.length === 0
          ? <p style={{ color:'var(--gray-400)', fontSize:'14px', textAlign:'center', padding:'32px' }}>Aucune ressource disponible.</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {recent.map(r => (
                <Card key={r.id} style={{ padding:'14px 18px' }} className="fade-up">
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:42, height:42, borderRadius:'var(--radius-sm)', background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
                      {TYPE_ICONS[r.type_ressources] || '📎'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="truncate" style={{ fontWeight:600, fontSize:'14px', color:'var(--gray-800)' }}>{r.titres_ressources}</p>
                      <p style={{ fontSize:'12px', color:'var(--gray-400)', marginTop:'2px' }}>{r.matiere?.nom_matiere} · {TYPE_LABELS[r.type_ressources]}</p>
                    </div>
                    <Badge color="blue">{TYPE_LABELS[r.type_ressources]}</Badge>
                  </div>
                </Card>
              ))}
            </div>
        }
      </section>
    </div>
  )
}