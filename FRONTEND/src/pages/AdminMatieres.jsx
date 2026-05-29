import React, { useEffect, useState } from 'react'
import { matieresAPI, filieresAPI } from '../utils/api'
import { Card, Button, Input, Select, Toast, Spinner, EmptyState } from '../components/UI'
import { useToast } from '../hooks/useToast'

export default function AdminMatieres() {
  const { toasts, toast, remove } = useToast()
  const [matieres, setMatieres] = useState([])
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nom_matiere: '',
    coef_ue: '',
    niveau: 'L1',
    filiere: '',
    credits: 3,
    semestre: 1,
    description: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')

  // Charger les matières et filières
  useEffect(() => {
    const loadData = async () => {
      try {
        const [matieresRes, filieresRes] = await Promise.all([
          matieresAPI.list({ page_size: 1000 }),
          filieresAPI.list()
        ])
        setMatieres(matieresRes.data.data)
        setFilieres(filieresRes.data.data)
      } catch (err) {
        toast('Erreur de chargement des données', 'error')
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
        // Mise à jour d'une matière existante
        await matieresAPI.update(editingId, form)
        toast('Matière mise à jour avec succès!', 'success')
      } else {
        // Création d'une nouvelle matière
        await matieresAPI.create(form)
        toast('Matière créée avec succès!', 'success')
      }
      // Recharger les données
      const res = await matieresAPI.list({ page_size: 1000 })
      setMatieres(res.data.data)
      resetForm()
    } catch (err) {
      toast(err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (matiere) => {
    setForm({
      nom_matiere: matiere.nom_matiere,
      coef_ue: matiere.coef_ue,
      niveau: matiere.niveau,
      filiere: matiere.filiere,
      credits: matiere.credits,
      semestre: matiere.semestre,
      description: matiere.description || ''
    })
    setEditingId(matiere.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière?')) {
      setLoading(true)
      try {
        await matieresAPI.delete(id)
        toast('Matière supprimée avec succès!', 'success')
        const res = await matieresAPI.list({ page_size: 1000 })
        setMatieres(res.data.data)
      } catch (err) {
        toast('Erreur lors de la suppression', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const resetForm = () => {
    setForm({
      nom_matiere: '',
      coef_ue: '',
      niveau: 'L1',
      filiere: '',
      credits: 3,
      semestre: 1,
      description: ''
    })
    setEditingId(null)
  }

  const filteredMatieres = matieres.filter(m =>
    m.nom_matiere.toLowerCase().includes(search.toLowerCase()) ||
    m.filiere_nom.toLowerCase().includes(search.toLowerCase()) ||
    m.niveau.toLowerCase().includes(search.toLowerCase())
  )

  const NIVEAU_CHOICES = [
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3_GLSI', label: 'Licence 3 GLSI' },
    { value: 'L3_ASR', label: 'Licence 3 ASR' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ marginBottom: '24px' }} className="fade-up">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>Gestion des Matières</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          {matieres.length} matière{matieres.length !== 1 ? 's' : ''} enregistrée{matieres.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulaire de création/modification */}
      <Card style={{ padding: '24px', marginBottom: '24px' }} className="fade-up">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '18px' }}>
          {editingId ? 'Modifier une matière' : 'Ajouter une nouvelle matière'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Input
            label="Nom de la matière *"
            placeholder="Ex: Architecture et Maintenance"
            value={form.nom_matiere}
            onChange={handleInputChange('nom_matiere')}
            required
          />

          <Input
            label="Coefficient UE *"
            placeholder="Ex: 3"
            value={form.coef_ue}
            onChange={handleInputChange('coef_ue')}
            required
          />

          <Select
            label="Niveau *"
            value={form.niveau}
            onChange={handleInputChange('niveau')}
            required
          >
            {NIVEAU_CHOICES.map(n => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </Select>

          <Select
            label="Filière *"
            value={form.filiere}
            onChange={handleInputChange('filiere')}
            required
          >
            <option value="">Sélectionnez une filière</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>{f.libelle_fil}</option>
            ))}
          </Select>

          <Input
            label="Crédits *"
            type="number"
            placeholder="Ex: 3"
            value={form.credits}
            onChange={handleInputChange('credits')}
            required
          />

          <Select
            label="Semestre *"
            value={form.semestre}
            onChange={handleInputChange('semestre')}
            required
          >
            <option value="1">Semestre 1</option>
            <option value="2">Semestre 2</option>
          </Select>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              placeholder="Description de la matière..."
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

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
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
          placeholder="🔍 Rechercher une matière..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
            fontFamily: 'var(--font-sans)', color: 'var(--gray-800)'
          }}
        />
      </div>

      {/* Liste des matières */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner />
        </div>
      ) : filteredMatieres.length === 0 ? (
        <EmptyState icon="📚" title="Aucune matière trouvée" subtitle="Ajoutez des matières en utilisant le formulaire ci-dessus." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredMatieres.map((matiere) => (
            <Card key={matiere.id} style={{ padding: '16px', position: 'relative' }} className="fade-up">
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(matiere)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  ✏️ Modifier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(matiere.id)}
                  style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)' }}
                >
                  🗑️ Supprimer
                </Button>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>
                {matiere.nom_matiere}
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <Badge color="blue">{matiere.niveau}</Badge>
                <Badge color="purple">{matiere.filiere_nom}</Badge>
                <Badge color="green">Semestre {matiere.semestre}</Badge>
                <Badge color="orange">{matiere.credits} crédits</Badge>
              </div>

              {matiere.description && (
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
                  {matiere.description}
                </p>
              )}

              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>
                Coef: {matiere.coef_ue} · {matiere.nombre_ressources || 0} ressource{matiere.nombre_ressources !== 1 ? 's' : ''}
              </p>
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