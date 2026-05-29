# IAI TOGO - TODO & Notes

## ✅ Tâches Complétées

### Backend
- [x] Configuration Django avec Django REST Framework
- [x] Modèle Utilisateur personnalisé avec rôles (etudiant/admin)
- [x] Modèles : Filiere, Etudiant, Matiere, Ressources, DocumentStage
- [x] Authentification JWT (SimpleJWT)
- [x] API complète avec vues et serializers
- [x] Permissions personnalisées (IsAdminUser, CanViewRessource)
- [x] Système de validation des ressources avec notifications email
- [x] CORS configuré pour le frontend React
- [x] Support SQLite (développement) / PostgreSQL (production)
- [x] Fichiers .env et .env.example créés
- [x] Admin Django configuré avec tous les modèles
- [x] Correction upload document de stage (FileField au lieu de URLField)
- [x] Notification automatique aux admins lors du dépôt de ressource par étudiant

### Frontend
- [x] Configuration React + Vite
- [x] Authentification avec AuthContext
- [x] Routes protégées (ProtectedRoute)
- [x] Pages : Login, Register, Dashboard, Cours, Stages, Upload, Profile
- [x] Pages Admin : Dashboard, Validation, Ressources, Etudiants
- [x] Composants UI réutilisables (Button, Input, Card, Modal, etc.)
- [x] API client avec Axios et intercepteurs (refresh token auto)
- [x] Proxy Vite configuré vers le backend (port 8000)
- [x] Gestion des erreurs et notifications (Toast)
- [x] Réactivation du champ filière dans le formulaire de dépôt de ressource avec L1, L2, L3

### Documentation
- [x] README.md complet avec instructions d'installation
- [x] .env.example avec toutes les variables nécessaires

## 🔧 Corrections Appliquées

1. **Vite.config.js** : Proxy corrigé de port 8080 → 8000
2. **Settings.py** : 
   - Suppression de sslmode 'require' pour PostgreSQL
   - Ajout du fallback SQLite automatique
3. **Views.py** : 
   - Correction upload document de stage (gestion des fichiers)
   - Ajout notification automatique aux admins
4. **Models.py** : 
   - DocumentStage.url_document changé de URLField à FileField
5. **API.js** : Ajout de etudiantsAPI pour le frontend
6. **Upload.jsx** : Suppression du champ filière, affichage de toutes les matières

## 📋 Prochaines Améliorations Possibles

- [ ] Ajouter des tests unitaires (backend & frontend)
- [ ] Implémenter le téléchargement de fichiers avec compteur
- [ ] Ajouter la pagination sur les listes
- [ ] Améliorer l'interface avec plus de graphismes
- [ ] Ajouter un système de commentaires sur les ressources
- [ ] Implémenter la recherche avancée
- [ ] Ajouter des exports (Excel, PDF)
- [ ] Mettre en place un système de favoris/likes

## 🐛 Bugs Connus

Aucun bug connu à ce jour.

## 🚀 Démarrage Rapide

```bash
# Backend
cd BACKEND
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements_clean.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (nouveau terminal)
cd FRONTEND
npm install
npm run dev
```

Visitez http://localhost:3000