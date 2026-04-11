# api/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentification
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/me/', views.me, name='me'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/etudiants/', views.get_etudiants, name='etudiants'),
    
    # Filières
    path('filieres/', views.get_filieres, name='filieres'),
    path('filieres/create/', views.create_filiere, name='create_filiere'),
    
    # Matières
    path('matieres/', views.get_matieres, name='matieres'),
    path('matieres/create/', views.create_matiere, name='create_matiere'),
    
    # Ressources avec validation
    path('ressources/', views.get_ressources, name='ressources'),
    path('ressources/en-attente/', views.get_ressources_en_attente, name='ressources_en_attente'),
    path('ressources/mes-ressources/', views.get_mes_ressources, name='mes_ressources'),
    path('ressources/<int:pk>/valider/', views.valider_ressource, name='valider_ressource'),
    path('upload/ressource/', views.upload_ressource, name='upload_ressource'),
    
    # Documents de stage
    path('documents/', views.get_documents_stage, name='documents'),
    path('upload/document/', views.upload_document_stage, name='upload_document'),
    
    # Statistiques
    path('stats/', views.get_stats, name='stats'),
]