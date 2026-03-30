from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (FiliereViewSet, MatiereViewSet, RessourcesViewSet,
                    UtilisateurViewSet, EtudiantViewSet, DocumentStageViewSet)

router = DefaultRouter()
router.register(r'filieres', FiliereViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'ressources', RessourcesViewSet)
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'etudiants', EtudiantViewSet)
router.register(r'documents', DocumentStageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]