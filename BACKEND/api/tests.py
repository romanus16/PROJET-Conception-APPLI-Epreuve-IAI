from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Filiere, Matiere, Ressources, Utilisateur, Etudiant, DocumentStage
from .serializers import (FiliereSerializer, MatiereSerializer, RessourcesSerializer,
UtilisateurSerializer, EtudiantSerializer, DocumentStageSerializer)


class FiliereViewSet(viewsets.ModelViewSet):
    # Récupère toutes les filières de la BDD
    queryset = Filiere.objects.all()
    # Utilise FiliereSerializer pour convertir en JSON
    serializer_class = FiliereSerializer
    # ModelViewSet génère automatiquement :
    # GET    /api/filieres/       → liste toutes les filières
    # POST   /api/filieres/       → crée une filière
    # GET    /api/filieres/{id}/  → détail d'une filière
    # PUT    /api/filieres/{id}/  → modifie une filière
    # DELETE /api/filieres/{id}/  → supprime une filière


class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    # @action crée un endpoint supplémentaire en dehors du CRUD classique
    # detail=True → l'endpoint a besoin d'un {id} dans l'URL
    # methods=['get'] → uniquement accessible en GET
    @action(detail=True, methods=['get'])
    def ressources(self, request, pk=None):
        # pk = l'id de la matière dans l'URL
        # ex: /api/matieres/3/ressources/ → pk=3
        matiere = self.get_object()  # récupère la matière avec cet id

        # Filtre les ressources qui appartiennent à cette matière
        ressources = Ressources.objects.filter(matiere=matiere)

        # many=True → on sérialise une liste et pas un seul objet
        serializer = RessourcesSerializer(ressources, many=True)

        # Renvoie la liste en JSON à Flutter
        return Response(serializer.data)


class RessourcesViewSet(viewsets.ModelViewSet):
    queryset = Ressources.objects.all()
    serializer_class = RessourcesSerializer

    # On surcharge get_queryset pour ajouter des filtres dynamiques
    def get_queryset(self):
        # Par défaut on prend toutes les ressources
        queryset = Ressources.objects.all()

        # Flutter peut envoyer ?matiere=1 dans l'URL
        matiere_id = self.request.query_params.get('matiere')

        # Flutter peut envoyer ?type=cours dans l'URL
        type_res = self.request.query_params.get('type')

        # Si Flutter a envoyé un id de matière → on filtre
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)

        # Si Flutter a envoyé un type → on filtre
        if type_res:
            queryset = queryset.filter(type_ressources=type_res)

        # Renvoie le queryset filtré (ou tout si pas de filtre)
        return queryset


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer
    # CRUD classique sur les utilisateurs
    # mot_de_passe exclu automatiquement par le serializer


class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    # Endpoint custom pour récupérer les documents d'un étudiant
    # URL : /api/etudiants/{id}/documents/
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        # Récupère l'étudiant avec l'id dans l'URL
        etudiant = self.get_object()

        # Récupère tous ses documents de stage
        docs = DocumentStage.objects.filter(etudiant=etudiant)

        # Sérialise la liste
        serializer = DocumentStageSerializer(docs, many=True)

        # Renvoie en JSON à Flutter
        return Response(serializer.data)


class DocumentStageViewSet(viewsets.ModelViewSet):
    queryset = DocumentStage.objects.all()
    serializer_class = DocumentStageSerializer

    def get_queryset(self):
        queryset = DocumentStage.objects.all()

        # Flutter envoie ?officiel=true ou ?officiel=false
        officiel = self.request.query_params.get('officiel')

        if officiel is not None:
            # Filtre selon si c'est un modèle officiel ou non
            queryset = queryset.filter(est_modele_officiel=officiel)

        return queryset