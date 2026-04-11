import React, { useEffect, useState } from 'react'
import { statsAPI } from '../utils/api'
import { StatCard, Spinner, Card } from '../components/UI'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { statsAPI.get().then(r => setStats(r.data.data)).finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}><Spinner size={40} /></div>
  )

  const typeData = stats?.ressources_par_type || {}

  return (
    <div style={{ padding:'24px', maxWidth:1000, margin:'0 auto' }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
        borderRadius:'var(--radius-xl)', padding:'28px 32px', marginBottom:'28px', color:'#fff',
      }} className="fade-up">
        <h1 style={{ fontSize:'24px', fontWeight:800 }}>Tableau de bord Admin</h1>
        <p style={{ color:'rgba(255,255,255,.65)', fontSize:'14px', marginTop:'4px' }}>IAI-Ressources Togo — Vue d'ensemble</p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'14px', marginBottom:'28px' }}>
        <StatCard icon="🎓" label="Étudiants"  value={stats?.total_etudiants||0}          color="var(--navy)"        />
        <StatCard icon="🏫" label="Filières"   value={stats?.total_filieres||0}           color="#0e7490"            />
        <StatCard icon="📖" label="Matières"   value={stats?.total_matieres||0}           color="#7c3aed"            />
        <StatCard icon="📚" label="Ressources" value={stats?.total_ressources||0}         color="var(--orange-dark)" />
        <StatCard icon="⏳" label="En attente" value={stats?.ressources_en_attente||0}    color="var(--yellow)"  sub="À valider" />
        <StatCard icon="✅" label="Validées"   value={stats?.ressources_validees||0}      color="var(--green)"       />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* Bar chart by type */}
        <Card style={{ padding:'24px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--navy)', marginBottom:'18px' }}>Ressources par type</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { key:'cours',  label:'Cours',  icon:'📚', color:'var(--navy)'        },
              { key:'td',     label:'TD',     icon:'✏️', color:'#0e7490'            },
              { key:'tp',     label:'TP',     icon:'💻', color:'#7c3aed'            },
              { key:'examen', label:'Examen', icon:'📝', color:'var(--orange-dark)' },
              { key:'autre',  label:'Autre',  icon:'📎', color:'var(--gray-500)'    },
            ].map(({ key, label, icon, color }) => {
              const count = typeData[key] || 0
              const total = stats?.total_ressources || 1
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'13px', color:'var(--gray-600)', fontWeight:500 }}>{icon} {label}</span>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'var(--gray-700)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, background:'var(--gray-100)', borderRadius:'99px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'99px', transition:'width .5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Donut-style by status */}
        <Card style={{ padding:'24px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--navy)', marginBottom:'18px' }}>Statut des ressources</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[
              { label:'Validées',   value:stats?.ressources_validees,  total:stats?.total_ressources, color:'var(--green)'  },
              { label:'En attente', value:stats?.ressources_en_attente,total:stats?.total_ressources, color:'var(--yellow)' },
              { label:'Refusées',   value:stats?.ressources_refusees,  total:stats?.total_ressources, color:'var(--red)'    },
            ].map(item => {
              const pct = Math.round(((item.value||0) / (item.total||1)) * 100)
              return (
                <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{
                    width:68, height:68, borderRadius:'50%', flexShrink:0,
                    background:`conic-gradient(${item.color} ${pct*3.6}deg, var(--gray-100) 0)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <div style={{ width:50, height:50, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:item.color }}>
                      {pct}%
                    </div>
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'14px', color:'var(--gray-800)' }}>{item.label}</p>
                    <p style={{ fontSize:'22px', fontWeight:800, color:item.color }}>{item.value||0}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}