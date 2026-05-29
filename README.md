# IAI TOGO - Plateforme Éducative

Une plateforme web complète pour la gestion des ressources pédagogiques de l'IAI (Institut Africain d'Informatique) au Togo.

## 🎯 Fonctionnalités

### Pour les Étudiants
- 📚 Consulter les ressources pédagogiques (cours, TD, TP, examens)
- 📤 Soumettre des ressources pour validation
- 📄 Gérer les documents de stage
- 👤 Gérer son profil

### Pour les Administrateurs
- ✅ Valider ou refuser les ressources soumises
- 📊 Tableau de bord avec statistiques
- 👥 Gérer les étudiants
- 📁 Gérer les filières et matières
- 📧 Notifications automatiques par email

## 🛠️ Technologies

### Backend
- **Django REST Framework** - API REST
- **JWT** - Authentification sécurisée
- **SQLite** (développement) / **PostgreSQL** (production)
- **django-cors-headers** - Support CORS

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool rapide
- **React Router** - Navigation
- **Axios** - Requêtes HTTP

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/romanus16/PROJET-Conception-APPLI-Epreuve-IAI.git
cd "projet application epreuve iai"
```

### 2. Configuration du Backend

```bash
cd BACKEND

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements_clean.txt

# Copier le fichier d'environnement
copy .env.example .env  # Windows
# ou
cp .env.example .env    # Linux/Mac

# Appliquer les migrations
python manage.py makemigrations api
python manage.py migrate

# Créer un superutilisateur (admin)
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Le backend est maintenant accessible sur http://127.0.0.1:8000

### 3. Configuration du Frontend

Ouvrez un nouveau terminal :

```bash
cd FRONTEND

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

Le frontend est maintenant accessible sur http://localhost:3000

## 📁 Structure du Projet

```
projet application epreuve iai/
├── BACKEND/
│   ├── api/                    # Application Django principale
│   │   ├── models.py           # Modèles de données
│   │   ├── views.py            # Vues API
│   │   ├── serializers.py      # Sérialiseurs
│   │   ├── urls.py             # Routes API
│   │   └── permissions.py      # Permissions personnalisées
│   ├── iaitogo_backend/        # Configuration Django
│   │   └── settings.py         # Paramètres
│   ├── manage.py               # Script de gestion
│   ├── .env                    # Configuration locale
│   └── .env.example            # Exemple de configuration
│
├── FRONTEND/
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── context/            # Contextes React (Auth)
│   │   ├── pages/              # Pages de l'application
│   │   ├── utils/              # Utilitaires (API)
│   │   └── hooks/              # Hooks personnalisés
│   ├── package.json
│   └── vite.config.js          # Configuration Vite
│
└── README.md
```

## 📊 Modèles de Données

### Utilisateur
- `nom`, `prenom`, `email`, `role` (etudiant/admin)
- Authentification via JWT

### Étudiant
- `matricule`, `niveau` (L1, L2, L3_GLSI, L3_ASR)
- `filiere`, `annee_inscription`
- Lié à un Utilisateur (OneToOne)

### Filière
- `libelle_fil`, `description`

### Matière
- `nom_matiere`, `coef_ue`, `niveau`, `filiere`
- `credits`, `semestre`

### Ressources
- `titres_ressources`, `type_ressources` (cours, td, tp, examen, autre)
- `url` (fichier ZIP), `description`
- `statut` (en_attente, valide, refuse)
- Workflow de validation avec notification email

### DocumentStage
- `titre`, `type_document` (convention, rapport, attestation, autre)
- `url_document`, `est_modele_officiel`
- Validation par admin

## 🔐 Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :
- **Access Token** : Valide 60 minutes
- **Refresh Token** : Valide 7 jours
- Refresh automatique lors des requêtes 401

## 📧 Configuration Email

Pour activer les notifications par email :

1. Activez la validation en 2 étapes sur Gmail
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Mettez à jour `.env` :
```
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-app
```

## 🔗 API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `GET /api/auth/me/` - Profil utilisateur
- `POST /api/auth/token/refresh/` - Rafraîchir token

### Ressources
- `GET /api/ressources/` - Liste des ressources
- `POST /api/upload/ressource/` - Soumettre une ressource
- `GET /api/ressources/en-attente/` - Ressources en attente (admin)
- `POST /api/ressources/{id}/valider/` - Valider/refuser (admin)

### Étudiants (Admin)
- `GET /api/etudiants/` - Liste des étudiants
- `GET /api/stats/` - Statistiques

## 👥 Rôles

### Étudiant
- Peut soumettre des ressources (en attente de validation)
- Peut voir les ressources validées
- Peut gérer ses documents de stage

### Administrateur
- Accès complet à toutes les fonctionnalités
- Peut valider/refuser les ressources
- Peut créer des filières et matières
- Peut gérer les étudiants

## 📝 Licence

Projet développé pour l'IAI Togo - Institut Africain d'Informatique