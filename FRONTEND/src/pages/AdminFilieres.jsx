import React, { useEffect, useState } from 'react'
import { filieresAPI } from '../utils/api'
import { Card, Button, Input, Toast, Spinner, EmptyState } from '../components/UI'
import { useToast } from '../hooks/useToast'

export default function AdminFilieres() {
  const { toasts, toast, remove } = useToast()
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    libelle_fil: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')

  // Charger les filières
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await filieresAPI.list()
        setFilieres(res.data.data)
      } catch (err) {
        toast('Erreur de chargement des filières', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const handleInputChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        // Mise à jour d'une filière existante
        await filieresAPI.update(editingId, form)
        toast('Filière mise à jour avec succès!', 'success')
      } else {
        // Création d'une nouvelle filière
        await filieresAPI.create(form)
        toast('Filière créée avec succès!', 'success')
      }
      // Recharger les données
      const res = await filieresAPI.list()
      setFilieres(res.data.data)
      resetForm()
    } catch (err) {
      toast(err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (filiere) => {
    setForm({
      libelle_fil: filiere.libelle_fil,
      description: filiere.description || ''
    })
    setEditingId(filiere.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette filière? Toutes les matières associées seront également supprimées!')) {
      setLoading(true)
      try {
        await filieresAPI.delete(id)
        toast('Filière supprimée avec succès!', 'success')
        const res = await filieresAPI.list()
        setFilieres(res.data.data)
      } catch (err) {
        toast('Erreur lors de la suppression', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const resetForm = () => {
    setForm({
      libelle_fil: '',
      description: ''
    })
    setEditingId(null)
  }

  const filteredFilieres = filieres.filter(f =>
    f.libelle_fil.toLowerCase().includes(search.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ marginBottom: '24px' }} className="fade-up">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>Gestion des Filières</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          {filieres.length} filière{filieres.length !== 1 ? 's' : ''} enregistrée{filieres.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulaire de création/modification */}
      <Card style={{ padding: '24px', marginBottom: '24px' }} className="fade-up">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '18px' }}>
          {editingId ? 'Modifier une filière' : 'Ajouter une nouvelle filière'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Libellé de la filière *"
            placeholder="Ex: Licence 1"
            value={form.libelle_fil}
            onChange={handleInputChange('libelle_fil')}
            required
          />

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              placeholder="Description de la filière..."
              value={form.description}
              onChange={handleInputChange('description')}
              rows={3}
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
                fontFamily: 'var(--font-sans)', resize: 'vertical', color: 'var(--gray-800)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Annuler
              </Button>
            )}
            <Button type="submit" loading={loading} size="lg">
              {editingId ? '📝 Mettre à jour' : '➕ Ajouter'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Barre de recherche */}
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="🔍 Rechercher une filière..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
            fontFamily: 'var(--font-sans)', color: 'var(--gray-800)'
          }}
        />
      </div>

      {/* Liste des filières */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner />
        </div>
      ) : filteredFilieres.length === 0 ? (
        <EmptyState icon="🏫" title="Aucune filière trouvée" subtitle="Ajoutez des filières en utilisant le formulaire ci-dessus." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredFilieres.map((filiere) => (
            <Card key={filiere.id} style={{ padding: '16px', position: 'relative' }} className="fade-up">
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(filiere)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  ✏️ Modifier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(filiere.id)}
                  style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)' }}
                >
                  🗑️ Supprimer
                </Button>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>
                {filiere.libelle_fil}
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <Badge color="purple">🎓 {filiere.nombre_etudiants || 0} étudiant{filiere.nombre_etudiants !== 1 ? 's' : ''}</Badge>
                <Badge color="blue">📚 {filiere.nombre_matieres || 0} matière{filiere.nombre_matieres !== 1 ? 's' : ''}</Badge>
              </div>

              {filiere.description && (
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
                  {filiere.description}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant Badge simple pour l'affichage
const Badge = ({ children, color }) => (
  <span style={{
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: `${color}20`,
    color: color,
    border: `1px solid ${color}`
  }}>
    {children}
  </span>
)