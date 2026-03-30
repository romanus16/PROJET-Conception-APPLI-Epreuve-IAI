from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Filiere, Matiere, Ressources, Utilisateur, Etudiant, DocumentStage
from .serializers import (FiliereSerializer, MatiereSerializer, RessourcesSerializer,
                          UtilisateurSerializer, EtudiantSerializer, DocumentStageSerializer)

class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer

class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    @action(detail=True, methods=['get'])
    def ressources(self, request, pk=None):
        matiere = self.get_object()
        ressources = Ressources.objects.filter(matiere=matiere)
        serializer = RessourcesSerializer(ressources, many=True)
        return Response(serializer.data)

class RessourcesViewSet(viewsets.ModelViewSet):
    queryset = Ressources.objects.all()
    serializer_class = RessourcesSerializer

    def get_queryset(self):
        queryset = Ressources.objects.all()
        matiere_id = self.request.query_params.get('matiere')
        type_res = self.request.query_params.get('type')
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)
        if type_res:
            queryset = queryset.filter(type_ressources=type_res)
        return queryset

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        etudiant = self.get_object()
        docs = DocumentStage.objects.filter(etudiant=etudiant)
        serializer = DocumentStageSerializer(docs, many=True)
        return Response(serializer.data)

class DocumentStageViewSet(viewsets.ModelViewSet):
    queryset = DocumentStage.objects.all()
    serializer_class = DocumentStageSerializer

    def get_queryset(self):
        queryset = DocumentStage.objects.all()
        officiel = self.request.query_params.get('officiel')
        if officiel is not None:
            queryset = queryset.filter(est_modele_officiel=officiel)
        return queryset
