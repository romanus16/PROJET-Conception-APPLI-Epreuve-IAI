import React, { useEffect, useState } from 'react'
import { ressourcesAPI } from '../utils/api'
import { Card, Badge, Spinner, EmptyState, Button, Modal, Toast } from '../components/UI'
import { useToast } from '../hooks/useToast'

const TYPE_ICONS  = { cours:'📚', td:'✏️', tp:'💻', examen:'📝', autre:'📎' }
const TYPE_LABELS = { cours:'Cours', td:'TD', tp:'TP', examen:'Examen', autre:'Autre' }

export default function AdminValidation() {
  const { toasts, toast, remove } = useToast()
  const [ressources,    setRessources]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [selected,      setSelected]      = useState(null)
  const [refuseModal,   setRefuseModal]   = useState(false)
  const [commentaire,   setCommentaire]   = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const load = () => {
    setLoading(true)
    ressourcesAPI.enAttente()
      .then(r => setRessources(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const valider = async (ressource) => {
    setActionLoading(ressource.id)
    try {
      await ressourcesAPI.valider(ressource.id, { action: 'valider' })
      setRessources(prev => prev.filter(r => r.id !== ressource.id))
      toast(`✅ "${ressource.titres_ressources}" validée ! Email envoyé.`, 'success')
    } catch {
      toast('Erreur lors de la validation', 'error')
    } finally { setActionLoading(null) }
  }

  const openRefuse = (ressource) => {
    setSelected(ressource)
    setCommentaire('')
    setRefuseModal(true)
  }

  const confirmerRefus = async () => {
    if (!commentaire.trim()) return toast('Veuillez indiquer un motif de refus', 'error')
    setActionLoading(selected.id)
    try {
      await ressourcesAPI.valider(selected.id, { action: 'refuser', commentaire })
      setRessources(prev => prev.filter(r => r.id !== selected.id))
      setRefuseModal(false)
      toast(`❌ "${selected.titres_ressources}" refusée. Email envoyé.`, 'success')
    } catch {
      toast('Erreur lors du refus', 'error')
    } finally { setActionLoading(null) }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }} className="fade-up">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>Validation des ressources</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            {ressources.length} ressource{ressources.length !== 1 ? 's' : ''} en attente
          </p>
        </div>
        <button onClick={load} style={{
          background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '6px',
        }}>🔄 Actualiser</button>
      </div>

      {/* Alert */}
      {ressources.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--radius)',
          padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#92400e',
          display: 'flex', gap: '10px', alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>⏳</span>
          <span><strong>{ressources.length} ressource{ressources.length > 1 ? 's' : ''}</strong> attendent votre validation. Un email sera automatiquement envoyé à l'auteur.</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><Spinner size={40} /></div>
      ) : ressources.length === 0 ? (
        <EmptyState icon="🎉" title="Tout est à jour !" subtitle="Aucune ressource en attente de validation." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ressources.map((r, i) => (
            <Card key={r.id} style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * .05}s` }} className="fade-up">
              <div style={{ height: 4, background: 'linear-gradient(90deg, var(--orange), var(--yellow))' }} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 'var(--radius)',
                    background: 'var(--off-white)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '26px', flexShrink: 0,
                  }}>{TYPE_ICONS[r.type_ressources] || '📎'}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-800)' }}>
                        {r.titres_ressources}
                      </h3>
                      <Badge color="yellow">En attente</Badge>
                      <Badge color="blue">{TYPE_LABELS[r.type_ressources]}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--gray-500)' }}>
                      <span>📖 {r.matiere?.nom_matiere}</span>
                      <span>👤 {r.utilisateur?.prenom} {r.utilisateur?.nom}</span>
                      <span>📧 {r.utilisateur?.email}</span>
                      <span>📅 {new Date(r.date_soumission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {r.description && (
                      <p style={{
                        fontSize: '13px', color: 'var(--gray-500)', marginTop: '8px', lineHeight: 1.5,
                        background: 'var(--gray-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--gray-200)',
                      }}>{r.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)',
                  flexWrap: 'wrap', gap: '10px',
                }}>
                  <div>
                    {r.url && (
                      <a href={typeof r.url === 'object' ? r.url.url : r.url} target="_blank" rel="noreferrer"
                        style={{
                          background: 'var(--gray-100)', color: 'var(--gray-700)',
                          padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                          fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}>👁️ Voir le fichier</a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="danger"  size="sm" loading={actionLoading === r.id} onClick={() => openRefuse(r)}>✕ Refuser</Button>
                    <Button variant="success" size="sm" loading={actionLoading === r.id} onClick={() => valider(r)}>✓ Valider</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refuse Modal */}
      <Modal open={refuseModal} onClose={() => setRefuseModal(false)} title="Motif du refus">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: 'var(--off-white)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}>
              <strong>{selected.titres_ressources}</strong>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                par {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>Motif du refus *</label>
              <textarea
                placeholder="Ex: Le fichier est illisible, contenu hors sujet..."
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                rows={4}
                style={{
                  padding: '11px 14px', border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
                  fontFamily: 'var(--font-sans)', resize: 'vertical', color: 'var(--gray-800)',
                }}
              />
            </div>
            <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#c2410c' }}>
              📧 Un email avec ce motif sera automatiquement envoyé à l'auteur.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setRefuseModal(false)}>Annuler</Button>
              <Button variant="danger" loading={actionLoading === selected?.id} onClick={confirmerRefus}>Confirmer le refus</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}